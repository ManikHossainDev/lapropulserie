import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TIndividualCapsuleLevel } from './individual-capsule.constant';

export interface IVideoInfo {
  url?: string;
  duration?: number;
  status?: 'processing' | 'ready' | 'failed';
  errorMessage?: string;
}

// ── Part sub-interfaces ───────────────────────────────────────────────────────

export interface IReflectionQuestion {
  question: string;
  orderNumber: number;
}

export interface IPracticalExercise {
  exercise: string;
  orderNumber: number;
}

export interface IIntroductionPart {
  title?: string;
  founderVideo?: string | IVideoInfo;
  text?: string;
}

export interface IInspirationPart {
  title?: string;
  inspirationVideo?: string | IVideoInfo;
  text?: string;
}

export interface IReflectionPart {
  title?: string;
  instructions?: string;
  questions: IReflectionQuestion[];
}

export interface IPracticalPart {
  title?: string;
  exercises: IPracticalExercise[];
}

export interface ISciencePart {
  title?: string;
  text?: string;
  optionalVideo?: string | IVideoInfo;
}

// ── Main interface ────────────────────────────────────────────────────────────

export interface IIndividualCapsule {
  _id?: Types.ObjectId;
  title: string;
  level: TIndividualCapsuleLevel;
  description: string;
  about: string;
  numberOfModules: number;
  price: number;
  whatYouLearn: string[];
  thumbnail?: string;
  capsuleCategoryId: Types.ObjectId;
  adminId: Types.ObjectId;
  averageRating?: number;
  totalReviewCount?: number;
  priceId?: string;
  capsuleType?: 'free' | 'regular';
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // ── 6-Part journey content ───────────────────────────────────────────────
  introduction?: IIntroductionPart;     // Part 1
  inspiration?: IInspirationPart;       // Part 2
  reflection?: IReflectionPart;         // Part 3
  practicalExercises?: IPracticalPart;  // Part 4
  science?: ISciencePart;               // Part 5
  // Part 6 (Marii AI) is generated separately — no admin input stored here
}

export interface IIndividualCapsuleModel extends Model<IIndividualCapsule> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IIndividualCapsule>>;
}
