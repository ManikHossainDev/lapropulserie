import mongoose from 'mongoose';
import { z } from 'zod';
import { TCurrentSection, TTrackerStatus } from './journey-progress-tracker.constant';

export const initializeTrackerSchema = z.object({
  body: z.object({
    journeyId: z.string({
      required_error: 'journeyId is required',
    }).refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'journeyId must be a valid ObjectId',
    }),
    capsuleId: z.string({
      required_error: 'capsuleId is required',
    }).refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'capsuleId must be a valid ObjectId',
    }),
  }),
});

export const updateSectionStatusSchema = z.object({
  body: z.object({
    capsuleId: z.string({
      required_error: 'capsuleId is required',
    }).refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'capsuleId must be a valid ObjectId',
    }),
    section: z.enum([
      TCurrentSection.introduction,
      TCurrentSection.inspiration,
      TCurrentSection.diagnostics,
      TCurrentSection.science,
      TCurrentSection.aiSummary,
    ], {
      required_error: 'section is required',
    }),
    status: z.enum([
      TTrackerStatus.notStarted,
      TTrackerStatus.inProgress,
      TTrackerStatus.completed,
    ], {
      required_error: 'status is required',
    }),
  }),
});

export const updateModuleProgressSchema = z.object({
  body: z.object({
    capsuleId: z.string({
      required_error: 'capsuleId is required',
    }).refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'capsuleId must be a valid ObjectId',
    }),
    moduleId: z.string({
      required_error: 'moduleId is required',
    }).refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'moduleId must be a valid ObjectId',
    }),
    status: z.enum([
      TTrackerStatus.notStarted,
      TTrackerStatus.inProgress,
      TTrackerStatus.completed,
    ], {
      required_error: 'status is required',
    }),
    lastWatchTime: z.number().optional(),
  }),
});

export const updateLastAccessedSchema = z.object({
  body: z.object({
    capsuleId: z.string({
      required_error: 'capsuleId is required',
    }).refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'capsuleId must be a valid ObjectId',
    }),
    itemType: z.enum(['module', 'lesson'], {
      required_error: 'itemType is required',
    }),
    itemId: z.string({
      required_error: 'itemId is required',
    }).refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'itemId must be a valid ObjectId',
    }),
    lastWatchTime: z.number().optional(),
  }),
});
