import { baseApi } from '@/app/api/baseApi'

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateCenter: builder.mutation({
      query: (body) => ({ url: '/settings/center', method: 'PUT', body }),
      invalidatesTags: ['Auth'],
    }),
    updateAccount: builder.mutation({
      query: (body) => ({ url: '/settings/account', method: 'PUT', body }),
      invalidatesTags: ['Auth'],
    }),
  }),
})

export const { useUpdateCenterMutation, useUpdateAccountMutation } = settingsApi
