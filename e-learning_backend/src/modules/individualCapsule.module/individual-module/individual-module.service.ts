import { IndividualModule } from './individual-module.model';
import { IIndividualModule } from './individual-module.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { IndividualLesson } from '../individual-lesson/individual-lesson.model';
import { IndividualLessonService } from '../individual-lesson/individual-lesson.service';
import { deleteFileFromDisk } from '../../../helpers/fileDeleteHelper';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import {
  enqueueVideoProcessingJob,
  StagedVideoUpload,
  VideoUploadTokenMap,
} from '../../../services/video-processing-queue.service';
import { deleteHlsFolderByUrl } from '../../../services/aws-s3.service';

interface LessonInput {
  _id?: string;
  title: string;
  estimatedTime: string;
  orderNumber: number;
  lessonVideo?: {
    url?: string;
    duration?: number;
    status?: 'processing' | 'ready' | 'failed';
    errorMessage?: string;
  };
}

const lessonService = new IndividualLessonService();

function getUploadToken(target: Record<string, any> | undefined, fieldName: string) {
  const tokens = target?.__videoUploadTokens as VideoUploadTokenMap | undefined;
  return tokens?.[fieldName];
}

export class IndividualModuleService extends GenericService<
  typeof IndividualModule,
  IIndividualModule
> {
  constructor() {
    super(IndividualModule);
  }

  async createWithLessons(
    data: any,
    stagedVideoUploads?: Record<string, StagedVideoUpload>,
  ) {
    try {
      return await this.createModuleWithLessons(data, undefined, stagedVideoUploads);
    } catch (error) {
      throw error;
    }
  }

  async createModuleWithLessons(
    data: any,
    session?: mongoose.ClientSession,
    stagedVideoUploads?: Record<string, StagedVideoUpload>,
  ) {
    const { lessons, ...moduleData } = data;
    const normalizedLessons = Array.isArray(lessons) ? lessons : [];
    moduleData.numberOfLessons = normalizedLessons.length || moduleData.numberOfLessons || 0;

    const createdModule = await IndividualModule.create(
      [moduleData],
      session ? { session } : {}
    );
    const module = createdModule[0];
    if (!module) throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create module');

    if (normalizedLessons.length > 0) {
      for (let j = 0; j < normalizedLessons.length; j++) {
        const lesson = { ...normalizedLessons[j] };
        const lessonVideoToken = getUploadToken(lesson, 'lessonVideo');
        delete lesson.__videoUploadTokens;
        lesson.moduleId = module._id;
        const createdLesson = await IndividualLesson.create([lesson], session ? { session } : {});
        const lessonDoc = createdLesson[0];

        if (lessonDoc && lessonVideoToken && stagedVideoUploads?.[lessonVideoToken]) {
          await enqueueVideoProcessingJob(stagedVideoUploads[lessonVideoToken], {
            targetModel: 'IndividualLesson',
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

      const result = await IndividualModule.findById(id).select('-__v').lean();

      const moduleLessons = await IndividualLesson.find({
        moduleId: id,
        isDeleted: false,
      })
        .sort({ orderNumber: 1 })
        .select('-__v')
        .lean();

      (result as any).lessons = moduleLessons;

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
    const existingModule = await IndividualModule.findById(id);
    if (!existingModule) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Module Found');
    }

    const { lessons, ...moduleData } = data;
    if (Array.isArray(lessons)) {
      moduleData.numberOfLessons = lessons.length;
    }

    let updateModuleQuery = IndividualModule.findByIdAndUpdate(id, moduleData, {
      new: true,
    }).select('-__v');
    if (session) {
      updateModuleQuery = updateModuleQuery.session(session);
    }
    await updateModuleQuery;

    if (lessons && Array.isArray(lessons)) {
      const incomingLessonIds = lessons
        .filter((l: LessonInput) => l._id)
        .map((l: LessonInput) => new mongoose.Types.ObjectId(l._id));

      let existingLessonsQuery = IndividualLesson.find({
        moduleId: id,
        isDeleted: false,
      });
      if (session) {
        existingLessonsQuery = existingLessonsQuery.session(session);
      }
      const existingLessons = await existingLessonsQuery;

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
          const existingLesson = await IndividualLesson.findById(lesson._id);
          const oldLessonUrl = existingLesson?.lessonVideo?.url;

          let updateLessonQuery = IndividualLesson.findByIdAndUpdate(lesson._id, lessonPayload, {
            new: true,
          }).select('-__v');
          if (session) {
            updateLessonQuery = updateLessonQuery.session(session);
          }
          await updateLessonQuery;

          if (lessonVideoToken && stagedVideoUploads?.[lessonVideoToken]) {
            if (oldLessonUrl) {
              await deleteHlsFolderByUrl(oldLessonUrl);
            }
            await enqueueVideoProcessingJob(stagedVideoUploads[lessonVideoToken], {
              targetModel: 'IndividualLesson',
              targetId: lesson._id,
              fieldPath: 'lessonVideo',
            });
          }
        } else {
          lessonPayload.moduleId = new mongoose.Types.ObjectId(id);
          const createdLesson = await IndividualLesson.create(
            [lessonPayload],
            session ? { session } : {},
          );
          const lessonDoc = createdLesson[0];

          if (lessonDoc && lessonVideoToken && stagedVideoUploads?.[lessonVideoToken]) {
            await enqueueVideoProcessingJob(stagedVideoUploads[lessonVideoToken], {
              targetModel: 'IndividualLesson',
              targetId: lessonDoc._id.toString(),
              fieldPath: 'lessonVideo',
            });
          }
        }
      }
    }
  }

  async deleteModuleWithLessons(moduleId: string, session?: mongoose.ClientSession) {
    const lessons = await IndividualLesson.find({ moduleId });

    for (const lesson of lessons) {
      await lessonService.deleteLesson(lesson._id.toString(), session);
    }

    await IndividualLesson.deleteMany({ moduleId }, session ? { session } : {});

    const mod = await IndividualModule.findById(moduleId);
    if (mod?.thumbnail) {
      deleteFileFromDisk(mod.thumbnail);
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

    if (module.thumbnail) {
      deleteFileFromDisk(module.thumbnail);
    }

    const lessons = await IndividualLesson.find({
      moduleId: id,
      isDeleted: false,
    });

    for (const lesson of lessons) {
      if (lesson.lessonVideo?.url) {
        deleteFileFromDisk(lesson.lessonVideo.url);
      }
    }

    await IndividualLesson.updateMany(
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

    if (module.thumbnail) {
      deleteFileFromDisk(module.thumbnail);
    }

    await this.deleteModuleWithLessons(id);

    await IndividualLesson.deleteMany({ moduleId: id });

    return await this.model.findByIdAndDelete(id).select('-__v');
  }
}
