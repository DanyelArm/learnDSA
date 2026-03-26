import { getLevelFromXP } from '@/lib/constants'

interface GoldBadgeProps {
  xp: number
  level: number
}

export function GoldBadge({ xp, level }: GoldBadgeProps) {
  const { progress } = getLevelFromXP(xp)

  return (
    <div className="flex items-center gap-2 bg-brown-dark/80 rounded-full px-3 py-1 border border-gold/50">
      {/* Level badge */}
      <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center border-2 border-gold-dark shadow-node-glow">
        <span className="text-brown-dark font-heading text-xs font-bold">{level}</span>
      </div>

      {/* XP bar */}
      <div className="flex flex-col min-w-[80px]">
        <span className="text-gold text-xs font-heading leading-none">{xp.toLocaleString()} XP</span>
        <div className="h-1.5 bg-brown-dark rounded-full mt-0.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-dark to-gold-light rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
