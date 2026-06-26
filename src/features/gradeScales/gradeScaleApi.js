import { baseApi } from '@/app/api/baseApi'

export const gradeScaleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGradeScales: builder.query({
      query: () => '/grade-scales',
      providesTags: ['GradeScales'],
    }),
    syncGradeScales: builder.mutation({
      query: (scales) => ({ url: '/grade-scales', method: 'PUT', body: { scales } }),
      invalidatesTags: ['GradeScales'],
    }),
  }),
})

export const {
  useGetGradeScalesQuery,
  useSyncGradeScalesMutation,
} = gradeScaleApi
