import { apiSlice } from '../../api/apiSlice';

const onboardingStatusApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudentOnboardingStatus: builder.query({
      query: () => ({
        url: '/auth/onboarding/status',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetStudentOnboardingStatusQuery } = onboardingStatusApi;
