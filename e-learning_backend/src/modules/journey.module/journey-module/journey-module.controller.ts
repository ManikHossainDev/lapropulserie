import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { JourneyModule } from './journey-module.model';
import { IJourneyModule } from './journey-module.interface';
import { JourneyModuleService } from './journey-module.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { JourneyLesson } from '../journey-lesson/journey-lesson.model';
import { Question } from '../../question.module/question/question.model';
import { TRole } from '../../../middlewares/roles';

export class JourneyModuleController extends GenericController<
  typeof JourneyModule,
  IJourneyModule
> {
  journeyModuleService = new JourneyModuleService();

  constructor() {
    super(new JourneyModuleService(), 'JourneyModule');
  }

  createWithLessons = catchAsync(async (req: Request, res: Response) => {
    const result = await this.journeyModuleService.createWithLessons(
      req.body,
      req.stagedVideoUploads,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'JourneyModule with lessons created successfully',
      success: true,
    });
  });

  createWithLessonsUnderCapsule = catchAsync(async (req: Request, res: Response) => {
    const data = { ...req.body, capsuleId: req.params.capsuleId };
    const result = await this.journeyModuleService.createWithLessons(
      data,
      req.stagedVideoUploads,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'JourneyModule with lessons created successfully under capsule',
      success: true,
    });
  });

  updateWithLessons = catchAsync(async (req: Request, res: Response) => {
    const result = await this.journeyModuleService.updateWithLessons(
      req.params.id as string,
      req.body,
      req.stagedVideoUploads,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'JourneyModule with lessons updated successfully',
      success: true,
    });
  });

  getByIdWithDetails = catchAsync(async (req: Request, res: Response) => {
    const userRole = req.user?.role;
    const userId = (req.user?.userId || req.user?._id) as string | undefined;

    if (userRole === TRole.student && userId) {
      const result = await this.journeyModuleService.getStudentModuleDetails(
        req.params.id as string,
        userId,
      );

      return sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'JourneyModule retrieved successfully',
        success: true,
      });
    }

    const result = await JourneyModule.findById(req.params.id).select('-__v').lean();
    if (!result) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: 'Module not found',
        success: false,
      });
    }

    const moduleLessons = await JourneyLesson.find({
      moduleId: req.params.id,
      isDeleted: false,
    })
      .sort({ orderNumber: 1 })
      .select('-__v')
      .lean();

    (result as any).lessons = moduleLessons;

    if (result?.questionaryId) {
      const moduleQuestions = await Question.find({
        questionaryId: result.questionaryId,
        isDeleted: false,
      })
        .select('-options.isCorrect -__v')
        .sort({ sl: 1 })
        .lean();

      (result as any).questions = moduleQuestions;
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'JourneyModule retrieved successfully',
      success: true,
    });
  });
}
