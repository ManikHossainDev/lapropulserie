/**
 * Authentication Routes Module
 *
 * This module defines all authentication-related endpoints including:
 * - User registration and login
 * - OAuth authentication (Google, Apple)
 * - Password management (forgot, reset, change)
 * - Email verification
 * - Token refresh
 * - User onboarding
 *
 * Security Features:
 * - Rate limiting on sensitive endpoints
 * - Input validation using Zod schemas
 * - Authentication middleware for protected routes
 * - Role-based access control
 *
 * @module AuthRoutes
 */

import { Router } from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../shared/validateRequest';
import { AuthValidation } from './auth.validations';
import auth from '../../middlewares/auth';
import { TRole } from '../../middlewares/roles';
import { authRateLimiter } from './auth.rateLimiter';

const router = Router();

// ============================================================================
// PUBLIC AUTHENTICATION ROUTES
// ============================================================================

/**
 * @route POST /auth/register
 * @description Register a new user account
 * @access Public
 * @rateLimit 5 requests per minute per email/IP combination
 * @validation AuthValidation.registerValidationSchema
 * @returns {Object} Created user data and verification token
 */
router.post(
  '/register',
  authRateLimiter,
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register,
);

/**
 * @route POST /auth/login
 * @description Authenticate user with email and password
 * @access Public
 * @rateLimit 5 requests per minute per email/IP combination
 * @validation AuthValidation.loginValidationSchema
 * @returns {Object} User data and authentication tokens
 */
router.post(
  '/login',
  authRateLimiter,
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

/**
 * @route POST /auth/google/callback
 * @description Authenticate user with Google OAuth
 * @access Public
 * @validation AuthValidation.googleLoginValidationSchema
 * @returns {Object} User data and authentication tokens
 */
router.post(
  '/google/callback',
  validateRequest(AuthValidation.googleLoginValidationSchema),
  AuthController.googleAuthCallback,
);

/**
 * @route POST /auth/apple/callback
 * @description Authenticate user with Apple OAuth
 * @access Public
 * @validation AuthValidation.appleLoginValidationSchema
 * @returns {Object} User data and authentication tokens
 */
router.post(
  '/apple/callback',
  validateRequest(AuthValidation.appleLoginValidationSchema),
  AuthController.appleAuthCallback,
);

/**
 * @route POST /auth/forgot-password
 * @description Request password reset OTP
 * @access Public
 * @rateLimit 5 requests per minute per email/IP combination
 * @validation AuthValidation.forgotPasswordValidationSchema
 * @returns {Object} Reset password token
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

/**
 * @route POST /auth/resend-otp
 * @description Resend OTP for email verification or password reset
 * @access Public
 * @rateLimit 5 requests per minute per email/IP combination
 * @validation AuthValidation.resendOtpValidationSchema
 * @returns {Object} Verification or reset token
 */
router.post(
  '/resend-otp',
  authRateLimiter,
  validateRequest(AuthValidation.resendOtpValidationSchema),
  AuthController.resendOtp,
);

/**
 * @route POST /auth/reset-password
 * @description Reset user password with OTP
 * @access Public
 * @rateLimit 5 requests per minute per email/IP combination
 * @validation AuthValidation.resetPasswordValidationSchema
 * @returns {Object} Sanitized user data
 */
router.post(
  '/reset-password',
  authRateLimiter,
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword,
);

/**
 * @route POST /auth/verify-email
 * @description Verify user email with OTP and token
 * @access Public
 * @rateLimit 5 requests per minute per email/IP combination
 * @validation AuthValidation.verifyEmailValidationSchema
 * @returns {Object} User data and authentication tokens
 */
router.post(
  '/verify-email',
  authRateLimiter,
  validateRequest(AuthValidation.verifyEmailValidationSchema),
  AuthController.verifyEmail,
);

/**
 * @route POST /auth/refresh-token
 * @description Refresh access token using refresh token
 * @access Public
 * @validation AuthValidation.refreshTokenValidationSchema
 * @returns {Object} New authentication tokens
 */
router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken,
);

// ============================================================================
// PROTECTED AUTHENTICATION ROUTES (Require Authentication)
// ============================================================================

/**
 * @route POST /auth/change-password
 * @description Change user password (requires authentication)
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @validation AuthValidation.changePasswordValidationSchema
 * @returns {Object} Updated user data
 */
router.post(
  '/change-password',
  auth(TRole.common),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
);

/**
 * @route POST /auth/logout
 * @description Logout user and invalidate refresh token
 * @access Public (can be called with or without authentication)
 * @returns {Object} Success message
 */
router.post('/logout', AuthController.logout);

// ============================================================================
// ONBOARDING ROUTES (Require Authentication)
// ============================================================================

/**
 * @route POST /auth/onboarding/start
 * @description Initialize onboarding questionnaire for student
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @returns {Object} Onboarding status
 */
router.post(
  '/onboarding/start',
  auth(TRole.student),
  AuthController.startOnboarding,
);

/**
 * @route GET /auth/onboarding/status
 * @description Get current onboarding status
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @returns {Object} Onboarding progress and status
 */
router.get(
  '/onboarding/status',
  auth(TRole.student),
  AuthController.getOnboardingStatus,
);

/**
 * @route GET /auth/onboarding/questions
 * @description Get onboarding questions for current phase
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @query {string} [phaseId] - Optional phase ID to fetch specific phase questions
 * @returns {Object} Phase details and questions
 */
router.get(
  '/onboarding/questions',
  auth(TRole.student),
  AuthController.getOnboardingQuestions,
);

/**
 * @route POST /auth/onboarding/answer
 * @description Save answer to onboarding question
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @validation AuthValidation.onboardingAnswerValidationSchema
 * @returns {Object} Updated onboarding status and next questions
 */
router.post(
  '/onboarding/answer',
  auth(TRole.student),
  validateRequest(AuthValidation.onboardingAnswerValidationSchema),
  AuthController.saveOnboardingAnswer,
);

/**
 * @route POST /auth/onboarding/complete
 * @description Mark onboarding as completed
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @returns {Object} Completion status
 */
router.post(
  '/onboarding/complete',
  auth(TRole.student),
  AuthController.completeOnboarding,
);

export const AuthRoutes = router;
