import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCreateBatchMutation, useUpdateBatchMutation } from '@/features/batches/batchApi'
import { useGetBranchesQuery } from '@/features/branches/branchApi'
import { useGetTeachersQuery } from '@/features/teachers/teacherApi'

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export function BatchFormModal({ open, onClose, batch }) {
  const isEdit = !!batch

  const [createBatch, { isLoading: creating }] = useCreateBatchMutation()
  const [updateBatch, { isLoading: updating }] = useUpdateBatchMutation()
  const isLoading = creating || updating

  const { data: branchesData } = useGetBranchesQuery()
  const branches = (branchesData?.data ?? []).filter((b) => b.is_active)

  const { data: teachersData } = useGetTeachersQuery({ per_page: 200, is_active: 1 })
  const teachers = teachersData?.data ?? []

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      branch_id: '',
      teacher_id: '',
      subject: '',
      capacity: 30,
      fee_amount: '',
      start_date: '',
      status: 'active',
      schedule: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'schedule' })

  useEffect(() => {
    if (open) {
      reset(
        batch
          ? {
              name:       batch.name ?? '',
              branch_id:  batch.branch_id ?? '',
              teacher_id: batch.teacher_id ?? '',
              subject:    batch.subject ?? '',
              capacity:   batch.capacity ?? 30,
              fee_amount: batch.fee_amount ?? '',
              start_date: batch.start_date ?? '',
              status:     batch.status ?? 'active',
              schedule:   batch.schedule ?? [],
            }
          : { name: '', branch_id: '', teacher_id: '', subject: '', capacity: 30, fee_amount: '', start_date: '', status: 'active', schedule: [] },
      )
    }
  }, [open, batch, reset])

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      branch_id:  data.branch_id ? parseInt(data.branch_id, 10) : undefined,
      teacher_id: data.teacher_id ? parseInt(data.teacher_id, 10) : null,
      capacity:   parseInt(data.capacity, 10),
      fee_amount: parseFloat(data.fee_amount) || 0,
      schedule:   data.schedule.length ? data.schedule : undefined,
    }

    try {
      if (isEdit) {
        await updateBatch({ id: batch.id, ...payload }).unwrap()
        toast.success('Batch updated successfully.')
      } else {
        await createBatch(payload).unwrap()
        toast.success('Batch created successfully.')
      }
      onClose()
    } catch (err) {
      const firstError = err?.data?.errors
        ? Object.values(err.data.errors)[0]?.[0]
        : null
      toast.error(firstError ?? err?.data?.message ?? 'Something went wrong.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Batch' : 'Create New Batch'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Batch Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  label="Batch Name *"
                  placeholder="e.g. SSC 2026 Batch A"
                  error={errors.name?.message}
                  {...register('name', { required: 'Batch name is required' })}
                />
              </div>
              {branches.length > 0 && (
                <Select label="Branch" {...register('branch_id')}>
                  <option value="">No Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Select>
              )}
              <Select label="Teacher" {...register('teacher_id')}>
                <option value="">Unassigned</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
              <Input
                label="Subject"
                placeholder="e.g. Science, Commerce"
                error={errors.subject?.message}
                {...register('subject')}
              />
              <Input
                label="Start Date *"
                type="date"
                error={errors.start_date?.message}
                {...register('start_date', { required: 'Start date is required' })}
              />
              <Input
                label="Capacity *"
                type="number"
                min={1}
                error={errors.capacity?.message}
                {...register('capacity', { required: 'Capacity is required', min: { value: 1, message: 'Min 1' } })}
              />
              <Input
                label="Monthly Fee (৳) *"
                type="number"
                min={0}
                placeholder="1500"
                error={errors.fee_amount?.message}
                {...register('fee_amount', { required: 'Fee amount is required' })}
              />
              <Select
                label="Status"
                {...register('status')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Schedule
              </h3>
              <button
                type="button"
                onClick={() => append({ day: 'Saturday', start_time: '08:00', end_time: '10:00' })}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Day
              </button>
            </div>

            {fields.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No schedule added. Click "Add Day" to set class days.</p>
            ) : (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                    <Select
                      label={index === 0 ? 'Day' : undefined}
                      error={errors.schedule?.[index]?.day?.message}
                      {...register(`schedule.${index}.day`, { required: true })}
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Select>
                    <Input
                      label={index === 0 ? 'Start Time' : undefined}
                      type="time"
                      error={errors.schedule?.[index]?.start_time?.message}
                      {...register(`schedule.${index}.start_time`, { required: true })}
                    />
                    <Input
                      label={index === 0 ? 'End Time' : undefined}
                      type="time"
                      error={errors.schedule?.[index]?.end_time?.message}
                      {...register(`schedule.${index}.end_time`, { required: true })}
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 mb-0.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Batch'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
