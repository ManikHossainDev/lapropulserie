import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StudentJourneyService } from './student-journey.service';

export class StudentJourneyController {
  private service = new StudentJourneyService();

  checkFreeGiftAvailability = catchAsync(
    async (req: Request, res: Response) => {
      const studentId = req.user.userId;

      if (!studentId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
      }

      const result = await this.service.checkFreeGiftAvailability(studentId);

      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: result.message,
        success: true,
      });
    },
  );

  claimFreeGift = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user.userId;

    if (!studentId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.service.claimFreeGift(studentId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: result.message,
      success: true,
    });
  });

  getAllPurchasedJourneys = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user.userId;

    if (!studentId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.service.getAllPurchasedJourneys(studentId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Purchased journeys retrieved successfully',
      success: true,
    });
  });

  getCapsulesWithModuleCount = catchAsync(
    async (req: Request, res: Response) => {
      const journeyId = req.params.journeyId as string;
      const studentId = req.user.userId;

      if (!studentId || !journeyId) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Invalid request parameters',
        );
      }

      const result = await this.service.getCapsulesWithModuleCount(
        journeyId,
        studentId,
      );

      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'Capsules retrieved successfully',
        success: true,
      });
    },
  );

  getModulesWithDuration = catchAsync(async (req: Request, res: Response) => {
    const journeyId = req.params.journeyId as string;
    const capsuleId = req.params.capsuleId as string;
    const studentId = req.user.userId;

    if (!studentId || !journeyId || !capsuleId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid request parameters');
    }

    const result = await this.service.getModulesWithDuration(
      journeyId,
      capsuleId,
      studentId,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Modules retrieved successfully',
      success: true,
    });
  });

  getModuleVideo = catchAsync(async (req: Request, res: Response) => {
    const journeyId = req.params.journeyId as string;
    const capsuleId = req.params.capsuleId as string;
    const moduleId = req.params.moduleId as string;
    const studentId = req.user.userId;

    if (!studentId || !journeyId || !capsuleId || !moduleId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid request parameters');
    }

    const result = await this.service.getModuleVideo(
      journeyId,
      capsuleId,
      moduleId,
      studentId,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Video URL retrieved successfully',
      success: true,
    });
  });

  getResumeInfo = catchAsync(async (req: Request, res: Response) => {
    const journeyId = req.params.journeyId as string;
    const capsuleId = req.params.capsuleId as string;
    const studentId = req.user.userId;

    if (!studentId || !journeyId || !capsuleId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid request parameters');
    }

    const result = await this.service.getResumeInfo(
      journeyId,
      capsuleId,
      studentId,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Resume info retrieved successfully',
      success: true,
    });
  });

  markModuleComplete = catchAsync(async (req: Request, res: Response) => {
    const journeyId = req.params.journeyId as string;
    const capsuleId = req.params.capsuleId as string;
    const moduleId = req.params.moduleId as string;
    const studentId = req.user.userId;

    if (!studentId || !journeyId || !capsuleId || !moduleId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid request parameters');
    }

    const result = await this.service.markModuleComplete(
      journeyId,
      capsuleId,
      moduleId,
      studentId,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Module marked as complete',
      success: true,
    });
  });
}
