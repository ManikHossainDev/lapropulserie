import express from 'express';
import { QuestionController } from './question.controller';
import validateRequest from '../../shared/validateRequest';
import { QuestionValidation } from './question.validation';
import auth from '../../middlewares/auth';
import { TRole } from '../../middlewares/roles';

const router = express.Router();

router.post(
  '/admin/questionary',
  auth(TRole.admin),
  validateRequest(QuestionValidation.createQuestionarySchema),
  QuestionController.createQuestionary,
);

router.get(
  '/admin/questionary',
  auth(TRole.admin),
  QuestionController.getAllQuestionnaires,
);

router.get(
  '/admin/questionary/:id',
  auth(TRole.admin),
  validateRequest(QuestionValidation.questionaryIdParamSchema),
  QuestionController.getQuestionaryByIdAdmin,
);

router.patch(
  '/admin/questionary/:id',
  auth(TRole.admin),
  validateRequest(QuestionValidation.updateQuestionarySchema),
  QuestionController.updateQuestionary,
);

router.delete(
  '/admin/questionary/:id',
  auth(TRole.admin),
  validateRequest(QuestionValidation.questionaryIdParamSchema),
  QuestionController.deleteQuestionary,
);

router.get(
  '/student/questionary/category/:category',
  auth(TRole.student),
  QuestionController.getStudentQuestionnairesByCategory,
);

router.get(
  '/student/questionary/resume',
  auth(TRole.student),
  QuestionController.getStudentResumeState,
);

router.get(
  '/student/questionary/:questionaryId',
  auth(TRole.student),
  validateRequest(QuestionValidation.studentQuestionaryDetailsSchema),
  QuestionController.getStudentQuestionaryDetails,
);

router.post(
  '/student/questionary/:questionaryId/question/:questionId/answer',
  auth(TRole.student),
  validateRequest(QuestionValidation.submitStudentAnswerSchema),
  QuestionController.submitStudentAnswer,
);

router.post(
  '/student/questionary/:questionaryId/answers',
  auth(TRole.student),
  validateRequest(QuestionValidation.submitBulkAnswersSchema),
  QuestionController.submitBulkAnswers,
);

export const QuestionRoute = router;
