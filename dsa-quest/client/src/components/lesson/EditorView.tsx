import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MonacoEditor from '@monaco-editor/react'
import { ParchmentPanel } from '@/components/ui/ParchmentPanel'
import { TestResultTable } from './TestResultTable'
import { useLessonStore } from '@/stores/lessonStore'
import { useTopicsStore } from '@/stores/topicsStore'
import { createPyodideWorker, runPyodideTests } from '@/lib/pyodideWorker'
import { api } from '@/lib/api'
import type { TestResult, UserProgressDTO } from '@dsa-quest/shared'

interface Props {
  stage: 'practice' | 'challenge'
}

export function EditorView({ stage }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const topicId = Number(id)
  const { exercises, progress, setProgress } = useLessonStore()
  const { invalidate: invalidateTopics } = useTopicsStore()
  const exercise = exercises[stage]

  const [code, setCode] = useState<string>(exercise?.starterCode ?? '')
  const [results, setResults] = useState<TestResult[]>([])
  const [runError, setRunError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pyodideReady, setPyodideReady] = useState(false)

  // Persistent singleton worker — created on mount, terminated on unmount
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    workerRef.current = createPyodideWorker()
    // Worker loads Pyodide on first message — no preload needed
    setPyodideReady(true)
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  // Sync starter code when exercise changes (e.g., navigating between practice/challenge)
  useEffect(() => {
    if (exercise?.starterCode) setCode(exercise.starterCode)
  }, [exercise?.id])

  // Stage gate: redirect if prerequisites not met
  if (stage === 'practice' && progress !== null && !progress.quizPassed) {
    navigate(`/topic/${topicId}/theory`, { replace: true })
    return null
  }
  if (stage === 'challenge' && progress !== null && !progress.practiceCompleted) {
    navigate(`/topic/${topicId}/practice`, { replace: true })
    return null
  }

  if (!exercise) {
    return (
      <ParchmentPanel className="px-8 py-10 text-center">
        <p className="font-heading text-brown">No {stage} exercise found for this topic.</p>
      </ParchmentPanel>
    )
  }

  async function handleRunTests() {
    if (!workerRef.current || !exercise) return
    setIsRunning(true)
    setRunError(null)
    setResults([])

    try {
      const result = await runPyodideTests(
        workerRef.current,
        code,
        exercise.testCases,
        exercise.functionName
      )
      setResults(result.results)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setRunError(msg)
      // On timeout, terminate and recreate the worker so next run is fresh
      if (msg.includes('timed out')) {
        workerRef.current?.terminate()
        workerRef.current = createPyodideWorker()
      }
    } finally {
      setIsRunning(false)
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      const res = await api.post<{ data: { progress: UserProgressDTO } }>(
        `/topics/${topicId}/exercise/${stage}`,
        { attempts: 1 }
      )
      setProgress(res.data.data.progress)
      invalidateTopics()
      if (stage === 'practice') {
        navigate(`/topic/${topicId}/challenge`)
      } else {
        navigate('/')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submit failed'
      setRunError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const allTestsPassed = results.length > 0 && results.every((r) => r.passed)
  const stageLabel = stage === 'practice' ? 'The Forge' : 'The Arena'
  const stageIcon = stage === 'practice' ? '⚒' : '⚔'

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <ParchmentPanel className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{stageIcon}</span>
          <div>
            <h2 className="font-heading text-xl text-brown-dark">
              {stageLabel}: {exercise.title}
            </h2>
          </div>
        </div>
      </ParchmentPanel>

      {/* Main: problem description + editor */}
      <div className="flex gap-4 min-h-[500px]">
        {/* Left: problem description */}
        <div className="w-80 shrink-0">
          <ParchmentPanel className="px-5 py-5 h-full overflow-y-auto">
            <h3 className="font-heading text-sm text-brown-dark uppercase tracking-widest mb-3">
              The Challenge
            </h3>
            <p className="font-body text-brown text-sm whitespace-pre-wrap">{exercise.description}</p>
          </ParchmentPanel>
        </div>

        {/* Right: Monaco editor */}
        <div className="flex-1 flex flex-col">
          <div className="rounded overflow-hidden border border-brown/20 flex-1">
            <MonacoEditor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val ?? '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom: run button + results */}
      <ParchmentPanel className="px-6 py-5">
        <div className="flex items-center gap-4 mb-3">
          <button
            className="btn-gold font-heading px-8 py-2 disabled:opacity-50"
            onClick={() => void handleRunTests()}
            disabled={isRunning || !pyodideReady}
          >
            {isRunning ? 'Running...' : !pyodideReady ? 'Loading Python...' : 'Run Tests'}
          </button>
          {isRunning && (
            <span className="font-body text-xs text-brown/60 animate-pulse">
              Executing in Python sandbox (first run loads Pyodide ~5s)...
            </span>
          )}
        </div>

        {runError && (
          <div className="bg-crimson/10 border border-crimson/30 rounded px-4 py-3 mb-3">
            <p className="font-mono text-sm text-crimson">{runError}</p>
          </div>
        )}

        {results.length > 0 && <TestResultTable results={results} />}

        {/* Submit button — shown only when all tests pass */}
        {allTestsPassed && (
          <div className="mt-4 pt-4 border-t border-brown/20 text-center">
            <p className="font-body text-forest text-sm mb-3">
              All tests pass! Submit your solution.
            </p>
            <button
              className="btn-gold font-heading px-8 py-2 disabled:opacity-50"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Solution'}
            </button>
          </div>
        )}
      </ParchmentPanel>
    </div>
  )
}
