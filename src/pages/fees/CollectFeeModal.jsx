import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Search, User, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency } from '@/utils/formatCurrency'
import { useGetStudentsQuery } from '@/features/students/studentApi'
import { useGetBatchesQuery } from '@/features/batches/batchApi'
import { useCollectFeeMutation } from '@/features/fees/feeApi'

export function CollectFeeModal({ open, onClose, onSuccess, defaultStudent = null, defaultBatchId = null }) {
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(defaultStudent)
  const [showDropdown, setShowDropdown] = useState(false)
  const debouncedSearch = useDebounce(studentSearch, 300)

  const today = new Date().toISOString().slice(0, 10)
  const currentMonth = new Date().toISOString().slice(0, 7)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      student_id: defaultStudent?.id ?? '',
      batch_id: defaultBatchId ?? '',
      fee_type: 'monthly',
      month: currentMonth,
      amount_due: '',
      discount_amount: '',
      scholarship_amount: '',
      amount_paid: '',
      payment_method: 'cash',
      payment_date: today,
      note: '',
    },
  })

  const feeType = watch('fee_type')
  const batchId = watch('batch_id')
  const amountDue = parseFloat(watch('amount_due') || 0)
  const discountAmount = parseFloat(watch('discount_amount') || 0)
  const scholarshipAmount = parseFloat(watch('scholarship_amount') || 0)
  const netPayable = Math.max(0, amountDue - discountAmount - scholarshipAmount)

  const { data: studentsData, isFetching: searchingStudents } = useGetStudentsQuery(
    { search: debouncedSearch, per_page: 8, status: 'active' },
    { skip: !debouncedSearch || !!selectedStudent },
  )
  const { data: batchesData } = useGetBatchesQuery({ status: 'active', per_page: 100 })
  const [collectFee, { isLoading }] = useCollectFeeMutation()

  // Auto-fill amount_due from selected batch's fee_amount
  useEffect(() => {
    if (!batchId || !batchesData?.data) return
    const batch = batchesData.data.find((b) => b.id === parseInt(batchId))
    if (batch?.fee_amount) setValue('amount_due', batch.fee_amount)
  }, [batchId, batchesData, setValue])

  // Sync when opened with pre-filled student/batch (from Dues tab)
  useEffect(() => {
    if (!open) return
    if (defaultStudent) {
      setSelectedStudent(defaultStudent)
      setValue('student_id', defaultStudent.id)
    }
    if (defaultBatchId) setValue('batch_id', defaultBatchId)
  }, [open, defaultStudent, defaultBatchId, setValue])

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    setValue('student_id', student.id, { shouldValidate: true })
    setStudentSearch('')
    setShowDropdown(false)
  }

  const handleClearStudent = () => {
    setSelectedStudent(null)
    setValue('student_id', '')
    setStudentSearch('')
  }

  const handleClose = () => {
    reset()
    setSelectedStudent(null)
    setStudentSearch('')
    onClose()
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        student_id: parseInt(data.student_id),
        batch_id: parseInt(data.batch_id),
        fee_type: data.fee_type,
        month: data.fee_type === 'monthly' ? data.month : null,
        amount_due: parseFloat(data.amount_due),
        discount_amount: parseFloat(data.discount_amount || 0),
        scholarship_amount: parseFloat(data.scholarship_amount || 0),
        amount_paid: parseFloat(data.amount_paid),
        payment_method: data.payment_method,
        payment_date: data.payment_date,
        note: data.note || null,
      }
      const result = await collectFee(payload).unwrap()
      toast.success(`Receipt ${result.data.receipt_no} generated`)
      handleClose()
      onSuccess?.(result.data)
    } catch (err) {
      const firstError = err?.data?.errors
        ? Object.values(err.data.errors)[0]?.[0]
        : null
      toast.error(firstError ?? err?.data?.message ?? 'Failed to collect fee')
    }
  }

  const batches = batchesData?.data ?? []
  const studentResults = studentsData?.data ?? []

  return (
    <Modal open={open} onClose={handleClose} title="Collect Fee" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Student search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student <span className="text-red-500">*</span>
          </label>
          <input type="hidden" {...register('student_id', { required: 'Student is required' })} />

          {selectedStudent ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900">{selectedStudent.name}</p>
                <p className="text-xs text-gray-500 font-mono">{selectedStudent.student_id}</p>
              </div>
              <button type="button" onClick={handleClearStudent} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search student by name or ID..."
                value={studentSearch}
                onChange={(e) => { setStudentSearch(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showDropdown && debouncedSearch && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {searchingStudents ? (
                    <p className="px-4 py-3 text-sm text-gray-500">Searching…</p>
                  ) : studentResults.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">No students found</p>
                  ) : studentResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={() => handleSelectStudent(s)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex flex-col"
                    >
                      <span className="text-sm font-medium text-gray-900">{s.name}</span>
                      <span className="text-xs text-gray-500 font-mono">{s.student_id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {errors.student_id && <p className="mt-1 text-xs text-red-600">{errors.student_id.message}</p>}
        </div>

        {/* Batch + Fee Type */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Batch"
            {...register('batch_id', { required: 'Batch is required' })}
            error={errors.batch_id?.message}
          >
            <option value="">Select batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>

          <Select label="Fee Type" {...register('fee_type', { required: true })}>
            <option value="monthly">Monthly Fee</option>
            <option value="admission">Admission Fee</option>
            <option value="exam">Exam Fee</option>
            <option value="other">Other</option>
          </Select>
        </div>

        {/* Month (monthly only) */}
        {feeType === 'monthly' && (
          <Input
            label="Month"
            type="month"
            {...register('month', { required: 'Month is required' })}
            error={errors.month?.message}
          />
        )}

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Amount Due (৳)"
            type="number"
            min="0"
            step="0.01"
            {...register('amount_due', {
              required: 'Amount due is required',
              min: { value: 0, message: 'Must be ≥ 0' },
            })}
            error={errors.amount_due?.message}
          />
          <Input
            label="Discount (৳)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            {...register('discount_amount')}
          />
          <Input
            label="Scholarship (৳)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            {...register('scholarship_amount')}
          />
        </div>

        {/* Net payable */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-600">Net Payable</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(netPayable)}</span>
        </div>

        {/* Paid + Method */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount Paid (৳)"
            type="number"
            min="0"
            step="0.01"
            {...register('amount_paid', {
              required: 'Amount paid is required',
              min: { value: 0, message: 'Must be ≥ 0' },
            })}
            error={errors.amount_paid?.message}
          />
          <Select label="Payment Method" {...register('payment_method', { required: true })}>
            <option value="cash">Cash</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="bank_transfer">Bank Transfer</option>
          </Select>
        </div>

        {/* Date + Note */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Payment Date"
            type="date"
            {...register('payment_date', { required: 'Payment date is required' })}
            error={errors.payment_date?.message}
          />
          <Input
            label="Note (optional)"
            placeholder="Any remarks…"
            {...register('note')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Collect Fee</Button>
        </div>
      </form>
    </Modal>
  )
}
