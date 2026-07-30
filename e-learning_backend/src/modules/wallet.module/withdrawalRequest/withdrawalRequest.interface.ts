//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TWithdrawalRequest } from './withdrawalRequest.constant';
import { TBankAccount } from '../bankInfo/bankInfo.constant';

export interface IWithdrawalRequest {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  walletId: Types.ObjectId; //🔗
  userId: Types.ObjectId; //🔗

  bankAccountNumber: string;
  bankRoutingNumber: string;
  bankAccountHolderName: string;
  bankAccountType: TBankAccount; //🧩
  bankBranch: string;
  bankName: string;
  requestedAmount: number;
  proofOfPayment?: Types.ObjectId[] | undefined; //🖼️🧩

  status: TWithdrawalRequest; //🧩

  requestedAt: Date;
  processedAt?: Date | null;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWithdrawalRequestModel extends Model<IWithdrawalRequest> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions,
  ) => Promise<PaginateResult<IWithdrawalRequest>>;
}
