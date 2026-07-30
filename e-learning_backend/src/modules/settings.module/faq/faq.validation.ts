import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid mongoose ObjectId',
});

export const createFaqValidationSchema = z.object({
  body: z.object({
    faqCategoryId: objectIdSchema.refine((value) => mongoose.Types.ObjectId.isValid(value), {
      message: 'Invalid faqCategoryId',
    }),
    question: z
      .string({
        required_error: 'question is required',
        invalid_type_error: 'question must be a string',
      })
      .min(5, { message: 'question must be at least 5 characters long' })
      .max(500, { message: 'question must be at most 500 characters' }),
    answer: z
      .string({
        required_error: 'answer is required',
        invalid_type_error: 'answer must be a string',
      })
      .min(5, { message: 'answer must be at least 5 characters long' })
      .max(2000, { message: 'answer must be at most 2000 characters' }),
  }),
});

export const updateFaqValidationSchema = z.object({
  body: z.object({
    faqCategoryId: objectIdSchema.optional(),
    question: z
      .string({
        required_error: 'question is required',
        invalid_type_error: 'question must be a string',
      })
      .min(5, { message: 'question must be at least 5 characters long' })
      .max(500, { message: 'question must be at most 500 characters' })
      .optional(),
    answer: z
      .string({
        required_error: 'answer is required',
        invalid_type_error: 'answer must be a string',
      })
      .min(5, { message: 'answer must be at least 5 characters long' })
      .max(2000, { message: 'answer must be at most 2000 characters' })
      .optional(),
  }),
});

export const faqIdValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const faqCategoryIdParamValidationSchema = z.object({
  params: z.object({
    categoryId: objectIdSchema,
  }),
});

const faqItemSchema = z.object({
  _id: objectIdSchema.optional(),
  question: z
    .string({
      required_error: 'question is required',
    })
    .min(5)
    .max(500),
  answer: z
    .string({
      required_error: 'answer is required',
    })
    .min(5)
    .max(2000),
});

export const bulkFaqValidationSchema = z.object({
  body: z.object({
    faqCategoryId: objectIdSchema,
    faqs: z.array(faqItemSchema).min(1, { message: 'At least one FAQ is required' }),
  }),
});

export const bulkUpdateFaqValidationSchema = z.object({
  body: z.object({
    faqs: z.array(faqItemSchema).min(1, { message: 'At least one FAQ is required' }),
  }),
});


