import { Schema, model } from 'mongoose';
import { IQuestion, QuestionModel } from '../question.interface';
import { TQuestionType } from '../question.constant';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const OptionSchema = new Schema(
  {
    sl: { type: Number, required: true },
    details: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    questionaryId: { type: Schema.Types.ObjectId, ref: 'Questionary', required: [true, 'questionaryId is required'] },
    sl: { type: Number, required: [true, 'sl is required'] },
    title: { type: String, required: [true, 'title is required'] },
    type: {
      type: String,
      enum: [TQuestionType.single, TQuestionType.multi, TQuestionType.textInput, TQuestionType.textArea],
      required: [true, 'type is required'],
    },
    helperText: { type: String, required: false },
    options: { type: [OptionSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

QuestionSchema.plugin(paginate);
QuestionSchema.plugin(toJSON);

export const Question = model<IQuestion, QuestionModel>('Question', QuestionSchema);
