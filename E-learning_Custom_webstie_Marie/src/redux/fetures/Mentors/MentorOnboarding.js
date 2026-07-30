import { apiSlice } from "../../api/apiSlice";

const mentorOnboarding = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getOnboardingStatus: builder.query({
            query: () => ({
                url: `/mentor-profiles/onboarding/status`,
                method: "GET",
            }),
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
                if (avatarUrl) {
                    formData.append('avatarUrl', avatarUrl);
                }
                return {
                    url: `/mentor-profiles/onboarding/profile-with-avatar`,
                    method: "PUT",
                    body: formData,
                };
            },
        }),
        updateMission: builder.mutation({
            query: (data) => ({
                url: `/mentor-profiles/onboarding/profile`,
                method: "PUT",
                body: data,
            }),
        }),
        updateInnerFuel: builder.mutation({
            query: (data) => ({
                url: `/mentor-profiles/onboarding/profile`,
                method: "PUT",
                body: data,
            }),
        }),
        updateMethods: builder.mutation({
            query: (data) => ({
                url: `/mentor-profiles/onboarding/profile`,
                method: "PUT",
                body: data,
            }),
        }),
        subscribeToPlan: builder.mutation({
            query: ({ subscriptionPlanId }) => ({
                url: `/mentor-profiles/subscription/subscribe`,
                method: "POST",
                body: { subscriptionPlanId },
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
    useGoLiveMutation,
} = mentorOnboarding;