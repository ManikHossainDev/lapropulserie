import express from 'express';
import { JourneyCapsuleController } from './journey-capsule.controller';
import { IJourneyCapsule } from './journey-capsule.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { uploadPipelineForCreateJourneyCapsule, uploadPipelineForUpdateJourneyCapsule } from './journey-capsule.middleware';
import { injectUserReference } from '../../../middlewares/injectUserReference';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { setRequestFiltersV2 } from '../../../middlewares/setRequestFilterAndValue';
import validateRequest from '../../../shared/validateRequest';
import { createJourneyCapsuleValidation, updateCapsuleOrderValidation } from './journey-capsule.validation';

const router = express.Router();

export const optionValidationChecking = <
  T extends keyof IJourneyCapsule | 'sortBy' | 'page' | 'limit' | 'populate' | 'isDeleted',
>(
  filters: T[],
) => filters;

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy', 'page', 'limit', 'populate',
];

const controller = new JourneyCapsuleController();

router.route('/available-individual-capsules').get(
  auth(TRole.admin),
  controller.getAvailableIndividualCapsules,
);

router.route('/order').put(
  auth(TRole.admin),
  validateRequest(updateCapsuleOrderValidation),
  controller.updateCapsuleOrder,
);

router
  .route('/')
  .get(
    auth(TRole.admin, TRole.student),
    setRequestFiltersV2({ isDeleted: false }),
    validateFiltersForQuery(
      optionValidationChecking(['_id', 'journeyId', 'isDeleted', ...paginationOptions]),
    ),
    setQueryOptions({
      select: 'title roadMapBrief capsuleNumber thumbnail description estimatedTime totalModule individualCapsuleId introduction',
      populate: { path: 'individualCapsuleId', select: 'title description thumbnail' },
    }),
    controller.getAllWithPaginationV2,
  );

router.route('/').post(
  auth(TRole.admin),
  ...uploadPipelineForCreateJourneyCapsule,
  validateRequest(createJourneyCapsuleValidation),
  injectUserReference('adminId'),
  controller.create,
);

router.route('/with-modules').post(
  auth(TRole.admin),
  ...uploadPipelineForCreateJourneyCapsule,
  injectUserReference('adminId'),
  controller.createWithModulesAndLessons,
);

router.route('/modules-nd-questions').get(
  auth(TRole.admin),
  controller.getModulesAndQuestionsByCapsuleId,
);

router.route('/:id').get(controller.getById);

router.route('/:id').put(
  auth(TRole.admin),
  ...uploadPipelineForUpdateJourneyCapsule,
  controller.updateById,
);

router.route('/:id/with-modules').put(
  auth(TRole.admin),
  ...uploadPipelineForUpdateJourneyCapsule,
  controller.updateWithModulesAndLessons,
);

router.route('/:id').delete(auth(TRole.admin), controller.softDeleteById);

router.route('/:id/permanent').delete(auth(TRole.admin), controller.deleteById);

router.route('/:id/full-details').get(controller.getFullDetails);

router.route('/:id/modules-without-video').get(controller.getModulesWithoutVideo);

export const JourneyCapsuleRoute = router;
