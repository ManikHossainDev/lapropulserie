import { model, Schema } from 'mongoose';
import toJSON from '../../../common/plugins/toJSON';
import paginate from '../../../common/plugins/paginate';
import { TStudentModuleTrackerStatus } from './student-module-tracker.constant';
import {
  IStudentModuleTracker,
  IStudentModuleTrackerModel,
} from './student-module-tracker.interface';

const StudentModuleTrackerSchema = new Schema<IStudentModuleTracker>(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'JourneyModule',
      required: [true, 'moduleId is required'],
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'JourneyCapsule',
      required: [true, 'capsuleId is required'],
    },
    status: {
      type: String,
      enum: [
        TStudentModuleTrackerStatus.locked,
        TStudentModuleTrackerStatus.unlocked,
        TStudentModuleTrackerStatus.inProgress,
        TStudentModuleTrackerStatus.completed,
      ],
      required: [true, 'status is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true },
);

StudentModuleTrackerSchema.plugin(paginate);
StudentModuleTrackerSchema.plugin(toJSON);

export const StudentModuleTracker = model<
  IStudentModuleTracker,
  IStudentModuleTrackerModel
>('StudentModuleTracker', StudentModuleTrackerSchema);
