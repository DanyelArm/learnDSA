import { useRef, useEffect } from 'react'
import { useMapTransform } from '@/hooks/useMapTransform'
import { TOPIC_NODES, WORLD_WIDTH, WORLD_HEIGHT } from '@/lib/constants'
import { MapCanvas } from './MapCanvas'
import { TopicNode } from './TopicNode'
import { MapLegend } from './MapLegend'
import { useUIStore } from '@/stores/uiStore'
import type { NodeState } from '@dsa-quest/shared'

interface AdventureMapProps {
  nodeStates: Map<number, NodeState>
  onNodeSelect?: (order: number) => void
}

export function AdventureMap({ nodeStates, onNodeSelect }: AdventureMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const transform = useMapTransform(containerRef)
  const { setMapTransform } = useUIStore()

  // Center map on mount — show start of the journey (bottom-left area)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const scale = 0.68
    // Center view on the starting node area (first few nodes, bottom-left)
    const focusX = TOPIC_NODES[0].x * scale
    const focusY = TOPIC_NODES[0].y * scale
    const x = rect.width * 0.25 - focusX
    const y = rect.height * 0.7 - focusY
    setMapTransform({ x, y, scale })
  }, [setMapTransform])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ cursor: 'grab', touchAction: 'none' }}
    >
      {/* The virtual world — everything inside is panned/zoomed */}
      <div
        style={{
          width: WORLD_WIDTH,
          height: WORLD_HEIGHT,
          position: 'absolute',
          transformOrigin: '0 0',
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          willChange: 'transform',
        }}
      >
        {/* SVG layer: background, terrain, paths */}
        <MapCanvas nodeStates={nodeStates} />

        {/* HTML layer: topic nodes (positioned absolutely over SVG) */}
        {TOPIC_NODES.map((node) => (
          <TopicNode
            key={node.order}
            node={node}
            state={nodeStates.get(node.order) ?? 'locked'}
            onSelect={onNodeSelect}
          />
        ))}
      </div>

      {/* Fixed UI overlays (outside the transform) */}
      <MapLegend />

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1">
        <button
          className="w-8 h-8 rounded bg-brown-dark/80 border border-gold/30 text-gold font-heading text-lg hover:bg-brown transition-colors flex items-center justify-center"
          onClick={() => {
            const t = transform
            const newScale = Math.min(t.scale * 1.2, 2.0)
            setMapTransform({ ...t, scale: newScale })
          }}
        >
          +
        </button>
        <button
          className="w-8 h-8 rounded bg-brown-dark/80 border border-gold/30 text-gold font-heading text-lg hover:bg-brown transition-colors flex items-center justify-center"
          onClick={() => {
            const t = transform
            const container = containerRef.current
            const minScale = container
              ? Math.max(container.clientWidth / WORLD_WIDTH, container.clientHeight / WORLD_HEIGHT)
              : 0
            const newScale = Math.max(t.scale * 0.8, minScale)
            setMapTransform({ ...t, scale: newScale })
          }}
        >
          −
        </button>
        <button
          className="w-8 h-8 rounded bg-brown-dark/80 border border-gold/30 text-gold font-heading text-xs hover:bg-brown transition-colors flex items-center justify-center mt-1"
          title="Reset view"
          onClick={() => {
            if (!containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            const scale = 0.68
            const focusX = TOPIC_NODES[0].x * scale
            const focusY = TOPIC_NODES[0].y * scale
            setMapTransform({ x: rect.width * 0.25 - focusX, y: rect.height * 0.7 - focusY, scale })
          }}
        >
          ⌂
        </button>
      </div>

      {/* Tip */}
      <div className="absolute top-16 right-4 z-10 text-xs text-brown/60 font-body italic select-none pointer-events-none">
        Scroll to zoom · Drag to pan
      </div>
    </div>
  )
}
