import { baseApi } from "../../baseApi/baseApi";

export const calendlyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    connectCalendly: builder.mutation({
      query: () => ({
        url: "/calendly/connect",
        method: "GET",
      }),
    }),
    disconnectCalendly: builder.mutation({
      query: () => ({
        url: "/calendly/delete-subscription",
        method: "GET",
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useConnectCalendlyMutation,
  useDisconnectCalendlyMutation,
} = calendlyApi;
