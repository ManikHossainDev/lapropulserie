import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { GenericController } from '../../_generic-module/generic.controller';
import { JourneyLesson } from './journey-lesson.model';
import { IJourneyLesson } from './journey-lesson.interface';
import { JourneyLessonService } from './journey-lesson.service';
import { JourneyModuleService } from '../journey-module/journey-module.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TRole } from '../../../middlewares/roles';
import ApiError from '../../../errors/ApiError';

export class JourneyLessonController extends GenericController<
  typeof JourneyLesson,
  IJourneyLesson
> {
  journeyModuleService = new JourneyModuleService();

  constructor() {
    super(new JourneyLessonService(), 'JourneyLesson');
  }

  getByIdWithStudentAccess = catchAsync(async (req: Request, res: Response) => {
    const userRole = req.user?.role;
    const userId = (req.user?.userId || req.user?._id) as string | undefined;

    if (userRole === TRole.student && userId) {
      const result = await this.journeyModuleService.getStudentLessonDetails(
        req.params.id as string,
        userId,
      );

      return sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'JourneyLesson retrieved successfully',
        success: true,
      });
    }

    const result = await this.service.getById(req.params.id as string);
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'JourneyLesson not found');
    }

    return sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'JourneyLesson retrieved successfully',
      success: true,
    });
  });
}
