import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { LessonProgress } from './individual-lesson-progress.model';
import { IndividualLesson } from '../individual-lesson/individual-lesson.model';
import { IndividualModule } from '../individual-module/individual-module.model';
import { ProgressPropagationService } from './progress-propagation.service';
import { TLessonProgress } from './individual-lesson-progress.constant';
import ApiError from '../../../errors/ApiError';

export class IndividualLessonProgressController {
  static updateProgress = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.userId;
    const lessonId = (req.params.lessonId || req.body.lessonId) as string;
    const { watchTime } = req.body;

    const lesson = await IndividualLesson.findById(lessonId);
    if (!lesson) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        success: false,
        message: 'Lesson not found',
        data: null,
      });
    }

    const module = await IndividualModule.findById(lesson.moduleId);
    if (!module) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Module not found');
    }

    const progress = await LessonProgress.findOneAndUpdate(
      { studentId, lessonId },
      {
        $set: { lastWatchTime: watchTime },
        $setOnInsert: {
          status: TLessonProgress.inProgress,
          capsuleId: module.capsuleId,
          moduleId: lesson.moduleId,
        },
      },
      { upsert: true, new: true },
    );

    if (watchTime >= 0 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.status = TLessonProgress.completed;
      progress.completedAt = new Date();
      await progress.save();

      await ProgressPropagationService.propagateIndividualCapsuleCompletion(studentId.toString(), lessonId);
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: 'Progress updated successfully',
      data: progress,
    });
  });

  static getResumePoint = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.userId;
    const { capsuleId } = req.params;

    const latestProgress = await LessonProgress.findOne({ studentId, capsuleId })
      .sort({ updatedAt: -1 })
      .populate('lessonId');

    sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: 'Resume information fetched successfully',
      data: latestProgress,
    });
  });
}
