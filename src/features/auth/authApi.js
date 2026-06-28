import { baseApi } from '@/app/api/baseApi'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
    getMe: builder.query({
      query: () => '/me',
      providesTags: ['Auth'],
    }),
    register: builder.mutation({
      query: (body) => ({
        url: '/register',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useGetMeQuery, useRegisterMutation } = authApi
