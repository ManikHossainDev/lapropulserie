import express from 'express';
import { IndividualLessonController } from './individual-lesson.controller';
import { IIndividualLesson } from './individual-lesson.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IIndividualLesson | 'sortBy' | 'page' | 'limit' | 'populate',
>(filters: T[]) => filters;

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy', 'page', 'limit', 'populate',
];

const controller = new IndividualLessonController();

router.route('/').get(
  auth(TRole.admin),
  validateFiltersForQuery(
    optionValidationChecking(['moduleId', ...paginationOptions]),
  ),
  setQueryOptions({ select: 'title estimatedTime orderNumber lessonVideo' }),
  controller.getAllWithPaginationV2,
);

router.route('/:id').get(controller.getById);

export const IndividualLessonRoute = router;
