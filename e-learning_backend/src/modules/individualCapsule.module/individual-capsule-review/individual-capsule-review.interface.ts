import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IIndividualCapsuleReview {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  capsuleId: Types.ObjectId;
  review: string;
  rating: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IIndividualCapsuleReviewModel extends Model<IIndividualCapsuleReview> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IIndividualCapsuleReview>>;
}
