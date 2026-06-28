import { baseApi } from '@/app/api/baseApi'

export const salaryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMonthlyStatus: builder.query({
      query: (params) => ({ url: '/salaries/monthly-status', params }),
      providesTags: ['Salary'],
    }),
  }),
})

export const { useGetMonthlyStatusQuery } = salaryApi
