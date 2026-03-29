# Phase 2: Lesson Flow — Context

**Gathered:** 2026-03-29
**Status:** Ready for planning
**Source:** PRD Express Path (dsa-quest-claude-code-prompt.md)

<domain>
## Phase Boundary

Phase 2 delivers the complete learning loop for a single topic. A user clicks an unlocked topic node on the adventure map, progresses through three stages in order, and the next topic unlocks on completion. This phase does NOT implement XP awards or animations (Phase 3) — only the structural unlock, stage completion tracking, and UI for all three stages.

**Three stages per topic (must complete in order):**
1. **Theory / The Scroll** — Markdown lesson + inline visualization config + quiz (≥80% to pass, unlimited retries)
2. **Practice / The Forge** — Monaco editor + Pyodide test runner; all test cases must pass
3. **Challenge / The Arena** — Same editor interface, harder LeetCode-style problem; completing this unlocks next topic

</domain>

<decisions>
## Implementation Decisions

### DB Schema Changes

- Add `UserProgress` model: `{ userId, topicId, theoryCompleted, quizScore, quizPassed, practiceCompleted, practiceAttempts, challengeCompleted, challengeAttempts, hintsUsed, xpEarned }`
- Add `QuizQuestion` model: `{ id, topicId, question, options[], correctAnswer, explanation }`
- Add `Exercise` model: `{ id, topicId, stage (practice | challenge), title, description, starterCode, testCases[], hints[3], timeBonusThreshold }`
- Migrate existing single-integer `progress` field on `User` to use `UserProgress` table for per-stage tracking
- Keep `Topic` model; add `theoryContent` (markdown string) and `visualizationType` fields (already in Phase 1 schema, currently empty)

### Stage Ordering

- Theory → Practice → Challenge — hard gate; cannot skip stages
- Cannot access Practice until `quizPassed = true` in `UserProgress`
- Cannot access Challenge until `practiceCompleted = true`
- Completing Challenge sets `challengeCompleted = true` and triggers unlock of next topic

### Quiz Component

- 5–8 multiple-choice questions per topic
- Score = (correct / total) × 100
- Requires ≥80% to pass (mark `quizPassed = true`)
- Unlimited retries — questions reshuffled on retry
- Show correct/incorrect feedback per question after submission
- Show score and pass/fail result; if fail, show "Try Again" button

### Code Execution (Monaco + Pyodide)

- Monaco Editor for Python code input, dark theme, Python syntax highlighting
- Pyodide loads in a **Web Worker** (never on main thread)
- Execution timeout: 10 seconds (terminate worker and show timeout error)
- Capture both `stdout` (print statements) and function return value
- Test case verification: call the user's function with test inputs, compare return value + stdout against expected
- Test result display: table showing `input | expected output | actual output | pass/fail` per test case
- All tests must pass to mark stage complete
- Show "Run Tests" button; hide "Submit" until all visible tests pass (or use one "Run & Submit" button)

### Layout

- **Theory screen:** Left panel = markdown content; Right panel = stage progress tracker / mini-map
- **Practice/Challenge screen:** Left panel = problem description + constraints; Right panel = Monaco editor; Bottom = test results panel
- Adventure-map styling: parchment textures, carved-wood buttons, scroll-style content panels

### Content Storage

- All lessons, quiz questions, exercises, and test cases stored as JSON/markdown files in `client/src/content/`
- Phase 2 only needs **one complete sample topic** (e.g., "Arrays & Strings" — topic 2 or "Big-O" — topic 1) to validate the full flow works end-to-end
- Remaining 19 topics get content in Phase 5
- Content schema must match the DB models so Phase 5 can seed without schema changes

### Linear Unlock Logic

- Topic unlock state derived from `UserProgress`: topic N is unlocked iff topic N-1 has `challengeCompleted = true` (or topic order === 1)
- Topic 1 (Big-O) is always unlocked on account creation
- Map node states: `locked` | `available` | `in-progress` | `completed`
- `in-progress` = UserProgress row exists but challenge not complete
- `completed` = `challengeCompleted = true`
- Map node visual state updates in real-time after stage completion (no full page reload)

### API Endpoints Needed

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Codebase
- `dsa-quest/shared/src/index.ts` — Shared TypeScript types (TopicDTO, ApiResponse, etc.) — extend here for new types
- `dsa-quest/server/prisma/schema.prisma` — Current DB schema — must be updated for UserProgress, QuizQuestion, Exercise
- `dsa-quest/server/src/controllers/topicsController.ts` — Existing topics API — extend for progress endpoints
- `dsa-quest/server/src/routes/topics.ts` — Topics routes — add new routes here
- `dsa-quest/client/src/stores/` — Existing Zustand stores — add progress/lesson store here
- `dsa-quest/client/src/lib/api.ts` — Axios instance — use for all API calls

### Architecture Reference
- `.planning/codebase/ARCHITECTURE.md` — Layered Routes → Controllers → Prisma pattern to follow
- `.planning/codebase/STRUCTURE.md` — Where to add new files
- `.planning/codebase/CONCERNS.md` — Known issues (esp. progress model concern and JWT storage)

### Project Spec
- `dsa-quest-claude-code-prompt.md` — Full PRD with data models (lines 157-200) and stage definitions (lines 35-54)
- `CLAUDE.md` — XP values, tech stack constraints, UI theme palette

</canonical_refs>

<specifics>
## Specific Ideas

- Adventure map node states from PRD: 🔒 Locked, 🟡 Available (glowing), ✅ Completed (flag/star), 🏆 Mastered (gold border)
- Theory screen called "The Scroll" in the UI
- Practice screen called "The Forge" in the UI
- Challenge screen called "The Arena" in the UI
- Pyodide in a Web Worker with 10-second timeout
- Test result table format: `input | expected output | actual output | pass/fail`
- One complete sample topic must work end-to-end before Phase 2 is done

</specifics>

<deferred>
## Deferred Ideas

- XP award API and animations (Phase 3)
- Hint system and mini-challenges (Phase 3)
- Achievement checks (Phase 3)
- DSAVisualizer inline in theory view (Phase 4)
- Sandbox mode (Phase 4)
- All 19 remaining topic content files (Phase 5)
- Sound effects (Phase 5)
- Profile/achievements screens (Phase 3+)

</deferred>

---

*Phase: 02-lesson-flow*
*Context gathered: 2026-03-29 via PRD Express Path (dsa-quest-claude-code-prompt.md)*
