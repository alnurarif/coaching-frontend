import { baseApi } from '@/app/api/baseApi'

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => '/roles',
      providesTags: ['Roles'],
    }),
    getPermissions: builder.query({
      query: () => '/roles/permissions',
      providesTags: ['Roles'],
    }),
    createRole: builder.mutation({
      query: (body) => ({ url: '/roles', method: 'POST', body }),
      invalidatesTags: ['Roles'],
    }),
    syncRolePermissions: builder.mutation({
      query: ({ roleId, permissions }) => ({
        url: `/roles/${roleId}/permissions`,
        method: 'PUT',
        body: { permissions },
      }),
      invalidatesTags: ['Roles'],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Roles'],
    }),
  }),
})

export const {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useSyncRolePermissionsMutation,
  useDeleteRoleMutation,
} = rolesApi
