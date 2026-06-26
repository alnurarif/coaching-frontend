import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock, Save } from 'lucide-react'
import {
  useGetTeacherAttendanceQuery,
  useMarkTeacherAttendanceMutation,
} from '@/features/attendance/attendanceApi'
import { Button } from '@/components/ui/Button'
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

export function TeacherAttendanceTab() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate]       = useState(today)
  const [records, setRecords] = useState({})

  const { data, isLoading } = useGetTeacherAttendanceQuery({ date }, { skip: !date })
  const [markAttendance, { isLoading: saving }] = useMarkTeacherAttendanceMutation()

  const teachers = data?.data ?? []

  useEffect(() => {
    if (teachers.length) {
      const init = {}
      teachers.forEach((t) => { init[t.user_id] = t.status ?? 'present' })
      setRecords(init)
    }
  }, [data])

  const setStatus = (userId, status) => {
    setRecords((prev) => ({ ...prev, [userId]: status }))
  }

  const handleSave = async () => {
    const recordsArr = teachers.map((t) => ({
      user_id: t.user_id,
      status:  records[t.user_id] ?? 'present',
    }))

    try {
      const result = await markAttendance({ date, records: recordsArr }).unwrap()
      toast.success(`Saved — ${result.data.present} present, ${result.data.absent} absent.`)
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to save attendance.')
    }
  }

  const counts = teachers.reduce(
    (acc, t) => { const s = records[t.user_id] ?? 'present'; acc[s] = (acc[s] || 0) + 1; return acc },
    { present: 0, absent: 0, late: 0 },
  )

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
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
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400 text-sm">
          No teachers found. Add teachers in the Teachers module first.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 px-1">
            <span className="text-sm text-green-600 font-medium">{counts.present} Present</span>
            <span className="text-sm text-red-600 font-medium">{counts.absent} Absent</span>
            <span className="text-sm text-yellow-600 font-medium">{counts.late} Late</span>
            <span className="text-sm text-gray-400">/ {teachers.length} total</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Teacher</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teachers.map((teacher, idx) => (
                  <tr key={teacher.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{teacher.name}</td>
                    <td className="px-4 py-3 text-gray-600">{teacher.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {STATUS_OPTIONS.map((opt) => (
                          <StatusButton
                            key={opt.value}
                            value={opt.value}
                            current={records[teacher.user_id] ?? 'present'}
                            onChange={(v) => setStatus(teacher.user_id, v)}
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
