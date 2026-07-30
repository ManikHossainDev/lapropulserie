import { model, Schema } from 'mongoose';
import {
  IStudentQuestionnaireSummary,
  IStudentQuestionnaireSummaryModel,
} from './student-questionnaire-summary.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const StudentQuestionnaireSummarySchema =
  new Schema<IStudentQuestionnaireSummary>(
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
      title: {
        type: String,
        required: [true, 'title is required'],
      },
      texts: {
        type: [String],
        required: [true, 'texts are required'],
        default: [],
      },
      summary: {
        type: String,
        required: [true, 'summary is required'],
      },
      sections: {
        type: [
          {
            _id: false,
            title: { type: String, default: '' },
            brief: { type: String, default: '' },
            items: { type: [String], default: [] },
          },
        ],
        default: [],
      },
      recommendedMentorIds: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: [],
      },
      isDeleted: {
        type: Boolean,
        required: [false, 'isDeleted is not required'],
        default: false,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    },
  );

StudentQuestionnaireSummarySchema.plugin(paginate);
StudentQuestionnaireSummarySchema.plugin(toJSON);

export const StudentQuestionnaireSummary = model<
  IStudentQuestionnaireSummary,
  IStudentQuestionnaireSummaryModel
>('StudentQuestionnaireSummary', StudentQuestionnaireSummarySchema);
