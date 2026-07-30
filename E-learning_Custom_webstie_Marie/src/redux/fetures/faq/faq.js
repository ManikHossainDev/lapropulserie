import { apiSlice } from "../../api/apiSlice";

const faq = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllFaqs: builder.query({
            query: ({ page = 1, limit = 50 } = {}) => ({
                url: `/faq/paginate`,
                method: "GET",
                params: { page, limit },
            }),
            providesTags: ["FAQ"],
        }),
    }),
});

export const { useGetAllFaqsQuery } = faq;