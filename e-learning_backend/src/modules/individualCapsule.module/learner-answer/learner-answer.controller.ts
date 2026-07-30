import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { LearnerAnswer } from './learner-answer.model';
import { ILearnerAnswer } from './learner-answer.interface';
import { LearnerAnswerService } from './learner-answer.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';

export class LearnerAnswerController extends GenericController<
  typeof LearnerAnswer,
  ILearnerAnswer
> {
  learnerAnswerService = new LearnerAnswerService();

  constructor() {
    super(new LearnerAnswerService(), 'LearnerAnswer');
  }

  saveAnswers = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.userId as string;
    if (!studentId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.learnerAnswerService.saveAnswers(studentId, req.body);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Learner answers saved successfully',
      success: true,
    });
  });

  getByCapsuleId = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.userId as string;
    if (!studentId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const capsuleId = req.params.capsuleId as string;
    const journeyId = (req.query.journeyId as string) || undefined;
    const result = await this.learnerAnswerService.getByCapsuleId(
      studentId,
      capsuleId,
      { journeyId },
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Learner answers retrieved successfully',
      success: true,
    });
  });
}
