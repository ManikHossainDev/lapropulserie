import { Schema, model } from 'mongoose';
import { IQuestionary, QuestionaryModel } from '../question.interface';
import { TQuestionaryCategory } from '../question.constant';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { normalizeOptionalObjectId } from '../question.utils';

const QuestionarySchema = new Schema<IQuestionary>(
  {
    title: { type: String, required: [true, 'title is required'] },
    brief: { type: String, required: [true, 'brief is required'] },
    category: {
      type: String,
      enum: [
        TQuestionaryCategory.free,
        TQuestionaryCategory.module,
        TQuestionaryCategory.capsule,
      ],
      required: [true, 'category is required'],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: false,
      set: normalizeOptionalObjectId,
    }, // Optional, useful for module or capsule
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

QuestionarySchema.plugin(paginate);
QuestionarySchema.plugin(toJSON);

export const Questionary = model<IQuestionary, QuestionaryModel>(
  'Questionary',
  QuestionarySchema,
);
