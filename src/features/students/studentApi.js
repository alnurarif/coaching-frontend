import { baseApi } from '@/app/api/baseApi'

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query({
      query: (params) => ({ url: '/students', params }),
      providesTags: ['Students'],
    }),
    getStudent: builder.query({
      query: (id) => `/students/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Students', id }],
    }),
    createStudent: builder.mutation({
      query: (body) => ({ url: '/students', method: 'POST', body }),
      invalidatesTags: ['Students'],
    }),
    updateStudent: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/students/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => ['Students', { type: 'Students', id }],
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({ url: `/students/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Students'],
    }),
    uploadStudentPhoto: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/students/${id}/photo`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Students', id }],
    }),
    deleteStudentPhoto: builder.mutation({
      query: (id) => ({ url: `/students/${id}/photo`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Students', id }],
    }),
  }),
})

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useUploadStudentPhotoMutation,
  useDeleteStudentPhotoMutation,
} = studentApi
