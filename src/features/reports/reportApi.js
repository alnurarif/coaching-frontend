import { baseApi } from '@/app/api/baseApi'

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCollectionReport: builder.query({
      query: (params) => ({ url: '/reports/collection', params }),
      providesTags: ['Reports'],
    }),
    getDuesReport: builder.query({
      query: (params) => ({ url: '/reports/dues', params }),
      providesTags: ['Reports'],
    }),
    getAttendanceReport: builder.query({
      query: (params) => ({ url: '/reports/attendance', params }),
      providesTags: ['Reports'],
    }),
    getStudentListReport: builder.query({
      query: (params) => ({ url: '/reports/students', params }),
      providesTags: ['Reports'],
    }),
    getExamProgressReport: builder.query({
      query: (params) => ({ url: '/reports/exam-progress', params }),
      providesTags: ['Reports'],
    }),
    getBatchAnalyticsReport: builder.query({
      query: (params) => ({ url: '/reports/batch-analytics', params }),
      providesTags: ['Reports'],
    }),
    getProfitLossReport: builder.query({
      query: (params) => ({ url: '/reports/profit-loss', params }),
      providesTags: ['Reports'],
    }),
  }),
})

export const {
  useGetCollectionReportQuery,
  useGetDuesReportQuery,
  useGetAttendanceReportQuery,
  useGetStudentListReportQuery,
  useGetExamProgressReportQuery,
  useGetBatchAnalyticsReportQuery,
  useGetProfitLossReportQuery,
} = reportApi
