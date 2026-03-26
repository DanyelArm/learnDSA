import { type ReactElement, useState } from 'react'
import { motion } from 'framer-motion'
import { type TopicNodeConfig } from '@/lib/constants'
import { type NodeState } from '@dsa-quest/shared'
import { NodeTooltip } from './NodeTooltip'

// Inline SVG icons for each topic type
function TopicIcon({ icon, state }: { icon: string; state: NodeState }) {
  const color = state === 'locked' ? '#9E9E9E' : state === 'mastered' ? '#3D2510' : '#FAF0DC'
  const size = 28

  const icons: Record<string, ReactElement> = {
    sigma: (
      <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle"
        fontSize={size} fontFamily="Georgia,serif" fill={color} fontWeight="bold">Σ</text>
    ),
    array: (
      <g>
        {[-12, -4, 4, 12].map((ox, i) => (
          <rect key={i} x={`${50 + ox - 4}%`} y="35%" width="6%" height="30%"
            fill={color} rx="1" opacity={0.9} />
        ))}
      </g>
    ),
    chain: (
      <g transform="translate(32,32)">
        <circle cx={-10} cy={0} r={8} fill="none" stroke={color} strokeWidth={3} />
        <circle cx={10} cy={0} r={8} fill="none" stroke={color} strokeWidth={3} />
        <rect x={-6} y={-3} width={12} height={6} fill={color} />
      </g>
    ),
    stack: (
      <g>
        {[0, 1, 2].map((i) => (
          <rect key={i} x="25%" y={`${30 + i * 14}%`} width="50%" height="10%"
            fill={color} rx="1" opacity={1 - i * 0.15} />
        ))}
      </g>
    ),
    queue: (
      <g>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={`${18 + i * 22}%`} y="35%" width="17%" height="28%"
            fill={color} rx="1" opacity={1 - i * 0.15} />
        ))}
      </g>
    ),
    hash: (
      <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle"
        fontSize={26} fontFamily="Georgia,serif" fill={color} fontWeight="bold">#</text>
    ),
    recurse: (
      <g transform="translate(32,32)">
        <path d="M -12 -12 Q 0 -20 12 -8 Q 20 0 8 12" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
        <polygon points="6,16 14,8 2,6" fill={color} />
      </g>
    ),
    sort: (
      <g>
        {[0.6, 0.8, 0.4, 1.0, 0.7].map((h, i) => (
          <rect key={i} x={`${15 + i * 15}%`} y={`${95 - h * 60}%`} width="10%"
            height={`${h * 60}%`} fill={color} rx="1" opacity={0.85} />
        ))}
      </g>
    ),
    search: (
      <g transform="translate(32,32)">
        <circle cx={-4} cy={-4} r={12} fill="none" stroke={color} strokeWidth={3} />
        <line x1={6} y1={6} x2={16} y2={16} stroke={color} strokeWidth={3} strokeLinecap="round" />
      </g>
    ),
    tree: (
      <g>
        <circle cx="50%" cy="25%" r="7%" fill={color} />
        <circle cx="30%" cy="55%" r="7%" fill={color} opacity={0.85} />
        <circle cx="70%" cy="55%" r="7%" fill={color} opacity={0.85} />
        <line x1="50%" y1="32%" x2="30%" y2="48%" stroke={color} strokeWidth={2} />
        <line x1="50%" y1="32%" x2="70%" y2="48%" stroke={color} strokeWidth={2} />
      </g>
    ),
    heap: (
      <g>
        <circle cx="50%" cy="22%" r="8%" fill={color} />
        <circle cx="28%" cy="48%" r="8%" fill={color} opacity={0.85} />
        <circle cx="72%" cy="48%" r="8%" fill={color} opacity={0.85} />
        <circle cx="17%" cy="74%" r="7%" fill={color} opacity={0.7} />
        <circle cx="39%" cy="74%" r="7%" fill={color} opacity={0.7} />
        <line x1="50%" y1="30%" x2="28%" y2="40%" stroke={color} strokeWidth={2} />
        <line x1="50%" y1="30%" x2="72%" y2="40%" stroke={color} strokeWidth={2} />
      </g>
    ),
    graph: (
      <g transform="translate(32,32)">
        {[[-14, -12], [14, -8], [0, 12], [-18, 8]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={5} fill={color} />
        ))}
        {[[0, 1], [1, 2], [0, 3], [2, 3]].map(([a, b], i) => {
          const pts = [[-14, -12], [14, -8], [0, 12], [-18, 8]]
          return <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]}
            stroke={color} strokeWidth={2} opacity={0.7} />
        })}
      </g>
    ),
    traverse: (
      <g transform="translate(32,32)">
        <circle cx={-14} cy={-8} r={7} fill="none" stroke={color} strokeWidth={2.5} />
        <circle cx={14} cy={-8} r={7} fill={color} />
        <circle cx={0} cy={12} r={7} fill="none" stroke={color} strokeWidth={2.5} />
        <line x1={-7} y1={-8} x2={7} y2={-8} stroke={color} strokeWidth={2} />
        <line x1={10} y1={-2} x2={4} y2={8} stroke={color} strokeWidth={2} />
      </g>
    ),
    dp: (
      <g>
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <rect key={`${row}-${col}`}
              x={`${20 + col * 22}%`} y={`${20 + row * 22}%`}
              width="18%" height="18%"
              fill={row === 2 && col === 2 ? color : 'none'}
              stroke={color} strokeWidth={1.5} rx="1"
              opacity={row === 2 && col === 2 ? 1 : 0.7} />
          ))
        )}
      </g>
    ),
    greedy: (
      <g transform="translate(32,32)">
        <polygon points="0,-18 -5,-5 -18,-5 -8,4 -12,18 0,10 12,18 8,4 18,-5 5,-5"
          fill={color} opacity={0.9} />
      </g>
    ),
    backtrack: (
      <g transform="translate(32,32)">
        <path d="M -10 -14 L 0 -20 L 10 -14 L 14 -4 L 14 8 L 0 8" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <path d="M 0 8 L -14 8 L -14 -4 L -10 -14" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="4 3" />
        <polygon points="0,8 -6,16 6,16" fill={color} />
      </g>
    ),
    trie: (
      <g>
        <circle cx="50%" cy="18%" r="7%" fill={color} />
        <circle cx="25%" cy="42%" r="6%" fill={color} opacity={0.85} />
        <circle cx="75%" cy="42%" r="6%" fill={color} opacity={0.85} />
        <circle cx="15%" cy="68%" r="5%" fill={color} opacity={0.7} />
        <circle cx="35%" cy="68%" r="5%" fill={color} opacity={0.7} />
        <circle cx="65%" cy="68%" r="5%" fill={color} opacity={0.7} />
        <circle cx="85%" cy="68%" r="5%" fill={color} opacity={0.7} />
        <line x1="50%" y1="25%" x2="25%" y2="36%" stroke={color} strokeWidth={2} />
        <line x1="50%" y1="25%" x2="75%" y2="36%" stroke={color} strokeWidth={2} />
        <line x1="25%" y1="48%" x2="15%" y2="63%" stroke={color} strokeWidth={1.5} />
        <line x1="25%" y1="48%" x2="35%" y2="63%" stroke={color} strokeWidth={1.5} />
        <line x1="75%" y1="48%" x2="65%" y2="63%" stroke={color} strokeWidth={1.5} />
        <line x1="75%" y1="48%" x2="85%" y2="63%" stroke={color} strokeWidth={1.5} />
      </g>
    ),
    union: (
      <g transform="translate(32,32)">
        {[[-13, -8], [5, -8], [-13, 10], [5, 10]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={6} fill="none" stroke={color} strokeWidth={2} />
        ))}
        <rect x={-20} y={-16} width={16} height={36} fill="none" stroke={color} strokeWidth={1.5} rx={3} opacity={0.6} />
        <rect x={-2} y={-16} width={16} height={36} fill="none" stroke={color} strokeWidth={1.5} rx={3} opacity={0.6} />
      </g>
    ),
    advanced: (
      <g transform="translate(32,32)">
        {[-16, -8, 0, 8, 16].map((x, i) => (
          <rect key={i} x={x - 3} y={-14 + Math.abs(i - 2) * 3} width={6}
            height={28 - Math.abs(i - 2) * 6} fill={color} rx={1} opacity={0.85} />
        ))}
      </g>
    ),
  }

  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      {icons[icon] ?? icons.sigma}
    </svg>
  )
}

// Visual config per state
const STATE_CONFIG: Record<NodeState, {
  outerBg: string
  innerBg: string
  border: string
  textColor: string
  badge?: string
}> = {
  locked: {
    outerBg: 'bg-gray-400/30',
    innerBg: 'bg-gray-400/40',
    border: 'border-gray-500/40',
    textColor: 'text-gray-500',
  },
  available: {
    outerBg: 'bg-gold/20',
    innerBg: 'bg-brown',
    border: 'border-gold',
    textColor: 'text-parchment-light',
    badge: '⚡',
  },
  completed: {
    outerBg: 'bg-brown/20',
    innerBg: 'bg-brown-dark',
    border: 'border-gold/70',
    textColor: 'text-parchment',
    badge: '★',
  },
  mastered: {
    outerBg: 'bg-gold/30',
    innerBg: 'bg-gold',
    border: 'border-gold',
    textColor: 'text-brown-dark',
    badge: '♛',
  },
}

interface TopicNodeProps {
  node: TopicNodeConfig
  state: NodeState
  onSelect?: (order: number) => void
}

export function TopicNode({ node, state, onSelect }: TopicNodeProps) {
  const [hovered, setHovered] = useState(false)
  const cfg = STATE_CONFIG[state]
  const isLocked = state === 'locked'
  const isAvailable = state === 'available'
  const isMastered = state === 'mastered'

  // The node div is absolute within the world canvas
  const NODE_SIZE = 80
  const halfNode = NODE_SIZE / 2

  return (
    <>
      <motion.div
        className="absolute select-none"
        animate={isAvailable ? { y: [0, -5, 0] } : {}}
        transition={isAvailable ? { duration: 3, repeat: Infinity, ease: 'easeInOut' as const } : {}}
        style={{
          left: node.x - halfNode,
          top: node.y - halfNode,
          width: NODE_SIZE,
          height: NODE_SIZE,
          cursor: isLocked ? 'not-allowed' : 'pointer',
        }}
        whileHover={!isLocked ? { scale: 1.12 } : {}}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => !isLocked && onSelect?.(node.order)}
      >
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 rounded-full ${cfg.outerBg} border-2 ${cfg.border} transition-all duration-300`}
          style={
            isAvailable
              ? { boxShadow: '0 0 20px rgba(212,163,46,0.7), 0 0 40px rgba(212,163,46,0.3)' }
              : isMastered
              ? { boxShadow: '0 0 25px rgba(212,163,46,0.9), 0 0 50px rgba(212,163,46,0.5)' }
              : {}
          }
        />

        {/* Inner circle */}
        <div
          className={`absolute inset-2 rounded-full ${cfg.innerBg} border-2 ${cfg.border} flex items-center justify-center overflow-hidden`}
          style={isLocked ? { filter: 'grayscale(1)' } : {}}
        >
          {isLocked ? (
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-500" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          ) : (
            <TopicIcon icon={node.icon} state={state} />
          )}
        </div>

        {/* Order badge */}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-heading"
          style={{
            background: isLocked ? '#9E9E9E' : '#D4A32E',
            color: isLocked ? '#666' : '#3D2510',
            border: '1px solid rgba(0,0,0,0.3)',
            fontSize: 9,
            fontWeight: 'bold',
          }}
        >
          {node.order}
        </div>

        {/* State badge (star/crown) */}
        {cfg.badge && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center"
            style={{ fontSize: 14, lineHeight: 1 }}
          >
            {cfg.badge}
          </div>
        )}
      </motion.div>

      {/* Label below node */}
      <div
        className="absolute text-center pointer-events-none"
        style={{
          left: node.x - 55,
          top: node.y + halfNode + 6,
          width: 110,
        }}
      >
        <span
          className={`font-heading text-xs leading-tight ${
            isLocked ? 'text-gray-500' : 'text-brown-dark'
          } drop-shadow-[0_1px_1px_rgba(245,230,200,0.8)]`}
          style={{ textShadow: '0 1px 2px rgba(245,230,200,0.9)' }}
        >
          {node.shortLabel}
        </span>
      </div>

      {/* Tooltip */}
      {hovered && (
        <NodeTooltip node={node} state={state} x={node.x + halfNode} y={node.y - halfNode} />
      )}
    </>
  )
}
