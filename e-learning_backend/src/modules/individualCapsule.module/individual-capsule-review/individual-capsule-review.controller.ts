import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { IndividualCapsuleReview } from './individual-capsule-review.model';
import { IIndividualCapsuleReview } from './individual-capsule-review.interface';
import { IndividualCapsuleReviewService } from './individual-capsule-review.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';

export class IndividualCapsuleReviewController extends GenericController<
  typeof IndividualCapsuleReview,
  IIndividualCapsuleReview
> {
  individualCapsuleReviewService = new IndividualCapsuleReviewService();

  constructor() {
    super(new IndividualCapsuleReviewService(), 'IndividualCapsuleReview');
  }

  createWithPurchaseValidation = catchAsync(async (req: Request, res: Response) => {
    const data: IIndividualCapsuleReview = req.body;
    data.userId = req.user?.userId as any;
    const result = await this.individualCapsuleReviewService.createWithPurchaseValidation(data);

    sendResponse(res, {
      code: StatusCodes.CREATED,
      data: result,
      message: 'Capsule review created successfully',
      success: true,
    });
  });

  getRatingDistribution = catchAsync(async (req: Request, res: Response) => {
    const capsuleId = req.params.capsuleId as string;
    if (!capsuleId) throw new ApiError(StatusCodes.BAD_REQUEST, 'capsuleId is required');
    const result = await this.individualCapsuleReviewService.getRatingDistribution(capsuleId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Capsule rating distribution retrieved successfully',
      success: true,
    });
  });

  getReviewSummary = catchAsync(async (req: Request, res: Response) => {
    const capsuleId = req.params.capsuleId as string;
    if (!capsuleId) throw new ApiError(StatusCodes.BAD_REQUEST, 'capsuleId is required');
    const result = await this.individualCapsuleReviewService.getReviewSummary(capsuleId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Capsule review summary retrieved successfully',
      success: true,
    });
  });

  getRecentReviews = catchAsync(async (req: Request, res: Response) => {
    const capsuleId = req.params.capsuleId as string;
    if (!capsuleId) throw new ApiError(StatusCodes.BAD_REQUEST, 'capsuleId is required');
    const limit = parseInt(req.query.limit as string) || 3;
    const result = await this.individualCapsuleReviewService.getRecentReviews(capsuleId, limit);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Recent capsule reviews retrieved successfully',
      success: true,
    });
  });

  updateReview = catchAsync(async (req: Request, res: Response) => {
    const reviewId = req.params.reviewId as string;
    if (!reviewId) throw new ApiError(StatusCodes.BAD_REQUEST, 'reviewId is required');
    const userId = (req as any).user?.userId;
    if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    const result = await this.individualCapsuleReviewService.updateReviewById(reviewId, req.body, userId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Capsule review updated successfully',
      success: true,
    });
  });
}
