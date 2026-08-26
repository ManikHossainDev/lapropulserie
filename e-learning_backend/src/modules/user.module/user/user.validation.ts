//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { z } from 'zod';
import { TJourneyType, TStatusType } from './user.constant';

const objectIdSchema = z
  .string({
    required_error: 'id is required.',
    invalid_type_error: 'id must be a string.',
  })
  .refine(value => mongoose.Types.ObjectId.isValid(value), {
    message: 'id must be a valid mongoose ObjectId.',
  });

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
});

const optionalDateString = z
  .string()
  .refine(value => !Number.isNaN(Date.parse(value)), {
    message: 'Must be a valid date string.',
  })
  .optional();

export const sendInvitationToBeAdminValidationSchema = z.object({

  body: z.object({
    email : z.
      string({
        required_error: 'email is required.',
        invalid_type_error: 'email must be a string.',
      })
      .email('Invalid email address.'),
    password : z
      .string({
        required_error: 'password is required.',
        invalid_type_error: 'password must be a string.',
      }),
      
    name: z.string({
      required_error: 'name is required.',
      invalid_type_error: 'name must be a string.',
    }),
  
    role :  z.string({
        required_error: 'role is required.',
        invalid_type_error: 'role must be a string.',
      }),
    message :  z.string({
        required_error: 'message is required.',
        invalid_type_error: 'message must be a string.',
      })
    
    }),
});

export const adminUserManagementListValidationSchema = z.object({
  query: paginationQuerySchema.extend({
    search: z.string().trim().optional(),
    role: z.enum(['student', 'mentor', 'admin']).optional(),
    status: z.nativeEnum(TStatusType).optional(),
    journeyType: z.nativeEnum(TJourneyType).optional(),
    isDeleted: z.coerce.boolean().optional(),
    from: optionalDateString,
    to: optionalDateString,
  }),
});

export const adminUserManagementIdValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const adminUserStatusUpdateValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.nativeEnum(TStatusType),
  }),
});

export const adminUserJourneyTypeUpdateValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    journeyType: z.nativeEnum(TJourneyType),
  }),
});

export const updateProfileInfoValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().trim().email().optional(),
    phoneNumber: z.string().optional(),
    profileImage: z.array(z.string()).optional(),
    location: z.string().optional(),
    dob: z.string().optional(),
    gender: z.string().optional(),
  }),
});
