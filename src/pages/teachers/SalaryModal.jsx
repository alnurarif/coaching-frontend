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
  const today = new Date().toISOString().slice(0, 10)
  const currentMonth = new Date().toISOString().slice(0, 7)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      month:          currentMonth,
      base_salary:    '',
      bonus:          '',
      deduction:      '',
      amount_paid:    '',
      payment_method: 'cash',
      payment_date:   today,
      note:           '',
    },
  })

  const baseSalary   = parseFloat(watch('base_salary') || 0)
  const bonus        = parseFloat(watch('bonus') || 0)
  const deduction    = parseFloat(watch('deduction') || 0)
  const netSalary    = Math.max(0, baseSalary + bonus - deduction)

  const [paySalary, { isLoading }] = usePaySalaryMutation()

  // Pre-fill base_salary from teacher profile when modal opens
  useEffect(() => {
    if (!open || !teacher) return
    reset({
      month:          currentMonth,
      base_salary:    teacher.profile?.base_salary ?? '',
      bonus:          '',
      deduction:      '',
      amount_paid:    teacher.profile?.base_salary ?? '',
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
        base_salary:    parseFloat(data.base_salary),
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
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Month"
            type="month"
            {...register('month', { required: 'Month is required' })}
            error={errors.month?.message}
          />
          <Input
            label="Base Salary (৳)"
            type="number"
            min="0"
            step="0.01"
            {...register('base_salary', { required: 'Base salary is required', min: { value: 0, message: 'Must be ≥ 0' } })}
            error={errors.base_salary?.message}
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

        {/* Net salary display */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-600">Net Salary</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(netSalary)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount Paid (৳)"
            type="number"
            min="0"
            step="0.01"
            {...register('amount_paid', { required: 'Amount paid is required', min: { value: 0, message: 'Must be ≥ 0' } })}
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
          <Button type="submit" isLoading={isLoading}>Record Payment</Button>
        </div>
      </form>
    </Modal>
  )
}
