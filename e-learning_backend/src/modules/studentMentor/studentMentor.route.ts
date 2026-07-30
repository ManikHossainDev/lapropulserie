/**
 * Student Mentor Routes Module
 *
 * This module defines all student mentor-related endpoints including:
 * - Student mentor CRUD operations
 * - Student mentor retrieval by ID
 * - Student mentor pagination
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Common)
 *
 * @module StudentMentorRoute
 */

import express from 'express';
import * as validation from './studentMentor.validation';
import { StudentMentorController } from './studentMentor.controller';
import { IStudentMentor } from './studentMentor.interface';
import { validateFiltersForQuery } from '../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../shared/validateRequest';
import auth from '../../middlewares/auth';
import { TRole } from '../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IStudentMentor | 'sortBy' | 'page' | 'limit' | 'populate',
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

const controller = new StudentMentorController();

// ============================================================================
// STUDENT MENTOR ROUTES
// ============================================================================

/**
 * @route GET /student-mentor/paginate
 * @description Get all student mentors with pagination
 * @access Public
 * @query {string} [_id] - Filter by student mentor ID
 * @query {string} [sortBy] - Sort field
 * @query {number} [page] - Page number
 * @query {number} [limit] - Items per page
 * @query {string} [populate] - Population options
 * @returns {Object} Paginated student mentor list
 */
router
  .route('/paginate')
  .get(
    validateFiltersForQuery(
      optionValidationChecking(['_id', ...paginationOptions]),
    ),
    controller.getAllWithPagination,
  );

/**
 * @route GET /student-mentor/:id
 * @description Get student mentor by ID
 * @access Public
 * @param {string} id - Student mentor ID
 * @returns {Object} Student mentor data
 */
router.route('/:id').get(controller.getById);

/**
 * @route PUT /student-mentor/:id
 * @description Update student mentor by ID
 * @access Public
 * @param {string} id - Student mentor ID
 * @returns {Object} Updated student mentor data
 */
router.route('/:id').put(controller.updateById);

/**
 * @route GET /student-mentor/
 * @description Get all student mentors
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all student mentors
 */
router.route('/').get(auth(TRole.common), controller.getAll);

/**
 * @route POST /student-mentor/
 * @description Create a new student mentor
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @validation createHelpMessageValidationSchema
 * @returns {Object} Created student mentor data
 */
router
  .route('/')
  .post(
    auth(TRole.common),
    validateRequest(validation.createHelpMessageValidationSchema),
    controller.create,
  );

/**
 * @route DELETE /student-mentor/:id/permenent
 * @description Permanently delete student mentor by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Student mentor ID
 * @returns {Object} Deletion confirmation
 */
router
  .route('/:id/permenent')
  .delete(auth(TRole.common), controller.deleteById);

/**
 * @route DELETE /student-mentor/:id
 * @description Soft delete student mentor by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Student mentor ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/:id').delete(auth(TRole.common), controller.softDeleteById);

export const StudentMentorRoute = router;
