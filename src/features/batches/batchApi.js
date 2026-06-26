import { baseApi } from '@/app/api/baseApi'

export const batchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBatches: builder.query({
      query: (params) => ({ url: '/batches', params }),
      providesTags: ['Batches'],
    }),
    getBatch: builder.query({
      query: (id) => `/batches/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Batches', id }],
    }),
    createBatch: builder.mutation({
      query: (body) => ({ url: '/batches', method: 'POST', body }),
      invalidatesTags: ['Batches'],
    }),
    updateBatch: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/batches/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => ['Batches', { type: 'Batches', id }],
    }),
    deleteBatch: builder.mutation({
      query: (id) => ({ url: `/batches/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Batches'],
    }),
    assignStudents: builder.mutation({
      query: ({ batchId, ...body }) => ({
        url: `/batches/${batchId}/students`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { batchId }) => [{ type: 'Batches', id: batchId }],
    }),
    removeStudentFromBatch: builder.mutation({
      query: ({ batchId, studentId }) => ({
        url: `/batches/${batchId}/students/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { batchId }) => [{ type: 'Batches', id: batchId }],
    }),
  }),
})

export const {
  useGetBatchesQuery,
  useGetBatchQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
  useAssignStudentsMutation,
  useRemoveStudentFromBatchMutation,
} = batchApi
