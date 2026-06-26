import { baseApi } from '@/app/api/baseApi'

export const examApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExams: builder.query({
      query: (params) => ({ url: '/exams', params }),
      providesTags: ['Exams'],
    }),
    getExam: builder.query({
      query: (id) => `/exams/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Exams', id }],
    }),
    createExam: builder.mutation({
      query: (body) => ({ url: '/exams', method: 'POST', body }),
      invalidatesTags: ['Exams'],
    }),
    updateExam: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/exams/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => ['Exams', { type: 'Exams', id }],
    }),
    deleteExam: builder.mutation({
      query: (id) => ({ url: `/exams/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => ['Exams', { type: 'ExamResults', id }],
    }),
    getEntrySheet: builder.query({
      query: (id) => `/exams/${id}/entry`,
      providesTags: (_r, _e, id) => [{ type: 'ExamResults', id }],
    }),
    saveResults: builder.mutation({
      query: ({ examId, records }) => ({
        url: `/exams/${examId}/results`,
        method: 'POST',
        body: { records },
      }),
      invalidatesTags: (_r, _e, { examId }) => [
        { type: 'ExamResults', id: examId },
        { type: 'Exams', id: examId },
      ],
    }),
    getResultSheet: builder.query({
      query: (id) => `/exams/${id}/result-sheet`,
      providesTags: (_r, _e, id) => [{ type: 'ExamResults', id }],
    }),
    getMeritList: builder.query({
      query: (id) => `/exams/${id}/merit-list`,
      providesTags: (_r, _e, id) => [{ type: 'ExamResults', id }],
    }),
  }),
})

export const {
  useGetExamsQuery,
  useGetExamQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useGetEntrySheetQuery,
  useSaveResultsMutation,
  useGetResultSheetQuery,
  useGetMeritListQuery,
} = examApi
