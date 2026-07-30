import { model, Schema } from 'mongoose';
import { ILessonProgress, ILessonProgressModel } from './individual-lesson-progress.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { TLessonProgress } from './individual-lesson-progress.constant';

const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualCapsule',
      required: [true, 'capsuleId is required'],
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualModule',
      required: [true, 'moduleId is required'],
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualLesson',
      required: [true, 'lessonId is required'],
    },
    status: {
      type: String,
      enum: [
        TLessonProgress.locked,
        TLessonProgress.unlocked,
        TLessonProgress.inProgress,
        TLessonProgress.completed,
      ],
      required: [true, 'status is required'],
    },
    lastWatchTime: {
      type: Number,
      required: [false, 'lastWatchTime is not required'],
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      required: [false, 'isCompleted is not required'],
      default: false,
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

LessonProgressSchema.plugin(paginate);
LessonProgressSchema.plugin(toJSON);

export const LessonProgress = model<
  ILessonProgress,
  ILessonProgressModel
>('LessonProgress', LessonProgressSchema);
