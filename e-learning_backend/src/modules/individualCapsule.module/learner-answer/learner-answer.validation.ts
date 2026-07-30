import mongoose from 'mongoose';
import { z } from 'zod';

const answerItemSchema = z.object({
  orderNumber: z.number().int().min(1, 'orderNumber must be at least 1'),
  answer: z.string(),
});

export const saveLearnerAnswersValidation = z.object({
  body: z.object({
    capsuleId: z.string().refine(
      (val) => mongoose.Types.ObjectId.isValid(val),
      'Invalid capsule ID',
    ),
    journeyId: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid journey ID')
      .optional(),
    reflectionAnswers: z.array(answerItemSchema).optional(),
    exerciseAnswers: z.array(answerItemSchema).optional(),
  }).refine(
    (data) =>
      (data.reflectionAnswers?.length ?? 0) > 0 ||
      (data.exerciseAnswers?.length ?? 0) > 0,
    { message: 'At least one reflection or exercise answer is required' },
  ),
});

export const getLearnerAnswersByCapsuleValidation = z.object({
  params: z.object({
    capsuleId: z.string().refine(
      (val) => mongoose.Types.ObjectId.isValid(val),
      'Invalid capsule ID',
    ),
  }),
  query: z.object({
    journeyId: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid journey ID')
      .optional(),
  }).optional(),
});
