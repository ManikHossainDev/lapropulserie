import mongoose from 'mongoose';
import { z } from 'zod';

export const createIndividualModuleValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'title is required',
      invalid_type_error: 'title must be a string',
    }),
    numberOfLessons: z.number({
      required_error: 'numberOfLessons is required',
      invalid_type_error: 'numberOfLessons must be a number',
    }).min(0, { message: 'numberOfLessons cannot be negative' }),
    estimatedTime: z.string({
      required_error: 'estimatedTime is required',
      invalid_type_error: 'estimatedTime must be a string',
    }),
    capsuleId: z.string({
      required_error: 'capsuleId is required',
      invalid_type_error: 'capsuleId must be a string',
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'capsuleId must be a valid mongoose ObjectId',
    }),
    orderNumber: z.number({
      required_error: 'orderNumber is required',
      invalid_type_error: 'orderNumber must be a number',
    }),
    thumbnail: z.string().optional(),
  }),
});

export const updateIndividualModuleValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    numberOfLessons: z.number().min(0).optional(),
    estimatedTime: z.string().optional(),
    capsuleId: z.string().refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'capsuleId must be a valid mongoose ObjectId',
    }).optional(),
    orderNumber: z.number().optional(),
    thumbnail: z.string().optional(),
  }),
});






