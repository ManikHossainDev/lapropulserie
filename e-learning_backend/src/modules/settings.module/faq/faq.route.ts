/**
 * FAQ Routes Module
 *
 * This module defines all FAQ-related endpoints including:
 * - FAQ CRUD operations (Admin only)
 * - FAQ bulk operations (Admin only)
 * - FAQ retrieval by category
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Admin only for write operations)
 *
 * @module FaqRoute
 */

import express from 'express';
import * as validation from './faq.validation';
import { FaqController } from './faq.controller';
import { IFaq } from './faq.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IFaq | 'sortBy' | 'page' | 'limit' | 'populate',
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

const controller = new FaqController();

// ============================================================================
// FAQ ROUTES (Admin Only)
// ============================================================================

/**
 * @route POST /faq/bulk
 * @description Create multiple FAQs at once
 * @access Private (Admin only)
 * @body {string} faqCategoryId - Category ID
 * @body {Array} faqs - Array of FAQ objects with question and answer
 * @returns {Object} Created FAQs
 */
router
  .route('/bulk')
  .post(
    auth(TRole.admin),
    validateRequest(validation.bulkFaqValidationSchema),
    controller.bulkCreate,
  );

/**
 * @route PUT /faq/bulk
 * @description Update multiple FAQs at once
 * @access Private (Admin only)
 * @body {Array} faqs - Array of FAQ objects with _id, question and answer
 * @returns {Object} Update result
 */
router
  .route('/bulk')
  .put(
    auth(TRole.admin),
    validateRequest(validation.bulkUpdateFaqValidationSchema),
    controller.bulkUpdate,
  );

/**
 * @route DELETE /faq/bulk
 * @description Permanently delete multiple FAQs at once
 * @access Private (Admin only)
 * @body {Array} faqIds - Array of FAQ IDs
 * @returns {Object} Deletion result
 */
router
  .route('/bulk')
  .delete(
    auth(TRole.admin),
    controller.bulkDelete,
  );

/**
 * @route DELETE /faq/bulk/soft
 * @description Soft delete multiple FAQs at once
 * @access Private (Admin only)
 * @body {Array} faqIds - Array of FAQ IDs
 * @returns {Object} Soft deletion result
 */
router
  .route('/bulk/soft')
  .delete(
    auth(TRole.admin),
    controller.bulkSoftDelete,
  );

/**
 * @route GET /faq/category/:categoryId
 * @description Get all FAQs for a specific category
 * @access Private (Authenticated users)
 * @param {string} categoryId - FAQ category ID
 * @query {string} [sortBy] - Sort field
 * @query {number} [page] - Page number
 * @query {number} [limit] - Items per page
 * @returns {Object} Paginated FAQ list
 */
router
  .route('/category/:categoryId')
  .get(
    auth(TRole.common),
    validateFiltersForQuery(
      optionValidationChecking(['_id', 'faqCategoryId', ...paginationOptions]),
    ),
    controller.getFaqsByCategory,
  );

/**
 * @route GET /faq/paginate
 * @description Get all FAQs with pagination
 * @access Private (Authenticated users)
 * @query {string} [_id] - Filter by FAQ ID
 * @query {string} [faqCategoryId] - Filter by FAQ category ID
 * @query {string} [sortBy] - Sort field
 * @query {number} [page] - Page number
 * @query {number} [limit] - Items per page
 * @query {string} [populate] - Population options
 * @returns {Object} Paginated FAQ list
 */
router
  .route('/paginate')
  .get(
    auth(TRole.common),
    validateFiltersForQuery(
      optionValidationChecking(['_id', 'faqCategoryId', ...paginationOptions]),
    ),
    controller.getAllWithPagination,
  );

/**
 * @route GET /faq/:id
 * @description Get FAQ by ID
 * @access Private (Authenticated users)
 * @param {string} id - FAQ ID
 * @returns {Object} FAQ data
 */
router.route('/:id').get(auth(TRole.common), controller.getById);

/**
 * @route PUT /faq/:id
 * @description Update FAQ by ID
 * @access Private (Admin only)
 * @middleware auth(TRole.admin)
 * @param {string} id - FAQ ID
 * @returns {Object} Updated FAQ data
 */
router.route('/:id').put(
  auth(TRole.admin),
  validateRequest(validation.updateFaqValidationSchema),
  controller.updateById,
);

/**
 * @route GET /faq/
 * @description Get all FAQs
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all FAQs
 */
router.route('/').get(auth(TRole.common), controller.getAll);

/**
 * @route POST /faq/
 * @description Create a new FAQ
 * @access Private (Admin only)
 * @middleware auth(TRole.admin)
 * @body {string} faqCategoryId - Category ID
 * @body {string} question - FAQ question
 * @body {string} answer - FAQ answer
 * @returns {Object} Created FAQ data
 */
router.route('/').post(
  auth(TRole.admin),
  validateRequest(validation.createFaqValidationSchema),
  controller.create,
);

/**
 * @route DELETE /faq/:id/permanent
 * @description Permanently delete FAQ by ID
 * @access Private (Admin only)
 * @param {string} id - FAQ ID
 * @returns {Object} Deletion confirmation
 */
router
  .route('/:id/permanent')
  .delete(auth(TRole.admin), controller.deleteById);

/**
 * @route DELETE /faq/:id
 * @description Soft delete FAQ by ID
 * @access Private (Admin only)
 * @param {string} id - FAQ ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/:id').delete(auth(TRole.admin), controller.softDeleteById);

export const FaqRoute = router;
