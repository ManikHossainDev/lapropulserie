import { apiSlice } from "../../api/apiSlice";

const settings = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTermsAndConditions: builder.query({
            query: () => ({
                url: `/settings/public/terms-and-conditions`,
                method: "GET",
            }),
            providesTags: ["Settings"],
        }),
        getPrivacyPolicy: builder.query({
            query: () => ({
                url: `/settings/public/privacy-policy`,
                method: "GET",
            }),
            providesTags: ["Settings"],
        }),
    }),
});

export const { useGetTermsAndConditionsQuery, useGetPrivacyPolicyQuery } = settings;