---
phase: 02-lesson-flow
plan: "06"
subsystem: editor
tags: [pyodide, monaco, web-worker, typescript, react, python-execution]

# Dependency graph
requires:
  - phase: 02-02
    provides: shared types (TestCase, TestResult, ExerciseDTO, UserProgressDTO)

provides:
  - Pyodide Web Worker (module-type ESM, loads from CDN, executes Python test cases)
  - Main-thread pyodideWorker.ts wrapper with persistent singleton pattern and 10s timeout
  - EditorView.tsx: Monaco editor with Python syntax highlighting and stage-gated layout
  - TestResultTable.tsx: per-row input/expected/actual/stdout/pass-fail table
  - 6 passing protocol shape unit tests for the worker message interface

affects:
  - 02-07 (practice/challenge routes wiring EditorView)
  - 02-08 (end-to-end lesson flow verification)

# Tech tracking
tech-stack:
  added:
    - pyodide (npm, loaded from CDN at runtime — not bundled)
    - "@monaco-editor/react"
  patterns:
    - Persistent singleton Web Worker: created in useEffect on mount, terminated on unmount
    - Timeout enforcement on main thread via setTimeout 10000ms; worker.terminate() + recreate on timeout
    - Module-type worker (ESM) required for Pyodide 0.29.3 compatibility — importScripts() forbidden
    - runPyodideTests accepts Worker instance externally (not created internally) enabling singleton control

key-files:
  created:
    - dsa-quest/client/src/workers/pyodide.worker.ts
    - dsa-quest/client/src/lib/pyodideWorker.ts
    - dsa-quest/client/src/components/lesson/EditorView.tsx
    - dsa-quest/client/src/components/lesson/TestResultTable.tsx
  modified:
    - dsa-quest/client/src/__tests__/pyodideWorker.test.ts
    - dsa-quest/client/package.json

key-decisions:
  - "Pyodide loaded from CDN (cdn.jsdelivr.net/pyodide/v0.29.3/full/) — never bundled into Vite (avoids 8MB WASM in bundle)"
  - "Worker singleton managed in EditorView useEffect: one worker per component mount, terminated on unmount"
  - "Timeout rejects the Promise on main thread; worker.terminate() called; new worker created for subsequent runs"
  - "Submit handler in EditorView calls POST /topics/:id/exercise/:stage and navigates on success"
  - "Stage gate: practice requires quizPassed; challenge requires practiceCompleted — checked against lessonStore.progress"

patterns-established:
  - "Worker pattern: new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url), { type: 'module' })"
  - "Test run result: { results: TestResult[] } from runPyodideTests(); error thrown on Python exceptions or timeout"
  - "EditorView used by both /topic/:id/practice and /topic/:id/challenge via stage prop"

requirements-completed: [LESS-03, LESS-04]

# Metrics
duration: 165min
completed: "2026-03-29"
---

# Phase 2 Plan 06: Monaco Editor + Pyodide Web Worker Summary

**Pyodide ESM Web Worker with 10s timeout, Monaco Python editor, and per-row test result table delivered as persistent singleton pattern**

## Performance

- **Duration:** ~165 min
- **Started:** 2026-03-29T18:16:22Z
- **Completed:** 2026-03-29T21:00:00Z
- **Tasks:** 2
- **Files modified/created:** 6

## Accomplishments

- Pyodide Web Worker (ESM module-type) loading Python runtime from CDN with stdout capture and per-test-case execution
- Main-thread wrapper with persistent singleton factory, 10-second timeout enforcement, and worker recreation on timeout
- EditorView component: Monaco editor (Python, vs-dark theme) left/right layout with description panel and stage gate redirects
- TestResultTable: structured table with input, expected, actual, stdout, and pass/fail columns
- 6 unit tests passing for worker message protocol shapes and timeout constant

## Task Commits

Each task was committed atomically:

1. **Task 1: Install packages + Pyodide worker + main-thread wrapper** - `39e5741` (feat)
2. **Task 2 (test/RED): Pyodide worker protocol tests** - `036509e` (test)
3. **Task 2 (feat/GREEN): EditorView + TestResultTable** - `17b04ef` (feat)

## Files Created/Modified

- `dsa-quest/client/src/workers/pyodide.worker.ts` - Module-type ESM worker; loads Pyodide from CDN, runs Python test cases with stdout capture
- `dsa-quest/client/src/lib/pyodideWorker.ts` - Main-thread wrapper: createPyodideWorker() factory, runPyodideTests() with 10s timeout
- `dsa-quest/client/src/components/lesson/EditorView.tsx` - Monaco editor component with Pyodide singleton, stage gate, run/submit handlers
- `dsa-quest/client/src/components/lesson/TestResultTable.tsx` - Test results table (input | expected | actual | stdout | pass/fail)
- `dsa-quest/client/src/__tests__/pyodideWorker.test.ts` - 6 protocol shape unit tests (replaced stubs)
- `dsa-quest/client/package.json` - Added pyodide and @monaco-editor/react dependencies

## Decisions Made

- Pyodide loaded from CDN at runtime to avoid adding ~8MB WASM binary to the Vite bundle
- Worker singleton created in EditorView useEffect; terminated on unmount to prevent memory leaks
- Timeout fires on main thread (10s), terminates worker, recreates fresh worker for next run
- Stage gate uses `progress !== null &&` guard to avoid redirect on initial load before data arrives
- Submit logic placed inline in EditorView (no sub-component) to keep component surface area manageable

## Deviations from Plan

None - plan executed exactly as written. The SubmitButton complexity described in plan action was simplified as noted (inline submit handler in EditorView directly, as the plan's own NOTE advised).

## Issues Encountered

None. TypeScript clean on first compile. Existing tsconfig.app.json lib `["ES2023", "DOM", "DOM.Iterable"]` was sufficient for the worker file without needing to add "WebWorker" separately.

## Known Stubs

None. EditorView reads real exercises from lessonStore, runs real Pyodide execution, and submits to a real API endpoint. Plan 07 wires EditorView into actual route pages.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- EditorView ready to be wired into /topic/:id/practice and /topic/:id/challenge routes (Plan 07)
- Pyodide loads lazily on first "Run Tests" click — no warm-up preload required
- Worker singleton pattern prevents re-initialization delay on subsequent runs within same session

---
*Phase: 02-lesson-flow*
*Completed: 2026-03-29*
