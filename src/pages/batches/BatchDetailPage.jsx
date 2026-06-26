import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, UserPlus, Trash2, Clock, Users, CalendarDays } from 'lucide-react'
import { useGetBatchQuery, useRemoveStudentFromBatchMutation } from '@/features/batches/batchApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { BatchFormModal } from './BatchFormModal'
import { AssignStudentsModal } from './AssignStudentsModal'
import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
      <div className="p-2 bg-blue-50 rounded-lg shrink-0">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function BatchDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [editOpen, setEditOpen]           = useState(false)
  const [assignOpen, setAssignOpen]       = useState(false)
  const [removeTarget, setRemoveTarget]   = useState(null)

  const { data, isLoading, isError } = useGetBatchQuery(id)
  const batch = data?.data

  const [removeStudent, { isLoading: removing }] = useRemoveStudentFromBatchMutation()

  const handleRemove = async () => {
    try {
      await removeStudent({ batchId: id, studentId: removeTarget.id }).unwrap()
      toast.success(`${removeTarget.name} removed from batch.`)
      setRemoveTarget(null)
    } catch {
      toast.error('Failed to remove student.')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  if (isError) {
    return <div className="p-6"><p className="text-red-500">Failed to load batch. Please try again.</p></div>
  }

  if (!batch) {
    return <div className="p-6"><p className="text-gray-500">Batch not found.</p></div>
  }

  const occupancy = batch.students?.length ?? 0

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{batch.name}</h2>
          {batch.subject && <p className="text-sm text-gray-500 mt-0.5">{batch.subject}</p>}
        </div>
        <Badge variant={batch.status === 'active' ? 'success' : 'gray'}>{batch.status}</Badge>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <InfoCard icon={Users} label="Students / Capacity" value={`${occupancy} / ${batch.capacity}`} />
        <InfoCard icon={CalendarDays} label="Start Date" value={formatDate(batch.start_date)} />
        <InfoCard icon={Clock} label="Monthly Fee" value={formatCurrency(batch.fee_amount)} />
        <InfoCard
          icon={Users}
          label="Teacher"
          value={batch.teacher?.name ?? 'Not assigned'}
        />
      </div>

      {batch.schedule?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Class Schedule</h3>
          <div className="flex flex-wrap gap-2">
            {batch.schedule.map((slot, i) => (
              <div key={i} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-lg px-3 py-1.5 text-sm">
                <span className="font-medium">{slot.day}</span>
                <span className="text-blue-400">·</span>
                <span>{slot.start_time} – {slot.end_time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            Enrolled Students
            <span className="ml-2 text-xs font-normal text-gray-500">({occupancy})</span>
          </h3>
          <Button size="sm" onClick={() => setAssignOpen(true)}>
            <UserPlus className="h-3.5 w-3.5" />
            Add Students
          </Button>
        </div>

        {occupancy === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No students assigned yet. Click "Add Students" to enroll.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Student ID</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Phone</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Joined</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batch.students.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{student.student_id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                  <td className="px-4 py-3 text-gray-600">{student.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(student.joined_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={student.status === 'active' ? 'success' : 'gray'}>
                      {student.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setRemoveTarget(student)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove from batch"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <BatchFormModal open={editOpen} onClose={() => setEditOpen(false)} batch={batch} />

      <AssignStudentsModal open={assignOpen} onClose={() => setAssignOpen(false)} batch={batch} />

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        isLoading={removing}
        title="Remove Student"
        message={`Remove ${removeTarget?.name} from this batch?`}
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </div>
  )
}
