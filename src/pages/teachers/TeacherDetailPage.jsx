import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, DollarSign, BookOpen, Phone, Mail, MapPin, Calendar, Award } from 'lucide-react'
import { useGetTeacherQuery, useGetSalariesQuery } from '@/features/teachers/teacherApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { TeacherFormModal } from './TeacherFormModal'
import { SalaryModal } from './SalaryModal'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

function ProfileRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default function TeacherDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [salaryOpen, setSalaryOpen] = useState(false)
  const [salaryPage, setSalaryPage] = useState(1)

  const { data, isLoading } = useGetTeacherQuery(id)
  const teacher = data?.data

  const { data: salariesData, isLoading: salariesLoading } = useGetSalariesQuery(
    { user_id: id, per_page: 10, page: salaryPage },
    { skip: !id },
  )
  const salaries = salariesData?.data ?? []

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  if (!teacher) {
    return <div className="p-6"><p className="text-gray-500">Teacher not found.</p></div>
  }

  const METHOD_LABELS = {
    cash: 'Cash', bkash: 'bKash', nagad: 'Nagad',
    rocket: 'Rocket', bank_transfer: 'Bank Transfer',
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{teacher.name}</h2>
          {teacher.profile?.subject && (
            <p className="text-sm text-gray-500 mt-0.5">{teacher.profile.subject}</p>
          )}
        </div>
        <Badge variant={teacher.is_active ? 'success' : 'gray'}>
          {teacher.is_active ? 'Active' : 'Inactive'}
        </Badge>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button onClick={() => setSalaryOpen(true)}>
          <DollarSign className="h-4 w-4" />
          Pay Salary
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Profile */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Teacher Details</h3>
          <ProfileRow icon={Mail}     label="Email"          value={teacher.email} />
          <ProfileRow icon={Phone}    label="Phone"          value={teacher.phone} />
          <ProfileRow icon={Award}    label="Qualification"  value={teacher.profile?.qualification} />
          <ProfileRow icon={Calendar} label="Join Date"      value={formatDate(teacher.profile?.join_date)} />
          <ProfileRow icon={DollarSign} label="Base Salary"  value={teacher.profile?.base_salary ? formatCurrency(teacher.profile.base_salary) : null} />
          <ProfileRow icon={MapPin}   label="Address"        value={teacher.profile?.address} />
        </div>

        {/* Assigned Batches */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            Assigned Batches
            <span className="ml-auto text-xs font-normal text-gray-400">
              {teacher.batches?.length ?? 0} batch{(teacher.batches?.length ?? 0) !== 1 ? 'es' : ''}
            </span>
          </h3>
          {(!teacher.batches || teacher.batches.length === 0) ? (
            <p className="text-sm text-gray-400">No batches assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {teacher.batches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => navigate(`/batches/${batch.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{batch.name}</p>
                    {batch.subject && <p className="text-xs text-gray-500">{batch.subject}</p>}
                  </div>
                  <Badge variant={batch.status === 'active' ? 'success' : 'gray'} className="text-xs">
                    {batch.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Salary History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Salary History</h3>
          <Button size="sm" onClick={() => setSalaryOpen(true)}>
            <DollarSign className="h-3.5 w-3.5" />
            Pay Salary
          </Button>
        </div>

        {salariesLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : salaries.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No salary payments recorded.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Receipt</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Month</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Base</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Bonus</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Deduction</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Net</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Paid</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Method</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salaries.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.receipt_no}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{s.month}</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-700">{formatCurrency(s.base_salary)}</td>
                      <td className="px-4 py-3 text-right font-mono text-green-600">
                        {s.bonus > 0 ? `+${formatCurrency(s.bonus)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-red-500">
                        {s.deduction > 0 ? `-${formatCurrency(s.deduction)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">{formatCurrency(s.net_salary)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-blue-700">{formatCurrency(s.amount_paid)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="gray">{METHOD_LABELS[s.payment_method] ?? s.payment_method}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(s.payment_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <Pagination meta={salariesData?.meta} onPageChange={setSalaryPage} />
            </div>
          </>
        )}
      </div>

      <TeacherFormModal open={editOpen} onClose={() => setEditOpen(false)} teacher={teacher} />
      <SalaryModal open={salaryOpen} onClose={() => setSalaryOpen(false)} teacher={teacher} />
    </div>
  )
}
