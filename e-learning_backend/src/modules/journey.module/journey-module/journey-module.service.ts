import { JourneyModule } from './journey-module.model';
import { IJourneyModule } from './journey-module.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { JourneyLesson } from '../journey-lesson/journey-lesson.model';
import { JourneyLessonService } from '../journey-lesson/journey-lesson.service';
import { deleteFileFromDisk } from '../../../helpers/fileDeleteHelper';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { Questionary } from '../../question.module/questionary/questionary.model';
import { Question } from '../../question.module/question/question.model';
import { TQuestionaryCategory } from '../../question.module/question.constant';
import { JourneyCapsule } from '../journey-capsule/journey-capsule.model';
import { PurchasedJourney } from '../purchased-journey/purchased-journey.model';
import { StudentModuleTracker } from '../student-module-tracker/student-module-tracker.model';
import { TStudentModuleTrackerStatus } from '../student-module-tracker/student-module-tracker.constant';
import { LessonTracker } from '../lesson-tracker/lesson-tracker.model';
import { TLessonTrackerStatus } from '../lesson-tracker/lesson-tracker.constant';
import { TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import {
  enqueueVideoProcessingJob,
  StagedVideoUpload,
  VideoUploadTokenMap,
} from '../../../services/video-processing-queue.service';
import { deleteHlsFolderByUrl } from '../../../services/aws-s3.service';

interface LessonInput {
  _id?: string;
  sl: number;
  title: string;
  description?: string;
  estimatedTime: string;
  orderNumber?: number;
  durationInSeconds?: number;
  lessonVideo?: {
    url?: string;
    duration?: number;
    status?: 'processing' | 'ready' | 'failed';
    errorMessage?: string;
  };
}

const lessonService = new JourneyLessonService();

function getUploadToken(target: Record<string, any> | undefined, fieldName: string) {
  const tokens = target?.__videoUploadTokens as VideoUploadTokenMap | undefined;
  return tokens?.[fieldName];
}

export class JourneyModuleService extends GenericService<
  typeof JourneyModule,
  IJourneyModule
> {
  constructor() {
    super(JourneyModule);
  }

  private async getStudentJourneyAccessByModule(moduleId: string, studentId: string) {
    const module = await JourneyModule.findOne({
      _id: new mongoose.Types.ObjectId(moduleId),
      isDeleted: false,
    }).lean();

    if (!module) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Module not found');
    }

    const capsule = await JourneyCapsule.findOne({
      _id: module.capsuleId,
      isDeleted: false,
    }).lean();

    if (!capsule) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
    }

    const purchasedJourney = await PurchasedJourney.findOne({
      journeyId: capsule.journeyId,
      studentId: new mongoose.Types.ObjectId(studentId),
      paymentStatus: TPaymentStatus.completed,
      isDeleted: false,
    }).lean();

    if (!purchasedJourney) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You have not purchased this journey',
      );
    }

    return { module, capsule, purchasedJourney };
  }

  private async ensureStudentModuleTrackers(
    studentId: string,
    capsuleId: mongoose.Types.ObjectId,
  ) {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const [modules, existingTrackers] = await Promise.all([
      JourneyModule.find({
        capsuleId,
        isDeleted: false,
      })
        .sort({ orderNumber: 1, createdAt: 1 })
        .lean(),
      StudentModuleTracker.find({
        studentId: studentObjectId,
        capsuleId,
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
            capsuleId,
            moduleId: module._id,
          },
          update: {
            $set: {
              status,
              isDeleted: false,
            },
            $setOnInsert: {
              studentId: studentObjectId,
              capsuleId,
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

    const trackers = await StudentModuleTracker.find({
      studentId: studentObjectId,
      capsuleId,
      isDeleted: false,
    }).lean();

    return {
      modules,
      trackerMap: new Map(
        trackers.map((tracker: any) => [tracker.moduleId.toString(), tracker]),
      ),
    };
  }

  private async ensureStudentLessonTrackers(
    studentId: string,
    journeyId: mongoose.Types.ObjectId,
    capsuleId: mongoose.Types.ObjectId,
    moduleId: mongoose.Types.ObjectId,
  ) {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const [lessons, existingTrackers] = await Promise.all([
      JourneyLesson.find({
        moduleId,
        isDeleted: false,
      })
        .sort({ orderNumber: 1, createdAt: 1 })
        .lean(),
      LessonTracker.find({
        studentId: studentObjectId,
        journeyId,
        capsuleId,
        moduleId,
        isDeleted: false,
      }).lean(),
    ]);

    const trackerMap = new Map(
      existingTrackers.map((tracker: any) => [tracker.lessonId.toString(), tracker]),
    );

    let shouldUnlockCurrent = true;
    const bulkOperations: any[] = [];

    for (const lesson of lessons) {
      const existingTracker = trackerMap.get(lesson._id.toString());

      let status = TLessonTrackerStatus.locked;
      if (existingTracker?.status === TLessonTrackerStatus.completed) {
        status = TLessonTrackerStatus.completed;
      } else if (shouldUnlockCurrent) {
        status =
          existingTracker?.status === TLessonTrackerStatus.inProgress
            ? TLessonTrackerStatus.inProgress
            : TLessonTrackerStatus.unlocked;
        shouldUnlockCurrent = false;
      }

      bulkOperations.push({
        updateOne: {
          filter: {
            studentId: studentObjectId,
            journeyId,
            capsuleId,
            moduleId,
            lessonId: lesson._id,
          },
          update: {
            $set: {
              status,
              isDeleted: false,
            },
            $setOnInsert: {
              studentId: studentObjectId,
              journeyId,
              capsuleId,
              moduleId,
              lessonId: lesson._id,
              lastWatchTime: 0,
              isCompleted: false,
            },
          },
          upsert: true,
        },
      });
    }

    if (bulkOperations.length > 0) {
      await LessonTracker.bulkWrite(bulkOperations);
    }

    const trackers = await LessonTracker.find({
      studentId: studentObjectId,
      journeyId,
      capsuleId,
      moduleId,
      isDeleted: false,
    }).lean();

    return {
      lessons,
      trackerMap: new Map(
        trackers.map((tracker: any) => [tracker.lessonId.toString(), tracker]),
      ),
    };
  }

  async createWithLessons(
    data: any,
    stagedVideoUploads?: Record<string, StagedVideoUpload>,
  ) {
    try {
      const result = await this.createModuleWithLessons(data, undefined, stagedVideoUploads);

      const moduleResult = await JourneyModule.findById(result._id).select('-__v').lean();

      const moduleLessons = await JourneyLesson.find({
        moduleId: result._id,
        isDeleted: false,
      })
        .sort({ orderNumber: 1 })
        .select('-__v')
        .lean();

      (moduleResult as any).lessons = moduleLessons;

      if (moduleResult?.questionaryId) {
        const moduleQuestions = await Question.find({
          questionaryId: moduleResult.questionaryId,
          isDeleted: false,
        })
          .select('-options.isCorrect -__v')
          .sort({ sl: 1 })
          .lean();

        (moduleResult as any).questions = moduleQuestions;
      }

      return moduleResult;
    } catch (error) {
      throw error;
    }
  }

  async createModuleWithLessons(
    data: any,
    session?: mongoose.ClientSession,
    stagedVideoUploads?: Record<string, StagedVideoUpload>,
  ) {
    const { lessons, question, ...moduleData } = data;
    const moduleVideoToken = getUploadToken(moduleData, 'moduleVideo');
    delete moduleData.__videoUploadTokens;

    let questionaryId: mongoose.Types.ObjectId | undefined;

    if (question) {
      const questionary = await Questionary.create(
        [
          {
            title: question.title,
            brief: question.roadmap_brief,
            category: TQuestionaryCategory.module,
          },
        ],
        session ? { session } : {}
      );
      const createdQuestionary = questionary[0];
      if (!createdQuestionary) throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create questionary');
      questionaryId = createdQuestionary._id as mongoose.Types.ObjectId;
      moduleData.questionaryId = questionaryId;

      if (question.questions && question.questions.length > 0) {
        const questionDocs = question.questions.map((q: any) => ({
          ...q,
          questionaryId,
        }));
        await Question.create(questionDocs, session ? { session } : {});
      }
    }

    const createdModule = await JourneyModule.create([moduleData], session ? { session } : {});
    const module = createdModule[0];
    if (!module) throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create module');

    if (moduleVideoToken && stagedVideoUploads?.[moduleVideoToken]) {
      await enqueueVideoProcessingJob(stagedVideoUploads[moduleVideoToken], {
        targetModel: 'JourneyModule',
        targetId: module._id.toString(),
        fieldPath: 'moduleVideo',
      });
    }

    if (lessons && Array.isArray(lessons)) {
      for (let j = 0; j < lessons.length; j++) {
        const lesson = { ...lessons[j] };
        const lessonVideoToken = getUploadToken(lesson, 'lessonVideo');
        delete lesson.__videoUploadTokens;
        lesson.moduleId = module._id;
        const createdLesson = await JourneyLesson.create([lesson], session ? { session } : {});
        const lessonDoc = createdLesson[0];

        if (lessonDoc && lessonVideoToken && stagedVideoUploads?.[lessonVideoToken]) {
          await enqueueVideoProcessingJob(stagedVideoUploads[lessonVideoToken], {
            targetModel: 'JourneyLesson',
            targetId: lessonDoc._id.toString(),
            fieldPath: 'lessonVideo',
          });
        }
      }
    }

    return module;
  }

  async updateWithLessons(
    id: string,
    data: any,
    stagedVideoUploads?: Record<string, StagedVideoUpload>,
  ) {
    try {
      await this.updateModuleWithLessons(id, data, undefined, stagedVideoUploads);

      const result = await JourneyModule.findById(id).select('-__v').lean();

      const moduleLessons = await JourneyLesson.find({
        moduleId: id,
        isDeleted: false,
      })
        .sort({ orderNumber: 1 })
        .select('-__v')
        .lean();

      (result as any).lessons = moduleLessons;

      if (result?.questionaryId) {
        const moduleQuestions = await Question.find({
          questionaryId: result.questionaryId,
          isDeleted: false,
        })
          .select('-options.isCorrect -__v')
          .sort({ sl: 1 })
          .lean();

        (result as any).questions = moduleQuestions;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateModuleWithLessons(
    id: string,
    data: any,
    session?: mongoose.ClientSession,
    stagedVideoUploads?: Record<string, StagedVideoUpload>,
  ) {
    const existingModule = await JourneyModule.findById(id);
    if (!existingModule) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Module Found');
    }

    const { lessons, question, ...moduleData } = data;
    const moduleVideoToken = getUploadToken(moduleData, 'moduleVideo');
    delete moduleData.__videoUploadTokens;

    if (question) {
      if (existingModule.questionaryId) {
        await Questionary.findByIdAndUpdate(
          existingModule.questionaryId,
          { title: question.title, brief: question.roadmap_brief },
          session ? { session } : {}
        );

        const existingQuestions = await Question.find({
          questionaryId: existingModule.questionaryId,
          isDeleted: false,
        }, session ? { session } : {});

        const incomingQuestionIds = question.questions
          ?.filter((q: any) => q._id)
          .map((q: any) => new mongoose.Types.ObjectId(q._id)) || [];

        const questionsToDelete = existingQuestions.filter(
          (q) => !incomingQuestionIds.some((qId: mongoose.Types.ObjectId) => qId.equals(q._id))
        );

        for (const qToDelete of questionsToDelete) {
          await Question.findByIdAndUpdate(
            qToDelete._id,
            { isDeleted: true },
            session ? { session } : {}
          );
        }

        if (question.questions && question.questions.length > 0) {
          for (const q of question.questions) {
            if (q._id) {
              await Question.findByIdAndUpdate(q._id, q, session ? { session } : {});
            } else {
              await Question.create([{ ...q, questionaryId: existingModule.questionaryId }], session ? { session } : {});
            }
          }
        }
      } else {
        const questionary = await Questionary.create(
          [
            {
              title: question.title,
              brief: question.roadmap_brief,
              category: TQuestionaryCategory.module,
            },
          ],
          session ? { session } : {}
        );
        const createdQuestionary = questionary[0];
        if (!createdQuestionary) throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create questionary');
        const questionaryId = createdQuestionary._id as mongoose.Types.ObjectId;

        await JourneyModule.findByIdAndUpdate(id, { questionaryId }, session ? { session } : {});

        if (question.questions && question.questions.length > 0) {
          const questionDocs = question.questions.map((q: any) => ({
            ...q,
            questionaryId,
          }));
          await Question.create(questionDocs, session ? { session } : {});
        }
      }
    }

    await JourneyModule.findByIdAndUpdate(id, moduleData, {
      new: true,
    })
      .select('-__v');

    if (moduleVideoToken && stagedVideoUploads?.[moduleVideoToken]) {
      const oldUrl = existingModule.moduleVideo?.url;
      if (oldUrl) {
        await deleteHlsFolderByUrl(oldUrl);
      }
      await enqueueVideoProcessingJob(stagedVideoUploads[moduleVideoToken], {
        targetModel: 'JourneyModule',
        targetId: id,
        fieldPath: 'moduleVideo',
      });
    }

    if (lessons && Array.isArray(lessons)) {
      const incomingLessonIds = lessons
        .filter((l: LessonInput) => l._id)
        .map((l: LessonInput) => new mongoose.Types.ObjectId(l._id));

      const existingLessons = await JourneyLesson.find({
        moduleId: id,
        isDeleted: false,
      });

      const lessonsToDelete = existingLessons.filter(
        (l) =>
          !incomingLessonIds.some(
            (lessonId: mongoose.Types.ObjectId) => lessonId.equals(l._id)
          )
      );

      for (const lessonToDelete of lessonsToDelete) {
        await lessonService.deleteLesson(lessonToDelete._id.toString(), session);
      }

      for (const lesson of lessons) {
        const lessonPayload = { ...lesson };
        const lessonVideoToken = getUploadToken(lessonPayload, 'lessonVideo');
        delete lessonPayload.__videoUploadTokens;

        if (lesson._id) {
          const existingLesson = await JourneyLesson.findById(lesson._id);
          const oldLessonUrl = existingLesson?.lessonVideo?.url;

          await JourneyLesson.findByIdAndUpdate(lesson._id, lessonPayload, {
            new: true,
          })
            .select('-__v');

          if (lessonVideoToken && stagedVideoUploads?.[lessonVideoToken]) {
            if (oldLessonUrl) {
              await deleteHlsFolderByUrl(oldLessonUrl);
            }
            await enqueueVideoProcessingJob(stagedVideoUploads[lessonVideoToken], {
              targetModel: 'JourneyLesson',
              targetId: lesson._id,
              fieldPath: 'lessonVideo',
            });
          }
        } else {
          lessonPayload.moduleId = new mongoose.Types.ObjectId(id);
          const createdLesson = await JourneyLesson.create(
            [lessonPayload],
            session ? { session } : {},
          );
          const lessonDoc = createdLesson[0];

          if (lessonDoc && lessonVideoToken && stagedVideoUploads?.[lessonVideoToken]) {
            await enqueueVideoProcessingJob(stagedVideoUploads[lessonVideoToken], {
              targetModel: 'JourneyLesson',
              targetId: lessonDoc._id.toString(),
              fieldPath: 'lessonVideo',
            });
          }
        }
      }
    }
  }

  async getStudentModuleDetails(moduleId: string, studentId: string) {
    const { module, capsule } = await this.getStudentJourneyAccessByModule(
      moduleId,
      studentId,
    );

    const { trackerMap } = await this.ensureStudentModuleTrackers(
      studentId,
      capsule._id,
    );
    const moduleTracker = trackerMap.get(module._id.toString());
    const moduleStatus = moduleTracker?.status || TStudentModuleTrackerStatus.locked;

    if (moduleStatus === TStudentModuleTrackerStatus.locked) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Please complete the previous module first',
      );
    }

    const moduleDetails = await JourneyModule.findById(moduleId).select('-__v').lean();
    if (!moduleDetails) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Module not found');
    }

    const { lessons, trackerMap: lessonTrackerMap } =
      await this.ensureStudentLessonTrackers(
        studentId,
        capsule.journeyId,
        capsule._id,
        module._id as mongoose.Types.ObjectId,
      );

    (moduleDetails as any).access = {
      status: moduleStatus,
      isLocked: false,
    };
    (moduleDetails as any).lessons = lessons.map(lesson => {
      const tracker = lessonTrackerMap.get(lesson._id.toString());
      const status = tracker?.status || TLessonTrackerStatus.locked;

      return {
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        estimatedTime: lesson.estimatedTime,
        orderNumber: lesson.orderNumber,
        durationInSeconds: lesson.durationInSeconds,
        status,
        isLocked: status === TLessonTrackerStatus.locked,
        isCompleted: tracker?.isCompleted || false,
        lastWatchTime: tracker?.lastWatchTime || 0,
      };
    });

    if (moduleDetails?.questionaryId) {
      const moduleQuestions = await Question.find({
        questionaryId: moduleDetails.questionaryId,
        isDeleted: false,
      })
        .select('-options.isCorrect -__v')
        .sort({ sl: 1 })
        .lean();

      (moduleDetails as any).questions = moduleQuestions;
    }

    return moduleDetails;
  }

  async getStudentLessonDetails(lessonId: string, studentId: string) {
    const lesson = await JourneyLesson.findOne({
      _id: new mongoose.Types.ObjectId(lessonId),
      isDeleted: false,
    }).lean();

    if (!lesson) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found');
    }

    const { module, capsule } = await this.getStudentJourneyAccessByModule(
      lesson.moduleId.toString(),
      studentId,
    );

    const { trackerMap } = await this.ensureStudentModuleTrackers(
      studentId,
      capsule._id,
    );
    const moduleTracker = trackerMap.get(module._id.toString());
    const moduleStatus = moduleTracker?.status || TStudentModuleTrackerStatus.locked;

    if (moduleStatus === TStudentModuleTrackerStatus.locked) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Please complete the previous module first',
      );
    }

    const { trackerMap: lessonTrackerMap } = await this.ensureStudentLessonTrackers(
      studentId,
      capsule.journeyId,
      capsule._id,
      module._id as mongoose.Types.ObjectId,
    );
    const lessonTracker = lessonTrackerMap.get(lesson._id.toString());
    const lessonStatus = lessonTracker?.status || TLessonTrackerStatus.locked;

    if (lessonStatus === TLessonTrackerStatus.locked) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Please complete the previous lesson first',
      );
    }

    return {
      ...lesson,
      access: {
        status: lessonStatus,
        isLocked: false,
      },
      isCompleted: lessonTracker?.isCompleted || false,
      lastWatchTime: lessonTracker?.lastWatchTime || 0,
      module: {
        _id: module._id,
        title: module.title,
        orderNumber: module.orderNumber,
      },
      capsule: {
        _id: capsule._id,
        title: capsule.title,
        journeyId: capsule.journeyId,
      },
    };
  }

  async deleteModuleWithLessons(moduleId: string, session?: mongoose.ClientSession) {
    const lessons = await JourneyLesson.find({ moduleId });

    for (const lesson of lessons) {
      await lessonService.deleteLesson(lesson._id.toString(), session);
    }

    await JourneyLesson.deleteMany({ moduleId }, session ? { session } : {});

    const mod = await JourneyModule.findById(moduleId);
    if (mod?.moduleVideo?.url) {
      deleteFileFromDisk(mod.moduleVideo.url);
    }

    if (mod?.questionaryId) {
      await Question.updateMany({ questionaryId: mod.questionaryId }, { isDeleted: true }, session ? { session } : {});
      await Questionary.findByIdAndUpdate(mod.questionaryId, { isDeleted: true }, session ? { session } : {});
    }
  }

  async softDeleteById(id: string) {
    const module = await this.model.findById(id).select('-__v');
    if (!module) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Module Found');
    }
    if (module.isDeleted === true) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Module already deleted');
    }

    if (module.moduleVideo?.url) {
      deleteFileFromDisk(module.moduleVideo.url);
    }

    const lessons = await JourneyLesson.find({
      moduleId: id,
      isDeleted: false,
    });

    for (const lesson of lessons) {
      if (lesson.lessonVideo?.url) {
        deleteFileFromDisk(lesson.lessonVideo.url);
      }
    }

    await JourneyLesson.updateMany(
      { moduleId: id },
      { $set: { isDeleted: true } }
    );

    return await this.model
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .select('-__v');
  }

  async deleteById(id: string) {
    const module = await this.model.findById(id).select('-__v');
    if (!module) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Module Found');
    }

    if (module.moduleVideo?.url) {
      deleteFileFromDisk(module.moduleVideo.url);
    }

    await this.deleteModuleWithLessons(id);

    await JourneyLesson.deleteMany({ moduleId: id });

    return await this.model.findByIdAndDelete(id).select('-__v');
  }
}
