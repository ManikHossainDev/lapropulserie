//@ts-ignore
import { model, Schema } from 'mongoose';
import {
  IWithdrawalRequest,
  IWithdrawalRequestModel,
} from './withdrawalRequest.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { TWithdrawalRequest } from './withdrawalRequest.constant';
import { TBankAccount } from '../bankInfo/bankInfo.constant';

const WithdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    walletId: {
      //🔗 for which wallet this withdraw request
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    userId: {
      //🔗 for which user this withdraw request
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    requestedAmount: {
      type: Number,
      required: [true, 'requestedAmount is required'],
    },

    bankAccountNumber: {
      type: String,
      required: [false, 'bankAccountNumber is not required'],
    },

    bankRoutingNumber: {
      type: String,
      required: [false, 'bankRoutingNumber is not required'],
    },

    bankAccountHolderName: {
      type: String,
      required: [false, 'bankAccountHolderName is not required'],
    },

    bankAccountType: {
      type: String,
      enum: [TBankAccount.savings, TBankAccount.current],
      required: [false, 'bankAccountType is not required'],
    },

    bankBranch: {
      type: String,
      required: [false, 'bankBranch is not required'],
    },

    bankName: {
      type: String,
      required: [false, 'bankName is not required'],
    },

    status: {
      type: String,
      enum: [
        TWithdrawalRequest.completed,
        TWithdrawalRequest.failed,
        TWithdrawalRequest.processing,
        TWithdrawalRequest.requested,
        TWithdrawalRequest.rejected,
      ],
    },
    proofOfPayment: [
      //🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'attachments is not required'],
      },
    ],

    // {
    //   type: String,
    //   required: [false, 'proofOfPayment is not required'],
    //   default: null,
    // },
    requestedAt: {
      type: Date,
      required: [true, 'requestedAt is required'],
      default: Date.now,
    },

    processedAt: {
      type: Date,
      required: [false, 'processedAt is not required'],
      default: null,
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true },
);

WithdrawalRequestSchema.plugin(paginate);

// Apply the toJSON plugin
WithdrawalRequestSchema.plugin(toJSON);

export const WithdrawalRequest = model<
  IWithdrawalRequest,
  IWithdrawalRequestModel
>('WithdrawalRequest', WithdrawalRequestSchema);
