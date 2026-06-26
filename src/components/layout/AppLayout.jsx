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
} from 'lucide-react'
import { cn } from '@/components/ui/cn'
import { toast } from 'sonner'

// permission: null means visible to all authenticated users
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard, permission: null },
  { to: '/students',  label: 'Students',   icon: Users,           permission: 'students.view' },
  { to: '/batches',   label: 'Batches',    icon: BookOpen,        permission: 'batches.view' },
  { to: '/attendance',label: 'Attendance', icon: ClipboardCheck,  permission: 'attendance.view' },
  { to: '/fees',      label: 'Fees',       icon: Wallet,          permission: 'fees.view' },
  { to: '/teachers',  label: 'Teachers',   icon: GraduationCap,   permission: 'teachers.view' },
  { to: '/branches',  label: 'Branches',   icon: GitBranch,       permission: 'settings.center' },
  { to: '/staff',     label: 'Staff',      icon: UserCog,         permission: 'staff.view' },
  { to: '/reports',   label: 'Reports',    icon: BarChart3,       permission: ['reports.financial', 'reports.exam', 'reports.attendance'] },
  { to: '/exams',     label: 'Exams',      icon: ClipboardList,   permission: 'exams.view' },
  { to: '/subjects',  label: 'Subjects',   icon: Library,         permission: 'exams.view' },
  { to: '/expenses',  label: 'Expenses',   icon: Receipt,         permission: 'expenses.view' },
  { to: '/settings',  label: 'Settings',   icon: Settings,        permission: null },
]

export function AppLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const [logout] = useLogoutMutation()

  const permissions = new Set(user?.permissions ?? [])
  const isOwner = user?.roles?.includes('owner')

  const visibleNav = NAV_ITEMS.filter(({ permission }) => {
    if (permission === null || isOwner) return true
    if (Array.isArray(permission)) return permission.some((p) => permissions.has(p))
    return permissions.has(permission)
  })

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
      <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-200">
          <h1 className="text-base font-semibold text-gray-900 leading-tight">
            {user?.tenant?.name || 'Coaching Center'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">{user?.branch?.name}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
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
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          <div className="px-3 pb-3">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.roles?.[0]}</p>
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

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
