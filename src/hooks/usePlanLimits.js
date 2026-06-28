import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'

export function usePlanLimits() {
  const user = useSelector(selectCurrentUser)
  const plan = user?.tenant?.plan

  return {
    studentsLimit:  plan?.students_limit ?? null,
    branchesLimit:  plan?.branches_limit ?? null,
    staffLimit:     plan?.staff_limit ?? null,
    canExport:      plan?.can_export ?? false,
    reportsLevel:   plan?.reports_level ?? 'basic',
    planName:       plan?.name ?? 'Free',
    planSlug:       plan?.slug ?? 'free',
    isUnlimited:    (resource) => plan?.[resource + '_limit'] === null,
  }
}
