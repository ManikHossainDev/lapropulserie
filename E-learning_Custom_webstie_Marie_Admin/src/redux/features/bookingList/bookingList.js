import { baseApi } from "../../baseApi/baseApi";

export const bookingListApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBookingAccessList: builder.query({
            query: () => ({
                url: "/mentor-approval-bookings",
                method: "GET",
            }),
        }),
        getBookingInterviewList: builder.query({
            query: () => ({
                url: "/mentor-approval-bookings",
                method: "GET",
            }),
        }),
        getBookingInterviewNoShowList: builder.query({
            query: () => ({
                url: "/mentor-approval-bookings",
                method: "GET",
            }),
        }),
        updateBookingStatus: builder.mutation({
            query: ({ id, data }) => ({
                url: `/mentor-profiles/admin/reviews/${id}/approval-status`,
                method: "PATCH",
                body: data,
            }),
        }),

    }),
});

export const { 
    useGetBookingAccessListQuery, 
    useGetBookingInterviewListQuery,
    useGetBookingInterviewNoShowListQuery, 
    useUpdateBookingStatusMutation 
} = bookingListApi;