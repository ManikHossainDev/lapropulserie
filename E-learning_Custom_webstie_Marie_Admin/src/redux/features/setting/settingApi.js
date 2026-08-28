import { baseApi } from "../../baseApi/baseApi";

const settingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getAllFaq: builder.query({
      query: ({ page, limit }) => ({
        url: `/faq/paginate?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    getFaqCategories: builder.query({
      query: () => ({
        url: `/faqCategory`,
        method: "GET",
      }),
    }),
    createFaqCategory: builder.mutation({
      query: (body) => ({
        url: `/faqCategory`,
        method: "POST",
        body,
      }),
    }),
    createFaq: builder.mutation({
      query: (faqData) => ({
        url: "/faq",
        method: "POST",
        body: faqData,
      }),
    }),
    deleteFaq: builder.mutation({
      query: (id) => ({
        url: `/faq/${id}`,
        method: "DELETE",
      }),
    }),

    getProfile: builder.query({
      query: () => ({
        url: "/users/profile-info",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: "/users/profile-info",
        method: "PUT",
        body: formData,
      }),
    }),
    getAllNotifications: builder.query({
      query: () => ({
        url: `/notifications/admin`,
        method: "GET",
      }),
    }),
    readAllNotifications: builder.mutation({
      query: () => ({
        url: `/notifications/mark-all-read`,
        method: "PATCH",
      }),
    }),

  }),
});

export const {
  useGetAllFaqQuery,
  useGetFaqCategoriesQuery,
  useCreateFaqCategoryMutation,
  useCreateFaqMutation,
  useDeleteFaqMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetAllNotificationsQuery,
  useReadAllNotificationsMutation
} = settingApi;
