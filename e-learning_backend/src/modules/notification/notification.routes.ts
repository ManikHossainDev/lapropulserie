/**
 * Notification Routes
 *
 * Endpoints for notification retrieval, viewing, deletion,
 * unread count, and mark-all-as-read operations.
 *
 * @module NotificationRoutes
 */

import { Router } from 'express';
import auth from '../../middlewares/auth';
import { NotificationController } from './notification.controllers';
import { TRole } from '../../middlewares/roles';

const router = Router();

// ── Bulk Operations ──────────────────────────────────────────────────────────

/** GET /notifications/unread-count — Unread notification count */
router
  .route('/unread-count')
  .get(auth(TRole.common), NotificationController.getUnreadCount);

/** PATCH /notifications/mark-all-read — Mark all notifications as read */
router
  .route('/mark-all-read')
  .patch(auth(TRole.common), NotificationController.markAllAsRead);

/** DELETE /notifications/clear-all — Soft-delete all notifications */
router
  .route('/clear-all')
  .delete(auth(TRole.common), NotificationController.clearAllNotifications);

/** GET /notifications/admin — Admin notifications */
router
  .route('/admin')
  .get(auth(TRole.admin), NotificationController.getAdminNotifications);

// ── Collection & Single-Resource ─────────────────────────────────────────────

/** GET /notifications/ — List user notifications (paginated) */
router
  .route('/')
  .get(auth(TRole.common), NotificationController.getAllNotifications);

/**
 * GET    /notifications/:id — Get single notification
 * PATCH  /notifications/:id — Mark single notification as read
 * DELETE /notifications/:id — Soft-delete single notification
 */
router
  .route('/:id')
  .get(auth(TRole.common), NotificationController.getSingleNotification)
  .patch(auth(TRole.common), NotificationController.viewNotification)
  .delete(auth(TRole.common), NotificationController.deleteNotification);

export const NotificationRoutes = router;
