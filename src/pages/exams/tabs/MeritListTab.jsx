import { Loader2, Trophy, CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useGetMeritListQuery } from '@/features/exams/examApi'

const medalColor = (pos) => {
  if (pos === 1) return 'text-yellow-500'
  if (pos === 2) return 'text-gray-400'
  if (pos === 3) return 'text-amber-600'
  return 'text-gray-300'
}

export function MeritListTab({ exam }) {
  const { data, isLoading } = useGetMeritListQuery(exam.id)
  const summary = data?.summary
  const list    = data?.data ?? []

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>

  if (list.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Trophy className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">No results to rank yet. Enter marks first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {summary && (
        <div className="flex gap-6 text-sm text-gray-600">
          <span>Appeared: <strong className="text-gray-900">{summary.total_appeared}</strong></span>
          <span>Passed: <strong className="text-green-600">{summary.pass_count}</strong></span>
          <span>Pass rate: <strong className="text-gray-900">
            {summary.total_appeared > 0
              ? `${Math.round(summary.pass_count / summary.total_appeared * 100)}%`
              : '—'}
          </strong></span>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-center px-4 py-3 font-medium text-gray-600 w-16">Rank</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Marks</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">%</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Grade</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((r) => (
              <tr key={r.student_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className={`h-4 w-4 ${medalColor(r.position)}`} />
                    <span className="font-bold text-gray-900">{r.position}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{r.student_code}</p>
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                  {r.marks_obtained}
                  <span className="text-gray-400 font-normal text-xs"> / {r.total_marks}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-700">
                  {r.percent != null ? `${r.percent}%` : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  {r.grade ? <Badge variant="info">{r.grade}</Badge> : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  {r.is_pass
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                    : <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
