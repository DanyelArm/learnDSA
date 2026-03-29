// CRITICAL: Must be a module-type worker. Pyodide 0.29.3 is ESM — incompatible with importScripts().
// Load Pyodide from CDN — never import WASM into the Vite bundle (~8 MB).
import { loadPyodide, type PyodideInterface } from 'pyodide'
import type { TestCase, TestResult } from '@dsa-quest/shared'

let pyodide: PyodideInterface | null = null

async function getPyodide(): Promise<PyodideInterface> {
  if (pyodide) return pyodide
  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
  })
  return pyodide
}

interface RunRequest {
  id: string
  code: string
  testCases: TestCase[]
  functionName: string
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { id, code, testCases, functionName } = event.data
  try {
    const py = await getPyodide()
    const results: TestResult[] = []

    for (const tc of testCases) {
      // Redirect stdout before each test case
      py.runPython(`
import sys, io
_stdout_capture = io.StringIO()
sys.stdout = _stdout_capture
`)
      // Load user code into Pyodide global namespace
      await py.runPythonAsync(code)

      // Call user function with test input arguments
      const inputJson = JSON.stringify(tc.input)
      const returnVal = await py.runPythonAsync(`${functionName}(*${inputJson})`)

      // Restore stdout and capture output
      const stdout: string = py.runPython(
        `_out = _stdout_capture.getvalue(); sys.stdout = sys.__stdout__; _out`
      )

      const actual = returnVal === undefined ? null : returnVal
      results.push({
        input: tc.input,
        expected: tc.expected,
        actual,
        stdout,
        passed: JSON.stringify(actual) === JSON.stringify(tc.expected),
      })
    }

    self.postMessage({ id, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    self.postMessage({ id, error: message })
  }
}
