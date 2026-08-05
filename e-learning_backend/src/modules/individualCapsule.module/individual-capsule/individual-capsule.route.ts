import express from 'express';
import { IndividualCapsuleController } from './individual-capsule.controller';
import { IIndividualCapsule } from './individual-capsule.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { uploadPipelineForCreateIndividualCapsule, uploadPipelineForUpdateIndividualCapsule } from './individual-capsule.middleware';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { setRequestFiltersV2 } from '../../../middlewares/setRequestFilterAndValue';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IIndividualCapsule | 'sortBy' | 'page' | 'limit' | 'populate' | 'isDeleted',
>(filters: T[]) => filters;

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy', 'page', 'limit', 'populate',
];

const controller = new IndividualCapsuleController();

router.route('/paginate').get(
  setRequestFiltersV2({ isDeleted: false }),
  validateFiltersForQuery(
    optionValidationChecking([
      'capsuleCategoryId',
      'isDeleted',
      ...paginationOptions,
    ]),
  ),
  setQueryOptions({ select: 'title level description thumbnail price' }),
  controller.getAllWithPaginationV2,
);

router.route('/:capsuleId/modules').get(
  auth(TRole.common),
  controller.getAllModulesByCapsuleId,
);

router.route('/with-modules-nd-lessons-nd-reviews/:individualCapsuleId').get(
  auth(TRole.student),
  controller.getWithModulesAndReviews,
);

router.route('/').get(
  auth(TRole.admin),
  controller.getAll,
);

router.route('/').post(
  auth(TRole.admin),
  ...uploadPipelineForCreateIndividualCapsule,
  controller.create,
);

router.route('/:id').get(
  auth(TRole.student, TRole.admin),
  (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    // Force full body every time — avoid 304 + stale browser cache of old video URL
    res.removeHeader('ETag');
    next();
  },
  controller.getById,
);

router.route('/:id').put(
  auth(TRole.admin),
  ...uploadPipelineForUpdateIndividualCapsule,
  controller.updateById,
);

router.route('/:id').delete(auth(TRole.admin), controller.softDeleteById);

router.route('/:id/permanent').delete(auth(TRole.admin), controller.deleteById);

export const IndividualCapsuleRoute = router;
