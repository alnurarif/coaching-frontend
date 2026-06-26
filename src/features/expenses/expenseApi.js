import { baseApi } from '@/app/api/baseApi'

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: (params) => ({ url: '/expenses', params }),
      providesTags: ['Expenses'],
    }),
    getExpense: builder.query({
      query: (id) => `/expenses/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Expenses', id }],
    }),
    createExpense: builder.mutation({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      invalidatesTags: ['Expenses', 'Reports'],
    }),
    updateExpense: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/expenses/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Expenses', 'Reports'],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Expenses', 'Reports'],
    }),
  }),
})

export const {
  useGetExpensesQuery,
  useGetExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi
