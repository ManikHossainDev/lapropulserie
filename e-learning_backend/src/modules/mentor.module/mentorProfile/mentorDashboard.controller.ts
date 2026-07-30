import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MentorDashboardService } from './mentorDashboard.service';
import { IUser } from '../../token/token.interface';
import pick from '../../../shared/pick';

export class MentorDashboardController {
  private dashboardService = new MentorDashboardService();

  getDashboardData = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const result = await this.dashboardService.getMentorDashboardData(mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Dashboard data retrieved successfully',
      success: true,
    });
  });

  getRevenueData = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const result = await this.dashboardService.getMentorRevenueData(mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Revenue data retrieved successfully',
      success: true,
    });
  });

  getRevenueTrend = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const period = (req.query.period as string) || 'monthly';
    const result = await this.dashboardService.getMentorRevenueTrend(mentorId, period as 'monthly' | 'quarterly' | 'annually');

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Revenue trend retrieved successfully',
      success: true,
    });
  });

  getPayoutHistory = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const options = pick(req.query, ['sortBy', 'page', 'limit']);
    const result = await this.dashboardService.getMentorPayoutHistory(mentorId, options);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Payout history retrieved successfully',
      success: true,
    });
  });

  getWalletOverview = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const result = await this.dashboardService.getMentorWalletOverview(mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Wallet overview retrieved successfully',
      success: true,
    });
  });

  getSuccessfulPayments = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const options = pick(req.query, ['sortBy', 'page', 'limit']);
    const result = await this.dashboardService.getMentorSuccessfulPayments(mentorId, options);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Successful payments retrieved successfully',
      success: true,
    });
  });

  getSuccessfulPaymentDetails = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const transactionId = req.params.transactionId as string;
    const result = await this.dashboardService.getSuccessfulPaymentDetails(mentorId, transactionId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Payment details retrieved successfully',
      success: true,
    });
  });

  getWithdrawalHistory = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const options = pick(req.query, ['sortBy', 'page', 'limit']);
    const result = await this.dashboardService.getMentorWithdrawalHistory(mentorId, options);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Withdrawal history retrieved successfully',
      success: true,
    });
  });

  getWithdrawalDetails = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const withdrawalId = req.params.withdrawalId as string;
    const result = await this.dashboardService.getWithdrawalDetails(mentorId, withdrawalId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Withdrawal details retrieved successfully',
      success: true,
    });
  });

  getBankInfo = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const result = await this.dashboardService.getMentorBankInfo(mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Bank info retrieved successfully',
      success: true,
    });
  });

  createOrUpdateBankInfo = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const data = req.body;
    const result = await this.dashboardService.createOrUpdateMentorBankInfo(mentorId, data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Bank info created/updated successfully',
      success: true,
    });
  });

  requestWithdrawal = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const { amount } = req.body;
    const result = await this.dashboardService.requestWithdrawal(mentorId, amount);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Withdrawal request created successfully',
      success: true,
    });
  });

  getRatingOverview = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const result = await this.dashboardService.getMentorRatingOverview(mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Rating overview retrieved successfully',
      success: true,
    });
  });

  getReviews = catchAsync(async (req: Request, res: Response) => {
    const mentorId = (req.user as IUser).userId as string;
    const options = pick(req.query, ['sortBy', 'page', 'limit']);
    const result = await this.dashboardService.getMentorReviews(mentorId, options);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Reviews retrieved successfully',
      success: true,
    });
  });
}
