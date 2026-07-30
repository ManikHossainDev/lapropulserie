import { baseApi } from "../../baseApi/baseApi";

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: ({ page , limit , search }) => ({
        url: `/users/admin/management?page=${page}&limit=${limit}&sortBy=createdAt%3Adesc&search=${search}`,
        method: "GET",
      }),
      providesTags: ["User-2"],
    }),



    getAllCollectors: builder.query({
      query: ({ from, to }) => ({
        url: `/get-collaborator-data?from=${from}&to=${to}`,
        method: "GET",
      }),
      providesTags: ["User-2"],
    }),
    getSingleUser: builder.query({
      query: ({ id }) => ({
        url: `/get-single-user-data/${id}`,
        method: "GET",
      }),
      providesTags: ["User-2"],
    }),
    blockUser: builder.mutation({
      query: (id) => ({
        url: `/ban-user-2/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["User-2"],
    }),
    UnBlockUser: builder.mutation({
      query: (id) => ({
        url: `/unban-user-2/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["User-2"],
    }),
  }),
});

export const { useGetAllUsersQuery, useGetAllCollectorsQuery, useGetSingleUserQuery, useBlockUserMutation, useUnBlockUserMutation } = userApi;
