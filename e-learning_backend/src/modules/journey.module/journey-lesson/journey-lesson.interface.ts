import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IJourneyLesson {
  _id?: Types.ObjectId;
  sl: number;
  title: string;
  description?: string;
  lessonVideo?: {
    url?: string;
    duration?: number;
    status?: 'processing' | 'ready' | 'failed';
    errorMessage?: string;
  };
  moduleId: Types.ObjectId;
  estimatedTime: string;
  durationInSeconds?: number;
  orderNumber?: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJourneyLessonModel extends Model<IJourneyLesson> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IJourneyLesson>>;
}
