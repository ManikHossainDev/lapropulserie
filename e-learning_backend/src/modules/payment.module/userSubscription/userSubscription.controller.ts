import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserSubscriptionService } from './userSubscription.service';

const userSubscriptionService = new UserSubscriptionService();

export class UserSubscriptionController {
  createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const result = await userSubscriptionService.createCheckoutSession(
      req.user.userId,
      req.body.subscriptionPlanId,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Subscription checkout session created successfully',
      success: true,
    });
  });

  getMySubscription = catchAsync(async (req: Request, res: Response) => {
    const result = await userSubscriptionService.getMySubscription(req.user.userId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Current subscription retrieved successfully',
      success: true,
    });
  });

  cancelMySubscription = catchAsync(async (req: Request, res: Response) => {
    const result = await userSubscriptionService.cancelMySubscription(
      req.user.userId,
      req.params.id as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Subscription cancellation scheduled successfully',
      success: true,
    });
  });

  getAdminList = catchAsync(async (req: Request, res: Response) => {
    const result = await userSubscriptionService.getAdminList(req.query);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'User subscriptions retrieved successfully',
      success: true,
    });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const result = await userSubscriptionService.getById(req.params.id as string);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'User subscription retrieved successfully',
      success: true,
    });
  });
}
