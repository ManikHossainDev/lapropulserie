//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { WithdrawalRequest } from './withdrawalRequest.model';
import { IWithdrawalRequest } from './withdrawalRequest.interface';
import { WithdrawalRequestService } from './withdrawalRequest.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
// import { IUser } from '../../token/token.interface';
import { BankInfo } from '../bankInfo/bankInfo.model';
import { Wallet } from '../wallet/wallet.model';
import { IWallet } from '../wallet/wallet.interface';
import {
  TRequestStatus,
  TWithdrawalRequest,
} from './withdrawalRequest.constant';
import { processFiles } from '../../../helpers/processFilesToUpload';
import { TFolderName } from '../../../enums/folderNames';
import { User } from '../../user.module/user/user.model';
import { IUser as IUserMain } from '../../user.module/user/user.interface';
import { IUser } from '../../token/token.interface';
import { enqueueWebNotification } from '../../../services/notification.service';
import { TRole } from '../../../middlewares/roles';
import { TNotificationType } from '../../notification/notification.constants';
import { WalletTransactionHistory } from '../walletTransactionHistory/walletTransactionHistory.model';
import {
  TWalletTransactionHistory,
  TWalletTransactionStatus,
} from '../walletTransactionHistory/walletTransactionHistory.constant';
import { TCurrency } from '../../../enums/payment';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { TTransactionFor } from '../../../constants/TTransactionFor';
import ApiError from '../../../errors/ApiError';
//@ts-ignore
import { Types } from 'mongoose';

const TWithdrawalRequestType = {
  bank: 'bank',
  bkash: 'bkash',
  nagad: 'nagad',
  rocket: 'rocket',
};

export class WithdrawalRequestController extends GenericController<
  typeof WithdrawalRequest,
  IWithdrawalRequest
> {
  WithdrawalRequestService = new WithdrawalRequestService();

  constructor() {
    super(new WithdrawalRequestService(), 'WithdrawalRequest');
  }

  //---------------------------------
  // Provider | Wallet | Create withdrawal request TODO : MUST : NEED_TO_TEST
  //---------------------------------
  create = catchAsync(async (req: Request, res: Response) => {
    const data: IWithdrawalRequest = req.body;

    data.userId = new Types.ObjectId((req.user as IUser).userId);

    const user: any = await User.findById((req.user as IUser).userId)
      .select('walletId')
      .lean();

    /********
     * 📝
     * first we check withdrawal amount is less than wallet amount
     * TODO : MUST : mongodb transaction add
     *
     * check user have current bank information or not
     *
     * for requested user.. we need to check last withdrawal request is in week or not
     * if in week then we can not create withdrawal request
     *
     * ****** */

    // lets get the wallet
    const wallet: any = await Wallet.findOne({
      userId: data.userId,
      _id: user.walletId,
    });

    if (!wallet) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'No wallet Found',
        success: false,
      });
    }

    /*-----------------------------------------
    const bankInfo = await BankInfo.findOne({
      userId: data.userId,
      isActive : true
    })

    if (!bankInfo) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'No Bank Info Found . Please add bank info first .',
        success: false,
      });
    }
    -----------------------------------------*/

    if (data.requestedAmount > wallet.amount) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'Insufficient wallet amount',
        success: false,
      });
    }

    /*
    const docToCreate : IWithdrawalRequest = {
      walletId : wallet._id, // NEED_TO_TEST : wallet id is coming or not
      userId : data.userId,
      requestedAmount : data.requestedAmount,
      bankAccountNumber : data.bankAccountNumber,
      bankRoutingNumber : data.bankRoutingNumber,
      bankAccountHolderName : data.bankAccountHolderName,
      bankAccountType : data.bankAccountType,
      bankBranch : data.bankBranch,
      bankName : data.bankName,
      status : TWithdrawalRequest.requested,
      requestedAt: new Date(),
      processedAt : null,
    }
    */

    const docToCreate: any = {
      walletId: wallet._id,
      userId: data.userId,
      requestedAmount: data.requestedAmount,

      type: (data as any).type,

      ...((data as any).type === TWithdrawalRequestType.bank && {
        bankAccountNumber: data.bankAccountNumber,
        bankRoutingNumber: data.bankRoutingNumber,
        bankAccountHolderName: data.bankAccountHolderName,
        bankAccountType: data.bankAccountType,
        bankBranch: data.bankBranch,
        bankName: data.bankName,
      }),

      ...([
        TWithdrawalRequestType.bkash,
        TWithdrawalRequestType.nagad,
        TWithdrawalRequestType.rocket,
      ].includes((data as any).type) && {
        mobileNo: (data as any).mobileNo,
        accountType: (data as any).accountType,
      }),

      status: TWithdrawalRequest.requested,
      requestedAt: new Date(),
      processedAt: null,
    };

    const result = await this.service.create(docToCreate);

    //------------------------------------
    // Send Notification to Admin that a withdrawal request is created
    //------------------------------------

    await enqueueWebNotification(
      `An withdrawal request is created by ${(req.user as IUser).userId} ${(req.user as IUser).userName} for $${data.requestedAmount}`,
      (req.user as IUser).userId as string, // senderId
      '' as string, // receiverId // as we send notification to admin
      TRole.admin, // receiverRole
      TNotificationType.withdrawal, // type
      result._id as any, // idOfType
      null, // linkFor queryParamKey
      null, // linkId queryParamValue
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  //---------------------------------
  //  Admin | Upload receipt And Update status
  //---------------------------------
  uploadReceiptAndUpdateStatus = catchAsync(
    async (req: Request, res: Response) => {
      /*******
       * 📝
       * deduct the amount of wallet and update status to completed
       * without "proofOfPayment" document don't let user to update status
       * update the "processedAt" date
       * ------TODO : MUST : if already complete we don't want to update again
       * ------TODO : MUST : add mongo db transaction here
       * ***** */

      const withdrawalRequestId = req.params.id;

      const withdrawalRequest: IWithdrawalRequest | any =
        await WithdrawalRequest.findById(withdrawalRequestId);

      if (!withdrawalRequest) {
        return sendResponse(res, {
          code: StatusCodes.BAD_REQUEST,
          message: 'No withdrawalRequest Found',
          success: false,
        });
      }

      if (
        withdrawalRequest.status.toString() ==
        TWithdrawalRequest.rejected.toString()
      ) {
        console.log(
          'withdrawalRequest.status.toString() :: ',
          withdrawalRequest.status.toString(),
        );
        return sendResponse(res, {
          code: StatusCodes.BAD_REQUEST,
          message: 'Withdrawal Request is already rejected',
          success: false,
        });
      }

      if (
        withdrawalRequest.status.toString() ==
        TWithdrawalRequest.completed.toString()
      ) {
        return sendResponse(res, {
          code: StatusCodes.BAD_REQUEST,
          message: 'Withdrawal Request is already accepted',
          success: false,
        });
      }

      if (req.body.status.toString() === TRequestStatus.reject.toString()) {
        //------------------------------------
        // Send Notification to Provider that a withdrawal request is rejected
        //------------------------------------
        await enqueueWebNotification(
          `৳${withdrawalRequest.requestedAmount} Withdrawal request is rejected by admin`,
          (req?.user as IUser)?.userId as string, // senderId
          withdrawalRequest.userId, // receiverId
          null, // receiverRole
          TNotificationType.rejectWithdrawal, // type // 🎨 this is for wallet page routing
          null as any, // id of type
          null, // linkFor
          null, // linkId
        );

        withdrawalRequest.status = TWithdrawalRequest.rejected;
        withdrawalRequest.processedAt = new Date();

        // TODO : FEAT : admin can also add a simple note .. which shows why he reject this request .. for better user experience

        const updated = await withdrawalRequest.save();

        return sendResponse(res, {
          code: StatusCodes.OK,
          data: updated,
          message: `${this.modelName} is rejected`,
          success: true,
        });
      }

      //📈⚙️ OPTIMIZATION: Process both file types in parallel
      const [proofOfPayment] = await Promise.all([
        processFiles((req.files as any)?.proofOfPayment, TFolderName.wallet),
      ]);

      withdrawalRequest.proofOfPayment = proofOfPayment[0];
      withdrawalRequest.status = TWithdrawalRequest.completed;
      withdrawalRequest.processedAt = new Date();

      const updated = await withdrawalRequest.save();

      let balanceBeforeTransaction: number = 0;
      let balanceAfterTransaction: number = 0;
      let wallet;

      //------------------------------------
      // Deduct amount from  Doctor / Patient's wallet
      //------------------------------------

      if (withdrawalRequest.userId) {
        wallet = await Wallet.findOne({
          userId: withdrawalRequest.userId,
        });

        // console.log("log: wallet.amount => ", typeof wallet.amount,"~~~", wallet.amount);
        // console.log("log: withdrawalRequest.requestedAmount => ", typeof withdrawalRequest.requestedAmount , "~~~", withdrawalRequest.requestedAmount);
        // console.log("log: wallet.amount - withdrawalRequest.requestedAmount  result => ", wallet.amount - withdrawalRequest.requestedAmount);

        if (wallet) {
          balanceBeforeTransaction = wallet.amount;

          wallet.amount -= withdrawalRequest.requestedAmount;

          balanceAfterTransaction = wallet.amount;

          await wallet.save();
        }
      }

      //------------------------------------
      // Create Wallet transaction History for Doctor / Patient's wallet
      //------------------------------------

      const walletTransactionHistory = await WalletTransactionHistory.create({
        walletId: wallet!._id,
        userId: withdrawalRequest.userId,
        paymentTransactionId: null, // as this is withdrawal request
        withdrawalRequestId: withdrawalRequest._id,
        type: TWalletTransactionHistory.withdrawal,
        amount: withdrawalRequest.requestedAmount,
        currency: 'bdt' as any,
        balanceBefore: balanceBeforeTransaction,
        balanceAfter: balanceAfterTransaction,
        description: 'withdrawal request approved by admin',
        status: TWalletTransactionStatus.completed,
        referenceFor: TTransactionFor.WithdrawalRequest,
        referenceId: withdrawalRequest._id,
      });

      //------------------------------------
      // Send Notification to Doctor / Patient that a withdrawal request is approved
      //------------------------------------
      await enqueueWebNotification(
        `৳${withdrawalRequest.requestedAmount} Withdrawal request is approved by admin`,
        (req?.user as IUser)?.userId as string, // senderId
        withdrawalRequest.userId, // receiverId
        null, // receiverRole
        TNotificationType.payment, // type // 🎨 this is for wallet page routing
        walletTransactionHistory._id, // id of type
        null, // linkFor
        null, // linkId
      );

      sendResponse(res, {
        code: StatusCodes.OK,
        data: updated,
        message: `${this.modelName} updated successfully`,
        success: true,
      });
    },
  );

  //---------------------------------
  //  Doctor / Specialist | Get all withdrawal Request With Wallet Amount
  //---------------------------------
  getAllWithPaginationV2WithWalletAmount = catchAsync(
    async (req: Request, res: Response) => {
      //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
      const filters = omit(req.query, ['sortBy', 'limit', 'page', 'populate']);
      const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

      // ✅ Default values
      let populateOptions: string | { path: string; select: string }[] = [];
      let select = '-isDeleted -createdAt -updatedAt -__v';

      // ✅ If middleware provided overrides → use them
      if (req.queryOptions) {
        if (req.queryOptions.populate) {
          populateOptions = req.queryOptions.populate;
        }
        if (req.queryOptions.select) {
          select = req.queryOptions.select;
        }
      }

      // ⚠️ NEED_OPTIMIZATION : TODO : with parallel processing
      const result = await this.service.getAllWithPagination(
        filters,
        options,
        populateOptions,
        select,
      );

      const walletAmount = await Wallet.findOne({
        userId: req.user?.userId,
      })
        .select('amount')
        .lean();

      sendResponse(res, {
        code: StatusCodes.OK,
        data: {
          withdrawalRequests: result.results,
          walletAmount,
        },
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.totalResults,
          totalPages: result.totalPages,
        },
        message: `All ${this.modelName} with pagination`,
        success: true,
      });
    },
  );

  /*------------------------------------------------------
  //---------------------------------
  //  Admin | Get all withdrawal Request Within From To created date  
  //---------------------------------
  getAllWithPaginationV2 = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    // ✅ Default values
    let populateOptions: (string | { path: string; select: string }[]) = [];
    let select = '-isDeleted -createdAt -updatedAt -__v';

    // ✅ If middleware provided overrides → use them
    if (req.queryOptions) {
      if (req.queryOptions.populate) {
        populateOptions = req.queryOptions.populate;
      }
      if (req.queryOptions.select) {
        select = req.queryOptions.select;
      }
    }
    console.log(filters);
    const result = await this.service.getAllWithPagination(filters, options, populateOptions , select );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });
  -------------------------------------------------------*/

  /*----------------------------------- for getAllWithPaginationV2 ...  we add this thing to middleware
    
    if (req.query.from && req.query.to) {
      const from = `${req.query.from}T00:00:00.000Z`;
      const to   = `${req.query.to}T23:59:59.999Z`;

      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
      }

      filters.createdAt = {
        $gte: fromDate,
        $lte: toDate
      };
    }

    delete filters.from;
    delete filters.to;

    ---------------------------------------*/

  // add more methods here if needed or override the existing ones
}
