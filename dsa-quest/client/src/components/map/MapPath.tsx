import { type TopicNodeConfig } from '@/lib/constants'

interface MapPathProps {
  from: TopicNodeConfig
  to: TopicNodeConfig
  state: 'locked' | 'available' | 'completed'
}

function cubicBezierPath(
  ax: number, ay: number,
  bx: number, by: number,
): string {
  const dx = bx - ax
  const dy = by - ay
  // Perpendicular offset for organic curve
  const perp = 0.18
  const perpX = -dy * perp
  const perpY = dx * perp

  const cp1x = ax + dx * 0.3 + perpX
  const cp1y = ay + dy * 0.3 + perpY
  const cp2x = ax + dx * 0.7 + perpX
  const cp2y = ay + dy * 0.7 + perpY

  return `M ${ax} ${ay} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${bx} ${by}`
}

// Node center radius offset
const NODE_R = 40

function offsetTowardB(ax: number, ay: number, bx: number, by: number, offset: number) {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.sqrt(dx * dx + dy * dy)
  return { x: ax + (dx / len) * offset, y: ay + (dy / len) * offset }
}

export function MapPath({ from, to, state }: MapPathProps) {
  const startOffset = offsetTowardB(from.x, from.y, to.x, to.y, NODE_R)
  const endOffset = offsetTowardB(to.x, to.y, from.x, from.y, NODE_R)
  const d = cubicBezierPath(startOffset.x, startOffset.y, endOffset.x, endOffset.y)

  const isLocked = state === 'locked'
  const isCompleted = state === 'completed'

  return (
    <g>
      {/* Shadow stroke */}
      <path
        d={d}
        fill="none"
        stroke={isLocked ? '#888' : '#3D2510'}
        strokeWidth={isLocked ? 5 : 8}
        opacity={isLocked ? 0.2 : 0.55}
        strokeLinecap="round"
      />
      {/* Main road */}
      <path
        d={d}
        fill="none"
        stroke={isLocked ? '#9E9E9E' : isCompleted ? '#7A4E2D' : '#7A4E2D'}
        strokeWidth={isLocked ? 3 : 5}
        opacity={isLocked ? 0.3 : 0.9}
        strokeLinecap="round"
      />
      {/* Gold centerline (dashed) */}
      {!isLocked && (
        <path
          d={d}
          fill="none"
          stroke={isCompleted ? '#E8BC4A' : '#D4A32E'}
          strokeWidth={isCompleted ? 3 : 2}
          opacity={isCompleted ? 0.9 : 0.6}
          strokeDasharray={isCompleted ? '0' : '14 10'}
          strokeLinecap="round"
        />
      )}
    </g>
  )
}
