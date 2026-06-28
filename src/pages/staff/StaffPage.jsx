import { useState } from 'react'
import { toast } from 'sonner'
import { UserCog, Search, Pencil, Trash2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useGetStaffQuery, useDeleteStaffMutation } from '@/features/staff/staffApi'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StaffFormModal } from './StaffFormModal'

const ROLE_META = {
  manager:      { label: 'Manager',      variant: 'blue' },
  accountant:   { label: 'Accountant',   variant: 'purple' },
  receptionist: { label: 'Receptionist', variant: 'teal' },
}

export default function StaffPage() {
  const currentUser = useSelector(selectCurrentUser)
  const isOwner   = currentUser?.roles?.some((r) => r === 'owner' || r?.name === 'owner')
  const canManage = currentUser?.roles?.some((r) => {
    const n = typeof r === 'string' ? r : r?.name
    return n === 'owner' || n === 'manager'
  })

  const [search, setSearch]           = useState('')
  const [roleFilter, setRoleFilter]   = useState('')
  const [page, setPage]               = useState(1)
  const [formOpen, setFormOpen]       = useState(false)
  const [editStaff, setEditStaff]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, isFetching } = useGetStaffQuery({
    search:   debouncedSearch || undefined,
    role:     roleFilter || undefined,
    page,
    per_page: 15,
  })
  const [deleteStaff, { isLoading: deleting }] = useDeleteStaffMutation()

  const staffList = data?.data ?? []
  const meta      = data?.meta

  const handleEdit = (member) => {
    setEditStaff(member)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditStaff(null)
  }

  const handleDelete = async () => {
    try {
      await deleteStaff(deleteTarget.id).unwrap()
      toast.success(`${deleteTarget.name} removed.`)
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to remove staff member.')
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Staff</h2>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} staff members</p>
        </div>
        {canManage && (
          <Button onClick={() => setFormOpen(true)}>
            <UserCog className="h-4 w-4" />
            Add Staff
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="manager">Manager</option>
          <option value="accountant">Accountant</option>
          <option value="receptionist">Receptionist</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email / Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Added</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Loading…</td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">No staff members found.</td>
                </tr>
              ) : staffList.map((member) => {
                const roleMeta = ROLE_META[member.role] ?? { label: member.role, variant: 'gray' }
                return (
                  <tr key={member.id} className={isFetching ? 'opacity-60' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <p className="text-xs">{member.email}</p>
                      <p className="text-xs text-gray-400">{member.phone ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={roleMeta.variant}>{roleMeta.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={member.is_active ? 'success' : 'gray'}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{member.created_at ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleEdit(member)}
                            className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(member)}
                            className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {meta && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      <StaffFormModal open={formOpen} onClose={handleCloseForm} staff={editStaff} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Remove Staff Member"
        message={`Remove ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </div>
  )
}
