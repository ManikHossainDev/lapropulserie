/**
 * Wallet Transaction History Routes Module
 *
 * This module defines all wallet transaction history-related endpoints including:
 * - Transaction history retrieval and pagination
 * - Transaction creation and management
 * - Transaction updates and deletions
 *
 * Security Features:
 * - Authentication middleware for all routes
 * - Input validation using Zod schemas
 * - Role-based access control
 * - Query validation for pagination and filtering
 *
 * @module WalletTransactionHistoryRoute
 */

import express from 'express';
import * as validation from './walletTransactionHistory.validation';
import { WalletTransactionHistoryController } from './walletTransactionHistory.controller';
import { IWalletTransactionHistory } from './walletTransactionHistory.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
import { IsProviderRejected } from '../../../middlewares/provider/IsProviderRejected';

const router = express.Router();

export const optionValidationChecking = <
  T extends
    | keyof IWalletTransactionHistory
    | 'sortBy'
    | 'page'
    | 'limit'
    | 'populate',
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

const controller = new WalletTransactionHistoryController();

// ============================================================================
// TRANSACTION HISTORY ROUTES
// ============================================================================

/**
 * @route GET /wallet-transaction-history/paginate
 * @description Get paginated transaction history
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @middleware IsProviderRejected()
 * @query {string} [_id] - Filter by transaction ID
 * @query {string} [walletId] - Filter by wallet ID
 * @returns {Object} Paginated transaction history
 */
router
  .route('/paginate')
  .get(
    auth(TRole.common),
    IsProviderRejected(),
    validateFiltersForQuery(
      optionValidationChecking(['_id', 'walletId', ...paginationOptions]),
    ),
    controller.getAllWithPagination,
  );

/**
 * @route GET /wallet-transaction-history/paginate-with-wallet
 * @description Get paginated transaction history with wallet details
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @middleware IsProviderRejected()
 * @middleware getLoggedInUserAndSetReferenceToUser('userId')
 * @query {string} [_id] - Filter by transaction ID
 * @query {string} [walletId] - Filter by wallet ID
 * @returns {Object} Paginated transaction history with wallet details
 */
router.route('/paginate-with-wallet').get(
  auth(TRole.common),
  IsProviderRejected(),
  validateFiltersForQuery(
    optionValidationChecking(['_id', 'walletId', ...paginationOptions]),
  ),
  getLoggedInUserAndSetReferenceToUser('userId'),
  setQueryOptions({
    populate: [],
    select: '-isDeleted -updatedAt',
  }),
  controller.getAllWithWallet,
);

/**
 * @route GET /wallet-transaction-history/:id
 * @description Get transaction history details by ID
 * @access Public
 * @param {string} id - Transaction ID
 * @returns {Object} Transaction details
 */
router.route('/:id').get(controller.getById);

/**
 * @route PUT /wallet-transaction-history/update/:id
 * @description Update transaction history by ID
 * @access Public
 * @param {string} id - Transaction ID
 * @returns {Object} Updated transaction data
 */
router.route('/update/:id').put(controller.updateById);

/**
 * @route GET /wallet-transaction-history/
 * @description Get all transaction history
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all transactions
 */
router.route('/').get(auth(TRole.common), controller.getAll);

/**
 * @route POST /wallet-transaction-history/
 * @description Create a new transaction history
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @validation createHelpMessageValidationSchema
 * @returns {Object} Created transaction
 */
router
  .route('/')
  .post(
    auth(TRole.common),
    validateRequest(validation.createHelpMessageValidationSchema),
    controller.create,
  );

/**
 * @route DELETE /wallet-transaction-history/:id/permanent
 * @description Permanently delete transaction history by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Transaction ID
 * @returns {Object} Deletion confirmation
 */
router
  .route('/:id/permanent')
  .delete(auth(TRole.common), controller.deleteById);

/**
 * @route DELETE /wallet-transaction-history/:id
 * @description Soft delete transaction history by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Transaction ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/:id').delete(auth(TRole.common), controller.softDeleteById);

export const WalletTransactionHistoryRoute = router;
