import express from 'express';
import { JourneyLessonController } from './journey-lesson.controller';
import { IJourneyLesson } from './journey-lesson.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { uploadPipelineForCreateJourneyLesson, uploadPipelineForUpdateJourneyLesson } from './journey-lesson.middleware';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IJourneyLesson | 'sortBy' | 'page' | 'limit' | 'populate',
>(filters: T[]) => filters;

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy', 'page', 'limit', 'populate',
];

const controller = new JourneyLessonController();

router.route('/').get(
  auth(TRole.admin),
  validateFiltersForQuery(
    optionValidationChecking(['moduleId', ...paginationOptions]),
  ),
  setQueryOptions({ select: 'title description estimatedTime orderNumber lessonVideo' }),
  controller.getAllWithPaginationV2,
);

router.route('/').post(
  auth(TRole.admin),
  ...uploadPipelineForCreateJourneyLesson,
  controller.create,
);

router.route('/:id').get(auth(), controller.getByIdWithStudentAccess);

router.route('/:id').put(
  auth(TRole.admin),
  ...uploadPipelineForUpdateJourneyLesson,
  controller.updateById,
);

router.route('/:id').delete(auth(TRole.admin), controller.softDeleteById);

router.route('/:id/permanent').delete(auth(TRole.admin), controller.deleteById);

export const JourneyLessonRoute = router;
