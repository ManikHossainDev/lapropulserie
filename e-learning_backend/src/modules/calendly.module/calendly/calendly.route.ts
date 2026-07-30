/**
 * Calendly Routes Module
 *
 * This module defines all Calendly integration-related endpoints including:
 * - Calendly OAuth connection
 * - Event types retrieval
 * - Scheduled events management
 * - Event invitees information
 *
 * Security Features:
 * - Authentication middleware for all routes
 * - Role-based access control (Admin, Mentor, Common)
 *
 * @module CalendlyRoute
 */

import express from 'express';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { CalendlyController } from './calendly.controller';

const router = express.Router();
const controller = new CalendlyController();

// ============================================================================
// CALENDLY CONNECTION ROUTES
// ============================================================================

/**
 * @route GET /calendly/connect
 * @description Redirect to Calendly OAuth authentication
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} Calendly OAuth redirect URL
 */
router
  .route('/connect')
  .get(auth(TRole.common), controller.redirectToCalendlyAuth);

/**
 * @route GET /calendly/delete-subscription
 * @description Disconnect Calendly integration
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} Disconnection confirmation
 */
router
  .route('/delete-subscription')
  .get(auth(TRole.common), controller.disconnectCalendly);

// ============================================================================
// CALENDLY EVENT ROUTES
// ============================================================================

/**
 * @route GET /calendly/event-types
 * @description Get Calendly event types
 * @access Private (Admin or Mentor role required)
 * @middleware auth(TRole.admin, TRole.mentor)
 * @returns {Object} List of event types
 */
router
  .route('/event-types')
  .get(auth(TRole.admin, TRole.mentor), controller.getEventTypes);

/**
 * @route GET /calendly/scheduled-events
 * @description Get scheduled Calendly events
 * @access Private (Admin or Mentor role required)
 * @middleware auth(TRole.admin, TRole.mentor)
 * @returns {Object} List of scheduled events
 */
router
  .route('/scheduled-events')
  .get(auth(TRole.admin, TRole.mentor), controller.getScheduledEvents);

/**
 * @route GET /calendly/event-invitees/:eventUuid
 * @description Get invitees for a specific Calendly event
 * @access Private (Admin or Mentor role required)
 * @middleware auth(TRole.admin, TRole.mentor)
 * @param {string} eventUuid - Calendly event UUID
 * @returns {Object} List of event invitees
 */
router
  .route('/event-invitees/:eventUuid')
  .get(auth(TRole.admin, TRole.mentor), controller.getEventInvitees);

export const CalendlyRoute = router;
