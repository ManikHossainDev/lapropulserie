import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { IndividualModuleProgress } from './individual-module-progress.model';
import { IIndividualModuleProgress } from './individual-module-progress.interface';
import { IndividualModuleProgressService } from './individual-module-progress.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

export class IndividualModuleProgressController extends GenericController<
  typeof IndividualModuleProgress,
  IIndividualModuleProgress
> {
  individualModuleProgressService = new IndividualModuleProgressService();

  constructor() {
    super(new IndividualModuleProgressService(), 'IndividualModuleProgress');
  }

  getModuleProgressByCapsule = catchAsync(async (req: Request, res: Response) => {
    const { capsuleId } = req.params;
    const studentId = req.user?.userId;

    const result = await this.individualModuleProgressService.getModuleProgressByCapsule(
      capsuleId as string,
      studentId as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Module progress fetched successfully',
      success: true,
    });
  });

  updateLessonStatus = catchAsync(async (req: Request, res: Response) => {
    const { lessonProgressId, lessonId, capsuleId } = req.params;
    const studentId = req.user?.userId;

    const result = await this.individualModuleProgressService.completeIndividualLesson(
      lessonProgressId as string,
      lessonId as string,
      studentId as string,
      capsuleId as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Lesson status updated successfully',
      success: true,
    });
  });

  getResumePoint = catchAsync(async (req: Request, res: Response) => {
    const { capsuleId } = req.params;
    const studentId = req.user?.userId;

    const result = await this.individualModuleProgressService.getResumePoint(
      capsuleId as string,
      studentId as string,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: result ? 'Resume point found' : 'No resume point found',
      success: true,
    });
  });
}
