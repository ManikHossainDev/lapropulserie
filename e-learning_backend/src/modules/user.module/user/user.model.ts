import { model, Schema, Types } from 'mongoose';
import { TProfileImage, IUser, UserModal } from './user.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import bcryptjs from 'bcryptjs';
import { config } from '../../../config';
import { TJourneyType, TPreferredLanguage, TStatusType } from './user.constant';
import { Roles } from '../../../middlewares/roles';
import { TAuthProvider } from '../../auth/auth.constants';

// Profile Image Schema
const profileImageSchema = new Schema<TProfileImage>({
  imageUrl: {
    type: String,
    required: [true, 'Image url is required'],
    default: '/uploads/users/user.png',
  },
});

// Apply the toJSON plugin to profileImageSchema
profileImageSchema.plugin(toJSON);

// User Schema Definition
const userSchema = new Schema<IUser, UserModal>(
  {
    profileId: {
      type: Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    role: {
      type: String,
      enum: {
        values: Roles,
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
    },

    // nullable for social login ..
    password: {
      type: String,
      required: [false, 'Password is not required'],
      select: false,
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    profileImage: {
      type: profileImageSchema,
      required: false,
      default: { imageUrl: '/uploads/users/user.png' },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      // TODO : add proper validation
      type: String,
    },

    // 🔑 CALendly Integration Fields
    calendly: {
      userId: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
      },

      // ✅ store full URIs — needed for all API calls
      userUri: String,
      organizationUri: String,

      // tokens
      encryptedAccessToken: String, // NEVER store raw tokens
      refreshToken: String,
      expiresAt: Date,

      // meta
      webhookSubscriptionId: String,
      profileUrl: String, // e.g., "https://calendly.com/mentor-john"
      connectedAt: Date,
      disconnectedAt: Date,
    },

    //---------------------------------
    // Auth related
    //---------------------------------

    authProvider: {
      type: String,
      enum: [TAuthProvider.local, TAuthProvider.google, TAuthProvider.apple],
      default: 'local',
    },

    lastPasswordChange: { type: Date },
    isResetPassword: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: { type: Date },

    //---------------------------------
    // Wallet Related Info
    //---------------------------------
    walletId: {
      type: Types.ObjectId,
      ref: 'Wallet',
      required: false, // user and admin don't need any wallet .. only provider need wallet
      default: null,
    },
    subscriptionType: {
      type: String,
      default: 'none',
      index: true,
    },
    stripeCustomerId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    hasUsedFreeTrial: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(TStatusType),
      default: TStatusType.active,
      index: true,
    },
    journeyType: {
      type: String,
      enum: Object.values(TJourneyType),
      default: TJourneyType.both,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    hasCompletedQuestionnaire: {
      type: Boolean,
      default: false,
    },
    activeQuestionary: {
      questionaryId: { type: Schema.Types.ObjectId, ref: 'Questionary' },
      questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  },
);

// Apply the paginate plugin
userSchema.plugin(paginate);
userSchema.plugin(toJSON);

// Static methods
userSchema.statics.isExistUserById = async function (id: string) {
  return await this.findById(id);
};

userSchema.statics.isExistUserByEmail = async function (email: string) {
  return await this.findOne({ email });
};

userSchema.statics.isMatchPassword = async function (
  password: string,
  hashPassword: string,
): Promise<boolean> {
  return await bcryptjs.compare(password, hashPassword);
};

// Export the User model
export const User = model<IUser, UserModal>('User', userSchema);
