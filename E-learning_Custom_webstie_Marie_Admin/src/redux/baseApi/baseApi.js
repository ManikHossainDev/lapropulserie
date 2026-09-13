import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8005/api/v1"
).replace(/\/$/, "");

export const baseApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    // Capsule / lesson video replaces can be 50–250 MB — default fetch abort is too aggressive
    timeout: 15 * 60 * 1000,

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
