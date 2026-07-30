//@ts-ignore
import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import {
  IMentorApprovalBooking,
  IMentorApprovalBookingModel,
} from './mentorApprovalBooking.interface';
import { TMentorApprovalBookingStatus } from './mentorApprovalBooking.constant';

const mentorApprovalBookingSchema = new Schema<
  IMentorApprovalBooking,
  IMentorApprovalBookingModel
>(
  {
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mentorProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'MentorProfile',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TMentorApprovalBookingStatus),
      default: TMentorApprovalBookingStatus.requested,
      index: true,
    },
    requestDate: {
      type: Date,
      required: true,
    },
    interviewScheduledAt: {
      type: Date,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
    calendlyEventId: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
    },
    calendlyInviteeId: {
      type: String,
      default: null,
    },
    calendlyEventUri: {
      type: String,
      default: null,
    },
    calendlyInviteeUri: {
      type: String,
      default: null,
    },
    calendlyCancelUrl: {
      type: String,
      default: null,
    },
    calendlyRescheduleUrl: {
      type: String,
      default: null,
    },
    inviteeEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    inviteeName: {
      type: String,
      default: null,
      trim: true,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

mentorApprovalBookingSchema.plugin(paginate);
mentorApprovalBookingSchema.plugin(toJSON);

export const MentorApprovalBooking = model<
  IMentorApprovalBooking,
  IMentorApprovalBookingModel
>('MentorApprovalBooking', mentorApprovalBookingSchema);
