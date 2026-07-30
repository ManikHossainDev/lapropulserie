/**
 * Wallet Routes Module
 *
 * This module defines all wallet-related endpoints including:
 * - Wallet CRUD operations
 * - Paginated wallet retrieval
 * - Wallet creation and updates
 * - Wallet deletion
 *
 * Security Features:
 * - Authentication middleware for all routes
 * - Input validation using Zod schemas
 * - Role-based access control
 * - Query validation for pagination and filtering
 *
 * @module WalletRoute
 */

import express from 'express';
import * as validation from './wallet.validation';
import { WalletController } from './wallet.controller';
import { IWallet } from './wallet.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IWallet | 'sortBy' | 'page' | 'limit' | 'populate',
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

const controller = new WalletController();

// ============================================================================
// WALLET ROUTES
// ============================================================================

/**
 * @route GET /wallet/paginate
 * @description Get paginated wallet list
 * @access Public
 * @query {string} [_id] - Filter by wallet ID
 * @returns {Object} Paginated wallet list
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
 * @route GET /wallet/:id
 * @description Get wallet details by ID
 * @access Public
 * @param {string} id - Wallet ID
 * @returns {Object} Wallet details
 */
router.route('/:id').get(controller.getById);

/**
 * @route PUT /wallet/update/:id
 * @description Update wallet by ID
 * @access Public
 * @param {string} id - Wallet ID
 * @returns {Object} Updated wallet data
 */
router.route('/update/:id').put(controller.updateById);

/**
 * @route GET /wallet/
 * @description Get all wallets
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all wallets
 */
router.route('/').get(auth(TRole.common), controller.getAll);

/**
 * @route POST /wallet/create
 * @description Create a new wallet
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @validation createHelpMessageValidationSchema
 * @returns {Object} Created wallet
 */
router
  .route('/create')
  .post(
    auth(TRole.common),
    validateRequest(validation.createHelpMessageValidationSchema),
    controller.create,
  );

/**
 * @route DELETE /wallet/:id/permanent
 * @description Permanently delete wallet by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Wallet ID
 * @returns {Object} Deletion confirmation
 */
router
  .route('/:id/permanent')
  .delete(auth(TRole.common), controller.deleteById);

/**
 * @route DELETE /wallet/:id
 * @description Soft delete wallet by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Wallet ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/:id').delete(auth(TRole.common), controller.softDeleteById);

export const WalletRoute = router;
