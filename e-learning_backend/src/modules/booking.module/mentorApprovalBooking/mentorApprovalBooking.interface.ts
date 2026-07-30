import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TMentorApprovalBookingStatus } from './mentorApprovalBooking.constant';

export interface IMentorApprovalBooking {
  _id?: Types.ObjectId;
  mentorId: Types.ObjectId;
  mentorProfileId: Types.ObjectId;
  status: TMentorApprovalBookingStatus;
  requestDate: Date;
  interviewScheduledAt?: Date | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  calendlyEventId?: string | null;
  calendlyInviteeId?: string | null;
  calendlyEventUri?: string | null;
  calendlyInviteeUri?: string | null;
  calendlyCancelUrl?: string | null;
  calendlyRescheduleUrl?: string | null;
  inviteeEmail?: string | null;
  inviteeName?: string | null;
  notes?: string | null;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMentorApprovalBookingModel
  extends Model<IMentorApprovalBooking> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions,
  ) => Promise<PaginateResult<IMentorApprovalBooking>>;
}
