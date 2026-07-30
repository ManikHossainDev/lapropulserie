/**
 * Journey Progress Tracker Routes Module
 *
 * This module defines all journey progress tracker-related endpoints including:
 * - Tracker initialization
 * - Section status updates
 * - Module progress tracking
 * - Resume functionality
 * - Overall progress retrieval
 *
 * Security Features:
 * - Authentication middleware for all routes
 * - Role-based access control (Student)
 * - Request body validation using Zod schemas
 *
 * @module JourneyProgressTrackerRoute
 */

import express from 'express';
import * as validation from './journey-progress-tracker.validation';
import { JourneyProgressTrackerController } from './journey-progress-tracker.controller';
import { IJourneyProgressTracker } from './journey-progress-tracker.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <T extends keyof IJourneyProgressTracker | 'sortBy' | 'page' | 'limit' | 'populate'>(
  filters: T[]
) => {
  return filters;
};

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

const controller = new JourneyProgressTrackerController();

// ============================================================================
// JOURNEY PROGRESS TRACKER ROUTES
// ============================================================================

/**
 * @route GET /journey-progress-tracker/paginate
 * @description Get paginated journey progress trackers
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @query {string} [_id] - Filter by tracker ID
 * @returns {Object} Paginated tracker list
 */
router.route('/paginate').get(
  auth(TRole.common),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/**
 * @route POST /journey-progress-tracker/initialize
 * @description Initialize progress tracker for a student's capsule
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @body {string} journeyId - Journey ID
 * @body {string} capsuleId - Capsule ID
 * @returns {Object} Initialized tracker data
 */
router.route('/initialize').post(
  auth(TRole.student),
  validateRequest(validation.initializeTrackerSchema),
  controller.initializeTracker
);

/**
 * @route PUT /journey-progress-tracker/section-status
 * @description Update section status (introduction, inspiration, diagnostics, science, aiSummary)
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @body {string} capsuleId - Capsule ID
 * @body {string} section - Section name
 * @body {string} status - Status (notStarted, inProgress, completed)
 * @returns {Object} Updated tracker data
 */
router.route('/section-status').put(
  auth(TRole.student),
  validateRequest(validation.updateSectionStatusSchema),
  controller.updateSectionStatus
);

/**
 * @route PUT /journey-progress-tracker/module-progress
 * @description Update module progress
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @body {string} capsuleId - Capsule ID
 * @body {string} moduleId - Module ID
 * @body {string} status - Status (notStarted, inProgress, completed)
 * @body {number} [lastWatchTime] - Last watch time in seconds
 * @returns {Object} Updated tracker data
 */
router.route('/module-progress').put(
  auth(TRole.student),
  validateRequest(validation.updateModuleProgressSchema),
  controller.updateModuleProgress
);

/**
 * @route PUT /journey-progress-tracker/last-accessed
 * @description Update last accessed item for resume functionality
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @body {string} capsuleId - Capsule ID
 * @body {string} itemType - Item type (module, lesson)
 * @body {string} itemId - Item ID
 * @body {number} [lastWatchTime] - Last watch time in seconds
 * @returns {Object} Updated tracker data
 */
router.route('/last-accessed').put(
  auth(TRole.student),
  validateRequest(validation.updateLastAccessedSchema),
  controller.updateLastAccessed
);

/**
 * @route GET /journey-progress-tracker/resume/:journeyId
 * @description Get resume point for a journey
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @param {string} journeyId - Journey ID
 * @returns {Object} Resume data (capsule, currentSection, resumeItem)
 */
router.route('/resume/:journeyId').get(
  auth(TRole.student),
  controller.getResumePoint
);

/**
 * @route GET /journey-progress-tracker/progress/:journeyId
 * @description Get overall progress for a journey
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @param {string} journeyId - Journey ID
 * @returns {Object} Progress data (trackers, overallProgressPercentage, totalCapsules, completedCapsules)
 */
router.route('/progress/:journeyId').get(
  auth(TRole.student),
  controller.getProgress
);

export const JourneyProgressTrackerRoute = router;
