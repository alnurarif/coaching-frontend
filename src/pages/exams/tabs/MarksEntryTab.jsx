import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { useGetEntrySheetQuery, useSaveResultsMutation } from '@/features/exams/examApi'

export function MarksEntryTab({ exam }) {
  const { data, isLoading } = useGetEntrySheetQuery(exam.id)
  const [records, setRecords] = useState([])
  const [saveResults, { isLoading: saving }] = useSaveResultsMutation()

  useEffect(() => {
    if (data?.data) {
      setRecords(data.data.map((r) => ({
        student_id:     r.student_id,
        student_code:   r.student_code,
        name:           r.name,
        marks_obtained: r.marks_obtained ?? '',
        is_absent:      r.is_absent ?? false,
        remarks:        r.remarks ?? '',
      })))
    }
  }, [data])

  const update = (idx, field, value) =>
    setRecords((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))

  const handleSave = async () => {
    const payload = records.map((r) => ({
      student_id:     r.student_id,
      is_absent:      r.is_absent,
      marks_obtained: r.is_absent ? null : (r.marks_obtained === '' ? null : parseFloat(r.marks_obtained)),
      remarks:        r.remarks || null,
    }))

    try {
      const res = await saveResults({ examId: exam.id, records: payload }).unwrap()
      toast.success(`Marks saved — ${res.data.present} present, ${res.data.absent} absent.`)
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to save marks.')
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{records.length} students in this batch</p>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Marks
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 w-28">Absent</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-36">
                Marks <span className="text-gray-400 font-normal">/ {exam.total_marks}</span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((r, idx) => (
              <tr key={r.student_id} className={r.is_absent ? 'bg-red-50' : 'hover:bg-gray-50'}>
                <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                <td className="px-4 py-2.5">
                  <p className="font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{r.student_code}</p>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={r.is_absent}
                    onChange={(e) => {
                      update(idx, 'is_absent', e.target.checked)
                      if (e.target.checked) update(idx, 'marks_obtained', '')
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    min="0"
                    max={exam.total_marks}
                    step="0.5"
                    value={r.marks_obtained}
                    onChange={(e) => update(idx, 'marks_obtained', e.target.value)}
                    disabled={r.is_absent}
                    placeholder="—"
                    className="w-28 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="text"
                    value={r.remarks}
                    onChange={(e) => update(idx, 'remarks', e.target.value)}
                    placeholder="Optional note"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Marks
        </Button>
      </div>
    </div>
  )
}
