import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'

export function usePermission() {
  const user = useSelector(selectCurrentUser)

  const can = (permission) => {
    if (!user?.permissions?.length) return false
    return user.permissions.includes(permission)
  }

  const hasRole = (role) => {
    if (!user?.roles?.length) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.some((r) => user.roles.includes(r))
  }

  return { can, hasRole }
}
