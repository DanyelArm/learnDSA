import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { ParchmentPanel } from '@/components/ui/ParchmentPanel'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div
      className="min-h-screen flex items-center justify-center parchment-bg relative overflow-hidden"
    >
      {/* Background vignette */}
      <div className="absolute inset-0 bg-vignette pointer-events-none" />

      {/* Decorative corner elements */}
      <div className="absolute top-8 left-8 text-6xl opacity-20 select-none">⚔️</div>
      <div className="absolute top-8 right-8 text-6xl opacity-20 select-none rotate-12">🗺️</div>
      <div className="absolute bottom-8 left-8 text-6xl opacity-20 select-none -rotate-12">🏰</div>
      <div className="absolute bottom-8 right-8 text-6xl opacity-20 select-none">🐉</div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Title banner */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-5xl text-brown-dark tracking-wider drop-shadow-md">
            DSA Quest
          </h1>
          <p className="font-body text-brown mt-2 italic text-sm">
            "Knowledge is the greatest weapon"
          </p>
        </div>

        <ParchmentPanel title="Enter the Realm">
          <LoginForm />
        </ParchmentPanel>
      </div>
    </div>
  )
}
