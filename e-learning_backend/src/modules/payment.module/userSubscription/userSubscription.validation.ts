import mongoose from 'mongoose';
import { z } from 'zod';
import { TUserSubscriptionStatus } from './userSubscription.constant';

const objectIdSchema = z.string().refine(value => mongoose.Types.ObjectId.isValid(value), {
  message: 'id must be a valid mongoose ObjectId.',
});

export const createCheckoutSessionValidationSchema = z.object({
  body: z.object({
    subscriptionPlanId: objectIdSchema,
  }),
});

export const adminUserSubscriptionListValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    status: z.nativeEnum(TUserSubscriptionStatus).optional(),
    search: z.string().trim().optional(),
  }),
});

export const userSubscriptionIdValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
