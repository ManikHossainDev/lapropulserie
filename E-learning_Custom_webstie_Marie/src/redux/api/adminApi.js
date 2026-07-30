import { apiSlice } from './apiSlice';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Users
    fetchUsers: builder.query({
      query: ({ q, role, status, page, pageSize = 10 } = {}) => {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (role) params.append('role', role);
        if (status) params.append('status', status);
        params.append('page', page || 1);
        params.append('limit', pageSize);
        return `/users/admin/management?${params.toString()}`;
      },
      providesTags: ['Users'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: `/admin/users/${userId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    // Mentees
    fetchMentees: builder.query({
      query: ({ q, status, page, pageSize = 10 } = {}) => {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (status) params.append('status', status);
        params.append('page', page || 1);
        params.append('limit', pageSize);
        return `/users/admin/management?role=student&${params.toString()}`;
      },
      providesTags: ['Users'],
    }),

    // Mentors
    fetchMentors: builder.query({
      query: ({ q, status, page, pageSize = 10 } = {}) => {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (status) params.append('status', status);
        params.append('page', page || 1);
        params.append('limit', pageSize);
        return `/users/admin/management?role=mentor&${params.toString()}`;
      },
      providesTags: ['Users'],
    }),

    // Bookings
    fetchAccessRequests: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/admin/bookings/access-requests?page=${page}&limit=${limit}`,
      providesTags: ['Bookings'],
    }),
    approveAccessRequest: builder.mutation({
      query: (requestId) => ({
        url: `/admin/bookings/access-requests/${requestId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Bookings'],
    }),
    rejectAccessRequest: builder.mutation({
      query: (requestId) => ({
        url: `/admin/bookings/access-requests/${requestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['Bookings'],
    }),
    fetchInterviews: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/admin/bookings/interviews?page=${page}&limit=${limit}`,
      providesTags: ['Bookings'],
    }),
    fetchNoShows: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/admin/bookings/no-shows?page=${page}&limit=${limit}`,
      providesTags: ['Bookings'],
    }),

    // Capsules
    fetchCategories: builder.query({
      query: () => '/admin/capsules/categories',
      providesTags: ['Categories'],
    }),
    saveCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: id ? `/admin/capsules/categories/${id}` : '/admin/capsules/categories',
        method: id ? 'PUT' : 'POST',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `/admin/capsules/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
    fetchCategoryById: builder.query({
      query: (categoryId) => `/admin/capsules/categories/${categoryId}`,
      providesTags: ['Categories'],
    }),
    saveCapsuleInCategory: builder.mutation({
      query: ({ id, categoryId, ...data }) => ({
        url: id ? `/admin/capsules/categories/${categoryId}/capsules/${id}` : `/admin/capsules/categories/${categoryId}/capsules`,
        method: id ? 'PUT' : 'POST',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteModule: builder.mutation({
      query: ({ categoryId, moduleId }) => ({
        url: `/admin/capsules/categories/${categoryId}/modules/${moduleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteCapsule: builder.mutation({
      query: ({ categoryId, capsuleId }) => ({
        url: `/admin/capsules/categories/${categoryId}/capsules/${capsuleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),

    // Expeditions
    fetchExpeditions: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/journey/paginate?page=${page}&limit=${limit}`,
      providesTags: ['Expeditions'],
    }),
    fetchExpeditionById: builder.query({
      query: (expeditionId) => `/journey/${expeditionId}`,
      providesTags: ['Expeditions'],
    }),
    deleteExpedition: builder.mutation({
      query: (expeditionId) => ({
        url: `/admin/expeditions/${expeditionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expeditions'],
    }),
    fetchExpeditionCapsules: builder.query({
      query: ({ expeditionId, page = 1, limit = 10 } = {}) => `/admin/expeditions/${expeditionId}/capsules?page=${page}&limit=${limit}`,
      providesTags: ['Expeditions'],
    }),
    fetchExpeditionCapsuleDetails: builder.query({
      query: ({ expeditionId, capsuleId }) => `/admin/expeditions/${expeditionId}/capsules/${capsuleId}`,
      providesTags: ['Expeditions'],
    }),

    // Finance
    fetchCapsulesFinanceStats: builder.query({
      query: () => '/admin/finance/capsules/stats',
      providesTags: ['Finance'],
    }),
    fetchGrowthSeries: builder.query({
      query: ({ period = 'monthly' } = {}) => `/admin/finance/growth-series?period=${period}`,
      providesTags: ['Finance'],
    }),
    fetchTopCapsules: builder.query({
      query: ({ limit = 10 } = {}) => `/admin/finance/top-capsules?limit=${limit}`,
      providesTags: ['Finance'],
    }),
    fetchTransactions: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/admin/finance/transactions?page=${page}&limit=${limit}`,
      providesTags: ['Finance'],
    }),
    fetchSubscriptionStats: builder.query({
      query: () => '/admin-dashboard/subscription-stats',
      providesTags: ['Finance'],
    }),
    fetchUserSubscriptions: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `user-subscriptions/admin?page=${page}&limit=${limit}`,
      providesTags: ['Finance'],
    }),
    fetchSubscriptionPlans: builder.query({
      query: () => '/subscription-plans/admin',
      providesTags: ['Finance'],
    }),
    createSubscriptionPlan: builder.mutation({
      query: (data) => ({
        url: '/subscription-plans/admin',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Finance'],
    }),
    updateSubscriptionPlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/subscription-plans/admin/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Finance'],
    }),
    deleteSubscriptionPlan: builder.mutation({
      query: (id) => ({
        url: `/subscription-plans/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Finance'],
    }),

    // Questionnaire
    fetchSections: builder.query({
      query: () => '/question-system/admin/questionary?category=free',
      providesTags: ['Questionnaire'],
    }),
    fetchSectionById: builder.query({
      query: (sectionId) => `/question-system/admin/questionary/${sectionId}`,
      providesTags: ['Questionnaire'],
    }),
    saveSection: builder.mutation({
      query: ({ id, ...data }) => ({
        url: id ? `/question-system/admin/questionary/${id}` : '/question-system/admin/questionary',
        method: id ? 'PUT' : 'POST',
        body: data,
      }),
      invalidatesTags: ['Questionnaire'],
    }),
    deleteSection: builder.mutation({
      query: (sectionId) => ({
        url: `/question-system/admin/questionary/${sectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Questionnaire'],
    }),

    // Wallet
    fetchWithdrawals: builder.query({
      query: ({ page = 1, limit = 10, status } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (status) params.append('status', status);
        return `/withdrawal-request/paginate/for-admin?${params.toString()}`;
      },
      providesTags: ['Wallet'],
    }),
    fetchBankAccount: builder.query({
      query: () => '/bank-info/paginate?page=1&limit=1',
      transformResponse: (response) => response.data?.results?.[0] ?? null,
      providesTags: ['BankInfo'],
    }),
    saveBankAccount: builder.mutation({
      query: (data) => ({
        url: '/bank-info/create-or-update',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['BankInfo'],
    }),
    approveWithdrawal: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/withdrawal-request/${id}`,
        method: 'PUT',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Wallet'],
    }),
  }),
});

export const {
  // Users
  useFetchUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useFetchMenteesQuery,
  useFetchMentorsQuery,
  // Bookings
  useFetchAccessRequestsQuery,
  useApproveAccessRequestMutation,
  useRejectAccessRequestMutation,
  useFetchInterviewsQuery,
  useFetchNoShowsQuery,
  // Capsules
  useFetchCategoriesQuery,
  useSaveCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoryByIdQuery,
  useSaveCapsuleInCategoryMutation,
  useDeleteModuleMutation,
  useDeleteCapsuleMutation,
  // Expeditions
  useFetchExpeditionsQuery,
  useFetchExpeditionByIdQuery,
  useDeleteExpeditionMutation,
  useFetchExpeditionCapsulesQuery,
  useFetchExpeditionCapsuleDetailsQuery,
  // Finance
  useFetchCapsulesFinanceStatsQuery,
  useFetchGrowthSeriesQuery,
  useFetchTopCapsulesQuery,
  useFetchTransactionsQuery,
  useFetchSubscriptionStatsQuery,
  useFetchUserSubscriptionsQuery,
  useFetchSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useToggleSubscriptionPlanMutation,
  // Questionnaire
  useFetchSectionsQuery,
  useFetchSectionByIdQuery,
  useSaveSectionMutation,
  useDeleteSectionMutation,
  // Wallet
  useFetchWithdrawalsQuery,
  useFetchBankAccountQuery,
  useSaveBankAccountMutation,
  useApproveWithdrawalMutation,
} = adminApi;