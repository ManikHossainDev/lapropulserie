/**
 * OAuth Account Routes Module
 *
 * This module defines all OAuth account-related endpoints including:
 * - OAuth account CRUD operations
 * - OAuth account retrieval by ID
 * - OAuth account pagination
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Common)
 *
 * @module OAuthAccountRoute
 */

import express from 'express';
import * as validation from './oauthAccount.validation';
import { OAuthAccountController } from './oauthAccount.controller';
import { IOAuthAccount } from './oauthAccount.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IOAuthAccount | 'sortBy' | 'page' | 'limit' | 'populate',
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

const controller = new OAuthAccountController();

// ============================================================================
// OAUTH ACCOUNT ROUTES
// ============================================================================

/**
 * @route GET /oauth-account/paginate
 * @description Get all OAuth accounts with pagination
 * @access Public
 * @query {string} [_id] - Filter by OAuth account ID
 * @query {string} [sortBy] - Sort field
 * @query {number} [page] - Page number
 * @query {number} [limit] - Items per page
 * @query {string} [populate] - Population options
 * @returns {Object} Paginated OAuth account list
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
 * @route GET /oauth-account/:id
 * @description Get OAuth account by ID
 * @access Public
 * @param {string} id - OAuth account ID
 * @returns {Object} OAuth account data
 */
router.route('/:id').get(controller.getById);

/**
 * @route PUT /oauth-account/update/:id
 * @description Update OAuth account by ID
 * @access Public
 * @param {string} id - OAuth account ID
 * @returns {Object} Updated OAuth account data
 */
router.route('/update/:id').put(controller.updateById);

/**
 * @route GET /oauth-account/
 * @description Get all OAuth accounts
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all OAuth accounts
 */
router.route('/').get(auth(TRole.common), controller.getAll);

/**
 * @route POST /oauth-account/create
 * @description Create a new OAuth account
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @validation createHelpMessageValidationSchema
 * @returns {Object} Created OAuth account data
 */
router
  .route('/create')
  .post(
    auth(TRole.common),
    validateRequest(validation.createHelpMessageValidationSchema),
    controller.create,
  );

/**
 * @route DELETE /oauth-account/delete/:id
 * @description Delete OAuth account by ID
 * @access Public
 * @param {string} id - OAuth account ID
 * @returns {Object} Deletion confirmation
 */
router.route('/delete/:id').delete(controller.deleteById);

/**
 * @route PUT /oauth-account/softDelete/:id
 * @description Soft delete OAuth account by ID
 * @access Public
 * @param {string} id - OAuth account ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/softDelete/:id').put(controller.softDeleteById);

export const OAuthAccountRoute = router;
