import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { IMariiReportContent } from './marii-report.interface';

export interface IJourneyMariiReport {
  _id?: Types.ObjectId;
  studentId: Types.ObjectId;
  journeyId: Types.ObjectId;
  report: IMariiReportContent;
  reportHtml: string;
  source: 'template' | 'ai';
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJourneyMariiReportModel extends Model<IJourneyMariiReport> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IJourneyMariiReport>>;
}
