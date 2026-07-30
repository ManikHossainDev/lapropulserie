//@ts-ignore
import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required.',
        invalid_type_error: 'Name must be a string.',
      })
      .min(2, 'Name must be at least 2 characters long.'),
    email: z
      .string({
        required_error: 'Email is required.',
        invalid_type_error: 'Email must be a string.',
      })
      .email('Invalid email address.'),
    password: z
      .string({
        required_error: 'Password is required.',
        invalid_type_error: 'Password must be a string.',
      })
      .min(8, 'Password must be at least 8 characters long.'),
    role: z.enum(['student', 'mentor'], {
      required_error: 'Role is required.',
      invalid_type_error: 'Role must be a string.',
    }),
    acceptTOC: z.boolean({
      required_error: 'Terms acceptance is required.',
      invalid_type_error: 'acceptTOC must be a boolean.',
    }),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required.',
        invalid_type_error: 'Email must be a string.',
      })
      .email('Invalid email address.'),

    password: z
      .string({
        required_error: 'Password is required.',
        invalid_type_error: 'Password must be a string.',
      })
      .min(8, 'Password must be at least 8 characters long.'),

    fcmToken: z
      .string({
        required_error: 'Fcm token is required.',
        invalid_type_error: 'Fcm token must be a string.',
      })
      .optional(),
    rememberMe: z
      .boolean({
        invalid_type_error: 'rememberMe must be a boolean.',
      })
      .optional(),
  }),
});


const googleLoginValidationSchema = z.object({
  googleId: z.string({
    required_error: 'Google ID is required.',
    invalid_type_error: 'Google ID must be a string.',
  }),
  email: z
    .string({
      required_error: 'Email is required.',
      invalid_type_error: 'Email must be a string.',
    })
    .email('Invalid email address.'),
  googleAccessToken: z.string({
    required_error: 'Google Access Token is required.',
    invalid_type_error: 'Google Access Token must be a string.',
  }),
});

const appleLoginValidationSchema = z.object({
  appleId: z.string({
    required_error: 'Apple ID is required.',
    invalid_type_error: 'Apple ID must be a string.',
  }),
  email: z
    .string({
      required_error: 'Email is required.',
      invalid_type_error: 'Email must be a string.',
    })
    .email('Invalid email address.'),
  appleAccessToken: z.string({
    required_error: 'Apple Access Token is required.',
    invalid_type_error: 'Apple Access Token must be a string.',
  }),
});


const verifyEmailValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required.',
        invalid_type_error: 'Email must be a string.',
      })
      .email('Invalid email address.'),
    otp: z
      .string({
        required_error: 'One time code is required.',
        invalid_type_error: 'One time code must be a string.',
      })
      .min(6, 'One time code must be at least 6 characters long.'),
    token: z
      .string({
        required_error: 'Verification token is required.',
        invalid_type_error: 'Verification token must be a string.',
      })
      .min(10, 'Verification token is invalid.'),
  }),
});

const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required.',
        invalid_type_error: 'Email must be a string.',
      })
      .email('Invalid email address.'),
  }),
});

const resendOtpValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required.',
        invalid_type_error: 'Email must be a string.',
      })
      .email('Invalid email address.'),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required.',
        invalid_type_error: 'Email must be a string.',
      })
      .email('Invalid email address.'),
    password: z
      .string({
        required_error: 'Password is required.',
        invalid_type_error: 'Password must be a string.',
      })
      .min(8, 'Password must be at least 8 characters long.'),
    otp: z
      .string({
        required_error: 'One time code is required.',
        invalid_type_error: 'One time code must be a string.',
      })
      .min(6, 'One time code must be at least 6 characters long.'),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({
        required_error: 'Old password is required.',
        invalid_type_error: 'Old password must be a string.',
      })
      .min(8, 'Old password must be at least 8 characters long.'),
    newPassword: z
      .string({
        required_error: 'New password is required.',
        invalid_type_error: 'New password must be a string.',
      })
      .min(8, 'New password must be at least 8 characters long.'),
  }),
});

const refreshTokenValidationSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

const onboardingAnswerValidationSchema = z.object({
  body: z.object({
    phaseId: z
      .string({
        required_error: 'phaseId is required.',
        invalid_type_error: 'phaseId must be a string.',
      })
      .min(1, 'phaseId is required.'),
    questionId: z
      .string({
        required_error: 'questionId is required.',
        invalid_type_error: 'questionId must be a string.',
      })
      .min(1, 'questionId is required.'),
    answer_value: z
      .string({
        required_error: 'answer_value is required.',
        invalid_type_error: 'answer_value must be a string.',
      })
      .min(1, 'answer_value is required.'),
    answer_type: z.enum(['text', 'number', 'single', 'multi'], {
      required_error: 'answer_type is required.',
      invalid_type_error: 'answer_type must be a string.',
    }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  appleLoginValidationSchema,
  googleLoginValidationSchema,
  verifyEmailValidationSchema,
  forgotPasswordValidationSchema,
  resendOtpValidationSchema,
  resetPasswordValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  onboardingAnswerValidationSchema,
};
