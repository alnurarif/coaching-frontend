import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '@/features/auth/authSlice'
import { Navigate } from 'react-router-dom'

const FEATURES = [
  { icon: '👥', title: 'Student Management', desc: 'Register students, manage profiles, track admissions and status.' },
  { icon: '📚', title: 'Batch Management', desc: 'Create batches, assign teachers and students, set schedules.' },
  { icon: '✅', title: 'Attendance Tracking', desc: 'Daily student and teacher attendance with absence reports.' },
  { icon: '💰', title: 'Fee Management', desc: 'Collect fees, manage dues, apply discounts, print receipts.' },
  { icon: '📊', title: 'Reports & Analytics', desc: 'Collection reports, attendance summaries, exam results.' },
  { icon: '🎓', title: 'Exam & Results', desc: 'Schedule exams, record results, generate merit lists and grade sheets.' },
]

const PLANS = [
  {
    name: 'Free',
    price: '৳0',
    period: '',
    highlight: false,
    badge: null,
    features: ['30 students', '1 branch', '3 staff users', 'Core modules', 'Basic dashboard', 'Community support'],
    cta: 'Get Started Free',
    ctaTo: '/register',
    ctaVariant: 'outline',
  },
  {
    name: 'Starter',
    price: '৳999',
    period: '/mo',
    highlight: false,
    badge: null,
    features: ['150 students', '1 branch', '10 staff users', 'Full reports', 'PDF/Excel export', 'Email support'],
    cta: 'Choose Starter',
    ctaTo: '/register',
    ctaVariant: 'outline',
  },
  {
    name: 'Growth',
    price: '৳2,499',
    period: '/mo',
    highlight: true,
    badge: '⭐ Most Popular',
    features: ['500 students', '3 branches', '30 staff users', 'Advanced reports', 'PDF/Excel export', 'Priority support'],
    cta: 'Choose Growth',
    ctaTo: '/register',
    ctaVariant: 'primary',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    highlight: false,
    badge: null,
    features: ['Unlimited students', 'Unlimited branches', 'Unlimited staff', 'Advanced reports', 'White-label', 'Dedicated support'],
    cta: 'Contact Sales',
    ctaTo: 'mailto:sales@classpilot.app',
    ctaVariant: 'outline',
    external: true,
  },
]

export default function LandingPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">ClassPilot</span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5">
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          Built for coaching centers across Bangladesh
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Everything your coaching center
          <br />
          <span className="text-blue-600">needs, in one place</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
          Students, batches, attendance, fees, exams — all managed from a single dashboard.
          Start free, upgrade as you grow.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
          >
            Sign in to your account
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required</p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Everything your coaching center needs
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Purpose-built features for how coaching centers actually work.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20" id="pricing">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Start free. Upgrade as you grow. Cancel anytime.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 flex flex-col ${
                  plan.highlight
                    ? 'border-blue-500 shadow-lg ring-1 ring-blue-500'
                    : 'border-gray-200'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-sm text-gray-500">{plan.period}</span>}
                  </div>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.external ? (
                  <a
                    href={plan.ctaTo}
                    className="block text-center border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    to={plan.ctaTo}
                    className={`block text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      plan.ctaVariant === 'primary'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to transform your coaching center?
          </h2>
          <p className="text-blue-100 mb-8">
            Join hundreds of coaching centers managing their operations with ease.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            Start for free today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} ClassPilot. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
