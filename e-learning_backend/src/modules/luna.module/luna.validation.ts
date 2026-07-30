import mongoose from 'mongoose';
import { z } from 'zod';

export const lunaChatValidation = z.object({
  body: z.object({
    capsuleId: z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), 'Invalid capsule ID'),
    step: z.number().min(1).max(6),
    message: z.string().max(2000).optional(),
  }),
});
