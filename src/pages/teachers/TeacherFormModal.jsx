import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCreateTeacherMutation, useUpdateTeacherMutation } from '@/features/teachers/teacherApi'

export function TeacherFormModal({ open, onClose, teacher }) {
  const isEdit = !!teacher

  const [createTeacher, { isLoading: creating }] = useCreateTeacherMutation()
  const [updateTeacher, { isLoading: updating }] = useUpdateTeacherMutation()
  const isLoading = creating || updating

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      is_active: true,
      subject: '',
      qualification: '',
      address: '',
      join_date: '',
      base_salary: '',
    },
  })

  useEffect(() => {
    if (!open) return
    if (teacher) {
      reset({
        name:          teacher.name ?? '',
        email:         teacher.email ?? '',
        phone:         teacher.phone ?? '',
        password:      '',
        is_active:     teacher.is_active ?? true,
        subject:       teacher.profile?.subject ?? '',
        qualification: teacher.profile?.qualification ?? '',
        address:       teacher.profile?.address ?? '',
        join_date:     teacher.profile?.join_date ?? '',
        base_salary:   teacher.profile?.base_salary ?? '',
      })
    } else {
      reset()
    }
  }, [open, teacher, reset])

  const onSubmit = async (data) => {
    const payload = {
      name:          data.name,
      email:         data.email,
      phone:         data.phone || undefined,
      subject:       data.subject || undefined,
      qualification: data.qualification || undefined,
      address:       data.address || undefined,
      join_date:     data.join_date || undefined,
      base_salary:   data.base_salary ? parseFloat(data.base_salary) : undefined,
    }

    if (!isEdit) {
      payload.password = data.password
    } else {
      if (data.password) payload.password = data.password
      // Select option values are always strings; convert to boolean for backend
      payload.is_active = data.is_active === true || data.is_active === 'true' || data.is_active === 1
    }

    try {
      if (isEdit) {
        await updateTeacher({ id: teacher.id, ...payload }).unwrap()
        toast.success('Teacher updated successfully.')
      } else {
        await createTeacher(payload).unwrap()
        toast.success('Teacher account created.')
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
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Teacher' : 'Add Teacher'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6">
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Account
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  label="Full Name *"
                  placeholder="e.g. Rahim Uddin"
                  error={errors.name?.message}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              <Input
                label="Email *"
                type="email"
                placeholder="teacher@example.com"
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })}
              />
              <Input
                label="Phone"
                placeholder="01XXXXXXXXX"
                {...register('phone')}
              />
              <Input
                label={isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
                type="password"
                placeholder="Min 8 characters"
                error={errors.password?.message}
                {...register('password', {
                  required: isEdit ? false : 'Password is required',
                  minLength: { value: 8, message: 'Min 8 characters' },
                })}
              />
              {isEdit && (
                <Select label="Status" {...register('is_active')}>
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </Select>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Profile
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Subject Specialization"
                placeholder="e.g. Math, Physics"
                {...register('subject')}
              />
              <Input
                label="Qualification"
                placeholder="e.g. B.Sc. Physics"
                {...register('qualification')}
              />
              <Input
                label="Join Date"
                type="date"
                {...register('join_date')}
              />
              <Input
                label="Base Salary (৳)"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 15000"
                {...register('base_salary')}
              />
              <div className="col-span-2">
                <Input
                  label="Address"
                  placeholder="Full address"
                  {...register('address')}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Add Teacher'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
