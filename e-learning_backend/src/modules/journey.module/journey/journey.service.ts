import { StatusCodes } from 'http-status-codes';
import { Journey } from './journey.model';
import { IJourney } from './journey.interface';
import { GenericService } from '../../_generic-module/generic.services';
import ApiError from '../../../errors/ApiError';
import { PaginateOptions } from '../../../types/paginate';
import PaginationService from '../../../common/service/paginationService';
import { PurchasedJourney } from '../purchased-journey/purchased-journey.model';
import { StudentCapsuleTracker } from '../student-capsule-tracker/student-capsule-tracker.model';
import { IStudentCapsuleTracker } from '../student-capsule-tracker/student-capsule-tracker.interface';
import { JourneyCapsuleService } from '../journey-capsule/journey-capsule.service';
import { TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import { JourneyCapsule } from '../journey-capsule/journey-capsule.model';
import { JourneyModule } from '../journey-module/journey-module.model';
import { JourneyLesson } from '../journey-lesson/journey-lesson.model';
import { StudentModuleTracker } from '../student-module-tracker/student-module-tracker.model';
import { LessonTracker } from '../lesson-tracker/lesson-tracker.model';
import mongoose from 'mongoose';

const capsuleService = new JourneyCapsuleService();

export class JourneyService extends GenericService<typeof Journey, IJourney> {
  constructor() {
    super(Journey);
  }

  async getJourneyDetailsWithJourneyCapsules(options: PaginateOptions) {
    const journeyExist = await Journey.findOne({ isDeleted: false });
    if (!journeyExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Journey not found.');
    }

    const pipeline = [
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'capsules',
          let: { journeyId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$journeyId', '$$journeyId'] },
                isDeleted: false,
              },
            },
            {
              $project: { _id: 1, title: 1, description: 1, capsuleNumber: 1 },
            },
          ],
          as: 'journeyJourneyCapsules',
        },
      },
      {
        $project: { _id: 1, title: 1, brief: 1, price: 1, journeyJourneyCapsules: 1 },
      },
    ];

    const result = await PaginationService.aggregationPaginate(Journey, pipeline, options);
    return result;
  }

  async isPurchasedByStudent(
    userId: string,
    filters: Partial<IJourney>,
    options: PaginateOptions,
    populateOptions?: any,
    select?: string | string[]
  ) {
    const isJourneyExist = await Journey.findOne({ isDeleted: false });
    if (!isJourneyExist) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Journey is not exist');
    }

    const isPurchased = await PurchasedJourney.findOne({
      journeyId: isJourneyExist._id,
      studentId: userId,
      paymentStatus: TPaymentStatus.completed,
    });

    let result;

    if (!isPurchased) {
      const capsuleFilters: Record<string, any> = {
        journeyId: isJourneyExist._id,
      };
      populateOptions = [];
      select = 'capsuleNumber title roadMapBrief';
      result = await capsuleService.getAllWithPagination(
        capsuleFilters,
        options,
        populateOptions,
        select,
      );
    } else {
      const trackerFilters: Record<string, any> = { studentId: userId };
      result = await StudentCapsuleTracker.paginate(trackerFilters, options);
    }

    return {
      result,
      journeyId: isJourneyExist._id,
      isPurchased: !!isPurchased,
    };
  }

  async getJourneyProgress(studentId: string) {
    const journey = await Journey.findOne({ isDeleted: false });
    if (!journey) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Journey not found');
    }

    const purchasedJourney = await PurchasedJourney.findOne({
      journeyId: journey._id,
      studentId: studentId,
      paymentStatus: TPaymentStatus.completed,
      isDeleted: false,
    });

    if (!purchasedJourney) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You have not purchased this journey');
    }

    const capsuleTrackers = await StudentCapsuleTracker.find({
      studentId: studentId,
      isDeleted: false,
    }).populate('capsuleId', 'title capsuleNumber');

    const totalJourneyCapsules = capsuleTrackers.length;
    const completedJourneyCapsules = capsuleTrackers.filter(
      (t: any) => t.overallStatus === 'completed'
    ).length;

    const capsuleIds = capsuleTrackers.map((t: any) => t.capsuleId?._id).filter(Boolean);

    const [
      completedJourneyModules,
      totalJourneyModules,
      completedIndividualLessons,
      totalIndividualLessonsResult,
    ] = await Promise.all([
      StudentModuleTracker.countDocuments({
        capsuleId: { $in: capsuleIds },
        studentId,
        status: 'completed',
        isDeleted: false,
      }),
      JourneyModule.countDocuments({
        capsuleId: { $in: capsuleIds },
        isDeleted: false,
      }),
      LessonTracker.countDocuments({
        capsuleId: { $in: capsuleIds },
        studentId,
        isCompleted: true,
        isDeleted: false,
      }),
      JourneyLesson.aggregate([
        {
          $lookup: {
            from: 'modules',
            localField: 'moduleId',
            foreignField: '_id',
            as: 'module',
          },
        },
        { $unwind: '$module' },
        {
          $match: { 'module.capsuleId': { $in: capsuleIds }, isDeleted: false },
        },
        { $count: 'total' },
      ]),
    ]);

    const totalIndividualLessons = totalIndividualLessonsResult[0]?.total || 0;
    const progressPercentage =
      totalJourneyCapsules > 0 ? Math.round((completedJourneyCapsules / totalJourneyCapsules) * 100) : 0;

    let overallStatus: 'notStarted' | 'inProgress' | 'completed' = 'notStarted';
    if (completedJourneyCapsules === totalJourneyCapsules && totalJourneyCapsules > 0) {
      overallStatus = 'completed';
    } else if (completedJourneyCapsules > 0) {
      overallStatus = 'inProgress';
    }

    await PurchasedJourney.findOneAndUpdate(
      { journeyId: journey._id, studentId, isDeleted: false },
      {
        $set: {
          progressPercentage,
          completedJourneyCapsules,
          totalJourneyCapsules,
          completedJourneyModules,
          totalJourneyModules,
          completedIndividualLessons,
          totalIndividualLessons,
          overallStatus,
          completionDate: overallStatus === 'completed' ? new Date() : null,
        },
      }
    );

    return {
      journey: { _id: journey._id, title: journey.title },
      overall: {
        progressPercentage,
        completedJourneyCapsules,
        totalJourneyCapsules,
        completedJourneyModules,
        totalJourneyModules,
        completedIndividualLessons,
        totalIndividualLessons,
        overallStatus,
      },
      capsules: capsuleTrackers.map((t: any) => ({
        _id: t._id,
        capsuleId: t.capsuleId,
        progressPercentage: t.progressPercentage,
        overallStatus: t.overallStatus,
        introStatus: t.introStatus,
        inspirationStatus: t.inspirationStatus,
        diagnosticsStatus: t.diagnosticsStatus,
        scienceStatus: t.scienceStatus,
        aiSummaryStatus: t.aiSummaryStatus,
      })),
    };
  }
}
