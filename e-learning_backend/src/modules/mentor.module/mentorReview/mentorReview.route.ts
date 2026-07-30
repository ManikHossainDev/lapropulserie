/**
 * Mentor Review Routes Module
 *
 * This module defines all mentor review-related endpoints including:
 * - Mentor review creation with session validation
 * - Mentor review update
 * - Rating distribution calculation
 * - Review summary (avg rating, total count)
 * - Recent reviews retrieval
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Student)
 * - Session validation before review submission
 *
 * @module MentorReviewRoute
 */

import express from 'express';
import * as validation from './mentorReview.validation';
import { MentorReviewController } from './mentorReview.controller';
import { IMentorReview } from './mentorReview.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { injectUserReference } from '../../../middlewares/injectUserReference';

const router = express.Router();

export const optionValidationChecking = <T extends keyof IMentorReview | 'sortBy' | 'page' | 'limit' | 'populate'>(
  filters: T[]
) => {
  return filters;
};

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

const controller = new MentorReviewController();

// ============================================================================
// MENTOR REVIEW ROUTES
// ============================================================================

/**
 * @route POST /mentor-review/
 * @description Create a mentor review with session validation (Student only)
 * @access Private (Student)
 * @middleware auth(TRole.student)
 * @middleware validateRequest
 * @returns {Object} Created mentor review data
 */
router.route('/').post(
  auth(TRole.student),
  validateRequest(validation.createMentorReviewValidationSchema),
  controller.createWithSessionValidation
);

/**
 * @route PUT /mentor-review/:reviewId
 * @description Update own mentor review (Student only)
 * @access Private (Student)
 * @middleware auth(TRole.student)
 * @middleware validateRequest
 * @returns {Object} Updated mentor review data
 */
router.route('/:reviewId').put(
  auth(TRole.student),
  validateRequest(validation.updateMentorReviewValidationSchema),
  controller.updateReview
);

/**
 * @route GET /mentor-review/summary/:mentorId
 * @description Get mentor review summary (average rating, total reviews)
 * @access Public
 * @returns {Object} Review summary data
 */
router.route('/summary/:mentorId').get(controller.getReviewSummary);

/**
 * @route GET /mentor-review/distribution/:mentorId
 * @description Get mentor rating distribution (1-5 stars with counts and percentages)
 * @access Public
 * @returns {Object} Rating distribution data
 */
router.route('/distribution/:mentorId').get(controller.getRatingDistribution);

/**
 * @route GET /mentor-review/recent/:mentorId
 * @description Get recent mentor reviews (default 3)
 * @access Public
 * @query limit - number of reviews to return (default: 3)
 * @returns {Object[]} Array of recent reviews
 */
router.route('/recent/:mentorId').get(controller.getRecentReviews);

/**
 * @route GET /mentor-review/paginate
 * @description Get paginated list of all mentor reviews
 * @access Public
 * @query page, limit, sortBy, populate
 * @returns {Object} Paginated review data
 */
router.route('/paginate').get(
  validateFiltersForQuery(
    optionValidationChecking(['mentorId', 'userId', ...paginationOptions]),
  ),
  controller.getAllWithPagination
);

export const MentorReviewRoute = router;
