import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdventureMap } from '@/components/map/AdventureMap'
import { Navbar } from '@/components/ui/Navbar'
import { useTopics } from '@/hooks/useTopics'
import type { NodeState } from '@dsa-quest/shared'

export function MapPage() {
  const { topics, isLoading } = useTopics()
  const navigate = useNavigate()

  // Derive node states from server-side nodeState field on each TopicWithProgressDTO
  const nodeStates = useMemo(() => {
    const map = new Map<number, NodeState>()
    for (const topic of topics) {
      // Map 'in-progress' to 'available' visually — TopicNode handles glowing/clickable for both
      const state = topic.nodeState === 'in-progress' ? 'available' : (topic.nodeState as NodeState)
      map.set(topic.order, state ?? 'locked')
    }
    return map
  }, [topics])

  function handleNodeSelect(order: number) {
    navigate(`/topic/${order}`)
  }

  return (
    <div className="fixed inset-0 overflow-hidden parchment-bg">
      <Navbar />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="scroll-panel text-center px-12 py-8">
            <div className="font-heading text-3xl text-brown-dark animate-pulse mb-2">
              Unrolling the map...
            </div>
            <p className="font-body text-brown italic text-sm">
              Charting the territories of algorithmic knowledge
            </p>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="absolute inset-0 pt-14">
          <AdventureMap nodeStates={nodeStates} onNodeSelect={handleNodeSelect} />
        </div>
      )}
    </div>
  )
}
