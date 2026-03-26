import { useAuth } from '@/hooks/useAuth'
import { GoldBadge } from './GoldBadge'
import { useNavigate } from 'react-router-dom'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6"
      style={{
        background: 'linear-gradient(to bottom, rgba(61,37,16,0.95) 0%, rgba(61,37,16,0.85) 100%)',
        borderBottom: '2px solid rgba(212,163,46,0.4)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">⚔️</span>
        <span className="font-heading text-gold text-xl tracking-wider">DSA Quest</span>
      </div>

      {/* Center: Sandbox link */}
      <button
        className="font-heading text-parchment/80 hover:text-gold text-sm tracking-wide transition-colors"
        onClick={() => navigate('/')}
      >
        ⚗️ The Laboratory
      </button>

      {/* Right: XP + user */}
      {user && (
        <div className="flex items-center gap-3">
          <GoldBadge xp={user.xp} level={user.level} />
          <div className="relative group">
            <button className="font-heading text-parchment text-sm hover:text-gold transition-colors flex items-center gap-1">
              🧙 {user.username}
              <span className="text-xs opacity-60">▾</span>
            </button>
            {/* Dropdown — pt-2 bridges the gap so hover stays active */}
            <div className="absolute right-0 top-full pt-2 hidden group-hover:block min-w-[120px]">
            <div className="bg-brown-dark border border-gold/30 rounded shadow-scroll">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-parchment font-body text-sm hover:bg-brown hover:text-gold transition-colors"
              >
                🚪 Retreat
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
