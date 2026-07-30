import mongoose from 'mongoose';
import { z } from 'zod';

export const createFaqCategoryValidationSchema = z.object({
  body: z.object({
    categoryName: z
      .string({
        required_error: 'categoryName is required',
        invalid_type_error: 'categoryName must be a string',
      })
      .min(1, { message: 'categoryName cannot be empty' })
      .max(100, { message: 'categoryName must be at most 100 characters' }),
  }),
});

export const updateFaqCategoryValidationSchema = z.object({
  body: z.object({
    categoryName: z
      .string({
        required_error: 'categoryName is required',
        invalid_type_error: 'categoryName must be a string',
      })
      .min(1, { message: 'categoryName cannot be empty' })
      .max(100, { message: 'categoryName must be at most 100 characters' })
      .optional(),
  }),
});

export const faqCategoryIdValidationSchema = z.object({
  params: z.object({
    id: z.string().refine((value) => {
      return mongoose.Types.ObjectId.isValid(value);
    }, {
      message: 'Invalid FAQ category ID',
    }),
  }),
});
