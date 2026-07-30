import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TPurchasedIndividualCapsuleStatus } from './purchased-individual-capsule.constant';
import { PaymentMethod, TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';

export interface IPurchasedIndividualCapsule {
  _id?: Types.ObjectId;
  capsuleId: Types.ObjectId;
  studentId: Types.ObjectId;
  status: TPurchasedIndividualCapsuleStatus;
  isGifted: boolean;
  uploadedCertificate?: Types.ObjectId[];
  isCertificateUploaded: boolean;
  completedModules: number;
  totalModules: number;
  progressPercent: number;
  totalLessons: number;
  completedLessons: number;
  completionDate?: Date;
  price: number;
  paymentTransactionId?: Types.ObjectId | null;
  paymentMethod?: PaymentMethod | null;
  paymentStatus?: TPaymentStatus;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPurchasedIndividualCapsuleModel extends Model<IPurchasedIndividualCapsule> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IPurchasedIndividualCapsule>>;
}
