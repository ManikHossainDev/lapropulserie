import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { LessonTracker } from './lesson-tracker.model';
import { JourneyLesson } from '../journey-lesson/journey-lesson.model';
import { JourneyPropagationService } from './journey-propagation.service';
import { TLessonTrackerStatus } from './lesson-tracker.constant';
import { JourneyModule } from '../journey-module/journey-module.model';

const updateProgress = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user.userId;
  const { lessonId, watchTime } = req.body;

  const lesson = await JourneyLesson.findById(lessonId);
  if (!lesson) throw new Error('JourneyLesson not found');

  const module = await JourneyModule.findById(lesson.moduleId);
  if (!module) throw new Error('JourneyModule not found');

  const tracker = await LessonTracker.findOneAndUpdate(
    { studentId, lessonId },
    {
      $set: { lastWatchTime: watchTime },
      $setOnInsert: {
        status: TLessonTrackerStatus.inProgress,
        moduleId: lesson.moduleId,
        capsuleId: module.capsuleId,
        journeyId: req.body.journeyId,
      },
    },
    { upsert: true, new: true },
  );

  if (
    lesson.durationInSeconds &&
    watchTime >= lesson.durationInSeconds * 0.9 &&
    !tracker.isCompleted
  ) {
    tracker.isCompleted = true;
    tracker.status = TLessonTrackerStatus.completed;
    tracker.completedAt = new Date();
    await tracker.save();

    await JourneyPropagationService.propagateJourneyCompletion(
      studentId.toString(),
      lessonId,
    );
  }

  sendResponse(res, {
    code: StatusCodes.OK,
    success: true,
    message: 'Journey lesson progress updated',
    data: tracker,
  });
});

const resumeProgress = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user.userId;
  const { capsuleId } = req.params;

  const latestTracker = await LessonTracker.findOne({ studentId, capsuleId })
    .sort({ updatedAt: -1 })
    .populate('lessonId');

  sendResponse(res, {
    code: StatusCodes.OK,
    success: true,
    message: 'Journey resume info fetched',
    data: latestTracker,
  });
});

export const LessonTrackerController = {
  updateProgress,
  resumeProgress,
};
