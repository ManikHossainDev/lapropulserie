//@ts-ignore
import { model, Schema } from 'mongoose';
import { ISessionStore, ISessionStoreModel } from './sessionStore.interface';
import paginate from '../../../common/plugins/paginate';

// This enables logout-all-devices, revoke device, detect token theft.
const SessionStoreSchema = new Schema<ISessionStore>(
  {
    sessionId: {
        type: String,
    },
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    refreshTokenHash : { //🆕
        type : String,
        required : true,
    },
    expiresAt : { //🆕
      type : Date,
    },
    rotatedFrom : { // 🆕 Previous session Id
        type : String,
        required : true,
    },
    deviceId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    isRevoked : { //🆕
      type : Boolean,
    },
    revokedAt : { //🆕
      type : Date,
    },
    lastUsedAt : { //🆕
        type : Date,
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

SessionStoreSchema.plugin(paginate as any);

SessionStoreSchema.pre('save', function (next) {
  next();
});

// Use transform to rename _id to _userRoleDataId
SessionStoreSchema.set('toJSON', {
  transform: function (_doc: any, ret: any, _options: any) {
    ret._userRoleDataId = ret._id;
    delete ret._id;
    return ret;
  },
});

export const SessionStore = model<
  ISessionStore,
  ISessionStoreModel
>('SessionStore', SessionStoreSchema);
