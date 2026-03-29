import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ParchmentPanel } from '@/components/ui/ParchmentPanel'
import { useLessonStore } from '@/stores/lessonStore'
import { useTopicsStore } from '@/stores/topicsStore'
import { api } from '@/lib/api'
import { shuffleQuestions, scoreQuiz, getQuestionResult } from '@/lib/quizUtils'
import type { QuizQuestionDTO, UserProgressDTO } from '@dsa-quest/shared'

type Phase = 'answering' | 'reviewing' | 'result'

export function QuizView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const topicId = Number(id)
  const { quizQuestions, progress, setProgress } = useLessonStore()
  const { invalidate } = useTopicsStore()

  const [phase, setPhase] = useState<Phase>('answering')
  const [shuffled, setShuffled] = useState<QuizQuestionDTO[]>(() => shuffleQuestions(quizQuestions))
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    () => new Array(quizQuestions.length).fill(null)
  )
  const [scoreResult, setScoreResult] = useState<{
    score: number
    quizPassed: boolean
    correctCount: number
    total: number
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // If already passed, redirect to practice
  if (progress?.quizPassed) {
    navigate(`/topic/${topicId}/practice`, { replace: true })
    return null
  }

  const answeredCount = selectedAnswers.filter((a) => a !== null).length
  const allAnswered = answeredCount === shuffled.length

  function handleSelect(questionIndex: number, optionIndex: number) {
    if (phase !== 'answering') return
    setSelectedAnswers((prev) => {
      const next = [...prev]
      next[questionIndex] = optionIndex
      return next
    })
  }

  async function handleSubmit() {
    if (!allAnswered) return
    setIsSubmitting(true)
    setSubmitError(null)

    // Client-side scoring for immediate feedback
    const answers = selectedAnswers as number[]
    const result = scoreQuiz(answers, shuffled)
    setScoreResult(result)
    setPhase('reviewing')

    try {
      // Sort shuffled answers back to original question order by id before sending to server
      const sortedByOriginalId = [...shuffled]
        .map((q, i) => ({ id: q.id, answer: answers[i] }))
        .sort((a, b) => a.id - b.id)
      const serverAnswers = sortedByOriginalId.map((x) => x.answer)

      const res = await api.post<{ data: { progress: UserProgressDTO; score: number; quizPassed: boolean } }>(
        `/topics/${topicId}/quiz`,
        { answers: serverAnswers }
      )
      setProgress(res.data.data.progress)
      if (res.data.data.quizPassed) {
        invalidate() // trigger map re-render
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit quiz'
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
      setPhase('result')
    }
  }

  function handleRetry() {
    setShuffled(shuffleQuestions(quizQuestions))
    setSelectedAnswers(new Array(quizQuestions.length).fill(null))
    setScoreResult(null)
    setPhase('answering')
    setSubmitError(null)
  }

  if (quizQuestions.length === 0) {
    return (
      <ParchmentPanel className="px-8 py-10 text-center">
        <p className="font-heading text-brown">No questions found for this topic.</p>
      </ParchmentPanel>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ParchmentPanel className="px-8 py-8">
        <h2 className="font-heading text-2xl text-brown-dark mb-2">The Scroll Quiz</h2>
        <p className="font-body text-brown/70 text-sm mb-6">
          Answer all {shuffled.length} questions. You need &ge;80% to pass and unlock The Forge.
        </p>

        {phase !== 'result' && (
          <div className="space-y-6">
            {shuffled.map((q, qi) => {
              const selected = selectedAnswers[qi]
              const isReviewing = phase === 'reviewing'
              const result = isReviewing && selected !== null ? getQuestionResult(selected, q) : null

              return (
                <div
                  key={q.id}
                  className={[
                    'border rounded p-4',
                    isReviewing && result?.correct ? 'border-forest bg-forest/5' : '',
                    isReviewing && result && !result.correct ? 'border-crimson bg-crimson/5' : '',
                    !isReviewing ? 'border-brown/20' : '',
                  ].join(' ')}
                >
                  <p className="font-body text-brown-dark font-medium mb-3">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = selected === oi
                      const isCorrect = q.correctAnswer === oi
                      let optClass =
                        'border rounded px-3 py-2 text-sm font-body cursor-pointer transition-colors '
                      if (!isReviewing) {
                        optClass += isSelected
                          ? 'border-gold bg-gold/20 text-brown-dark'
                          : 'border-brown/20 hover:border-brown/50 text-brown'
                      } else {
                        if (isCorrect) optClass += 'border-forest bg-forest/20 text-forest font-semibold'
                        else if (isSelected && !isCorrect)
                          optClass += 'border-crimson bg-crimson/20 text-crimson'
                        else optClass += 'border-brown/10 text-brown/50'
                      }
                      return (
                        <div key={oi} className={optClass} onClick={() => handleSelect(qi, oi)}>
                          {opt}
                        </div>
                      )
                    })}
                  </div>
                  {isReviewing && result && !result.correct && (
                    <p className="mt-2 text-xs font-body text-brown/70 italic">{result.explanation}</p>
                  )}
                </div>
              )
            })}

            {phase === 'answering' && (
              <button
                className="btn-gold font-heading w-full py-3 mt-2 disabled:opacity-50"
                onClick={() => setPhase('reviewing')}
                disabled={!allAnswered}
              >
                {allAnswered
                  ? 'Review My Answers'
                  : `Answer all questions (${answeredCount}/${shuffled.length})`}
              </button>
            )}

            {phase === 'reviewing' && (
              <button
                className="btn-gold font-heading w-full py-3 mt-2 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Final Score'}
              </button>
            )}
          </div>
        )}

        {phase === 'result' && scoreResult && (
          <div className="text-center py-4">
            <div
              className={[
                'text-6xl font-heading mb-4',
                scoreResult.quizPassed ? 'text-forest' : 'text-crimson',
              ].join(' ')}
            >
              {scoreResult.score}%
            </div>
            <p
              className={[
                'font-heading text-xl mb-2',
                scoreResult.quizPassed ? 'text-forest' : 'text-crimson',
              ].join(' ')}
            >
              {scoreResult.quizPassed ? 'Quest Passed!' : 'Not enough - try again'}
            </p>
            <p className="font-body text-brown/70 text-sm mb-6">
              {scoreResult.correctCount} of {scoreResult.total} correct
            </p>
            {submitError && <p className="text-crimson text-sm mb-4">{submitError}</p>}
            {scoreResult.quizPassed ? (
              <button
                className="btn-gold font-heading px-10 py-3"
                onClick={() => navigate(`/topic/${topicId}/practice`)}
              >
                Enter The Forge
              </button>
            ) : (
              <button className="btn-wood font-heading px-10 py-3" onClick={handleRetry}>
                Try Again
              </button>
            )}
          </div>
        )}
      </ParchmentPanel>
    </div>
  )
}
