import express from 'express';
import { IndividualModuleController } from './individual-module.controller';
import { IIndividualModule } from './individual-module.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { uploadPipelineForCreateIndividualModule, uploadPipelineForUpdateIndividualModule } from './individual-module.middleware';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IIndividualModule | 'sortBy' | 'page' | 'limit' | 'populate',
>(filters: T[]) => filters;

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy', 'page', 'limit', 'populate',
];

const controller = new IndividualModuleController();

router.route('/').get(
  auth(TRole.admin),
  validateFiltersForQuery(
    optionValidationChecking(['capsuleId', ...paginationOptions]),
  ),
  setQueryOptions({ select: 'title numberOfLessons estimatedTime thumbnail orderNumber' }),
  controller.getAllWithPaginationV2,
);

router.route('/').post(
  auth(TRole.admin),
  ...uploadPipelineForCreateIndividualModule,
  controller.createWithLessons,
);

router.route('/:id').get(controller.getById);

router.route('/:id').put(
  auth(TRole.admin),
  ...uploadPipelineForUpdateIndividualModule,
  controller.updateWithLessons,
);

router.route('/:id').delete(auth(TRole.admin), controller.softDeleteById);

router.route('/:id/permanent').delete(auth(TRole.admin), controller.deleteById);

export const IndividualModuleRoute = router;
