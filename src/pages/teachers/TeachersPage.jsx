import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { GraduationCap, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { useGetTeachersQuery, useDeleteTeacherMutation } from '@/features/teachers/teacherApi'
import { usePermission } from '@/hooks/usePermission'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TeacherFormModal } from './TeacherFormModal'
import { formatCurrency } from '@/utils/formatCurrency'

export default function TeachersPage() {
  const navigate = useNavigate()
  const { hasRole } = usePermission()
  const canManage = hasRole(['owner', 'manager'])

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editTeacher, setEditTeacher] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, isFetching } = useGetTeachersQuery({
    search: debouncedSearch || undefined,
    page,
    per_page: 15,
  })
  const [deleteTeacher, { isLoading: deleting }] = useDeleteTeacherMutation()

  const teachers = data?.data ?? []
  const meta = data?.meta

  const handleEdit = (teacher) => {
    setEditTeacher(teacher)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditTeacher(null)
  }

  const handleDelete = async () => {
    try {
      await deleteTeacher(deleteTarget.id).unwrap()
      toast.success(`${deleteTarget.name} removed.`)
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to remove teacher.')
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Teachers</h2>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} teachers registered</p>
        </div>
        {canManage && (
          <Button onClick={() => setFormOpen(true)}>
            <GraduationCap className="h-4 w-4" />
            Add Teacher
          </Button>
        )}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, email, phone…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email / Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Subject</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Base Salary</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Batches</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">Loading…</td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">No teachers found.</td>
                </tr>
              ) : teachers.map((teacher) => (
                <tr key={teacher.id} className={isFetching ? 'opacity-60' : ''}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{teacher.name}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p className="text-xs">{teacher.email}</p>
                    <p className="text-xs text-gray-400">{teacher.phone ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{teacher.profile?.subject ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">
                    {teacher.profile?.base_salary
                      ? formatCurrency(teacher.profile.base_salary)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      {teacher.batches_count ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={teacher.is_active ? 'success' : 'gray'}>
                      {teacher.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/teachers/${teacher.id}`)}
                        className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleEdit(teacher)}
                          className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(teacher)}
                          className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      <TeacherFormModal open={formOpen} onClose={handleCloseForm} teacher={editTeacher} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Remove Teacher"
        message={`Remove ${deleteTarget?.name}? Their attendance records will be preserved but account will be deactivated.`}
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </div>
  )
}
