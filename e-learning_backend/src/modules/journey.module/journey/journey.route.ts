import express from 'express';
import { JourneyController } from './journey.controller';
import { IJourney } from './journey.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { injectUserReference } from '../../../middlewares/injectUserReference';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { uploadPipelineForJourney } from './journey.middleware';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IJourney | 'sortBy' | 'page' | 'limit' | 'populate',
>(filters: T[]) => filters;

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy', 'page', 'limit', 'populate',
];

const controller = new JourneyController();

router.route('/paginate').get(
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  setQueryOptions({ select: 'title roadMapBrief description thumbnail price numberOfCapsule' }),
  controller.getAllWithPaginationV2,
);

router.route('/capsule').get(
  auth(TRole.admin),
  injectUserReference('adminId'),
  controller.getJourneyDetailsWithJourneyCapsules,
);

router.route('/progress').get(
  auth(TRole.student),
  controller.getJourneyProgress,
);

router.route('/').get(
  auth(TRole.admin),
  controller.getAll,
);

router.route('/').post(
  auth(TRole.admin),
  ...uploadPipelineForJourney,
  injectUserReference('adminId'),
  controller.createOrUpdate,
);

router.route('/:id').get(controller.getById);

router.route('/:id').put(
  auth(TRole.admin),
  ...uploadPipelineForJourney,
  controller.updateById,
);

router.route('/:id').delete(auth(TRole.admin), controller.softDeleteById);

router.route('/:id/permanent').delete(auth(TRole.admin), controller.deleteById);

export const JourneyRoute = router;
