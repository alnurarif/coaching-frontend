import { useState } from 'react'
import { useGetAbsentListQuery } from '@/features/attendance/attendanceApi'
import { Badge } from '@/components/ui/Badge'

export function AbsentListTab() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)

  const { data, isLoading, isFetching } = useGetAbsentListQuery({ date }, { skip: !date })
  const absentList = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="w-44">
          <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {absentList.length > 0 && (
          <Badge variant="danger" className="mb-0.5 text-sm px-3 py-1">
            {absentList.length} absent
          </Badge>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading || isFetching ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : absentList.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No absences recorded for this date.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Student ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Batch</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {absentList.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.student_id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{row.batch}</td>
                  <td className="px-4 py-3 text-gray-500 italic">{row.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
