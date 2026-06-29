import { useState } from 'react'
import { toast } from 'sonner'
import { ShieldCheck, Plus, Trash2, Lock } from 'lucide-react'
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useSyncRolePermissionsMutation,
  useDeleteRoleMutation,
} from '@/features/roles/rolesApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { useForm } from 'react-hook-form'

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

function PermissionMatrix({ role, allPermissions, onSave, isSaving }) {
  const validPerms = new Set(
    Object.entries(allPermissions).flatMap(([mod, actions]) =>
      actions.map(a => `${mod}.${a.split('.').pop()}`)
    )
  )
  const initial = new Set(role.permissions.filter(p => validPerms.has(p)))
  const [checked, setChecked] = useState(initial)
  const isDirty = [...checked].sort().join() !== [...initial].sort().join()

  const toggle = (perm) => {
    if (role.is_system) return
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(perm) ? next.delete(perm) : next.add(perm)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {Object.entries(allPermissions).map(([module, actions]) => (
        <div key={module}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {MODULE_LABELS[module] ?? module}
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map((rawPerm) => {
              const action    = rawPerm.split('.').pop()
              const perm      = `${module}.${action}`
              const isChecked = checked.has(perm)
              return (
                <label
                  key={perm}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer select-none transition-colors ${
                    role.is_system
                      ? isChecked
                        ? 'bg-blue-50 border-blue-200 text-blue-700 cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                      : isChecked
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    disabled={role.is_system}
                    onChange={() => toggle(perm)}
                  />
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                    isChecked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                  }`}>
                    {isChecked && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {action}
                </label>
              )
            })}
          </div>
        </div>
      ))}

      {!role.is_system && (
        <div className="pt-2 border-t border-gray-100">
          <Button
            onClick={() => onSave([...checked])}
            isLoading={isSaving}
            disabled={!isDirty}
            className="text-sm"
          >
            Save Permissions
          </Button>
          {!isDirty && (
            <span className="ml-3 text-xs text-gray-400">No changes</span>
          )}
        </div>
      )}
    </div>
  )
}

function CreateRoleModal({ open, onClose }) {
  const [createRole, { isLoading }] = useCreateRoleMutation()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      await createRole(data).unwrap()
      toast.success(`Role "${data.name}" created.`)
      reset()
      onClose()
    } catch (err) {
      const msg = err?.data?.message ?? err?.data?.errors?.name?.[0] ?? 'Failed to create role.'
      toast.error(msg)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Custom Role">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Role Name"
          placeholder="e.g. receptionist"
          error={errors.name?.message}
          {...register('name', {
            required: 'Role name is required',
            pattern: {
              value: /^[a-z0-9_-]+$/,
              message: 'Only lowercase letters, numbers, _ and - allowed',
            },
          })}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Create Role</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function RolesPage() {
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [createOpen, setCreateOpen]         = useState(false)
  const [deleteTarget, setDeleteTarget]     = useState(null)

  const { data: rolesData, isLoading: rolesLoading }         = useGetRolesQuery()
  const { data: permsData, isLoading: permsLoading }         = useGetPermissionsQuery()
  const [syncPermissions, { isLoading: syncing }]            = useSyncRolePermissionsMutation()
  const [deleteRole, { isLoading: deleting }]                = useDeleteRoleMutation()

  const roles       = rolesData?.data ?? []
  const permissions = permsData?.data ?? {}

  const firstCustomRole = roles.find((r) => !r.is_system) ?? null
  const selectedRole    = roles.find((r) => r.id === selectedRoleId) ?? firstCustomRole ?? roles[0] ?? null

  const handleSavePermissions = async (permList) => {
    const validPerms = new Set(Object.values(permissions).flat())
    const filtered = permList.filter(p => validPerms.has(p))
    try {
      await syncPermissions({ roleId: selectedRole.id, permissions: filtered }).unwrap()
      toast.success('Permissions updated.')
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to update permissions.')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteRole(deleteTarget.id).unwrap()
      toast.success(`Role "${deleteTarget.name}" deleted.`)
      setDeleteTarget(null)
      if (selectedRoleId === deleteTarget.id) setSelectedRoleId(null)
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to delete role.')
    }
  }

  if (rolesLoading || permsLoading) {
    return (
      <div className="p-6 text-sm text-gray-400">Loading roles...</div>
    )
  }

  const activeRole = selectedRole ?? roles[0]

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Roles & Permissions</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Control what each role can access in ClassPilot.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Role
        </Button>
      </div>

      <div className="flex gap-5 items-start">
        {/* Role list */}
        <div className="w-56 shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Roles</span>
          </div>
          <ul className="py-1">
            {roles.map((role) => {
              const isActive = (activeRole?.id === role.id)
              return (
                <li key={role.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {role.is_system
                        ? <Lock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        : <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      }
                      <span className="truncate capitalize">{role.name}</span>
                    </div>
                    {!role.is_system && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(role) }}
                        className="ml-1 p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete role"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Permission matrix */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-5">
          {activeRole ? (
            <>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 capitalize">{activeRole.name}</h3>
                  {activeRole.is_system ? (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="h-3 w-3" /> System role — read only
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Custom role</span>
                  )}
                </div>
                {activeRole.is_system && (
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="text-xs text-blue-600 hover:underline whitespace-nowrap flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Create editable role
                  </button>
                )}
              </div>
              {activeRole.is_system && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  System role permissions are fixed and cannot be modified. To create a role with custom permissions, click <strong>New Role</strong> above.
                </div>
              )}
              <PermissionMatrix
                key={activeRole.id}
                role={activeRole}
                allPermissions={permissions}
                onSave={handleSavePermissions}
                isSaving={syncing}
              />
            </>
          ) : (
            <p className="text-sm text-gray-400">Select a role to view its permissions.</p>
          )}
        </div>
      </div>

      <CreateRoleModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title={`Delete "${deleteTarget?.name}"?`}
        message="Users with this role will have it removed. This cannot be undone."
        confirmLabel="Delete Role"
        confirmVariant="danger"
      />
    </div>
  )
}
