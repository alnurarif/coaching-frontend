import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAssignStudentsMutation } from '@/features/batches/batchApi'
import { useGetStudentsQuery } from '@/features/students/studentApi'
import { useDebounce } from '@/hooks/useDebounce'

export function AssignStudentsModal({ open, onClose, batch }) {
  const [search, setSearch]           = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const debouncedSearch               = useDebounce(search, 300)

  const alreadyInBatch = new Set((batch?.students ?? []).map((s) => s.id))

  const { data, isFetching } = useGetStudentsQuery(
    { search: debouncedSearch || undefined, status: 'active', per_page: 20 },
    { skip: !open },
  )

  const [assignStudents, { isLoading }] = useAssignStudentsMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { joined_at: new Date().toISOString().split('T')[0] } })

  const availableStudents = (data?.data ?? []).filter((s) => !alreadyInBatch.has(s.id))

  const toggleStudent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleClose = () => {
    setSearch('')
    setSelectedIds([])
    onClose()
  }

  const onSubmit = async ({ joined_at }) => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one student.')
      return
    }
    try {
      await assignStudents({ batchId: batch.id, student_ids: selectedIds, joined_at }).unwrap()
      toast.success(`${selectedIds.length} student(s) added to batch.`)
      handleClose()
    } catch (err) {
      const firstError = err?.data?.errors
        ? Object.values(err.data.errors)[0]?.[0]
        : null
      toast.error(firstError ?? err?.data?.message ?? 'Something went wrong.')
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Assign Students to Batch" size="md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Join Date *"
          type="date"
          error={errors.joined_at?.message}
          {...register('joined_at', { required: 'Join date is required' })}
        />

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Search Students
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
          {isFetching ? (
            <p className="text-sm text-gray-400 text-center py-6">Searching…</p>
          ) : availableStudents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              {search ? 'No students found.' : 'All active students are already assigned.'}
            </p>
          ) : (
            availableStudents.map((student) => {
              const checked = selectedIds.includes(student.id)
              return (
                <label
                  key={student.id}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStudent(student.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{student.student_id}</p>
                  </div>
                </label>
              )
            })
          )}
        </div>

        {selectedIds.length > 0 && (
          <p className="text-sm text-blue-600 font-medium">
            {selectedIds.length} student(s) selected
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Assign Students
          </Button>
        </div>
      </form>
    </Modal>
  )
}
