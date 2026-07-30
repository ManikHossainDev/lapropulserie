import mongoose from 'mongoose';
import { z } from 'zod';
import { TQuestionaryCategory, TQuestionType } from './question.constant';
import { isValidOptionalObjectIdString } from './question.utils';

const requiredObjectIdSchema = (fieldName: string) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: `${fieldName} must be a valid mongoose ObjectId.`,
    });

const optionalObjectIdSchema = (fieldName: string) =>
  z.string().optional().refine(isValidOptionalObjectIdString, {
    message: `${fieldName} must be a valid mongoose ObjectId.`,
  });

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

const createQuestionarySchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    brief: z.string({ required_error: 'Brief is required' }),
    category: z.nativeEnum(TQuestionaryCategory, { required_error: 'Category is required' }),
    referenceId: optionalObjectIdSchema('referenceId'),
    questions: z.array(questionSchema).optional().default([]),
  }),
});

const updateQuestionOptionSchema = z.object({
  sl: z.number({ required_error: 'option sl is required' }),
  details: z.string().optional(),
  isCorrect: z.boolean().optional(),
});

const updateQuestionSchema = z.object({
  id: optionalObjectIdSchema('id'),
  sl: z.number().optional(),
  title: z.string().optional(),
  type: z.nativeEnum(TQuestionType).optional(),
  helperText: z.string().optional(),
  options: z.array(updateQuestionOptionSchema).optional(),
});

const updateQuestionarySchema = z.object({
  params: z.object({
    id: requiredObjectIdSchema('id'),
  }),
  body: z.object({
    title: z.string().optional(),
    brief: z.string().optional(),
    category: z.nativeEnum(TQuestionaryCategory).optional(),
    referenceId: optionalObjectIdSchema('referenceId'),
    questions: z.object({
      create: z.array(questionSchema).optional(),
      update: z.array(updateQuestionSchema).optional(),
      delete: z.array(requiredObjectIdSchema('questionId')).optional(),
    }).optional(),
  }),
});

const questionaryIdParamSchema = z.object({
  params: z.object({
    id: requiredObjectIdSchema('id'),
  }),
});

const studentQuestionaryDetailsSchema = z.object({
  params: z.object({
    questionaryId: requiredObjectIdSchema('questionaryId'),
  }),
});

const submitStudentAnswerSchema = z.object({
  params: z.object({
    questionaryId: requiredObjectIdSchema('questionaryId'),
    questionId: requiredObjectIdSchema('questionId'),
  }),
  body: z.object({
    answer: z.any({ required_error: 'answer is required' }),
    capsuleId: optionalObjectIdSchema('capsuleId'),
  }),
});

const answerItemSchema = z.object({
  questionId: requiredObjectIdSchema('questionId'),
  answer: z.any({ required_error: 'answer is required' }),
  capsuleId: optionalObjectIdSchema('capsuleId'),
});

const submitBulkAnswersSchema = z.object({
  params: z.object({
    questionaryId: requiredObjectIdSchema('questionaryId'),
  }),
  body: z.object({
    answers: z.array(answerItemSchema).min(1, { message: 'At least one answer is required' }),
  }),
});

export const QuestionValidation = {
  createQuestionarySchema,
  updateQuestionarySchema,
  questionaryIdParamSchema,
  studentQuestionaryDetailsSchema,
  submitStudentAnswerSchema,
  submitBulkAnswersSchema,
};
