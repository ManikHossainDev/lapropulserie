/**
 * FAQ Category Routes Module
 *
 * This module defines all FAQ category-related endpoints including:
 * - FAQ category CRUD operations (Admin only)
 * - FAQ category retrieval by ID
 * - FAQ category pagination
 * - FAQ category with FAQs
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Admin for write, Common for read)
 *
 * @module FaqCategoryRoute
 */

import express from 'express';
import * as validation from './faqCategory.validation';
import { FaqCategoryController } from './faqCategory.controller';
import { IFaqCategory } from './faqCategory.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IFaqCategory | 'sortBy' | 'page' | 'limit' | 'populate',
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

const controller = new FaqCategoryController();

// ============================================================================
// FAQ CATEGORY ROUTES
// ============================================================================

/**
 * @route GET /faq-category/paginate
 * @description Get all FAQ categories with pagination
 * @access Private (Authenticated users)
 * @query {string} [_id] - Filter by FAQ category ID
 * @query {string} [sortBy] - Sort field
 * @query {number} [page] - Page number
 * @query {number} [limit] - Items per page
 * @query {string} [populate] - Population options
 * @returns {Object} Paginated FAQ category list
 */
router
  .route('/paginate')
  .get(
    auth(TRole.common),
    validateFiltersForQuery(
      optionValidationChecking(['_id', ...paginationOptions]),
    ),
    controller.getAllWithPagination,
  );

/**
 * @route GET /faq-category/with-faqs
 * @description Get all FAQ categories with their FAQs
 * @access Private (Authenticated users)
 * @returns {Object} List of FAQ categories with FAQs
 */
router
  .route('/with-faqs')
  .get(auth(TRole.common), controller.getAllCategoriesWithItsFaqs);

/**
 * @route GET /faq-category/:id
 * @description Get FAQ category by ID
 * @access Private (Authenticated users)
 * @param {string} id - FAQ category ID
 * @returns {Object} FAQ category data
 */
router.route('/:id').get(auth(TRole.common), controller.getById);

/**
 * @route PUT /faq-category/:id
 * @description Update FAQ category by ID
 * @access Private (Admin only)
 * @middleware auth(TRole.admin)
 * @param {string} id - FAQ category ID
 * @body {string} [categoryName] - Updated category name
 * @returns {Object} Updated FAQ category data
 */
router.route('/:id').put(
  auth(TRole.admin),
  validateRequest(validation.updateFaqCategoryValidationSchema),
  controller.updateById,
);

/**
 * @route GET /faq-category/
 * @description Get all FAQ categories
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all FAQ categories
 */
router.route('/').get(auth(TRole.common), controller.getAll);

/**
 * @route POST /faq-category/
 * @description Create a new FAQ category
 * @access Private (Admin only)
 * @middleware auth(TRole.admin)
 * @body {string} categoryName - Category name
 * @returns {Object} Created FAQ category data
 */
router.route('/').post(
  auth(TRole.admin),
  validateRequest(validation.createFaqCategoryValidationSchema),
  controller.create,
);

/**
 * @route DELETE /faq-category/:id/permanent
 * @description Permanently delete FAQ category by ID
 * @access Private (Admin only)
 * @param {string} id - FAQ category ID
 * @returns {Object} Deletion confirmation
 */
router
  .route('/:id/permanent')
  .delete(auth(TRole.admin), controller.deleteById);

/**
 * @route DELETE /faq-category/:id
 * @description Soft delete FAQ category by ID
 * @access Private (Admin only)
 * @param {string} id - FAQ category ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/:id').delete(auth(TRole.admin), controller.softDeleteById);

export const FaqCategoryRoute = router;
