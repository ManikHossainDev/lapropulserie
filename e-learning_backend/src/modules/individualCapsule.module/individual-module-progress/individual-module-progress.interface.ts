import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TIndividualModuleProgress } from './individual-module-progress.constant';

export interface IIndividualModuleProgress {
  _id?: Types.ObjectId;
  studentId: Types.ObjectId;
  moduleId: Types.ObjectId;
  capsuleId: Types.ObjectId;
  status: TIndividualModuleProgress;
  completedLessonsCount: number;
  totalLessons: number;
  completedAt?: Date;
  viewedAt?: Date;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IIndividualModuleProgressModel extends Model<IIndividualModuleProgress> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IIndividualModuleProgress>>;
}
