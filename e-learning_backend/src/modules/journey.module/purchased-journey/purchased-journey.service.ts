import { StatusCodes } from 'http-status-codes';
import { PurchasedJourney } from './purchased-journey.model';
import { IPurchasedJourney } from './purchased-journey.interface';
import { GenericService } from '../../_generic-module/generic.services';
import ApiError from '../../../errors/ApiError';
import { JourneyCapsule } from '../journey-capsule/journey-capsule.model';
import { StudentCapsuleTracker } from '../student-capsule-tracker/student-capsule-tracker.model';
import { StudentModuleTracker } from '../student-module-tracker/student-module-tracker.model';
import { LessonTracker } from '../lesson-tracker/lesson-tracker.model';
import { JourneyLesson } from '../journey-lesson/journey-lesson.model';
import { JourneyModule } from '../journey-module/journey-module.model';
import mongoose from 'mongoose';

export class PurchasedJourneyService extends GenericService<
  typeof PurchasedJourney,
  IPurchasedJourney
> {
  constructor() {
    super(PurchasedJourney);
  }

  /**
   * Get overall journey progress for a student.
   * Calculates completed capsules, modules, lessons and overall progress percentage.
   */
  async getJourneyProgress(journeyId: string, studentId: string) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // 1. Fetch the purchased journey
    const purchased = await PurchasedJourney.findOne({
      journeyId: journeyObjectId,
      studentId: studentObjectId,
    });

    if (!purchased) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Purchased journey not found for this student',
      );
    }

    // 2. Fetch all capsules in this journey
    const capsules = await JourneyCapsule.find({ journeyId: journeyObjectId, isDeleted: false });
    const capsuleIds = capsules.map(c => c._id);
    const totalJourneyCapsules = capsules.length;

    // 3. Status logic - find all trackers for this student & journey
    // JourneyCapsule trackers
    const capsuleTrackers = await StudentCapsuleTracker.find({
      studentId: studentObjectId,
      capsuleId: { $in: capsuleIds },
      isDeleted: false,
    });
    const completedJourneyCapsules = capsuleTrackers.filter(
      t => t.overallStatus === 'completed'
    ).length;

    // JourneyModule trackers
    const totalJourneyModules = capsules.reduce((sum, cap) => sum + (cap.totalModule || 0), 0);
    const moduleTrackers = await StudentModuleTracker.find({
      studentId: studentObjectId,
      capsuleId: { $in: capsuleIds },
      isDeleted: false,
    });
    const completedJourneyModules = moduleTrackers.filter(
      (t: any) => t.status === 'completed'
    ).length;

    // Fetch all modules of this journey to get their IDs
    const modules = await JourneyModule.find({ capsuleId: { $in: capsuleIds }, isDeleted: false });
    const moduleIds = modules.map(m => m._id);

    // JourneyLessons logic
    const totalIndividualLessons = await JourneyLesson.countDocuments({
      moduleId: { $in: moduleIds },
      isDeleted: false,
    });
    const lessonTrackers = await LessonTracker.find({
      studentId: studentObjectId,
      moduleId: { $in: moduleIds },
      isDeleted: false,
    });
    const completedIndividualLessons = lessonTrackers.filter(
      (t: any) => t.isCompleted === true
    ).length;

    // Calculate progression percentage based on capsules
    const progressPercentage = totalJourneyCapsules > 0 
      ? Math.round((completedJourneyCapsules / totalJourneyCapsules) * 100) 
      : 0;

    let overallStatus = 'notStarted';
    if (completedJourneyCapsules > 0 && completedJourneyCapsules < totalJourneyCapsules) {
      overallStatus = 'inProgress';
    } else if (completedJourneyCapsules === totalJourneyCapsules && totalJourneyCapsules > 0) {
      overallStatus = 'completed';
    }

    // Update the record in db
    await PurchasedJourney.findByIdAndUpdate(
      purchased._id,
      {
        $set: {
          completedCapsules: completedJourneyCapsules,
          totalCapsules: totalJourneyCapsules,
          completedModules: completedJourneyModules,
          totalModules: totalJourneyModules,
          completedLessons: completedIndividualLessons,
          totalLessons: totalIndividualLessons,
          progressPercentage,
          overallStatus,
          ...(overallStatus === 'completed' && !purchased.completionDate
            ? { completionDate: new Date() }
            : {}),
        },
      }
    );

    return {
      progressPercentage,
      completedJourneyCapsules,
      totalJourneyCapsules,
      completedJourneyModules,
      totalJourneyModules,
      completedIndividualLessons,
      totalIndividualLessons,
      overallStatus,
    };
  }
}
