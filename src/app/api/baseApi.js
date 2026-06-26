import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) headers.set('Authorization', `Bearer ${token}`)
      headers.set('Accept', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Auth', 'Students', 'Batches', 'Attendance', 'Fees', 'Teachers', 'Salary', 'Reports', 'Staff', 'Branches', 'Subjects', 'ExamTypes', 'GradeScales', 'Exams', 'ExamResults', 'ExpenseCategories', 'Expenses', 'Roles'],
  endpoints: () => ({}),
})
