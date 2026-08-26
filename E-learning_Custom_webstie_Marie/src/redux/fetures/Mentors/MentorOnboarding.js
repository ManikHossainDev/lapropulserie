import { apiSlice } from "../../api/apiSlice";

const mentorOnboarding = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getOnboardingStatus: builder.query({
            query: () => ({
                url: `/mentor-profiles/onboarding/status`,
                method: "GET",
            }),
            providesTags: ["MentorOnboarding"],
        }),
        getMentorProfile: builder.query({
            query: () => ({
                url: `/mentor-profiles/my-profile`,
                method: "GET",
            }),
        }),
        getMentorReviews: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => ({
                url: `/mentor-dashboard/reviews?page=${page}&limit=${limit}`,
                method: "GET",
            }),
        }),
        getMentorRatingOverview: builder.query({
            query: () => ({
                url: `/mentor-dashboard/rating-overview`,
                method: "GET",
            }),
        }),
        getMentorDashboard: builder.query({
            query: () => ({
                url: `/mentor-dashboard/dashboard`,
                method: "GET",
            }),
        }),
        getMentorRevenue: builder.query({
            query: () => ({
                url: `/mentor-dashboard/revenue`,
                method: "GET",
            }),
        }),
        getSubscriptionPlans: builder.query({
            query: () => ({
                url: `/subscription-plans/active`,
                method: "GET",
            }),
        }),
        updateProfileWithAvatar: builder.mutation({
            query: ({ data, avatarUrl }) => {
                const formData = new FormData();
                formData.append('data', JSON.stringify(data));
                // Only append real file uploads — never a URL string (breaks multer)
                if (typeof File !== 'undefined' && avatarUrl instanceof File) {
                    formData.append('avatarUrl', avatarUrl);
                } else if (typeof Blob !== 'undefined' && avatarUrl instanceof Blob) {
                    formData.append('avatarUrl', avatarUrl, 'avatar.jpg');
                }
                return {
                    url: `/mentor-profiles/onboarding/profile-with-avatar`,
                    method: "PUT",
                    body: formData,
                };
            },
            invalidatesTags: ["MentorOnboarding"],
        }),
        updateMission: builder.mutation({
            query: (data) => ({
                url: `/mentor-profiles/onboarding/profile`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["MentorOnboarding"],
        }),
        updateInnerFuel: builder.mutation({
            query: (data) => ({
                url: `/mentor-profiles/onboarding/profile`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["MentorOnboarding"],
        }),
        updateMethods: builder.mutation({
            query: (data) => ({
                url: `/mentor-profiles/onboarding/profile`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["MentorOnboarding"],
        }),
        subscribeToPlan: builder.mutation({
            query: ({ subscriptionPlanId }) => ({
                url: `/mentor-profiles/subscription/subscribe`,
                method: "POST",
                body: { subscriptionPlanId },
            }),
        }),
        requestAdminApproval: builder.mutation({
            query: () => ({
                url: `/mentor-profiles/onboarding/request-approval`,
                method: "PUT",
            }),
        }),
        goLive: builder.mutation({
            query: (data) => ({
                url: `/mentor-profiles/onboarding/profile`,
                method: "PUT",
                body: data,
            }),
        }),
    }),
});

export const {
    useGetOnboardingStatusQuery,
    useGetMentorProfileQuery,
    useGetMentorReviewsQuery,
    useGetMentorRatingOverviewQuery,
    useGetMentorDashboardQuery,
    useGetMentorRevenueQuery,
    useGetSubscriptionPlansQuery,
    useUpdateProfileWithAvatarMutation,
    useUpdateMissionMutation,
    useUpdateInnerFuelMutation,
    useUpdateMethodsMutation,
    useSubscribeToPlanMutation,
    useRequestAdminApprovalMutation,
    useGoLiveMutation,
} = mentorOnboarding;