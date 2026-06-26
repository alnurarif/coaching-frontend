import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock, Save } from 'lucide-react'
import {
  useGetStudentAttendanceQuery,
  useMarkStudentAttendanceMutation,
} from '@/features/attendance/attendanceApi'
import { useGetBatchesQuery } from '@/features/batches/batchApi'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { cn } from '@/components/ui/cn'

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { value: 'absent',  label: 'Absent',  icon: XCircle,     color: 'text-red-600',   bg: 'bg-red-50 border-red-200' },
  { value: 'late',    label: 'Late',    icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
]

function StatusButton({ value, current, onChange }) {
  const opt = STATUS_OPTIONS.find((o) => o.value === value)
  const Icon = opt.icon
  const isActive = current === value

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all',
        isActive ? `${opt.bg} ${opt.color} border-current` : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {opt.label}
    </button>
  )
}

export function StudentAttendanceTab() {
  const today = new Date().toISOString().split('T')[0]

  const [batchId, setBatchId] = useState('')
  const [date, setDate]       = useState(today)
  const [records, setRecords] = useState({})

  const { data: batchesData } = useGetBatchesQuery({ status: 'active', per_page: 100 })
  const batches = batchesData?.data ?? []

  const { data, isLoading, isFetching } = useGetStudentAttendanceQuery(
    { batch_id: batchId, date },
    { skip: !batchId || !date },
  )

  const [markAttendance, { isLoading: saving }] = useMarkStudentAttendanceMutation()

  const students = data?.data ?? []

  useEffect(() => {
    if (students.length) {
      const init = {}
      students.forEach((s) => {
        init[s.student_id] = s.status ?? 'present'
      })
      setRecords(init)
    }
  }, [data])

  const setStatus = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }))
  }

  const markAll = (status) => {
    const next = {}
    students.forEach((s) => { next[s.student_id] = status })
    setRecords(next)
  }

  const handleSave = async () => {
    const recordsArr = students.map((s) => ({
      student_id: s.student_id,
      status:     records[s.student_id] ?? 'present',
    }))

    try {
      const result = await markAttendance({
        batch_id: parseInt(batchId, 10),
        date,
        records: recordsArr,
      }).unwrap()
      toast.success(`Saved — ${result.data.present} present, ${result.data.absent} absent, ${result.data.late} late.`)
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to save attendance.')
    }
  }

  const counts = students.reduce(
    (acc, s) => {
      const status = records[s.student_id] ?? 'present'
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    { present: 0, absent: 0, late: 0 },
  )

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="w-64">
          <Select
            label="Select Batch *"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Choose a batch…"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </div>
        <div className="w-44">
          <label className="text-sm font-medium text-gray-700 block mb-1">Date *</label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {students.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500">Mark all:</span>
            <button type="button" onClick={() => markAll('present')} className="text-xs px-2.5 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 font-medium">Present</button>
            <button type="button" onClick={() => markAll('absent')} className="text-xs px-2.5 py-1.5 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-medium">Absent</button>
          </div>
        )}
      </div>

      {!batchId ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400 text-sm">
          Select a batch to mark attendance.
        </div>
      ) : isLoading || isFetching ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400 text-sm">
          No students in this batch yet.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 px-1">
            <span className="text-sm text-green-600 font-medium">{counts.present} Present</span>
            <span className="text-sm text-red-600 font-medium">{counts.absent} Absent</span>
            <span className="text-sm text-yellow-600 font-medium">{counts.late} Late</span>
            <span className="text-sm text-gray-400">/ {students.length} total</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Student ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, idx) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{student.student_code}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-gray-600">{student.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {STATUS_OPTIONS.map((opt) => (
                          <StatusButton
                            key={opt.value}
                            value={opt.value}
                            current={records[student.student_id] ?? 'present'}
                            onChange={(v) => setStatus(student.student_id, v)}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={saving}>
              <Save className="h-4 w-4" />
              Save Attendance
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
