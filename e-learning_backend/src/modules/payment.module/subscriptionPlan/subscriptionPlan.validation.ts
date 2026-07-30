import mongoose from 'mongoose';
import { z } from 'zod';
import {
  TSubscriptionPlanBillingPeriod,
  TSubscriptionPlanStatus,
} from './subscriptionPlan.constant';

const objectIdSchema = z
  .string()
  .refine(value => mongoose.Types.ObjectId.isValid(value), {
    message: 'id must be a valid mongoose ObjectId.',
  });

const planBody = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  price: z.number().nonnegative(),
  currency: z.string().trim().optional(),
  billingPeriod: z.nativeEnum(TSubscriptionPlanBillingPeriod),
  trialDays: z.number().int().min(0).max(30).optional(),
  features: z.array(z.string().trim()).optional(),
  stripePriceId: z.string().trim().optional(),
  stripeProductId: z.string().trim().optional(),
  status: z.nativeEnum(TSubscriptionPlanStatus).optional(),
  sortOrder: z.number().int().optional(),
});

export const createSubscriptionPlanValidationSchema = z.object({
  body: planBody,
});

export const updateSubscriptionPlanValidationSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: planBody.partial().refine(body => Object.keys(body).length > 0, {
    message: 'At least one field is required.',
  }),
});

export const subscriptionPlanListValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    status: z.nativeEnum(TSubscriptionPlanStatus).optional(),
    search: z.string().trim().optional(),
    includeDeleted: z.coerce.boolean().optional(),
  }),
});

export const subscriptionPlanIdValidationSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});
