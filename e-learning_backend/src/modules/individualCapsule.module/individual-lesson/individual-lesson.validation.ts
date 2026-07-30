import mongoose from 'mongoose';
import { z } from 'zod';

export const createIndividualLessonValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'title is required',
      invalid_type_error: 'title must be a string',
    }),
    estimatedTime: z.string({
      required_error: 'estimatedTime is required',
      invalid_type_error: 'estimatedTime must be a string',
    }),
    moduleId: z.string({
      required_error: 'moduleId is required',
      invalid_type_error: 'moduleId must be a string',
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'moduleId must be a valid mongoose ObjectId',
    }),
    orderNumber: z.number({
      required_error: 'orderNumber is required',
      invalid_type_error: 'orderNumber must be a number',
    }),
    lessonVideo: z.string().optional(),
  }),
});

export const updateIndividualLessonValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    estimatedTime: z.string().optional(),
    moduleId: z.string().refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'moduleId must be a valid mongoose ObjectId',
    }).optional(),
    orderNumber: z.number().optional(),
    lessonVideo: z.string().optional(),
  }),
});






