//@ts-ignore
import { Document, Model, Types } from 'mongoose';
import { Role } from '../../../middlewares/roles';
import { TJourneyType, TStatusType } from './user.constant';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export type TProfileImage = {
  imageUrl: string;
  // file: Record<string, any>;
};

export type TCalendlyInfo = {
  userId?: string | null;
  userUri?: string | null;
  organizationUri?: string | null;
  encryptedAccessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  webhookSubscriptionId?: string | null;
  profileUrl?: string | null;
  connectedAt?: Date | null;
  disconnectedAt?: Date | null;
};

export interface IUser extends Document {
  _userId: undefined | Types.ObjectId;
  _id: Types.ObjectId;
  profileId: Types.ObjectId | undefined;
  name: string;
  email: string;
  role: Role;
  password: string;
  profileImage?: TProfileImage;
  isEmailVerified: boolean;
  phoneNumber: string;
  calendly?: TCalendlyInfo;
  authProvider: string;
  lastPasswordChange: Date;
  isResetPassword: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | undefined;

  walletId?: Types.ObjectId;

  subscriptionType: string;
  stripeCustomerId?: string | null;
  hasUsedFreeTrial?: boolean;

  status: TStatusType;
  journeyType: TJourneyType;
  isDeleted: boolean;
  deletedAt: Date | null;

  // Questionnaire tracking
  hasCompletedQuestionnaire: boolean;
  activeQuestionary?: {
    questionaryId?: Types.ObjectId;
    questionId?: Types.ObjectId;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateUserInfo {
  name?: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: string[];
  location?: string;
  dob?: Date;
  gender?: string;
}

export interface IUserManagementFilters {
  search?: string;
  role?: Role;
  status?: TStatusType;
  journeyType?: TJourneyType;
  isDeleted?: boolean;
  from?: Date | string;
  to?: Date | string;
}

export interface UserModal extends Model<IUser> {
  paginate: (
    filter: object,
    options: PaginateOptions,
  ) => Promise<PaginateResult<IUser>>;
  isExistUserById(id: string): Promise<Partial<IUser> | null>;
  isExistUserByEmail(email: string): Promise<Partial<IUser> | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}
