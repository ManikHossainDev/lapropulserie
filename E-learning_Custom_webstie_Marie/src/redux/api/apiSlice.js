import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import url from "./baseUrl";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: url + "/api/v1",
    // Avoid HTTP 304 serving stale capsule/video payloads after admin updates
    fetchFn: (input, init) =>
      fetch(input, {
        ...init,
        cache: "no-store",
      }),
    prepareHeaders: (headers) => {
      try {
        const raw = localStorage.getItem("token");
        const token = raw ? JSON.parse(raw) : null;
        if (token && token !== "undefined" && token !== "null") {
          headers.set("Authorization", `Bearer ${token}`);
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          headers.set("X-Time-Zone", timeZone);
        }
        headers.set("Cache-Control", "no-cache");
        headers.set("Pragma", "no-cache");
      } catch {
        // Ignore invalid stored token
      }
      return headers;
    },
  }),
  tagTypes: ["Users", "Profile", "FAQ", "Settings", "CapsuleJourney", "MentorOnboarding"],

  endpoints: () => ({}),
});
