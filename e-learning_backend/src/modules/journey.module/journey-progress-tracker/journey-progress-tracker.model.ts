import { model, Schema, Types } from 'mongoose';
import { IJourneyProgressTracker, IJourneyProgressTrackerModel, IModuleProgress, ISectionStatuses } from './journey-progress-tracker.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { TCurrentSection, TTrackerStatus, TItemType } from './journey-progress-tracker.constant';

const ModuleProgressSchema = new Schema<IModuleProgress>({
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'JourneyModule',
    required: [true, 'moduleId is required'],
  },
  status: {
    type: String,
    enum: Object.values(TTrackerStatus),
    required: [true, 'module status is required'],
    default: TTrackerStatus.notStarted,
  },
  completedAt: {
    type: Date,
  },
  lastWatchTime: {
    type: Number,
    default: 0,
  },
});

const SectionStatusesSchema = new Schema<ISectionStatuses>({
  introduction: {
    type: String,
    enum: Object.values(TTrackerStatus),
    required: [true, 'introduction status is required'],
    default: TTrackerStatus.notStarted,
  },
  inspiration: {
    type: String,
    enum: Object.values(TTrackerStatus),
    required: [true, 'inspiration status is required'],
    default: TTrackerStatus.notStarted,
  },
  diagnostics: {
    type: String,
    enum: Object.values(TTrackerStatus),
    required: [true, 'diagnostics status is required'],
    default: TTrackerStatus.notStarted,
  },
  science: {
    type: String,
    enum: Object.values(TTrackerStatus),
    required: [true, 'science status is required'],
    default: TTrackerStatus.notStarted,
  },
  aiSummary: {
    type: String,
    enum: Object.values(TTrackerStatus),
    required: [true, 'aiSummary status is required'],
    default: TTrackerStatus.notStarted,
  },
});

const JourneyProgressTrackerSchema = new Schema<IJourneyProgressTracker>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    journeyId: {
      type: Schema.Types.ObjectId,
      ref: 'Journey',
      required: [true, 'journeyId is required'],
    },
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'JourneyCapsule',
      required: [true, 'capsuleId is required'],
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'JourneyModule',
    },
    currentSection: {
      type: String,
      enum: Object.values(TCurrentSection),
      required: [true, 'currentSection is required'],
      default: TCurrentSection.introduction,
    },
    sectionStatuses: {
      type: SectionStatusesSchema,
      required: [true, 'sectionStatuses is required'],
    },
    moduleProgress: {
      type: [ModuleProgressSchema],
      default: [],
    },
    lastAccessedItem: {
      itemType: {
        type: String,
        enum: Object.values(TItemType),
      },
      itemId: {
        type: Schema.Types.ObjectId,
      },
      lastWatchTime: {
        type: Number,
        default: 0,
      },
      accessedAt: {
        type: Date,
      },
    },
    overallProgressPercentage: {
      type: Number,
      default: 0,
      min: [0, 'progress cannot be negative'],
      max: [100, 'progress cannot exceed 100'],
    },
    overallStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, 'overallStatus is required'],
      default: TTrackerStatus.notStarted,
    },
    completedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

JourneyProgressTrackerSchema.plugin(paginate);
JourneyProgressTrackerSchema.plugin(toJSON);

export const JourneyProgressTracker = model<
  IJourneyProgressTracker,
  IJourneyProgressTrackerModel
>('JourneyProgressTracker', JourneyProgressTrackerSchema);
