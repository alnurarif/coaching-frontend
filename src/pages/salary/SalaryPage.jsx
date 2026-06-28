import { useState } from 'react'
import { Users, CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react'
import { useGetMonthlyStatusQuery } from '@/features/salary/salaryApi'
import { useGetSalariesQuery } from '@/features/teachers/teacherApi'
import { useGetBranchesQuery } from '@/features/branches/branchApi'
import { SalaryModal } from '@/pages/teachers/SalaryModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

const STATUS_CONFIG = {
  paid:    { label: 'Paid',    variant: 'success', icon: CheckCircle2 },
  partial: { label: 'Partial', variant: 'warning', icon: AlertCircle  },
  unpaid:  { label: 'Unpaid',  variant: 'danger',  icon: XCircle      },
}

const PAYMENT_LABELS = {
  cash: 'Cash', bkash: 'bKash', nagad: 'Nagad',
  rocket: 'Rocket', bank_transfer: 'Bank Transfer',
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, color, icon: Icon }) {
  const colors = {
    blue:  'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red:   'bg-red-50 text-red-700 border-red-100',
    gray:  'bg-gray-50 text-gray-700 border-gray-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="h-4 w-4" />}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SalaryPage() {
  const [month, setMonth]       = useState(currentMonth())
  const [branchId, setBranchId] = useState('')
  const [payTarget, setPayTarget] = useState(null)   // teacher row from monthly status
  const [historyPage, setHistoryPage] = useState(1)

  const { data: branchesData } = useGetBranchesQuery()
  const branches = branchesData?.data ?? []

  const statusParams = { month, ...(branchId ? { branch_id: branchId } : {}) }
  const { data: statusData, isLoading: statusLoading, isFetching: statusFetching } =
    useGetMonthlyStatusQuery(statusParams)

  const historyParams = { month, per_page: 15, page: historyPage }
  const { data: historyData, isLoading: historyLoading } =
    useGetSalariesQuery(historyParams)

  const rows    = statusData?.data ?? []
  const history = historyData?.data ?? []
  const meta    = historyData?.meta ?? {}

  // Summary counts
  const totalTeachers = rows.length
  const paidCount     = rows.filter(r => r.status === 'paid').length
  const partialCount  = rows.filter(r => r.status === 'partial').length
  const unpaidCount   = rows.filter(r => r.status === 'unpaid').length
  const totalPaidOut  = rows.reduce((sum, r) => sum + r.total_paid, 0)

  const handlePayClose = () => setPayTarget(null)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Payroll</h2>
        <p className="text-sm text-gray-500 mt-0.5">Track and record salary payments for all staff and teachers by month.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Month</label>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        {branches.length > 1 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Branch</label>
            <select
              value={branchId}
              onChange={e => setBranchId(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none min-w-[160px]"
            >
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard label="Total Employees" value={totalTeachers} color="blue"  icon={Users} />
        <SummaryCard label="Paid"           value={paidCount}     color="green" icon={CheckCircle2} />
        <SummaryCard label="Partial"        value={partialCount}  color="amber" icon={AlertCircle} />
        <SummaryCard label="Unpaid"         value={unpaidCount}   color="red"   icon={XCircle} />
        <SummaryCard label="Total Paid Out" value={formatCurrency(totalPaidOut)} color="gray" />
      </div>

      {/* Monthly status table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Monthly Status — {month}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Position</th>
                {branches.length > 1 && <th className="text-left px-4 py-3 font-medium text-gray-500">Branch</th>}
                <th className="text-right px-4 py-3 font-medium text-gray-500">Monthly Salary</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Paid</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Remaining</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(statusLoading || statusFetching) ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">
                  No active employees found. Add teachers or staff first.
                </td></tr>
              ) : rows.map((row) => {
                const cfg = STATUS_CONFIG[row.status]
                return (
                  <tr key={row.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{row.name}</p>
                      {row.phone && <p className="text-xs text-gray-400">{row.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {row.position}
                      </span>
                    </td>
                    {branches.length > 1 && (
                      <td className="px-4 py-3 text-gray-600 text-xs">{row.branch_name ?? '—'}</td>
                    )}
                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {row.base_salary > 0 ? formatCurrency(row.base_salary) : <span className="text-gray-400 text-xs">Not set</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-green-700">
                      {row.total_paid > 0 ? formatCurrency(row.total_paid) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-red-600">
                      {row.remaining > 0 ? formatCurrency(row.remaining) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.status === 'paid' ? (
                        <span className="text-xs text-gray-400">Fully Paid</span>
                      ) : row.base_salary <= 0 ? (
                        <span className="text-xs text-amber-500" title="Set a monthly salary for this employee first">Salary not set</span>
                      ) : (
                        <Button size="sm" onClick={() => setPayTarget(row)}>
                          Pay Salary
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary history table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Payment History — {month}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Position</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Month</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Base</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Bonus</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Deduction</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Net</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Paid</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Method</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Payment Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historyLoading ? (
                <tr><td colSpan={11} className="text-center py-10 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-10 text-gray-400">
                  No payments recorded for this month.
                </td></tr>
              ) : history.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.teacher?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {p.teacher?.position ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.month}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{formatCurrency(p.base_salary)}</td>
                  <td className="px-4 py-3 text-right font-mono text-green-700">
                    {p.bonus > 0 ? formatCurrency(p.bonus) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-red-600">
                    {p.deduction > 0 ? formatCurrency(p.deduction) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">{formatCurrency(p.net_salary)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-blue-700">{formatCurrency(p.amount_paid)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="gray">{PAYMENT_LABELS[p.payment_method] ?? p.payment_method}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.payment_date ? formatDate(p.payment_date) : '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.receipt_no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination meta={meta} onPageChange={setHistoryPage} />
          </div>
        )}
      </div>

      {/* Pay modal — reuse existing SalaryModal */}
      {payTarget && (
        <SalaryModal
          open={!!payTarget}
          onClose={handlePayClose}
          teacher={{
            id:        payTarget.user_id,
            name:      payTarget.name,
            profile:   { base_salary: payTarget.base_salary },
            remaining: payTarget.remaining,
          }}
        />
      )}
    </div>
  )
}
