import { StatusCodes } from 'http-status-codes';
import { MentorReview } from './mentorReview.model';
import { IMentorReview } from './mentorReview.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { StudentMentor } from '../../studentMentor/studentMentor.model';
import ApiError from '../../../errors/ApiError';

export class MentorReviewService extends GenericService<
  typeof MentorReview,
  IMentorReview
> {
  constructor() {
    super(MentorReview);
  }

  async createWithSessionValidation(payload: IMentorReview): Promise<IMentorReview> {
    const hasSession = await StudentMentor.exists({
      studentId: payload.userId,
      mentorId: payload.mentorId,
      isDeleted: false,
    });

    if (!hasSession) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You can only review mentors you have had sessions with',
      );
    }

    const existingReview = await MentorReview.findOne({
      userId: payload.userId,
      mentorId: payload.mentorId,
      isDeleted: false,
    });

    if (existingReview) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'You have already reviewed this mentor',
      );
    }

    return this.create(payload);
  }

  async getRatingDistribution(mentorId: string): Promise<{
    distribution: { rating: number; count: number; percentage: number }[];
    totalReviews: number;
  }> {
    const pipeline = [
      { $match: { mentorId: mentorId as any, isDeleted: false } },
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

    const result = await MentorReview.aggregate(pipeline);

    const totalReviews = result[0]?.totalReviews || 0;

    const distribution = [5, 4, 3, 2, 1].map((rating) => {
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

  async getReviewSummary(mentorId: string): Promise<{
    averageRating: number;
    totalReviews: number;
  }> {
    const pipeline = [
      { $match: { mentorId: mentorId as any, isDeleted: false } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ];

    const result = await MentorReview.aggregate(pipeline);

    return {
      averageRating: result[0]?.averageRating
        ? Math.round(result[0].averageRating * 10) / 10
        : 0,
      totalReviews: result[0]?.totalReviews || 0,
    };
  }

  async getRecentReviews(mentorId: string, limit: number = 3): Promise<IMentorReview[]> {
    return MentorReview.find({
      mentorId: mentorId as any,
      isDeleted: false,
    })
      .populate('userId', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async updateReviewById(
    reviewId: string,
    payload: Partial<IMentorReview>,
    userId: string,
  ): Promise<IMentorReview | null> {
    const review = await MentorReview.findOne({
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

    return MentorReview.findByIdAndUpdate(
      reviewId,
      { $set: payload },
      { new: true, runValidators: true },
    ).lean();
  }
}
