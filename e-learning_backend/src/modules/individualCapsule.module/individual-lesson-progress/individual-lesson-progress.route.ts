import express from 'express';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { IndividualLessonProgressController } from './individual-lesson-progress.controller';

const router = express.Router();

router
  .route('/resume/:capsuleId')
  .get(auth(TRole.student), IndividualLessonProgressController.getResumePoint);

router
  .route('/update/:lessonId')
  .put(auth(TRole.student), IndividualLessonProgressController.updateProgress);

export const IndividualLessonProgressRoute = router;
