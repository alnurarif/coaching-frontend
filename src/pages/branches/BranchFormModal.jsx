import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCreateBranchMutation, useUpdateBranchMutation } from '@/features/branches/branchApi'

export function BranchFormModal({ open, onClose, branch }) {
  const isEdit = !!branch

  const [createBranch, { isLoading: creating }] = useCreateBranchMutation()
  const [updateBranch, { isLoading: updating }] = useUpdateBranchMutation()
  const isLoading = creating || updating

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', phone: '', address: '', is_active: true },
  })

  useEffect(() => {
    if (!open) return
    if (branch) {
      reset({
        name:      branch.name ?? '',
        phone:     branch.phone ?? '',
        address:   branch.address ?? '',
        is_active: branch.is_active ?? true,
      })
    } else {
      reset({ name: '', phone: '', address: '', is_active: true })
    }
  }, [open, branch, reset])

  const onSubmit = async (data) => {
    const payload = {
      name:    data.name,
      phone:   data.phone || undefined,
      address: data.address || undefined,
    }

    if (isEdit) {
      payload.is_active = data.is_active === true || data.is_active === 'true' || data.is_active === 1
    }

    try {
      if (isEdit) {
        await updateBranch({ id: branch.id, ...payload }).unwrap()
        toast.success('Branch updated.')
      } else {
        await createBranch(payload).unwrap()
        toast.success('Branch created.')
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
      title={isEdit ? 'Edit Branch' : 'Add Branch'}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Branch Name *"
          placeholder="e.g. Main Branch, Mirpur Branch"
          error={errors.name?.message}
          {...register('name', { required: 'Branch name is required' })}
        />
        <Input
          label="Phone"
          placeholder="01XXXXXXXXX"
          {...register('phone')}
        />
        <Input
          label="Address"
          placeholder="Full address"
          {...register('address')}
        />
        {isEdit && (
          <Select label="Status" {...register('is_active')}>
            <option value={true}>Active</option>
            <option value={false}>Inactive</option>
          </Select>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Add Branch'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
