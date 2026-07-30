import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import PaginationService from '../../../common/service/paginationService';
import ApiError from '../../../errors/ApiError';
import { GenericService } from '../../_generic-module/generic.services';
import { MentorReview } from '../mentorReview/mentorReview.model';
import { IUser } from '../../user.module/user/user.interface';
import { User } from '../../user.module/user/user.model';
import { IMentorProfile } from './mentorProfile.interface';
import { MentorProfile } from './mentorProfile.model';
import { Wallet } from '../../wallet.module/wallet/wallet.model';
import { WalletTransactionHistory } from '../../wallet.module/walletTransactionHistory/walletTransactionHistory.model';
import { WithdrawalRequest } from '../../wallet.module/withdrawalRequest/withdrawalRequest.model';
import { BankInfo } from '../../wallet.module/bankInfo/bankInfo.model';
import { TWalletTransactionHistory, TWalletTransactionStatus } from '../../wallet.module/walletTransactionHistory/walletTransactionHistory.constant';
import { TWithdrawalRequest } from '../../wallet.module/withdrawalRequest/withdrawalRequest.constant';
import { TBankAccount } from '../../wallet.module/bankInfo/bankInfo.constant';

export class MentorDashboardService {

  async getMentorDashboardData(mentorId: string) {
    const mentorObjectId = new mongoose.Types.ObjectId(mentorId);

    const ratingAggregation = await MentorReview.aggregate([
      {
        $match: {
          mentorId: mentorObjectId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating = ratingAggregation.length > 0 
      ? Number(ratingAggregation[0].averageRating.toFixed(1)) 
      : 0;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    
    const lastMonthRatingAggregation = await MentorReview.aggregate([
      {
        $match: {
          mentorId: mentorObjectId,
          isDeleted: false,
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    const lastMonthReviews = lastMonthRatingAggregation.length > 0 
      ? lastMonthRatingAggregation[0].count 
      : 0;
    const currentMonthReviews = ratingAggregation.length > 0 
      ? ratingAggregation[0].totalReviews 
      : 0;

    let ratingGrowth = 0;
    if (lastMonthReviews > 0) {
      ratingGrowth = ((currentMonthReviews - lastMonthReviews) / lastMonthReviews) * 100;
    } else if (currentMonthReviews > 0) {
      ratingGrowth = 100;
    }

    const wallet = await Wallet.findOne({ userId: mentorId }).select('amount').lean();
    const currentBalance = wallet?.amount || 0;

    const walletTransactions = await WalletTransactionHistory.aggregate([
      {
        $match: {
          userId: mentorObjectId,
          type: { $in: [TWalletTransactionHistory.credit, TWalletTransactionHistory.withdrawal] },
          status: TWalletTransactionStatus.completed,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const lastMonthTransactionAggregation = await WalletTransactionHistory.aggregate([
      {
        $match: {
          userId: mentorObjectId,
          type: TWalletTransactionHistory.credit,
          status: TWalletTransactionStatus.completed,
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
        },
      },
    ]);

    const currentMonthTransactionAggregation = await WalletTransactionHistory.aggregate([
      {
        $match: {
          userId: mentorObjectId,
          type: TWalletTransactionHistory.credit,
          status: TWalletTransactionStatus.completed,
          createdAt: { $gte: currentMonthStart },
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
        },
      },
    ]);

    const lastMonthRevenue = lastMonthTransactionAggregation.length > 0 
      ? lastMonthTransactionAggregation[0].amount 
      : 0;
    const currentMonthRevenue = currentMonthTransactionAggregation.length > 0 
      ? currentMonthTransactionAggregation[0].amount 
      : 0;

    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
      revenueGrowth = 100;
    }

    const recentReviews = await MentorReview.find({
      mentorId: mentorObjectId,
      isDeleted: false,
    })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedReviews = recentReviews.map((review: any) => ({
      rating: review.rating,
      review: review.review,
      createdAt: review.createdAt,
      student: {
        name: (review.userId as any)?.name || 'Anonymous',
        avatarUrl: (review.userId as any)?.profileImage?.imageUrl || null,
      },
    }));

    return {
      averageRating,
      ratingGrowthPercentage: Math.round(ratingGrowth),
      currentBalance,
      revenueGrowthPercentage: Math.round(revenueGrowth),
      recentReviews: formattedReviews,
    };
  }

  async getMentorRevenueData(mentorId: string) {
    const mentorObjectId = new mongoose.Types.ObjectId(mentorId);

    const walletTransactions = await WalletTransactionHistory.aggregate([
      {
        $match: {
          userId: mentorObjectId,
          type: TWalletTransactionHistory.credit,
          status: TWalletTransactionStatus.completed,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          minDate: { $min: '$createdAt' },
          maxDate: { $max: '$createdAt' },
        },
      },
    ]);

    const lifetimeEarnings = walletTransactions.length > 0 
      ? walletTransactions[0].totalAmount 
      : 0;
    const firstTransactionDate = walletTransactions.length > 0 
      ? walletTransactions[0].minDate 
      : null;
    const lastTransactionDate = walletTransactions.length > 0 
      ? walletTransactions[0].maxDate 
      : null;

    let timePeriod = '0 months';
    if (firstTransactionDate && lastTransactionDate) {
      const months = this.getMonthDifference(firstTransactionDate, lastTransactionDate);
      if (months < 12) {
        timePeriod = `${months} month${months !== 1 ? 's' : ''}`;
      } else {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths === 0) {
          timePeriod = `${years} year${years !== 1 ? 's' : ''}`;
        } else {
          timePeriod = `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
        }
      }
    }

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    const thisMonthAggregation = await WalletTransactionHistory.aggregate([
      {
        $match: {
          userId: mentorObjectId,
          type: TWalletTransactionHistory.credit,
          status: TWalletTransactionStatus.completed,
          createdAt: { $gte: currentMonthStart },
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
        },
      },
    ]);

    const lastMonthAggregation = await WalletTransactionHistory.aggregate([
      {
        $match: {
          userId: mentorObjectId,
          type: TWalletTransactionHistory.credit,
          status: TWalletTransactionStatus.completed,
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
        },
      },
    ]);

    const thisMonthEarnings = thisMonthAggregation.length > 0 
      ? thisMonthAggregation[0].amount 
      : 0;
    const lastMonthEarnings = lastMonthAggregation.length > 0 
      ? lastMonthAggregation[0].amount 
      : 0;

    let monthlyGrowth = 0;
    if (lastMonthEarnings > 0) {
      monthlyGrowth = ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;
    } else if (thisMonthEarnings > 0) {
      monthlyGrowth = 100;
    }

    return {
      lifetimeEarnings,
      timePeriod,
      thisMonthEarnings,
      monthlyGrowthPercentage: Math.round(monthlyGrowth),
    };
  }

  async getMentorRevenueTrend(mentorId: string, period: 'monthly' | 'quarterly' | 'annually' = 'monthly') {
    const mentorObjectId = new mongoose.Types.ObjectId(mentorId);
    const now = new Date();

    if (period === 'monthly') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const dailyData = await WalletTransactionHistory.aggregate([
        {
          $match: {
            userId: mentorObjectId,
            type: TWalletTransactionHistory.credit,
            status: TWalletTransactionStatus.completed,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            amount: { $sum: '$amount' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const dataMap = new Map(dailyData.map(item => [item._id, item.amount]));
      const result: Array<{ period: string; amount: number; startDate: string; endDate: string }> = [];

      const daysInMonth = endOfMonth.getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayStart = new Date(now.getFullYear(), now.getMonth(), day, 0, 0, 0);
        const dayEnd = new Date(now.getFullYear(), now.getMonth(), day, 23, 59, 59);
        
        result.push({
          period: dateStr,
          amount: dataMap.get(dateStr) || 0,
          startDate: dayStart.toISOString(),
          endDate: dayEnd.toISOString(),
        });
      }

      return result;
    }

    if (period === 'quarterly') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

      const quarterlyData = await WalletTransactionHistory.aggregate([
        {
          $match: {
            userId: mentorObjectId,
            type: TWalletTransactionHistory.credit,
            status: TWalletTransactionStatus.completed,
            createdAt: { $gte: startOfYear, $lte: endOfYear },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              quarter: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } },
            },
            amount: { $sum: '$amount' },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.quarter': 1 },
        },
      ]);

      const dataMap = new Map(
        quarterlyData.map(item => [`${item._id.year}-Q${item._id.quarter}`, item.amount])
      );

      const result: Array<{ period: string; amount: number; startDate: string; endDate: string }> = [];

      const quarterRanges = [
        { q: 1, start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 2, 31, 23, 59, 59) },
        { q: 2, start: new Date(now.getFullYear(), 3, 1), end: new Date(now.getFullYear(), 5, 30, 23, 59, 59) },
        { q: 3, start: new Date(now.getFullYear(), 6, 1), end: new Date(now.getFullYear(), 8, 30, 23, 59, 59) },
        { q: 4, start: new Date(now.getFullYear(), 9, 1), end: new Date(now.getFullYear(), 11, 31, 23, 59, 59) },
      ];

      for (const q of quarterRanges) {
        const periodKey = `${now.getFullYear()}-Q${q.q}`;
        result.push({
          period: periodKey,
          amount: dataMap.get(periodKey) || 0,
          startDate: q.start.toISOString(),
          endDate: q.end.toISOString(),
        });
      }

      return result;
    }

    if (period === 'annually') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

      const monthlyData = await WalletTransactionHistory.aggregate([
        {
          $match: {
            userId: mentorObjectId,
            type: TWalletTransactionHistory.credit,
            status: TWalletTransactionStatus.completed,
            createdAt: { $gte: startOfYear, $lte: endOfYear },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            amount: { $sum: '$amount' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const dataMap = new Map(monthlyData.map(item => [item._id, item.amount]));
      const result: Array<{ period: string; amount: number; startDate: string; endDate: string }> = [];

      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(now.getFullYear(), month, 1);
        const monthEnd = new Date(now.getFullYear(), month + 1, 0, 23, 59, 59);
        const periodKey = `${now.getFullYear()}-${String(month + 1).padStart(2, '0')}`;

        result.push({
          period: periodKey,
          amount: dataMap.get(periodKey) || 0,
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString(),
        });
      }

      return result;
    }

    return [];
  }

  async getMentorPayoutHistory(mentorId: string, options: any) {
    const mentorObjectId = new mongoose.Types.ObjectId(mentorId);

    const pipeline = [
      {
        $match: {
          userId: mentorObjectId,
          status: TWithdrawalRequest.completed,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          mentorName: '$user.name',
          email: '$user.email',
          amount: '$requestedAmount',
          status: 1,
          processedAt: 1,
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ];

    return PaginationService.aggregationPaginate(WithdrawalRequest, pipeline, options);
  }

  async getMentorWalletOverview(mentorId: string) {
    const wallet = await Wallet.findOne({ userId: mentorId }).lean();
    const currentBalance = wallet?.amount || 0;

    const withdrawalRequests = await WithdrawalRequest.find({
      userId: mentorId,
      status: { $in: [TWithdrawalRequest.requested, TWithdrawalRequest.processing] },
      isDeleted: false,
    }).lean();

    const pendingWithdrawalsCount = withdrawalRequests.length;

    const allTransactions = await WalletTransactionHistory.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(mentorId),
          type: TWalletTransactionHistory.credit,
          status: TWalletTransactionStatus.completed,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalEarnings = allTransactions.length > 0 ? allTransactions[0].total : 0;

    return {
      currentBalance,
      pendingWithdrawalsCount,
      totalEarnings,
    };
  }

  async getMentorSuccessfulPayments(mentorId: string, options: any) {
    const mentorObjectId = new mongoose.Types.ObjectId(mentorId);

    const pipeline = [
      {
        $match: {
          userId: mentorObjectId,
          type: TWalletTransactionHistory.credit,
          status: TWalletTransactionStatus.completed,
        },
      },
      {
        $lookup: {
          from: 'paymenttransactions',
          localField: 'paymentTransactionId',
          foreignField: '_id',
          as: 'paymentTransaction',
        },
      },
      {
        $unwind: {
          path: '$paymentTransaction',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          processedDate: '$createdAt',
          amount: 1,
          transactionId: '$paymentTransaction.transactionId',
          details: '$description',
          balanceBefore: 1,
          balanceAfter: 1,
        },
      },
      {
        $sort: { processedDate: -1 },
      },
    ];

    return PaginationService.aggregationPaginate(WalletTransactionHistory, pipeline, options);
  }

  async getSuccessfulPaymentDetails(mentorId: string, transactionId: string) {
    const transaction = await WalletTransactionHistory.findOne({
      _id: transactionId,
      userId: mentorId,
    })
      .populate('paymentTransactionId')
      .populate('withdrawalRequestId')
      .lean();

    if (!transaction) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Transaction not found');
    }

    const bankInfo = await BankInfo.findOne({ userId: mentorId }).lean();

    return {
      accountHolderName: bankInfo?.bankAccountHolderName || null,
      bankName: bankInfo?.bankName || null,
      branchName: bankInfo?.bankBranch || null,
      accountType: bankInfo?.bankAccountType || null,
      accountNumber: bankInfo?.bankAccountNumber ? this.maskAccountNumber(bankInfo.bankAccountNumber) : null,
      routingNumber: bankInfo?.bankRoutingNumber || null,
      mobileNumber: null,
      amount: transaction.amount,
      requestDate: transaction.withdrawalRequestId ? (transaction.withdrawalRequestId as any)?.requestedAt : null,
      processDate: transaction.createdAt,
      proofOfPayment: (transaction.withdrawalRequestId as any)?.proofOfPayment || null,
    };
  }

  async getMentorWithdrawalHistory(mentorId: string, options: any) {
    const mentorObjectId = new mongoose.Types.ObjectId(mentorId);

    const pipeline = [
      {
        $match: {
          userId: mentorObjectId,
        },
      },
      {
        $project: {
          _id: 1,
          requestDate: '$createdAt',
          status: 1,
          amount: '$requestedAmount',
          processedDate: '$processedAt',
          bankAccountNumber: 1,
          bankAccountHolderName: 1,
          bankName: 1,
          bankBranch: 1,
          bankAccountType: 1,
          proofOfPayment: 1,
        },
      },
      {
        $sort: { requestDate: -1 },
      },
    ];

    return PaginationService.aggregationPaginate(WithdrawalRequest, pipeline, options);
  }

  async getWithdrawalDetails(mentorId: string, withdrawalId: string) {
    const withdrawal = await WithdrawalRequest.findOne({
      _id: withdrawalId,
      userId: mentorId,
    })
      .populate('proofOfPayment')
      .lean();

    if (!withdrawal) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Withdrawal request not found');
    }

    return {
      accountHolderName: withdrawal.bankAccountHolderName || null,
      bankName: withdrawal.bankName || null,
      branchName: withdrawal.bankBranch || null,
      accountType: withdrawal.bankAccountType || null,
      accountNumber: withdrawal.bankAccountNumber ? this.maskAccountNumber(withdrawal.bankAccountNumber) : null,
      routingNumber: withdrawal.bankRoutingNumber || null,
      mobileNumber: (withdrawal as any).mobileNo || null,
      amount: withdrawal.requestedAmount,
      requestDate: withdrawal.requestedAt,
      processDate: withdrawal.processedAt,
      proofOfPayment: withdrawal.proofOfPayment || null,
      status: withdrawal.status,
    };
  }

  async getMentorBankInfo(mentorId: string) {
    const bankInfo = await BankInfo.findOne({ userId: mentorId, isActive: true }).lean();

    if (!bankInfo) {
      return null;
    }

    return {
      _id: bankInfo._id,
      accountHolderName: bankInfo.bankAccountHolderName,
      bankName: bankInfo.bankName,
      branchName: bankInfo.bankBranch,
      accountType: bankInfo.bankAccountType,
      accountNumber: this.maskAccountNumber(bankInfo.bankAccountNumber),
      routingNumber: bankInfo.bankRoutingNumber,
    };
  }

  async createOrUpdateMentorBankInfo(mentorId: string, data: {
    bankAccountHolderName: string;
    bankName: string;
    bankBranch: string;
    bankAccountType: string;
    bankAccountNumber: string;
    bankRoutingNumber: string;
  }) {
    const existing = await BankInfo.findOne({ userId: mentorId });

    if (existing) {
      existing.bankAccountHolderName = data.bankAccountHolderName;
      existing.bankName = data.bankName;
      existing.bankBranch = data.bankBranch;
      existing.bankAccountType = data.bankAccountType as TBankAccount;
      existing.bankAccountNumber = data.bankAccountNumber;
      existing.bankRoutingNumber = data.bankRoutingNumber;

      return await existing.save();
    }

    return await BankInfo.create({
      userId: mentorId,
      ...data,
    });
  }

  async requestWithdrawal(mentorId: string, amount: number) {
    const wallet = await Wallet.findOne({ userId: mentorId });

    if (!wallet) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Wallet not found');
    }

    if (wallet.amount < amount) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Insufficient balance');
    }

    const bankInfo = await BankInfo.findOne({ userId: mentorId, isActive: true });

    if (!bankInfo) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Please add bank information first');
    }

    const withdrawal = await WithdrawalRequest.create({
      walletId: wallet._id,
      userId: mentorId,
      requestedAmount: amount,
      bankAccountNumber: bankInfo.bankAccountNumber,
      bankRoutingNumber: bankInfo.bankRoutingNumber,
      bankAccountHolderName: bankInfo.bankAccountHolderName,
      bankAccountType: bankInfo.bankAccountType,
      bankBranch: bankInfo.bankBranch,
      bankName: bankInfo.bankName,
      status: TWithdrawalRequest.requested,
      requestedAt: new Date(),
    });

    return withdrawal;
  }

  async getMentorRatingOverview(mentorId: string) {
    const mentorObjectId = new mongoose.Types.ObjectId(mentorId);

    const ratingAggregation = await MentorReview.aggregate([
      {
        $match: {
          mentorId: mentorObjectId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: { $push: '$rating' },
        },
      },
    ]);

    let averageRating = 0;
    let totalStudents = 0;
    let ratingBreakdown: Array<{ rating: number; percentage: number }> = [];

    if (ratingAggregation.length > 0) {
      averageRating = Number(ratingAggregation[0].averageRating.toFixed(1));
      totalStudents = ratingAggregation[0].totalReviews;

      const countMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      for (const rating of ratingAggregation[0].ratings as number[]) {
        countMap[rating] = (countMap[rating] || 0) + 1;
      }

      ratingBreakdown = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        percentage: totalStudents
          ? Number((((countMap[rating] || 0) / totalStudents) * 100).toFixed(0))
          : 0,
      }));
    } else {
      ratingBreakdown = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        percentage: 0,
      }));
    }

    return {
      averageRating,
      totalStudents,
      ratingBreakdown,
    };
  }

  async getMentorReviews(mentorId: string, options: any) {
    const mentorObjectId = new mongoose.Types.ObjectId(mentorId);

    const pipeline = [
      {
        $match: {
          mentorId: mentorObjectId,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          rating: 1,
          review: 1,
          createdAt: 1,
          student: {
            name: '$user.name',
            avatarUrl: '$user.profileImage.imageUrl',
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ];

    return PaginationService.aggregationPaginate(MentorReview, pipeline, options);
  }

  private getMonthDifference(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  }

  private maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  }
}
