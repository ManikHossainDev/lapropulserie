/**
 * User Subscription Routes Module
 *
 * This module defines all user subscription-related endpoints including:
 * - Subscription checkout session creation
 * - User subscription management
 * - Subscription cancellation
 * - Admin subscription management
 *
 * Security Features:
 * - Authentication middleware for all routes
 * - Input validation using Zod schemas
 * - Role-based access control (Mentor, Admin)
 *
 * @module UserSubscriptionRoute
 */

import express from 'express';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import validateRequest from '../../../shared/validateRequest';
import { UserSubscriptionController } from './userSubscription.controller';
import {
  adminUserSubscriptionListValidationSchema,
  createCheckoutSessionValidationSchema,
  userSubscriptionIdValidationSchema,
} from './userSubscription.validation';

const router = express.Router();
const controller = new UserSubscriptionController();

// ============================================================================
// MENTOR SUBSCRIPTION ROUTES
// ============================================================================

/**
 * @route POST /user-subscription/checkout-session
 * @description Create a checkout session for subscription
 * @access Private (Mentor role required)
 * @middleware auth(TRole.mentor)
 * @validation createCheckoutSessionValidationSchema
 * @returns {Object} Checkout session data
 */
router
  .route('/checkout-session')
  .post(
    auth(TRole.mentor),
    validateRequest(createCheckoutSessionValidationSchema),
    controller.createCheckoutSession,
  );

/**
 * @route GET /user-subscription/me
 * @description Get current user's subscription
 * @access Private (Mentor role required)
 * @middleware auth(TRole.mentor)
 * @returns {Object} User subscription data
 */
router.route('/me').get(auth(TRole.mentor), controller.getMySubscription);

/**
 * @route POST /user-subscription/:id/cancel
 * @description Cancel user subscription
 * @access Private (Mentor role required)
 * @middleware auth(TRole.mentor)
 * @validation userSubscriptionIdValidationSchema
 * @param {string} id - Subscription ID
 * @returns {Object} Cancellation confirmation
 */
router
  .route('/:id/cancel')
  .post(
    auth(TRole.mentor),
    validateRequest(userSubscriptionIdValidationSchema),
    controller.cancelMySubscription,
  );

// ============================================================================
// ADMIN SUBSCRIPTION MANAGEMENT ROUTES
// ============================================================================

/**
 * @route GET /user-subscription/admin
 * @description Get all subscriptions for admin
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation adminUserSubscriptionListValidationSchema
 * @returns {Object} Paginated subscription list
 */
router
  .route('/admin')
  .get(
    auth(TRole.admin),
    validateRequest(adminUserSubscriptionListValidationSchema),
    controller.getAdminList,
  );

/**
 * @route GET /user-subscription/admin/:id
 * @description Get subscription details by ID for admin
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation userSubscriptionIdValidationSchema
 * @param {string} id - Subscription ID
 * @returns {Object} Subscription details
 */
router
  .route('/admin/:id')
  .get(
    auth(TRole.admin),
    validateRequest(userSubscriptionIdValidationSchema),
    controller.getById,
  );

export const UserSubscriptionRoute = router;
