/**
 * Student Capsule Tracker Routes Module
 *
 * This module defines all student capsule tracker-related endpoints including:
 * - Capsule progress tracking
 * - Module and question management
 * - AI summary generation
 * - Student answer submission
 *
 * Security Features:
 * - Authentication middleware for all routes
 * - Role-based access control (Student, Common)
 * - Query validation for pagination and filtering
 *
 * @module StudentCapsuleTrackerRoute
 */

import express from 'express';
import * as validation from './student-capsule-tracker.validation';
import { StudentCapsuleTrackerController } from './student-capsule-tracker.controller';
import { IStudentCapsuleTracker } from './student-capsule-tracker.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';

const router = express.Router();

export const optionValidationChecking = <T extends keyof IStudentCapsuleTracker | 'sortBy' | 'page' | 'limit' | 'populate'>(
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

const controller = new StudentCapsuleTrackerController();

// ============================================================================
// CAPSULE TRACKER ROUTES
// ============================================================================

/**
 * @route GET /student-capsule-tracker/paginate
 * @description Get paginated student capsule trackers
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
 * @route GET /student-capsule-tracker/:id/introduction
 * @description Get capsule introduction by tracker ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} id - Student capsule tracker ID
 * @returns {Object} Capsule introduction data
 */
router.route('/:id/introduction').get(
  auth(TRole.common),
  setQueryOptions({
    populate: [
      {
        path: 'capsuleId',
        select: 'capsuleNumber title introDescription introductionVideo',
        populate: {
          path: 'introductionVideo',
          select: 'attachment'
        }
      }
    ],
    select: '-isDeleted -createdAt -updatedAt -title -capsuleNumber -__v -aiSummaryContent -aiSummaryStatus -aiSummaryGeneratedAt'
  }),
  controller.getByIdV2
);

/**
 * @route GET /student-capsule-tracker/:capsuleId/modules
 * @description Get modules with tracker info by capsule ID
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @param {string} capsuleId - Capsule ID
 * @returns {Object} Modules with tracker information
 */
router.route('/:capsuleId/modules').get(
  auth(TRole.student),
  controller.getModulesWithTrackerInfo
);

/**
 * @route GET /student-capsule-tracker/:capsuleId/questions
 * @description Get questions with answers and capsule tracker info
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @param {string} capsuleId - Capsule ID
 * @returns {Object} Questions with answers and tracker info
 */
router.route('/:capsuleId/questions').get(
  auth(TRole.student),
  controller.getQuestionsWithAnswersWithCapsuleTrackerInfo
);

/**
 * @route POST /student-capsule-tracker/submit-answer/:questionId
 * @description Submit answer for auto-save feature
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @param {string} questionId - Question ID
 * @returns {Object} Saved answer data
 */
router.route('/submit-answer/:questionId').post(
  auth(TRole.student),
  controller.submitAnswerAutoSaveFeature
);

/**
 * @route PUT /student-capsule-tracker/:capsuleId/module-tracker/:studentModuleTrackerId
 * @description Update module tracker status
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @param {string} capsuleId - Capsule ID
 * @param {string} studentModuleTrackerId - Student module tracker ID
 * @returns {Object} Updated module tracker
 */
router.route('/:capsuleId/module-tracker/:studentModuleTrackerId').put(
  auth(TRole.student),
  controller.updateModuleTracker
);

/**
 * @route GET /student-capsule-tracker/:id/ai-summary
 * @description Get or generate AI summary with purchased journey status
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @param {string} id - Student capsule tracker ID
 * @returns {Object} AI summary and journey status
 */
router.route('/:id/ai-summary').get(
  auth(TRole.student),
  controller.getOrGenerateAISummaryWithPurchasedJourneyStatus
);

/**
 * @route GET /student-capsule-tracker/:capsuleId/questionnaire-status
 * @description Get questionnaire completion status for a capsule
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @param {string} capsuleId - Capsule ID
 * @returns {Object} Questionnaire completion status (totalQuestions, answeredQuestions, completionPercentage, isComplete)
 */
router.route('/:capsuleId/questionnaire-status').get(
  auth(TRole.student),
  controller.getQuestionnaireCompletionStatus
);

/**
 * @route PUT /student-capsule-tracker/:id
 * @description Update student capsule tracker
 * @access Private (Student role required)
 * @middleware auth(TRole.student)
 * @param {string} id - Student capsule tracker ID
 * @returns {Object} Updated tracker data
 */
router.route('/:id').put(
  auth(TRole.student),
  controller.updateById
);

export const StudentCapsuleTrackerRoute = router;
