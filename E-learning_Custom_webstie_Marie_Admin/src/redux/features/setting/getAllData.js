import { baseApi } from "../../baseApi/baseApi";

const settingAllApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPrivacyPolicy: builder.query({
            query: () => ({
                url: "/settings/public/privacy-policy",
                method: "GET",
            }),
        }),
        updatePrivacyPolicy: builder.mutation({
            query: (data) => ({
                url: "/settings/admin/privacy-policy",
                method: "PUT",
                body: data,
            }),
        }),
        getTermsConditions: builder.query({
            query: () => ({
                url: "/settings/public/terms-and-conditions",
                method: "GET",
            }),
        }),
        updateTermConditions: builder.mutation({
            query: (data) => ({
                url: "/settings/admin/terms-and-conditions",
                method: "PUT",
                body: data,
            }),
        }),

    }),
});

export const {
    useGetPrivacyPolicyQuery,
    useUpdatePrivacyPolicyMutation,
    useGetTermsConditionsQuery,
    useUpdateTermConditionsMutation
} = settingAllApi;