import { StatusCodes } from 'http-status-codes';
import { JourneyProgressTracker } from './journey-progress-tracker.model';
import { IJourneyProgressTracker, IModuleProgress } from './journey-progress-tracker.interface';
import { GenericService } from '../../_generic-module/generic.services';
import ApiError from '../../../errors/ApiError';
import { TCurrentSection, TTrackerStatus } from './journey-progress-tracker.constant';
import { JourneyModule } from '../journey-module/journey-module.model';
import { JourneyCapsule } from '../journey-capsule/journey-capsule.model';
import mongoose from 'mongoose';

export class JourneyProgressTrackerService extends GenericService<
  typeof JourneyProgressTracker,
  IJourneyProgressTracker
> {
  constructor() {
    super(JourneyProgressTracker);
  }

  async initializeTracker(
    studentId: string,
    journeyId: string,
    capsuleId: string,
  ) {
    const existingTracker = await JourneyProgressTracker.findOne({
      studentId,
      journeyId,
      capsuleId,
      isDeleted: false,
    });

    if (existingTracker) {
      return existingTracker;
    }

    const modules = await JourneyModule.find({
      capsuleId,
      isDeleted: false,
    }).select('_id');

    const moduleProgress: IModuleProgress[] = modules.map((mod) => ({
      moduleId: mod._id as mongoose.Types.ObjectId,
      status: TTrackerStatus.notStarted,
    }));

    const newTracker = await JourneyProgressTracker.create({
      studentId,
      journeyId,
      capsuleId,
      currentSection: TCurrentSection.introduction,
      sectionStatuses: {
        introduction: TTrackerStatus.notStarted,
        inspiration: TTrackerStatus.notStarted,
        diagnostics: TTrackerStatus.notStarted,
        science: TTrackerStatus.notStarted,
        aiSummary: TTrackerStatus.notStarted,
      },
      moduleProgress,
      overallProgressPercentage: 0,
      overallStatus: TTrackerStatus.notStarted,
    });

    return newTracker;
  }

  async updateSectionStatus(
    studentId: string,
    capsuleId: string,
    section: TCurrentSection,
    status: TTrackerStatus,
  ) {
    const tracker = await JourneyProgressTracker.findOne({
      studentId,
      capsuleId,
      isDeleted: false,
    });

    if (!tracker) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Tracker not found');
    }

    const sectionStatuses = { ...tracker.sectionStatuses };
    sectionStatuses[section] = status;

    const SECTION_KEYS = [
      'introduction',
      'inspiration',
      'diagnostics',
      'science',
      'aiSummary',
    ] as const;

    const TOTAL_SECTIONS = SECTION_KEYS.length;
    const completedCount = SECTION_KEYS.filter(
      (key) => sectionStatuses[key] === TTrackerStatus.completed,
    ).length;

    const progressPercentage = Math.round(
      (completedCount / TOTAL_SECTIONS) * 100,
    );

    let overallStatus: TTrackerStatus;
    if (completedCount === TOTAL_SECTIONS) {
      overallStatus = TTrackerStatus.completed;
    } else if (
      SECTION_KEYS.every((key) => sectionStatuses[key] === TTrackerStatus.notStarted)
    ) {
      overallStatus = TTrackerStatus.notStarted;
    } else {
      overallStatus = TTrackerStatus.inProgress;
    }

    const updatedTracker = await JourneyProgressTracker.findOneAndUpdate(
      { studentId, capsuleId, isDeleted: false },
      {
        sectionStatuses,
        overallProgressPercentage: progressPercentage,
        overallStatus,
        currentSection: section,
        ...(overallStatus === TTrackerStatus.completed
          ? { completedAt: new Date() }
          : {}),
      },
      { new: true, runValidators: true },
    );

    return updatedTracker;
  }

  async updateModuleProgress(
    studentId: string,
    capsuleId: string,
    moduleId: string,
    status: TTrackerStatus,
    lastWatchTime?: number,
  ) {
    const tracker = await JourneyProgressTracker.findOne({
      studentId,
      capsuleId,
      isDeleted: false,
    });

    if (!tracker) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Tracker not found');
    }

    const moduleProgress = tracker.moduleProgress.map((mod) => {
      if (mod.moduleId.toString() === moduleId) {
        return {
          ...mod,
          status,
          lastWatchTime: lastWatchTime ?? mod.lastWatchTime,
          completedAt: status === TTrackerStatus.completed ? new Date() : mod.completedAt,
        };
      }
      return mod;
    });

    const totalModules = moduleProgress.length;
    const completedModules = moduleProgress.filter(
      (mod) => mod.status === TTrackerStatus.completed,
    ).length;

    const moduleProgressPercentage = totalModules > 0
      ? Math.round((completedModules / totalModules) * 100)
      : 0;

    const sectionWeight = 50;
    const moduleWeight = 50;

    const sectionKeys = ['introduction', 'inspiration', 'diagnostics', 'science', 'aiSummary'] as const;
    const completedSections = sectionKeys.filter(
      (key) => tracker.sectionStatuses[key] === TTrackerStatus.completed,
    ).length;
    const sectionProgressPercentage = Math.round((completedSections / sectionKeys.length) * 100);

    const overallProgressPercentage = Math.round(
      (sectionProgressPercentage * sectionWeight) / 100 +
        (moduleProgressPercentage * moduleWeight) / 100,
    );

    let overallStatus: TTrackerStatus;
    if (overallProgressPercentage === 100) {
      overallStatus = TTrackerStatus.completed;
    } else if (overallProgressPercentage === 0) {
      overallStatus = TTrackerStatus.notStarted;
    } else {
      overallStatus = TTrackerStatus.inProgress;
    }

    const updatedTracker = await JourneyProgressTracker.findOneAndUpdate(
      { studentId, capsuleId, isDeleted: false },
      {
        moduleProgress,
        overallProgressPercentage,
        overallStatus,
        ...(overallStatus === TTrackerStatus.completed
          ? { completedAt: new Date() }
          : {}),
      },
      { new: true, runValidators: true },
    );

    return updatedTracker;
  }

  async updateLastAccessed(
    studentId: string,
    capsuleId: string,
    itemType: 'module' | 'lesson',
    itemId: string,
    lastWatchTime?: number,
  ) {
    const updatedTracker = await JourneyProgressTracker.findOneAndUpdate(
      { studentId, capsuleId, isDeleted: false },
      {
        lastAccessedItem: {
          itemType,
          itemId: new mongoose.Types.ObjectId(itemId),
          lastWatchTime,
          accessedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedTracker) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Tracker not found');
    }

    return updatedTracker;
  }

  async getResumePoint(studentId: string, journeyId: string) {
    const trackers = await JourneyProgressTracker.find({
      studentId,
      journeyId,
      isDeleted: false,
    }).populate([
      {
        path: 'capsuleId',
        select: 'title capsuleNumber',
      },
      {
        path: 'moduleId',
        select: 'title',
      },
    ]);

    let resumeTracker = trackers.find(
      (t) =>
        t.overallStatus === TTrackerStatus.inProgress ||
        t.overallStatus === TTrackerStatus.notStarted,
    );

    if (!resumeTracker) {
      resumeTracker = trackers[0];
    }

    if (!resumeTracker) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No progress found for this journey');
    }

    const capsule = await JourneyCapsule.findById(resumeTracker.capsuleId).populate({
      path: 'introduction.introVideo',
      select: 'attachment',
    });

    let resumeItem = null;

    if (resumeTracker.lastAccessedItem) {
      if (resumeTracker.lastAccessedItem.itemType === 'module') {
        const module = await JourneyModule.findById(resumeTracker.lastAccessedItem.itemId).select(
          'title description estimatedTime moduleVideo',
        ).populate({
          path: 'moduleVideo',
          select: 'attachment',
        });
        resumeItem = {
          type: 'module',
          data: module,
          lastWatchTime: resumeTracker.lastAccessedItem.lastWatchTime,
        };
      }
    }

    return {
      capsule,
      currentSection: resumeTracker.currentSection,
      sectionStatuses: resumeTracker.sectionStatuses,
      resumeItem,
      overallProgressPercentage: resumeTracker.overallProgressPercentage,
    };
  }

  async getProgress(studentId: string, journeyId: string) {
    const trackers = await JourneyProgressTracker.find({
      studentId,
      journeyId,
      isDeleted: false,
    }).populate([
      {
        path: 'capsuleId',
        select: 'title capsuleNumber description estimatedTime thumbnail',
      },
    ]);

    const totalProgress = trackers.reduce(
      (sum, tracker) => sum + tracker.overallProgressPercentage,
      0,
    );

    const overallProgressPercentage = trackers.length > 0
      ? Math.round(totalProgress / trackers.length)
      : 0;

    return {
      trackers,
      overallProgressPercentage,
      totalCapsules: trackers.length,
      completedCapsules: trackers.filter(
        (t) => t.overallStatus === TTrackerStatus.completed,
      ).length,
    };
  }
}
