import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import {
  useCreateStudentMutation,
  useUpdateStudentMutation,
} from '@/features/students/studentApi'
import { useGetBranchesQuery } from '@/features/branches/branchApi'

export function StudentFormModal({ open, onClose, student }) {
  const isEdit = !!student

  const [createStudent, { isLoading: creating }] = useCreateStudentMutation()
  const [updateStudent, { isLoading: updating }] = useUpdateStudentMutation()
  const isLoading = creating || updating

  const { data: branchesData } = useGetBranchesQuery()
  const branches = (branchesData?.data ?? []).filter((b) => b.is_active)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      branch_id: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      admission_date: '',
      status: 'active',
      guardian_name: '',
      guardian_relation: 'father',
      guardian_phone: '',
      guardian_email: '',
      guardian_occupation: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (student) {
        reset({
          name:               student.name ?? '',
          branch_id:          student.branch_id ?? '',
          date_of_birth:      student.date_of_birth ?? '',
          gender:             student.gender ?? '',
          phone:              student.phone ?? '',
          email:              student.email ?? '',
          address:            student.address ?? '',
          admission_date:     student.admission_date ?? '',
          status:             student.status ?? 'active',
          guardian_name:      student.guardian?.name ?? '',
          guardian_relation:  student.guardian?.relation ?? 'father',
          guardian_phone:     student.guardian?.phone ?? '',
          guardian_email:     student.guardian?.email ?? '',
          guardian_occupation: student.guardian?.occupation ?? '',
        })
      } else {
        reset()
      }
    }
  }, [open, student, reset])

  const onSubmit = async (data) => {
    const payload = {
      name:           data.name,
      branch_id:      data.branch_id ? parseInt(data.branch_id, 10) : undefined,
      date_of_birth:  data.date_of_birth || undefined,
      gender:         data.gender || undefined,
      phone:          data.phone || undefined,
      email:          data.email || undefined,
      address:        data.address || undefined,
      admission_date: data.admission_date,
      status:         data.status,
      guardian: data.guardian_name ? {
        name:       data.guardian_name,
        relation:   data.guardian_relation,
        phone:      data.guardian_phone,
        email:      data.guardian_email || undefined,
        occupation: data.guardian_occupation || undefined,
      } : undefined,
    }

    try {
      if (isEdit) {
        await updateStudent({ id: student.id, ...payload }).unwrap()
        toast.success('Student updated successfully.')
      } else {
        await createStudent(payload).unwrap()
        toast.success('Student registered successfully.')
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
      title={isEdit ? 'Edit Student' : 'Register New Student'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Student Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  label="Full Name *"
                  placeholder="e.g. Rahul Ahmed"
                  error={errors.name?.message}
                  {...register('name', { required: 'Name is required' })}
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
              <Input
                label="Date of Birth"
                type="date"
                error={errors.date_of_birth?.message}
                {...register('date_of_birth')}
              />
              <Select
                label="Gender"
                placeholder="Select gender"
                error={errors.gender?.message}
                {...register('gender')}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <Input
                label="Phone"
                placeholder="01XXXXXXXXX"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="student@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Admission Date *"
                type="date"
                error={errors.admission_date?.message}
                {...register('admission_date', { required: 'Admission date is required' })}
              />
              <Select
                label="Status"
                error={errors.status?.message}
                {...register('status')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
              <div className="col-span-2">
                <Input
                  label="Address"
                  placeholder="Full address"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Guardian Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Guardian Name"
                placeholder="e.g. Karim Ahmed"
                error={errors.guardian_name?.message}
                {...register('guardian_name')}
              />
              <Select
                label="Relation"
                error={errors.guardian_relation?.message}
                {...register('guardian_relation')}
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
              </Select>
              <Input
                label="Guardian Phone"
                placeholder="01XXXXXXXXX"
                error={errors.guardian_phone?.message}
                {...register('guardian_phone')}
              />
              <Input
                label="Guardian Email"
                type="email"
                placeholder="guardian@email.com"
                error={errors.guardian_email?.message}
                {...register('guardian_email')}
              />
              <div className="col-span-2">
                <Input
                  label="Occupation"
                  placeholder="e.g. Business, Service"
                  error={errors.guardian_occupation?.message}
                  {...register('guardian_occupation')}
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
            {isEdit ? 'Save Changes' : 'Register Student'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
