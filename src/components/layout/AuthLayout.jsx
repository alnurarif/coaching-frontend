import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '@/features/auth/authSlice'

export function AuthLayout() {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Outlet />
    </div>
  )
}
