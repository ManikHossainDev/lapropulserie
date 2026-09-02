import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { PaginateOptions } from '../../../types/paginate';
import { IndividualCapsule } from './individual-capsule.model';
import { IIndividualCapsule } from './individual-capsule.interface';
import { GenericService } from '../../_generic-module/generic.services';
import PaginationService from '../../../common/service/paginationService';
import { IndividualModule } from '../individual-module/individual-module.model';
import { IndividualCapsuleReview } from '../individual-capsule-review/individual-capsule-review.model';
import { JourneyCapsule } from '../../journey.module/journey-capsule/journey-capsule.model';
import { syncJourneyCapsulesFromIndividualCapsule } from '../../journey.module/journey-capsule/journey-capsule.sync';

export class IndividualCapsuleService extends GenericService<
  typeof IndividualCapsule,
  IIndividualCapsule
> {
  constructor() {
    super(IndividualCapsule);
  }

  private async unlinkFromJourneys(capsuleId: string) {
    await JourneyCapsule.updateMany(
      { individualCapsuleId: capsuleId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
  }

  async softDeleteById(id: string) {
    await this.unlinkFromJourneys(id);
    return super.softDeleteById(id);
  }

  async deleteById(id: string) {
    await this.unlinkFromJourneys(id);
    return super.deleteById(id);
  }

  async updateById(id: string, data: IIndividualCapsule) {
    const existing = await IndividualCapsule.findById(id).select('-__v');
    if (!existing) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Object Found');
    }

    const clean = { ...(data as unknown as Record<string, unknown>) };
    delete clean.founderVideo;
    delete clean.inspirationVideo;
    delete clean.scienceVideo;
    delete clean.__videoUploadTokens;

    // Nested $set replaces the whole subdocument.
    // - omitted video key → keep previous
    // - null video key → drop key so replacement clears it
    // Never $unset a child path while $set-ing the parent (Mongo conflict —
    // caused intermittent "Failed to update capsule" when a part had no video).
    const mergePartVideo = (
      partKey: 'introduction' | 'inspiration' | 'science',
      videoKey: 'founderVideo' | 'inspirationVideo' | 'optionalVideo',
    ) => {
      const part = clean[partKey] as Record<string, unknown> | undefined;
      if (!part || typeof part !== 'object') return;

      if (!Object.prototype.hasOwnProperty.call(part, videoKey)) {
        const previous = (existing as any)?.[partKey]?.[videoKey];
        if (previous) {
          part[videoKey] =
            typeof previous?.toObject === 'function'
              ? previous.toObject()
              : previous;
        }
        return;
      }

      if (part[videoKey] === null || part[videoKey] === undefined) {
        delete part[videoKey];
        return;
      }

      const video = part[videoKey] as Record<string, unknown>;
      if (video && typeof video === 'object') {
        // Drop empty processing placeholders that fail validators / wipe URLs
        if (video.status === 'processing' && !video.url) {
          const previous = (existing as any)?.[partKey]?.[videoKey];
          if (previous) {
            part[videoKey] =
              typeof previous?.toObject === 'function'
                ? previous.toObject()
                : previous;
          } else {
            delete part[videoKey];
          }
        }
      }
    };

    mergePartVideo('introduction', 'founderVideo');
    mergePartVideo('inspiration', 'inspirationVideo');
    mergePartVideo('science', 'optionalVideo');

    let updated;
    try {
      updated = await IndividualCapsule.findByIdAndUpdate(
        id,
        { $set: clean },
        {
          new: true,
          runValidators: true,
        },
      ).select('-__v');
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (/conflict/i.test(msg)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Capsule video update conflict. Retry replace without clearing other videos. (${msg})`,
        );
      }
      throw err;
    }

    if (updated) {
      await syncJourneyCapsulesFromIndividualCapsule(updated._id);
    }

    return updated;
  }

  async getAllModulesByCapsuleId(options: PaginateOptions, capsuleId: string) {
    const capsule = await IndividualCapsule.findOne(
      { _id: capsuleId, isDeleted: false },
      {
        title: 1,
        description: 1,
        about: 1,
        price: 1,
        level: 1,
        numberOfModules: 1,
        thumbnail: 1,
        whatYouLearn: 1,
      },
    ).lean();

    if (!capsule) {
      throw new ApiError(404, 'Capsule not found');
    }

    const modulePipeline = [
      {
        $match: {
          capsuleId: new mongoose.Types.ObjectId(capsuleId),
          isDeleted: false,
        },
      },
      {
        $project: {
          title: 1,
          numberOfLessons: 1,
          estimatedTime: 1,
          thumbnail: 1,
          orderNumber: 1,
        },
      },
    ];

    const modules = await PaginationService.aggregationPaginate(
      IndividualModule,
      modulePipeline,
      options,
    );

    return { capsule, modules };
  }

  async getWithModulesAndReviews(capsuleId: string) {
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);

    const capsule = await IndividualCapsule.aggregate([
      { $match: { _id: capsuleObjectId, isDeleted: false } },
      {
        $project: {
          title: 1,
          level: 1,
          description: 1,
          about: 1,
          numberOfModules: 1,
          price: 1,
          whatYouLearn: 1,
          thumbnail: 1,
        },
      },
    ]);

    if (!capsule.length) {
      throw new ApiError(404, 'Capsule not found');
    }

    const modules = await IndividualModule.aggregate([
      { $match: { capsuleId: capsuleObjectId, isDeleted: false } },
      {
        $lookup: {
          from: 'individuallessons',
          let: { moduleId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$moduleId', '$$moduleId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            {
              $project: {
                title: 1,
                estimatedTime: 1,
                orderNumber: 1,
                lessonVideo: 1,
              },
            },
            { $sort: { orderNumber: 1 } },
          ],
          as: 'lessons',
        },
      },
      {
        $project: {
          title: 1,
          numberOfLessons: 1,
          estimatedTime: 1,
          thumbnail: 1,
          orderNumber: 1,
          lessons: 1,
        },
      },
      { $sort: { orderNumber: 1 } },
    ]);

    const reviews = await IndividualCapsuleReview.aggregate([
      { $match: { capsuleId: capsuleObjectId, isDeleted: false } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          rating: 1,
          review: 1,
          createdAt: 1,
          user: {
            _id: '$user._id',
            name: '$user.fullName',
            profileImage: '$user.avatar',
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return {
      success: true,
      data: {
        capsule: capsule[0],
        modules,
        reviews,
        stats: {
          totalModules: modules.length,
          totalLessons: modules.reduce(
            (sum: number, m: any) => sum + (m.lessons?.length || 0),
            0,
          ),
          averageRating:
            reviews.length > 0
              ? (
                  reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
                  reviews.length
                ).toFixed(1)
              : null,
        },
      },
    };
  }
}
