import { z } from 'zod';

export const createIndividualCapsuleCategoryValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'title is required',
      invalid_type_error: 'title must be a string',
    }),
    description: z.string({
      required_error: 'description is required',
      invalid_type_error: 'description must be a string',
    }),
    about: z.string({
      required_error: 'about is required',
      invalid_type_error: 'about must be a string',
    }),
    thumbnail: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced'], {
      required_error: 'level is required',
    }),
    estimatedDuration: z.number({
      required_error: 'estimatedDuration is required',
    }).min(0, { message: 'estimatedDuration cannot be negative' }),
    price: z.number().min(0).optional(),
    sellIndividually: z.boolean().optional(),
    whatYouLearn: z.array(z.string()).optional(),
    capsuleType: z.enum(['free', 'regular']).optional(),
  }),
});

export const updateIndividualCapsuleCategoryValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    about: z.string().optional(),
    thumbnail: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    estimatedDuration: z.number().min(0).optional(),
    price: z.number().min(0).optional(),
    sellIndividually: z.boolean().optional(),
    whatYouLearn: z.array(z.string()).optional(),
    capsuleType: z.enum(['free', 'regular']).optional(),
  }),
});
