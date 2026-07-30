import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IJourney {
  _id?: Types.ObjectId;
  adminId: Types.ObjectId;
  numberOfCapsule: number;
  price: number;
  title: string;
  roadMapBrief: string;
  description?: string;
  thumbnail?: string;
  isActive?: boolean;
  averageRating?: number;
  totalReviewCount?: number;
  totalCapsules?: number;
  priceId?: string;
  journeyType?: 'free' | 'regular';
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJourneyModel extends Model<IJourney> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IJourney>>;
}
