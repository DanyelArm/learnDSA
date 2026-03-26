import { Navigate } from 'react-router-dom'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { ParchmentPanel } from '@/components/ui/ParchmentPanel'
import { useAuth } from '@/hooks/useAuth'

export function RegisterPage() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex items-center justify-center parchment-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-vignette pointer-events-none" />

      <div className="absolute top-8 left-8 text-6xl opacity-20 select-none">📜</div>
      <div className="absolute top-8 right-8 text-6xl opacity-20 select-none">⚗️</div>
      <div className="absolute bottom-8 left-8 text-6xl opacity-20 select-none">🗡️</div>
      <div className="absolute bottom-8 right-8 text-6xl opacity-20 select-none">🏆</div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-5xl text-brown-dark tracking-wider drop-shadow-md">
            DSA Quest
          </h1>
          <p className="font-body text-brown mt-2 italic text-sm">
            "Every legend begins with a single step"
          </p>
        </div>

        <ParchmentPanel title="Forge Your Legend">
          <RegisterForm />
        </ParchmentPanel>
      </div>
    </div>
  )
}
