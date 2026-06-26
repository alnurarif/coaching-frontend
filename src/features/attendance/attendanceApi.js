import { baseApi } from '@/app/api/baseApi'

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentAttendance: builder.query({
      query: (params) => ({ url: '/attendance/students', params }),
      providesTags: ['Attendance'],
    }),
    markStudentAttendance: builder.mutation({
      query: (body) => ({ url: '/attendance/students', method: 'POST', body }),
      invalidatesTags: ['Attendance'],
    }),
    getTeacherAttendance: builder.query({
      query: (params) => ({ url: '/attendance/teachers', params }),
      providesTags: ['Attendance'],
    }),
    markTeacherAttendance: builder.mutation({
      query: (body) => ({ url: '/attendance/teachers', method: 'POST', body }),
      invalidatesTags: ['Attendance'],
    }),
    getAbsentList: builder.query({
      query: (params) => ({ url: '/attendance/absent', params }),
      providesTags: ['Attendance'],
    }),
    getStudentAttendanceReport: builder.query({
      query: (params) => ({ url: '/attendance/students/report', params }),
      providesTags: ['Attendance'],
    }),
  }),
})

export const {
  useGetStudentAttendanceQuery,
  useMarkStudentAttendanceMutation,
  useGetTeacherAttendanceQuery,
  useMarkTeacherAttendanceMutation,
  useGetAbsentListQuery,
  useGetStudentAttendanceReportQuery,
} = attendanceApi
