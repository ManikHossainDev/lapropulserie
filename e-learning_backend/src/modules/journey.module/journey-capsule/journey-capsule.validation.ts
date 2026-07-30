import mongoose from 'mongoose';
import { z } from 'zod';

export const createJourneyCapsuleValidation = z.object({
  body: z.object({
    journeyId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid journey ID'),
    individualCapsuleId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid capsule ID').optional(),
    individualCapsuleIds: z.array(
      z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid capsule ID'),
    ).optional(),
    title: z.string().min(1, 'Title is required').optional(),
    roadMapBrief: z.string().min(1, 'Roadmap brief is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    estimatedTime: z.string().min(1, 'Estimated time is required').optional(),
    totalModule: z.number().min(0, 'Total modules cannot be negative').optional(),
    introduction: z.object({
      title: z.string().min(1, 'Introduction title is required'),
      estimatedTime: z.string().min(1, 'Introduction estimated time is required'),
      roadMapBrief: z.string().min(1, 'Introduction roadmap brief is required'),
      description: z.string().min(1, 'Introduction description is required'),
    }).optional(),
  }).refine(
    (data) => data.individualCapsuleId || data.individualCapsuleIds?.length || data.title,
    { message: 'Provide individualCapsuleId(s) or legacy capsule fields' },
  ),
});

export const updateCapsuleOrderValidation = z.object({
  body: z.object({
    journeyId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid journey ID'),
    capsules: z.array(z.object({
      id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid capsule ID'),
      capsuleNumber: z.number().min(1, 'capsuleNumber must be at least 1'),
    })).min(1, 'At least one capsule is required'),
  }),
});

export const updateJourneyCapsuleValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    roadMapBrief: z.string().min(1, 'Roadmap brief is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    estimatedTime: z.string().min(1, 'Estimated time is required').optional(),
    totalModule: z.number().min(0).optional(),
    introduction: z.object({
      title: z.string().min(1).optional(),
      estimatedTime: z.string().min(1).optional(),
      roadMapBrief: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
    }).optional(),
  }),
});
