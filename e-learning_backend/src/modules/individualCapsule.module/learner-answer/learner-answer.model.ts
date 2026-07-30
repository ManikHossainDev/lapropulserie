import { model, Schema } from 'mongoose';
import { ILearnerAnswer, ILearnerAnswerModel } from './learner-answer.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const ReflectionAnswerItemSchema = new Schema(
  {
    orderNumber: { type: Number, required: true, min: 1 },
    answer: { type: String, required: true, default: '' },
  },
  { _id: false },
);

const ExerciseAnswerItemSchema = new Schema(
  {
    orderNumber: { type: Number, required: true, min: 1 },
    answer: { type: String, required: true, default: '' },
  },
  { _id: false },
);

const LearnerAnswerSchema = new Schema<ILearnerAnswer>(
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
    reflectionAnswers: {
      type: [ReflectionAnswerItemSchema],
      default: [],
    },
    exerciseAnswers: {
      type: [ExerciseAnswerItemSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

LearnerAnswerSchema.index(
  { studentId: 1, capsuleId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

LearnerAnswerSchema.plugin(paginate);
LearnerAnswerSchema.plugin(toJSON);

export const LearnerAnswer = model<ILearnerAnswer, ILearnerAnswerModel>(
  'LearnerAnswer',
  LearnerAnswerSchema,
);
