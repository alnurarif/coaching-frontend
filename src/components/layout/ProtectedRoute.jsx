import { useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectIsAuthenticated, selectToken, setCredentials, clearCredentials } from '@/features/auth/authSlice'
import { useGetMeQuery } from '@/features/auth/authApi'

export function ProtectedRoute() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const token = useSelector(selectToken)

  const { data, isError, isFetching, error, isLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  })

  useEffect(() => {
    if (isError && !isFetching && error?.status === 401) {
      dispatch(clearCredentials())
    }
  }, [isError, isFetching, error, dispatch])

  // Keep Redux user (permissions/roles) in sync with the server on every /me response
  useEffect(() => {
    if (data?.data && token) {
      dispatch(setCredentials({ token, user: data.data }))
    }
  }, [data, token, dispatch])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  return <Outlet />
}
