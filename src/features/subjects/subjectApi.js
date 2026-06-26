import { baseApi } from '@/app/api/baseApi'

export const subjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query({
      query: (params) => ({ url: '/subjects', params }),
      providesTags: ['Subjects'],
    }),
    createSubject: builder.mutation({
      query: (body) => ({ url: '/subjects', method: 'POST', body }),
      invalidatesTags: ['Subjects'],
    }),
    updateSubject: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/subjects/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Subjects'],
    }),
    deleteSubject: builder.mutation({
      query: (id) => ({ url: `/subjects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Subjects'],
    }),
  }),
})

export const {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectApi
