import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TUserSubscriptionStatus } from './userSubscription.constant';

export interface IUserSubscription {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  subscriptionPlanId: Types.ObjectId;
  status: TUserSubscriptionStatus;
  trialStart?: Date | null;
  trialEnd?: Date | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelledAt?: Date | null;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  latestInvoiceId?: string | null;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserSubscriptionModel extends Model<IUserSubscription> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions,
  ) => Promise<PaginateResult<IUserSubscription>>;
}
