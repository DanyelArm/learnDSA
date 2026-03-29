---
plan: "02-03"
title: "Progress API Endpoints"
status: complete
completed_at: "2026-03-29"
---

## What was built

Four server API endpoints enabling the full lesson flow with server-side stage gating:

- **GET /api/topics/:id/progress** — returns `{ topic, progress, questions, exercises }` for authenticated user. Returns `null` progress if no row yet. Topic includes `theoryContent` for the client to render.
- **POST /api/topics/:id/quiz** — scores answers against stored correct answers, sets `quizPassed=true` if score ≥ 80%, returns 403 if already passed.
- **POST /api/topics/:id/exercise/:stage** — marks practice or challenge complete; enforces quiz-first and practice-first gates via 403.
- **GET /api/topics** — extended to include `userProgress` + derived `nodeState` per topic (locked/available/in-progress/completed).

**Pure helper functions** exported for unit testing:
- `calculateQuizScore(answers, correctAnswers): number`
- `deriveNodeState(topicOrder, progressByOrder): NodeState`

**9 server unit tests pass** covering quiz scoring edge cases and linear unlock logic.

## Commits

- `764b0ef` — feat(02-03): add Zod schemas and progress/quiz/exercise controller functions
- `f4f3675` — feat(02-03): wire progress routes and fill unit test stubs with real assertions
- `245489f` — feat(02-04): fix getProgress to include topic info (title, theoryContent, order)

## Deviations

None — plan executed as specified.
