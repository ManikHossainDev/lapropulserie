import mongoose from 'mongoose';
import { z } from 'zod';

export const giftCapsuleValidationSchema = z.object({
  body: z.object({
    studentId: z
      .string({
        required_error: 'studentId is required.',
        invalid_type_error: 'studentId must be a string.',
      })
      .refine((value) => mongoose.Types.ObjectId.isValid(value), {
        message: 'studentId must be a valid ObjectId.',
      }),

    capsuleId: z
      .string({
        required_error: 'capsuleId is required.',
        invalid_type_error: 'capsuleId must be a string.',
      })
      .refine((value) => mongoose.Types.ObjectId.isValid(value), {
        message: 'capsuleId must be a valid ObjectId.',
      }),
  }),
});
