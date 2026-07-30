/**
 * Withdrawal Request Routes Module
 *
 * This module defines all withdrawal request-related endpoints including:
 * - Withdrawal request creation and management
 * - Paginated withdrawal request retrieval
 * - Admin withdrawal request management
 * - Withdrawal request status updates
 * - Receipt upload and payment proof
 *
 * Security Features:
 * - Authentication middleware for all routes
 * - Input validation using Zod schemas
 * - Role-based access control (Admin, Common)
 * - Query validation for pagination and filtering
 * - Date range filtering
 *
 * @module WithdrawalRequestRoute
 */

import express from 'express';
import * as validation from './withdrawalRequest.validation';
import { WithdrawalRequestController } from './withdrawalRequest.controller';
import { IWithdrawalRequest } from './withdrawalRequest.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import multer from 'multer';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
import { filterByDateRange } from '../../../middlewares/filterByDateRange';
import { IsProviderRejected } from '../../../middlewares/provider/IsProviderRejected';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <
  T extends
    | keyof IWithdrawalRequest
    | 'sortBy'
    | 'page'
    | 'limit'
    | 'populate'
    | 'from'
    | 'to',
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

const controller = new WithdrawalRequestController();

// ============================================================================
// USER WITHDRAWAL REQUEST ROUTES
// ============================================================================

/**
 * @route GET /withdrawal-request/paginate
 * @description Get paginated withdrawal requests for authenticated user
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @middleware IsProviderRejected()
 * @middleware getLoggedInUserAndSetReferenceToUser('userId')
 * @query {string} [_id] - Filter by withdrawal request ID
 * @returns {Object} Paginated withdrawal request list with wallet amount
 */
router.route('/paginate').get(
  auth(TRole.common),
  IsProviderRejected(),
  validateFiltersForQuery(
    optionValidationChecking(['_id', ...paginationOptions]),
  ),
  getLoggedInUserAndSetReferenceToUser('userId'),
  setQueryOptions({
    populate: [
      {
        path: 'proofOfPayment',
        select: 'attachment',
      },
      { path: 'walletId', select: 'amount' },
    ],
    select: '-isDeleted -createdAt -updatedAt -__v',
  }),
  controller.getAllWithPaginationV2WithWalletAmount,
);

/**
 * @route GET /withdrawal-request/:id
 * @description Get withdrawal request details by ID
 * @access Public
 * @param {string} id - Withdrawal request ID
 * @returns {Object} Withdrawal request details
 */
router.route('/:id').get(controller.getById);

/**
 * @route POST /withdrawal-request/
 * @description Create a new withdrawal request
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @middleware IsProviderRejected()
 * @returns {Object} Created withdrawal request
 */
router
  .route('/')
  .post(auth(TRole.common), IsProviderRejected(), controller.create);

/**
 * @route DELETE /withdrawal-request/:id/permanent
 * @description Permanently delete withdrawal request by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Withdrawal request ID
 * @returns {Object} Deletion confirmation
 */
router
  .route('/:id/permanent')
  .delete(auth(TRole.common), controller.deleteById);

/**
 * @route DELETE /withdrawal-request/:id
 * @description Soft delete withdrawal request by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Withdrawal request ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/:id').delete(auth(TRole.common), controller.softDeleteById);

// ============================================================================
// ADMIN WITHDRAWAL REQUEST ROUTES
// ============================================================================

/**
 * @route GET /withdrawal-request/paginate/for-admin
 * @description Get paginated withdrawal requests for admin
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @middleware filterByDateRange()
 * @query {string} [_id] - Filter by withdrawal request ID
 * @query {string} [status] - Filter by status
 * @query {string} [from] - Filter from date
 * @query {string} [to] - Filter to date
 * @returns {Object} Paginated withdrawal request list
 */
router.route('/paginate/for-admin').get(
  auth(TRole.admin),
  validateFiltersForQuery(
    optionValidationChecking([
      '_id',
      'status',
      'from',
      'to',
      ...paginationOptions,
    ]),
  ),
  filterByDateRange(),
  setQueryOptions({
    populate: [
      {
        path: 'proofOfPayment',
        select: 'attachment',
      },
      {
        path: 'userId',
        select: 'name profileImage email phoneNumber',
      },
    ],
    select: '-isDeleted -createdAt -updatedAt -__v',
  }),
  controller.getAllWithPaginationV2,
);

/**
 * @route PUT /withdrawal-request/:id
 * @description Upload receipt and update withdrawal request status
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @middleware upload.fields([{ name: 'proofOfPayment', maxCount: 1 }])
 * @validation updateStatusOfWithdrawalRequestValidationSchema
 * @param {string} id - Withdrawal request ID
 * @returns {Object} Updated withdrawal request with receipt
 */
router
  .route('/:id')
  .put(
    auth(TRole.admin),
    [upload.fields([{ name: 'proofOfPayment', maxCount: 1 }])],
    validateRequest(validation.updateStatusOfWithdrawalRequestValidationSchema),
    controller.uploadReceiptAndUpdateStatus,
  );

/**
 * @route GET /withdrawal-request/
 * @description Get all withdrawal requests
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all withdrawal requests
 */
router.route('/').get(auth(TRole.common), controller.getAll);

export const WithdrawalRequestRoute = router;
