import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Users, GraduationCap, BookOpen, CalendarCheck,
  DollarSign, TrendingUp, TrendingDown, AlertCircle,
  UserPlus, ClipboardList, ArrowRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useGetDashboardQuery } from '@/features/dashboard/dashboardApi'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { Badge } from '@/components/ui/Badge'

const METHOD_LABELS = {
  cash: 'Cash', bkash: 'bKash', nagad: 'Nagad',
  rocket: 'Rocket', bank_transfer: 'Bank',
}

const STATUS_COLORS = {
  draft:     'gray',
  published: 'blue',
  completed: 'success',
}

function StatCard({ icon: Icon, label, value, sub, color = 'blue', onClick }) {
  const colorMap = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    teal:   'bg-teal-50 text-teal-600',
    rose:   'bg-rose-50 text-rose-600',
  }
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:border-blue-300 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className={`p-3 rounded-lg shrink-0 ${colorMap[color] ?? colorMap.blue}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

function NetProfitCard({ value, month }) {
  const isProfit = value >= 0
  return (
    <div className={`rounded-xl border-2 p-5 flex items-center gap-4 ${isProfit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className={`p-3 rounded-lg ${isProfit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {isProfit ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
      </div>
      <div>
        <p className="text-xs text-gray-500">Net Profit · {month}</p>
        <p className={`text-2xl font-bold leading-tight ${isProfit ? 'text-green-700' : 'text-red-600'}`}>
          {formatCurrency(value)}
        </p>
        <p className="text-xs mt-0.5 text-gray-400">Income − Salary − Expenses</p>
      </div>
    </div>
  )
}

function SectionHeader({ title, linkLabel, onLink }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {onLink && (
        <button
          type="button"
          onClick={onLink}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

const chartTooltipFormatter = (value, name) => [
  formatCurrency(value),
  name === 'income' ? 'Income' : 'Costs',
]

export default function DashboardPage() {
  const user = useSelector(selectCurrentUser)
  const navigate = useNavigate()
  const { data, isLoading } = useGetDashboardQuery()
  const d = data?.data

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const currentMonth = new Date().toLocaleString('en-BD', { month: 'long', year: 'numeric' })

  const permissions   = new Set(user?.permissions ?? [])
  const canViewFinance     = permissions.has('reports.financial') || user?.roles?.includes('owner')
  const canViewFees        = permissions.has('fees.view')
  const canViewAttendance  = permissions.has('attendance.view')
  const canViewExams       = permissions.has('exams.view')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {greeting}, {user?.name?.split(' ')[0]}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {user?.tenant?.name} · {new Date().toLocaleDateString('en-BD', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* ── Row 1: Operations ───────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Operations</p>
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users} label="Active Students"
              value={d?.total_students ?? 0}
              sub={d?.new_admissions > 0 ? `+${d.new_admissions} new this month` : 'No new this month'}
              color="blue"
              onClick={() => navigate('/students')}
            />
            <StatCard
              icon={BookOpen} label="Active Batches"
              value={d?.active_batches ?? 0}
              color="purple"
              onClick={() => navigate('/batches')}
            />
            <StatCard
              icon={GraduationCap} label="Teachers"
              value={d?.teachers_count ?? 0}
              sub="Active"
              color="teal"
              onClick={() => navigate('/teachers')}
            />
            <StatCard
              icon={CalendarCheck} label="Today's Attendance"
              value={d?.today_attendance != null ? `${d.today_attendance}%` : 'Not marked'}
              sub="Present rate"
              color={d?.today_attendance >= 75 ? 'green' : d?.today_attendance != null ? 'orange' : 'blue'}
              onClick={() => navigate('/attendance')}
            />
          </div>
        )}
      </div>

      {/* ── Row 2: Monthly Finances (financial roles only) ──────────────────── */}
      {(canViewFinance || canViewFees) && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Finances — {currentMonth}
          </p>
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: canViewFinance ? 4 : 1 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-24 animate-pulse" />
              ))}
            </div>
          ) : canViewFinance ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={DollarSign} label="Month Income"
                value={formatCurrency(d?.month_collections ?? 0)}
                sub={`Today: ${formatCurrency(d?.today_collections ?? 0)}`}
                color="green"
                onClick={() => navigate('/fees')}
              />
              <StatCard
                icon={TrendingDown} label="Month Expenses"
                value={formatCurrency((d?.month_expenses ?? 0) + (d?.month_salary ?? 0))}
                sub={`Salary ${formatCurrency(d?.month_salary ?? 0)} + Other ${formatCurrency(d?.month_expenses ?? 0)}`}
                color="rose"
                onClick={() => navigate('/expenses')}
              />
              <NetProfitCard
                value={d?.month_net ?? 0}
                month={new Date().toLocaleString('en-BD', { month: 'short' })}
              />
              <StatCard
                icon={AlertCircle} label="Outstanding Dues"
                value={formatCurrency(d?.outstanding_amount ?? 0)}
                sub={`${d?.outstanding_dues ?? 0} pending records`}
                color="red"
                onClick={() => navigate('/fees')}
              />
            </div>
          ) : (
            /* Receptionist: today's collection only */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={DollarSign} label="Today's Collections"
                value={formatCurrency(d?.today_collections ?? 0)}
                color="green"
                onClick={() => navigate('/fees')}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Row 3: Trend chart + Upcoming exams ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 6-month trend chart (financial roles only) */}
        {canViewFinance && (
        <div className="bg-white rounded-xl border border-gray-200">
          <SectionHeader
            title="6-Month Income vs Costs"
            linkLabel="View P&L"
            onLink={() => navigate('/reports')}
          />
          <div className="p-5">
            {isLoading ? (
              <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
            ) : (d?.trend ?? []).every(t => t.income === 0 && t.costs === 0) ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No financial data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={d?.trend ?? []} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    width={36}
                  />
                  <Tooltip formatter={chartTooltipFormatter} />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(v) => v === 'income' ? 'Income' : 'Costs'}
                  />
                  <Bar dataKey="income" fill="#86EFAC" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="costs"  fill="#FCA5A5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        )}

        {/* Upcoming exams (roles with exams.view) */}
        {canViewExams && <div className="bg-white rounded-xl border border-gray-200">
          <SectionHeader
            title="Upcoming Exams"
            linkLabel="All exams"
            onLink={() => navigate('/exams')}
          />
          {isLoading ? (
            <table className="w-full text-sm">
              <tbody>{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={4} />)}</tbody>
            </table>
          ) : !(d?.upcoming_exams?.length) ? (
            <div className="py-10 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
              <ClipboardList className="h-8 w-8 text-gray-200" />
              No upcoming exams scheduled.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Date</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Exam</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Batch</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {d.upcoming_exams.map((e) => (
                    <tr
                      key={e.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/exams/${e.id}`)}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                        {e.exam_date}
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-900 truncate max-w-[140px]">{e.title}</p>
                        {e.subject_name && (
                          <p className="text-xs text-gray-400">{e.subject_name}</p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 truncate max-w-[100px]">
                        {e.batch_name ?? '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={STATUS_COLORS[e.status] ?? 'gray'}>
                          {e.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>}
      </div>

      {/* ── Row 4: Recent Collections (financial roles only) ────────────────── */}
      {canViewFinance && <div className="bg-white rounded-xl border border-gray-200">
        <SectionHeader
          title="Recent Collections"
          linkLabel="View all"
          onLink={() => navigate('/fees')}
        />
        {isLoading ? (
          <table className="w-full text-sm">
            <tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)}</tbody>
          </table>
        ) : !d?.recent_collections?.length ? (
          <div className="py-10 text-center text-gray-400 text-sm">No collections yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Receipt</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Batch</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Method</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {d.recent_collections.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.receipt_no}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.student_name}</p>
                      <p className="text-xs text-gray-400">{c.student_sid}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.batch_name ?? '—'}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{c.fee_type}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-blue-700">
                      {formatCurrency(c.amount_paid)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="gray">{METHOD_LABELS[c.payment_method] ?? c.payment_method}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.payment_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>}
    </div>
  )
}
