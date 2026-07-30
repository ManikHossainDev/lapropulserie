import express from 'express';
import auth from '../../../middlewares/auth';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import { TRole } from '../../../middlewares/roles';
import validateRequest from '../../../shared/validateRequest';
import { IPaymentTransaction } from './paymentTransaction.interface';
import { PaymentTransactionController } from './paymentTransaction.controller';
import * as validation from './paymentTransaction.validation';

const router = express.Router();
const controller = new PaymentTransactionController();

export const optionValidationChecking = <
  T extends keyof IPaymentTransaction | 'sortBy' | 'page' | 'limit' | 'populate'
>(
  filters: T[],
) => filters;

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

router.route('/paginate').get(
  validateFiltersForQuery(optionValidationChecking([
    '_id',
    'userId',
    'referenceFor',
    'referenceId',
    'paymentGateway',
    'transactionId',
    'paymentIntent',
    'amount',
    'currency',
    'paymentStatus',
    ...paginationOptions,
  ])),
  controller.getAllWithPagination,
);

router.route('/paginate/dev').get(
  validateFiltersForQuery(optionValidationChecking([
    '_id',
    'userId',
    'referenceFor',
    'referenceId',
    'paymentGateway',
    'transactionId',
    'paymentIntent',
    'amount',
    'currency',
    'paymentStatus',
  ])),
  controller.getAllWithPaginationForDev,
);

router.route('/overview/admin').get(auth(TRole.admin), controller.getEarningsOverview);
router.route('/success').get(controller.successPage);
router.route('/cancel').get(controller.cancelPage);
router.route('/:id').get(controller.getById);
router.route('/update/:id').put(controller.updateById);
router.route('/').get(controller.getAll);
router.route('/create').post(
  auth(TRole.common),
  validateRequest(validation.createHelpMessageValidationSchema),
  controller.create,
);
router.route('/delete/:id').delete(controller.deleteById);
router.route('/softDelete/:id').put(controller.softDeleteById);

export const PaymentTransactionRoute = router;
