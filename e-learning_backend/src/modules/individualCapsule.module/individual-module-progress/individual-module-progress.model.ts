import { model, Schema } from 'mongoose';
import { IIndividualModuleProgress, IIndividualModuleProgressModel } from './individual-module-progress.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { TIndividualModuleProgress } from './individual-module-progress.constant';

const IndividualModuleProgressSchema = new Schema<IIndividualModuleProgress>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualModule',
      required: [true, 'moduleId is required'],
    },
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualCapsule',
      required: [true, 'capsuleId is required'],
    },
    status: {
      type: String,
      enum: [
        TIndividualModuleProgress.notStarted,
        TIndividualModuleProgress.inProgress,
        TIndividualModuleProgress.completed,
        TIndividualModuleProgress.unlocked,
        TIndividualModuleProgress.locked,
      ],
      required: [true, 'status is required'],
    },
    completedLessonsCount: {
      type: Number,
      required: [true, 'completedLessonsCount is required'],
      min: [0, 'completedLessonsCount cannot be negative'],
    },
    totalLessons: {
      type: Number,
      required: [true, 'totalLessons is required'],
      min: [1, 'totalLessons must be at least 1'],
    },
    completedAt: {
      type: Date,
      required: false,
    },
    viewedAt: {
      type: Date,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

IndividualModuleProgressSchema.plugin(paginate);
IndividualModuleProgressSchema.plugin(toJSON);

export const IndividualModuleProgress = model<
  IIndividualModuleProgress,
  IIndividualModuleProgressModel
>('IndividualModuleProgress', IndividualModuleProgressSchema);
