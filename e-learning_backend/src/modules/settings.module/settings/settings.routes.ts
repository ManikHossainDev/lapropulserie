/**
 * Settings Routes Module
 *
 * This module defines all settings-related endpoints including:
 * - Settings retrieval and updates
 * - Public settings access
 * - Admin settings management
 *
 * Security Features:
 * - Authentication middleware for admin routes
 * - Input validation using Zod schemas
 * - Role-based access control
 *
 * @module SettingsRoutes
 */

import { Router } from 'express';
import { SettingsController } from './settings.controllers';
import { TRole } from '../../../middlewares/roles';
import auth from '../../../middlewares/auth';
import validateRequest from '../../../shared/validateRequest';
import {
  settingsLegacyTypeQueryValidationSchema,
  settingsSlugParamValidationSchema,
  updateSettingsContentValidationSchema,
} from './settings.validation';

const router = Router();

// ============================================================================
// SETTINGS ROUTES
// ============================================================================

/**
 * @route GET /settings/
 * @description Get settings details by type
 * @access Public
 * @validation settingsLegacyTypeQueryValidationSchema
 * @query {string} type - Settings type
 * @returns {Object} Settings data
 */
/**
 * @route POST /settings/
 * @description Create or update settings
 * @access Private (Admin only)
 * @middleware auth(TRole.admin)
 * @validation settingsLegacyTypeQueryValidationSchema, updateSettingsContentValidationSchema
 * @returns {Object} Updated settings data
 */
router
  .route('/')
  .get(
    validateRequest(settingsLegacyTypeQueryValidationSchema),
    SettingsController.getDetailsByType,
  )
  .post(
    auth(TRole.admin),
    validateRequest(settingsLegacyTypeQueryValidationSchema),
    validateRequest(updateSettingsContentValidationSchema),
    SettingsController.createOrUpdateSettings,
  );

/**
 * @route GET /settings/public/:slug
 * @description Get public settings by slug
 * @access Public
 * @validation settingsSlugParamValidationSchema
 * @param {string} slug - Settings slug
 * @returns {Object} Public settings data
 */
router
  .route('/public/:slug')
  .get(
    validateRequest(settingsSlugParamValidationSchema),
    SettingsController.getPublicSettingsBySlug,
  );

/**
 * @route PUT /settings/admin/:slug
 * @description Update settings by slug
 * @access Private (Admin only)
 * @middleware auth(TRole.admin)
 * @validation settingsSlugParamValidationSchema, updateSettingsContentValidationSchema
 * @param {string} slug - Settings slug
 * @returns {Object} Updated settings data
 */
router
  .route('/admin/:slug')
  .put(
    auth(TRole.admin),
    validateRequest(settingsSlugParamValidationSchema),
    validateRequest(updateSettingsContentValidationSchema),
    SettingsController.updateSettingsBySlug,
  );

export const SettingsRoutes = router;
