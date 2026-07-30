import express from 'express';
import { AdminDashboardController } from './adminDashboard.controller';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const router = express.Router();

router.get(
  '/stats',
  auth(TRole.admin),
  AdminDashboardController.getDashboardStats,
);

router.get(
  '/growth-trends',
  auth(TRole.admin),
  AdminDashboardController.getGrowthTrends,
);

router.get(
  '/subscription-stats',
  auth(TRole.admin),
  AdminDashboardController.getSubscriptionStats,
);

router.get(
  '/capsule-finance-stats',
  auth(TRole.admin),
  AdminDashboardController.getCapsuleFinanceStats,
);

router.get(
  '/recent-transactions',
  auth(TRole.admin),
  AdminDashboardController.getRecentTransactions,
);

router.get(
  '/activity-feed',
  auth(TRole.admin),
  AdminDashboardController.getActivityFeed,
);

export const AdminDashboardRoute = router;
