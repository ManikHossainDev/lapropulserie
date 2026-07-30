import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.services';
import catchAsync from '../../shared/catchAsync';
import pick from '../../shared/pick';
import sendResponse from '../../shared/sendResponse';
import { notificationFilters } from './notification.constants';

/**
 * Get all notifications for the authenticated user with pagination.
 */
const getAllNotifications = catchAsync(async (req, res) => {
  const filters = pick(req.query, notificationFilters);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const userId = req.user.userId;

  const result = await NotificationService.getAllNotifications(
    filters,
    options,
    userId
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Notifications fetched successfully',
    success: true,
  });
});

/**
 * Get admin-targeted notifications with pagination.
 */
const getAdminNotifications = catchAsync(async (req, res) => {
  const filters = pick(req.query, notificationFilters);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

  const result = await NotificationService.getAdminNotifications(
    filters,
    options
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Admin notifications fetched successfully',
    success: true,
  });
});

/**
 * Get a single notification by ID.
 */
const getSingleNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NotificationService.getSingleNotification(id as string);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Notification fetched successfully',
    success: true,
  });
});

/**
 * Mark a single notification as viewed.
 */
const viewNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NotificationService.viewNotification(id as string);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Notification marked as read',
    success: true,
  });
});

/**
 * Get unread notification count for the authenticated user.
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const count = await NotificationService.getUnreadCount(userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: { unreadCount: count },
    message: 'Unread notification count fetched successfully',
    success: true,
  });
});

/**
 * Mark all notifications as read for the authenticated user.
 */
const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await NotificationService.markAllAsRead(userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: { modifiedCount: result.modifiedCount },
    message: 'All notifications marked as read',
    success: true,
  });
});

/**
 * Soft delete a single notification.
 */
const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NotificationService.deleteNotification(id as string);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Notification deleted successfully',
    success: true,
    data: {},
  });
});

/**
 * Soft delete all notifications for the authenticated user.
 */
const clearAllNotifications = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await NotificationService.clearAllNotifications(userId as string);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'All notifications cleared successfully',
    success: true,
    data: { modifiedCount: result.modifiedCount },
  });
});

export const NotificationController = {
  getAllNotifications,
  getAdminNotifications,
  getSingleNotification,
  viewNotification,
  getUnreadCount,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
