import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNavigate, useParams } from 'react-router-dom'
import { ParchmentPanel } from '@/components/ui/ParchmentPanel'
import { StageProgressBar } from './StageProgressBar'
import { useLessonStore } from '@/stores/lessonStore'

export function TheoryView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { topicInfo, progress, quizQuestions, isLoading } = useLessonStore()
  const topicId = Number(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="font-heading text-brown animate-pulse">Loading the ancient scrolls...</span>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Left: theory content */}
      <div className="flex-1 overflow-y-auto">
        <ParchmentPanel className="px-8 py-8">
          <div className="prose prose-stone max-w-none
            prose-headings:font-heading prose-headings:text-brown-dark
            prose-code:font-mono prose-code:text-ocean prose-code:bg-ocean/10 prose-code:px-1 prose-code:rounded
            prose-pre:bg-brown-dark prose-pre:text-parchment">
            <Markdown remarkPlugins={[remarkGfm]}>
              {topicInfo?.theoryContent || '*The scroll is being transcribed by the scribes...*'}
            </Markdown>
          </div>

          {/* Quiz gate: show "Begin Quiz" when theory is read */}
          {quizQuestions.length > 0 && !progress?.quizPassed && (
            <div className="mt-8 pt-6 border-t border-brown/20 text-center">
              <p className="font-body text-brown mb-4 text-sm">
                You have studied the scroll. Prove your knowledge to unlock The Forge.
              </p>
              <button
                className="btn-gold font-heading px-8 py-3"
                onClick={() => navigate(`/topic/${topicId}/quiz`)}
              >
                Take the Quiz
              </button>
            </div>
          )}
          {progress?.quizPassed && (
            <div className="mt-8 pt-6 border-t border-brown/20 text-center">
              <p className="font-heading text-forest text-sm">Quiz passed — The Forge awaits!</p>
              <button
                className="mt-3 btn-wood font-heading px-8 py-3"
                onClick={() => navigate(`/topic/${topicId}/practice`)}
              >
                Enter The Forge
              </button>
            </div>
          )}
        </ParchmentPanel>
      </div>

      {/* Right: stage progress tracker */}
      <div className="w-56 shrink-0">
        <ParchmentPanel className="px-4 py-5">
          <StageProgressBar progress={progress} />
        </ParchmentPanel>
      </div>
    </div>
  )
}
