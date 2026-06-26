import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useGetBatchesQuery } from '@/features/batches/batchApi'
import { useGetSubjectsQuery } from '@/features/subjects/subjectApi'
import { useGetExamTypesQuery } from '@/features/examTypes/examTypeApi'
import { useCreateExamMutation, useUpdateExamMutation } from '@/features/exams/examApi'

const STATUS_OPTIONS = [
  { value: 'draft',     label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'completed', label: 'Completed' },
]

export function ExamFormModal({ open, onClose, exam }) {
  const isEdit = !!exam

  const [form, setForm] = useState({
    title: '', batch_id: '', subject_id: '', exam_type_id: '',
    exam_date: '', total_marks: '', passing_marks: '',
    status: 'draft', description: '',
  })

  useEffect(() => {
    if (exam) {
      setForm({
        title:          exam.title ?? '',
        batch_id:       exam.batch?.id ?? '',
        subject_id:     exam.subject?.id ?? '',
        exam_type_id:   exam.exam_type?.id ?? '',
        exam_date:      exam.exam_date ?? '',
        total_marks:    exam.total_marks ?? '',
        passing_marks:  exam.passing_marks ?? '',
        status:         exam.status ?? 'draft',
        description:    exam.description ?? '',
      })
    } else {
      setForm({
        title: '', batch_id: '', subject_id: '', exam_type_id: '',
        exam_date: '', total_marks: '', passing_marks: '',
        status: 'draft', description: '',
      })
    }
  }, [exam, open])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const { data: batchesData }    = useGetBatchesQuery({ per_page: 100, status: 'active' })
  const { data: subjectsData }   = useGetSubjectsQuery({ is_active: true })
  const { data: examTypesData }  = useGetExamTypesQuery()

  const batches   = batchesData?.data   ?? []
  const subjects  = subjectsData?.data  ?? []
  const examTypes = examTypesData?.data ?? []

  const [create, { isLoading: creating }] = useCreateExamMutation()
  const [update, { isLoading: updating }] = useUpdateExamMutation()
  const loading = creating || updating

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      subject_id:   form.subject_id   || null,
      exam_type_id: form.exam_type_id || null,
      description:  form.description  || null,
      total_marks:  parseFloat(form.total_marks),
      passing_marks: parseFloat(form.passing_marks),
    }
    try {
      if (isEdit) {
        await update({ id: exam.id, ...payload }).unwrap()
        toast.success('Exam updated.')
      } else {
        await create(payload).unwrap()
        toast.success('Exam created.')
      }
      onClose()
    } catch (err) {
      toast.error(err?.data?.message ?? 'Something went wrong.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Exam' : 'Create Exam'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Exam Title"
          value={form.title}
          onChange={set('title')}
          placeholder="e.g. Chapter 3 Weekly Exam"
          required autoFocus
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch <span className="text-red-500">*</span></label>
            <select
              value={form.batch_id}
              onChange={set('batch_id')}
              required
              disabled={isEdit}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              <option value="">Select batch</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={form.subject_id}
              onChange={set('subject_id')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              value={form.exam_type_id}
              onChange={set('exam_type_id')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              {examTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <Input
            label="Exam Date"
            type="date"
            value={form.exam_date}
            onChange={set('exam_date')}
            required
          />

          <Input
            label="Total Marks"
            type="number"
            min="1"
            step="0.5"
            value={form.total_marks}
            onChange={set('total_marks')}
            required
          />

          <Input
            label="Passing Marks"
            type="number"
            min="0"
            step="0.5"
            value={form.passing_marks}
            onChange={set('passing_marks')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={set('status')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes about this exam…"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Exam'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
