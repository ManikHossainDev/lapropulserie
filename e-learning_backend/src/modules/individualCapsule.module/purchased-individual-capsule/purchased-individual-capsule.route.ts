import express from 'express';
import { PurchasedIndividualCapsuleController } from './purchased-individual-capsule.controller';
import { IPurchasedIndividualCapsule } from './purchased-individual-capsule.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IPurchasedIndividualCapsule | 'sortBy' | 'page' | 'limit' | 'populate',
>(filters: T[]) => filters;

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy', 'page', 'limit', 'populate',
];

const controller = new PurchasedIndividualCapsuleController();

router.route('/with-gifted-capsule-nd-categories').get(
  auth(TRole.student),
  controller.getAllWithGiftedAndCategories,
);

router.route('/gift').post(
  auth(TRole.admin),
  controller.giftCapsule,
);

router.route('/:capsuleId').post(
  auth(TRole.student),
  controller.create,
);

router.route('/:capsuleId/progress').get(
  auth(TRole.student),
  controller.getProgress,
);

router.route('/paginate').get(
  validateFiltersForQuery(optionValidationChecking(['studentId', 'capsuleId', ...paginationOptions])),
  setQueryOptions({ select: 'capsuleId studentId status progressPercent completedModules totalModules' }),
  controller.getAllWithPaginationV2,
);

export const PurchasedIndividualCapsuleRoute = router;
