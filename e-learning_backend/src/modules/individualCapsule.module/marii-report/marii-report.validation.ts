import mongoose from 'mongoose';
import { z } from 'zod';

const capsuleIdField = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  'Invalid capsule ID',
);

const journeyIdField = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  'Invalid journey ID',
);

export const generateMariiReportValidation = z.object({
  body: z.object({
    capsuleId: capsuleIdField,
    journeyId: journeyIdField.optional(),
  }),
});

export const autoGenerateMariiReportValidation = z.object({
  body: z.object({
    capsuleId: capsuleIdField,
    journeyId: journeyIdField.optional(),
  }),
});

export const generateExpeditionMariiValidation = z.object({
  body: z.object({
    journeyId: journeyIdField,
  }),
});

export const getExpeditionMariiValidation = z.object({
  params: z.object({
    journeyId: journeyIdField,
  }),
});

export const getMariiReportByCapsuleValidation = z.object({
  params: z.object({
    capsuleId: capsuleIdField,
  }),
});
