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
        }),
        updateStudentProfile: builder.mutation({
            query: (data) => ({
                url: "/users/profile-info",
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const { 
    useGetStudentProfileProgressQuery, 
    useGetMyMentorsQuery, 
    useGetStudentMyProfileInfoQuery ,
    useUpdateStudentProfileMutation


} = profile;