import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { User } from '../../user.module/user/user.model';
import { MentorProfile } from '../../mentor.module/mentorProfile/mentorProfile.model';
import { UserSubscription } from '../../payment.module/userSubscription/userSubscription.model';
import { IndividualCapsule } from '../individual-capsule/individual-capsule.model';
import { Notification } from '../../notification/notification.model';
import { TRole } from '../../../middlewares/roles';
import { PaymentTransaction } from '../../payment.module/paymentTransaction/paymentTransaction.model';
import { TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import { TTransactionFor } from '../../../constants/TTransactionFor';
import {
  subMonths,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from 'date-fns';

import { PaymentTransactionService } from '../../payment.module/paymentTransaction/paymentTransaction.service';

const paymentTransactionService = new PaymentTransactionService();

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const now = new Date();
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const lastYearStart = startOfYear(subYears(now, 1));
  const lastYearEnd = endOfYear(subYears(now, 1));

  const [
    totalStudents,
    totalMentors,
    totalCapsules,
    earnings,
    lastMonthStudents,
    lastMonthMentors,
    lastMonthCapsules,
    lastYearStudents,
    lastYearMentors,
    lastYearCapsules,
  ] = await Promise.all([
    User.countDocuments({ role: TRole.student, isDeleted: false }),
    User.countDocuments({ role: TRole.mentor, isDeleted: false }),
    IndividualCapsule.countDocuments({ isDeleted: false }),
    paymentTransactionService.getEarningsOverview(),
    User.countDocuments({
      role: TRole.student,
      isDeleted: false,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    }),
    User.countDocuments({
      role: TRole.mentor,
      isDeleted: false,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    }),
    IndividualCapsule.countDocuments({
      isDeleted: false,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    }),
    User.countDocuments({
      role: TRole.student,
      isDeleted: false,
      createdAt: { $gte: lastYearStart, $lte: lastYearEnd },
    }),
    User.countDocuments({
      role: TRole.mentor,
      isDeleted: false,
      createdAt: { $gte: lastYearStart, $lte: lastYearEnd },
    }),
    IndividualCapsule.countDocuments({
      isDeleted: false,
      createdAt: { $gte: lastYearStart, $lte: lastYearEnd },
    }),
  ]);

  // MoM growth calculation
  const calculateMoM = (current: number, lastMonth: number) => {
    if (lastMonth === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - lastMonth) / lastMonth) * 100).toFixed(1));
  };

  // YoY growth calculation
  const calculateYoY = (current: number, lastYear: number) => {
    if (lastYear === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - lastYear) / lastYear) * 100).toFixed(1));
  };

  // Calendly Connection Check
  const admins = await User.find({ role: TRole.admin }).select('calendly');
  const calendlyWarning = admins.some(admin => !admin.calendly?.encryptedAccessToken);

  // Top Mentors (top 5 by rating)
  const topMentors = await MentorProfile.find({ isLive: true })
    .sort({ rating: -1 })
    .limit(5)
    .populate('userId', 'fullName avatar');

  // Activity Feed (last 10 notifications)
  const activityFeed = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(10);

  sendResponse(res, {
    code: StatusCodes.OK,
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: {
      stats: {
        totalStudents: {
          count: totalStudents,
          momGrowth: calculateMoM(totalStudents, lastMonthStudents),
          yoyGrowth: calculateYoY(totalStudents, lastYearStudents),
        },
        totalMentors: {
          count: totalMentors,
          momGrowth: calculateMoM(totalMentors, lastMonthMentors),
          yoyGrowth: calculateYoY(totalMentors, lastYearMentors),
        },
        totalCapsules: {
          count: totalCapsules,
          momGrowth: calculateMoM(totalCapsules, lastMonthCapsules),
          yoyGrowth: calculateYoY(totalCapsules, lastYearCapsules),
        },
        totalRevenue: {
          amount: earnings.totalEarnings,
          momGrowth: earnings.thisMonthEarnings?.growth || 0,
        },
        earningsOverview: earnings,
      },
      calendlyWarning,
      topMentors,
      activityFeed,
    },
  });
});

const getGrowthTrends = catchAsync(async (req: Request, res: Response) => {
  const filter = (req.query.filter as string) || 'monthly';
  const now = new Date();
  let periods: { label: string; start: Date; end: Date }[] = [];

  if (filter === 'monthly') {
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      periods.push({
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
        start: startOfMonth(date),
        end: endOfMonth(date),
      });
    }
  } else if (filter === 'quarterly') {
    for (let i = 3; i >= 0; i--) {
      const date = subMonths(now, i * 3);
      const q = Math.floor(date.getMonth() / 3) + 1;
      periods.push({
        label: `Q${q} ${date.getFullYear()}`,
        start: startOfQuarter(date),
        end: endOfQuarter(date),
      });
    }
  } else if (filter === 'annually') {
    for (let i = 4; i >= 0; i--) {
      const date = subYears(now, i);
      periods.push({
        label: `${date.getFullYear()}`,
        start: startOfYear(date),
        end: endOfYear(date),
      });
    }
  }

  const completedStatus = TPaymentStatus.completed;
  const baseQuery = { isDeleted: false, paymentStatus: completedStatus };

  const growthData = await Promise.all(
    periods.map(async period => {
      const [revenue, students, mentors] = await Promise.all([
        PaymentTransaction.aggregate([
          { $match: { ...baseQuery, createdAt: { $gte: period.start, $lte: period.end } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        User.countDocuments({
          role: TRole.student,
          isDeleted: false,
          createdAt: { $gte: period.start, $lte: period.end },
        }),
        User.countDocuments({
          role: TRole.mentor,
          isDeleted: false,
          createdAt: { $gte: period.start, $lte: period.end },
        }),
      ]);

      return {
        label: period.label,
        revenue: revenue[0]?.total || 0,
        newStudents: students,
        newMentors: mentors,
      };
    }),
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    success: true,
    message: 'Growth trends retrieved successfully',
    data: { filter, periods: growthData },
  });
});

const getSubscriptionStats = catchAsync(async (req: Request, res: Response) => {
  const { SubscriptionPlan } = require('../../payment.module/subscriptionPlan/subscriptionPlan.model');

  const plans = await SubscriptionPlan.find({ isDeleted: false }).lean();

  const subscriptionStats = await Promise.all(
    plans.map(async (plan: any) => {
      const [activeCount, trialCount, totalRevenue] = await Promise.all([
        UserSubscription.countDocuments({
          subscriptionPlanId: plan._id,
          status: 'active',
          isDeleted: false,
        }),
        UserSubscription.countDocuments({
          subscriptionPlanId: plan._id,
          status: 'trialing',
          isDeleted: false,
        }),
        PaymentTransaction.aggregate([
          {
            $match: {
              isDeleted: false,
              paymentStatus: TPaymentStatus.completed,
              referenceFor: TTransactionFor.UserSubscription,
            },
          },
          {
            $lookup: {
              from: 'usersubscriptions',
              localField: 'referenceId',
              foreignField: '_id',
              as: 'subscription',
            },
          },
          { $unwind: '$subscription' },
          {
            $match: {
              'subscription.subscriptionPlanId': plan._id,
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

      return {
        planId: plan._id,
        planName: plan.name,
        price: plan.price,
        billingPeriod: plan.billingPeriod,
        activeSubscribers: activeCount,
        trialSubscribers: trialCount,
        totalSubscribers: activeCount + trialCount,
        totalRevenue: totalRevenue[0]?.total || 0,
      };
    }),
  );

  const totalRevenue = subscriptionStats.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalSubscribers = subscriptionStats.reduce((sum, s) => sum + s.totalSubscribers, 0);

  sendResponse(res, {
    code: StatusCodes.OK,
    success: true,
    message: 'Subscription stats retrieved successfully',
    data: {
      totalRevenue,
      totalSubscribers,
      plans: subscriptionStats,
    },
  });
});

const getCapsuleFinanceStats = catchAsync(async (req: Request, res: Response) => {
  const filter = (req.query.filter as string) || 'monthly';
  const now = new Date();
  let periods: { label: string; start: Date; end: Date }[] = [];

  if (filter === 'monthly') {
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      periods.push({
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
        start: startOfMonth(date),
        end: endOfMonth(date),
      });
    }
  } else if (filter === 'quarterly') {
    for (let i = 3; i >= 0; i--) {
      const date = subMonths(now, i * 3);
      const q = Math.floor(date.getMonth() / 3) + 1;
      periods.push({
        label: `Q${q} ${date.getFullYear()}`,
        start: startOfQuarter(date),
        end: endOfQuarter(date),
      });
    }
  } else if (filter === 'annually') {
    for (let i = 4; i >= 0; i--) {
      const date = subYears(now, i);
      periods.push({
        label: `${date.getFullYear()}`,
        start: startOfYear(date),
        end: endOfYear(date),
      });
    }
  }

  const completedStatus = TPaymentStatus.completed;
  const baseQuery = { isDeleted: false, paymentStatus: completedStatus };

  // Revenue chart data
  const revenueChart = await Promise.all(
    periods.map(async period => {
      const [journeyRevenue, capsuleRevenue] = await Promise.all([
        PaymentTransaction.aggregate([
          {
            $match: {
              ...baseQuery,
              referenceFor: TTransactionFor.PurchasedJourney,
              createdAt: { $gte: period.start, $lte: period.end },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        PaymentTransaction.aggregate([
          {
            $match: {
              ...baseQuery,
              referenceFor: TTransactionFor.PurchasedAdminCapsule,
              createdAt: { $gte: period.start, $lte: period.end },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
      ]);

      return {
        label: period.label,
        journeyRevenue: journeyRevenue[0]?.total || 0,
        journeySales: journeyRevenue[0]?.count || 0,
        capsuleRevenue: capsuleRevenue[0]?.total || 0,
        capsuleSales: capsuleRevenue[0]?.count || 0,
        totalRevenue: (journeyRevenue[0]?.total || 0) + (capsuleRevenue[0]?.total || 0),
      };
    }),
  );

  // Top capsules by revenue
  const topCapsules = await PaymentTransaction.aggregate([
    {
      $match: {
        ...baseQuery,
        referenceFor: TTransactionFor.PurchasedAdminCapsule,
      },
    },
    {
      $lookup: {
        from: 'admincapsules',
        localField: 'referenceId',
        foreignField: '_id',
        as: 'capsule',
      },
    },
    { $unwind: '$capsule' },
    {
      $group: {
        _id: '$referenceId',
        name: { $first: '$capsule.title' },
        totalRevenue: { $sum: '$amount' },
        salesCount: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 1,
        name: 1,
        totalRevenue: 1,
        salesCount: 1,
      },
    },
  ]);

  // Total counts
  const [totalJourneyRevenue, totalCapsuleRevenue, totalExpeditions, totalCapsules] =
    await Promise.all([
      PaymentTransaction.aggregate([
        { $match: { ...baseQuery, referenceFor: TTransactionFor.PurchasedJourney } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      PaymentTransaction.aggregate([
        { $match: { ...baseQuery, referenceFor: TTransactionFor.PurchasedAdminCapsule } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      require('../../journey.module/journey/journey.model').Journey.countDocuments({
        isDeleted: false,
      }),
      IndividualCapsule.countDocuments({ isDeleted: false }),
    ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    success: true,
    message: 'Capsule finance stats retrieved successfully',
    data: {
      overview: {
        totalRevenue:
          (totalJourneyRevenue[0]?.total || 0) + (totalCapsuleRevenue[0]?.total || 0),
        expeditionRevenue: totalJourneyRevenue[0]?.total || 0,
        capsuleRevenue: totalCapsuleRevenue[0]?.total || 0,
        totalExpeditions,
        totalCapsules,
      },
      revenueChart,
      topCapsules,
    },
  });
});

const getRecentTransactions = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const type = req.query.type as string;

  const filter: any = { isDeleted: false, paymentStatus: TPaymentStatus.completed };

  if (type === 'journey') {
    filter.referenceFor = TTransactionFor.PurchasedJourney;
  } else if (type === 'capsules') {
    filter.referenceFor = TTransactionFor.PurchasedAdminCapsule;
  }

  const result = await PaymentTransaction.paginate(filter, {
    page,
    limit,
    sortBy: 'createdAt:desc',
    populate: [
      { path: 'userId', select: 'fullName email avatar' },
      { path: 'referenceId' },
    ],
  });

  const transactions = result.results.map((t: any) => ({
    _id: t._id,
    user: {
      _id: t.userId?._id,
      name: t.userId?.fullName,
      email: t.userId?.email,
      avatar: t.userId?.avatar,
    },
    product: t.referenceId?.title || 'N/A',
    type: t.referenceFor === TTransactionFor.PurchasedJourney ? 'journey' : 'capsule',
    price: t.amount,
    purchaseDate: t.createdAt,
    transactionId: t.transactionId,
    status: t.paymentStatus,
  }));

  sendResponse(res, {
    code: StatusCodes.OK,
    success: true,
    message: 'Recent transactions retrieved successfully',
    data: {
      transactions,
    },
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.totalResults,
      totalPages: result.totalPages,
    },
  });
});

import { TNotificationType } from '../../notification/notification.constants';

const getActivityFeed = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const category = req.query.category as string;

  const filter: any = { isDeleted: false };

  if (category && Object.values(TNotificationType).includes(category as TNotificationType)) {
    filter.type = category;
  }

  const result = await Notification.paginate(filter, {
    page,
    limit,
    sortBy: 'createdAt:desc',
  });

  sendResponse(res, {
    code: StatusCodes.OK,
    success: true,
    message: 'Activity feed retrieved successfully',
    data: {
      activities: result.results,
      categories: Object.values(TNotificationType),
    },
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.totalResults,
      totalPages: result.totalPages,
    },
  });
});

export const AdminDashboardController = {
  getDashboardStats,
  getGrowthTrends,
  getSubscriptionStats,
  getCapsuleFinanceStats,
  getRecentTransactions,
  getActivityFeed,
};
