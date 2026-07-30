import { baseApi } from "../../baseApi/baseApi";

function resolveCategoryId(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.id) return value.id;
  return null;
}

function capsuleInvalidationTags(result, capsuleId) {
  const tags = [
    "IndividualCapsule",
    "IndividualCapsuleCategory",
    { type: "IndividualCapsule", id: capsuleId },
  ];

  const categoryId = resolveCategoryId(result?.data?.capsuleCategoryId);
  if (categoryId) {
    tags.push({ type: "IndividualCapsule", id: `LIST-${categoryId}` });
  }

  return tags;
}

export const individualcapsuleApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getIndividualcapsule: builder.query({
            query: () => ({
                url: "/individual-capsule-category/paginate?page=1&limit=10",
                method: "GET",
            }),
            providesTags: ["IndividualCapsuleCategory"],
        }),
        getIndividualcapsuleById: builder.query({
            query: (id) => ({
                url: `/individual-capsule-category/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "IndividualCapsuleCategory", id }],
            refetchOnMountOrArgChange: true,
        }),
        createIndividualcapsule: builder.mutation({
            query: (data) => ({
                url: "/individual-capsule-category",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["IndividualCapsuleCategory"],
        }),
        deleteIndividualcapsule: builder.mutation({
            query: (id) => ({
                url: `/individual-capsule-category/${id}/permanent`,
                method: "DELETE",
            }),
            invalidatesTags: ["IndividualCapsuleCategory"],
        }),
        updateIndividualcapsule: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/individual-capsule-category/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) => [
                "IndividualCapsuleCategory",
                { type: "IndividualCapsuleCategory", id },
            ],
        }),
        // =================================================================================
        getAllcapsule: builder.query({
            query: (id) => ({
                url: `/individual-capsule/paginate?page=1&limit=10&capsuleCategoryId=${id}`,
                method: "GET",
            }),
            providesTags: (result, error, categoryId) => [
                { type: "IndividualCapsule", id: `LIST-${categoryId}` },
            ],
            refetchOnMountOrArgChange: true,
        }),
        getCapsuleById: builder.query({
            query: (id) => ({
                url: `/individual-capsule/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "IndividualCapsule", id }],
            refetchOnMountOrArgChange: true,
        }),
        createCapsule: builder.mutation({
            query: (data) => ({
                url: "/individual-capsule",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["IndividualCapsule", "IndividualCapsuleCategory", "AvailableCapsules"],
        }),
        updateCapsule: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/individual-capsule/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) =>
                [...capsuleInvalidationTags(result, id), "AvailableCapsules"],
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                try {
                    const { data: response } = await queryFulfilled;
                    const capsule = response?.data;
                    if (!capsule?.id) return;

                    dispatch(
                        individualcapsuleApi.util.upsertQueryData(
                            "getCapsuleById",
                            id,
                            response,
                        ),
                    );
                } catch {
                    // ignore — error handled by hook
                }
            },
        }),
        deleteCapsule: builder.mutation({
            query: (id) => ({
                url: `/individual-capsule/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "IndividualCapsule", id },
                "IndividualCapsule",
                "IndividualCapsuleCategory",
                "JourneyCapsules",
                "AvailableCapsules",
            ],
        }),


        // ====================================================== 
        createCapsuleModuleWithLesson: builder.mutation({
            query: (data) => ({
                url: "/journey-module",
                method: "POST",
                body: data,
            }),
        }),
        getAllCapsuleModulesWithLessons: builder.query({
            query: (id) => ({
                url: `/journey-module?capsuleId=${id}&page=1&limit=10`,
                method: "GET",
            }),
        }),
        updateCapsuleModuleLesson: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/journey-module/${id}`,
                method: "PUT",
                body: formData,
            }),
        }),
        getCapsuleModuleLessonById: builder.query({
            query: (id) => ({
                url: `/journey-module/${id}`,
                method: "GET",
            }),
        }),
        deleteCapsuleModuleLesson: builder.mutation({
            query: (id) => ({
                url: `/journey-module/${id}/permanent`,
                method: "DELETE",
            }),
        }),



    }),
});

export const {
    useGetIndividualcapsuleQuery,
    useGetIndividualcapsuleByIdQuery,
    useCreateIndividualcapsuleMutation,
    useDeleteIndividualcapsuleMutation,
    useUpdateIndividualcapsuleMutation,
    useGetAllcapsuleQuery,
    useGetCapsuleByIdQuery,
    useCreateCapsuleMutation,
    useUpdateCapsuleMutation,
    useDeleteCapsuleMutation,
    useCreateCapsuleModuleWithLessonMutation,
    useGetAllCapsuleModulesWithLessonsQuery,
    useUpdateCapsuleModuleLessonMutation,
    useGetCapsuleModuleLessonByIdQuery,
    useDeleteCapsuleModuleLessonMutation
} = individualcapsuleApi;
