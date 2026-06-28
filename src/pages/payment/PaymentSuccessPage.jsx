import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials, selectToken } from '@/features/auth/authSlice'
import { baseApi } from '@/app/api/baseApi'

export default function PaymentSuccessPage() {
  const dispatch      = useDispatch()
  const token         = useSelector(selectToken)
  const [params]      = useSearchParams()
  const tranId        = params.get('tran_id')

  useEffect(() => {
    // Invalidate Auth + Subscription caches so /me re-fetches with updated plan
    dispatch(baseApi.util.invalidateTags(['Auth', 'Subscription']))
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 text-sm mb-1">Your plan has been upgraded successfully.</p>
        {tranId && (
          <p className="text-xs text-gray-400 mb-6">Transaction ID: {tranId}</p>
        )}
        <Link
          to="/dashboard"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-block"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
