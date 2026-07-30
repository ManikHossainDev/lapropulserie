import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import PaginationService from '../../../common/service/paginationService';
import { MentorApprovalBooking } from './mentorApprovalBooking.model';
import { IMentorApprovalBooking } from './mentorApprovalBooking.interface';
import { TMentorApprovalBookingStatus } from './mentorApprovalBooking.constant';
import { MentorProfile } from '../../mentor.module/mentorProfile/mentorProfile.model';
import { THaveAdminApproval } from '../../mentor.module/mentorProfile/mentorProfile.constant';
import { User } from '../../user.module/user/user.model';

export class MentorApprovalBookingService {
  private async findActiveBookingByMentorProfileId(mentorProfileId: string) {
    return MentorApprovalBooking.findOne({
      mentorProfileId: new mongoose.Types.ObjectId(mentorProfileId),
      isDeleted: false,
    }).sort({ createdAt: -1 });
  }

  async upsertFromMentorApprovalRequest(mentorId: string, mentorProfileId: string) {
    const [mentor, mentorProfile] = await Promise.all([
      User.findById(mentorId).select('email name'),
      MentorProfile.findById(mentorProfileId),
    ]);

    if (!mentor || !mentorProfile) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor approval context not found.');
    }

    const booking = await MentorApprovalBooking.findOneAndUpdate(
      { mentorProfileId: mentorProfile._id, isDeleted: false },
      {
        mentorId: mentor._id,
        mentorProfileId: mentorProfile._id,
        status: TMentorApprovalBookingStatus.requested,
        requestDate: new Date(),
        reviewedAt: null,
        interviewScheduledAt: null,
        rejectionReason: null,
        calendlyEventId: null,
        calendlyInviteeId: null,
        calendlyEventUri: null,
        calendlyInviteeUri: null,
        calendlyCancelUrl: null,
        calendlyRescheduleUrl: null,
        inviteeEmail: mentor.email,
        inviteeName: mentor.name,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    mentorProfile.haveAdminApproval = THaveAdminApproval.inRequest;
    mentorProfile.requestDate = booking.requestDate;
    mentorProfile.interviewScheduledAt = null;
    mentorProfile.reviewedAt = null;
    mentorProfile.rejectionReason = null;
    mentorProfile.isLive = false;
    await mentorProfile.save();

    return booking.toJSON();
  }

  async getAdminList(filters: any, options: any) {
    const matchStage: Record<string, any> = { isDeleted: false };

    if (filters.status) {
      matchStage.status = filters.status;
    }

    if (filters.from || filters.to) {
      matchStage.requestDate = {};
      if (filters.from) {
        matchStage.requestDate.$gte = new Date(filters.from);
      }
      if (filters.to) {
        matchStage.requestDate.$lte = new Date(filters.to);
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
          localField: 'mentorId',
          foreignField: '_id',
          as: 'mentor',
        },
      },
      {
        $unwind: {
          path: '$mentor',
          preserveNullAndEmptyArrays: false,
        },
      },
      ...(searchRegex
        ? [
            {
              $match: {
                $or: [
                  { 'mentor.name': searchRegex },
                  { 'mentor.email': searchRegex },
                ],
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 1,
          mentorId: 1,
          mentorProfileId: 1,
          status: 1,
          requestDate: 1,
          interviewScheduledAt: 1,
          reviewedAt: 1,
          rejectionReason: 1,
          notes: 1,
          calendlyEventId: 1,
          mentor: {
            _id: '$mentor._id',
            name: '$mentor.name',
            email: '$mentor.email',
            profileImage: '$mentor.profileImage',
          },
        },
      },
      {
        $sort: PaginationService.buildSortObject(
          typeof options.sortBy === 'string' ? options.sortBy : undefined,
        ),
      },
    ];

    return PaginationService.aggregationPaginate(
      MentorApprovalBooking,
      pipeline,
      options,
    );
  }

  async getById(id: string) {
    const booking = await MentorApprovalBooking.findById(id)
      .populate('mentorId', 'name email profileImage status journeyType')
      .populate('mentorProfileId')
      .lean();

    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor approval booking not found.');
    }

    return booking;
  }

  async updateStatus(
    id: string,
    payload: {
      status: TMentorApprovalBookingStatus;
      interviewScheduledAt?: string;
      rejectionReason?: string;
      notes?: string;
    },
  ) {
    const booking = await MentorApprovalBooking.findById(id);

    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor approval booking not found.');
    }

    const mentorProfile = await MentorProfile.findById(booking.mentorProfileId);

    if (!mentorProfile) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor profile not found.');
    }

    booking.status = payload.status;
    booking.reviewedAt = new Date();
    booking.notes = payload.notes || booking.notes || null;

    if (payload.status === TMentorApprovalBookingStatus.interviewScheduled) {
      if (!payload.interviewScheduledAt) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'interviewScheduledAt is required when scheduling an interview.',
        );
      }

      booking.interviewScheduledAt = new Date(payload.interviewScheduledAt);
      booking.rejectionReason = null;
      mentorProfile.haveAdminApproval = THaveAdminApproval.interviewScheduled;
      mentorProfile.interviewScheduledAt = booking.interviewScheduledAt;
      mentorProfile.rejectionReason = null;
      mentorProfile.isLive = false;
    } else if (payload.status === TMentorApprovalBookingStatus.approved) {
      booking.rejectionReason = null;
      mentorProfile.haveAdminApproval = THaveAdminApproval.approved;
      mentorProfile.reviewedAt = booking.reviewedAt;
      mentorProfile.rejectionReason = null;
      mentorProfile.isLive = true;
    } else if (payload.status === TMentorApprovalBookingStatus.rejected) {
      booking.rejectionReason = payload.rejectionReason || null;
      mentorProfile.haveAdminApproval = THaveAdminApproval.rejected;
      mentorProfile.reviewedAt = booking.reviewedAt;
      mentorProfile.rejectionReason = booking.rejectionReason;
      mentorProfile.isLive = false;
    } else if (payload.status === TMentorApprovalBookingStatus.noShow) {
      mentorProfile.haveAdminApproval = THaveAdminApproval.interviewScheduled;
      mentorProfile.reviewedAt = booking.reviewedAt;
      mentorProfile.isLive = false;
    } else {
      mentorProfile.haveAdminApproval = THaveAdminApproval.inRequest;
      mentorProfile.isLive = false;
    }

    await Promise.all([booking.save(), mentorProfile.save()]);
    return booking.toJSON();
  }

  async updateStatusByMentorProfileId(
    mentorProfileId: string,
    payload: {
      status: TMentorApprovalBookingStatus;
      interviewScheduledAt?: string;
      rejectionReason?: string;
      notes?: string;
    },
  ) {
    const booking = await this.findActiveBookingByMentorProfileId(mentorProfileId);

    if (!booking) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Mentor approval booking not found for this mentor profile.',
      );
    }

    return this.updateStatus(booking._id.toString(), payload);
  }

  async markInterviewScheduledFromCalendly(input: {
    mentorEmail: string;
    eventId: string;
    inviteeId: string;
    eventUri?: string;
    inviteeUri?: string;
    cancelUrl?: string;
    rescheduleUrl?: string;
    scheduledAt: Date;
    inviteeName?: string;
  }) {
    const mentor = await User.findOne({
      email: input.mentorEmail.trim().toLowerCase(),
      isDeleted: false,
    });

    if (!mentor) {
      return null;
    }

    const booking = await MentorApprovalBooking.findOne({
      mentorId: mentor._id,
      isDeleted: false,
      status: {
        $in: [
          TMentorApprovalBookingStatus.requested,
          TMentorApprovalBookingStatus.noShow,
        ],
      },
    }).sort({ createdAt: -1 });

    if (!booking) {
      return null;
    }

    booking.status = TMentorApprovalBookingStatus.interviewScheduled;
    booking.interviewScheduledAt = input.scheduledAt;
    booking.calendlyEventId = input.eventId;
    booking.calendlyInviteeId = input.inviteeId;
    booking.calendlyEventUri = input.eventUri || null;
    booking.calendlyInviteeUri = input.inviteeUri || null;
    booking.calendlyCancelUrl = input.cancelUrl || null;
    booking.calendlyRescheduleUrl = input.rescheduleUrl || null;
    booking.inviteeName = input.inviteeName || booking.inviteeName || null;
    await booking.save();

    const mentorProfile = await MentorProfile.findById(booking.mentorProfileId);
    if (mentorProfile) {
      mentorProfile.haveAdminApproval = THaveAdminApproval.interviewScheduled;
      mentorProfile.interviewScheduledAt = input.scheduledAt;
      mentorProfile.isLive = false;
      await mentorProfile.save();
    }

    return booking.toJSON();
  }

  async handleCalendlyCancellation(eventId: string) {
    const booking = await MentorApprovalBooking.findOne({
      calendlyEventId: eventId,
      isDeleted: false,
    });

    if (!booking) {
      return null;
    }

    booking.status = TMentorApprovalBookingStatus.requested;
    booking.interviewScheduledAt = null;
    booking.calendlyEventId = null;
    booking.calendlyInviteeId = null;
    booking.calendlyEventUri = null;
    booking.calendlyInviteeUri = null;
    booking.calendlyCancelUrl = null;
    booking.calendlyRescheduleUrl = null;
    await booking.save();

    const mentorProfile = await MentorProfile.findById(booking.mentorProfileId);
    if (mentorProfile) {
      mentorProfile.haveAdminApproval = THaveAdminApproval.inRequest;
      mentorProfile.interviewScheduledAt = null;
      mentorProfile.isLive = false;
      await mentorProfile.save();
    }

    return booking.toJSON();
  }
}
