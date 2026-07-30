//@ts-ignore
import { model, Schema } from 'mongoose';
import { IUserRoleData, IUserRoleDataModel } from './userRoleData.interface';
import paginate from '../../../common/plugins/paginate';
import { TAdminStatus, TProviderApprovalStatus } from './userRoleData.constant';
import toJSON from '../../../common/plugins/toJSON';

const UserRoleDataSchema = new Schema<IUserRoleData>(
  {
    userId: {
      //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    adminStatus: {
      type: String,
      enum: [
        TAdminStatus.active,
        TAdminStatus.inactive,
        // TAdminStatus.none // i dont this we need this
      ],
    },
    providerApprovalStatus: {
      type: String,
      enum: [
        TProviderApprovalStatus.accept,
        TProviderApprovalStatus.reject,
        TProviderApprovalStatus.pending,
        TProviderApprovalStatus.requested,
      ],
    },
    approvedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

UserRoleDataSchema.plugin(paginate);
UserRoleDataSchema.plugin(toJSON);

export const UserRoleData = model<
  IUserRoleData,
  IUserRoleDataModel
>('UserRoleData', UserRoleDataSchema);
