import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdventureMap } from '@/components/map/AdventureMap'
import { Navbar } from '@/components/ui/Navbar'
import { useTopics } from '@/hooks/useTopics'
import { useAuth } from '@/hooks/useAuth'
import type { NodeState } from '@dsa-quest/shared'

export function MapPage() {
  const { topics, isLoading } = useTopics()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Determine state of each topic node based on user's currentTopicId
  const nodeStates = useMemo(() => {
    const states = new Map<number, NodeState>()

    if (topics.length === 0) {
      return states
    }

    // currentTopicId = null → user hasn't started, topic 1 is available
    // currentTopicId = N → topics 1..N-1 are completed, N is available, N+1.. are locked
    const currentOrder = user?.currentTopicId
      ? topics.find((t) => t.id === user.currentTopicId)?.order ?? 1
      : 1

    topics.forEach((topic) => {
      if (topic.order < currentOrder) {
        states.set(topic.order, 'completed')
      } else if (topic.order === currentOrder) {
        states.set(topic.order, 'available')
      } else {
        states.set(topic.order, 'locked')
      }
    })

    return states
  }, [topics, user])

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
