import { useRef, useState, useEffect } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  Printer, FileText, AlertCircle, CalendarCheck, Users,
  TrendingUp, BarChart2, Search, X, Trophy, Receipt, Loader2,
} from 'lucide-react'
import {
  LineChart, Line, ComposedChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useGetBatchesQuery } from '@/features/batches/batchApi'
import { useGetSubjectsQuery } from '@/features/subjects/subjectApi'
import { useGetStudentsQuery } from '@/features/students/studentApi'
import {
  useGetCollectionReportQuery,
  useGetDuesReportQuery,
  useGetAttendanceReportQuery,
  useGetStudentListReportQuery,
  useGetExamProgressReportQuery,
  useGetBatchAnalyticsReportQuery,
  useGetProfitLossReportQuery,
} from '@/features/reports/reportApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const TABS = [
  { key: 'collection', label: 'Collections',     icon: FileText },
  { key: 'dues',       label: 'Dues',            icon: AlertCircle },
  { key: 'attendance', label: 'Attendance',      icon: CalendarCheck },
  { key: 'students',   label: 'Students',        icon: Users },
  { key: 'progress',   label: 'Progress',        icon: TrendingUp },
  { key: 'analytics',  label: 'Batch Analytics', icon: BarChart2 },
  { key: 'pl',         label: 'P&L',             icon: Receipt },
]

const METHOD_LABELS = {
  cash: 'Cash', bkash: 'bKash', nagad: 'Nagad',
  rocket: 'Rocket', bank_transfer: 'Bank Transfer',
}
const FEE_TYPE_LABELS = {
  admission: 'Admission', monthly: 'Monthly', exam: 'Exam', other: 'Other',
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
function monthStart() {
  return new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
}

function FilterInput({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        {...props}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}
function FilterSelect({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">{label}</label>
      <select
        {...props}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[140px]"
      >
        {children}
      </select>
    </div>
  )
}
function StatCard({ label, value, color = 'text-gray-900' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
    </div>
  )
}

function ReportPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.last_page <= 1) return null
  const { current_page, last_page, total, per_page } = pagination
  const from = (current_page - 1) * per_page + 1
  const to   = Math.min(current_page * per_page, total)

  return (
    <div className="flex items-center justify-between px-1 text-sm text-gray-600">
      <span>Showing {from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Prev
        </button>
        <span className="px-3 py-1.5 text-gray-500">{current_page} / {last_page}</span>
        <button
          type="button"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}

// ─── Collection Report ───────────────────────────────────────────────────────
function CollectionReport({ batches }) {
  const [filters, setFilters] = useState({
    date_from: monthStart(), date_to: today(), batch_id: '', fee_type: '',
  })
  const [page, setPage] = useState(1)
  const printRef = useRef(null)
  const print = useReactToPrint({ contentRef: printRef })
  const user = useSelector(selectCurrentUser)

  const dateRangeInvalid = filters.date_from && filters.date_to && filters.date_from > filters.date_to
  const params = { ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), page }
  const { data, isLoading, isFetching } = useGetCollectionReportQuery(params, { skip: dateRangeInvalid })
  const rows = data?.data ?? []
  const summary = data?.summary ?? {}

  const updateFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1) }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <FilterInput label="From" type="date" value={filters.date_from}
          onChange={(e) => updateFilter('date_from', e.target.value)} />
        <FilterInput label="To" type="date" value={filters.date_to}
          onChange={(e) => updateFilter('date_to', e.target.value)} />
        <FilterSelect label="Batch" value={filters.batch_id}
          onChange={(e) => updateFilter('batch_id', e.target.value)}>
          <option value="">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </FilterSelect>
        <FilterSelect label="Fee Type" value={filters.fee_type}
          onChange={(e) => updateFilter('fee_type', e.target.value)}>
          <option value="">All Types</option>
          {Object.entries(FEE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </FilterSelect>
        <Button onClick={() => print()} className="print:hidden ml-auto">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      {dateRangeInvalid && (
        <p className="text-sm text-red-500 px-1">"From" date must be before "To" date.</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Records" value={summary.total_count ?? 0} />
        <StatCard label="Total Collected" value={formatCurrency(summary.total_collected ?? 0)} color="text-green-600" />
        <StatCard label="Outstanding" value={formatCurrency(summary.total_outstanding ?? 0)} color="text-red-500" />
      </div>

      <div ref={printRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden print:block px-5 py-4 border-b border-gray-200">
          <h1 className="text-lg font-bold">{user?.tenant?.name ?? 'Coaching Center'}</h1>
          <p className="text-sm text-gray-600">Collection Report · {filters.date_from} to {filters.date_to}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Receipt','Student','Batch','Type','Month','Net Due','Paid','Balance','Method','Date'].map(h => (
                  <th key={h} className={`px-4 py-3 font-medium text-gray-500 ${['Net Due','Paid','Balance'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(isLoading || isFetching) ? (
                <tr><td colSpan={10} className="text-center py-10 text-gray-400">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-gray-400">No records found.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.receipt_no}</td>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{r.student_name}</p><p className="text-xs text-gray-400">{r.student_sid}</p></td>
                  <td className="px-4 py-3 text-gray-600">{r.batch_name ?? '—'}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{r.fee_type}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{r.month ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{formatCurrency(r.net_amount)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-blue-700">{formatCurrency(r.amount_paid)}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-500">{r.balance > 0 ? formatCurrency(r.balance) : '—'}</td>
                  <td className="px-4 py-3"><Badge variant="gray">{METHOD_LABELS[r.payment_method] ?? r.payment_method}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(r.payment_date)}</td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right text-gray-700">Totals:</td>
                  <td className="px-4 py-3 text-right font-mono text-blue-700">{formatCurrency(summary.total_collected)}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-500">{formatCurrency(summary.total_outstanding)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      <ReportPagination pagination={data?.pagination} onPageChange={setPage} />
    </div>
  )
}

// ─── Dues Report ─────────────────────────────────────────────────────────────
function DuesReport({ batches }) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const [filters, setFilters] = useState({ batch_id: '', month: currentMonth })
  const [page, setPage] = useState(1)
  const printRef = useRef(null)
  const print = useReactToPrint({ contentRef: printRef })
  const user = useSelector(selectCurrentUser)

  const updateFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1) }
  const params = { ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), page }
  const { data, isLoading, isFetching } = useGetDuesReportQuery(params)
  const rows = data?.data ?? []
  const summary = data?.summary ?? {}

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <FilterInput label="Month" type="month" value={filters.month}
          onChange={(e) => updateFilter('month', e.target.value)} />
        <FilterSelect label="Batch" value={filters.batch_id}
          onChange={(e) => updateFilter('batch_id', e.target.value)}>
          <option value="">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </FilterSelect>
        <Button onClick={() => print()} className="print:hidden ml-auto">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Pending Records" value={summary.total_count ?? 0} />
        <StatCard label="Total Outstanding" value={formatCurrency(summary.total_outstanding ?? 0)} color="text-red-500" />
      </div>

      <div ref={printRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden print:block px-5 py-4 border-b border-gray-200">
          <h1 className="text-lg font-bold">{user?.tenant?.name ?? 'Coaching Center'}</h1>
          <p className="text-sm text-gray-600">Dues Report · {filters.month || 'All months'}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Student','Batch','Type','Month','Net Due','Paid','Balance'].map(h => (
                  <th key={h} className={`px-4 py-3 font-medium text-gray-500 ${['Net Due','Paid','Balance'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(isLoading || isFetching) ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-green-600">No outstanding dues!</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{r.student_name}</p><p className="text-xs text-gray-400">{r.student_sid}</p></td>
                  <td className="px-4 py-3 text-gray-600">{r.batch_name ?? '—'}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{r.fee_type}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{r.month ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{formatCurrency(r.net_amount)}</td>
                  <td className="px-4 py-3 text-right font-mono text-blue-700">{formatCurrency(r.amount_paid)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-red-600">{formatCurrency(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ReportPagination pagination={data?.pagination} onPageChange={setPage} />
    </div>
  )
}

// ─── Attendance Report ────────────────────────────────────────────────────────
function AttendanceReport({ batches }) {
  const [filters, setFilters] = useState({ batch_id: '', date_from: monthStart(), date_to: today() })
  const [page, setPage] = useState(1)
  const printRef = useRef(null)
  const print = useReactToPrint({ contentRef: printRef })
  const user = useSelector(selectCurrentUser)

  const updateFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1) }
  const dateRangeInvalid = filters.date_from && filters.date_to && filters.date_from > filters.date_to
  const params = { ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), page }
  const { data, isLoading, isFetching } = useGetAttendanceReportQuery(params, { skip: dateRangeInvalid })
  const rows = data?.data ?? []
  const summary = data?.summary ?? {}

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <FilterSelect label="Batch" value={filters.batch_id}
          onChange={(e) => updateFilter('batch_id', e.target.value)}>
          <option value="">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </FilterSelect>
        <FilterInput label="From" type="date" value={filters.date_from}
          onChange={(e) => updateFilter('date_from', e.target.value)} />
        <FilterInput label="To" type="date" value={filters.date_to}
          onChange={(e) => updateFilter('date_to', e.target.value)} />
        <Button onClick={() => print()} className="print:hidden ml-auto">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      {dateRangeInvalid && (
        <p className="text-sm text-red-500 px-1">"From" date must be before "To" date.</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Students in Report" value={summary.total_students ?? 0} />
        <StatCard label="Avg Attendance Rate" value={`${summary.avg_attendance_rate ?? 0}%`} color="text-green-600" />
      </div>

      <div ref={printRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden print:block px-5 py-4 border-b border-gray-200">
          <h1 className="text-lg font-bold">{user?.tenant?.name ?? 'Coaching Center'}</h1>
          <p className="text-sm text-gray-600">Attendance Report · {filters.date_from} to {filters.date_to}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Student</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Total</th>
                <th className="text-center px-4 py-3 font-medium text-green-600">Present</th>
                <th className="text-center px-4 py-3 font-medium text-red-500">Absent</th>
                <th className="text-center px-4 py-3 font-medium text-orange-500">Late</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(isLoading || isFetching) ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No attendance records found.</td></tr>
              ) : rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.student_id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{r.total}</td>
                  <td className="px-4 py-3 text-center text-green-600 font-medium">{r.present}</td>
                  <td className="px-4 py-3 text-center text-red-500 font-medium">{r.absent}</td>
                  <td className="px-4 py-3 text-center text-orange-500 font-medium">{r.late}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${r.attendance_rate >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                      {r.attendance_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ReportPagination pagination={data?.pagination} onPageChange={setPage} />
    </div>
  )
}

// ─── Student List Report ──────────────────────────────────────────────────────
function StudentListReport({ batches }) {
  const [filters, setFilters] = useState({ status: 'active', batch_id: '' })
  const [page, setPage] = useState(1)
  const printRef = useRef(null)
  const print = useReactToPrint({ contentRef: printRef })
  const user = useSelector(selectCurrentUser)

  const updateFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1) }
  const params = { ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), page }
  const { data, isLoading, isFetching } = useGetStudentListReportQuery(params)
  const rows = data?.data ?? []
  const summary = data?.summary ?? {}

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <FilterSelect label="Status" value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="withdrawn">Withdrawn</option>
        </FilterSelect>
        <FilterSelect label="Batch" value={filters.batch_id}
          onChange={(e) => updateFilter('batch_id', e.target.value)}>
          <option value="">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </FilterSelect>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500">{summary.total_count ?? 0} students</span>
          <Button onClick={() => print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <div ref={printRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden print:block px-5 py-4 border-b border-gray-200">
          <h1 className="text-lg font-bold">{user?.tenant?.name ?? 'Coaching Center'}</h1>
          <p className="text-sm text-gray-600">Student List · {filters.status || 'All'} · {new Date().toLocaleDateString('en-BD')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ID','Name','Phone','Gender','Batches','Admission','Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(isLoading || isFetching) ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No students found.</td></tr>
              ) : rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.student_id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.phone ?? '—'}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{r.gender ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.batches?.length ? r.batches.map(b => (
                        <span key={b.id} className="inline-block bg-blue-50 text-blue-700 rounded px-1.5 py-0.5 text-xs font-medium">{b.name}</span>
                      )) : <span className="text-gray-400">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(r.admission_date)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === 'active' ? 'success' : r.status === 'withdrawn' ? 'danger' : 'gray'}>
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ReportPagination pagination={data?.pagination} onPageChange={setPage} />
    </div>
  )
}

// ─── Student Progress Report ──────────────────────────────────────────────────
function StudentProgressReport({ batches }) {
  const [searchText, setSearchText]         = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showDropdown, setShowDropdown]     = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [filters, setFilters] = useState({
    batch_id: '', subject_id: '', date_from: '', date_to: '',
  })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 300)
    return () => clearTimeout(t)
  }, [searchText])

  const { data: studentsData } = useGetStudentsQuery(
    { search: debouncedSearch, per_page: 8 },
    { skip: debouncedSearch.length < 2 },
  )
  const studentOptions = studentsData?.data ?? []

  const { data: subjectsData } = useGetSubjectsQuery({ per_page: 200 })
  const subjects = subjectsData?.data ?? []

  const queryParams = selectedStudent
    ? { student_id: selectedStudent.id, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
    : null
  const { data, isLoading, isFetching } = useGetExamProgressReportQuery(queryParams, { skip: !queryParams })

  const student  = data?.student
  const timeline = data?.timeline ?? []
  const bySubject = data?.by_subject ?? []
  const summary  = data?.summary ?? {}

  const chartData = timeline
    .filter(r => !r.is_absent && r.percent !== null)
    .map(r => ({
      name:    r.title.length > 14 ? r.title.slice(0, 14) + '…' : r.title,
      percent: r.percent,
      subject: r.subject_name,
      grade:   r.grade,
      date:    r.exam_date,
    }))

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs space-y-1">
        <p className="font-semibold text-gray-900">{d.name}</p>
        <p className="text-gray-500">{d.subject} · {d.date}</p>
        <p className="text-blue-700 font-bold">{d.percent}% <span className="font-normal text-gray-500">({d.grade ?? '—'})</span></p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-gray-200 p-4">
        {/* Student search combobox */}
        <div className="flex flex-col gap-1 relative">
          <label className="text-xs text-gray-500">Student *</label>
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={selectedStudent ? selectedStudent.name : searchText}
              onChange={(e) => {
                setSelectedStudent(null)
                setSearchText(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => { if (!selectedStudent) setShowDropdown(true) }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              className="pl-8 pr-8 rounded-md border border-gray-300 px-3 py-2 text-sm w-56 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {selectedStudent && (
              <button
                type="button"
                onClick={() => { setSelectedStudent(null); setSearchText('') }}
                className="absolute right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {showDropdown && !selectedStudent && debouncedSearch.length >= 2 && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {studentOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-400">No students found</p>
              ) : studentOptions.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={() => {
                    setSelectedStudent(s)
                    setSearchText('')
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2"
                >
                  <span className="font-medium text-gray-900">{s.name}</span>
                  <span className="text-xs text-gray-400">{s.student_id}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <FilterSelect label="Batch" value={filters.batch_id}
          onChange={(e) => setFilters(f => ({ ...f, batch_id: e.target.value }))}>
          <option value="">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </FilterSelect>

        <FilterSelect label="Subject" value={filters.subject_id}
          onChange={(e) => setFilters(f => ({ ...f, subject_id: e.target.value }))}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </FilterSelect>

        <FilterInput label="From" type="date" value={filters.date_from}
          onChange={(e) => setFilters(f => ({ ...f, date_from: e.target.value }))} />
        <FilterInput label="To" type="date" value={filters.date_to}
          onChange={(e) => setFilters(f => ({ ...f, date_to: e.target.value }))} />
      </div>

      {!selectedStudent && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center text-blue-700 text-sm">
          Search and select a student above to view their progress report.
        </div>
      )}

      {selectedStudent && (isLoading || isFetching) && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">Loading…</div>
      )}

      {selectedStudent && !isLoading && !isFetching && data && (
        <>
          {/* Student info */}
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base">
              {student?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{student?.name}</p>
              <p className="text-xs text-gray-500">{student?.student_id} · {student?.phone}</p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
            <StatCard label="Total Exams"   value={summary.total_exams} />
            <StatCard label="Appeared"      value={summary.appeared} color="text-blue-600" />
            <StatCard label="Absent"        value={summary.absent_count} color="text-orange-500" />
            <StatCard label="Avg %"         value={summary.avg_percent != null ? `${summary.avg_percent}%` : null} color="text-indigo-600" />
            <StatCard label="Highest %"     value={summary.highest_percent != null ? `${summary.highest_percent}%` : null} color="text-green-600" />
            <StatCard label="Pass"          value={summary.pass_count} color="text-green-700" />
            <StatCard label="Fail"          value={summary.fail_count} color="text-red-500" />
          </div>

          {/* Trend chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Score Trend</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="4 4"
                    label={{ value: 'Pass', position: 'right', fontSize: 10, fill: '#ef4444' }} />
                  <Line
                    type="monotone" dataKey="percent" name="Score %"
                    stroke="#3B82F6" strokeWidth={2}
                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* By-subject summary */}
          {bySubject.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Performance by Subject</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Subject','Exams','Avg %','Highest %','Lowest %'].map(h => (
                      <th key={h} className={`px-4 py-2.5 font-medium text-gray-500 ${h === 'Subject' ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bySubject.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{s.subject_name}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{s.exams_count}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-indigo-600">{s.avg_percent}%</td>
                      <td className="px-4 py-2.5 text-right text-green-600">{s.highest_percent}%</td>
                      <td className="px-4 py-2.5 text-right text-red-500">{s.lowest_percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Full timeline */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Full Timeline ({timeline.length} exams)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Date','Exam','Subject','Batch','Type','Marks','%','Grade','Position','Result'].map(h => (
                      <th key={h} className={`px-3 py-2.5 font-medium text-gray-500 ${['Marks','%'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timeline.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-8 text-gray-400">No exam records.</td></tr>
                  ) : timeline.map((r, i) => (
                    <tr key={i} className={r.is_absent ? 'bg-orange-50' : 'hover:bg-gray-50'}>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{r.exam_date}</td>
                      <td className="px-3 py-2.5 text-gray-900 font-medium">{r.title}</td>
                      <td className="px-3 py-2.5 text-gray-600">{r.subject_name ?? '—'}</td>
                      <td className="px-3 py-2.5 text-gray-600">{r.batch_name ?? '—'}</td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs">{r.exam_type ?? '—'}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-gray-700">
                        {r.is_absent ? <span className="text-orange-500 text-xs">Absent</span>
                          : r.marks_obtained != null ? `${r.marks_obtained}/${r.total_marks}` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold text-indigo-700">
                        {r.percent != null ? `${r.percent}%` : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        {r.grade ? <Badge variant="blue">{r.grade}</Badge> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{r.position ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        {r.is_absent ? <Badge variant="gray">Absent</Badge>
                          : r.is_pass === true  ? <Badge variant="success">Pass</Badge>
                          : r.is_pass === false ? <Badge variant="danger">Fail</Badge>
                          : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Batch Analytics Report ───────────────────────────────────────────────────
function BatchAnalyticsReport({ batches }) {
  const [filters, setFilters] = useState({ batch_id: '', date_from: '', date_to: '' })

  const queryParams = filters.batch_id
    ? Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    : null
  const { data, isLoading, isFetching } = useGetBatchAnalyticsReportQuery(queryParams, { skip: !queryParams })

  const batch      = data?.batch
  const perExam    = data?.per_exam    ?? []
  const perStudent = data?.per_student ?? []
  const summary    = data?.summary     ?? {}

  const chartData = perExam.map(e => ({
    name:     e.title.length > 14 ? e.title.slice(0, 14) + '…' : e.title,
    avg:      e.avg_percent,
    passRate: e.pass_rate,
  }))

  const medalColor = (i) => i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <FilterSelect label="Batch *" value={filters.batch_id}
          onChange={(e) => setFilters(f => ({ ...f, batch_id: e.target.value }))}>
          <option value="">Select a batch…</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </FilterSelect>
        <FilterInput label="From" type="date" value={filters.date_from}
          onChange={(e) => setFilters(f => ({ ...f, date_from: e.target.value }))} />
        <FilterInput label="To" type="date" value={filters.date_to}
          onChange={(e) => setFilters(f => ({ ...f, date_to: e.target.value }))} />
      </div>

      {!filters.batch_id && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center text-blue-700 text-sm">
          Select a batch above to view performance analytics.
        </div>
      )}

      {filters.batch_id && (isLoading || isFetching) && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">Loading…</div>
      )}

      {filters.batch_id && !isLoading && !isFetching && data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Exams"    value={summary.total_exams} />
            <StatCard label="Total Students" value={summary.total_students} color="text-blue-600" />
            <StatCard label="Avg Pass Rate"
              value={summary.avg_pass_rate != null ? `${summary.avg_pass_rate}%` : null}
              color="text-green-600" />
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Exam Performance — {batch?.name}</p>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" width={36} />
                  <Tooltip formatter={(v, n) => [`${v ?? '—'}%`, n]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="avg" name="Avg Score %" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone" dataKey="passRate" name="Pass Rate %"
                    stroke="#10B981" strokeWidth={2}
                    dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Per-exam stats table */}
          {perExam.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Per-Exam Breakdown</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Date','Exam','Subject','Type','Appeared','Absent','Avg %','Pass','Fail','Pass Rate','Highest','Lowest'].map(h => (
                        <th key={h} className={`px-3 py-2.5 font-medium text-gray-500 whitespace-nowrap ${['Date','Exam','Subject','Type'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {perExam.map((e, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{e.exam_date}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-900">{e.title}</td>
                        <td className="px-3 py-2.5 text-gray-600">{e.subject_name ?? '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-500">{e.exam_type ?? '—'}</td>
                        <td className="px-3 py-2.5 text-right text-gray-700">{e.appeared}</td>
                        <td className="px-3 py-2.5 text-right text-orange-500">{e.absent}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-indigo-600">{e.avg_percent ?? '—'}{e.avg_percent != null ? '%' : ''}</td>
                        <td className="px-3 py-2.5 text-right text-green-600 font-medium">{e.pass_count}</td>
                        <td className="px-3 py-2.5 text-right text-red-500">{e.appeared - e.pass_count}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-blue-700">{e.pass_rate != null ? `${e.pass_rate}%` : '—'}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600">{e.highest != null ? `${e.highest}/${e.total_marks}` : '—'}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600">{e.lowest != null ? `${e.lowest}/${e.total_marks}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top students leaderboard */}
          {perStudent.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <p className="text-sm font-semibold text-gray-700">Student Leaderboard</p>
                <span className="text-xs text-gray-400 ml-auto">Sorted by avg score</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-12">#</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Student</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Appeared</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Avg %</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Highest %</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Pass</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Fail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {perStudent.map((s, i) => (
                    <tr key={i} className={i < 3 ? 'bg-yellow-50/40' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          {i < 3
                            ? <Trophy className={`h-4 w-4 ${medalColor(i)}`} />
                            : <span className="text-xs text-gray-400 w-4 text-center">{i + 1}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.student_id}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{s.exams_appeared}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-indigo-600">
                        {s.avg_percent != null ? `${s.avg_percent}%` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-green-600">
                        {s.highest_percent != null ? `${s.highest_percent}%` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-green-700 font-medium">{s.pass_count}</td>
                      <td className="px-4 py-2.5 text-right text-red-500">{s.fail_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {perExam.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
              No exams found for this batch in the selected date range.
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Profit & Loss Report ─────────────────────────────────────────────────────
function ProfitLossReport() {
  const [filters, setFilters] = useState({ date_from: monthStart(), date_to: today() })

  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  const { data, isLoading, isFetching } = useGetProfitLossReportQuery(params)

  const income   = data?.income   ?? {}
  const salary   = data?.salary   ?? {}
  const expenses = data?.expenses ?? {}
  const summary  = data?.summary  ?? {}

  const netColor = summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'

  const pieData = [
    { name: 'Salary',   value: summary.total_salary   ?? 0, color: '#10B981' },
    { name: 'Expenses', value: summary.total_expenses ?? 0, color: '#EF4444' },
  ].filter(d => d.value > 0)

  const byCategory = expenses?.by_category ?? []

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <FilterInput label="From" type="date" value={filters.date_from}
          onChange={(e) => setFilters(f => ({ ...f, date_from: e.target.value }))} />
        <FilterInput label="To" type="date" value={filters.date_to}
          onChange={(e) => setFilters(f => ({ ...f, date_to: e.target.value }))} />
        {(isLoading || isFetching) && (
          <div className="ml-auto flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}
      </div>

      {/* P&L Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Income"    value={formatCurrency(summary.total_income   ?? 0)} color="text-green-600" />
        <StatCard label="Total Salary"    value={formatCurrency(summary.total_salary   ?? 0)} color="text-orange-500" />
        <StatCard label="Other Expenses"  value={formatCurrency(summary.total_expenses ?? 0)} color="text-red-500" />
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">Net Profit</p>
          <p className={`text-2xl font-bold ${netColor}`}>{formatCurrency(summary.net_profit ?? 0)}</p>
          {summary.profit_margin != null && (
            <p className={`text-xs mt-0.5 ${netColor}`}>{summary.profit_margin}% margin</p>
          )}
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Income breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Income Breakdown</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-500">Fee Type</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(income.by_fee_type ?? []).length === 0 ? (
                  <tr><td colSpan={2} className="text-center py-6 text-gray-400">No income in period.</td></tr>
                ) : (income.by_fee_type ?? []).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 capitalize text-gray-700">{r.label}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-green-700">
                      {formatCurrency(r.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-gray-700">Total</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-green-700">
                    {formatCurrency(income.total ?? 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Cost breakdown with pie */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Cost Structure</p>
            {pieData.length > 0 && (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%" outerRadius={64}
                    dataKey="value" nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                  Salary ({salary.count ?? 0} payments)
                </span>
                <span className="font-mono font-semibold text-orange-600">
                  {formatCurrency(salary.total ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
                  Other Expenses ({expenses.count ?? 0} entries)
                </span>
                <span className="font-mono font-semibold text-red-600">
                  {formatCurrency(expenses.total ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold border-t border-gray-100 pt-1.5">
                <span className="text-gray-700">Total Costs</span>
                <span className="font-mono text-gray-900">{formatCurrency(summary.total_costs ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense by category */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Expenses by Category</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Category</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-500">Entries</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-500">Total</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-500">% of Expenses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {byCategory.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.category_name}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{c.count}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-red-600">
                    {formatCurrency(c.total)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500">
                    {expenses.total > 0 ? `${((c.total / expenses.total) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Salary by month */}
      {(salary.by_month ?? []).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Salary Payments by Month</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Month</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-500">Payments</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salary.by_month.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-gray-700">{m.month}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{m.count}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-orange-600">
                    {formatCurrency(m.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!data && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          Select a date range to generate the P&amp;L report.
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('collection')

  const { data: batchesData } = useGetBatchesQuery({ per_page: 200 })
  const batches = batchesData?.data ?? []

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Generate and print reports for collections, dues, attendance, students, and exam analytics.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'collection' && <CollectionReport batches={batches} />}
      {activeTab === 'dues'       && <DuesReport batches={batches} />}
      {activeTab === 'attendance' && <AttendanceReport batches={batches} />}
      {activeTab === 'students'   && <StudentListReport batches={batches} />}
      {activeTab === 'progress'   && <StudentProgressReport batches={batches} />}
      {activeTab === 'analytics'  && <BatchAnalyticsReport batches={batches} />}
      {activeTab === 'pl'         && <ProfitLossReport />}
    </div>
  )
}
