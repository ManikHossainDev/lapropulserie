/**
 * Attachment Routes Module
 *
 * This module defines all attachment-related endpoints including:
 * - Attachment CRUD operations
 * - Paginated attachment retrieval
 * - Attachment updates and deletions
 *
 * Security Features:
 * - Authentication middleware for all routes
 * - Role-based access control
 *
 * @module AttachmentRoutes
 */

import express from 'express';
import auth from '../../middlewares/auth';
import { AttachmentController } from './attachment.controller';
import { TRole } from '../../middlewares/roles';

const router = express.Router();

// ============================================================================
// ATTACHMENT ROUTES
// ============================================================================

/**
 * @route GET /attachments/paginate
 * @description Get all attachments with pagination
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} Paginated attachment list
 */
router
  .route('/paginate')
  .get(auth(TRole.common), AttachmentController.getAllAttachmentWithPagination);

/**
 * @route GET /attachments/:attachmentId
 * @description Get a specific attachment by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} attachmentId - Attachment ID
 * @returns {Object} Attachment data
 */
router
  .route('/:attachmentId')
  .get(auth(TRole.common), AttachmentController.getAAttachment);

/**
 * @route PUT /attachments/update/:attachmentId
 * @description Update an attachment by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} attachmentId - Attachment ID
 * @returns {Object} Updated attachment data
 */
router
  .route('/update/:attachmentId')
  .put(auth(TRole.common), AttachmentController.updateById);

/**
 * @route GET /attachments/
 * @description Get all attachments
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} List of all attachments
 */
router
  .route('/')
  .get(auth(TRole.common), AttachmentController.getAllAttachment);

/**
 * @route DELETE /attachments/:attachmentId
 * @description Delete an attachment by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} attachmentId - Attachment ID
 * @returns {Object} Deletion confirmation
 */
router
  .route('/:attachmentId')
  .delete(auth(TRole.common), AttachmentController.deleteById);

/**
 * @route GET /attachments/stream/:attachmentId
 * @description Stream attachment file content (for videos/images)
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @param {string} attachmentId - Attachment ID
 * @returns {Stream} File stream
 */
router
  .route('/stream/:attachmentId')
  .get(auth(TRole.common), AttachmentController.streamAttachment);

export const AttachmentRoutes = router;
