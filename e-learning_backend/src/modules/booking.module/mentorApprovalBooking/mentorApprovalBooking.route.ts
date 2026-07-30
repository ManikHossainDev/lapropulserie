/**
 * Mentor Approval Booking Routes Module
 *
 * This module defines all mentor approval booking-related endpoints including:
 * - Admin booking management
 * - Booking details retrieval
 * - Booking status updates
 *
 * Security Features:
 * - Authentication middleware for all routes
 * - Input validation using Zod schemas
 * - Role-based access control (Admin only)
 *
 * @module MentorApprovalBookingRoute
 */

import express from 'express';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import validateRequest from '../../../shared/validateRequest';
import { MentorApprovalBookingController } from './mentorApprovalBooking.controller';
import {
  adminMentorApprovalBookingListValidationSchema,
  mentorApprovalBookingIdValidationSchema,
  updateMentorApprovalBookingStatusValidationSchema,
} from './mentorApprovalBooking.validation';

const router = express.Router();
const controller = new MentorApprovalBookingController();

// ============================================================================
// ADMIN BOOKING MANAGEMENT ROUTES
// ============================================================================

/**
 * @route GET /mentor-approval-booking/
 * @description Get all mentor approval bookings for admin
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation adminMentorApprovalBookingListValidationSchema
 * @returns {Object} Paginated booking list
 */
router
  .route('/')
  .get(
    auth(TRole.admin),
    validateRequest(adminMentorApprovalBookingListValidationSchema),
    controller.getAdminList,
  );

/**
 * @route GET /mentor-approval-booking/:id
 * @description Get mentor approval booking details by ID
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation mentorApprovalBookingIdValidationSchema
 * @param {string} id - Booking ID
 * @returns {Object} Booking details
 */
router
  .route('/:id')
  .get(
    auth(TRole.admin),
    validateRequest(mentorApprovalBookingIdValidationSchema),
    controller.getById,
  );

/**
 * @route PATCH /mentor-approval-booking/:id/status
 * @description Update mentor approval booking status
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation updateMentorApprovalBookingStatusValidationSchema
 * @param {string} id - Booking ID
 * @returns {Object} Updated booking status
 */
router
  .route('/:id/status')
  .patch(
    auth(TRole.admin),
    validateRequest(updateMentorApprovalBookingStatusValidationSchema),
    controller.updateStatus,
  );

export const MentorApprovalBookingRoute = router;
