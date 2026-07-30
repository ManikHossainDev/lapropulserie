import { baseApi } from "../../baseApi/baseApi";

export const subscriptionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllSubscriptions: builder.query({
            query: ({ page, limit }) => ({
                url: `/subscription-plans/admin?page=${page}&limit=${limit}&sortBy=sortOrder`,
                method: "GET",
            }),
        }),
        createSubscription: builder.mutation({
            query: (data) => ({
                url: "/subscription-plans/admin",
                method: "POST",
                body: data,
            }),
        }),
        updateSubscription: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/subscription-plans/admin/${id}`,
                method: "PATCH",
                body: data,
            }),
        }),
        getUserSubscription: builder.query({
            query: ({ page, limit }) => ({
                url: `/user-subscriptions/admin?page=${page}&limit=${limit}`,
                method: "GET",
            }),
        }),
    }),
});

export const { 
    useGetAllSubscriptionsQuery, 
    useCreateSubscriptionMutation, 
    useUpdateSubscriptionMutation,
    useGetUserSubscriptionQuery,


} = subscriptionApi;