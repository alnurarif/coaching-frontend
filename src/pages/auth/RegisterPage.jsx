import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useRegisterMutation } from '@/features/auth/authApi'
import { setCredentials, selectIsAuthenticated } from '@/features/auth/authSlice'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const dispatch      = useDispatch()
  const navigate      = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [register, { isLoading }] = useRegisterMutation()

  const {
    register: field,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { center_name: '', name: '', email: '', phone: '', password: '', password_confirmation: '' },
  })

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const onSubmit = async (data) => {
    try {
      const result = await register(data).unwrap()
      dispatch(setCredentials({ token: result.token, user: result.data }))
      navigate('/dashboard', { replace: true })
      toast.success('Welcome! Your coaching center is ready.')
    } catch (err) {
      const firstError = err?.data?.errors
        ? Object.values(err.data.errors)[0]?.[0]
        : null
      toast.error(firstError ?? err?.data?.message ?? 'Registration failed.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-blue-600">ClassPilot</Link>
          <p className="text-gray-500 text-sm mt-2">Everything your coaching center needs, in one place</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Coaching Center Name"
              placeholder="Bright Future Academy"
              error={errors.center_name?.message}
              {...field('center_name', { required: 'Center name is required', minLength: { value: 2, message: 'Too short' } })}
            />

            <Input
              label="Your Full Name"
              placeholder="Md. Rahim Uddin"
              error={errors.name?.message}
              {...field('name', { required: 'Your name is required' })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="owner@myacademy.com"
              error={errors.email?.message}
              {...field('email', { required: 'Email is required' })}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="01700000000"
              error={errors.phone?.message}
              {...field('phone')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              error={errors.password?.message}
              {...field('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              error={errors.password_confirmation?.message}
              {...field('password_confirmation', {
                required: 'Please confirm your password',
                validate: (val) => val === watch('password') || 'Passwords do not match',
              })}
            />

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By registering you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
