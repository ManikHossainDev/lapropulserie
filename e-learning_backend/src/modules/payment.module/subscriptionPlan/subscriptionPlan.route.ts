import express from 'express';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import validateRequest from '../../../shared/validateRequest';
import { SubscriptionPlanController } from './subscriptionPlan.controller';
import {
  createSubscriptionPlanValidationSchema,
  subscriptionPlanIdValidationSchema,
  subscriptionPlanListValidationSchema,
  updateSubscriptionPlanValidationSchema,
} from './subscriptionPlan.validation';

const router = express.Router();
const controller = new SubscriptionPlanController();

router
  .route('/admin')
  .get(auth(TRole.admin), validateRequest(subscriptionPlanListValidationSchema), controller.getAdminList)
  .post(auth(TRole.admin), validateRequest(createSubscriptionPlanValidationSchema), controller.create);

router.route('/active').get(auth(TRole.mentor, TRole.admin), controller.getActivePlans);

router
  .route('/admin/:id')
  .get(auth(TRole.admin), validateRequest(subscriptionPlanIdValidationSchema), controller.getById)
  .patch(auth(TRole.admin), validateRequest(updateSubscriptionPlanValidationSchema), controller.update)
  .delete(auth(TRole.admin), validateRequest(subscriptionPlanIdValidationSchema), controller.softDelete);

export const SubscriptionPlanRoute = router;
