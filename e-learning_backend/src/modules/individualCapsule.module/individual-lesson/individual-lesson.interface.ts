import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IIndividualLesson {
  _id?: Types.ObjectId;
  title: string;
  estimatedTime: string;
  lessonVideo?: {
    url?: string;
    duration?: number;
    status?: 'processing' | 'ready' | 'failed';
    errorMessage?: string;
  };
  moduleId: Types.ObjectId;
  orderNumber: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IIndividualLessonModel extends Model<IIndividualLesson> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IIndividualLesson>>;
}
