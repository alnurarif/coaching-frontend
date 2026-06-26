import { baseApi } from '@/app/api/baseApi'

export const examTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExamTypes: builder.query({
      query: () => '/exam-types',
      providesTags: ['ExamTypes'],
    }),
    createExamType: builder.mutation({
      query: (body) => ({ url: '/exam-types', method: 'POST', body }),
      invalidatesTags: ['ExamTypes'],
    }),
    updateExamType: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/exam-types/${id}`, method: 'PUT', body }),
      invalidatesTags: ['ExamTypes'],
    }),
    deleteExamType: builder.mutation({
      query: (id) => ({ url: `/exam-types/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ExamTypes'],
    }),
  }),
})

export const {
  useGetExamTypesQuery,
  useCreateExamTypeMutation,
  useUpdateExamTypeMutation,
  useDeleteExamTypeMutation,
} = examTypeApi
