# Phase 2: Lesson Flow - Research

**Researched:** 2026-03-29
**Domain:** Monaco Editor, Pyodide Web Worker, Prisma schema migration, React markdown rendering, React Router nested routes, Zustand lesson store
**Confidence:** HIGH (stack and architecture well-documented; Pyodide patterns verified via official source; all other libraries verified via official docs/repos)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**DB Schema Changes**
- Add `UserProgress` model: `{ userId, topicId, theoryCompleted, quizScore, quizPassed, practiceCompleted, practiceAttempts, challengeCompleted, challengeAttempts, hintsUsed, xpEarned }`
- Add `QuizQuestion` model: `{ id, topicId, question, options[], correctAnswer, explanation }`
- Add `Exercise` model: `{ id, topicId, stage (practice | challenge), title, description, starterCode, testCases[], hints[3], timeBonusThreshold }`
- Migrate existing single-integer `progress` field on `User` to use `UserProgress` table for per-stage tracking
- Keep `Topic` model; add `theoryContent` (markdown string) and `visualizationType` fields (already in Phase 1 schema, currently empty)

**Stage Ordering**
- Theory → Practice → Challenge — hard gate; cannot skip stages
- Cannot access Practice until `quizPassed = true` in `UserProgress`
- Cannot access Challenge until `practiceCompleted = true`
- Completing Challenge sets `challengeCompleted = true` and triggers unlock of next topic

**Quiz Component**
- 5–8 multiple-choice questions per topic
- Score = (correct / total) × 100
- Requires ≥80% to pass (mark `quizPassed = true`)
- Unlimited retries — questions reshuffled on retry
- Show correct/incorrect feedback per question after submission
- Show score and pass/fail result; if fail, show "Try Again" button

**Code Execution (Monaco + Pyodide)**
- Monaco Editor for Python code input, dark theme, Python syntax highlighting
- Pyodide loads in a **Web Worker** (never on main thread)
- Execution timeout: 10 seconds (terminate worker and show timeout error)
- Capture both `stdout` (print statements) and function return value
- Test case verification: call the user's function with test inputs, compare return value + stdout against expected
- Test result display: table showing `input | expected output | actual output | pass/fail` per test case
- All tests must pass to mark stage complete
- Show "Run Tests" button; hide "Submit" until all visible tests pass (or use one "Run & Submit" button)

**Layout**
- **Theory screen:** Left panel = markdown content; Right panel = stage progress tracker / mini-map
- **Practice/Challenge screen:** Left panel = problem description + constraints; Right panel = Monaco editor; Bottom = test results panel
- Adventure-map styling: parchment textures, carved-wood buttons, scroll-style content panels

**Content Storage**
- All lessons, quiz questions, exercises, and test cases stored as JSON/markdown files in `client/src/content/`
- Phase 2 only needs **one complete sample topic** (e.g., "Arrays & Strings" — topic 2 or "Big-O" — topic 1) to validate the full flow works end-to-end
- Remaining 19 topics get content in Phase 5
- Content schema must match the DB models so Phase 5 can seed without schema changes

**Linear Unlock Logic**
- Topic unlock state derived from `UserProgress`: topic N is unlocked iff topic N-1 has `challengeCompleted = true` (or topic order === 1)
- Topic 1 (Big-O) is always unlocked on account creation
- Map node states: `locked` | `available` | `in-progress` | `completed`
- `in-progress` = UserProgress row exists but challenge not complete
- `completed` = `challengeCompleted = true`
- Map node visual state updates in real-time after stage completion (no full page reload)

**API Endpoints Needed**
- `GET /api/topics/:id/progress` — return UserProgress for current user + topic
- `POST /api/topics/:id/quiz` — submit quiz answers, calculate score, update UserProgress
- `POST /api/topics/:id/exercise/:stage` — mark practice/challenge complete (called after client-side Pyodide passes all tests)
- `GET /api/topics` (already exists) — extend to include `userProgress` for each topic

### Claude's Discretion

- React Router structure for lesson pages (e.g., `/topics/:id/theory`, `/topics/:id/practice`, `/topics/:id/challenge` — or a single `/topics/:id` with stage tabs)
- Zustand store design for lesson/progress state
- Pyodide loading strategy (eager vs. lazy, loading spinner while Pyodide initializes)
- Test runner UI details (expandable rows, color coding)
- Error handling for Pyodide runtime errors (syntax errors, infinite loops)

### Deferred Ideas (OUT OF SCOPE)

- XP award API and animations (Phase 3)
- Hint system and mini-challenges (Phase 3)
- Achievement checks (Phase 3)
- DSAVisualizer inline in theory view (Phase 4)
- Sandbox mode (Phase 4)
- All 19 remaining topic content files (Phase 5)
- Sound effects (Phase 5)
- Profile/achievements screens (Phase 3+)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LESS-01 | User can view theory content (markdown) for a topic | react-markdown + remark-gfm covers rendering; @tailwindcss/typography already installed for prose styling |
| LESS-02 | User can take a quiz (≥80% to pass, unlimited retries) | Pure React state — no additional library needed; `QUIZ_PASS_THRESHOLD` constant already exists in shared |
| LESS-03 | User can write Python code in a Monaco editor in-browser | @monaco-editor/react 4.7.0 — `defaultLanguage="python"`, `theme="vs-dark"`, `onChange` for controlled value |
| LESS-04 | Python code runs via Pyodide in a Web Worker (10-second timeout) | Pyodide 0.29.3; Vite `new Worker(new URL(...), { type: 'module' })` pattern; `AbortController`+`setTimeout` for timeout |
| LESS-05 | User can submit practice exercise and see pass/fail against test cases | Pyodide `runPythonAsync()` + stdout capture via `sys.stdout` redirect; results posted back via `postMessage` |
| LESS-06 | User can submit challenge solution and see pass/fail against test cases | Same test runner as practice; different Exercise record with `stage: 'challenge'` |
| LESS-07 | Completing a topic's stages unlocks the next topic (linear unlock) | Server sets next topic available via `UserProgress`; client `topicsStore` refreshed after challenge complete |
| LESS-08 | Topic stages must be completed in order: theory → quiz → practice → challenge | `UserProgress` row gates enforced server-side on quiz/exercise endpoints; client derives UI gate from progress data |
| LESS-09 | Map nodes reflect completion state (locked/available/complete) | `MapPage` already reads `nodeStates`; extend `GET /api/topics` to include per-topic `userProgress`; invalidate `topicsStore` after stage completion |
</phase_requirements>

---

## Summary

Phase 2 integrates five independent technical subsystems into a coherent lesson flow: (1) markdown rendering for theory, (2) a client-side quiz engine, (3) Monaco Editor for code input, (4) Pyodide running Python in a Web Worker, and (5) a Prisma schema migration to add per-stage progress tracking. None of these subsystems exist in the codebase yet — all are net-new additions.

The most technically complex piece is the Pyodide Web Worker. Pyodide 0.29.3 requires a module-type worker (not classic `importScripts`). Vite's `new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })` pattern handles this correctly. The worker loads Pyodide from CDN on first use (lazy), executes user code via `runPythonAsync()`, captures stdout by redirecting `sys.stdout` in Python before execution, and returns results via `postMessage`. A 10-second timeout is enforced by terminating the worker instance (`worker.terminate()`) from a `setTimeout` on the main thread — there is no in-worker timeout API.

The DB migration is straightforward: add three new models (`UserProgress`, `QuizQuestion`, `Exercise`) to `schema.prisma` and run `prisma migrate dev`. The existing `User` model has `currentTopicId` but no `UserProgress` table — this is the fragile single-integer model documented in CONCERNS.md. Phase 2 replaces this with proper per-stage tracking while keeping `currentTopicId` on `User` as a denormalized fast-lookup for map state.

**Primary recommendation:** Build the Pyodide worker first as a standalone utility (`client/src/lib/pyodideWorker.ts` + `client/src/workers/pyodide.worker.ts`), validate it works end-to-end in isolation, then wire the Monaco editor and test runner UI on top of it.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pyodide | 0.29.3 (latest) | Run Python in-browser via WASM | Only viable in-browser Python runtime; project constraint |
| @monaco-editor/react | 4.7.0 (latest stable) | Code editor component | Wraps Monaco with React lifecycle correctly; avoids manual editor init |
| react-markdown | 10.1.0 (latest) | Render lesson markdown to React | Safe (no dangerouslySetInnerHTML), supports plugin system |
| remark-gfm | 4.0.1 (latest) | GitHub Flavored Markdown (tables, strikethrough) | Standard companion to react-markdown |
| react-syntax-highlighter | latest | Syntax highlighting in markdown code blocks | Works as a custom component inside react-markdown; no rehype-highlight needed |

**Version verification (npm view, 2026-03-29):**
- `pyodide`: 0.29.3
- `@monaco-editor/react`: 4.7.0
- `react-markdown`: 10.1.0
- `remark-gfm`: 4.0.1

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-syntax-highlighter | ^15.x | Code blocks in markdown (theory view) | Only needed if theory content has fenced code blocks that need highlighting |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @monaco-editor/react | Direct Monaco loader via CDN | @monaco-editor/react handles worker setup, sizing, and React lifecycle automatically; CDN requires manual worker URL config |
| react-markdown | marked + DOMPurify | react-markdown stays in React's render tree; marked requires setting innerHTML even with sanitization |
| pyodide from CDN | pyodide npm package bundled | CDN loads lazily; bundling Pyodide (~7 MB WASM) would bloat the Vite bundle. Load from CDN in the worker |

**Installation:**
```bash
npm install pyodide @monaco-editor/react react-markdown remark-gfm --workspace=client
```

---

## Architecture Patterns

### Recommended Project Structure

```
client/src/
├── workers/
│   └── pyodide.worker.ts       # Web Worker: loads Pyodide, executes code, posts results
├── lib/
│   ├── pyodideWorker.ts        # Main-thread wrapper: creates worker, sends messages, handles timeout
│   └── api.ts                  # (existing) Axios instance — add progress/quiz/exercise calls
├── stores/
│   ├── authStore.ts            # (existing)
│   ├── topicsStore.ts          # (existing) — extend to include userProgress per topic
│   └── lessonStore.ts          # NEW: current topic, current stage, progress for active lesson
├── content/
│   └── topics/
│       └── 01-big-o/
│           ├── theory.md       # Markdown lesson content
│           ├── quiz.json       # Array of QuizQuestion objects
│           └── exercise.json   # Practice + challenge Exercise objects with testCases
├── pages/
│   └── LessonPage.tsx          # (stub) — replace with full lesson flow
├── components/
│   ├── lesson/
│   │   ├── TheoryView.tsx      # Scroll panel: react-markdown + stage progress tracker
│   │   ├── QuizView.tsx        # Multiple-choice quiz with retry logic
│   │   ├── EditorView.tsx      # Monaco editor + test results panel (shared by practice/challenge)
│   │   ├── StageGate.tsx       # Guards rendering of a stage if prerequisites not met
│   │   └── TestResultTable.tsx # input | expected | actual | pass/fail table
│   └── ui/                     # (existing shared components)
server/src/
├── prisma/
│   └── schema.prisma           # Add UserProgress, QuizQuestion, Exercise models
├── seed/
│   └── seed.ts                 # Extend to seed sample topic quiz + exercise from content files
├── controllers/
│   └── topicsController.ts     # (existing) — add progress, quiz, exercise handlers
├── routes/
│   └── topics.ts               # (existing) — add 3 new routes
└── schemas/
    └── topicSchemas.ts         # NEW: Zod schemas for quiz submission, exercise completion
```

### Pattern 1: Pyodide Web Worker

**What:** A module-type Web Worker file loads Pyodide from CDN, receives `{ code, testCases, functionName }` via `postMessage`, runs each test case by calling the user's function via `runPythonAsync`, captures stdout via a Python `sys.stdout` redirect, and posts `{ results: TestResult[], error?: string }` back.

**When to use:** Every time the user clicks "Run Tests" or "Submit".

**Example — Worker file (`pyodide.worker.ts`):**
```typescript
// Source: https://github.com/pyodide/pyodide/blob/main/docs/usage/webworker.md
// Must be a module-type worker; classic importScripts() is incompatible with Pyodide ESM.
import { loadPyodide, type PyodideInterface } from 'pyodide'

let pyodide: PyodideInterface | null = null

async function initPyodide() {
  if (pyodide) return pyodide
  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
  })
  return pyodide
}

self.onmessage = async (event: MessageEvent) => {
  const { id, code, testCases, functionName } = event.data
  try {
    const py = await initPyodide()
    const results = []
    for (const tc of testCases) {
      // Redirect stdout before each test
      py.runPython(`
import sys, io
_stdout_capture = io.StringIO()
sys.stdout = _stdout_capture
      `)
      // Load user code into Pyodide namespace
      await py.runPythonAsync(code)
      // Call the user function with test input
      const inputArgs = JSON.stringify(tc.input)
      const returnVal = await py.runPythonAsync(
        `${functionName}(*${inputArgs})`
      )
      const stdout = py.runPython(`sys.stdout = sys.__stdout__; _stdout_capture.getvalue()`)
      results.push({
        input: tc.input,
        expected: tc.expected,
        actual: returnVal,
        stdout,
        passed: JSON.stringify(returnVal) === JSON.stringify(tc.expected),
      })
    }
    self.postMessage({ id, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    self.postMessage({ id, error: message })
  }
}
```

**Example — Main-thread wrapper (`pyodideWorker.ts`):**
```typescript
// Source: Vite docs — https://vite.dev/guide/features.html (Web Workers section)
const TIMEOUT_MS = 10_000

export function runPyodideTests(
  code: string,
  testCases: TestCase[],
  functionName: string,
): Promise<TestRunResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/pyodide.worker.ts', import.meta.url),
      { type: 'module' }
    )
    const id = crypto.randomUUID()

    const timer = setTimeout(() => {
      worker.terminate()
      reject(new Error('Execution timed out after 10 seconds'))
    }, TIMEOUT_MS)

    worker.onmessage = (e) => {
      if (e.data.id !== id) return
      clearTimeout(timer)
      worker.terminate()
      if (e.data.error) reject(new Error(e.data.error))
      else resolve({ results: e.data.results })
    }

    worker.onerror = (e) => {
      clearTimeout(timer)
      worker.terminate()
      reject(new Error(e.message))
    }

    worker.postMessage({ id, code, testCases, functionName })
  })
}
```

**CRITICAL GOTCHA — Worker-per-run vs. persistent worker:** The pattern above creates a new worker per run. This means Pyodide re-downloads and re-initializes (~8 MB) on every click, which takes 3-8 seconds. The correct approach is a **persistent singleton worker**: create one worker on lesson page mount, keep it alive, and send all run requests to it. The `id` field lets you correlate responses. Pyodide loads once; subsequent runs are fast (< 200 ms).

### Pattern 2: Prisma Schema — Three New Models

**What:** Add `UserProgress` (join table), `QuizQuestion`, and `Exercise` to `schema.prisma`. Run `prisma migrate dev`. The `UserProgress` model relates `User` and `Topic` with a compound unique constraint `@@unique([userId, topicId])`.

**Example (schema.prisma additions):**
```prisma
model UserProgress {
  id                  Int     @id @default(autoincrement())
  userId              Int
  topicId             Int
  theoryCompleted     Boolean @default(false)
  quizScore           Float?
  quizPassed          Boolean @default(false)
  practiceCompleted   Boolean @default(false)
  practiceAttempts    Int     @default(0)
  challengeCompleted  Boolean @default(false)
  challengeAttempts   Int     @default(0)
  hintsUsed           Int     @default(0)
  xpEarned            Int     @default(0)

  user  User  @relation(fields: [userId], references: [id])
  topic Topic @relation(fields: [topicId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, topicId])
}

model QuizQuestion {
  id            Int      @id @default(autoincrement())
  topicId       Int
  question      String
  options       String   // JSON-encoded string[]; SQLite has no native array type
  correctAnswer Int      // index into options[]
  explanation   String

  topic Topic @relation(fields: [topicId], references: [id])
}

model Exercise {
  id                  Int    @id @default(autoincrement())
  topicId             Int
  stage               String // "practice" | "challenge"
  title               String
  description         String
  starterCode         String
  testCases           String // JSON-encoded TestCase[]
  hints               String // JSON-encoded string[3]
  timeBonusThreshold  Int?   // seconds; null = no speed bonus

  topic Topic @relation(fields: [topicId], references: [id])
}
```

**GOTCHA — SQLite has no array type.** Store `options`, `testCases`, and `hints` as JSON-serialized strings. The controller must call `JSON.parse()` before returning to clients. Define a consistent DTO that deserializes these fields.

**Migration command (run from `dsa-quest/server/`):**
```bash
npx prisma migrate dev --name add-lesson-models
npx prisma generate
```

Also add the `@relation` back-references to `User` and `Topic` models in schema.prisma.

### Pattern 3: React Router Nested Routes for Lesson Stages

**What:** A parent route `/topic/:id` owns the lesson layout (breadcrumb, stage progress sidebar). Three child routes render the stage-specific content. React Router v7 `<Outlet />` renders the active child.

**Recommended structure (declarative mode — consistent with existing App.tsx):**
```tsx
// App.tsx
<Route path="/topic/:id" element={<LessonPage />}>
  <Route index element={<Navigate to="theory" replace />} />
  <Route path="theory" element={<TheoryView />} />
  <Route path="practice" element={<EditorView stage="practice" />} />
  <Route path="challenge" element={<EditorView stage="challenge" />} />
</Route>
```

`LessonPage.tsx` renders the shared shell (header, stage tabs, `<StageGate>`) and an `<Outlet />` for stage content. This is cleaner than a tab-based single route because:
- Browser history works correctly (back button returns to theory after completing quiz)
- Deep-linking to `/topic/1/practice` works
- Each stage component is independently lazy-loadable (future optimization)
- `StageGate` wrapping each route can redirect to the correct stage when a user tries to access a gated stage

**Navigation between stages:**
```tsx
// After quiz passes:
navigate(`/topic/${id}/practice`)
// After practice passes:
navigate(`/topic/${id}/challenge`)
// After challenge passes:
navigate('/') // back to map
```

### Pattern 4: Zustand `lessonStore` Design

**What:** A single store holds the active lesson's progress state and the Pyodide worker reference. This keeps lesson-specific state isolated from the global `topicsStore`.

```typescript
interface LessonState {
  topicId: number | null
  progress: UserProgressDTO | null      // fetched from GET /api/topics/:id/progress
  quizQuestions: QuizQuestionDTO[]      // fetched with progress
  exercises: Record<'practice' | 'challenge', ExerciseDTO | null>
  isLoading: boolean
  error: string | null

  // Actions
  loadLesson: (topicId: number) => Promise<void>
  submitQuiz: (answers: number[]) => Promise<void>
  markExerciseComplete: (stage: 'practice' | 'challenge') => Promise<void>
}
```

The store's `loadLesson` action fires on `LessonPage` mount. After `submitQuiz` or `markExerciseComplete` succeeds, the store re-fetches progress and calls `topicsStore.invalidate()` so the map re-renders node states.

### Pattern 5: react-markdown for Theory View

**What:** Render `topic.theoryContent` (a markdown string stored in the `Topic` row or loaded from a `.md` content file) using `react-markdown` with `remark-gfm` for GFM support and custom components for code blocks.

```tsx
// Source: https://github.com/remarkjs/react-markdown (readme.md)
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Tailwind Typography "prose" class handles the default markdown styling.
// The tailwind.config.js already includes @tailwindcss/typography.
<div className="prose prose-stone max-w-none">
  <Markdown remarkPlugins={[remarkGfm]}>
    {topic.theoryContent}
  </Markdown>
</div>
```

The `prose` class from `@tailwindcss/typography` (already installed) provides all the heading, paragraph, list, and code block styles automatically. No custom components are needed for basic theory content.

### Anti-Patterns to Avoid

- **Loading Pyodide on the main thread:** Pyodide initialization blocks the UI thread for 3-8 seconds. Always use a Web Worker.
- **Bundling Pyodide into the Vite build:** Pyodide WASM is ~8 MB. Load from CDN (`indexURL` pointing to jsDelivr) — never import the WASM into the Vite bundle.
- **Creating a new worker per "Run Tests" click:** Causes Pyodide to re-initialize (3-8s delay) on every run. Use a singleton persistent worker that lives for the duration of the lesson page.
- **Classic Web Worker with `importScripts()`:** Pyodide 0.29.3 is an ES module and is incompatible with classic workers. Must use `{ type: 'module' }`.
- **Storing test cases in the DB as separate rows:** With SQLite and 20+ topics each having 5+ test cases, this creates unnecessary complexity. JSON-serialized strings in the `Exercise.testCases` column are simpler and performant at this scale.
- **Enforcing stage gates only on the client:** A malicious user can bypass client-side Zustand checks. The quiz and exercise endpoints must validate `UserProgress` server-side before accepting submissions.
- **Using `dangerouslySetInnerHTML` for markdown:** Always use `react-markdown` — it renders to React elements, not raw HTML.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Python execution in browser | Custom WASM Python runtime | pyodide | Pyodide bundles CPython, stdlib, and package ecosystem; rolling a Python executor is impractical |
| Code editor with syntax highlighting | `<textarea>` + custom tokenizer | @monaco-editor/react | Monaco handles tokenization, IntelliSense, undo/redo, keyboard shortcuts, and accessibility |
| Markdown-to-React rendering | Custom regex parser | react-markdown | Edge cases in markdown parsing (nested elements, escaping, XSS) require a battle-tested parser |
| Quiz shuffle logic | Fisher-Yates with `Math.random()` | `Array.sort(() => Math.random() - 0.5)` or a seeded shuffle | The sort-shuffle is fine for this use case (not cryptographic); no library needed |
| DB migration tracking | Manual SQL scripts | prisma migrate dev | Prisma generates SQL, tracks history, handles shadow DB comparison, and regenerates types |

**Key insight:** In the browser code execution domain, custom solutions are orders of magnitude more complex than the problem appears. Pyodide wraps a full CPython interpreter compiled to WASM — the only realistic option for running arbitrary Python including stdlib, comprehensions, and generator functions.

---

## Common Pitfalls

### Pitfall 1: Pyodide Loads from CDN at Test Time (Network Dependency)

**What goes wrong:** The first time a user opens the editor, Pyodide downloads ~8 MB from jsDelivr CDN. On slow connections, this looks like the app is broken. Users who click "Run Tests" before the download completes get a cryptic error.

**Why it happens:** `loadPyodide()` is async and deferred until the worker receives its first message unless the worker eagerly calls it on startup.

**How to avoid:** Start `loadPyodide()` eagerly when the worker is instantiated (on lesson page mount), not lazily when the user clicks Run. Show a "Loading Python environment..." spinner in the editor panel while loading. Store a `pyodideReady: boolean` flag in `lessonStore`. Disable the "Run Tests" button until `pyodideReady === true`.

**Warning signs:** Worker's first message response is slow (> 2s); subsequent runs are fast. If all runs are slow, the worker is being recreated on each run.

### Pitfall 2: SQLite JSON Arrays Deserialized Incorrectly

**What goes wrong:** `Exercise.testCases` is stored as a JSON string. If the controller returns the raw Prisma object without parsing, the client receives `"[{\"input\":[1,2],\"expected\":3}]"` as a string — not an array. Components that call `.map()` on it throw a runtime error.

**Why it happens:** Prisma returns all fields as their stored type; SQLite stores this as `TEXT`.

**How to avoid:** Create a mapper function in the controller that calls `JSON.parse` on `testCases`, `options`, and `hints` before returning in the response. Define `ExerciseDTO` and `QuizQuestionDTO` interfaces in `shared/src/types.ts` with the deserialized types.

**Warning signs:** TypeScript says the field is `string` but you expected `array`; `.map is not a function` runtime error.

### Pitfall 3: Worker Timeout Leaks on Successful Run

**What goes wrong:** If the user's code runs successfully in < 10 seconds, the `setTimeout` that would call `worker.terminate()` is still queued. If the component unmounts before the timer fires, no crash occurs — but if the user runs tests twice quickly, two timers may both fire and attempt to terminate an already-terminated (or reused) worker.

**Why it happens:** The timeout reference is not cleared after a successful `onmessage` response.

**How to avoid:** Always call `clearTimeout(timer)` inside the `worker.onmessage` handler before resolving the promise. The main-thread wrapper (`pyodideWorker.ts`) in the example above already does this.

**Warning signs:** "Cannot read property of null" errors after a successful run; double execution of tests.

### Pitfall 4: Prisma Relation Back-References Missing

**What goes wrong:** Adding `UserProgress`, `QuizQuestion`, and `Exercise` with `@relation` to `User` and `Topic` will cause `prisma migrate dev` to fail if the `User` and `Topic` models are not updated to include the reverse relation fields.

**Why it happens:** Prisma requires both sides of a relation to be declared.

**How to avoid:** Add `userProgress UserProgress[]` to the `User` model and `userProgress UserProgress[]`, `quizQuestions QuizQuestion[]`, `exercises Exercise[]` to the `Topic` model in `schema.prisma` before running migration.

**Warning signs:** `prisma migrate dev` exits with "The migration is inconsistent with the current state of the database" or a relation validation error.

### Pitfall 5: `topicsStore` Cache Stale After Progress Update

**What goes wrong:** After a user completes a challenge, the map still shows the completed topic as "in-progress" and the next topic as "locked" because `topicsStore.topics` is cached after first fetch and never invalidated.

**Why it happens:** `topicsStore.fetchTopics()` has a guard `if (get().topics.length > 0) return` — it never re-fetches.

**How to avoid:** Add an `invalidate()` action to `topicsStore` that resets `topics: []`, then calls `fetchTopics()`. Call `topicsStore.invalidate()` from `lessonStore.markExerciseComplete()` after the server confirms the challenge is complete.

**Warning signs:** Map node states don't update after topic completion without a full page reload.

### Pitfall 6: React Router v7 Breaking Changes vs v6

**What goes wrong:** The project uses React Router DOM 7.13.2 (already installed). Route definition syntax is the same as v6 declarative mode, but some APIs changed.

**Why it happens:** React Router v7 added "framework mode" (Remix-style) as an alternative; declarative mode still works identically to v6.

**How to avoid:** Use the existing `<BrowserRouter>` + `<Routes>` + `<Route>` pattern already in `App.tsx`. Do not use framework-mode features (`loader`, `action`) — they require a different router setup. Nested routes with `<Outlet />` work identically to v6.

**Warning signs:** `useLoaderData()` imported from `react-router-dom` returns undefined in declarative mode — that hook is for data mode only.

### Pitfall 7: Monaco Editor Height Must Be Explicit

**What goes wrong:** `<Editor />` from `@monaco-editor/react` renders with zero height if no `height` prop is provided, making the editor invisible.

**Why it happens:** Monaco's underlying DOM element sizes itself to its container, which may have no intrinsic height in a flex layout.

**How to avoid:** Always pass `height="400px"` (or a CSS value) to the `<Editor>` component, or wrap it in a container with an explicit height set via Tailwind `h-[400px]`.

**Warning signs:** Editor renders but is invisible; only visible after manually resizing the browser window.

---

## Code Examples

### Pyodide Persistent Worker — Singleton with Ready State

```typescript
// client/src/lib/pyodideWorker.ts
// Source: Vite docs (https://vite.dev/guide/features.html) + Pyodide docs pattern
let worker: Worker | null = null
let readyCallbacks: Array<() => void> = []
let isReady = false

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL('../workers/pyodide.worker.ts', import.meta.url),
      { type: 'module' }
    )
    // Worker posts { type: 'ready' } once Pyodide finishes loading
    worker.onmessage = (e) => {
      if (e.data.type === 'ready') {
        isReady = true
        readyCallbacks.forEach((cb) => cb())
        readyCallbacks = []
      }
    }
  }
  return worker
}

export function onPyodideReady(cb: () => void) {
  if (isReady) cb()
  else readyCallbacks.push(cb)
}

export function terminatePyodideWorker() {
  worker?.terminate()
  worker = null
  isReady = false
}
```

### Quiz Shuffle on Retry

```typescript
// Shuffle array in-place — sufficient for quiz question reordering
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
// On retry: setDisplayedQuestions(shuffleArray(quizQuestions))
```

### Server-Side Stage Gate Check (Controller Pattern)

```typescript
// In topicsController.ts — before processing quiz submission
const progress = await prisma.userProgress.findUnique({
  where: { userId_topicId: { userId: req.user.id, topicId } },
})
// Cannot submit quiz for a topic whose predecessor is not challenge-complete
const topic = await prisma.topic.findUnique({ where: { id: topicId } })
if (!topic) throw new AppError(404, 'Topic not found')
if (topic.order > 1) {
  const prevTopic = await prisma.topic.findFirst({ where: { order: topic.order - 1 } })
  const prevProgress = await prisma.userProgress.findUnique({
    where: { userId_topicId: { userId: req.user.id, topicId: prevTopic!.id } },
  })
  if (!prevProgress?.challengeCompleted) {
    throw new AppError(403, 'Complete the previous topic first')
  }
}
```

### Extended GET /api/topics — Include User Progress

```typescript
// listTopics extended — include userProgress for authenticated user
const topics = await prisma.topic.findMany({ orderBy: { order: 'asc' } })
const progressRows = await prisma.userProgress.findMany({
  where: { userId: req.user.id },
})
const progressMap = new Map(progressRows.map((p) => [p.topicId, p]))
const result = topics.map((t) => ({
  ...t,
  userProgress: progressMap.get(t.id) ?? null,
}))
res.json({ data: result })
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Monaco Editor loaded via CDN `<script>` tag | `@monaco-editor/react` wrapper | 2020+ | Handles worker config, sizing, and React lifecycle automatically |
| Pyodide classic worker with `importScripts()` | Module-type worker (`type: 'module'`) | Pyodide 0.18+ | Required by Pyodide ESM; classic workers no longer supported |
| React Router `<Switch>` | `<Routes>` + `<Outlet>` for nested routes | React Router v6 (2021) | The project already uses v7 which uses the same API |
| `marked` + `innerHTML` for markdown | `react-markdown` + `remark-gfm` | 2018+ | Safer; stays in React tree; supports plugin ecosystem |

**Deprecated/outdated:**
- `importScripts()` in Pyodide workers: replaced by module-type workers; incompatible with Pyodide 0.18+
- `pyodide.runPython()` for async user code: always use `runPythonAsync()` to avoid blocking the worker thread on awaitable Python code

---

## Open Questions

1. **Where does `theoryContent` live — DB or static file?**
   - What we know: `Topic.theoryContent` column exists in schema (currently empty string). `client/src/content/` directory does not exist yet.
   - What's unclear: Should theory be served from the DB (seeded from files) or loaded as a static file import at runtime? The CONTEXT.md says "stored as JSON/markdown files in `client/src/content/`" but the schema has the field on `Topic`.
   - Recommendation: Serve theory from the DB (seeded from `.md` files). At seed time, read `client/src/content/topics/01-big-o/theory.md` and write into `Topic.theoryContent`. Client fetches via `GET /api/topics/:id` which already returns the topic row. This avoids a separate static file fetch and keeps content delivery consistent through the existing API.

2. **Pyodide CDN availability offline/firewall environments**
   - What we know: Pyodide 0.29.3 loads WASM from jsDelivr CDN by default.
   - What's unclear: Will this work in all dev/production environments?
   - Recommendation: For Phase 2, CDN loading is acceptable. If CDN is blocked, the `indexURL` in `loadPyodide()` can point to a locally-served copy. Document this as a known constraint.

3. **`currentTopicId` on `User` — keep or remove?**
   - What we know: `User.currentTopicId` is a denormalized field that Phase 1 uses for map node state computation. `UserProgress` in Phase 2 provides richer per-stage data.
   - What's unclear: Should `currentTopicId` be updated alongside `UserProgress` to remain the fast-lookup for map state, or should map state be derived entirely from `UserProgress`?
   - Recommendation: Keep `currentTopicId` as a denormalized cache updated server-side when `challengeCompleted = true` on a new topic. This avoids a join query for the map page and keeps Phase 1's map logic working with minimal changes. Update `currentTopicId` to the next topic's ID when the challenge for the current topic completes.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build and server | Yes | 22.22.2 | — |
| npm | Package install | Yes | 10.9.7 | — |
| pyodide (npm) | Pyodide worker | Via npm | 0.29.3 | — |
| jsDelivr CDN | Pyodide WASM at runtime | Network required | 0.29.3 | Self-host WASM locally |
| @monaco-editor/react | Code editor | Via npm | 4.7.0 | — |
| react-markdown | Theory view | Via npm | 10.1.0 | — |
| Prisma CLI | DB migration | Installed (server devDep) | 6.7.0 | — |
| Browser WASM support | Pyodide | Chrome/Firefox/Edge modern | — | No fallback — required |

**Missing dependencies with no fallback:**
- Modern browser with WebAssembly support (required for Pyodide; this is a known project constraint)

**Missing dependencies with fallback:**
- jsDelivr CDN: if blocked, set `indexURL` to a self-hosted path under `client/public/pyodide/`

---

## Validation Architecture

No `config.json` found — treating `nyquist_validation` as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — zero test files exist in `dsa-quest/` |
| Config file | None — Wave 0 must create it |
| Quick run command | `npm test --workspace=client` (once configured) |
| Full suite command | `npm test --workspaces` (once configured) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LESS-01 | Theory markdown renders correctly | unit | `npm test --workspace=client -- TheoryView` | No — Wave 0 |
| LESS-02 | Quiz passes at ≥80%, fails below | unit | `npm test --workspace=client -- QuizView` | No — Wave 0 |
| LESS-03 | Monaco editor renders with Python language | unit (smoke) | `npm test --workspace=client -- EditorView` | No — Wave 0 |
| LESS-04 | Pyodide worker executes Python and returns result | integration | `npm test --workspace=client -- pyodideWorker` | No — Wave 0 |
| LESS-05 | Practice test runner shows pass/fail per test case | integration | `npm test --workspace=client -- TestResultTable` | No — Wave 0 |
| LESS-06 | Challenge completion marks stage complete | integration | `npm test --workspace=server -- topicsController` | No — Wave 0 |
| LESS-07 | Challenge completion updates next topic to available | integration | `npm test --workspace=server -- unlockLogic` | No — Wave 0 |
| LESS-08 | Stage gate blocks access when prerequisite incomplete | integration | `npm test --workspace=server -- stageGate` | No — Wave 0 |
| LESS-09 | Map node states derive correctly from UserProgress | unit | `npm test --workspace=client -- MapPage` | No — Wave 0 |

Note: LESS-03 (Monaco Editor) is a React component that wraps a third-party editor — a smoke test asserting it mounts without error is sufficient. Full editor behavior requires browser-based testing (Playwright/Cypress), which is out of scope for Phase 2.

### Sampling Rate

- **Per task commit:** `npm test --workspace=server` (server unit tests; fast, no browser required)
- **Per wave merge:** `npm test --workspaces` (all tests)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `dsa-quest/client/src/__tests__/TheoryView.test.tsx` — covers LESS-01
- [ ] `dsa-quest/client/src/__tests__/QuizView.test.tsx` — covers LESS-02
- [ ] `dsa-quest/client/src/__tests__/EditorView.test.tsx` — covers LESS-03 (smoke)
- [ ] `dsa-quest/client/src/__tests__/pyodideWorker.test.ts` — covers LESS-04, LESS-05
- [ ] `dsa-quest/server/src/__tests__/topicsController.test.ts` — covers LESS-06, LESS-07, LESS-08
- [ ] `dsa-quest/client/src/__tests__/MapPage.test.tsx` — covers LESS-09
- [ ] Test framework install: choose Vitest (already in Vite ecosystem) for both client and server: `npm install vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event --save-dev --workspace=client` + `npm install vitest --save-dev --workspace=server`
- [ ] `dsa-quest/client/vite.config.ts` — add `test: { environment: 'jsdom' }` block
- [ ] `dsa-quest/server/vitest.config.ts` — create config file

---

## Sources

### Primary (HIGH confidence)
- Pyodide GitHub docs (`raw.githubusercontent.com/pyodide/pyodide/main/docs/usage/webworker.md`) — Web Worker setup, module-type requirement, `runPythonAsync` API
- Vite official docs (`vite.dev/guide/features.html`) — Web Worker creation with `new Worker(new URL(...), { type: 'module' })` pattern
- `@monaco-editor/react` GitHub README (`github.com/suren-atoyan/monaco-react`) — `defaultLanguage`, `theme`, `onMount`, `onChange`, controlled `value` prop
- `react-markdown` GitHub README (`raw.githubusercontent.com/remarkjs/react-markdown/main/readme.md`) — `remarkPlugins`, `components` override API
- Prisma official docs (`prisma.io/docs`) — `migrate dev` workflow, `--create-only` flag, back-reference requirement
- Project STACK.md — React Router DOM 7.13.2, Zustand 5.0.12, Tailwind + @tailwindcss/typography confirmed installed
- Project ARCHITECTURE.md — Routes → Controllers → Prisma pattern, `AppError` usage, Zod middleware, `topicsStore` cache behavior
- Project schema.prisma — `User.currentTopicId`, `Topic.theoryContent` (empty), no `UserProgress` yet
- npm registry — `pyodide@0.29.3`, `@monaco-editor/react@4.7.0`, `react-markdown@10.1.0`, `remark-gfm@4.0.1` (all verified 2026-03-29)

### Secondary (MEDIUM confidence)
- `react-markdown` component pattern for syntax highlighting via custom `code` component — described in README; implementation details for `react-syntax-highlighter` integration inferred from documented API

### Tertiary (LOW confidence)
- Pyodide CDN jsDelivr URL format (`cdn.jsdelivr.net/pyodide/v0.29.3/full/`) — pattern matches historical Pyodide CDN convention but could not access pyodide.org directly (403); treat as MEDIUM if CDN URL changes between versions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via npm registry 2026-03-29
- Architecture: HIGH — patterns derived from official Vite/Pyodide/React Router docs + existing codebase analysis
- Pitfalls: HIGH for Pyodide (well-documented gotchas); MEDIUM for React Router v7 (declarative mode unchanged from v6, no surprises expected)
- Prisma migration: HIGH — standard workflow verified via official docs

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (30 days — stable libraries; Pyodide releases every ~3 months)
