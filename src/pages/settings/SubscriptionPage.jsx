import { toast } from 'sonner'
import { useGetSubscriptionQuery, useCheckoutMutation, useGetPlansQuery } from '@/features/subscription/subscriptionApi'

function UsageMeter({ label, used, limit }) {
  const isUnlimited = limit === null
  const pct         = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const atLimit     = !isUnlimited && used >= limit

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${atLimit ? 'text-red-600' : 'text-gray-900'}`}>
          {used} / {isUnlimited ? '∞' : limit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${atLimit ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function SubscriptionPage() {
  const { data: subData, isLoading } = useGetSubscriptionQuery()
  const { data: plansData }          = useGetPlansQuery()
  const [checkout, { isLoading: checkingOut }] = useCheckoutMutation()

  const currentPlan = subData?.data?.plan
  const usage       = subData?.data?.usage ?? {}
  const sub         = subData?.data?.subscription
  const plans       = plansData?.data ?? []

  const handleUpgrade = async (planId) => {
    try {
      const result = await checkout({ plan_id: planId }).unwrap()
      window.location.href = result.data.payment_url
    } catch (err) {
      const firstError = err?.data?.errors
        ? Object.values(err.data.errors)[0]?.[0]
        : null
      toast.error(firstError ?? err?.data?.message ?? 'Checkout failed.')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">Loading subscription...</div>
    )
  }

  const paidPlans = plans.filter((p) => p.slug !== 'free' && p.slug !== 'enterprise')

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Current Plan</h2>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">{currentPlan?.name ?? 'Free'}</span>
              {currentPlan?.slug === 'free' && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Free Forever</span>
              )}
            </div>
            {sub?.ends_at && (
              <p className="text-sm text-gray-500 mt-1">
                Renews {new Date(sub.ends_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          {currentPlan?.slug !== 'enterprise' && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {currentPlan?.price === '0.00' || !currentPlan?.price ? '৳0' : `৳${parseFloat(currentPlan.price).toLocaleString()}`}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Usage</h2>
        <div className="space-y-4">
          <UsageMeter label="Students"  used={usage.students ?? 0} limit={currentPlan?.students_limit ?? null} />
          <UsageMeter label="Branches"  used={usage.branches ?? 0} limit={currentPlan?.branches_limit ?? null} />
          <UsageMeter label="Staff"     used={usage.staff ?? 0}    limit={currentPlan?.staff_limit ?? null} />
        </div>
      </div>

      {/* Upgrade options */}
      {currentPlan?.slug !== 'enterprise' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Upgrade Your Plan</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {paidPlans.map((plan) => {
              const isCurrent = plan.id === currentPlan?.id
              return (
                <div
                  key={plan.id}
                  className={`border rounded-xl p-5 ${plan.slug === 'growth' ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-200'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{plan.name}</div>
                      <div className="text-lg font-bold text-gray-900 mt-1">
                        ৳{parseFloat(plan.price).toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span>
                      </div>
                    </div>
                    {plan.slug === 'growth' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Popular</span>
                    )}
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {[
                      `${plan.students_limit ?? '∞'} students`,
                      `${plan.branches_limit ?? '∞'} branches`,
                      `${plan.staff_limit ?? '∞'} staff`,
                      plan.can_export ? 'PDF/Excel export' : null,
                    ].filter(Boolean).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <button disabled className="w-full border border-gray-200 text-gray-400 px-4 py-2 rounded-lg text-sm">
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={checkingOut}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {checkingOut ? 'Redirecting...' : `Upgrade to ${plan.name}`}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 border border-gray-200 rounded-xl p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-semibold text-gray-900">Enterprise</div>
              <p className="text-sm text-gray-500 mt-0.5">Unlimited everything + white-label + dedicated support</p>
            </div>
            <a
              href="mailto:sales@classpilot.app"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
