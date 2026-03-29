import { useParams, useNavigate, Outlet, Navigate } from 'react-router-dom'
import { Navbar } from '@/components/ui/Navbar'
import { useLesson } from '@/hooks/useLesson'
import { TOPIC_NODES } from '@/lib/constants'

export function LessonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const topicId = Number(id)
  const { isLoading, error } = useLesson(topicId)

  const node = TOPIC_NODES.find((n) => n.order === topicId)

  if (!node) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="fixed inset-0 parchment-bg overflow-y-auto">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-20 pb-16 px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <button
            className="font-heading text-sm text-brown hover:text-gold transition-colors"
            onClick={() => navigate('/')}
          >
            Back to Map
          </button>
          <span className="text-brown/30">|</span>
          <span className="font-heading text-sm text-brown-dark">{node.label}</span>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <span className="font-heading text-brown animate-pulse">Preparing your quest...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="font-body text-crimson">{error}</p>
          </div>
        )}

        {!isLoading && !error && <Outlet />}
      </div>
    </div>
  )
}
