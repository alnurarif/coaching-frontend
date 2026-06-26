import { useState } from 'react'
import { toast } from 'sonner'
import { GitBranch, Pencil, Trash2, Users, GraduationCap } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useGetBranchesQuery, useDeleteBranchMutation } from '@/features/branches/branchApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { BranchFormModal } from './BranchFormModal'

export default function BranchPage() {
  const currentUser = useSelector(selectCurrentUser)
  const isOwner   = currentUser?.roles?.some((r) => r === 'owner' || r?.name === 'owner')
  const canManage = currentUser?.roles?.some((r) => {
    const n = typeof r === 'string' ? r : r?.name
    return n === 'owner' || n === 'manager'
  })

  const [formOpen, setFormOpen]         = useState(false)
  const [editBranch, setEditBranch]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useGetBranchesQuery()
  const [deleteBranch, { isLoading: deleting }] = useDeleteBranchMutation()

  const branches = data?.data ?? []

  const handleEdit = (branch) => {
    setEditBranch(branch)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditBranch(null)
  }

  const handleDelete = async () => {
    try {
      await deleteBranch(deleteTarget.id).unwrap()
      toast.success(`${deleteTarget.name} removed.`)
      setDeleteTarget(null)
    } catch (err) {
      const msg = err?.data?.message ?? 'Failed to remove branch.'
      toast.error(msg)
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Branches</h2>
          <p className="text-sm text-gray-500 mt-0.5">{branches.length} branch{branches.length !== 1 ? 'es' : ''}</p>
        </div>
        {canManage && (
          <Button onClick={() => setFormOpen(true)}>
            <GitBranch className="h-4 w-4" />
            Add Branch
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <GitBranch className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No branches yet</p>
          <p className="text-xs text-gray-400 mt-1">Add your first branch to assign students and staff.</p>
          {canManage && <Button className="mt-4" onClick={() => setFormOpen(true)}>Add Branch</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                    {branch.phone && (
                      <p className="text-xs text-gray-500 mt-0.5">{branch.phone}</p>
                    )}
                  </div>
                </div>
                <Badge variant={branch.is_active ? 'success' : 'gray'}>
                  {branch.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {branch.address && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{branch.address}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {branch.students_count ?? 0} students
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {branch.users_count ?? 0} staff
                </span>
              </div>

              <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleEdit(branch)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(branch)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <BranchFormModal open={formOpen} onClose={handleCloseForm} branch={editBranch} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Remove Branch"
        message={`Remove "${deleteTarget?.name}"? Students assigned to this branch will have their branch cleared.`}
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </div>
  )
}
