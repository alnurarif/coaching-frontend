import { baseApi } from '@/app/api/baseApi'

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => '/dashboard',
      providesTags: ['Students', 'Batches', 'Fees', 'Teachers'],
    }),
  }),
})

export const { useGetDashboardQuery } = dashboardApi
