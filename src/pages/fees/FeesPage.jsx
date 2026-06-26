import { useState } from 'react'
import { DollarSign, CalendarDays, History, AlertCircle, Printer, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetFeesQuery, useGetFeeSummaryQuery } from '@/features/fees/feeApi'
import { CollectFeeModal } from './CollectFeeModal'
import { ReceiptModal } from './ReceiptModal'
import { DuesTab } from './DuesTab'

const TABS = [
  { id: 'history', label: 'Payment History', Icon: History },
  { id: 'dues', label: 'Dues', Icon: AlertCircle },
]

const FEE_TYPE_LABELS = { monthly: 'Monthly', admission: 'Admission', exam: 'Exam', other: 'Other' }
const METHOD_BADGE = { cash: 'gray', bkash: 'info', nagad: 'warning', rocket: 'success', bank_transfer: 'info' }

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState('history')

  // Collect modal state
  const [collectOpen, setCollectOpen] = useState(false)
  const [collectStudent, setCollectStudent] = useState(null)
  const [collectBatchId, setCollectBatchId] = useState(null)

  // Receipt modal state
  const [receiptFee, setReceiptFee] = useState(null)
  const [receiptOpen, setReceiptOpen] = useState(false)

  // History filters
  const [search, setSearch] = useState('')
  const [feeTypeFilter, setFeeTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)

  const { data: feesData, isLoading: historyLoading } = useGetFeesQuery(
    { search: debouncedSearch || undefined, fee_type: feeTypeFilter || undefined, page, per_page: 15 },
    { skip: activeTab !== 'history' },
  )
  const { data: summaryData } = useGetFeeSummaryQuery()
  const summary = summaryData?.data
  const fees = feesData?.data ?? []

  const openCollect = (student = null, batchId = null) => {
    setCollectStudent(student)
    setCollectBatchId(batchId)
    setCollectOpen(true)
  }

  const handleCollectSuccess = (fee) => {
    setReceiptFee(fee)
    setReceiptOpen(true)
  }

  const handleCloseCollect = () => {
    setCollectOpen(false)
    setCollectStudent(null)
    setCollectBatchId(null)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Fee Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Collect fees and track payments</p>
        </div>
        <Button onClick={() => openCollect()}>
          <DollarSign className="h-4 w-4" />
          Collect Fee
        </Button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Today's Collection</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(summary.today_collection)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">This Month</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(summary.month_collection)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Payment History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Search by student name or ID…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
                />
                <select
                  value={feeTypeFilter}
                  onChange={(e) => { setFeeTypeFilter(e.target.value); setPage(1) }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Fee Types</option>
                  <option value="monthly">Monthly</option>
                  <option value="admission">Admission</option>
                  <option value="exam">Exam</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {historyLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : fees.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <History className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No payment records found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Receipt</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Student</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Batch</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                          <th className="text-right px-4 py-3 font-medium text-gray-500">Paid</th>
                          <th className="text-right px-4 py-3 font-medium text-gray-500">Balance</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Method</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {fees.map((fee) => (
                          <tr key={fee.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{fee.receipt_no}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{fee.student?.name}</p>
                              <p className="text-xs text-gray-500 font-mono">{fee.student?.student_id}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{fee.batch?.name}</td>
                            <td className="px-4 py-3">
                              <Badge variant="info">{FEE_TYPE_LABELS[fee.fee_type] ?? fee.fee_type}</Badge>
                              {fee.month && (
                                <span className="ml-1.5 text-xs text-gray-400">{fee.month}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                              {formatCurrency(fee.amount_paid)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {fee.balance > 0 ? (
                                <span className="font-mono font-semibold text-red-600">
                                  {formatCurrency(fee.balance)}
                                </span>
                              ) : (
                                <Badge variant="success">Paid</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={METHOD_BADGE[fee.payment_method] ?? 'gray'}>
                                {fee.payment_method}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{formatDate(fee.payment_date)}</td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => { setReceiptFee(fee); setReceiptOpen(true) }}
                                className="text-gray-400 hover:text-gray-700 transition-colors"
                                title="View receipt"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination meta={feesData?.meta} onPageChange={setPage} />
                </>
              )}
            </div>
          )}

          {/* Dues */}
          {activeTab === 'dues' && (
            <DuesTab onCollect={(student, batchId) => openCollect(student, batchId)} />
          )}
        </div>
      </div>

      <CollectFeeModal
        open={collectOpen}
        onClose={handleCloseCollect}
        onSuccess={handleCollectSuccess}
        defaultStudent={collectStudent}
        defaultBatchId={collectBatchId}
      />

      <ReceiptModal
        open={receiptOpen}
        onClose={() => { setReceiptOpen(false); setReceiptFee(null) }}
        fee={receiptFee}
      />
    </div>
  )
}
