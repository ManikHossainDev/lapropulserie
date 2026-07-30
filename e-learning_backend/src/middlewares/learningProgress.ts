import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../errors/ApiError';
import catchAsync from '../shared/catchAsync';
import { IndividualLesson } from '../modules/individualCapsule.module/individual-lesson/individual-lesson.model';
import { JourneyLesson } from '../modules/journey.module/journey-lesson/journey-lesson.model';
import { LessonTracker } from '../modules/journey.module/lesson-tracker/lesson-tracker.model';
import { LessonProgress } from '../modules/individualCapsule.module/individual-lesson-progress/individual-lesson-progress.model';

export const checkSequentialAccess = (type: 'admin' | 'journey') => 
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const studentId = req.user._id;
    const { lessonId } = req.params;

    if (type === 'admin') {
      const currentLesson = await IndividualLesson.findById(lessonId);
      if (!currentLesson) throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found');

      if (currentLesson.orderNumber > 1) {
        const previousLesson = await IndividualLesson.findOne({
          moduleId: currentLesson.moduleId,
          orderNumber: currentLesson.orderNumber - 1,
        });

        if (previousLesson) {
          const progress = await LessonProgress.findOne({
            studentId,
            lessonId: previousLesson._id,
            isCompleted: true,
          });

          if (!progress) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Please complete the previous lesson first');
          }
        }
      }
    } else {
      const currentLesson = await JourneyLesson.findById(lessonId);
      if (!currentLesson) throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found');

      if (currentLesson?.orderNumber && currentLesson?.orderNumber > 1) {
        const previousLesson = await JourneyLesson.findOne({
          moduleId: currentLesson.moduleId,
          orderNumber: currentLesson.orderNumber - 1,
        });

        if (previousLesson) {
          const tracker = await LessonTracker.findOne({
            studentId,
            lessonId: previousLesson._id,
            isCompleted: true,
          });

          if (!tracker) {
            throw new ApiError(
              StatusCodes.FORBIDDEN,
              'Please complete the previous lesson first',
            );
          }
        }
      }
    }

    next();
  });
