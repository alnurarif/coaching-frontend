import { baseApi } from '@/app/api/baseApi'

export const feeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFees: builder.query({
      query: (params) => ({ url: '/fees', params }),
      providesTags: ['Fees'],
    }),
    getFee: builder.query({
      query: (id) => `/fees/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Fees', id }],
    }),
    collectFee: builder.mutation({
      query: (body) => ({ url: '/fees', method: 'POST', body }),
      invalidatesTags: ['Fees'],
    }),
    getFeeDues: builder.query({
      query: (params) => ({ url: '/fees/dues', params }),
      providesTags: ['Fees'],
    }),
    getFeeSummary: builder.query({
      query: () => '/fees/summary',
      providesTags: ['Fees'],
    }),
  }),
})

export const {
  useGetFeesQuery,
  useGetFeeQuery,
  useCollectFeeMutation,
  useGetFeeDuesQuery,
  useGetFeeSummaryQuery,
} = feeApi
