import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IStudentQuestionnaireSummary {
  _id?: Types.ObjectId;
  studentId: Types.ObjectId;
  questionaryId: Types.ObjectId;
  title: string;
  texts: string[];
  summary: string;
  /** Structured Marii analysis (8 mandatory sections) */
  sections?: Array<{ title: string; brief: string; items: string[] }>;
  recommendedMentorIds: Types.ObjectId[];
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudentQuestionnaireSummaryModel extends Model<IStudentQuestionnaireSummary> {
  paginate(
    query: Record<string, any>,
    options: PaginateOptions,
  ): Promise<PaginateResult<IStudentQuestionnaireSummary>>;
}
