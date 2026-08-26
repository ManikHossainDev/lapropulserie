import { apiSlice } from "../../api/apiSlice";

const profile = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getStudentProfileProgress: builder.query({
            query: () => "/student-dashboard/progress",
        }),
        getMyMentors: builder.query({
            query: () => "/student-dashboard/my-mentors?page=1&limit=10",
        }),
        getStudentMyProfileInfo: builder.query({
            query: () => "/users/profile-info",
            providesTags: ["Profile"],
        }),
        getCompletedJourneys: builder.query({
            query: () => "/student-dashboard/completed-journeys?page=1&limit=20",
        }),
        updateStudentProfile: builder.mutation({
            query: (data) => ({
                url: "/users/profile-info",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Profile"],
        }),
        deleteMyAccount: builder.mutation({
            query: () => ({
                url: "/users/delete-my-account",
                method: "PUT",
            }),
        }),
    }),
});

export const { 
    useGetStudentProfileProgressQuery, 
    useGetMyMentorsQuery, 
    useGetStudentMyProfileInfoQuery,
    useGetCompletedJourneysQuery,
    useUpdateStudentProfileMutation,
    useDeleteMyAccountMutation,
} = profile;
