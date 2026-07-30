import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SubscriptionPlanService } from './subscriptionPlan.service';

const subscriptionPlanService = new SubscriptionPlanService();

export class SubscriptionPlanController {
  create = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionPlanService.create(req.body);
    sendResponse(res, {
      code: StatusCodes.CREATED,
      data: result,
      message: 'Subscription plan created successfully',
      success: true,
    });
  });

  getAdminList = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionPlanService.getAdminList(req.query);
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Subscription plans retrieved successfully',
      success: true,
    });
  });

  getActivePlans = catchAsync(async (_req: Request, res: Response) => {
    const result = await subscriptionPlanService.getActivePlans();
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Active subscription plans retrieved successfully',
      success: true,
    });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionPlanService.getById(req.params.id as string);
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Subscription plan retrieved successfully',
      success: true,
    });
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionPlanService.update(req.params.id as string, req.body);
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Subscription plan updated successfully',
      success: true,
    });
  });

  softDelete = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionPlanService.softDelete(req.params.id as string);
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Subscription plan deleted successfully',
      success: true,
    });
  });
}
