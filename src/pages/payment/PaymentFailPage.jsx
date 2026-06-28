import { Link, useSearchParams } from 'react-router-dom'

export default function PaymentFailPage() {
  const [params]  = useSearchParams()
  const cancelled = params.get('cancelled') === '1'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {cancelled ? 'Payment Cancelled' : 'Payment Failed'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {cancelled
            ? 'You cancelled the payment. Your current plan is unchanged.'
            : 'Something went wrong with your payment. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/settings/subscription"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            to="/dashboard"
            className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
