import { model, Schema } from 'mongoose';
import {
  IJourneyMariiReport,
  IJourneyMariiReportModel,
} from './journey-marii-report.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const ResourcesSchema = new Schema(
  {
    books: { type: [String], default: [] },
    podcasts: { type: [String], default: [] },
    exercises: { type: [String], default: [] },
    capsules: { type: [String], default: [] },
    mentors: { type: [String], default: [] },
  },
  { _id: false },
);

const ReportContentSchema = new Schema(
  {
    greeting: { type: String, required: true },
    mainTheme: { type: String, required: true },
    secondaryThemes: { type: [String], default: [] },
    observations: { type: String, required: true },
    strengths: { type: [String], default: [] },
    vigilancePoints: { type: [String], default: [] },
    reflectionQuestions: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    resources: { type: ResourcesSchema, default: () => ({}) },
    mentorSuggestion: { type: String, default: '' },
    closingMessage: { type: String, required: true },
  },
  { _id: false },
);

const JourneyMariiReportSchema = new Schema<IJourneyMariiReport>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    journeyId: { type: Schema.Types.ObjectId, ref: 'Journey', required: true },
    report: { type: ReportContentSchema, required: true },
    reportHtml: { type: String, required: true },
    source: { type: String, enum: ['template', 'ai'], default: 'template' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

JourneyMariiReportSchema.index(
  { studentId: 1, journeyId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

JourneyMariiReportSchema.plugin(paginate);
JourneyMariiReportSchema.plugin(toJSON);

export const JourneyMariiReport = model<IJourneyMariiReport, IJourneyMariiReportModel>(
  'JourneyMariiReport',
  JourneyMariiReportSchema,
);
