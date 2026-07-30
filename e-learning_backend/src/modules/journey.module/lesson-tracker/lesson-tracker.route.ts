import express from 'express';
import { LessonTrackerController } from './lesson-tracker.controller';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { checkSequentialAccess } from '../../../middlewares/learningProgress';
import sendResponse from '../../../shared/sendResponse';

const router = express.Router();

router.post(
  '/update',
  auth(TRole.common),
  LessonTrackerController.updateProgress
);

router.get(
  '/resume/:capsuleId',
  auth(TRole.common),
  LessonTrackerController.resumeProgress
);

router.get(
  '/:lessonId',
  auth(TRole.common),
  checkSequentialAccess('journey'),
  (req, res) => {
    return sendResponse(res, {
      code: 200,
      message: 'Journey access granted',
      data: null,
    });
  }
);

export const LessonTrackerRoute = router;
