/**
 * User Devices Routes Module
 *
 * This module defines all user devices-related endpoints including:
 * - User devices CRUD operations
 * - User devices retrieval by ID
 * - User devices pagination
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Common)
 *
 * @module UserDevicesRoute
 */

import express from 'express';
import * as validation from './userDevices.validation';
import { UserDevicesController } from './userDevices.controller';
import { IUserDevices } from './userDevices.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IUserDevices | 'sortBy' | 'page' | 'limit' | 'populate',
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

const controller = new UserDevicesController();

// ============================================================================
// USER DEVICES ROUTES
// ============================================================================

/**
 * @route GET /user-devices/paginate
 * @description Get all user devices with pagination
 * @access Public
 * @query {string} [_id] - Filter by user devices ID
 * @query {string} [sortBy] - Sort field
 * @query {number} [page] - Page number
 * @query {number} [limit] - Items per page
 * @query {string} [populate] - Population options
 * @returns {Object} Paginated user devices list
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
 * @route GET /user-devices/:id
 * @description Get user devices by ID
 * @access Public
 * @param {string} id - User devices ID
 * @returns {Object} User devices data
 */
router.route('/:id').get(controller.getById);

/**
 * @route PUT /user-devices/update/:id
 * @description Update user devices by ID
 * @access Public
 * @param {string} id - User devices ID
 * @returns {Object} Updated user devices data
 */
router.route('/update/:id').put(controller.updateById);

/**
 * @route GET /user-devices/
 * @description Get all user devices
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all user devices
 */
router.route('/').get(auth(TRole.common), controller.getAll);

/**
 * @route POST /user-devices/create
 * @description Create a new user devices
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @validation createHelpMessageValidationSchema
 * @returns {Object} Created user devices data
 */
router
  .route('/create')
  .post(
    auth(TRole.common),
    validateRequest(validation.createHelpMessageValidationSchema),
    controller.create,
  );

/**
 * @route DELETE /user-devices/delete/:id
 * @description Delete user devices by ID
 * @access Public
 * @param {string} id - User devices ID
 * @returns {Object} Deletion confirmation
 */
router.route('/delete/:id').delete(controller.deleteById);

/**
 * @route PUT /user-devices/softDelete/:id
 * @description Soft delete user devices by ID
 * @access Public
 * @param {string} id - User devices ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/softDelete/:id').put(controller.softDeleteById);

export const UserDevicesRoute = router;
