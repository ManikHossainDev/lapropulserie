/**
 * Purchased Journey Routes Module
 *
 * This module defines all purchased journey-related endpoints including:
 * - Purchased journey CRUD operations
 * - Purchased journey retrieval by ID
 * - Purchased journey pagination
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Student, Specialist)
 *
 * @module PurchasedJourneyRoute
 */

import express from 'express';
import * as validation from './purchased-journey.validation';
import { PurchasedJourneyController } from './purchased-journey.controller';
import { IPurchasedJourney } from './purchased-journey.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IPurchasedJourney | 'sortBy' | 'page' | 'limit' | 'populate',
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

const controller = new PurchasedJourneyController();

// ============================================================================
// PURCHASED JOURNEY ROUTES
// ============================================================================

/**
 * @route GET /purchased-journey/paginate
 * @description Get all purchased journeys with pagination
 * @access Public
 * @query {string} [_id] - Filter by purchased journey ID
 * @query {string} [sortBy] - Sort field
 * @query {number} [page] - Page number
 * @query {number} [limit] - Items per page
 * @query {string} [populate] - Population options
 * @returns {Object} Paginated purchased journey list
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
 * @route GET /purchased-journey/:id
 * @description Get purchased journey by ID
 * @access Public
 * @param {string} id - Purchased journey ID
 * @returns {Object} Purchased journey data
 */
router.route('/:id').get(controller.getById);

/**
 * @route PUT /purchased-journey/:id
 * @description Update purchased journey by ID
 * @access Public
 * @param {string} id - Purchased journey ID
 * @returns {Object} Updated purchased journey data
 */
router.route('/:id').put(controller.updateById);

/**
 * @route GET /purchased-journey/
 * @description Get all purchased journeys
 * @access Private (Admin)
 * @middleware auth(TRole.admin)
 * @returns {Object} List of all purchased journeys
 */
router.route('/').get(auth(TRole.admin), controller.getAll);

/**
 * @route POST /purchased-journey/:journeyId
 * @description Purchase a journey (Student only)
 * @access Private (Student)
 * @middleware auth(TRole.student)
 * @param {string} journeyId - Journey ID to purchase
 * @returns {Object} Created purchased journey data
 */
router.route('/:journeyId').post(auth(TRole.student), controller.create);

/**
 * @route GET /purchased-journey/:journeyId/progress
 * @description Get dynamic progress calculation for a purchased journey
 * @access Private (Student)
 * @middleware auth(TRole.student)
 * @param {string} journeyId - Journey ID
 * @returns {Object} Progress statistics
 */
router.route('/:journeyId/progress').get(auth(TRole.student), controller.getProgress);

/**
 * @route DELETE /purchased-journey/:id/permenent
 * @description Permanently delete purchased journey by ID
 * @access Private (Admin)
 * @middleware auth(TRole.admin)
 * @param {string} id - Purchased journey ID
 * @returns {Object} Deletion confirmation
 */
router.route('/:id/permenent').delete(auth(TRole.admin), controller.deleteById);

/**
 * @route DELETE /purchased-journey/:id
 * @description Soft delete purchased journey by ID
 * @access Private (Admin)
 * @middleware auth(TRole.admin)
 * @param {string} id - Purchased journey ID
 * @returns {Object} Soft deletion confirmation
 */
router.route('/:id').delete(auth(TRole.admin), controller.softDeleteById);

export const PurchasedJourneyRoute = router;
