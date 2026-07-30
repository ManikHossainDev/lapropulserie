/**
 * Mentor Profile Routes Module
 *
 * This module defines all mentor profile-related endpoints including:
 * - Mentor onboarding and profile management
 * - Admin approval workflow
 * - Mentor reviews and ratings
 * - Profile information retrieval
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Mentor, Admin, Student)
 *
 * @module MentorProfileRoute
 */

import express from 'express';
import * as validation from './mentorProfile.validation';
import { MentorProfileController } from './mentorProfile.controller';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { UserSubscriptionController } from '../../payment.module/userSubscription/userSubscription.controller';
import { SubscriptionPlanController } from '../../payment.module/subscriptionPlan/subscriptionPlan.controller';
import { createCheckoutSessionValidationSchema } from '../../payment.module/userSubscription/userSubscription.validation';
import { subscriptionPlanListValidationSchema } from '../../payment.module/subscriptionPlan/subscriptionPlan.validation';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();
const controller = new MentorProfileController();
const userSubscriptionController = new UserSubscriptionController();
const subscriptionPlanController = new SubscriptionPlanController();

// ============================================================================
// MENTOR ONBOARDING ROUTES
// ============================================================================

/**
 * @route GET /mentor-profile/onboarding/status
 * @description Get mentor onboarding status
 * @access Private (Mentor role required)
 * @middleware auth(TRole.mentor)
 * @returns {Object} Onboarding status
 */
router
  .route('/onboarding/status')
  .get(auth(TRole.mentor), controller.getMentorOnboardingStatus);

/**
 * @route PUT /mentor-profile/onboarding/profile
 * @description Update mentor profile during onboarding with form data
 * @access Private (Mentor role required)
 * @middleware auth(TRole.mentor)
 * @validation updateMentorProfileValidationSchema
 * @returns {Object} Updated mentor profile
 */
router
  .route('/onboarding/profile')
  .put(
    auth(TRole.mentor),
    validateRequest(validation.updateMentorProfileValidationSchema),
    controller.updateMentorProfile,
  );

/**
 * @route PUT /mentor-profile/onboarding/profile-with-avatar
 * @description Update mentor profile during onboarding with form data including avatar
 * @access Private (Mentor role required)
 * @middleware auth(TRole.mentor)
 * @middleware upload.fields([{ name: 'avatarUrl', maxCount: 1 }])
 * @returns {Object} Updated mentor profile
 */
router
  .route('/onboarding/profile-with-avatar')
  .put(
    auth(TRole.mentor),
    upload.fields([{ name: 'avatarUrl', maxCount: 1 }]),
    controller.updateMentorProfileWithFormData,
  );

/**
 * @route PUT /mentor-profile/onboarding/request-approval
 * @description Request admin approval for mentor profile
 * @access Private (Mentor role required)
 * @middleware auth(TRole.mentor)
 * @validation mentorApprovalRequestValidationSchema
 * @returns {Object} Approval request status
 */
router
  .route('/onboarding/request-approval')
  .put(
    auth(TRole.mentor),
    validateRequest(validation.mentorApprovalRequestValidationSchema),
    controller.requestForAdminApproval,
  );

/**
 * @route GET /mentor-profile/approval/status
 * @description Check admin approval status
 * @access Private (Mentor role required)
 * @middleware auth(TRole.mentor)
 * @returns {Object} Approval status
 */
router
  .route('/approval/status')
  .get(auth(TRole.mentor), controller.checkStatusOfHaveAdminApproval);

/**
 * @route GET /mentor-profile/subscription-plans
 * @description Get all subscription plans for mentor
 * @access Private (Mentor role required)
 * @middleware auth(TRole.mentor)
 * @validation subscriptionPlanListValidationSchema
 * @returns {Object} Paginated list of subscription plans
 */
router
  .route('/subscription-plans')
  .get(
    auth(TRole.mentor),
    validateRequest(subscriptionPlanListValidationSchema),
    subscriptionPlanController.getActivePlans,
  );

/**
 * @route POST /mentor-profile/subscription/subscribe
 * @description Create checkout session to subscribe to a plan
 * @access Private (Mentor role required)
 * @middleware auth(TRole.mentor)
 * @validation createCheckoutSessionValidationSchema
 * @returns {Object} Checkout session data
 */
router
  .route('/subscription/subscribe')
  .post(
    auth(TRole.mentor),
    validateRequest(createCheckoutSessionValidationSchema),
    userSubscriptionController.createCheckoutSession,
  );

/**
 * @route GET /mentor-profile/subscription/my-subscription
 * @description Get current mentor's subscription
 * @access Private (Mentor role required)
 * @middleware auth(TRole.mentor)
 * @returns {Object} User subscription data
 */
router
  .route('/subscription/my-subscription')
  .get(auth(TRole.mentor), userSubscriptionController.getMySubscription);

// ============================================================================
// ADMIN MENTOR REVIEW ROUTES
// ============================================================================

/**
 * @route GET /mentor-profile/admin/reviews
 * @description Get list of mentors for admin review
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation adminMentorReviewListValidationSchema
 * @returns {Object} Paginated mentor review list
 */
router
  .route('/admin/reviews')
  .get(
    auth(TRole.admin),
    validateRequest(validation.adminMentorReviewListValidationSchema),
    controller.getAdminMentorReviewList,
  );

/**
 * @route GET /mentor-profile/admin/reviews/:id
 * @description Get mentor review details by ID
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation mentorProfileIdParamValidationSchema
 * @param {string} id - Mentor profile ID
 * @returns {Object} Mentor review details
 */
router
  .route('/admin/reviews/:id')
  .get(
    auth(TRole.admin),
    validateRequest(validation.mentorProfileIdParamValidationSchema),
    controller.getAdminMentorReviewDetails,
  );

/**
 * @route PATCH /mentor-profile/admin/reviews/:id/approval-status
 * @description Update admin approval status for mentor
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation adminMentorApprovalUpdateValidationSchema
 * @param {string} id - Mentor profile ID
 * @returns {Object} Updated approval status
 */
router
  .route('/admin/reviews/:id/approval-status')
  .patch(
    auth(TRole.admin),
    validateRequest(validation.adminMentorApprovalUpdateValidationSchema),
    controller.updateAdminApprovalStatus,
  );

// ============================================================================
// PUBLIC MENTOR PROFILE ROUTES
// ============================================================================

/**
 * @route GET /mentor-profile/with-reviews/:mentorId
 * @description Get mentor profile with reviews
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @param {string} mentorId - Mentor ID
 * @returns {Object} Mentor profile with reviews
 */
router
  .route('/with-reviews/:mentorId')
  .get(auth(TRole.student), controller.mentorProfileInfoWithReviews);

/**
 * @route GET /mentor-profile/:id
 * @description Get mentor profile by ID
 * @access Public
 * @param {string} id - Mentor profile ID
 * @returns {Object} Mentor profile data
 */
router.route('/:id').get(controller.getById);

export const MentorProfileRoute = router;
