import express from 'express';
import { JourneyModuleController } from './journey-module.controller';
import { IJourneyModule } from './journey-module.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { uploadPipelineForCreateJourneyModule, uploadPipelineForUpdateJourneyModule } from './journey-module.middleware';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import validateRequest from '../../../shared/validateRequest';
import { createJourneyModuleValidationSchema, updateJourneyModuleValidationSchema } from './journey-module.validation';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IJourneyModule | 'sortBy' | 'page' | 'limit' | 'populate',
>(filters: T[]) => filters;

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy', 'page', 'limit', 'populate',
];

const controller = new JourneyModuleController();

const injectCapsuleIdFromParams = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  req.body = {
    ...req.body,
    capsuleId: req.params.capsuleId,
  };
  next();
};

router.route('/').get(
  auth(TRole.admin),
  validateFiltersForQuery(
    optionValidationChecking(['capsuleId', ...paginationOptions]),
  ),
  setQueryOptions({ select: 'sl title roadMapBrief description estimatedTime orderNumber moduleVideo' }),
  controller.getAllWithPaginationV2,
);

router.route('/').post(
  auth(TRole.admin),
  ...uploadPipelineForCreateJourneyModule,
  validateRequest(createJourneyModuleValidationSchema),
  controller.createWithLessons,
);

router.route('/capsule/:capsuleId').post(
  auth(TRole.admin),
  ...uploadPipelineForCreateJourneyModule,
  injectCapsuleIdFromParams,
  validateRequest(createJourneyModuleValidationSchema),
  controller.createWithLessonsUnderCapsule,
);

router.route('/:id').get(auth(), controller.getByIdWithDetails);

router.route('/:id').put(
  auth(TRole.admin),
  ...uploadPipelineForUpdateJourneyModule,
  validateRequest(updateJourneyModuleValidationSchema),
  controller.updateWithLessons,
);

router.route('/:id').delete(auth(TRole.admin), controller.softDeleteById);

router.route('/:id/permanent').delete(auth(TRole.admin), controller.deleteById);

export const JourneyModuleRoute = router;
