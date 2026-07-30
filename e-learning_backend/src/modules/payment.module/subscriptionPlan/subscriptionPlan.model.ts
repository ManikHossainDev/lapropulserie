import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import {
  TSubscriptionPlanBillingPeriod,
  TSubscriptionPlanStatus,
} from './subscriptionPlan.constant';
import {
  ISubscriptionPlan,
  ISubscriptionPlanModel,
} from './subscriptionPlan.interface';

const subscriptionPlanSchema = new Schema<
  ISubscriptionPlan,
  ISubscriptionPlanModel
>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    description: { type: String, default: null, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'usd', lowercase: true, trim: true },
    mostPopular: { type: Boolean, default: false },
    billingPeriod: {
      type: String,
      enum: Object.values(TSubscriptionPlanBillingPeriod),
      required: true,
    },
    trialDays: { type: Number, default: 7, min: 0 },
    features: { type: [String], default: [] },
    stripePriceId: { type: String, default: null, sparse: true },
    stripeProductId: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(TSubscriptionPlanStatus),
      default: TSubscriptionPlanStatus.active,
      index: true,
    },
    sortOrder: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
);

subscriptionPlanSchema.plugin(paginate);
subscriptionPlanSchema.plugin(toJSON);

export const SubscriptionPlan = model<
  ISubscriptionPlan,
  ISubscriptionPlanModel
>('SubscriptionPlan', subscriptionPlanSchema);
