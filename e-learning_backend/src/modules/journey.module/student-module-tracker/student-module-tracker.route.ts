/**
 * Student Module Tracker Routes Module
 *
 * This module defines all student module tracker-related endpoints including:
 * - Student module tracker CRUD operations
 * - Student module tracker retrieval by ID
 * - Student module tracker pagination
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Common)
 *
 * @module StudentModuleTrackerRoute
 */

import express from 'express';
import * as validation from './student-module-tracker.validation';
import { StudentModuleTrackerController } from './student-module-tracker.controller';
import { IStudentModuleTracker } from './student-module-tracker.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <T extends keyof IStudentModuleTracker | 'sortBy' | 'page' | 'limit' | 'populate'>(
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

const controller = new StudentModuleTrackerController();

// ============================================================================
// STUDENT MODULE TRACKER ROUTES
// ============================================================================

/**
 * @route GET /student-module-tracker/paginate
 * @description Get all student module trackers with pagination
 * @access Public
 * @query {string} [_id] - Filter by student module tracker ID
 * @query {string} [sortBy] - Sort field
 * @query {number} [page] - Page number
 * @query {number} [limit] - Items per page
 * @query {string} [populate] - Population options
 * @returns {Object} Paginated student module tracker list
 */
router.route('/paginate').get(
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/**
 * @route GET /student-module-tracker/:id
 * @description Get student module tracker by ID
 * @access Public
 * @param {string} id - Student module tracker ID
 * @returns {Object} Student module tracker data
 */
router.route('/:id').get(
  controller.getById
);

/**
 * @route PUT /student-module-tracker/:id
 * @description Update student module tracker by ID
 * @access Public
 * @param {string} id - Student module tracker ID
 * @returns {Object} Updated student module tracker data
 */
router.route('/:id').put(
  controller.updateById
);

/**
 * @route GET /student-module-tracker/
 * @description Get all student module trackers
 * @access Public
 * @returns {Object} List of all student module trackers
 */
router.route('/').get(
  controller.getAll
);

/**
 * @route POST /student-module-tracker/
 * @description Create a new student module tracker
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @validation createHelpMessageValidationSchema
 * @returns {Object} Created student module tracker data
 */
router.route('/').post(
  auth(TRole.common),
  validateRequest(validation.createHelpMessageValidationSchema),
  controller.create
);

/**
 * @route DELETE /student-module-tracker/:id/permanent
 * @description Permanently delete student module tracker by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Student module tracker ID
 * @returns {Object} Deletion confirmation
 */
router.route('/:id/permanent').delete(
  auth(TRole.common),
  controller.deleteById
);

/**
 * @route DELETE /student-module-tracker/:id
 * @description Soft delete student module tracker by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Student module tracker ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/:id').delete(
  auth(TRole.common),
  controller.softDeleteById
);

export const StudentModuleTrackerRoute = router;
