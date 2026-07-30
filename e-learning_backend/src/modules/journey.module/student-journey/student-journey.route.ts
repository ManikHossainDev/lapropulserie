/**
 * Student Journey Routes Module
 *
 * This module defines all student journey-related endpoints including:
 * - Get all capsules for a journey with module count
 * - Get all modules for a specific capsule with duration
 * - Check purchase status and get video URL for streaming
 * - Track student journey progress for resume
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Role-based access control (Student only)
 *
 * @module StudentJourneyRoute
 */

import express from 'express';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { StudentJourneyController } from './student-journey.controller';

const router = express.Router();

const controller = new StudentJourneyController();

/**
 * @route GET /student-journey/
 * @description Get all purchased journeys for the student
 * @access Private (Student)
 * @returns {Object} List of purchased journeys with progress
 */
router.route('/').get(
  auth(TRole.student),
  controller.getAllPurchasedJourneys
);

/**
 * @route POST /student-journey/claim-free-gift
 * @description Claim a free journey gift (if available)
 * @access Private (Student)
 * @returns {Object} Claimed free journey or message
 */
router.route('/claim-free-gift').post(
  auth(TRole.student),
  controller.claimFreeGift
);

/**
 * @route GET /student-journey/check-free-gift
 * @description Check if free journey is available to claim
 * @access Private (Student)
 * @returns {Object} Free gift status
 */
router.route('/check-free-gift').get(
  auth(TRole.student),
  controller.checkFreeGiftAvailability
);

/**
 * @route GET /student-journey/:journeyId/capsules
 * @description Get all capsules for a journey with total module count
 * @access Private (Student)
 * @param {string} journeyId - Journey ID
 * @returns {Object} List of capsules with totalModule count
 */
router.route('/:journeyId/capsules').get(
  auth(TRole.student),
  controller.getCapsulesWithModuleCount
);

/**
 * @route GET /student-journey/:journeyId/capsule/:capsuleId/modules
 * @description Get all modules for a specific capsule with total duration
 * @access Private (Student)
 * @param {string} journeyId - Journey ID
 * @param {string} capsuleId - Capsule ID
 * @returns {Object} List of modules with total duration
 */
router.route('/:journeyId/capsule/:capsuleId/modules').get(
  auth(TRole.student),
  controller.getModulesWithDuration
);

/**
 * @route GET /student-journey/:journeyId/capsule/:capsuleId/module/:moduleId/video
 * @description Get video URL for module streaming (only if purchased)
 * @access Private (Student)
 * @param {string} journeyId - Journey ID
 * @param {string} capsuleId - Capsule ID
 * @param {string} moduleId - Module ID
 * @returns {Object} Video URL for streaming
 */
router.route('/:journeyId/capsule/:capsuleId/module/:moduleId/video').get(
  auth(TRole.student),
  controller.getModuleVideo
);

/**
 * @route GET /student-journey/:journeyId/capsule/:capsuleId/resume
 * @description Get resume info for a capsule (last completed module)
 * @access Private (Student)
 * @param {string} journeyId - Journey ID
 * @param {string} capsuleId - Capsule ID
 * @returns {Object} Resume info with last module and video URL
 */
router.route('/:journeyId/capsule/:capsuleId/resume').get(
  auth(TRole.student),
  controller.getResumeInfo
);

/**
 * @route PUT /student-journey/:journeyId/capsule/:capsuleId/module/:moduleId/complete
 * @description Mark a module as complete and get next module info
 * @access Private (Student)
 * @param {string} journeyId - Journey ID
 * @param {string} capsuleId - Capsule ID
 * @param {string} moduleId - Module ID
 * @returns {Object} Next module info for continue learning
 */
router.route('/:journeyId/capsule/:capsuleId/module/:moduleId/complete').put(
  auth(TRole.student),
  controller.markModuleComplete
);

export const StudentJourneyRoute = router;