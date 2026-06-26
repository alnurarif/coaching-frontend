import { baseApi } from '@/app/api/baseApi'

export const branchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query({
      query: () => '/branches',
      providesTags: ['Branches'],
    }),
    createBranch: builder.mutation({
      query: (body) => ({ url: '/branches', method: 'POST', body }),
      invalidatesTags: ['Branches'],
    }),
    updateBranch: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/branches/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Branches'],
    }),
    deleteBranch: builder.mutation({
      query: (id) => ({ url: `/branches/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Branches'],
    }),
  }),
})

export const {
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchApi
