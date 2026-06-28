import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatCurrency'
import { usePaySalaryMutation } from '@/features/teachers/teacherApi'

export function SalaryModal({ open, onClose, teacher }) {
  const today        = new Date().toISOString().slice(0, 10)
  const currentMonth = new Date().toISOString().slice(0, 7)

  // base_salary is locked to the employee profile — not part of the form
  const baseSalary = parseFloat(teacher?.profile?.base_salary ?? 0)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      month:          currentMonth,
      bonus:          '',
      deduction:      '',
      amount_paid:    '',
      payment_method: 'cash',
      payment_date:   today,
      note:           '',
    },
  })

  const bonus      = parseFloat(watch('bonus') || 0)
  const deduction  = parseFloat(watch('deduction') || 0)
  const netSalary  = Math.max(0, baseSalary + bonus - deduction)

  const [paySalary, { isLoading }] = usePaySalaryMutation()

  useEffect(() => {
    if (!open || !teacher) return
    const remaining = teacher.remaining ?? baseSalary
    reset({
      month:          currentMonth,
      bonus:          '',
      deduction:      '',
      amount_paid:    remaining > 0 ? remaining : '',
      payment_method: 'cash',
      payment_date:   today,
      note:           '',
    })
  }, [open, teacher]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (data) => {
    try {
      const result = await paySalary({
        user_id:        teacher.id,
        month:          data.month,
        base_salary:    baseSalary,           // always from profile, never editable
        bonus:          parseFloat(data.bonus || 0),
        deduction:      parseFloat(data.deduction || 0),
        amount_paid:    parseFloat(data.amount_paid),
        payment_method: data.payment_method,
        payment_date:   data.payment_date,
        note:           data.note || null,
      }).unwrap()
      toast.success(`Salary paid — Receipt ${result.data.receipt_no}`)
      handleClose()
    } catch (err) {
      const firstError = err?.data?.errors
        ? Object.values(err.data.errors)[0]?.[0]
        : null
      toast.error(firstError ?? err?.data?.message ?? 'Failed to record salary payment')
    }
  }

  if (!teacher) return null

  return (
    <Modal open={open} onClose={handleClose} title={`Pay Salary — ${teacher.name}`} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Read-only salary summary */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Base Salary</p>
            <p className="font-semibold text-gray-900">{formatCurrency(baseSalary)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Net Salary</p>
            <p className="font-semibold text-gray-900">{formatCurrency(netSalary)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Remaining</p>
            <p className="font-semibold text-red-600">
              {teacher.remaining != null ? formatCurrency(teacher.remaining) : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Month"
            type="month"
            {...register('month', { required: 'Month is required' })}
            error={errors.month?.message}
          />
          <Input
            label="Amount Paid (৳)"
            type="number"
            min="0.01"
            step="0.01"
            {...register('amount_paid', {
              required:     'Amount paid is required',
              min:          { value: 0.01, message: 'Amount must be greater than 0' },
              valueAsNumber: true,
            })}
            error={errors.amount_paid?.message}
          />
          <Input
            label="Bonus (৳)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            {...register('bonus')}
          />
          <Input
            label="Deduction (৳)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            {...register('deduction')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Payment Method" {...register('payment_method', { required: true })}>
            <option value="cash">Cash</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="bank_transfer">Bank Transfer</option>
          </Select>
          <Input
            label="Payment Date"
            type="date"
            {...register('payment_date', { required: 'Payment date is required' })}
            error={errors.payment_date?.message}
          />
        </div>

        <Input
          label="Note (optional)"
          placeholder="Any remarks…"
          {...register('note')}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Record Payment</Button>
        </div>
      </form>
    </Modal>
  )
}
