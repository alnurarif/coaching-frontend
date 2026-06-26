import { formatDate } from '@/utils/formatDate'

export function OverviewTab({ exam }) {
  const rows = [
    ['Batch',         exam.batch?.name],
    ['Subject',       exam.subject?.name],
    ['Exam Type',     exam.exam_type?.name],
    ['Date',          formatDate(exam.exam_date)],
    ['Total Marks',   exam.total_marks],
    ['Passing Marks', exam.passing_marks],
    ['Created By',    exam.created_by?.name],
  ].filter(([, v]) => v)

  return (
    <div className="space-y-4">
      {exam.description && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">{exam.description}</p>
      )}
      <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
