import mongoose from 'mongoose';
import { z } from 'zod';

// ── Part sub-schemas ──────────────────────────────────────────────────────────

/** Admin sends string URL, { url, status }, or null (clear). */
const videoFieldSchema = z
  .union([
    z.string(),
    z.object({
      url: z.string().optional(),
      status: z.enum(['processing', 'ready', 'failed']).optional(),
      duration: z.number().optional(),
      errorMessage: z.string().optional(),
    }),
    z.null(),
  ])
  .optional();

const introductionSchema = z.object({
  title: z.string().optional(),
  founderVideo: videoFieldSchema,
  text: z.string().optional(),
}).optional();

const inspirationSchema = z.object({
  title: z.string().optional(),
  inspirationVideo: videoFieldSchema,
  text: z.string().optional(),
}).optional();

const reflectionSchema = z.object({
  title: z.string().optional(),
  instructions: z.string().optional(),
  questions: z.array(z.object({
    question: z.string({ required_error: 'question text is required' }),
    orderNumber: z.number({ required_error: 'orderNumber is required' }),
  })).max(10, { message: 'reflection questions cannot exceed 10' }).optional(),
}).optional();

const practicalSchema = z.object({
  title: z.string().optional(),
  exercises: z.array(z.object({
    exercise: z.string({ required_error: 'exercise text is required' }),
    orderNumber: z.number({ required_error: 'orderNumber is required' }),
  })).optional(),
}).optional();

const scienceSchema = z.object({
  title: z.string().optional(),
  text: z.string().optional(),
  optionalVideo: videoFieldSchema,
}).optional();

// ── Main schemas ──────────────────────────────────────────────────────────────

export const createIndividualCapsuleValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'title is required',
      invalid_type_error: 'title must be a string',
    }),
    capsuleCategoryId: z.string({
      required_error: 'capsuleCategoryId is required',
      invalid_type_error: 'capsuleCategoryId must be a string',
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'capsuleCategoryId must be a valid mongoose ObjectId',
    }),
    // Legacy commercial fields — optional; inherited from category when omitted
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    description: z.string().optional(),
    about: z.string().optional(),
    numberOfModules: z.number().min(0).optional(),
    price: z.number().optional(),
    whatYouLearn: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    capsuleType: z.enum(['free', 'regular']).optional(),
    // ── 6-Part journey fields (all optional on create) ──────────────────────
    introduction: introductionSchema,
    inspiration: inspirationSchema,
    reflection: reflectionSchema,
    practicalExercises: practicalSchema,
    science: scienceSchema,
  }),
});

export const updateIndividualCapsuleValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    capsuleCategoryId: z.string().refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'capsuleCategoryId must be a valid mongoose ObjectId',
    }).optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    description: z.string().optional(),
    about: z.string().optional(),
    numberOfModules: z.number().min(0).optional(),
    price: z.number().optional(),
    whatYouLearn: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    capsuleType: z.enum(['free', 'regular']).optional(),
    // ── 6-Part journey fields ────────────────────────────────────────────────
    introduction: introductionSchema,
    inspiration: inspirationSchema,
    reflection: reflectionSchema,
    practicalExercises: practicalSchema,
    science: scienceSchema,
  }),
});
