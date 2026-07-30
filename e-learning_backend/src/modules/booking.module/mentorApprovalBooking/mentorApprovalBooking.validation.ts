import mongoose from 'mongoose';
import { z } from 'zod';
import { TMentorApprovalBookingStatus } from './mentorApprovalBooking.constant';

const objectIdSchema = z
  .string({
    required_error: 'id is required.',
    invalid_type_error: 'id must be a string.',
  })
  .refine(value => mongoose.Types.ObjectId.isValid(value), {
    message: 'id must be a valid mongoose ObjectId.',
  });

export const adminMentorApprovalBookingListValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    search: z.string().trim().optional(),
    status: z.nativeEnum(TMentorApprovalBookingStatus).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const mentorApprovalBookingIdValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const updateMentorApprovalBookingStatusValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.nativeEnum(TMentorApprovalBookingStatus),
    interviewScheduledAt: z.string().optional(),
    rejectionReason: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  }),
});
