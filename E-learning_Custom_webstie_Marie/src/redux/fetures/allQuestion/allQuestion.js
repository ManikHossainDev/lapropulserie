import { apiSlice } from "../../api/apiSlice";

const allQuestion = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getAllQuestionCategory: builder.query({
            query: () => ({
                url: `/question-system/student/questionary/category/free`,
                method: "GET",
            }),
        }),
        getAllQuestionCategoryPaid: builder.query({
            query: ({ id }) => ({
                url: `/question-system/student/questionary/${id}`,
                method: "GET",
            }),
        }),
        answerTheQuestions: builder.mutation({
            query: ({ data, questionaryId }) => ({
                url: `/question-system/student/questionary/${questionaryId}/answers`,
                method: "POST",
                body: data,
            }),
        }),
        getresumeQuestionAnswer: builder.query({
            query: ({ questionaryId }) => ({
                url: `/question-system/student/questionary/${questionaryId}`,
                method: "GET",
            }),
        }),
        getQuestionnaireSummary: builder.query({
            query: () => ({
                url: `/student-dashboard/questionnaire-summary`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useGetAllQuestionCategoryQuery,
    useGetAllQuestionCategoryPaidQuery,
    useAnswerTheQuestionsMutation,
    useGetresumeQuestionAnswerQuery,
    useGetQuestionnaireSummaryQuery,
} = allQuestion;