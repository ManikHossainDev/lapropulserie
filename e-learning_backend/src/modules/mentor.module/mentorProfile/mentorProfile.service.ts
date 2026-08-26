import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import PaginationService from '../../../common/service/paginationService';
import ApiError from '../../../errors/ApiError';
import { GenericService } from '../../_generic-module/generic.services';
import { MentorApprovalBookingService } from '../../booking.module/mentorApprovalBooking/mentorApprovalBooking.service';
import { TMentorApprovalBookingStatus } from '../../booking.module/mentorApprovalBooking/mentorApprovalBooking.constant';
import { MentorReview } from '../mentorReview/mentorReview.model';
import { IUser } from '../../user.module/user/user.interface';
import { User } from '../../user.module/user/user.model';
import { THaveAdminApproval } from './mentorProfile.constant';
import { IMentorProfile } from './mentorProfile.interface';
import { MentorProfile } from './mentorProfile.model';

type TMentorProfileUpdatePayload = Partial<IMentorProfile> & {
  name?: string;
  calendlyProfileLink?: string;
};

export class MentorProfileService extends GenericService<
  typeof MentorProfile,
  IMentorProfile
> {
  private readonly mentorApprovalBookingService = new MentorApprovalBookingService();

  constructor() {
    super(MentorProfile);
  }

  private getOnboardingStageSummaries(profile: IMentorProfile & { name?: string | null; avatarUrl?: string | null }) {
    return [
      {
        step: 1,
        key: 'basicInfo',
        isCompleted: Boolean(
          profile.name &&
          profile.location &&
          profile.availableIn?.length &&
          profile.language?.length &&
          profile.sessionPrice !== undefined &&
          profile.currentJobTitle &&
          profile.companyName &&
          profile.yearsOfExperience !== undefined &&
          profile.bio,
        ),
        data: {
          name: profile.name || null,
          location: profile.location || null,
          availableIn: profile.availableIn || [],
          language: profile.language || [],
          sessionPrice: profile.sessionPrice ?? null,
          currentJobTitle: profile.currentJobTitle || null,
          companyName: profile.companyName || null,
          yearsOfExperience: profile.yearsOfExperience ?? null,
          bio: profile.bio || null,
          facebookLink: profile.facebookLink || null,
          instagramLink: profile.instagramLink || null,
          twitterLink: profile.twitterLink || null,
          avatarUrl: profile.avatarUrl || null,
        },
      },
      {
        step: 2,
        key: 'mission',
        isCompleted: Boolean(
          profile.careerStage?.length &&
          profile.focusArea?.length &&
          profile.industry?.length,
        ),
        data: {
          careerStage: profile.careerStage || [],
          focusArea: profile.focusArea || [],
          industry: profile.industry || [],
        },
      },
      {
        step: 3,
        key: 'innerFuel',
        isCompleted: Boolean(
          profile.coreValues?.length >= 5 && profile.specialties?.length >= 5,
        ),
        data: {
          coreValues: profile.coreValues || [],
          specialties: profile.specialties || [],
        },
      },
      {
        step: 4,
        key: 'methods',
        isCompleted: Boolean(
          profile.coachingMethodologies?.length && profile.calendlyProfileLink,
        ),
        data: {
          coachingMethodologies: profile.coachingMethodologies || [],
          calendlyProfileLink: profile.calendlyProfileLink || null,
        },
      },
      {
        step: 5,
        key: 'goLive',
        // Approval request (or later go-live) completes this step — do not require isLive for #43.
        isCompleted:
          profile.isLive === true ||
          [
            THaveAdminApproval.inRequest,
            THaveAdminApproval.interviewScheduled,
            THaveAdminApproval.approved,
          ].includes(profile.haveAdminApproval),
        data: {
          isLive: profile.isLive,
          approvalStatus: profile.haveAdminApproval,
        },
      },
    ];
  }

  async updateMentorProfileV2(
    data: TMentorProfileUpdatePayload,
    mentorId: string,
  ) {
    let existing = await MentorProfile.findOne({ userId: mentorId });

    if (!existing) {
      existing = await MentorProfile.create({ userId: mentorId });
    }

    const updateData: Partial<IMentorProfile> & {
      calendlyProfileLink?: string;
    } = {};

    if (data.name) {
      await User.findByIdAndUpdate(mentorId, { name: data.name });
    }

    let newStage = existing.profileInfoFillUpCount || 0;

    // Step 1: Basic Information
    // Note: `name` lives on User (updated above), not on MentorProfile schema.
    const hasBasicInfoUpdate =
      data.location !== undefined ||
      data.availableIn !== undefined ||
      data.language !== undefined ||
      data.sessionPrice !== undefined ||
      data.currentJobTitle !== undefined ||
      data.companyName !== undefined ||
      data.yearsOfExperience !== undefined ||
      data.bio !== undefined ||
      data.facebookLink !== undefined ||
      data.instagramLink !== undefined ||
      data.twitterLink !== undefined ||
      data.avatarUrl !== undefined ||
      Boolean(data.name);

    if (hasBasicInfoUpdate) {
      const basicFields: Record<string, unknown> = {
        location: data.location,
        availableIn: data.availableIn,
        language: data.language,
        sessionPrice: data.sessionPrice,
        currentJobTitle: data.currentJobTitle,
        companyName: data.companyName,
        yearsOfExperience: data.yearsOfExperience,
        bio: data.bio,
        facebookLink: data.facebookLink,
        instagramLink: data.instagramLink,
        twitterLink: data.twitterLink,
        avatarUrl: data.avatarUrl,
      };

      Object.entries(basicFields).forEach(([key, value]) => {
        if (value !== undefined) {
          (updateData as Record<string, unknown>)[key] = value;
        }
      });

      newStage = Math.max(newStage, 1);
    }

    // Step 2: Mission (careerStage, focusArea, industry - all arrays)
    if (data.careerStage || data.focusArea || data.industry?.length) {
      Object.assign(updateData, {
        industry: data.industry,
        focusArea: data.focusArea,
        careerStage: data.careerStage,
      });

      newStage = Math.max(newStage, 2);
    }

    // Step 3: Inner Fuel (coreValues min 5, specialties min 5)
    if (data.coreValues || data.specialties) {
      Object.assign(updateData, {
        specialties: data.specialties,
        coreValues: data.coreValues,
      });

      newStage = Math.max(newStage, 3);
    }

    // Step 4: Methods (coachingMethodologies, calendlyProfileLink)
    if (data.coachingMethodologies !== undefined || data.calendlyProfileLink !== undefined) {
      if (data.coachingMethodologies !== undefined) {
        updateData.coachingMethodologies = data.coachingMethodologies;
      }
      if (data.calendlyProfileLink !== undefined) {
        updateData.calendlyProfileLink = data.calendlyProfileLink;
      }
      newStage = Math.max(newStage, 4);
    }

    // Step 5: Go Live (boolean only)
    if (data.isLive !== undefined) {
      updateData.isLive = data.isLive;
      newStage = Math.max(newStage, 5);
    }

    await MentorProfile.findByIdAndUpdate(existing._id, {
      $set: updateData,
      $max: { profileInfoFillUpCount: newStage },
    });

    const profile = await MentorProfile.findById(existing._id);
    return profile?.toJSON() || { message: 'Profile updated successfully' };
  }

  async changeStatusOfHaveAdminApproval(mentorId: string) {
    const mentorProfile = await MentorProfile.findOne({
      userId: mentorId,
      isDeleted: false,
    }).lean();

    if (!mentorProfile) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor profile not found.');
    }

    const user = await User.findById(mentorId).select('name profileImage').lean();
    
    const profileWithUser = {
      ...mentorProfile,
      name: user?.name || null,
      avatarUrl: user?.profileImage?.imageUrl || mentorProfile.avatarUrl,
    };

    const completedStages = this.getOnboardingStageSummaries(profileWithUser as IMentorProfile & { name?: string | null; avatarUrl?: string | null }).filter(
      stage => stage.step < 5 && stage.isCompleted,
    ).length;

    if (completedStages < 4) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Complete the mentor onboarding steps before requesting admin approval.',
      );
    }

    return this.mentorApprovalBookingService.upsertFromMentorApprovalRequest(
      mentorId,
      mentorProfile._id.toString(),
    );
  }

  async checkStatusOfHaveAdminApproval(mentorId: string) {
    const statusOfMentorProfile = await MentorProfile.findOne({
      userId: mentorId,
      isDeleted: false,
    }).select(
      'haveAdminApproval isLive requestDate interviewScheduledAt reviewedAt rejectionReason profileInfoFillUpCount',
    );

    if (!statusOfMentorProfile) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor profile not found.');
    }

    return statusOfMentorProfile.toJSON();
  }

  async getMentorOnboardingStatus(mentorId: string) {
    console.log('Mentor id ', mentorId);
    let mentorProfile = await MentorProfile.findOne({
      userId: mentorId,
      isDeleted: false,
    }).lean();

    if (!mentorProfile) {
      mentorProfile = await MentorProfile.create({ userId: mentorId });
    }

    const user = await User.findById(mentorId).select('name profileImage').lean();
    
    const profileWithUser = {
      ...mentorProfile,
      name: user?.name || null,
      avatarUrl: user?.profileImage?.imageUrl || mentorProfile.avatarUrl,
    };

    const steps = this.getOnboardingStageSummaries(profileWithUser as IMentorProfile);
    const completedSteps = steps.filter(step => step.isCompleted).length;

    return {
      profileId: mentorProfile._id,
      profileInfoFillUpCount: mentorProfile.profileInfoFillUpCount || 0,
      approvalStatus: mentorProfile.haveAdminApproval,
      isLive: mentorProfile.isLive,
      requestDate: mentorProfile.requestDate || null,
      interviewScheduledAt: mentorProfile.interviewScheduledAt || null,
      reviewedAt: mentorProfile.reviewedAt || null,
      rejectionReason: mentorProfile.rejectionReason || null,
      progress: {
        completedSteps,
        totalSteps: steps.length,
        completionPercentage: Math.round((completedSteps / steps.length) * 100),
      },
      steps,
    };
  }

  async getAdminMentorReviewList(filters: any, options: any) {
    const matchStage: Record<string, unknown> = { isDeleted: false };

    if (filters.approvalStatus) {
      matchStage.haveAdminApproval = filters.approvalStatus;
    }

    if (typeof filters.isLive === 'boolean') {
      matchStage.isLive = filters.isLive;
    }

    if (filters.from || filters.to) {
      matchStage.requestDate = {};
      if (filters.from) {
        (matchStage.requestDate as Record<string, Date>).$gte = new Date(
          filters.from,
        );
      }
      if (filters.to) {
        (matchStage.requestDate as Record<string, Date>).$lte = new Date(
          filters.to,
        );
      }
    }

    const searchRegex =
      typeof filters.search === 'string' && filters.search.trim()
        ? new RegExp(filters.search.trim(), 'i')
        : null;

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false,
        },
      },
      ...(searchRegex
        ? [
            {
              $match: {
                $or: [{ 'user.name': searchRegex }, { 'user.email': searchRegex }],
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 1,
          userId: 1,
          haveAdminApproval: 1,
          requestDate: 1,
          interviewScheduledAt: 1,
          reviewedAt: 1,
          rejectionReason: 1,
          isLive: 1,
          profileInfoFillUpCount: 1,
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            profileImage: '$user.profileImage',
          },
        },
      },
      {
        $sort: PaginationService.buildSortObject(
          typeof options.sortBy === 'string' ? options.sortBy : undefined,
        ),
      },
    ];

    return PaginationService.aggregationPaginate(MentorProfile, pipeline, options);
  }

  async getAdminMentorReviewDetails(id: string) {
    const mentorProfile = await MentorProfile.findById(id)
      .populate('userId', 'name email profileImage status journeyType')
      .lean();

    if (!mentorProfile) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor profile not found.');
    }

    return mentorProfile;
  }

  async updateAdminApprovalStatus(
    id: string,
    approvalStatus: THaveAdminApproval,
    payload: { interviewScheduledAt?: string; rejectionReason?: string },
  ) {
    const mentorProfile = await MentorProfile.findById(id).select('_id');

    if (!mentorProfile) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor profile not found.');
    }

    const statusMap: Record<
      THaveAdminApproval,
      TMentorApprovalBookingStatus
    > = {
      [THaveAdminApproval.none]: TMentorApprovalBookingStatus.requested,
      [THaveAdminApproval.inRequest]:
        TMentorApprovalBookingStatus.requested,
      [THaveAdminApproval.interviewScheduled]:
        TMentorApprovalBookingStatus.interviewScheduled,
      [THaveAdminApproval.approved]: TMentorApprovalBookingStatus.approved,
      [THaveAdminApproval.rejected]: TMentorApprovalBookingStatus.rejected,
    };

    return this.mentorApprovalBookingService.updateStatusByMentorProfileId(
      mentorProfile._id.toString(),
      {
        status: statusMap[approvalStatus],
        interviewScheduledAt: payload.interviewScheduledAt,
        rejectionReason: payload.rejectionReason,
      },
    );
  }

  async mentorProfileInfoWithReviewsV2(mentorUserId: string) {
    const mentorObjectId = new mongoose.Types.ObjectId(mentorUserId);

    const user = await User.findById(mentorUserId)
      .select('name profileImage')
      .lean();

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
    }

    const mentorProfile = await MentorProfile.findOne({
      userId: mentorUserId,
      isDeleted: false,
    }).lean();

    if (!mentorProfile) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor profile not found.');
    }

    const reviews = await MentorReview.find({
      mentorId: mentorObjectId,
      isDeleted: false,
    })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const ratingAggregation = await MentorReview.aggregate([
      {
        $match: {
          mentorId: mentorObjectId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: { $push: '$rating' },
        },
      },
    ]);

    let averageRating = 0;
    let totalReviews = 0;
    let ratingBreakdown: Array<{
      rating: number;
      count: number;
      percentage: number;
    }> = [];

    if (ratingAggregation.length) {
      averageRating = Number(ratingAggregation[0].averageRating.toFixed(1));
      totalReviews = ratingAggregation[0].totalReviews;

      const countMap: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      for (const rating of ratingAggregation[0].ratings as number[]) {
        countMap[rating] = (countMap[rating] || 0) + 1;
      }

      ratingBreakdown = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: countMap[rating] || 0,
        percentage: totalReviews
          ? Number((((countMap[rating] || 0) / totalReviews) * 100).toFixed(0))
          : 0,
      }));
    } else {
      ratingBreakdown = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: 0,
        percentage: 0,
      }));
    }

    return {
      user,
      profile: mentorProfile,
      reviews: reviews,
      reviewStats: {
        averageRating,
        totalReviews,
        ratingBreakdown,
      },
    };
  }
}
