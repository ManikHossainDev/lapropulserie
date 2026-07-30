/**
 * Meeting Routes Module
 *
 * This module defines all meeting-related endpoints including:
 * - Meeting CRUD operations
 * - Meeting retrieval by ID
 * - Meeting pagination
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Common)
 *
 * @module MeetingRoute
 */

import express from 'express';
import * as validation from './meeting.validation';
import { MeetingController } from './meeting.controller';
import { IMeeting } from './meeting.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IMeeting | 'sortBy' | 'page' | 'limit' | 'populate',
>(
  filters: T[],
) => {
  return filters;
};

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

const controller = new MeetingController();

// ============================================================================
// MEETING ROUTES
// ============================================================================

/**
 * @route GET /meeting/paginate
 * @description Get all meetings with pagination
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @query {string} [_id] - Filter by meeting ID
 * @query {string} [sortBy] - Sort field
 * @query {number} [page] - Page number
 * @query {number} [limit] - Items per page
 * @query {string} [populate] - Population options
 * @returns {Object} Paginated meeting list
 */
router
  .route('/paginate')
  .get(
    auth(TRole.common),
    validateFiltersForQuery(
      optionValidationChecking(['_id', ...paginationOptions]),
    ),
    controller.getAllWithPagination,
  );

/**
 * @route GET /meeting/:id
 * @description Get meeting by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Meeting ID
 * @returns {Object} Meeting data
 */
router.route('/:id').get(auth(TRole.common), controller.getById);

/**
 * @route PUT /meeting/:id
 * @description Update meeting by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Meeting ID
 * @returns {Object} Updated meeting data
 */
router.route('/:id').put(auth(TRole.common), controller.updateById);

/**
 * @route GET /meeting/
 * @description Get all meetings
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all meetings
 */
router.route('/').get(auth(TRole.common), controller.getAll);

/**
 * @route POST /meeting/
 * @description Create a new meeting
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @validation createHelpMessageValidationSchema
 * @returns {Object} Created meeting data
 */
router
  .route('/')
  .post(
    auth(TRole.common),
    validateRequest(validation.createHelpMessageValidationSchema),
    controller.create,
  );

/**
 * @route DELETE /meeting/:id/permenent
 * @description Permanently delete meeting by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Meeting ID
 * @returns {Object} Deletion confirmation
 */
router
  .route('/:id/permenent')
  .delete(auth(TRole.common), controller.deleteById);

/**
 * @route DELETE /meeting/:id
 * @description Soft delete meeting by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Meeting ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/:id').delete(auth(TRole.common), controller.softDeleteById);

export const MeetingRoute = router;
