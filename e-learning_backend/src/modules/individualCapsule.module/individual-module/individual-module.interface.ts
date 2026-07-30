import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IIndividualModule {
  _id?: Types.ObjectId;
  title: string;
  numberOfLessons: number;
  estimatedTime: string;
  thumbnail?: string;
  capsuleId: Types.ObjectId;
  orderNumber: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IIndividualModuleModel extends Model<IIndividualModule> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IIndividualModule>>;
}
