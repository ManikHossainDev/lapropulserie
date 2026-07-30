import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import {
  TSubscriptionPlanBillingPeriod,
  TSubscriptionPlanStatus,
} from './subscriptionPlan.constant';

export interface ISubscriptionPlan {
  _id?: Types.ObjectId;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  mostPopular: boolean;
  billingPeriod: TSubscriptionPlanBillingPeriod;
  trialDays: number;
  features: string[];
  stripePriceId?: string | null;
  stripeProductId?: string | null;
  status: TSubscriptionPlanStatus;
  sortOrder: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscriptionPlanModel extends Model<ISubscriptionPlan> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions,
  ) => Promise<PaginateResult<ISubscriptionPlan>>;
}
