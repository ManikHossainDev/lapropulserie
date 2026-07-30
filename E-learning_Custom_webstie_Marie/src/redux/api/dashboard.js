import { apiSlice } from './apiSlice';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchDashboardStats: builder.query({
      query: () => '/admin-dashboard/stats',
      providesTags: ['Dashboard'],
    }),
    fetchGrowthTrends: builder.query({
      query: (period = 'monthly') => `/admin-dashboard/growth-trends?filter=${period}`,
      providesTags: ['GrowthTrends'],
    }),
    fetchSubscriptionStats: builder.query({
      query: () => '/admin-dashboard/subscription-stats',
      providesTags: ['Subscriptions'],
    }),
    fetchCapsuleFinanceStats: builder.query({
      query: (filter = 'monthly') => `/admin-dashboard/capsule-finance-stats?filter=${filter}`,
      providesTags: ['Finance'],
    }),
    fetchRecentTransactions: builder.query({
      query: ({ page = 1, limit = 10, type } = {}) => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (type) params.append('type', type);
        return `/admin-dashboard/recent-transactions?${params.toString()}`;
      },
      providesTags: ['Transactions'],
    }),
    fetchActivityFeed: builder.query({
      query: ({ page = 1, limit = 20, category } = {}) => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (category) params.append('category', category);
        return `/admin-dashboard/activity-feed?${params.toString()}`;
      },
      providesTags: ['ActivityFeed'],
    }),
  }),
});

export const {
  useFetchDashboardStatsQuery,
  useFetchGrowthTrendsQuery,
  useFetchSubscriptionStatsQuery,
  useFetchCapsuleFinanceStatsQuery,
  useFetchRecentTransactionsQuery,
  useFetchActivityFeedQuery,
} = dashboardApi;