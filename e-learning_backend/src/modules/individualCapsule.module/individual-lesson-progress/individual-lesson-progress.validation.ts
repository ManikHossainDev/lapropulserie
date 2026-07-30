import mongoose from 'mongoose';
import { z } from 'zod';

export const updateLessonProgressValidationSchema = z.object({
  body: z.object({
    lessonId: z
      .string({
        required_error: 'lessonId is required.',
        invalid_type_error: 'lessonId must be a string.',
      })
      .refine((value) => mongoose.Types.ObjectId.isValid(value), {
        message: 'lessonId must be a valid ObjectId.',
      }),
    watchTime: z
      .number({
        required_error: 'watchTime is required.',
        invalid_type_error: 'watchTime must be a number.',
      })
      .optional(),
  }),
});
