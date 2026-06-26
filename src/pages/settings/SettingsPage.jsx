import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Building2, User, Lock, GraduationCap, Plus, Trash2, Save, Loader2, Pencil, Tag, ShieldCheck, ChevronDown, ChevronRight, X } from 'lucide-react'
import { selectCurrentUser, selectToken, setCredentials } from '@/features/auth/authSlice'
import { useUpdateCenterMutation, useUpdateAccountMutation } from '@/features/settings/settingsApi'
import { useGetGradeScalesQuery, useSyncGradeScalesMutation } from '@/features/gradeScales/gradeScaleApi'
import {
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} from '@/features/expenseCategories/expenseCategoryApi'
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useSyncRolePermissionsMutation,
  useDeleteRoleMutation,
} from '@/features/roles/rolesApi'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── Center Info Form ─────────────────────────────────────────────────────────
function CenterForm({ user }) {
  const dispatch = useDispatch()
  const token    = useSelector(selectToken)
  const canEdit  = user?.roles?.some((r) => {
    const name = typeof r === 'string' ? r : r?.name
    return name === 'owner' || name === 'manager'
  })

  const [updateCenter, { isLoading }] = useUpdateCenterMutation()

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      name:    user?.tenant?.name    ?? '',
      phone:   user?.tenant?.phone   ?? '',
      email:   user?.tenant?.email   ?? '',
      address: user?.tenant?.address ?? '',
    },
  })

  useEffect(() => {
    if (user?.tenant) {
      reset({
        name:    user.tenant.name    ?? '',
        phone:   user.tenant.phone   ?? '',
        email:   user.tenant.email   ?? '',
        address: user.tenant.address ?? '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data) => {
    try {
      const result = await updateCenter(data).unwrap()
      // Sync updated tenant into Redux store
      dispatch(setCredentials({
        token,
        user: { ...user, tenant: { ...user.tenant, ...result.data } },
      }))
      toast.success('Center information updated.')
      reset(data)
    } catch (err) {
      const firstError = err?.data?.errors
        ? Object.values(err.data.errors)[0]?.[0]
        : null
      toast.error(firstError ?? err?.data?.message ?? 'Failed to update center.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {!canEdit && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Only owners and managers can edit center information.
        </p>
      )}
      <Input
        label="Center Name *"
        placeholder="e.g. Bright Future Academy"
        disabled={!canEdit}
        error={errors.name?.message}
        {...register('name', { required: 'Center name is required' })}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Phone"
          placeholder="01XXXXXXXXX"
          disabled={!canEdit}
          {...register('phone')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="center@example.com"
          disabled={!canEdit}
          {...register('email')}
        />
      </div>
      <Input
        label="Address"
        placeholder="Full address"
        disabled={!canEdit}
        {...register('address')}
      />
      {canEdit && (
        <div className="flex justify-end pt-1">
          <Button type="submit" isLoading={isLoading} disabled={!isDirty}>
            Save Center Info
          </Button>
        </div>
      )}
    </form>
  )
}

// ─── Account Form ─────────────────────────────────────────────────────────────
function AccountForm({ user }) {
  const dispatch = useDispatch()
  const token    = useSelector(selectToken)

  const [updateAccount, { isLoading }] = useUpdateAccountMutation()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name:             user?.name  ?? '',
      email:            user?.email ?? '',
      phone:            user?.phone ?? '',
      current_password: '',
      new_password:     '',
      new_password_confirmation: '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        name:             user.name  ?? '',
        email:            user.email ?? '',
        phone:            user.phone ?? '',
        current_password: '',
        new_password:     '',
        new_password_confirmation: '',
      })
    }
  }, [user, reset])

  const newPassword = watch('new_password')

  const onSubmit = async (data) => {
    const payload = {
      name:  data.name,
      email: data.email,
      phone: data.phone || undefined,
    }

    if (data.new_password) {
      payload.current_password = data.current_password
      payload.new_password     = data.new_password
      payload.new_password_confirmation = data.new_password_confirmation
    }

    try {
      const result = await updateAccount(payload).unwrap()
      // Sync updated user into Redux store
      dispatch(setCredentials({ token, user: result.data }))
      toast.success('Account updated.')
      reset({
        name:             result.data.name  ?? '',
        email:            result.data.email ?? '',
        phone:            result.data.phone ?? '',
        current_password: '',
        new_password:     '',
        new_password_confirmation: '',
      })
    } catch (err) {
      const firstError = err?.data?.errors
        ? Object.values(err.data.errors)[0]?.[0]
        : null
      toast.error(firstError ?? err?.data?.message ?? 'Failed to update account.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Phone"
          placeholder="01XXXXXXXXX"
          {...register('phone')}
        />
      </div>
      <Input
        label="Email *"
        type="email"
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          Change Password — leave blank to keep current
        </p>
        <div className="space-y-3">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            error={errors.current_password?.message}
            {...register('current_password', {
              required: newPassword ? 'Required to change password' : false,
            })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Min 8 characters"
              error={errors.new_password?.message}
              {...register('new_password', {
                minLength: { value: 8, message: 'Min 8 characters' },
              })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              error={errors.new_password_confirmation?.message}
              {...register('new_password_confirmation', {
                validate: (v) => !newPassword || v === newPassword || 'Passwords do not match',
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" isLoading={isLoading} disabled={!isDirty}>
          Save Account
        </Button>
      </div>
    </form>
  )
}

// ─── Grade Scale Form ──────────────────────────────────────────────────────────
function GradeScaleForm() {
  const { data, isLoading: fetching } = useGetGradeScalesQuery()
  const [sync, { isLoading: saving }] = useSyncGradeScalesMutation()

  const defaultScales = [
    { label: 'A+', min_percent: 90, max_percent: 100, gpa: 5.0 },
    { label: 'A',  min_percent: 80, max_percent: 89.99, gpa: 4.0 },
    { label: 'A-', min_percent: 70, max_percent: 79.99, gpa: 3.5 },
    { label: 'B',  min_percent: 60, max_percent: 69.99, gpa: 3.0 },
    { label: 'C',  min_percent: 50, max_percent: 59.99, gpa: 2.0 },
    { label: 'D',  min_percent: 40, max_percent: 49.99, gpa: 1.0 },
    { label: 'F',  min_percent: 0,  max_percent: 39.99, gpa: 0.0 },
  ]

  const [scales, setScales] = useState(defaultScales)

  useEffect(() => {
    if (data?.data?.length) {
      setScales(data.data.map((s) => ({
        label: s.label, min_percent: s.min_percent,
        max_percent: s.max_percent, gpa: s.gpa,
      })))
    }
  }, [data])

  const update = (idx, field, value) =>
    setScales((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))

  const addRow = () =>
    setScales((prev) => [...prev, { label: '', min_percent: 0, max_percent: 0, gpa: 0 }])

  const removeRow = (idx) =>
    setScales((prev) => prev.filter((_, i) => i !== idx))

  const handleSave = async () => {
    try {
      await sync(scales).unwrap()
      toast.success('Grade scale saved.')
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to save grade scale.')
    }
  }

  if (fetching) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Grades are computed automatically when marks are saved. Changes apply to future marks entries only.
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-gray-600 w-16">Grade</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Min %</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Max %</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">GPA</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {scales.map((s, idx) => (
              <tr key={idx}>
                {['label', 'min_percent', 'max_percent', 'gpa'].map((field) => (
                  <td key={field} className="px-3 py-1.5">
                    <input
                      type={field === 'label' ? 'text' : 'number'}
                      value={s[field]}
                      onChange={(e) => update(idx, field, field === 'label' ? e.target.value : parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step={field !== 'label' ? '0.01' : undefined}
                      min={field !== 'label' ? '0' : undefined}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-3.5 w-3.5" /> Add Grade
        </button>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Scale
        </Button>
      </div>
    </div>
  )
}

// ─── Expense Categories Form ───────────────────────────────────────────────────
function ExpenseCategoriesForm() {
  const { data, isLoading: fetching } = useGetExpenseCategoriesQuery()
  const [create, { isLoading: creating }] = useCreateExpenseCategoryMutation()
  const [update, { isLoading: updating }] = useUpdateExpenseCategoryMutation()
  const [remove, { isLoading: removing }] = useDeleteExpenseCategoryMutation()

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm]   = useState({ name: '', color: '' })
  const [newForm, setNewForm]     = useState({ name: '', color: '#6B7280' })

  const categories = data?.data ?? []

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditForm({ name: cat.name, color: cat.color ?? '#6B7280' })
  }

  const handleUpdate = async (id) => {
    if (!editForm.name.trim()) return
    try {
      await update({ id, ...editForm }).unwrap()
      toast.success('Category updated.')
      setEditingId(null)
    } catch {
      toast.error('Failed to update category.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await remove(id).unwrap()
      toast.success('Category deleted.')
    } catch (err) {
      toast.error(err?.data?.message ?? 'Cannot delete — category may be in use.')
    }
  }

  const handleCreate = async () => {
    if (!newForm.name.trim()) return
    try {
      await create(newForm).unwrap()
      toast.success('Category added.')
      setNewForm({ name: '', color: '#6B7280' })
    } catch {
      toast.error('Failed to add category.')
    }
  }

  if (fetching) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Categorize expenses for better reporting. Used in P&amp;L breakdown.
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Color</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-3 py-2 w-16">
                  {editingId === cat.id ? (
                    <input
                      type="color"
                      value={editForm.color ?? '#6B7280'}
                      onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))}
                      className="h-7 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                  ) : (
                    <span
                      className="inline-block h-5 w-5 rounded-full border border-gray-200"
                      style={{ backgroundColor: cat.color ?? '#6B7280' }}
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {editingId === cat.id ? (
                    <input
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-gray-900">{cat.name}</span>
                  )}
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1 justify-end">
                    {editingId === cat.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdate(cat.id)}
                          disabled={updating}
                          className="px-2 py-1 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          disabled={removing}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {/* New row */}
            <tr className="bg-blue-50/40">
              <td className="px-3 py-2 w-16">
                <input
                  type="color"
                  value={newForm.color}
                  onChange={e => setNewForm(f => ({ ...f, color: e.target.value }))}
                  className="h-7 w-10 rounded border border-gray-300 cursor-pointer"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  value={newForm.name}
                  onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="New category name…"
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-2 py-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating || !newForm.name.trim()}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-100 disabled:opacity-40 transition-colors"
                >
                  {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Roles & Permissions ──────────────────────────────────────────────────────
const MODULE_LABELS = {
  students:   'Students',
  batches:    'Batches',
  attendance: 'Attendance',
  fees:       'Fees',
  teachers:   'Teachers',
  staff:      'Staff',
  salary:     'Salary',
  exams:      'Exams',
  expenses:   'Expenses',
  reports:    'Reports',
  settings:   'Settings',
}

function PermissionMatrix({ roleId, currentPermissions, allModules, onSave, isSaving }) {
  const [selected, setSelected] = useState(() => new Set(currentPermissions))

  useEffect(() => {
    setSelected(new Set(currentPermissions))
  }, [currentPermissions.join(',')])

  const toggle = (perm) => setSelected((prev) => {
    const next = new Set(prev)
    next.has(perm) ? next.delete(perm) : next.add(perm)
    return next
  })

  const dirty = JSON.stringify([...selected].sort()) !== JSON.stringify([...currentPermissions].sort())

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {Object.entries(allModules).map(([module, actions]) => (
              <tr key={module} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-700 w-32">
                  {MODULE_LABELS[module] ?? module}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-3">
                    {actions.map((action) => {
                      const perm = `${module}.${action}`
                      return (
                        <label key={perm} className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={selected.has(perm)}
                            onChange={() => toggle(perm)}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-600 capitalize">{action}</span>
                        </label>
                      )
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={!dirty || isSaving}
          onClick={() => onSave([...selected])}
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Permissions
        </Button>
      </div>
    </div>
  )
}

function RoleRow({ role, allModules, isExpanded, onToggle }) {
  const [syncPermissions, { isLoading: syncing }] = useSyncRolePermissionsMutation()
  const [deleteRole, { isLoading: deleting }]     = useDeleteRoleMutation()
  const [confirmDelete, setConfirmDelete]          = useState(false)

  const handleSave = async (permissions) => {
    try {
      await syncPermissions({ roleId: role.id, permissions }).unwrap()
      toast.success(`Permissions updated for "${role.name}".`)
    } catch {
      toast.error('Failed to update permissions.')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteRole(role.id).unwrap()
      toast.success(`Role "${role.name}" deleted.`)
    } catch {
      toast.error('Failed to delete role.')
    }
    setConfirmDelete(false)
  }

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={onToggle}
        >
          <span className="text-gray-400">
            {isExpanded
              ? <ChevronDown className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />}
          </span>
          <span className="text-sm font-medium text-gray-900 flex-1 capitalize">{role.name}</span>
          <span className="text-xs text-gray-400">{role.permissions.length} permissions</span>
          {role.is_system
            ? <Badge variant="info">System</Badge>
            : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
                className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete role"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )
          }
        </div>

        {isExpanded && (
          <div className="p-4 border-t border-gray-200">
            {role.is_system ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2">This is a system role — permissions are fixed.</p>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((p) => (
                    <Badge key={p} variant="gray" className="text-xs font-mono">{p}</Badge>
                  ))}
                </div>
              </div>
            ) : (
              <PermissionMatrix
                key={role.id}
                roleId={role.id}
                currentPermissions={role.permissions}
                allModules={allModules}
                onSave={handleSave}
                isSaving={syncing}
              />
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Role"
        message={`Delete the "${role.name}" role? Users assigned this role will lose it.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </>
  )
}

function RolesSection() {
  const { data: rolesData, isLoading: rolesLoading }     = useGetRolesQuery()
  const { data: permissionsData, isLoading: permsLoading } = useGetPermissionsQuery()
  const [createRole, { isLoading: creating }]            = useCreateRoleMutation()
  const [newRoleName, setNewRoleName]                    = useState('')
  const [expandedRole, setExpandedRole]                  = useState(null)

  const roles       = rolesData?.data ?? []
  const allModules  = permissionsData?.data ?? {}
  const systemRoles = roles.filter((r) => r.is_system)
  const customRoles = roles.filter((r) => !r.is_system)

  const handleCreate = async () => {
    const name = newRoleName.trim().toLowerCase().replace(/\s+/g, '-')
    if (!name) return
    try {
      const res = await createRole({ name }).unwrap()
      toast.success(`Role "${res.data.name}" created.`)
      setNewRoleName('')
      setExpandedRole(res.data.id)
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to create role.')
    }
  }

  if (rolesLoading || permsLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
  }

  return (
    <div className="space-y-5">
      {/* System roles */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">System Roles</p>
        <div className="space-y-2">
          {systemRoles.map((role) => (
            <RoleRow
              key={role.id}
              role={role}
              allModules={allModules}
              isExpanded={expandedRole === role.id}
              onToggle={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
            />
          ))}
        </div>
      </div>

      {/* Custom roles */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Custom Roles</p>
        {customRoles.length === 0 ? (
          <p className="text-sm text-gray-400 mb-3">No custom roles yet.</p>
        ) : (
          <div className="space-y-2 mb-3">
            {customRoles.map((role) => (
              <RoleRow
                key={role.id}
                role={role}
                allModules={allModules}
                isExpanded={expandedRole === role.id}
                onToggle={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
              />
            ))}
          </div>
        )}

        {/* Add role */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="New role name (e.g. coordinator)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleCreate} disabled={!newRoleName.trim() || creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Role
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const user = useSelector(selectCurrentUser)

  const isOwner = user?.roles?.includes('owner')

  const roleName = (() => {
    const r = user?.roles?.[0]
    return typeof r === 'string' ? r : r?.name ?? '—'
  })()

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your center and account preferences.</p>
      </div>

      {/* Identity card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
          {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <Badge variant="blue" className="capitalize">{roleName}</Badge>
      </div>

      <SectionCard icon={Building2} title="Center Information">
        <CenterForm user={user} />
      </SectionCard>

      <SectionCard icon={User} title="My Account">
        <AccountForm user={user} />
      </SectionCard>

      <SectionCard icon={GraduationCap} title="Grade Scale">
        <GradeScaleForm />
      </SectionCard>

      <SectionCard icon={Tag} title="Expense Categories">
        <ExpenseCategoriesForm />
      </SectionCard>

      {isOwner && (
        <SectionCard icon={ShieldCheck} title="Roles & Permissions">
          <RolesSection />
        </SectionCard>
      )}
    </div>
  )
}
