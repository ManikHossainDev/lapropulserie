/**
 * User Role Data Routes Module
 *
 * This module defines all user role data-related endpoints including:
 * - User role data CRUD operations
 * - User role data retrieval by ID
 * - User role data pagination
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Common)
 *
 * @module UserRoleDataRoute
 */

import express from 'express';
import * as validation from './userRoleData.validation';
import { UserRoleDataController } from './userRoleData.controller';
import { IUserRoleData } from './userRoleData.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IUserRoleData | 'sortBy' | 'page' | 'limit' | 'populate',
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

const controller = new UserRoleDataController();

// ============================================================================
// USER ROLE DATA ROUTES
// ============================================================================

/**
 * @route GET /user-role-data/paginate
 * @description Get all user role data with pagination
 * @access Public
 * @query {string} [_id] - Filter by user role data ID
 * @query {string} [sortBy] - Sort field
 * @query {number} [page] - Page number
 * @query {number} [limit] - Items per page
 * @query {string} [populate] - Population options
 * @returns {Object} Paginated user role data list
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
 * @route GET /user-role-data/:id
 * @description Get user role data by ID
 * @access Public
 * @param {string} id - User role data ID
 * @returns {Object} User role data
 */
router.route('/:id').get(controller.getById);

/**
 * @route PUT /user-role-data/update/:id
 * @description Update user role data by ID
 * @access Public
 * @param {string} id - User role data ID
 * @returns {Object} Updated user role data
 */
router.route('/update/:id').put(controller.updateById);

/**
 * @route GET /user-role-data/
 * @description Get all user role data
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all user role data
 */
router.route('/').get(auth(TRole.common), controller.getAll);

/**
 * @route POST /user-role-data/create
 * @description Create a new user role data
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @validation createHelpMessageValidationSchema
 * @returns {Object} Created user role data
 */
router
  .route('/create')
  .post(
    auth(TRole.common),
    validateRequest(validation.createHelpMessageValidationSchema),
    controller.create,
  );

/**
 * @route DELETE /user-role-data/delete/:id
 * @description Delete user role data by ID
 * @access Public
 * @param {string} id - User role data ID
 * @returns {Object} Deletion confirmation
 */
router.route('/delete/:id').delete(controller.deleteById);

/**
 * @route PUT /user-role-data/softDelete/:id
 * @description Soft delete user role data by ID
 * @access Public
 * @param {string} id - User role data ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/softDelete/:id').put(controller.softDeleteById);

export const UserRoleDataRoute = router;
