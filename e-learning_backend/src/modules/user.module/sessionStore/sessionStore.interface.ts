import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface ISessionStore {
  _id?: Types.ObjectId;
  sessionId?: string;
  userId: Types.ObjectId;
  refreshTokenHash: string;
  expiresAt?: Date;
  rotatedFrom?: string;
  deviceId?: Types.ObjectId;
  isRevoked?: boolean;
  revokedAt?: Date;
  lastUsedAt?: Date;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISessionStoreModel extends Model<ISessionStore> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISessionStore>>;
}