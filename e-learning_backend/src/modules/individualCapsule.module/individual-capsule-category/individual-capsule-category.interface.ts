import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TIndividualCapsuleLevel } from '../individual-capsule/individual-capsule.constant';

export interface IIndividualCapsuleCategory {
  _id?: Types.ObjectId;
  title: string;
  description: string; // short description — shown in listings
  about: string; // detailed description — pre-purchase page
  thumbnail?: string;
  level: TIndividualCapsuleLevel;
  estimatedDuration: number;
  price: number;
  whatYouLearn: string[];
  priceId?: string;
  /** When false, category/capsules are only sold via Expedition Journey (no individual purchase). */
  sellIndividually?: boolean;
  capsuleType?: 'free' | 'regular';
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IIndividualCapsuleCategoryModel extends Model<IIndividualCapsuleCategory> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IIndividualCapsuleCategory>>;
}
