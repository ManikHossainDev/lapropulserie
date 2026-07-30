import { StatusCodes } from 'http-status-codes';
import { IndividualCapsuleReview } from './individual-capsule-review.model';
import { IIndividualCapsuleReview } from './individual-capsule-review.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { PurchasedIndividualCapsule } from '../purchased-individual-capsule/purchased-individual-capsule.model';
import ApiError from '../../../errors/ApiError';

export class IndividualCapsuleReviewService extends GenericService<
  typeof IndividualCapsuleReview,
  IIndividualCapsuleReview
> {
  constructor() {
    super(IndividualCapsuleReview);
  }

  async createWithPurchaseValidation(
    payload: IIndividualCapsuleReview,
  ): Promise<IIndividualCapsuleReview> {
    const hasPurchase = await PurchasedIndividualCapsule.findOne({
      studentId: payload.userId,
      capsuleId: payload.capsuleId,
      isDeleted: false,
      paymentStatus: 'completed',
    });

    if (!hasPurchase) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You can only review capsules you have purchased',
      );
    }

    const existingReview = await IndividualCapsuleReview.findOne({
      userId: payload.userId,
      capsuleId: payload.capsuleId,
      isDeleted: false,
    });

    if (existingReview) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'You have already reviewed this capsule',
      );
    }

    return this.create(payload);
  }

  async getRatingDistribution(capsuleId: string): Promise<{
    distribution: { rating: number; count: number; percentage: number }[];
    totalReviews: number;
  }> {
    const pipeline = [
      { $match: { capsuleId: capsuleId as any, isDeleted: false } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        },
      },
    ];

    const result = await IndividualCapsuleReview.aggregate(pipeline);

    const totalReviews = result[0]?.totalReviews || 0;

    const distribution = [5, 4, 3, 2, 1].map(rating => {
      const count = result[0]?.[`rating${rating}`] || 0;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return {
        rating,
        count,
        percentage: Math.round(percentage * 100) / 100,
      };
    });

    return { distribution, totalReviews };
  }

  async getReviewSummary(capsuleId: string): Promise<{
    averageRating: number;
    totalReviews: number;
  }> {
    const pipeline = [
      { $match: { capsuleId: capsuleId as any, isDeleted: false } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ];

    const result = await IndividualCapsuleReview.aggregate(pipeline);

    return {
      averageRating: result[0]?.averageRating
        ? Math.round(result[0].averageRating * 10) / 10
        : 0,
      totalReviews: result[0]?.totalReviews || 0,
    };
  }

  async getRecentReviews(
    capsuleId: string,
    limit: number = 3,
  ): Promise<IIndividualCapsuleReview[]> {
    return IndividualCapsuleReview.find({
      capsuleId: capsuleId as any,
      isDeleted: false,
    })
      .populate('userId', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async updateReviewById(
    reviewId: string,
    payload: Partial<IIndividualCapsuleReview>,
    userId: string,
  ): Promise<IIndividualCapsuleReview | null> {
    const review = await IndividualCapsuleReview.findOne({
      _id: reviewId as any,
      userId: userId as any,
      isDeleted: false,
    });

    if (!review) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Review not found or you do not have permission to update it',
      );
    }

    return IndividualCapsuleReview.findByIdAndUpdate(
      reviewId,
      { $set: payload },
      { new: true, runValidators: true },
    ).lean();
  }
}
