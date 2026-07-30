import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({
    // baseUrl: "https://api.lapropulserie.com/api/v1",
    // baseUrl: "http://localhost:8005/api/v1",
    // baseUrl: "http://10.10.5.76:8005/api/v1",
    baseUrl: "https://mohaimin8005.sobhoy.com/api/v1",
  
    prepareHeaders: (headers, { getState }) => {
      // const token = getState().auth.token; 
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Categories", "ComboBox", "Products", "BuildBox", 'User-2', "Subscription", "Setting", 'Privacy-Policy', "Profile", "Document", "Lawyer", "JourneyCapsules", "IndividualCapsule", "IndividualCapsuleCategory"],
  endpoints: () => ({}),
});
