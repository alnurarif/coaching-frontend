import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useLoginMutation } from '@/features/auth/authApi'
import { setCredentials } from '@/features/auth/authSlice'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap()
      dispatch(setCredentials({ token: result.token, user: result.data }))
      navigate('/dashboard', { replace: true })
      toast.success(`Welcome back, ${result.data.name}!`)
    } catch (err) {
      const firstError = err?.data?.errors
        ? Object.values(err.data.errors)[0]?.[0]
        : null
      toast.error(firstError ?? err?.data?.message ?? 'Login failed.')
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-6 text-center">
          <div className="text-xl font-bold text-blue-600 mb-1">ClassPilot</div>
          <h2 className="text-base font-semibold text-gray-900">Sign in to your account</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="owner@test.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
