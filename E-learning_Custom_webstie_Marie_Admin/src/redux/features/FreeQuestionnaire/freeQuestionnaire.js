import { baseApi } from "../../baseApi/baseApi";

export const freeQuestionnaireApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllFreeQuestionnaire: builder.query({
            query: () => ({
                url: "/question-system/admin/questionary",
                method: "GET",
            }),
        }),
        getFreeQuestionnaireById: builder.query({
            query: ({ questionaryId }) => ({
                url: `/question-system/admin/questionary/${questionaryId}`,
                method: "GET",
            }),
        }),
        createFreeQuestionnaire: builder.mutation({
            query: (data) => ({
                url: "/question-system/admin/questionary",
                method: "POST",
                body: data,
            }),
        }),
        updateFreeQuestionnaire: builder.mutation({
            query: ({ questionaryId, body }) => ({
                url: `/question-system/admin/questionary/${questionaryId}`,
                method: "PATCH",
                body: body,
            }),
        }),
        deleteFreeQuestionnaire: builder.mutation({
            query: (questionaryId) => ({
                url: `/question-system/admin/questionary/${questionaryId}`,
                method: "DELETE",
            }),
        }),
    })
});

export const { useGetAllFreeQuestionnaireQuery, useCreateFreeQuestionnaireMutation, useGetFreeQuestionnaireByIdQuery, useUpdateFreeQuestionnaireMutation, useDeleteFreeQuestionnaireMutation } = freeQuestionnaireApi;