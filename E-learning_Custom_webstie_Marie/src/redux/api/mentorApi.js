'use client';
import { apiSlice } from './apiSlice';

export const mentorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRevenueData: builder.query({
      query: () => '/mentor-dashboard/revenue',
      providesTags: ['Revenue'],
    }),
    getRevenueTrend: builder.query({
      query: (period = 'monthly') => `/mentor-dashboard/revenue-trend?period=${period}`,
      providesTags: ['Revenue'],
    }),
    getPayoutHistory: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return `/mentor-dashboard/payout-history?${queryParams}`;
      },
      providesTags: ['PayoutHistory'],
    }),
    getWalletOverview: builder.query({
      query: () => '/mentor-dashboard/wallet-overview',
      providesTags: ['Wallet'],
    }),
    getSuccessfulPayments: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return `/mentor-dashboard/successful-payments?${queryParams}`;
      },
      providesTags: ['Payments'],
    }),
    getSuccessfulPaymentDetails: builder.query({
      query: (transactionId) => `/mentor-dashboard/successful-payments/${transactionId}`,
      providesTags: ['Payments'],
    }),
    getWithdrawalHistory: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return `/mentor-dashboard/withdrawal-history?${queryParams}`;
      },
      providesTags: ['Withdrawal'],
    }),
    getWithdrawalDetails: builder.query({
      query: (withdrawalId) => `/mentor-dashboard/withdrawal-history/${withdrawalId}`,
      providesTags: ['Withdrawal'],
    }),
    getBankInfo: builder.query({
      query: () => '/mentor-dashboard/bank-info',
      providesTags: ['BankInfo'],
    }),
    updateBankInfo: builder.mutation({
      query: (data) => ({
        url: '/mentor-dashboard/bank-info',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['BankInfo'],
    }),
    requestWithdrawal: builder.mutation({
      query: (data) => ({
        url: '/mentor-dashboard/request-withdrawal',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'Withdrawal'],
    }),
  }),
});

export const {
  useGetRevenueDataQuery,
  useGetRevenueTrendQuery,
  useGetPayoutHistoryQuery,
  useGetWalletOverviewQuery,
  useGetSuccessfulPaymentsQuery,
  useGetSuccessfulPaymentDetailsQuery,
  useGetWithdrawalHistoryQuery,
  useGetWithdrawalDetailsQuery,
  useGetBankInfoQuery,
  useUpdateBankInfoMutation,
  useRequestWithdrawalMutation,
} = mentorApi;