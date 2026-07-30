import express from 'express';
import { LearnerAnswerController } from './learner-answer.controller';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import validateRequest from '../../../shared/validateRequest';
import {
  getLearnerAnswersByCapsuleValidation,
  saveLearnerAnswersValidation,
} from './learner-answer.validation';

const router = express.Router();
const controller = new LearnerAnswerController();

router.route('/').post(
  auth(TRole.student),
  validateRequest(saveLearnerAnswersValidation),
  controller.saveAnswers,
);

router.route('/:capsuleId').get(
  auth(TRole.student),
  validateRequest(getLearnerAnswersByCapsuleValidation),
  controller.getByCapsuleId,
);

export const LearnerAnswerRoute = router;
