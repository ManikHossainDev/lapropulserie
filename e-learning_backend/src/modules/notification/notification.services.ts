import { StatusCodes } from 'http-status-codes';
import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import { PaginateOptions, PaginateResult } from '../../types/paginate';
import ApiError from '../../errors/ApiError';
import mongoose from 'mongoose';
import { TRole } from '../../middlewares/roles';

/**
 * Create a new notification record.
 */
const addNotification = async (
  payload: INotification
): Promise<INotification> => {
  const result = await Notification.create(payload);
  return result;
};

/**
 * Get all notifications for a specific user with pagination.
 * Also returns the count of unviewed notifications.
 */
const getAllNotifications = async (
  filters: Partial<INotification>,
  options: PaginateOptions,
  userId: string
) => {
  filters.receiverId = new mongoose.Types.ObjectId(userId);
  filters.isDeleted = false;
  options.sortBy = '-createdAt';

  const [result, unViewNotificationCount] = await Promise.all([
    Notification.paginate(filters, options),
    Notification.countDocuments({
      receiverId: userId,
      viewStatus: false,
      isDeleted: false,
    }),
  ]);

  return { ...result, unViewNotificationCount };
};

/**
 * Get all admin-targeted notifications with pagination.
 */
const getAdminNotifications = async (
  filters: Partial<INotification>,
  options: PaginateOptions
): Promise<PaginateResult<INotification>> => {
  filters.receiverRole = TRole.admin;
  filters.isDeleted = false;
  options.sortBy = '-createdAt';

  return Notification.paginate(filters, options);
};

/**
 * Get a single notification by ID.
 */
const getSingleNotification = async (
  notificationId: string
): Promise<INotification | null> => {
  const result = await Notification.findById(notificationId);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
  }
  return result;
};

/**
 * Mark a single notification as viewed and set readAt timestamp.
 */
const viewNotification = async (notificationId: string) => {
  const result = await Notification.findByIdAndUpdate(
    notificationId,
    { viewStatus: true, readAt: new Date() },
    { new: true }
  );
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
  }
  return result;
};

/**
 * Get unread (unviewed) notification count for a user.
 */
const getUnreadCount = async (userId: string): Promise<number> => {
  const count = await Notification.countDocuments({
    receiverId: userId,
    viewStatus: false,
    isDeleted: false,
  });
  return count;
};

/**
 * Mark all notifications as read for a specific user.
 */
const markAllAsRead = async (userId: string) => {
  const result = await Notification.updateMany(
    { receiverId: userId, viewStatus: false, isDeleted: false },
    { viewStatus: true, readAt: new Date() }
  );
  return result;
};

/**
 * Soft delete a single notification by ID.
 */
const deleteNotification = async (notificationId: string) => {
  const result = await Notification.findByIdAndUpdate(
    notificationId,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
  }
  return result;
};

/**
 * Soft delete all notifications for a user.
 */
const clearAllNotifications = async (userId: string) => {
  const result = await Notification.updateMany(
    { receiverId: userId, isDeleted: false },
    { isDeleted: true }
  );
  return result;
};

export const NotificationService = {
  addNotification,
  getAllNotifications,
  getAdminNotifications,
  getSingleNotification,
  viewNotification,
  getUnreadCount,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
