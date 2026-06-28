import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearCredentials, selectCurrentUser } from '@/features/auth/authSlice'
import { useLogoutMutation } from '@/features/auth/authApi'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  Wallet,
  GraduationCap,
  GitBranch,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  ClipboardList,
  Library,
  Receipt,
  CreditCard,
  ShieldCheck,
  Menu,
  X,
  Banknote,
} from 'lucide-react'
import { cn } from '@/components/ui/cn'
import { toast } from 'sonner'

// permission: null = all authenticated users, 'owner-only' = owner role only
const NAV_GROUPS = [
  {
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null },
    ],
  },
  {
    label: 'Academic',
    items: [
      { to: '/students',   label: 'Students',   icon: Users,         permission: 'students.view' },
      { to: '/batches',    label: 'Batches',     icon: BookOpen,      permission: 'batches.view' },
      { to: '/attendance', label: 'Attendance',  icon: ClipboardCheck,permission: 'attendance.view' },
      { to: '/exams',      label: 'Exams',       icon: ClipboardList, permission: 'exams.view' },
      { to: '/subjects',   label: 'Subjects',    icon: Library,       permission: 'exams.view' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/fees',     label: 'Fees',     icon: Wallet,    permission: 'fees.view' },
      { to: '/salary',   label: 'Payroll',  icon: Banknote,  permission: 'salary.view' },
      { to: '/expenses', label: 'Expenses', icon: Receipt,   permission: 'expenses.view' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/teachers', label: 'Teachers', icon: GraduationCap, permission: 'teachers.view' },
      { to: '/staff',    label: 'Staff',    icon: UserCog,       permission: 'staff.view' },
      { to: '/branches', label: 'Branches', icon: GitBranch,     permission: 'settings.center' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart3, permission: ['reports.financial', 'reports.exam', 'reports.attendance'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/roles',                  label: 'Roles',        icon: ShieldCheck, permission: 'owner-only' },
      { to: '/settings',               label: 'Settings',     icon: Settings,    permission: null },
      { to: '/settings/subscription',  label: 'Subscription', icon: CreditCard,  permission: 'owner-only' },
    ],
  },
]

function isVisible(permission, isOwner, permissions) {
  if (permission === null) return true
  if (permission === 'owner-only') return isOwner
  if (isOwner) return true
  if (Array.isArray(permission)) return permission.some((p) => permissions.has(p))
  return permissions.has(permission)
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const user       = useSelector(selectCurrentUser)
  const [logout]   = useLogoutMutation()

  const permissions = new Set(user?.permissions ?? [])
  const isOwner     = user?.roles?.includes('owner')

  const closeSidebar = () => setSidebarOpen(false)

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // token may already be invalid
    }
    dispatch(clearCredentials())
    navigate('/login', { replace: true })
    toast.success('Logged out successfully.')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 flex flex-col',
          'transition-transform duration-200 ease-in-out',
          'lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Tenant header */}
        <div className="px-5 py-5 border-b border-gray-200 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-gray-900 leading-tight truncate">
              {user?.tenant?.name || 'Coaching Center'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.branch?.name}</p>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            className="lg:hidden shrink-0 p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {NAV_GROUPS.map((group, gi) => {
            const visibleItems = group.items.filter(({ permission }) =>
              isVisible(permission, isOwner, permissions)
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={gi}>
                {group.label && (
                  <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                        )
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="px-3 pb-3">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.roles?.[0]}</p>
            {user?.tenant?.plan && (
              <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {user.tenant.plan.name} Plan
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Page content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-200 sticky top-0 z-20 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-gray-900 text-sm truncate">
            {user?.tenant?.name || 'ClassPilot'}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
