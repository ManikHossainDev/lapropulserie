import { Schema, model } from 'mongoose';
import { IStudentAnswer, StudentAnswerModel } from '../question.interface';
import { TStudentAnswerStatus } from '../question.constant';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { normalizeOptionalObjectId } from '../question.utils';

const StudentAnswerSchema = new Schema<IStudentAnswer>(
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
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'questionId is required'],
    },
    answer: {
      type: Schema.Types.Mixed,
      required: [true, 'answer is required'],
    },
    questionType: { type: String, required: false },
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: false,
      set: normalizeOptionalObjectId,
    },
    status: {
      type: String,
      enum: [TStudentAnswerStatus.completed, TStudentAnswerStatus.submitted],
      default: TStudentAnswerStatus.completed,
    },
    isCorrect: { type: Boolean, required: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

StudentAnswerSchema.plugin(paginate);
StudentAnswerSchema.plugin(toJSON);

export const StudentAnswer = model<IStudentAnswer, StudentAnswerModel>(
  'StudentAnswer',
  StudentAnswerSchema,
);
