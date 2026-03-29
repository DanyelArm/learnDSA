// PERSISTENT SINGLETON pattern — worker is created once per EditorView mount.
// Do NOT create a new worker per run click (would cause 3-8 second Pyodide re-init).
import type { TestCase, TestResult } from '@dsa-quest/shared'

const TIMEOUT_MS = 10_000

export interface TestRunResult {
  results: TestResult[]
}

// The worker instance is managed externally (created in useEffect, passed in)
export function runPyodideTests(
  worker: Worker,
  code: string,
  testCases: TestCase[],
  functionName: string
): Promise<TestRunResult> {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID()

    const timer = setTimeout(() => {
      reject(new Error('Execution timed out after 10 seconds'))
      // Note: caller must handle worker.terminate() after timeout — worker cannot be reused after timeout
    }, TIMEOUT_MS)

    function handleMessage(e: MessageEvent) {
      if (e.data.id !== id) return
      clearTimeout(timer)
      worker.removeEventListener('message', handleMessage)
      if (e.data.error) {
        reject(new Error(e.data.error))
      } else {
        resolve({ results: e.data.results as TestResult[] })
      }
    }

    function handleError(e: ErrorEvent) {
      clearTimeout(timer)
      worker.removeEventListener('error', handleError)
      reject(new Error(e.message))
    }

    worker.addEventListener('message', handleMessage)
    worker.addEventListener('error', handleError)
    worker.postMessage({ id, code, testCases, functionName })
  })
}

// Factory: creates a new persistent singleton worker for an EditorView session
export function createPyodideWorker(): Worker {
  return new Worker(
    new URL('../workers/pyodide.worker.ts', import.meta.url),
    { type: 'module' }
  )
}
