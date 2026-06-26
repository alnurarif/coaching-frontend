import { baseApi } from '@/app/api/baseApi'

export const expenseCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseCategories: builder.query({
      query: () => '/expense-categories',
      providesTags: ['ExpenseCategories'],
    }),
    createExpenseCategory: builder.mutation({
      query: (body) => ({ url: '/expense-categories', method: 'POST', body }),
      invalidatesTags: ['ExpenseCategories'],
    }),
    updateExpenseCategory: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/expense-categories/${id}`, method: 'PUT', body }),
      invalidatesTags: ['ExpenseCategories'],
    }),
    deleteExpenseCategory: builder.mutation({
      query: (id) => ({ url: `/expense-categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ExpenseCategories'],
    }),
  }),
})

export const {
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} = expenseCategoryApi
