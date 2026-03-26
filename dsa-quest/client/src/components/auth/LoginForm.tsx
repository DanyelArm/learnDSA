import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch {
      // error handled by store
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-crimson/10 border border-crimson text-crimson text-sm px-4 py-2 rounded">
          {error}
          <button
            type="button"
            className="ml-2 underline text-xs"
            onClick={clearError}
          >
            ✕
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-heading text-brown mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="adventurer@realm.com"
          className="input-parchment"
          onFocus={clearError}
        />
        {errors.email && (
          <p className="text-crimson text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-heading text-brown mb-1">Password</label>
        <input
          {...register('password')}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="input-parchment"
          onFocus={clearError}
        />
        {errors.password && (
          <p className="text-crimson text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-gold w-full mt-6 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Entering the realm...' : 'Begin Adventure'}
      </button>

      <p className="text-center text-sm text-brown font-body mt-4">
        No account?{' '}
        <Link to="/register" className="text-gold-dark underline hover:text-gold">
          Join the Quest
        </Link>
      </p>
    </form>
  )
}
