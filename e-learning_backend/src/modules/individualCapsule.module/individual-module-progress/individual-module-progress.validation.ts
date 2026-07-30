import mongoose from 'mongoose';
import { z } from 'zod';

export const createIndividualModuleProgressValidationSchema = z.object({
  body: z.object({
    studentId: z.string({
      required_error: 'studentId is required',
      invalid_type_error: 'studentId must be a string',
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'studentId must be a valid mongoose ObjectId',
    }),
    moduleId: z.string({
      required_error: 'moduleId is required',
      invalid_type_error: 'moduleId must be a string',
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'moduleId must be a valid mongoose ObjectId',
    }),
    capsuleId: z.string({
      required_error: 'capsuleId is required',
      invalid_type_error: 'capsuleId must be a string',
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'capsuleId must be a valid mongoose ObjectId',
    }),
    status: z.enum(['notStarted', 'inProgress', 'completed', 'unlocked', 'locked']),
    completedLessonsCount: z.number().optional(),
    totalLessons: z.number().optional(),
  }),
});

export const updateIndividualModuleProgressValidationSchema = z.object({
  body: z.object({
    status: z.enum(['notStarted', 'inProgress', 'completed', 'unlocked', 'locked']).optional(),
    completedLessonsCount: z.number().optional(),
    totalLessons: z.number().optional(),
    completedAt: z.string().optional(),
  }),
});






