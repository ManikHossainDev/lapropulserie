import { baseApi } from "../../baseApi/baseApi";

export const dashboardHomeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStatus: builder.query({
            query: () => ({
                url: "/admin-dashboard/stats",
                method: "GET",
            }),
        }),
        getDashboardGrowthTrends: builder.query({
            query: () => ({
                url: "/admin-dashboard/growth-trends",
                method: "GET",
            }),
        }),
        getAllActiveSubscriptions: builder.query({
            query: () => ({
                url: "/admin-dashboard/subscription-stats",
                method: "GET",
            }),
        }),
        getDashActiveFeed: builder.query({
            query: () => ({
                url: "/admin-dashboard/activity-feed",
                method: "GET",
            }),
        }),
        

    })
});

export const { 
    useGetDashboardStatusQuery, 
    useGetDashboardGrowthTrendsQuery, 
    useGetAllActiveSubscriptionsQuery,
    useGetDashActiveFeedQuery


 } = dashboardHomeApi;