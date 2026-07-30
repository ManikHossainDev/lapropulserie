import express from 'express';
import { MentorDashboardController } from './mentorDashboard.controller';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { IsProviderRejected } from '../../../middlewares/provider/IsProviderRejected';

const router = express.Router();
const controller = new MentorDashboardController();

router.get('/dashboard', auth(TRole.mentor), IsProviderRejected(), controller.getDashboardData);

router.get('/revenue', auth(TRole.mentor), IsProviderRejected(), controller.getRevenueData);

router.get('/revenue-trend', auth(TRole.mentor), IsProviderRejected(), controller.getRevenueTrend);

router.get('/payout-history', auth(TRole.mentor), IsProviderRejected(), controller.getPayoutHistory);

router.get('/wallet-overview', auth(TRole.mentor), IsProviderRejected(), controller.getWalletOverview);

router.get('/successful-payments', auth(TRole.mentor), IsProviderRejected(), controller.getSuccessfulPayments);

router.get('/successful-payments/:transactionId', auth(TRole.mentor), IsProviderRejected(), controller.getSuccessfulPaymentDetails);

router.get('/withdrawal-history', auth(TRole.mentor), IsProviderRejected(), controller.getWithdrawalHistory);

router.get('/withdrawal-history/:withdrawalId', auth(TRole.mentor), IsProviderRejected(), controller.getWithdrawalDetails);

router.get('/bank-info', auth(TRole.mentor), IsProviderRejected(), controller.getBankInfo);

router.put('/bank-info', auth(TRole.mentor), IsProviderRejected(), controller.createOrUpdateBankInfo);

router.post('/request-withdrawal', auth(TRole.mentor), IsProviderRejected(), controller.requestWithdrawal);

router.get('/rating-overview', auth(TRole.mentor), IsProviderRejected(), controller.getRatingOverview);

router.get('/reviews', auth(TRole.mentor), IsProviderRejected(), controller.getReviews);

export const MentorDashboardRoute = router;
