import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { MentorReview } from './mentorReview.model';
import { IMentorReview } from './mentorReview.interface';
import { MentorReviewService } from './mentorReview.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { injectUserReference } from '../../../middlewares/injectUserReference';
import ApiError from '../../../errors/ApiError';

export class MentorReviewController extends GenericController<
  typeof MentorReview,
  IMentorReview
> {
  MentorReviewService = new MentorReviewService();

  constructor() {
    super(new MentorReviewService(), 'MentorReview');
  }

  createWithSessionValidation = catchAsync(async (req: Request, res: Response) => {
    injectUserReference('userId')(req, res, () => {});
    const data: IMentorReview = req.body;
    const result = await this.MentorReviewService.createWithSessionValidation(data);

    sendResponse(res, {
      code: StatusCodes.CREATED,
      data: result,
      message: 'Mentor review created successfully',
      success: true,
    });
  });

  getRatingDistribution = catchAsync(async (req: Request, res: Response) => {
    const mentorId = req.params.mentorId as string;
    if (!mentorId) throw new ApiError(StatusCodes.BAD_REQUEST, 'mentorId is required');
    const result = await this.MentorReviewService.getRatingDistribution(mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Mentor rating distribution retrieved successfully',
      success: true,
    });
  });

  getReviewSummary = catchAsync(async (req: Request, res: Response) => {
    const mentorId = req.params.mentorId as string;
    if (!mentorId) throw new ApiError(StatusCodes.BAD_REQUEST, 'mentorId is required');
    const result = await this.MentorReviewService.getReviewSummary(mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Mentor review summary retrieved successfully',
      success: true,
    });
  });

  getRecentReviews = catchAsync(async (req: Request, res: Response) => {
    const mentorId = req.params.mentorId as string;
    if (!mentorId) throw new ApiError(StatusCodes.BAD_REQUEST, 'mentorId is required');
    const limit = parseInt(req.query.limit as string) || 3;
    const result = await this.MentorReviewService.getRecentReviews(mentorId, limit);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Recent mentor reviews retrieved successfully',
      success: true,
    });
  });

  updateReview = catchAsync(async (req: Request, res: Response) => {
    const reviewId = req.params.reviewId as string;
    if (!reviewId) throw new ApiError(StatusCodes.BAD_REQUEST, 'reviewId is required');
    const userId = (req as any).user?.userId;
    if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    const result = await this.MentorReviewService.updateReviewById(reviewId, req.body, userId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Mentor review updated successfully',
      success: true,
    });
  });
}
