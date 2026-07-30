import { z } from 'zod';

export const recommendFriendValidation = z.object({
  body: z.object({
    friendName: z.string().trim().min(1, 'Friend name is required').max(100),
    friendEmail: z.string().trim().email('Valid email is required').max(200),
    senderName: z.string().trim().max(100).optional(),
  }),
});
