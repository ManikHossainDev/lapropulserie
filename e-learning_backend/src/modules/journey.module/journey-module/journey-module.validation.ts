import mongoose from 'mongoose';
import { z } from 'zod';
import { TQuestionType } from '../../question.module/question.constant';

const questionOptionSchema = z.object({
  sl: z.number({ required_error: 'option sl is required' }),
  details: z.string({ required_error: 'option details is required' }),
  isCorrect: z.boolean().optional().default(false),
});

const questionSchema = z.object({
  sl: z.number({ required_error: 'question sl is required' }),
  title: z.string({ required_error: 'question title is required' }),
  type: z.nativeEnum(TQuestionType, { required_error: 'question type is required' }),
  helperText: z.string().optional(),
  options: z.array(questionOptionSchema).optional().default([]),
});

export const createJourneyModuleValidationSchema = z.object({
  body: z.object({
    sl: z.number({ required_error: 'sl is required' }),
    title: z.string({ required_error: 'title is required' }),
    roadMapBrief: z.string({ required_error: 'roadMapBrief is required' }),
    description: z.string({ required_error: 'description is required' }),
    estimatedTime: z.string({ required_error: 'estimatedTime is required' }),
    capsuleId: z
      .string({ required_error: 'capsuleId is required' })
      .refine((value) => mongoose.Types.ObjectId.isValid(value), {
        message: 'capsuleId must be a valid mongoose ObjectId.',
      }),
    orderNumber: z.number({ required_error: 'orderNumber is required' }),
    lessons: z
      .array(
        z.object({
          sl: z.number({ required_error: 'lesson sl is required' }),
          title: z.string({ required_error: 'lesson title is required' }),
          description: z.string().optional(),
          estimatedTime: z.string({ required_error: 'lesson estimatedTime is required' }),
          orderNumber: z.number({ required_error: 'lesson orderNumber is required' }),
        })
      )
      .optional(),
    question: z
      .object({
        title: z.string({ required_error: 'question title is required' }),
        roadmap_brief: z.string({ required_error: 'roadmap_brief is required' }),
        questions: z.array(questionSchema).optional().default([]),
      })
      .optional(),
  }),
});

export const updateJourneyModuleValidationSchema = z.object({
  body: z.object({
    sl: z.number().optional(),
    title: z.string().optional(),
    roadMapBrief: z.string().optional(),
    description: z.string().optional(),
    estimatedTime: z.string().optional(),
    capsuleId: z
      .string()
      .refine((value) => mongoose.Types.ObjectId.isValid(value), {
        message: 'capsuleId must be a valid mongoose ObjectId.',
      })
      .optional(),
    orderNumber: z.number().optional(),
    lessons: z
      .array(
        z.object({
          _id: z.string().optional(),
          sl: z.number().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
          estimatedTime: z.string().optional(),
          orderNumber: z.number().optional(),
        })
      )
      .optional(),
    question: z
      .object({
        title: z.string().optional(),
        roadmap_brief: z.string().optional(),
        questions: z.array(questionSchema).optional(),
      })
      .optional(),
  }),
});
