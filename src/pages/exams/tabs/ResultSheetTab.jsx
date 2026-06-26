import { Loader2, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useGetResultSheetQuery } from '@/features/exams/examApi'

export function ResultSheetTab({ exam }) {
  const { data, isLoading } = useGetResultSheetQuery(exam.id)
  const summary = data?.summary
  const results = data?.data ?? []

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
          {[
            { label: 'Total',   value: summary.total_students },
            { label: 'Present', value: summary.present },
            { label: 'Absent',  value: summary.absent },
            { label: 'Pass',    value: summary.pass_count,  color: 'text-green-600' },
            { label: 'Fail',    value: summary.fail_count,  color: 'text-red-600' },
            { label: 'Average', value: summary.avg_marks != null ? `${summary.avg_marks}` : '—' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-lg px-4 py-3 text-center">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-xl font-bold mt-0.5 ${color ?? 'text-gray-900'}`}>{value ?? '—'}</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Marks</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Grade</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Position</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Result</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((r, idx) => (
              <tr key={r.student_id} className={r.is_absent ? 'bg-red-50' : 'hover:bg-gray-50'}>
                <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{r.student_code}</p>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {r.is_absent ? (
                    <span className="text-red-500 text-xs font-medium">Absent</span>
                  ) : r.marks_obtained != null ? (
                    <span className="font-semibold text-gray-900">{r.marks_obtained}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {r.grade ? <Badge variant="info">{r.grade}</Badge> : '—'}
                </td>
                <td className="px-4 py-3 text-center font-medium text-gray-700">
                  {r.position ?? '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  {r.is_absent ? (
                    <MinusCircle className="h-4 w-4 text-gray-400 mx-auto" />
                  ) : r.is_pass === true ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                  ) : r.is_pass === false ? (
                    <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{r.remarks ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
