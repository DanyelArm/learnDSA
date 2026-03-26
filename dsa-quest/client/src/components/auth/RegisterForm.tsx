import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(20, 'At most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
})

type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const { register: registerUser, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      await registerUser(data.username, data.email, data.password)
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
          <button type="button" className="ml-2 underline text-xs" onClick={clearError}>
            ✕
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-heading text-brown mb-1">Hero Name</label>
        <input
          {...register('username')}
          type="text"
          autoComplete="username"
          placeholder="LegendaryHero42"
          className="input-parchment"
          onFocus={clearError}
        />
        {errors.username && (
          <p className="text-crimson text-xs mt-1">{errors.username.message}</p>
        )}
      </div>

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
        <label className="block text-sm font-heading text-brown mb-1">Secret Passphrase</label>
        <input
          {...register('password')}
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
        {isLoading ? 'Creating your legend...' : 'Forge Your Legend'}
      </button>

      <p className="text-center text-sm text-brown font-body mt-4">
        Already a hero?{' '}
        <Link to="/login" className="text-gold-dark underline hover:text-gold">
          Return to the Gates
        </Link>
      </p>
    </form>
  )
}
