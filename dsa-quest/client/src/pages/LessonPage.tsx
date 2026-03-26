import { useParams, useNavigate } from 'react-router-dom'
import { TOPIC_NODES } from '@/lib/constants'
import { Navbar } from '@/components/ui/Navbar'
import { ParchmentPanel } from '@/components/ui/ParchmentPanel'

export function LessonPage() {
  const { order } = useParams<{ order: string }>()
  const navigate = useNavigate()
  const topicOrder = Number(order)
  const node = TOPIC_NODES.find((n) => n.order === topicOrder)

  if (!node) {
    return (
      <div className="fixed inset-0 parchment-bg flex items-center justify-center">
        <Navbar />
        <ParchmentPanel className="text-center px-12 py-8">
          <p className="font-heading text-2xl text-brown-dark">Topic not found.</p>
          <button
            className="mt-4 font-heading text-gold underline"
            onClick={() => navigate('/')}
          >
            ← Back to Map
          </button>
        </ParchmentPanel>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 parchment-bg overflow-y-auto">
      <Navbar />
      <div className="max-w-3xl mx-auto pt-24 pb-16 px-6">
        <button
          className="mb-6 font-heading text-sm text-brown hover:text-gold transition-colors"
          onClick={() => navigate('/')}
        >
          ← Back to Map
        </button>

        <ParchmentPanel className="px-8 py-10">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#D4A32E', color: '#3D2510' }}
            >
              {node.order}
            </span>
            <h1 className="font-heading text-3xl text-brown-dark">{node.label}</h1>
          </div>

          <div className="mt-8 text-center text-brown/60 font-body italic text-sm">
            Lesson content coming soon — Phase 2 in progress.
          </div>
        </ParchmentPanel>
      </div>
    </div>
  )
}
