import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardList, Loader2, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatDate } from '@/utils/formatDate'
import { useGetExamsQuery, useDeleteExamMutation } from '@/features/exams/examApi'
import { useGetBatchesQuery } from '@/features/batches/batchApi'
import { ExamFormModal } from './ExamFormModal'

const STATUS_BADGE = { draft: 'gray', published: 'info', completed: 'success' }

export default function ExamsPage() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen]   = useState(false)
  const [editExam, setEditExam]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [batchFilter, setBatchFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useGetExamsQuery({
    batch_id: batchFilter || undefined,
    status:   statusFilter || undefined,
    page, per_page: 15,
  })
  const { data: batchesData } = useGetBatchesQuery({ per_page: 100 })
  const [deleteExam, { isLoading: deleting }] = useDeleteExamMutation()

  const exams   = data?.data ?? []
  const batches = batchesData?.data ?? []

  const openAdd  = () => { setEditExam(null); setModalOpen(true) }
  const openEdit = (exam) => { setEditExam(exam); setModalOpen(true) }

  const handleDelete = async () => {
    try {
      await deleteExam(deleteTarget.id).unwrap()
      toast.success('Exam deleted.')
    } catch {
      toast.error('Could not delete exam.')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create exams, enter marks, and publish results</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Create Exam
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={batchFilter}
          onChange={(e) => { setBatchFilter(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Batches</option>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No exams found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Exam</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Batch</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Marks</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/exams/${exam.id}`)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{exam.title}</td>
                      <td className="px-4 py-3 text-gray-600">{exam.batch?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{exam.subject?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{exam.exam_type?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(exam.exam_date)}</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-700">
                        {exam.total_marks}
                        <span className="text-gray-400 text-xs"> / pass {exam.passing_marks}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[exam.status] ?? 'gray'} className="capitalize">
                          {exam.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(exam)}
                            className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(exam)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <Pagination meta={data?.meta} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <ExamFormModal open={modalOpen} onClose={() => setModalOpen(false)} exam={editExam} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Exam"
        message={`Delete "${deleteTarget?.title}"? All marks and results will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
