import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { IMeeting, IMeetingModel } from './meeting.interface';

const meetingSchema = new Schema<IMeeting, IMeetingModel>(
  {
    calendlyEventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    calendlyInviteeId: {
      type: String,
      required: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    studentName: {
      type: String,
      default: null,
      trim: true,
    },
    eventType: {
      type: String,
      default: null,
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: null,
    },
    location: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
      index: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

meetingSchema.plugin(paginate);
meetingSchema.plugin(toJSON);

export const Meeting = model<IMeeting, IMeetingModel>('Meeting', meetingSchema);
