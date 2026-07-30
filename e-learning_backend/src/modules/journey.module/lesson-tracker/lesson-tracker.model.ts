import { model, Schema } from 'mongoose';
import { ILessonTracker, ILessonTrackerModel } from './lesson-tracker.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { TLessonTrackerStatus } from './lesson-tracker.constant';

const LessonTrackerSchema = new Schema<ILessonTracker>(
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
      required: [true, 'moduleId is required'],
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'JourneyLesson',
      required: [true, 'lessonId is required'],
    },
    status: {
      type: String,
      enum: Object.values(TLessonTrackerStatus),
      default: TLessonTrackerStatus.locked,
      required: [true, 'status is required'],
    },
    lastWatchTime: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    viewedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

LessonTrackerSchema.plugin(paginate);
LessonTrackerSchema.plugin(toJSON);

export const LessonTracker = model<ILessonTracker, ILessonTrackerModel>(
  'LessonTracker',
  LessonTrackerSchema
);
