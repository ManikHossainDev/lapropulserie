import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { IUserSubscription, IUserSubscriptionModel } from './userSubscription.interface';
import { TUserSubscriptionStatus } from './userSubscription.constant';

const userSubscriptionSchema = new Schema<IUserSubscription, IUserSubscriptionModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TUserSubscriptionStatus),
      default: TUserSubscriptionStatus.pending,
      index: true,
    },
    trialStart: { type: Date, default: null },
    trialEnd: { type: Date, default: null },
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    stripeSubscriptionId: { type: String, default: null, index: true, sparse: true },
    stripeCustomerId: { type: String, default: null, index: true, sparse: true },
    stripeCheckoutSessionId: { type: String, default: null, sparse: true },
    stripePaymentIntentId: { type: String, default: null },
    latestInvoiceId: { type: String, default: null },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
);

userSubscriptionSchema.plugin(paginate);
userSubscriptionSchema.plugin(toJSON);

export const UserSubscription = model<IUserSubscription, IUserSubscriptionModel>(
  'UserSubscription',
  userSubscriptionSchema,
);
