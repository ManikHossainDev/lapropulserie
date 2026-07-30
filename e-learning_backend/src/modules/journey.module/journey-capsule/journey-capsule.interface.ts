import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IJourneyCapsuleIntroduction {
  title: string;
  estimatedTime: string;
  roadMapBrief: string;
  description: string;
  introVideo?: {
    url?: string;
    duration?: number;
    status?: 'processing' | 'ready' | 'failed';
    errorMessage?: string;
  };
}

export interface IJourneyCapsule {
  _id?: Types.ObjectId;
  capsuleNumber: number;
  title: string;
  roadMapBrief: string;
  description: string;
  estimatedTime: string;
  thumbnail?: string;
  journeyId: Types.ObjectId;
  individualCapsuleId?: Types.ObjectId;
  totalModule: number;
  adminId: Types.ObjectId;
  introduction?: IJourneyCapsuleIntroduction;
  questionaryId?: Types.ObjectId;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJourneyCapsuleModel extends Model<IJourneyCapsule> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IJourneyCapsule>>;
}
