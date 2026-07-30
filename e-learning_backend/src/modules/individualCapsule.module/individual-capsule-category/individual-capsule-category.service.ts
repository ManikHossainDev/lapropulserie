import { IndividualCapsuleCategory } from './individual-capsule-category.model';
import { IIndividualCapsuleCategory } from './individual-capsule-category.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { PaginateOptions } from '../../../types/paginate';
import mongoose from 'mongoose';
import PaginationService from '../../../common/service/paginationService';
import { IndividualCapsule } from '../individual-capsule/individual-capsule.model';
import ApiError from '../../../errors/ApiError';
import { IndividualCapsuleReview } from '../individual-capsule-review/individual-capsule-review.model';

export class IndividualCapsuleCategoryService extends GenericService<
  typeof IndividualCapsuleCategory,
  IIndividualCapsuleCategory
> {
  constructor() {
    super(IndividualCapsuleCategory);
  }

  async getAllCapsulesByCategoryIdV2(options: PaginateOptions, capsuleCategoryId: string) {
    const category = await IndividualCapsuleCategory.findOne(
      { _id: capsuleCategoryId, isDeleted: false },
      { title: 1, description: 1, thumbnail: 1 },
    ).lean();

    if (!category) throw new ApiError(404, 'Category not found');

    const pipeline = [
      {
        $match: {
          capsuleCategoryId: new mongoose.Types.ObjectId(capsuleCategoryId),
          isDeleted: false,
        },
      },
      {
        $project: {
          title: 1,
          level: 1,
          description: 1,
          numberOfModules: 1,
          price: 1,
          thumbnail: 1,
          whatYouLearn: 1,
        },
      },
    ];

    const capsules = await PaginationService.aggregationPaginate(
      IndividualCapsule,
      pipeline,
      options,
    );

    return { category, capsules };
  }

  async getAllCapsulesWithRatingInfoByCategoryIdV2(options: PaginateOptions, capsuleCategoryId: string) {
    const category = await IndividualCapsuleCategory.findOne(
      { _id: capsuleCategoryId, isDeleted: false },
      { title: 1, description: 1, thumbnail: 1 },
    ).lean();

    if (!category) throw new ApiError(404, 'Category not found');

    const pipeline = [
      {
        $match: {
          capsuleCategoryId: new mongoose.Types.ObjectId(capsuleCategoryId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'individualcapsulereviews',
          let: { capsuleId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$capsuleId', '$$capsuleId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
              },
            },
          ],
          as: 'reviewStats',
        },
      },
      {
        $addFields: {
          avgRating: { $ifNull: [{ $arrayElemAt: ['$reviewStats.avgRating', 0] }, 0] },
          totalReviews: { $ifNull: [{ $arrayElemAt: ['$reviewStats.totalReviews', 0] }, 0] },
        },
      },
      {
        $project: {
          title: 1,
          level: 1,
          description: 1,
          numberOfModules: 1,
          price: 1,
          thumbnail: 1,
          avgRating: { $round: ['$avgRating', 1] },
          totalReviews: 1,
        },
      },
    ];

    const capsules = await PaginationService.aggregationPaginate(
      IndividualCapsule,
      pipeline,
      options,
    );

    return { category, capsules };
  }
}
