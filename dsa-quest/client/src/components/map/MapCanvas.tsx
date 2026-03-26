import { TOPIC_NODES, WORLD_WIDTH, WORLD_HEIGHT } from '@/lib/constants'
import { MapPath } from './MapPath'
import { TerrainLayer } from './TerrainLayer'
import type { NodeState } from '@dsa-quest/shared'

interface MapCanvasProps {
  nodeStates: Map<number, NodeState>
}

function getPathState(fromOrder: number, nodeStates: Map<number, NodeState>): 'locked' | 'available' | 'completed' {
  const state = nodeStates.get(fromOrder)
  if (state === 'completed' || state === 'mastered') return 'completed'
  if (state === 'available') return 'available'
  return 'locked'
}

export function MapCanvas({ nodeStates }: MapCanvasProps) {
  return (
    <svg
      width={WORLD_WIDTH}
      height={WORLD_HEIGHT}
      viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
      style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
    >
      <defs>
        {/* Parchment grain filter */}
        <filter id="parchment-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
          <feComponentTransfer in="grayNoise" result="adjustedNoise">
            <feFuncA type="linear" slope="0.06" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="adjustedNoise" mode="multiply" result="blended" />
        </filter>

        {/* Gold glow filter for available nodes */}
        <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feColorMatrix type="matrix"
            values="1 0.8 0 0 0  0.8 0.6 0 0 0  0 0.2 0 0 0  0 0 0 1 0"
            in="blur" result="colored" />
          <feMerge>
            <feMergeNode in="colored" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Parchment background */}
      <rect
        x={0} y={0}
        width={WORLD_WIDTH}
        height={WORLD_HEIGHT}
        fill="#F5E6C8"
        filter="url(#parchment-grain)"
      />
      {/* Subtle overlay gradients for depth */}
      <rect x={0} y={0} width={WORLD_WIDTH} height={WORLD_HEIGHT}
        fill="url(#depth-grad)" opacity={0.4}
      />

      <defs>
        <radialGradient id="depth-grad" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#F5E6C8" stopOpacity="0" />
          <stop offset="100%" stopColor="#5C3A1E" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {/* Terrain decorations (below paths) */}
      <TerrainLayer />

      {/* Connecting paths between nodes */}
      {TOPIC_NODES.slice(0, -1).map((node, i) => {
        const nextNode = TOPIC_NODES[i + 1]
        const pathState = getPathState(node.order, nodeStates)
        return (
          <MapPath key={node.order} from={node} to={nextNode} state={pathState} />
        )
      })}
    </svg>
  )
}
