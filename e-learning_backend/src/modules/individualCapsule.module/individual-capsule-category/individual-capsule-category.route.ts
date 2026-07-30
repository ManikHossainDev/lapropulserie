import express from 'express';
import { IndividualCapsuleCategoryController } from './individual-capsule-category.controller';
import { IIndividualCapsuleCategory } from './individual-capsule-category.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { uploadPipelineForCreateIndividualCapsuleCategory, uploadPipelineForUpdateIndividualCapsuleCategory } from './individual-capsule-category.middleware';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IIndividualCapsuleCategory | 'sortBy' | 'page' | 'limit' | 'populate',
>(filters: T[]) => filters;

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy', 'page', 'limit', 'populate',
];

const controller = new IndividualCapsuleCategoryController();

router.route('/paginate').get(
  auth(TRole.common),
  validateFiltersForQuery(
    optionValidationChecking(['_id', ...paginationOptions]),
  ),
  setQueryOptions({ select: 'title description thumbnail' }),
  controller.getAllWithPaginationV2,
);

router.route('/:capsuleCategoryId/capsules').get(
  controller.getAllCapsulesByCategoryId,
);

router.route('/:capsuleCategoryId/capsules-with-rating').get(
  controller.getAllCapsulesWithRatingInfoByCategoryId,
);

router.route('/').get(
  auth(TRole.admin),
  controller.getAll,
);

router.route('/').post(
  auth(TRole.admin),
  ...uploadPipelineForCreateIndividualCapsuleCategory,
  controller.create,
);

router.route('/:id').get(controller.getById);

router.route('/:id').put(
  auth(TRole.admin),
  ...uploadPipelineForUpdateIndividualCapsuleCategory,
  controller.updateById,
);

router.route('/:id').delete(auth(TRole.admin), controller.softDeleteById);

router.route('/:id/permanent').delete(auth(TRole.admin), controller.deleteById);

export const IndividualCapsuleCategoryRoute = router;
