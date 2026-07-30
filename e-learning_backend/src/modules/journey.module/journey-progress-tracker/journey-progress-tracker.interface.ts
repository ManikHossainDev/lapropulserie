import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TCurrentSection, TTrackerStatus, TItemType } from './journey-progress-tracker.constant';

export interface IModuleProgress {
  moduleId: Types.ObjectId;
  status: TTrackerStatus.notStarted | TTrackerStatus.inProgress | TTrackerStatus.completed;
  completedAt?: Date;
  lastWatchTime?: number;
}

export interface ISectionStatuses {
  introduction: TTrackerStatus;
  inspiration: TTrackerStatus;
  diagnostics: TTrackerStatus;
  science: TTrackerStatus;
  aiSummary: TTrackerStatus;
}

export interface IJourneyProgressTracker {
  _id?: Types.ObjectId;
  studentId: Types.ObjectId;
  journeyId: Types.ObjectId;
  capsuleId: Types.ObjectId;
  moduleId?: Types.ObjectId;
  currentSection: TCurrentSection;
  sectionStatuses: ISectionStatuses;
  moduleProgress: IModuleProgress[];
  lastAccessedItem?: {
    itemType: TItemType;
    itemId: Types.ObjectId;
    lastWatchTime?: number;
    accessedAt: Date;
  };
  overallProgressPercentage: number;
  overallStatus: TTrackerStatus;
  completedAt?: Date;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJourneyProgressTrackerModel extends Model<IJourneyProgressTracker> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IJourneyProgressTracker>>;
}
