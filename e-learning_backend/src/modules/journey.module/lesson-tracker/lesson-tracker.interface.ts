import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TLessonTrackerStatus } from './lesson-tracker.constant';

export interface ILessonTracker {
  _id?: Types.ObjectId;
  studentId: Types.ObjectId;
  journeyId: Types.ObjectId;
  capsuleId: Types.ObjectId;
  moduleId: Types.ObjectId;
  lessonId: Types.ObjectId;
  status: TLessonTrackerStatus;
  lastWatchTime?: number;
  isCompleted?: boolean;
  completedAt?: Date;
  viewedAt?: Date;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonTrackerModel extends Model<ILessonTracker> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ILessonTracker>>;
}
