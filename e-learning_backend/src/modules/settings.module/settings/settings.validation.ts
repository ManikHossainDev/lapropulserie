//@ts-ignore
import { z } from 'zod';
import {
  editableSettingsTypes,
  settingsTypeSlugMap,
} from './settings.constant';

export const updateSettingsContentValidationSchema = z.object({
  body: z.object({
    content: z
      .string({
        required_error: 'content is required.',
        invalid_type_error: 'content must be a string.',
      })
      .trim()
      .min(1, 'content cannot be empty.'),
  }),
});

export const settingsLegacyTypeQueryValidationSchema = z.object({
  query: z.object({
    type: z.enum(editableSettingsTypes),
  }),
});

export const settingsSlugParamValidationSchema = z.object({
  params: z.object({
    slug: z.enum(Object.keys(settingsTypeSlugMap) as [string, ...string[]]),
  }),
});
