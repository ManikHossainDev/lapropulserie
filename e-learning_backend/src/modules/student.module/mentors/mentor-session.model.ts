//@ts-ignore
import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { IMentorSession, IMentorSessionModel } from './mentor-session.interface';
import { TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';

const mentorSessionSchema = new Schema<IMentorSession>(
  {
    mentorProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'MentorProfile',
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(TPaymentStatus),
      default: TPaymentStatus.pending,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paymentTransactionId: {
      type: String,
      default: null,
    },
    calendlyEventId: {
      type: String,
      default: null,
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
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

mentorSessionSchema.plugin(paginate);
mentorSessionSchema.plugin(toJSON);

mentorSessionSchema.static(
  'findByMentorAndStudent',
  function (mentorProfileId: string, studentId: string) {
    return this.findOne({
      mentorProfileId,
      studentId,
      isDeleted: false,
    });
  }
);

export const MentorSession = model<IMentorSession, IMentorSessionModel>(
  'MentorSession',
  mentorSessionSchema
);