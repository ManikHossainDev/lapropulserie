import mongoose from 'mongoose';
import { z } from 'zod';

export const createIndividualCapsuleReviewValidationSchema = z.object({
  body: z.object({
    capsuleId: z
      .string({
        required_error: 'capsuleId is required',
        invalid_type_error: 'capsuleId must be a string',
      })
      .refine((value) => mongoose.Types.ObjectId.isValid(value), {
        message: 'capsuleId must be a valid mongoose ObjectId',
      }),
    review: z
      .string({
        required_error: 'review is required',
        invalid_type_error: 'review must be a string',
      })
      .min(5, {
        message: 'review must be at least 5 characters long',
      })
      .max(500, {
        message: 'review must be at most 500 characters long',
      }),
    rating: z
      .number({
        required_error: 'rating is required',
        invalid_type_error: 'rating must be a number',
      })
      .min(1, { message: 'rating must be at least 1' })
      .max(5, { message: 'rating must be at most 5' }),
  }),
});

export const updateIndividualCapsuleReviewValidationSchema = z.object({
  body: z.object({
    review: z
      .string({
        invalid_type_error: 'review must be a string',
      })
      .min(5, {
        message: 'review must be at least 5 characters long',
      })
      .max(500, {
        message: 'review must be at most 500 characters long',
      })
      .optional(),
    rating: z
      .number({
        invalid_type_error: 'rating must be a number',
      })
      .min(1, { message: 'rating must be at least 1' })
      .max(5, { message: 'rating must be at most 5' })
      .optional(),
  }),
});
