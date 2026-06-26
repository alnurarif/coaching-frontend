import { baseApi } from '@/app/api/baseApi'

export const teacherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeachers: builder.query({
      query: (params) => ({ url: '/teachers', params }),
      providesTags: ['Teachers'],
    }),
    getTeacher: builder.query({
      query: (id) => `/teachers/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Teachers', id }],
    }),
    createTeacher: builder.mutation({
      query: (body) => ({ url: '/teachers', method: 'POST', body }),
      invalidatesTags: ['Teachers'],
    }),
    updateTeacher: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/teachers/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => ['Teachers', { type: 'Teachers', id }],
    }),
    deleteTeacher: builder.mutation({
      query: (id) => ({ url: `/teachers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Teachers'],
    }),
    // Salary sub-resource
    getSalaries: builder.query({
      query: (params) => ({ url: '/salaries', params }),
      providesTags: ['Salary'],
    }),
    paySalary: builder.mutation({
      query: (body) => ({ url: '/salaries', method: 'POST', body }),
      invalidatesTags: ['Salary', 'Teachers'],
    }),
    getSalaryDues: builder.query({
      query: (params) => ({ url: '/salaries/dues', params }),
      providesTags: ['Salary'],
    }),
  }),
})

export const {
  useGetTeachersQuery,
  useGetTeacherQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetSalariesQuery,
  usePaySalaryMutation,
  useGetSalaryDuesQuery,
} = teacherApi
