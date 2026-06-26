import { useState } from 'react'
import { Plus, Pencil, Trash2, BookOpen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from '@/features/subjects/subjectApi'

function SubjectFormModal({ open, onClose, subject }) {
  const isEdit = !!subject
  const [name, setName] = useState(subject?.name ?? '')
  const [code, setCode] = useState(subject?.code ?? '')

  const [create, { isLoading: creating }] = useCreateSubjectMutation()
  const [update, { isLoading: updating }]  = useUpdateSubjectMutation()
  const loading = creating || updating

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEdit) {
        await update({ id: subject.id, name, code: code || null }).unwrap()
        toast.success('Subject updated.')
      } else {
        await create({ name, code: code || null }).unwrap()
        toast.success('Subject created.')
      }
      onClose()
    } catch (err) {
      toast.error(err?.data?.message ?? 'Something went wrong.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Subject' : 'Add Subject'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Subject Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mathematics"
          required
          autoFocus
        />
        <Input
          label="Short Code (optional)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. MATH"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function SubjectsPage() {
  const [modalOpen, setModalOpen]   = useState(false)
  const [editSubject, setEditSubject] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useGetSubjectsQuery()
  const [deleteSubject, { isLoading: deleting }] = useDeleteSubjectMutation()
  const subjects = data?.data ?? []

  const openEdit = (subject) => { setEditSubject(subject); setModalOpen(true) }
  const openAdd  = () => { setEditSubject(null); setModalOpen(true) }

  const handleDelete = async () => {
    try {
      await deleteSubject(deleteTarget.id).unwrap()
      toast.success('Subject deleted.')
    } catch (err) {
      toast.error(err?.data?.message ?? 'Could not delete subject.')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage subjects used in exams and batches</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No subjects yet. Add your first subject.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Exams</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.code ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.is_active ? 'success' : 'gray'}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.exams_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(s)}
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
        )}
      </div>

      <SubjectFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        subject={editSubject}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Subject"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
