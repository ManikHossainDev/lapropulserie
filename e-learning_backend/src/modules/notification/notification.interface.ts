import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../types/paginate';
import { TNotificationType } from './notification.constants';
import { TRole } from '../../middlewares/roles';

export interface INotification {
  _id?: Types.ObjectId;
  title: {
    en: string;
    fr: string;
  };
  subTitle?: string;

  /** The user who triggered the notification */
  senderId?: Types.ObjectId;

  /** The specific user who should receive this notification */
  receiverId?: Types.ObjectId;

  /** Role-based delivery fallback (e.g. send to all admins) */
  receiverRole?: TRole;

  /** Notification category type */
  type: TNotificationType;

  /** ID of the related entity (e.g. withdrawalRequestId, paymentId) */
  idOfType?: Types.ObjectId;

  /** Deep-link query parameter key */
  linkFor?: string;

  /** Deep-link query parameter value */
  linkId?: string;

  /** Whether the notification has been viewed */
  viewStatus?: boolean;

  /** Timestamp when notification was read */
  readAt?: Date;

  /** Soft delete flag */
  isDeleted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotificationModal extends Model<INotification> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<INotification>>;
}
