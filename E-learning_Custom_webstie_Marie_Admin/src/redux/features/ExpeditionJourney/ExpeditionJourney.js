import { baseApi } from "../../baseApi/baseApi";

export const expeditionJourneyApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createExpeditionJourney: builder.mutation({
            query: (data) => ({
                url: "/journey",
                method: "POST",
                body: data,
            }),
        }),
        getAllExpeditionJourneys: builder.query({
            query: () => ({
                url: "/journey",
                method: "GET",
            }),
        }),
        getExpeditionJourneyById: builder.query({
            query: (id) => ({
                url: `/journey/${id}`,
                method: "GET",
            }),
        }),
        updateExpeditionJourney: builder.mutation({
            query: ({ id, thumbnailFile, ...data }) => {
                if (thumbnailFile) {
                    const formData = new FormData();
                    formData.append("data", JSON.stringify(data));
                    formData.append("thumbnail", thumbnailFile);
                    return { url: `/journey/${id}`, method: "PUT", body: formData };
                }
                return { url: `/journey/${id}`, method: "PUT", body: data };
            },
        }),
        deleteExpeditionJourney: builder.mutation({
            query: (id) => ({
                url: `/journey/${id}`,
                method: "DELETE",
            }),
        }),
        getAllCaplesByJourneyId: builder.query({
            query: (journeyId) => ({
                url: `/journey-capsule?journeyId=${journeyId}&sortBy=capsuleNumber:asc&limit=100`,
                method: "GET",
            }),
            providesTags: (result, error, journeyId) => [
                { type: "JourneyCapsules", id: journeyId },
            ],
        }),
        getAvailableIndividualCapsules: builder.query({
            query: (journeyId) => ({
                url: `/journey-capsule/available-individual-capsules?journeyId=${journeyId}`,
                method: "GET",
            }),
            providesTags: ["IndividualCapsule", "AvailableCapsules"],
            refetchOnMountOrArgChange: true,
        }),
        updateJourneyCapsuleOrder: builder.mutation({
            query: (data) => ({
                url: "/journey-capsule/order",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { journeyId }) => [
                { type: "JourneyCapsules", id: journeyId },
                "JourneyCapsules",
                "AvailableCapsules",
            ],
        }),
        linkCapsulesToJourney: builder.mutation({
            query: (data) => ({
                url: "/journey-capsule",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { journeyId }) => [
                { type: "JourneyCapsules", id: journeyId },
                "JourneyCapsules",
                "AvailableCapsules",
                "IndividualCapsule",
            ],
        }),
        removeJourneyCapsule: builder.mutation({
            query: (id) => ({
                url: `/journey-capsule/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: () => [
                { type: "JourneyCapsules" },
                "JourneyCapsules",
                "AvailableCapsules",
                "IndividualCapsule",
            ],
        }),
    }),
});


export const {
    useCreateExpeditionJourneyMutation,
    useGetAllExpeditionJourneysQuery,
    useGetExpeditionJourneyByIdQuery,
    useUpdateExpeditionJourneyMutation,
    useDeleteExpeditionJourneyMutation,
    useGetAllCaplesByJourneyIdQuery,
    useGetAvailableIndividualCapsulesQuery,
    useLinkCapsulesToJourneyMutation,
    useUpdateJourneyCapsuleOrderMutation,
    useRemoveJourneyCapsuleMutation,
} = expeditionJourneyApi;
