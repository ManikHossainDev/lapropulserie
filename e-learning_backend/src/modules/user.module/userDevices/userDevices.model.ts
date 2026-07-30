import { model, Schema } from 'mongoose';
import { IUserDevices, IUserDevicesModel } from './userDevices.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { UserDevicesType } from './userDevices.constant';


const UserDevicesSchema = new Schema<IUserDevices>(
  {
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    fcmToken: {
      type: String,
      required: [true, 'FCM Token is required'],
    },
    deviceType: {
      type: String,
      enum: [
        UserDevicesType.ios, 
        UserDevicesType.android,
        UserDevicesType.web
      ],
      required: [true, 'Device type is required'],
    },
    deviceName: {
      type: String,
      trim: true,
    },
    ipAddress: { //🆕
      type: String,
      trim: true,
    },
    userAgent: { //🆕
      type: String,
      trim: true,
    },
    
    // we can add location also 

    lastActive: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

UserDevicesSchema.plugin(paginate as any);
UserDevicesSchema.plugin(toJSON as any);

export const UserDevices = model<
  IUserDevices,
  IUserDevicesModel
>('UserDevices', UserDevicesSchema);
