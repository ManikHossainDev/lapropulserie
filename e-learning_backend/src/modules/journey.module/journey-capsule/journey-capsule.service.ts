import { JourneyCapsule } from './journey-capsule.model';
import { IJourneyCapsule } from './journey-capsule.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { PaginateOptions } from '../../../types/paginate';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { JourneyModule } from '../journey-module/journey-module.model';
import { JourneyLesson } from '../journey-lesson/journey-lesson.model';
import { JourneyModuleService } from '../journey-module/journey-module.service';
import { JourneyLessonService } from '../journey-lesson/journey-lesson.service';
import { deleteFileFromDisk } from '../../../helpers/fileDeleteHelper';
import { StudentCapsuleTracker } from '../student-capsule-tracker/student-capsule-tracker.model';
import { StudentModuleTracker } from '../student-module-tracker/student-module-tracker.model';
import { LessonTracker } from '../lesson-tracker/lesson-tracker.model';
import { IndividualCapsule } from '../../individualCapsule.module/individual-capsule/individual-capsule.model';
import { IndividualCapsuleCategory } from '../../individualCapsule.module/individual-capsule-category/individual-capsule-category.model';
import {
  enqueueVideoProcessingJob,
  StagedVideoUpload,
  VideoUploadTokenMap,
} from '../../../services/video-processing-queue.service';
import { deleteHlsFolderByUrl } from '../../../services/aws-s3.service';

const moduleService = new JourneyModuleService();
const lessonService = new JourneyLessonService();

function getUploadToken(target: Record<string, any> | undefined, fieldName: string) {
  const tokens = target?.__videoUploadTokens as VideoUploadTokenMap | undefined;
  return tokens?.[fieldName];
}

export class JourneyCapsuleService extends GenericService<
  typeof JourneyCapsule,
  IJourneyCapsule
> {
  constructor() {
    super(JourneyCapsule);
  }

  private async buildLinkPayload(
    individualCapsule: any,
    journeyId: mongoose.Types.ObjectId,
    adminId: mongoose.Types.ObjectId,
    capsuleNumber: number,
  ): Promise<Partial<IJourneyCapsule>> {
    let estimatedTime = '—';
    if (individualCapsule.capsuleCategoryId) {
      const category = await IndividualCapsuleCategory.findById(
        individualCapsule.capsuleCategoryId,
      )
        .select('estimatedDuration')
        .lean();
      if (category?.estimatedDuration != null) {
        estimatedTime = `${category.estimatedDuration} min`;
      }
    }

    const introTitle = individualCapsule.introduction?.title;
    const introduction = introTitle
      ? {
          title: introTitle,
          estimatedTime,
          roadMapBrief: individualCapsule.description?.slice(0, 120) || individualCapsule.title,
          description: individualCapsule.introduction?.text || individualCapsule.description || '',
        }
      : undefined;

    return {
      capsuleNumber,
      title: individualCapsule.title,
      roadMapBrief: individualCapsule.description?.slice(0, 120) || individualCapsule.title,
      description: individualCapsule.description || individualCapsule.about || '',
      estimatedTime,
      thumbnail: individualCapsule.thumbnail,
      journeyId,
      individualCapsuleId: individualCapsule._id,
      totalModule: 0,
      adminId,
      introduction,
    };
  }

  async linkIndividualCapsules(
    journeyId: string,
    individualCapsuleIds: string[],
    adminId: string,
  ) {
    if (!individualCapsuleIds?.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'At least one individual capsule ID is required');
    }

    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    const existingLinks = await JourneyCapsule.find({
      journeyId: journeyObjectId,
      isDeleted: false,
      individualCapsuleId: { $exists: true, $ne: null },
    })
      .select('individualCapsuleId')
      .lean();

    const alreadyLinked = new Set(
      existingLinks.map((c) => c.individualCapsuleId?.toString()),
    );

    const uniqueIds = [...new Set(individualCapsuleIds)];
    const toLink = uniqueIds.filter((id) => !alreadyLinked.has(id));

    if (!toLink.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'All selected capsules are already in this journey');
    }

    let nextNumber =
      (await JourneyCapsule.countDocuments({ journeyId: journeyObjectId, isDeleted: false })) + 1;

    const created: IJourneyCapsule[] = [];

    for (const capsuleId of toLink) {
      if (!mongoose.Types.ObjectId.isValid(capsuleId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid capsule ID: ${capsuleId}`);
      }

      const individualCapsule = await IndividualCapsule.findOne({
        _id: capsuleId,
        isDeleted: false,
      }).lean();

      if (!individualCapsule) {
        throw new ApiError(StatusCodes.NOT_FOUND, `Individual capsule not found: ${capsuleId}`);
      }

      const payload = await this.buildLinkPayload(
        individualCapsule,
        journeyObjectId,
        adminObjectId,
        nextNumber,
      );

      const linked = await JourneyCapsule.create(payload);
      created.push(linked);
      nextNumber += 1;
    }

    return created;
  }

  async getAvailableIndividualCapsules(journeyId: string) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);

    const linkedIds = await JourneyCapsule.find({
      journeyId: journeyObjectId,
      isDeleted: false,
      individualCapsuleId: { $exists: true, $ne: null },
    })
      .select('individualCapsuleId')
      .lean();

    const excludeIds = linkedIds
      .map((c) => c.individualCapsuleId)
      .filter(Boolean);

    // Never offer category documents as capsules
    const categoryIds = await IndividualCapsuleCategory.find({ isDeleted: false })
      .select('_id title')
      .lean();
    const categoryIdSet = new Set(categoryIds.map((c) => String(c._id)));
    const categoryTitles = new Set(
      categoryIds.map((c) => (c.title || '').trim().toLowerCase()).filter(Boolean),
    );

    const filter: Record<string, any> = { isDeleted: false };
    if (excludeIds.length) {
      filter._id = { $nin: excludeIds };
    }

    const capsules = await IndividualCapsule.find(filter)
      .select('title description thumbnail level capsuleCategoryId')
      .populate('capsuleCategoryId', 'title estimatedDuration')
      .sort({ title: 1 })
      .lean();

    return capsules
      .filter((capsule) => {
        const id = String(capsule._id);
        const title = (capsule.title || '').trim().toLowerCase();
        // Exclude rows that are actually categories, or titled exactly like a category
        if (categoryIdSet.has(id)) return false;
        if (categoryTitles.has(title) && !capsule.capsuleCategoryId) return false;
        return true;
      })
      .map((capsule) => ({
        ...capsule,
        id: String(capsule._id),
        _id: String(capsule._id),
        capsuleCategoryId: capsule.capsuleCategoryId
          ? {
              ...capsule.capsuleCategoryId,
              id: String((capsule.capsuleCategoryId as any)._id),
              _id: String((capsule.capsuleCategoryId as any)._id),
            }
          : null,
      }));
  }

  async updateCapsuleOrder(
    journeyId: string,
    capsules: { id: string; capsuleNumber: number }[],
  ) {
    if (!capsules?.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Capsule order list is required');
    }

    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    const numbers = capsules.map((c) => c.capsuleNumber);
    const uniqueNumbers = new Set(numbers);

    if (uniqueNumbers.size !== numbers.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Duplicate capsule numbers in order list');
    }

    // No Mongo transaction — local standalone MongoDB rejects them
    // ("Transaction numbers are only allowed on a replica set member").
    // Two-pass updates avoid temporary capsuleNumber collisions.
    const offset = 1000;
    for (const item of capsules) {
      const updated = await JourneyCapsule.findOneAndUpdate(
        {
          _id: item.id,
          journeyId: journeyObjectId,
          isDeleted: false,
        },
        { capsuleNumber: offset + item.capsuleNumber },
        { new: true },
      );

      if (!updated) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Capsule ${item.id} not found in this journey`,
        );
      }
    }

    await Promise.all(
      capsules.map((item) =>
        JourneyCapsule.findOneAndUpdate(
          {
            _id: item.id,
            journeyId: journeyObjectId,
            isDeleted: false,
          },
          { capsuleNumber: item.capsuleNumber },
          { new: true },
        ),
      ),
    );

    return JourneyCapsule.find({
      journeyId: journeyObjectId,
      isDeleted: false,
    })
      .sort({ capsuleNumber: 1 })
      .select('-__v')
      .populate('individualCapsuleId', 'title description thumbnail')
      .lean();
  }

  async getModulesAndQuestionsByCapsuleId(
    filters: any,
    options: PaginateOptions
  ) {
    const matchStage: any = {
      isDeleted: false,
      _id: new mongoose.Types.ObjectId(filters.capsuleId),
    };

    const pipeline: any = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'journeymodules',
          let: { capsuleId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$capsuleId', '$$capsuleId'] },
                isDeleted: false,
              },
            },
            { $sort: { orderNumber: 1 } },
            {
              $lookup: {
                from: 'journeylessons',
                let: { moduleId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$moduleId', '$$moduleId'] },
                      isDeleted: false,
                    },
                  },
                  { $sort: { orderNumber: 1 } },
                ],
                as: 'lessons',
              },
            },
          ],
          as: 'modules',
        },
      },
      {
        $lookup: {
          from: 'questionaries',
          let: { capsuleId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$referenceId', '$$capsuleId'] },
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                brief: 1,
                category: 1,
              },
            },
          ],
          as: 'questionaries',
        },
      },
    ];

    return await JourneyCapsule.aggregate(pipeline);
  }

  async createWithModulesAndLessons(
    data: any,
    stagedVideoUploads?: Record<string, StagedVideoUpload>,
  ) {
    try {
      const { modules, ...capsuleData } = data;
      const normalizedModules = Array.isArray(modules) ? modules : [];
      const introVideoToken = getUploadToken(capsuleData.introduction, 'introVideo');
      if (capsuleData.introduction) {
        delete capsuleData.introduction.__videoUploadTokens;
      }

      capsuleData.capsuleNumber =
        (await JourneyCapsule.countDocuments({
          journeyId: capsuleData.journeyId,
        })) + 1;
      capsuleData.totalModule = normalizedModules.length || capsuleData.totalModule || 0;

      const createdCapsule = await JourneyCapsule.create(capsuleData);
      if (!createdCapsule) throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create capsule');

      if (introVideoToken && stagedVideoUploads?.[introVideoToken]) {
        await enqueueVideoProcessingJob(stagedVideoUploads[introVideoToken], {
          targetModel: 'JourneyCapsule',
          targetId: createdCapsule._id.toString(),
          fieldPath: 'introduction.introVideo',
        });
      }

      if (normalizedModules.length > 0) {
        for (let i = 0; i < normalizedModules.length; i++) {
          const mod = normalizedModules[i];
          mod.capsuleId = createdCapsule._id;
          await moduleService.createModuleWithLessons(mod, undefined, stagedVideoUploads);
        }
      }

      const result = await JourneyCapsule.findById(createdCapsule._id)
        .select('-__v')
        .lean();

      const mods = await JourneyModule.find({
        capsuleId: createdCapsule._id,
        isDeleted: false,
      })
        .sort({ orderNumber: 1 })
        .select('-__v')
        .lean();

      (result as any).modules = mods;

      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateWithModulesAndLessons(
    id: string,
    data: any,
    stagedVideoUploads?: Record<string, StagedVideoUpload>,
  ) {
    try {
      const existingCapsule = await JourneyCapsule.findById(id);
      if (!existingCapsule) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'No Object Found');
      }

      const { modules, ...capsuleUpdateData } = data;
      const introVideoToken = getUploadToken(capsuleUpdateData.introduction, 'introVideo');
      if (Array.isArray(modules)) {
        capsuleUpdateData.totalModule = modules.length;
      }

      if (capsuleUpdateData.introduction && existingCapsule.introduction) {
        capsuleUpdateData.introduction = {
          ...(existingCapsule.introduction as any),
          ...capsuleUpdateData.introduction,
        };
      }

      if (capsuleUpdateData.introduction) {
        delete (capsuleUpdateData.introduction as Record<string, any>).__videoUploadTokens;
      }

      await JourneyCapsule.findByIdAndUpdate(
        id,
        capsuleUpdateData,
        { new: true }
      )
        .select('-__v');

      if (introVideoToken && stagedVideoUploads?.[introVideoToken]) {
        const oldUrl = (existingCapsule.introduction as any)?.introVideo?.url;
        if (oldUrl) {
          await deleteHlsFolderByUrl(oldUrl);
        }
        await enqueueVideoProcessingJob(stagedVideoUploads[introVideoToken], {
          targetModel: 'JourneyCapsule',
          targetId: id,
          fieldPath: 'introduction.introVideo',
        });
      }

      if (modules && Array.isArray(modules)) {
        const incomingModuleIds = modules
          .filter((m: any) => m._id)
          .map((m: any) => new mongoose.Types.ObjectId(m._id));

        const existingModules = await JourneyModule.find({
          capsuleId: id,
          isDeleted: false,
        });

        const modulesToDelete = existingModules.filter(
          (m) =>
            !incomingModuleIds.some(
              (moduleId: mongoose.Types.ObjectId) => moduleId.equals(m._id)
            )
        );

        for (const modToDelete of modulesToDelete) {
          await moduleService.deleteModuleWithLessons(modToDelete._id.toString());
          await JourneyModule.deleteOne({ _id: modToDelete._id });
        }

        for (const mod of modules) {
          if (mod._id) {
            await moduleService.updateModuleWithLessons(
              mod._id,
              mod,
              undefined,
              stagedVideoUploads,
            );
          } else {
            mod.capsuleId = new mongoose.Types.ObjectId(id);
            await moduleService.createModuleWithLessons(mod, undefined, stagedVideoUploads);
          }
        }
      }

      const result = await JourneyCapsule.findById(id).select('-__v').lean();

      const mods = await JourneyModule.find({
        capsuleId: id,
        isDeleted: false,
      })
        .sort({ orderNumber: 1 })
        .select('-__v')
        .lean();

      for (const m of mods) {
        (m as any).lessons = await JourneyLesson.find({
          moduleId: m._id,
          isDeleted: false,
        })
          .sort({ orderNumber: 1 })
          .select('-__v')
          .lean();
      }

      (result as any).modules = mods;

      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateById(id: string, data: Partial<IJourneyCapsule>) {
    const existing = await this.model.findById(id).select('-__v');
    if (!existing) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Object Found');
    }

    if (data.introduction && existing.introduction) {
      data.introduction = {
        ...existing.introduction.toObject(),
        ...data.introduction,
      };
    }

    return await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .select('-__v');
  }

  async softDeleteById(id: string) {
    const capsule = await this.model.findById(id).select('-__v');
    if (!capsule) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Object Found');
    }
    if (capsule.isDeleted === true) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Item already deleted');
    }

    if (capsule.thumbnail) {
      deleteFileFromDisk(capsule.thumbnail);
    }

    if (capsule.introduction?.introVideo?.url) {
      deleteFileFromDisk(capsule.introduction.introVideo.url);
    }

    const modules = await JourneyModule.find({
      capsuleId: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });

    for (const mod of modules) {
      if (mod.moduleVideo?.url) {
        deleteFileFromDisk(mod.moduleVideo.url);
      }

      const lessons = await JourneyLesson.find({
        moduleId: mod._id,
        isDeleted: false,
      });

      for (const lesson of lessons) {
        if (lesson.lessonVideo?.url) {
          deleteFileFromDisk(lesson.lessonVideo.url);
        }
      }

      await JourneyLesson.updateMany(
        { moduleId: mod._id },
        { $set: { isDeleted: true } }
      );
    }

    await JourneyModule.updateMany(
      { capsuleId: new mongoose.Types.ObjectId(id) },
      { $set: { isDeleted: true } }
    );

    return await this.model
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .select('-__v');
  }

  async deleteById(id: string) {
    const capsule = await this.model.findById(id).select('-__v');
    if (!capsule) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Object Found');
    }

    if (capsule.thumbnail) {
      deleteFileFromDisk(capsule.thumbnail);
    }

    if (capsule.introduction?.introVideo?.url) {
      deleteFileFromDisk(capsule.introduction.introVideo.url);
    }

    const modules = await JourneyModule.find({
      capsuleId: new mongoose.Types.ObjectId(id),
    });

    for (const mod of modules) {
      await moduleService.deleteModuleWithLessons(mod._id.toString());
    }

    await JourneyModule.deleteMany({
      capsuleId: new mongoose.Types.ObjectId(id),
    });

    await StudentCapsuleTracker.deleteMany({
      capsuleId: new mongoose.Types.ObjectId(id),
    });

    await StudentModuleTracker.deleteMany({
      capsuleId: new mongoose.Types.ObjectId(id),
    });

    await LessonTracker.deleteMany({
      capsuleId: new mongoose.Types.ObjectId(id),
    });

    return await this.model.findByIdAndDelete(id).select('-__v');
  }

  async getModulesWithoutVideo(capsuleId: string) {
    const capsule = await JourneyCapsule.findOne({
      _id: new mongoose.Types.ObjectId(capsuleId),
      isDeleted: false,
    }).select('-introduction.introVideo').lean();

    if (!capsule) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
    }

    const modules = await JourneyModule.find({
      capsuleId: new mongoose.Types.ObjectId(capsuleId),
      isDeleted: false,
    })
      .select('-moduleVideo')
      .sort({ orderNumber: 1 })
      .lean();

    return {
      capsule: {
        _id: capsule._id,
        title: capsule.title,
        capsuleNumber: capsule.capsuleNumber,
        roadMapBrief: capsule.roadMapBrief,
        description: capsule.description,
        thumbnail: capsule.thumbnail,
        totalModule: capsule.totalModule,
      },
      modules: modules.map(mod => ({
        _id: mod._id,
        sl: mod.sl,
        title: mod.title,
        roadMapBrief: mod.roadMapBrief,
        description: mod.description,
        estimatedTime: mod.estimatedTime,
        orderNumber: mod.orderNumber,
      })),
      totalModules: modules.length,
    };
  }
}
