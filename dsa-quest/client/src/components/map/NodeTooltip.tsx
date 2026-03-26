import { type TopicNodeConfig } from '@/lib/constants'
import { type NodeState } from '@dsa-quest/shared'

const XP_MAP = { theory: 50, practice: 100, challenge: 200 }

const STATE_LABEL: Record<NodeState, string> = {
  locked: '🔒 Locked',
  available: '🟡 Available',
  completed: '✅ Completed',
  mastered: '🏆 Mastered',
}

interface NodeTooltipProps {
  node: TopicNodeConfig
  state: NodeState
  x: number
  y: number
}

export function NodeTooltip({ node, state, x, y }: NodeTooltipProps) {
  const isLocked = state === 'locked'

  return (
    <div
      className="absolute z-50 pointer-events-none select-none"
      style={{
        left: x + 65,
        top: y - 20,
        minWidth: 220,
      }}
    >
      <div
        className="rounded-lg border-2 border-brown-light shadow-scroll text-sm"
        style={{
          background: 'linear-gradient(135deg, #FAF0DC 0%, #F5E6C8 100%)',
          padding: '12px 14px',
        }}
      >
        {/* Topic title */}
        <p className="font-heading text-brown-dark text-base leading-tight mb-1">
          {node.order}. {node.label}
        </p>

        {/* State badge */}
        <p className="text-xs text-brown mb-3">{STATE_LABEL[state]}</p>

        {!isLocked && (
          <>
            <div className="border-t border-brown-light/50 pt-2 space-y-1">
              {(['theory', 'practice', 'challenge'] as const).map((stage) => (
                <div key={stage} className="flex justify-between items-center">
                  <span className="text-brown capitalize font-body">{stage}</span>
                  <span className="text-gold-dark font-heading text-xs">+{XP_MAP[stage]} XP</span>
                </div>
              ))}
            </div>
            <div className="border-t border-brown-light/50 mt-2 pt-2">
              <span className="text-brown text-xs font-body italic">
                Total: {XP_MAP.theory + XP_MAP.practice + XP_MAP.challenge} XP
              </span>
            </div>
          </>
        )}

        {isLocked && (
          <p className="text-brown/60 text-xs italic font-body">
            Complete previous topics to unlock
          </p>
        )}
      </div>
    </div>
  )
}
