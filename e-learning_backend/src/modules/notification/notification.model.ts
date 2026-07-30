import { model, Schema } from 'mongoose';
import { INotification, INotificationModal } from './notification.interface';
import paginate from '../../common/plugins/paginate';
import toJSON from '../../common/plugins/toJSON';
import { Roles } from '../../middlewares/roles';
import { TNotificationType } from './notification.constants';

const notificationSchema = new Schema<INotification>(
  {
    title: {
      en: {
        type: String,
        required: [true, 'English notification title is required'],
        trim: true,
      },
      fr: {
        type: String,
        required: [true, 'French notification title is required'],
        trim: true,
      },
    },

    subTitle: {
      type: String,
      trim: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    receiverRole: {
      type: String,
      enum: Roles,
      required: false,
    },

    type: {
      type: String,
      enum: Object.values(TNotificationType),
      required: true,
    },

    idOfType: {
      type: String,
      required: false,
    },

    linkFor: {
      type: String,
    },

    linkId: {
      type: String,
    },

    viewStatus: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

/* Compound index for efficient unread-count and listing queries */
notificationSchema.index({ receiverId: 1, viewStatus: 1, isDeleted: 1 });

notificationSchema.plugin(paginate);
notificationSchema.plugin(toJSON);

export const Notification = model<INotification, INotificationModal>(
  'Notification',
  notificationSchema
);
