import express from 'express';
import { IndividualModuleProgressController } from './individual-module-progress.controller';
import { IIndividualModuleProgress } from './individual-module-progress.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IIndividualModuleProgress | 'sortBy' | 'page' | 'limit' | 'populate',
>(filters: T[]) => filters;

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy', 'page', 'limit', 'populate',
];

const controller = new IndividualModuleProgressController();

router.route('/resume/:capsuleId').get(
  auth(TRole.student),
  controller.getResumePoint,
);

router.route('/purchased-module-nd-lessons/:capsuleId').get(
  auth(TRole.student),
  controller.getModuleProgressByCapsule,
);

router.route('/update-lesson-status/:lessonProgressId/:lessonId/:capsuleId').put(
  auth(TRole.student),
  controller.updateLessonStatus,
);

router.route('/paginate').get(
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  setQueryOptions({ select: 'moduleId capsuleId status completedLessonsCount totalLessons' }),
  controller.getAllWithPaginationV2,
);

router.route('/').get(
  auth(TRole.admin),
  controller.getAll,
);

router.route('/').post(
  auth(TRole.admin),
  controller.create,
);

router.route('/:id').get(controller.getById);

router.route('/:id').put(
  auth(TRole.admin),
  controller.updateById,
);

router.route('/:id').delete(auth(TRole.admin), controller.softDeleteById);

router.route('/:id/permanent').delete(auth(TRole.admin), controller.deleteById);

export const IndividualModuleProgressRoute = router;
