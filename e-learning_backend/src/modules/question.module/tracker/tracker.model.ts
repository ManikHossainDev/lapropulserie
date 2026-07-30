import { Schema, model } from 'mongoose';
import {
  IStudentQuestionaryTracker,
  StudentQuestionaryTrackerModel,
} from '../question.interface';
import { TStudentQuestionaryStatus } from '../question.constant';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { normalizeOptionalObjectId } from '../question.utils';

const TrackerSchema = new Schema<IStudentQuestionaryTracker>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    questionaryId: {
      type: Schema.Types.ObjectId,
      ref: 'Questionary',
      required: [true, 'questionaryId is required'],
    },
    lastQuestionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: false,
      set: normalizeOptionalObjectId,
    },
    status: {
      type: String,
      enum: [
        TStudentQuestionaryStatus.inProgress,
        TStudentQuestionaryStatus.completed,
      ],
      default: TStudentQuestionaryStatus.inProgress,
    },
    progress: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

TrackerSchema.plugin(paginate);
TrackerSchema.plugin(toJSON);

export const StudentQuestionaryTracker = model<
  IStudentQuestionaryTracker,
  StudentQuestionaryTrackerModel
>('StudentQuestionaryTracker', TrackerSchema);
