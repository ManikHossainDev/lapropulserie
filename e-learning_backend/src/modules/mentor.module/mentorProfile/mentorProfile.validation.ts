import mongoose from 'mongoose';
import { z } from 'zod';
import { THaveAdminApproval, TMentorClass } from './mentorProfile.constant';

const objectIdSchema = z
  .string({
    required_error: 'id is required.',
    invalid_type_error: 'id must be a string.',
  })
  .refine(value => mongoose.Types.ObjectId.isValid(value), {
    message: 'id must be a valid mongoose ObjectId.',
  });

export const updateMentorProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    location: z.string().trim().optional(),
    classType: z.nativeEnum(TMentorClass).optional(),
    sessionPrice: z.number().nonnegative().optional(),
    currentJobTitle: z.string().trim().optional(),
    companyName: z.string().trim().optional(),
    yearsOfExperience: z.number().int().nonnegative().optional(),
    bio: z.string().trim().optional(),
    language: z.array(z.string().trim()).optional(),
    careerStage: z.array(z.string().trim()).optional(),
    focusArea: z.array(z.string().trim()).optional(),
    industry: z.array(z.string().trim()).optional(),
    coreValues: z.array(z.string().trim()).optional(),
    specialties: z.array(z.string().trim()).optional(),
    coachingMethodologies: z.array(z.string().trim()).optional(),
    calendlyProfileLink: z.string().trim().optional(),
  }),
});

export const mentorApprovalRequestValidationSchema = z.object({
  body: z.object({}).optional(),
});

export const adminMentorReviewListValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    search: z.string().trim().optional(),
    approvalStatus: z.nativeEnum(THaveAdminApproval).optional(),
    isLive: z.coerce.boolean().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const mentorProfileIdParamValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const adminMentorApprovalUpdateValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    approvalStatus: z.nativeEnum(THaveAdminApproval),
    interviewScheduledAt: z.string().optional(),
    rejectionReason: z.string().trim().optional(),
  }),
});
