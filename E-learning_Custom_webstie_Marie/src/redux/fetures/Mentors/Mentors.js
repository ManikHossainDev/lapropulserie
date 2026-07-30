import { apiSlice } from "../../api/apiSlice";

const mentors = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllRecommendedMentors: builder.query({
            query: () => ({
                url: `/student-dashboard/mentors?page=1&limit=10&type=recommended`,
                method: "GET",
            }),
        }),
        getTopMentors: builder.query({
            query: () => ({
                url: `/student-dashboard/mentors?page=1&limit=6&type=top`,
                method: "GET",
            }),
        }),
        getBookMentors: builder.query({
            query: () => ({
                url: `/student-dashboard/mentors?page=1&limit=10&type=booked`,
                method: "GET",
            }),
        }),
        getRecommendedMentors: builder.query({
            query: () => ({
                url: `/student-dashboard/mentors?page=1&limit=10&type=recommended`,
                method: "GET",
            }),
        }),
        getMentorDetails: builder.query({
            query: (mentorId) => ({
                url: `/mentors/${mentorId}`,
                method: "GET",
            }),
        }),
        bookingMentor: builder.mutation({
            query: ({ mentorId }) => ({
                url: `/mentors/${mentorId}/book-session`,
                method: "POST",
            }),
        }),
        reviewMantor: builder.mutation({
            query: ({ mentorId, body }) => ({
                url: `/mentors/${mentorId}/review`,
                method: "POST",
                body: body,
            }),
        }),
    }),
});

export const {
    useGetAllRecommendedMentorsQuery,
    useGetTopMentorsQuery,
    useGetBookMentorsQuery,
    useGetRecommendedMentorsQuery,
    useGetMentorDetailsQuery,
    useBookingMentorMutation,
    useReviewMantorMutation,
} = mentors;