//@ts-ignore
import { model, Schema } from 'mongoose';
import { IWallet, IWalletModel } from './wallet.interface';
import paginate from '../../../common/plugins/paginate';
import { TCurrency } from '../../../enums/payment';
import { TWalletStatus } from './wallet.constant';
import { Roles } from '../../../middlewares/roles';
import toJSON from '../../../common/plugins/toJSON';


const WalletSchema = new Schema<IWallet, IWalletModel>(
  {
    userId: {
      //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: {
      // this is withdrawal balance
      type: Number,
      default: 0,
      required: [false, 'amount is not required'],
    },
    totalBalance: {
      // it includes admin part also
      type: Number,
      default: 0,
      required: [false, 'totalBalance is not required'],
    },
    currency: {
      type: String,
      enum: [TCurrency.eur, TCurrency.usd],
      default: TCurrency.eur,
      required: [false, 'currency is not required'],
    },
    status: {
      type: String,
      enum: [
        TWalletStatus.active,
        TWalletStatus.frozen,
        TWalletStatus.suspended,
      ],
      default: TWalletStatus.active,
      required: [false, 'status is not required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  } as any,
  { timestamps: true, versionKey: false },
);

WalletSchema.plugin(paginate);
WalletSchema.plugin(toJSON);


export const Wallet = model<
  IWallet,
  IWalletModel
>('Wallet', WalletSchema);
