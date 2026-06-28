import { baseApi } from '@/app/api/baseApi'

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscription: builder.query({
      query: () => '/subscription',
      providesTags: ['Subscription'],
    }),
    checkout: builder.mutation({
      query: (body) => ({
        url: '/subscription/checkout',
        method: 'POST',
        body,
      }),
    }),
    getPlans: builder.query({
      query: () => '/plans',
      providesTags: ['Plans'],
    }),
  }),
})

export const { useGetSubscriptionQuery, useCheckoutMutation, useGetPlansQuery } = subscriptionApi
