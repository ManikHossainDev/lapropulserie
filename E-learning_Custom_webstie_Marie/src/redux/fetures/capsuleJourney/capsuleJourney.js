import { apiSlice } from "../../api/apiSlice";

const capsuleJourneyApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCategoryById: builder.query({
      query: (id) => `/individual-capsule-category/${id}`,
    }),
    getCapsuleJourneyById: builder.query({
      query: (arg) => {
        const id = typeof arg === 'string' ? arg : arg?.id || arg?.capsuleId;
        const journeyId = typeof arg === 'string' ? undefined : arg?.journeyId;
        const params = new URLSearchParams();
        if (journeyId) params.set('journeyId', journeyId);
        const qs = params.toString();
        return `/individual-capsule/${id}${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result, error, arg) => {
        const id = typeof arg === 'string' ? arg : arg?.id || arg?.capsuleId;
        return [{ type: 'CapsuleJourney', id }];
      },
      keepUnusedDataFor: 0,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }),
    getCapsulesByCategory: builder.query({
      query: (categoryId) =>
        `/student-dashboard/capsules?categoryId=${categoryId}&page=1&limit=20`,
    }),
    saveLearnerAnswers: builder.mutation({
      query: (body) => ({
        url: "/learner-answers",
        method: "POST",
        body,
      }),
    }),
    getLearnerAnswers: builder.query({
      query: (arg) => {
        const capsuleId = typeof arg === 'string' ? arg : arg?.capsuleId;
        const journeyId = typeof arg === 'string' ? undefined : arg?.journeyId;
        const params = new URLSearchParams();
        if (journeyId) params.set('journeyId', journeyId);
        const qs = params.toString();
        return `/learner-answers/${capsuleId}${qs ? `?${qs}` : ''}`;
      },
    }),
    generateMariiReport: builder.mutation({
      query: (body) => ({
        url: "/marii-report/generate",
        method: "POST",
        body,
      }),
    }),
    autoGenerateMariiReport: builder.mutation({
      query: (body) => ({
        url: "/marii-report/auto-generate",
        method: "POST",
        body,
      }),
    }),
    getMariiReport: builder.query({
      query: (capsuleId) => `/marii-report/${capsuleId}`,
    }),
    listMariiReports: builder.query({
      query: () => `/marii-report/student/list`,
    }),
    getExpeditionMariiReport: builder.query({
      query: (journeyId) => `/marii-report/expedition/${journeyId}`,
    }),
    generateExpeditionMariiReport: builder.mutation({
      query: (body) => ({
        url: "/marii-report/expedition/generate",
        method: "POST",
        body,
      }),
    }),
    lunaChat: builder.mutation({
      query: (body) => ({
        url: "/luna/chat",
        method: "POST",
        body,
      }),
    }),
    purchaseCapsule: builder.mutation({
      query: (capsuleId) => ({
        url: `/purchased-individual-capsule/${capsuleId}`,
        method: "POST",
      }),
    }),
    getRecommendations: builder.query({
      query: ({ context = "discover", capsuleId, journeyId } = {}) => {
        const params = new URLSearchParams({ context });
        if (capsuleId) params.set("capsuleId", capsuleId);
        if (journeyId) params.set("journeyId", journeyId);
        return `/student-dashboard/recommendations?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useGetCategoryByIdQuery,
  useGetCapsuleJourneyByIdQuery,
  useGetCapsulesByCategoryQuery,
  useSaveLearnerAnswersMutation,
  useGetLearnerAnswersQuery,
  useGenerateMariiReportMutation,
  useAutoGenerateMariiReportMutation,
  useGetMariiReportQuery,
  useListMariiReportsQuery,
  useGetExpeditionMariiReportQuery,
  useGenerateExpeditionMariiReportMutation,
  useLunaChatMutation,
  usePurchaseCapsuleMutation,
  useGetRecommendationsQuery,
} = capsuleJourneyApi;
