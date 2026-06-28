import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, Eye, Users } from 'lucide-react'
import { useGetBatchesQuery, useDeleteBatchMutation } from '@/features/batches/batchApi'
import { usePermission } from '@/hooks/usePermission'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { BatchFormModal } from './BatchFormModal'
import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'

export default function BatchesPage() {
  const navigate = useNavigate()
  const { hasRole } = usePermission()
  const canManage = hasRole(['owner', 'manager'])

  const [search, setSearch]           = useState('')
  const [status, setStatus]           = useState('')
  const [page, setPage]               = useState(1)
  const [formOpen, setFormOpen]       = useState(false)
  const [editBatch, setEditBatch]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, isFetching } = useGetBatchesQuery({
    search: debouncedSearch || undefined,
    status: status || undefined,
    page,
    per_page: 15,
  })

  const [deleteBatch, { isLoading: deleting }] = useDeleteBatchMutation()

  const batches = data?.data ?? []
  const meta    = data?.meta

  const handleEdit = (batch) => {
    setEditBatch(batch)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditBatch(null)
  }

  const handleDelete = async () => {
    try {
      await deleteBatch(deleteTarget.id).unwrap()
      toast.success(`"${deleteTarget.name}" deleted successfully.`)
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete batch.')
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Batches</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta?.total ?? 0} batches total
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Batch
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or subject…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
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
                <th className="text-left px-4 py-3 font-medium text-gray-500">Batch Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Teacher</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Students</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Fee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Start Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">Loading…</td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">No batches found.</td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className={isFetching ? 'opacity-60' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-900">{batch.name}</td>
                    <td className="px-4 py-3 text-gray-600">{batch.subject ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{batch.teacher?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-gray-700">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {batch.student_count ?? 0}
                        <span className="text-gray-400">/ {batch.capacity}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(batch.fee_amount)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(batch.start_date)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={batch.status === 'active' ? 'success' : 'gray'}>
                        {batch.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/batches/${batch.id}`)}
                          className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View batch"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleEdit(batch)}
                            className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(batch)}
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

      <BatchFormModal open={formOpen} onClose={handleCloseForm} batch={editBatch} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Batch"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All student assignments will be removed.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
