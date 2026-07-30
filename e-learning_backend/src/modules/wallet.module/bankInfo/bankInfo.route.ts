/**
 * Bank Info Routes Module
 *
 * This module defines all bank information-related endpoints including:
 * - Bank information CRUD operations
 * - Paginated bank info retrieval
 * - Bank info creation and updates
 * - Bank info deletion
 *
 * Security Features:
 * - Authentication middleware for all routes
 * - Input validation using Zod schemas
 * - Role-based access control
 * - Query validation for pagination and filtering
 *
 * @module BankInfoRoute
 */

import express from 'express';
import * as validation from './bankInfo.validation';
import { BankInfoController } from './bankInfo.controller';
import { IBankInfo } from './bankInfo.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
import { IsProviderRejected } from '../../../middlewares/provider/IsProviderRejected';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IBankInfo | 'sortBy' | 'page' | 'limit' | 'populate',
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

const controller = new BankInfoController();

// ============================================================================
// BANK INFO ROUTES
// ============================================================================

/**
 * @route GET /bank-info/paginate
 * @description Get paginated bank information for authenticated user
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @middleware IsProviderRejected()
 * @middleware getLoggedInUserAndSetReferenceToUser('userId')
 * @query {string} [_id] - Filter by bank info ID
 * @returns {Object} Paginated bank info list
 */
router
  .route('/paginate')
  .get(
    auth(TRole.common),
    IsProviderRejected(),
    validateFiltersForQuery(
      optionValidationChecking(['_id', ...paginationOptions]),
    ),
    getLoggedInUserAndSetReferenceToUser('userId'),
    controller.getAllWithPagination,
  );

/**
 * @route GET /bank-info/:id
 * @description Get bank information details by ID
 * @access Public
 * @param {string} id - Bank info ID
 * @returns {Object} Bank info details
 */
router.route('/:id').get(controller.getById);

/**
 * @route PUT /bank-info/create-or-update
 * @description Create or update bank information
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @middleware IsProviderRejected()
 * @validation createOrUpdateBankInfoValidationSchema
 * @returns {Object} Created or updated bank info
 */
router
  .route('/create-or-update')
  .put(
    auth(TRole.common),
    IsProviderRejected(),
    validateRequest(validation.createOrUpdateBankInfoValidationSchema),
    controller.createOrUpdate,
  );

/**
 * @route GET /bank-info/
 * @description Get all bank information
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all bank info
 */
router.route('/').get(auth(TRole.common), controller.getAll);

/**
 * @route POST /bank-info/
 * @description Create new bank information
 * @access Public
 * @returns {Object} Created bank info
 */
router.route('/').post(controller.create);

/**
 * @route DELETE /bank-info/:id/permanent
 * @description Permanently delete bank information by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Bank info ID
 * @returns {Object} Deletion confirmation
 */
router
  .route('/:id/permanent')
  .delete(auth(TRole.common), controller.deleteById);

/**
 * @route DELETE /bank-info/:id
 * @description Soft delete bank information by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Bank info ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/:id').delete(auth(TRole.common), controller.softDeleteById);

export const BankInfoRoute = router;
