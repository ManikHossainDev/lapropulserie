import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IJourneyModule {
  _id?: Types.ObjectId;
  sl: number;
  title: string;
  roadMapBrief: string;
  description: string;
  estimatedTime: string;
  moduleVideo?: {
    url?: string;
    duration?: number;
    status?: 'processing' | 'ready' | 'failed';
    errorMessage?: string;
  };
  capsuleId: Types.ObjectId;
  questionaryId?: Types.ObjectId;
  orderNumber: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJourneyModuleModel extends Model<IJourneyModule> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IJourneyModule>>;
}
