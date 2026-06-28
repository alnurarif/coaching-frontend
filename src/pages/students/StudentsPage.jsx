import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { UserPlus, Search, Pencil, Trash2, Eye, Users } from 'lucide-react'
import { useGetStudentsQuery, useDeleteStudentMutation } from '@/features/students/studentApi'
import { usePermission } from '@/hooks/usePermission'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { StudentFormModal } from './StudentFormModal'
import { formatDate } from '@/utils/formatDate'

export default function StudentsPage() {
  const navigate = useNavigate()
  const { hasRole } = usePermission()
  const canCreate = hasRole(['owner', 'manager', 'receptionist'])
  const canDelete = hasRole(['owner', 'manager'])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, isFetching } = useGetStudentsQuery({
    search: debouncedSearch || undefined,
    status: status || undefined,
    page,
    per_page: 15,
  })

  const [deleteStudent, { isLoading: deleting }] = useDeleteStudentMutation()

  const students = data?.data ?? []
  const meta = data?.meta

  const handleEdit = (student) => {
    setEditStudent(student)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditStudent(null)
  }

  const handleDelete = async () => {
    try {
      await deleteStudent(deleteTarget.id).unwrap()
      toast.success(`${deleteTarget.name} removed successfully.`)
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete student.')
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Students</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta?.total ?? 0} students registered
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setFormOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Input
          leftIcon={Search}
          type="text"
          placeholder="Search by name, ID, phone…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="w-36"
          placeholder="All status"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Student ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Guardian</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Admission</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Users}
                      title="No students found"
                      description={search || status ? 'Try adjusting your filters.' : 'Add your first student to get started.'}
                      action={!search && !status && canCreate ? { label: 'Add Student', onClick: () => setFormOpen(true) } : undefined}
                    />
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className={isFetching ? 'opacity-60' : ''}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {student.student_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-blue-50 border border-gray-200 shrink-0 flex items-center justify-center">
                          {student.photo
                            ? <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
                            : <span className="text-xs font-semibold text-blue-400">{student.name.charAt(0).toUpperCase()}</span>
                          }
                        </div>
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.guardian ? (
                        <span>
                          {student.guardian.name}
                          <span className="text-xs text-gray-400 ml-1 capitalize">
                            ({student.guardian.relation})
                          </span>
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(student.admission_date)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={student.status === 'active' ? 'success' : 'gray'}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(student)}
                          className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(student)}
                            className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      <StudentFormModal
        open={formOpen}
        onClose={handleCloseForm}
        student={editStudent}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Student"
        message={`Are you sure you want to remove ${deleteTarget?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
