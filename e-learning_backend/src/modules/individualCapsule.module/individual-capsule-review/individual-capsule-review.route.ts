import express from 'express';
import * as validation from './individual-capsule-review.validation';
import { IndividualCapsuleReviewController } from './individual-capsule-review.controller';
import { IIndividualCapsuleReview } from './individual-capsule-review.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

export const optionValidationChecking = <
  T extends
    | keyof IIndividualCapsuleReview
    | 'sortBy'
    | 'page'
    | 'limit'
    | 'populate',
>(
  filters: T[],
) => {
  return filters;
};

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

const controller = new IndividualCapsuleReviewController();

router
  .route('/')
  .post(
    auth(TRole.student),
    validateRequest(validation.createIndividualCapsuleReviewValidationSchema),
    controller.createWithPurchaseValidation
  );

router
  .route('/:reviewId')
  .put(
    auth(TRole.student),
    validateRequest(validation.updateIndividualCapsuleReviewValidationSchema),
    controller.updateReview
  );

router.route('/summary/:capsuleId').get(controller.getReviewSummary);

router.route('/distribution/:capsuleId').get(controller.getRatingDistribution);

router.route('/recent/:capsuleId').get(controller.getRecentReviews);

router
  .route('/paginate')
  .get(
    validateFiltersForQuery(
      optionValidationChecking([
        'capsuleId',
        'userId',
        ...paginationOptions,
      ]),
    ),
    controller.getAllWithPagination,
  );

export const IndividualCapsuleReviewRoute = router;
