import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IReflectionAnswerItem {
  orderNumber: number;
  answer: string;
}

export interface IExerciseAnswerItem {
  orderNumber: number;
  answer: string;
}

export interface ILearnerAnswer {
  _id?: Types.ObjectId;
  studentId: Types.ObjectId;
  capsuleId: Types.ObjectId;
  reflectionAnswers: IReflectionAnswerItem[];
  exerciseAnswers: IExerciseAnswerItem[];
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILearnerAnswerModel extends Model<ILearnerAnswer> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ILearnerAnswer>>;
}

export interface ISaveLearnerAnswersPayload {
  capsuleId: string;
  journeyId?: string;
  reflectionAnswers?: IReflectionAnswerItem[];
  exerciseAnswers?: IExerciseAnswerItem[];
}
