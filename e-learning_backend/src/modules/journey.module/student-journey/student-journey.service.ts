import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Journey } from '../journey/journey.model';
import { JourneyCapsule } from '../journey-capsule/journey-capsule.model';
import { JourneyModule } from '../journey-module/journey-module.model';
import { PurchasedJourney } from '../purchased-journey/purchased-journey.model';
import { StudentCapsuleTracker } from '../student-capsule-tracker/student-capsule-tracker.model';
import { StudentModuleTracker } from '../student-module-tracker/student-module-tracker.model';
import { TStudentModuleTrackerStatus } from '../student-module-tracker/student-module-tracker.constant';
import { MariiReport } from '../../individualCapsule.module/marii-report/marii-report.model';

export class StudentJourneyService {
  async checkFreeGiftAvailability(studentId: string) {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const existingClaim = await PurchasedJourney.findOne({
      studentId: studentObjectId,
      journeyType: 'free',
      isDeleted: false,
    }).populate({
      path: 'journeyId',
      select: 'title',
    });

    if (existingClaim) {
      return {
        hasClaimedFreeGift: true,
        claimedJourney: existingClaim.journeyId,
        message: 'You have already claimed a free journey',
        isAvailable: false,
      };
    }

    const freeJourney = await Journey.findOne({
      journeyType: 'free',
      isActive: true,
      isDeleted: false,
    }).lean();

    if (!freeJourney) {
      return {
        hasClaimedFreeGift: false,
        claimedJourney: null,
        message: 'At this moment there is no free journey',
        isAvailable: false,
      };
    }

    return {
      hasClaimedFreeGift: false,
      claimedJourney: null,
      freeJourney: {
        _id: freeJourney._id,
        title: freeJourney.title,
        description: freeJourney.description,
        thumbnail: freeJourney.thumbnail,
        price: freeJourney.price,
      },
      message: 'Free journey is available to claim',
      isAvailable: true,
    };
  }

  async claimFreeGift(studentId: string) {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const existingClaim = await PurchasedJourney.findOne({
      studentId: studentObjectId,
      journeyType: 'free',
      isDeleted: false,
    });

    if (existingClaim) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You have already claimed a free journey',
      );
    }

    const freeJourney = await Journey.findOne({
      journeyType: 'free',
      isActive: true,
      isDeleted: false,
    });

    if (!freeJourney) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'At this moment there is no free journey',
      );
    }

    const purchasedJourney = await PurchasedJourney.create({
      journeyId: freeJourney._id,
      studentId: studentObjectId,
      price: 0,
      paymentStatus: 'completed' as any,
      journeyType: 'free',
    });

    return {
      purchasedJourney,
      journey: {
        _id: freeJourney._id,
        title: freeJourney.title,
        description: freeJourney.description,
        thumbnail: freeJourney.thumbnail,
      },
      message: 'Free journey claimed successfully',
    };
  }

  async getAllPurchasedJourneys(studentId: string) {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const purchases = await PurchasedJourney.find({
      studentId: studentObjectId,
      paymentStatus: 'completed',
      isDeleted: false,
    })
      .populate({
        path: 'journeyId',
        select: 'title description thumbnail estimatedTime',
      })
      .select('-paymentTransactionId')
      .lean();

    return {
      journeys: purchases,
      totalPurchased: purchases.length,
    };
  }

  async getCapsulesWithModuleCount(journeyId: string, studentId: string) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const journey = await Journey.findOne({
      _id: journeyObjectId,
      isDeleted: false,
    })
      .select('title description thumbnail price roadMapBrief estimatedTime')
      .lean();

    if (!journey) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Journey not found');
    }

    const purchase = await PurchasedJourney.findOne({
      journeyId: journeyObjectId,
      studentId: studentObjectId,
      paymentStatus: 'completed',
      isDeleted: false,
    }).lean();

    const isPurchased = Boolean(purchase);

    const capsules = await JourneyCapsule.find({
      journeyId: journeyObjectId,
      isDeleted: false,
    })
      .select(
        'title capsuleNumber totalModule estimatedTime thumbnail roadMapBrief description individualCapsuleId',
      )
      .sort({ capsuleNumber: 1 })
      .lean();

    const individualCapsuleIds = capsules
      .map((c) => c.individualCapsuleId)
      .filter(Boolean) as mongoose.Types.ObjectId[];

    const completedReports = individualCapsuleIds.length
      ? await MariiReport.find({
          studentId: studentObjectId,
          capsuleId: { $in: individualCapsuleIds },
          isDeleted: false,
        })
          .select('capsuleId')
          .lean()
      : [];

    const completedIndividualIds = new Set(
      completedReports.map((report) => report.capsuleId.toString()),
    );

    const capsulesWithProgress = capsules.map((capsule, index) => {
      const individualId = capsule.individualCapsuleId?.toString() || null;
      const previousCapsule = index > 0 ? capsules[index - 1] : null;
      const previousIndividualId = previousCapsule?.individualCapsuleId?.toString() || null;

      const isCompleted = individualId
        ? completedIndividualIds.has(individualId)
        : false;

      let isLocked = false;
      if (!isPurchased) {
        isLocked = index !== 0;
      } else if (index === 0) {
        isLocked = false;
      } else if (previousIndividualId) {
        isLocked = !completedIndividualIds.has(previousIndividualId);
      } else {
        isLocked = false;
      }

      return {
        ...capsule,
        individualCapsuleId: individualId,
        hasSixPartContent: Boolean(individualId),
        isLocked,
        isCompleted,
      };
    });

    const totalCapsules = capsules.length;
    const totalModules = capsules.reduce(
      (sum, c) => sum + (c.totalModule || 0),
      0,
    );

    const allExplorationComplete =
      isPurchased &&
      capsulesWithProgress.length > 0 &&
      capsulesWithProgress.every(
        (capsule) => capsule.isCompleted && capsule.hasSixPartContent,
      );

    if (
      allExplorationComplete &&
      purchase &&
      purchase.overallStatus !== 'completed'
    ) {
      await PurchasedJourney.updateOne(
        { _id: purchase._id, overallStatus: { $ne: 'completed' } },
        {
          $set: {
            overallStatus: 'completed',
            completionDate: purchase.completionDate || new Date(),
            progressPercentage: 100,
            completedCapsules: capsulesWithProgress.length,
            totalCapsules,
          },
        },
      );
    }

    return {
      journey,
      capsules: capsulesWithProgress,
      totalCapsules,
      totalModules,
      isPurchased,
      isCompleted: allExplorationComplete,
    };
  }

  async getModulesWithDuration(
    journeyId: string,
    capsuleId: string,
    studentId: string,
  ) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // const purchase = await PurchasedJourney.findOne({
    //   journeyId: journeyObjectId,
    //   studentId: studentObjectId,
    //   paymentStatus: 'completed',
    //   isDeleted: false,
    // });

    // if (!purchase) {
    //   throw new ApiError(
    //     StatusCodes.FORBIDDEN,
    //     'You need to purchase this journey first',
    //   );
    // }

    const capsule = await JourneyCapsule.findById(capsuleObjectId).lean();
    if (!capsule) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
    }

    const modules = await JourneyModule.find({
      capsuleId: capsuleObjectId,
      isDeleted: false,
    })
      .select('title sl orderNumber moduleVideo roadMapBrief estimatedTime')
      .sort({ orderNumber: 1 })
      .lean();

    const moduleTrackers = await StudentModuleTracker.find({
      studentId: studentObjectId,
      capsuleId: capsuleObjectId,
      isDeleted: false,
    }).lean();

    const trackerMap = new Map(
      moduleTrackers.map(t => [t.moduleId.toString(), t]),
    );

    const modulesWithStatus = modules.map(mod => ({
      ...mod,
      status:
        trackerMap.get(mod._id.toString())?.status ||
        TStudentModuleTrackerStatus.locked,
      videoUrl: mod.moduleVideo?.url || null,
    }));

    const totalDuration = modules.reduce((sum, m) => {
      return sum + (m.moduleVideo?.duration || 0);
    }, 0);

    return {
      capsule: {
        _id: capsule._id,
        title: capsule.title,
        capsuleNumber: capsule.capsuleNumber,
      },
      modules: modulesWithStatus,
      totalDuration,
      isPurchased: true,
    };
  }

  async getModuleVideo(
    journeyId: string,
    capsuleId: string,
    moduleId: string,
    studentId: string,
  ) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);
    const moduleObjectId = new mongoose.Types.ObjectId(moduleId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // const purchase = await PurchasedJourney.findOne({
    //   journeyId: journeyObjectId,
    //   studentId: studentObjectId,
    //   paymentStatus: 'completed',
    //   isDeleted: false,
    // });

    // if (!purchase) {
    //   throw new ApiError(
    //     StatusCodes.FORBIDDEN,
    //     'You need to purchase this journey first',
    //   );
    // }

    const module = await JourneyModule.findOne({
      _id: moduleObjectId,
      capsuleId: capsuleObjectId,
      isDeleted: false,
    }).lean();

    if (!module) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Module not found');
    }

    if (!module.moduleVideo?.url) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Video not available for this module',
      );
    }

    const lessonTrackers = await StudentModuleTracker.findOne({
      moduleId: moduleObjectId,
      studentId: studentObjectId,
      isDeleted: false,
    }).lean();

    const currentStatus =
      lessonTrackers?.status || TStudentModuleTrackerStatus.locked;

    return {
      moduleId: module._id,
      title: module.title,
      videoUrl: module.moduleVideo.url,
      videoDuration: module.moduleVideo.duration,
      videoStatus: module.moduleVideo.status,
      currentStatus,
      estimatedTime: module.estimatedTime,
    };
  }

  async getResumeInfo(journeyId: string, capsuleId: string, studentId: string) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // const purchase = await PurchasedJourney.findOne({
    //   journeyId: journeyObjectId,
    //   studentId: studentObjectId,
    //   paymentStatus: 'completed',
    //   isDeleted: false,
    // });

    // if (!purchase) {
    //   throw new ApiError(
    //     StatusCodes.FORBIDDEN,
    //     'You need to purchase this journey first',
    //   );
    // }

    const capsule = await JourneyCapsule.findById(capsuleObjectId).lean();
    if (!capsule) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
    }

    const allModules = await JourneyModule.find({
      capsuleId: capsuleObjectId,
      isDeleted: false,
    })
      .select('title orderNumber moduleVideo')
      .sort({ orderNumber: 1 })
      .lean();

    const moduleTrackers = await StudentModuleTracker.find({
      studentId: studentObjectId,
      capsuleId: capsuleObjectId,
      isDeleted: false,
    }).lean();

    const trackerMap = new Map(
      moduleTrackers.map(t => [t.moduleId.toString(), t]),
    );

    let lastCompletedModule = null;
    let nextModule = null;
    let currentModule = null;

    for (const mod of allModules) {
      const tracker = trackerMap.get(mod._id.toString());
      const status = tracker?.status || TStudentModuleTrackerStatus.locked;

      if (status === TStudentModuleTrackerStatus.completed) {
        lastCompletedModule = {
          moduleId: mod._id,
          title: mod.title,
          status: status,
        };
      } else if (
        status === TStudentModuleTrackerStatus.inProgress ||
        status === TStudentModuleTrackerStatus.unlocked
      ) {
        if (!currentModule) {
          currentModule = {
            moduleId: mod._id,
            title: mod.title,
            videoUrl: mod.moduleVideo?.url || null,
            status: status,
          };
        }
        if (!nextModule && status === TStudentModuleTrackerStatus.unlocked) {
          nextModule = {
            moduleId: mod._id,
            title: mod.title,
          };
        }
      }
    }

    const completedCount = moduleTrackers.filter(
      t => t.status === TStudentModuleTrackerStatus.completed,
    ).length;

    return {
      capsule: {
        _id: capsule._id,
        title: capsule.title,
      },
      completedModules: completedCount,
      totalModules: allModules.length,
      lastCompletedModule,
      currentModule,
      nextModule,
    };
  }

  async markModuleComplete(
    journeyId: string,
    capsuleId: string,
    moduleId: string,
    studentId: string,
  ) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);
    const moduleObjectId = new mongoose.Types.ObjectId(moduleId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // const purchase = await PurchasedJourney.findOne({
    //   journeyId: journeyObjectId,
    //   studentId: studentObjectId,
    //   paymentStatus: 'completed',
    //   isDeleted: false,
    // });

    // if (!purchase) {
    //   throw new ApiError(
    //     StatusCodes.FORBIDDEN,
    //     'You need to purchase this journey first',
    //   );
    // }

    const currentTracker = await StudentModuleTracker.findOne({
      studentId: studentObjectId,
      capsuleId: capsuleObjectId,
      moduleId: moduleObjectId,
      isDeleted: false,
    });

    if (!currentTracker) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Module tracker not found');
    }

    if (currentTracker.status === TStudentModuleTrackerStatus.locked) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Please complete the previous module first',
      );
    }

    await StudentModuleTracker.findByIdAndUpdate(
      currentTracker._id,
      { status: TStudentModuleTrackerStatus.completed },
      { new: true },
    );

    const allModules = await JourneyModule.find({
      capsuleId: capsuleObjectId,
      isDeleted: false,
    })
      .select('title orderNumber moduleVideo')
      .sort({ orderNumber: 1 })
      .lean();

    const currentIndex = allModules.findIndex(
      m => m._id.toString() === moduleId,
    );

    const nextModule =
      currentIndex < allModules.length - 1
        ? allModules[currentIndex + 1]
        : null;

    if (nextModule) {
      const nextTracker = await StudentModuleTracker.findOneAndUpdate(
        {
          studentId: studentObjectId,
          capsuleId: capsuleObjectId,
          moduleId: nextModule._id,
        },
        { status: TStudentModuleTrackerStatus.unlocked },
        { new: true, upsert: true },
      );
    }

    await this.updateCapsuleCompletion(capsuleObjectId, studentObjectId);

    return {
      completed: true,
      currentModuleId: moduleId,
      nextModule: nextModule
        ? {
            moduleId: nextModule._id,
            title: nextModule.title,
            videoUrl: nextModule.moduleVideo?.url || null,
          }
        : null,
    };
  }

  private async updateCapsuleCompletion(
    capsuleId: mongoose.Types.ObjectId,
    studentId: mongoose.Types.ObjectId,
  ) {
    const allModules = await JourneyModule.find({
      capsuleId,
      isDeleted: false,
    }).lean();

    const completedTrackers = await StudentModuleTracker.find({
      studentId,
      capsuleId,
      status: TStudentModuleTrackerStatus.completed,
      isDeleted: false,
    }).lean();

    const isCapsuleComplete = completedTrackers.length === allModules.length;

    if (isCapsuleComplete) {
      await StudentCapsuleTracker.findOneAndUpdate(
        { studentId, capsuleId },
        { inspirationStatus: 'completed' as any },
        { new: true },
      );
    }
  }
}
