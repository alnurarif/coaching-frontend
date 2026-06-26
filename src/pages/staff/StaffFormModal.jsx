import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCreateStaffMutation, useUpdateStaffMutation } from '@/features/staff/staffApi'

const ROLES = [
  { value: 'manager',      label: 'Manager' },
  { value: 'accountant',   label: 'Accountant' },
  { value: 'receptionist', label: 'Receptionist' },
]

export function StaffFormModal({ open, onClose, staff }) {
  const isEdit = !!staff

  const [createStaff, { isLoading: creating }] = useCreateStaffMutation()
  const [updateStaff, { isLoading: updating }] = useUpdateStaffMutation()
  const isLoading = creating || updating

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name:      '',
      email:     '',
      phone:     '',
      password:  '',
      role:      'manager',
      is_active: true,
    },
  })

  useEffect(() => {
    if (!open) return
    if (staff) {
      reset({
        name:      staff.name ?? '',
        email:     staff.email ?? '',
        phone:     staff.phone ?? '',
        password:  '',
        role:      staff.role ?? 'manager',
        is_active: staff.is_active ?? true,
      })
    } else {
      reset()
    }
  }, [open, staff, reset])

  const onSubmit = async (data) => {
    const payload = {
      name:  data.name,
      email: data.email,
      phone: data.phone || undefined,
      role:  data.role,
    }

    if (!isEdit) {
      payload.password = data.password
    } else {
      if (data.password) payload.password = data.password
      payload.is_active = data.is_active === true || data.is_active === 'true' || data.is_active === 1
    }

    try {
      if (isEdit) {
        await updateStaff({ id: staff.id, ...payload }).unwrap()
        toast.success('Staff member updated.')
      } else {
        await createStaff(payload).unwrap()
        toast.success('Staff member created.')
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
      title={isEdit ? 'Edit Staff Member' : 'Add Staff Member'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Full Name *"
          placeholder="e.g. Karim Hossain"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email *"
            type="email"
            placeholder="staff@example.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Phone"
            placeholder="01XXXXXXXXX"
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Role *"
            error={errors.role?.message}
            {...register('role', { required: 'Role is required' })}
          >
            {ROLES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>

          {isEdit && (
            <Select label="Status" {...register('is_active')}>
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </Select>
          )}
        </div>

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

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Add Staff'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
