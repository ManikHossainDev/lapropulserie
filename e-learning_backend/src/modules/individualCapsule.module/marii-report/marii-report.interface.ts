import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IMariiReportResources {
  books: string[];
  podcasts: string[];
  exercises: string[];
  capsules: string[];
  mentors: string[];
}

export interface IMariiReportContent {
  greeting: string;
  mainTheme: string;
  secondaryThemes: string[];
  observations: string;
  strengths: string[];
  vigilancePoints: string[];
  reflectionQuestions: string[];
  recommendations: string[];
  resources: IMariiReportResources;
  mentorSuggestion: string;
  closingMessage: string;
}

export interface IMariiReport {
  _id?: Types.ObjectId;
  studentId: Types.ObjectId;
  capsuleId: Types.ObjectId;
  report: IMariiReportContent;
  reportHtml: string;
  source: 'template' | 'ai';
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMariiReportModel extends Model<IMariiReport> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IMariiReport>>;
}
