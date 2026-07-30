import { Document, Model, Types } from 'mongoose';
import { TQuestionaryCategory, TQuestionType, TStudentQuestionaryStatus, TStudentAnswerStatus } from './question.constant';

export interface IQuestionary extends Document {
  title: string;
  brief: string;
  category: TQuestionaryCategory;
  referenceId?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type QuestionaryModel = Model<IQuestionary, Record<string, unknown>>;

export interface IQuestionOption {
  sl: number;
  details: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  questionaryId: Types.ObjectId;
  sl: number;
  title: string;
  type: TQuestionType;
  helperText?: string;
  options: IQuestionOption[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type QuestionModel = Model<IQuestion, Record<string, unknown>>;

export interface IStudentAnswer extends Document {
  studentId: Types.ObjectId;
  questionaryId: Types.ObjectId;
  questionId: Types.ObjectId;
  answer: any;
  questionType?: string;
  capsuleId?: Types.ObjectId;
  status: TStudentAnswerStatus;
  isCorrect?: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type StudentAnswerModel = Model<IStudentAnswer, Record<string, unknown>>;

export interface IStudentQuestionaryTracker extends Document {
  studentId: Types.ObjectId;
  questionaryId: Types.ObjectId;
  lastQuestionId?: Types.ObjectId;
  status: TStudentQuestionaryStatus;
  progress: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type StudentQuestionaryTrackerModel = Model<IStudentQuestionaryTracker, Record<string, unknown>>;
