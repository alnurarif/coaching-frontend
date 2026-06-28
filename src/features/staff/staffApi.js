import { baseApi } from '@/app/api/baseApi'

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query({
      query: (params) => ({ url: '/staff', params }),
      providesTags: ['Staff'],
    }),
    createStaff: builder.mutation({
      query: (body) => ({ url: '/staff', method: 'POST', body }),
      invalidatesTags: ['Staff', 'Salary'],
    }),
    updateStaff: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/staff/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Staff', 'Salary'],
    }),
    deleteStaff: builder.mutation({
      query: (id) => ({ url: `/staff/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Staff'],
    }),
  }),
})

export const {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = staffApi
