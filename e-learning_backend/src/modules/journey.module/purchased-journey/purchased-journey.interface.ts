import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { PaymentMethod, TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';


export interface IPurchasedJourney {
  _id?: Types.ObjectId;
  
  journeyId: Types.ObjectId;
  studentId: Types.ObjectId;

  price: number;

  paymentTransactionId: Types.ObjectId | null;
  paymentMethod: PaymentMethod.online | null;
  paymentStatus: TPaymentStatus.pending |
    TPaymentStatus.completed |
    TPaymentStatus.refunded |
    TPaymentStatus.failed ;

  isGifted?: boolean;

  progressPercentage?: number;
  completedCapsules?: number;
  totalCapsules?: number;
  completedModules?: number;
  totalModules?: number;
  completedLessons?: number;
  totalLessons?: number;
  overallStatus?: 'notStarted' | 'inProgress' | 'completed';
  completionDate?: Date;
  journeyType?: 'free' | 'regular';

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPurchasedJourneyModel extends Model<IPurchasedJourney> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IPurchasedJourney>>;
}