import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import PaginationService from '../../../common/service/paginationService';
import { PaginateOptions } from '../../../types/paginate';
import { GenericService } from '../../_generic-module/generic.services';
import { Question } from '../../question.module/question/question.model';
import { StudentAnswer } from '../../question.module/studentAnswer/studentAnswer.model';
import { TStudentAnswerStatus } from '../../question.module/question.constant';
import { StudentCapsuleTracker } from './student-capsule-tracker.model';
import { IStudentCapsuleTracker } from './student-capsule-tracker.interface';
import { TCurrentSection, TTrackerStatus } from './student-capsule-tracker.constant';
import { JourneyModule } from '../journey-module/journey-module.model';
import { StudentModuleTracker } from '../student-module-tracker/student-module-tracker.model';
import { IStudentModuleTracker } from '../student-module-tracker/student-module-tracker.interface';
import { TStudentModuleTrackerStatus } from '../student-module-tracker/student-module-tracker.constant';

export class StudentCapsuleTrackerService extends GenericService<
  typeof StudentCapsuleTracker,
  IStudentCapsuleTracker
> {
  constructor() {
    super(StudentCapsuleTracker);
  }

  async ensureJourneyModuleTrackers(capsuleId: string, studentId: string) {
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const [modules, existingTrackers] = await Promise.all([
      JourneyModule.find({
        capsuleId: capsuleObjectId,
        isDeleted: false,
      })
        .sort({ orderNumber: 1, createdAt: 1 })
        .lean(),
      StudentModuleTracker.find({
        capsuleId: capsuleObjectId,
        studentId: studentObjectId,
        isDeleted: false,
      }).lean(),
    ]);

    const trackerMap = new Map(
      existingTrackers.map((tracker: any) => [tracker.moduleId.toString(), tracker]),
    );

    let shouldUnlockCurrent = true;
    const bulkOperations: any[] = [];

    for (const module of modules) {
      const existingTracker = trackerMap.get(module._id.toString());

      let status = TStudentModuleTrackerStatus.locked;
      if (existingTracker?.status === TStudentModuleTrackerStatus.completed) {
        status = TStudentModuleTrackerStatus.completed;
      } else if (shouldUnlockCurrent) {
        status =
          existingTracker?.status === TStudentModuleTrackerStatus.inProgress
            ? TStudentModuleTrackerStatus.inProgress
            : TStudentModuleTrackerStatus.unlocked;
        shouldUnlockCurrent = false;
      }

      bulkOperations.push({
        updateOne: {
          filter: {
            studentId: studentObjectId,
            capsuleId: capsuleObjectId,
            moduleId: module._id,
          },
          update: {
            $set: {
              status,
              isDeleted: false,
            },
            $setOnInsert: {
              studentId: studentObjectId,
              capsuleId: capsuleObjectId,
              moduleId: module._id,
            },
          },
          upsert: true,
        },
      });
    }

    if (bulkOperations.length > 0) {
      await StudentModuleTracker.bulkWrite(bulkOperations);
    }

    return StudentModuleTracker.find({
      capsuleId: capsuleObjectId,
      studentId: studentObjectId,
      isDeleted: false,
    })
      .select('moduleId status capsuleId')
      .populate({
        path: 'moduleId',
        select: 'title roadMapBrief description estimatedTime orderNumber',
      })
      .sort({ createdAt: 1 });
  }

  async updateByIdV2(
    id: string,
    data: Partial<IStudentCapsuleTracker>,
    studentId: string,
  ) {
    const object =
      await StudentCapsuleTracker.findById(id).select('-__v') as IStudentCapsuleTracker | null;
    if (!object) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Object Found');
    }

    const SECTION_KEYS = [
      'introStatus',
      'inspirationStatus',
      'diagnosticsStatus',
      'scienceStatus',
      'aiSummaryStatus',
    ] as const;

    const mergedState = {
      introStatus: data.introStatus ?? object.introStatus,
      inspirationStatus: data.inspirationStatus ?? object.inspirationStatus,
      diagnosticsStatus: data.diagnosticsStatus ?? object.diagnosticsStatus,
      scienceStatus: data.scienceStatus ?? object.scienceStatus,
      aiSummaryStatus: data.aiSummaryStatus ?? object.aiSummaryStatus,
    };

    const completedCount = SECTION_KEYS.filter(
      key => mergedState[key] === TTrackerStatus.completed,
    ).length;

    const progressPercentage = Math.round(
      (completedCount / SECTION_KEYS.length) * 100,
    );

    let overallStatus: TTrackerStatus;
    if (completedCount === SECTION_KEYS.length) {
      overallStatus = TTrackerStatus.completed;
    } else if (
      SECTION_KEYS.every(key => mergedState[key] === TTrackerStatus.notStarted)
    ) {
      overallStatus = TTrackerStatus.notStarted;
    } else {
      overallStatus = TTrackerStatus.inProgress;
    }

    if (
      data.currentSection === TCurrentSection.inspiration &&
      object.currentSection !== TCurrentSection.inspiration
    ) {
      await this.ensureJourneyModuleTrackers(
        object.capsuleId.toString(),
        studentId,
      );
    }

    return this.model
      .findByIdAndUpdate(
        id,
        {
          ...data,
          progressPercentage,
          overallStatus,
        },
        { new: true, runValidators: true },
      )
      .select('-__v');
  }

  async getJourneyModulesWithTrackerInfo(capsuleId: string, studentId: string) {
    const moduleTrackers = await this.ensureJourneyModuleTrackers(
      capsuleId,
      studentId,
    );

    const capsuleTracker = await StudentCapsuleTracker.findOne({
      capsuleId,
      studentId,
      isDeleted: false,
    }).select(
      '-isDeleted -capsuleNumber -__v -createdAt -updatedAt -capsuleId -title -studentId',
    );

    return {
      moduleTrackers,
      capsuleTracker,
    };
  }

  async updateJourneyModuleTracker(
    capsuleId: string,
    studentJourneyModuleTrackerId: string,
    data: Partial<IStudentModuleTracker>,
  ) {
    const existingTracker = await StudentModuleTracker.findOne({
      _id: studentJourneyModuleTrackerId,
      capsuleId,
      isDeleted: false,
    });

    if (!existingTracker) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No JourneyModule Tracker Found');
    }

    if (
      data.status === TStudentModuleTrackerStatus.completed &&
      existingTracker.status === TStudentModuleTrackerStatus.locked
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Please complete the previous module first',
      );
    }

    await StudentModuleTracker.findByIdAndUpdate(
      studentJourneyModuleTrackerId,
      { status: data.status },
      { new: true },
    );

    const moduleTrackers = await this.ensureJourneyModuleTrackers(
      capsuleId,
      existingTracker.studentId.toString(),
    );

    const completedCount = moduleTrackers.filter(
      (tracker: any) => tracker.status === TStudentModuleTrackerStatus.completed,
    ).length;
    const allCompleted =
      moduleTrackers.length > 0 && completedCount === moduleTrackers.length;

    await StudentCapsuleTracker.findOneAndUpdate(
      {
        capsuleId,
        studentId: existingTracker.studentId,
      },
      {
        inspirationStatus: allCompleted
          ? TTrackerStatus.completed
          : TTrackerStatus.inProgress,
      },
    );

    return moduleTrackers.find(
      (tracker: any) => tracker._id.toString() === studentJourneyModuleTrackerId,
    );
  }

  async getQuestionsWithAnswersWithCapsuleTrackerInfo(
    filters: any,
    options: PaginateOptions,
    studentId: string,
    capsuleId: string,
    populateOptions?: any,
    select?: string | string[],
  ) {
    const matchStage: any = {};

    for (const key in filters) {
      const value = filters[key];
      if (value === '' || value === null || value === undefined) continue;

      if (['capsuleId', '_id'].includes(key)) {
        if (key === 'capsuleId' || key === '_id') {
          matchStage[key] = new mongoose.Types.ObjectId(value);
        } else if (Array.isArray(value)) {
          matchStage[key] = { $in: value };
        } else {
          matchStage[key] = value;
        }
      }
    }

    matchStage.capsuleId = new mongoose.Types.ObjectId(capsuleId);

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'studentAnswers',
          let: { questionId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$questionId', '$$questionId'] },
                    {
                      $eq: [
                        '$studentId',
                        new mongoose.Types.ObjectId(studentId),
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'studentAnswers',
        },
      },
      {
        $unwind: {
          path: '$studentAnswers',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          capsuleId: 1,
          questionText: 1,
          questionType: 1,
          options: 1,
          createdAt: 1,
          answer: '$studentAnswers.answer',
          answeredAt: '$studentAnswers.createdAt',
          isAnswered: {
            $cond: {
              if: { $ifNull: ['$studentAnswers._id', false] },
              then: true,
              else: false,
            },
          },
        },
      },
    ];

    return PaginationService.aggregationPaginate(Question, pipeline, options);
  }

  async autoSaveAnswer(
    capsuleId: string,
    answer: string,
    questionId: string,
    studentId: string,
  ) {
    const savedAnswer = await StudentAnswer.findOneAndUpdate(
      {
        studentId: new mongoose.Types.ObjectId(studentId),
        questionId: new mongoose.Types.ObjectId(questionId),
      },
      {
        $set: {
          answer,
          capsuleId,
          status: TStudentAnswerStatus.completed,
          isAnswered: true,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    await this.checkAndUpdateQuestionnaireCompletion(capsuleId, studentId);

    return savedAnswer;
  }

  async checkAndUpdateQuestionnaireCompletion(
    capsuleId: string,
    studentId: string,
  ) {
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const totalQuestions = await Question.countDocuments({
      capsuleId: capsuleObjectId,
      isDeleted: false,
    });

    if (totalQuestions === 0) return;

    const answeredQuestions = await StudentAnswer.countDocuments({
      studentId: studentObjectId,
      capsuleId: capsuleObjectId,
      isDeleted: false,
    });

    const completionPercentage = Math.round(
      (answeredQuestions / totalQuestions) * 100,
    );
    const isComplete = answeredQuestions >= totalQuestions;

    const tracker = await StudentCapsuleTracker.findOne({
      capsuleId: capsuleObjectId,
      studentId: studentObjectId,
      isDeleted: false,
    });

    if (tracker) {
      const updateData: any = {
        progressPercentage: completionPercentage,
      };

      if (isComplete) {
        updateData.diagnosticsStatus = TTrackerStatus.completed;
      }

      await StudentCapsuleTracker.findByIdAndUpdate(
        tracker._id,
        { $set: updateData },
        { new: true },
      );
    }

    return {
      totalQuestions,
      answeredQuestions,
      completionPercentage,
      isComplete,
    };
  }

  async getQuestionnaireCompletionStatus(capsuleId: string, studentId: string) {
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const totalQuestions = await Question.countDocuments({
      capsuleId: capsuleObjectId,
      isDeleted: false,
    });

    const answeredQuestions = await StudentAnswer.countDocuments({
      studentId: studentObjectId,
      capsuleId: capsuleObjectId,
      isDeleted: false,
    });

    const completionPercentage =
      totalQuestions > 0
        ? Math.round((answeredQuestions / totalQuestions) * 100)
        : 0;

    return {
      totalQuestions,
      answeredQuestions,
      completionPercentage,
      isComplete: answeredQuestions >= totalQuestions,
    };
  }

  async getOrGenerateAISummaryWithPurchasedJourneyStatus() {}
}
