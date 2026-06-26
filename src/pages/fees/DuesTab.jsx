import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { formatCurrency } from '@/utils/formatCurrency'
import { useGetFeeDuesQuery } from '@/features/fees/feeApi'
import { useGetBatchesQuery } from '@/features/batches/batchApi'

export function DuesTab({ onCollect }) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const [month, setMonth] = useState(currentMonth)
  const [batchId, setBatchId] = useState('')

  const { data: duesData, isLoading, isFetching } = useGetFeeDuesQuery(
    { month, batch_id: batchId || undefined },
    { skip: !month },
  )
  const { data: batchesData } = useGetBatchesQuery({ status: 'active', per_page: 100 })

  const dues = duesData?.data ?? []
  const batches = batchesData?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-52">
          <Select
            label="Batch"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </div>
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-gray-400 mb-2" />}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : dues.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No dues found for this period</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Batch</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Fee</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Paid</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Balance</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dues.map((due, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{due.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{due.student_id}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{due.batch_name}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">{formatCurrency(due.fee_amount)}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">{formatCurrency(due.amount_paid)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-red-600">
                      {formatCurrency(due.balance)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {due.partially_paid
                        ? <Badge variant="warning">Partial</Badge>
                        : <Badge variant="danger">Unpaid</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onCollect(
                          { id: due.student_db_id, student_id: due.student_id, name: due.name },
                          due.batch_id,
                        )}
                      >
                        Collect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400">
            {dues.length} student{dues.length !== 1 ? 's' : ''} with outstanding dues
          </p>
        </>
      )}
    </div>
  )
}
