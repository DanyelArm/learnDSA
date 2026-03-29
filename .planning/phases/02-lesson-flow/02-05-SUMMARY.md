---
phase: 02-lesson-flow
plan: "05"
subsystem: ui
tags: [react, typescript, vitest, zustand, tailwind, quiz]

# Dependency graph
requires:
  - phase: 02-lesson-flow/02-03
    provides: lessonStore with quizQuestions, progress, setProgress; topicsStore with invalidate()
  - phase: 02-lesson-flow/02-04
    provides: LessonPage shell, TheoryView, App.tsx quiz route placeholder
provides:
  - QuizView component with three-phase flow (answering, reviewing, result)
  - quizUtils.ts with scoreQuiz, shuffleQuestions, getQuestionResult, QUIZ_PASS_THRESHOLD
  - 9 passing unit tests for quiz scoring and shuffle logic
  - App.tsx quiz route wired to QuizView
affects: [02-06, 02-07, 02-08, gamification, phase-3]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Three-phase UI state machine (answering -> reviewing -> result) for multi-step flows
    - Fisher-Yates shuffle for non-deterministic question ordering on retry
    - Sort answers by original question id before API submission to handle client-side shuffling

key-files:
  created:
    - dsa-quest/client/src/lib/quizUtils.ts
    - dsa-quest/client/src/components/lesson/QuizView.tsx
  modified:
    - dsa-quest/client/src/__tests__/quiz.test.ts
    - dsa-quest/client/src/App.tsx

key-decisions:
  - "Three-phase quiz flow: answering -> reviewing (per-question feedback) -> result; review phase shown before final score submission"
  - "Client-side scoring happens immediately for UX; server submission sends answers sorted by original question id to handle client shuffling"
  - "quizPassed redirect guard at render time (not in effect) to avoid stale state issues"

patterns-established:
  - "Phase state machine pattern: use string union type for multi-step component flows"
  - "Answer re-sorting by original id: shuffle locally, sort back to server's expected order before API call"

requirements-completed: [LESS-02]

# Metrics
duration: 162min
completed: 2026-03-29
---

# Phase 2 Plan 05: Quiz Component with Scoring and Retry Logic Summary

**Interactive multiple-choice QuizView with Fisher-Yates shuffle, per-question feedback, 80% pass gate, retry reshuffle, and topicsStore invalidation on pass — backed by 9 passing unit tests**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-29T18:16:23Z
- **Completed:** 2026-03-29T18:27:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `quizUtils.ts` with `scoreQuiz`, `shuffleQuestions`, `getQuestionResult`, and `QUIZ_PASS_THRESHOLD = 80`
- Replaced all `it.todo` stubs in `quiz.test.ts` with 9 real assertions (all passing)
- Implemented `QuizView` with three phases: answering, reviewing (per-question correct/incorrect feedback), result (score + pass/fail + retry or continue)
- Wired `QuizView` into `App.tsx` replacing the quiz route placeholder

## Task Commits

Each task was committed atomically:

1. **Task 1: Quiz scoring/shuffle utilities + fill quiz test stubs** - `054a182` (feat)
2. **Task 2: QuizView component + wire into App.tsx** - `3eac050` (feat)

## Files Created/Modified
- `dsa-quest/client/src/lib/quizUtils.ts` - Pure utility functions: scoreQuiz, shuffleQuestions, getQuestionResult, QUIZ_PASS_THRESHOLD
- `dsa-quest/client/src/__tests__/quiz.test.ts` - 9 real unit tests replacing it.todo stubs
- `dsa-quest/client/src/components/lesson/QuizView.tsx` - Full quiz component with answering/reviewing/result phases
- `dsa-quest/client/src/App.tsx` - QuizView imported and wired to /topic/:id/quiz route

## Decisions Made
- Three-phase flow (answering -> reviewing -> result): the "review" phase shows per-question feedback inline before the user commits to final submission, satisfying the "per-question feedback before final score" requirement.
- Client-side scoring in `scoreQuiz` runs immediately on submit for instant UX; the server call is async and may update progress after the UI already shows the result.
- Answers are sorted by original question id before being sent to the server to ensure correct grading regardless of client-side shuffle order.
- `quizPassed` redirect guard placed at render time (before hooks) so a returning user who already passed is immediately redirected to practice without seeing the quiz.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- QuizView is complete and production-ready for the Big-O topic
- `QUIZ_PASS_THRESHOLD` is exported from `quizUtils.ts` for use in any future gamification/XP calculations
- `topicsStore.invalidate()` is called on pass, so the adventure map will re-fetch and reflect newly unlocked nodes
- Ready for Plan 06 (linear unlock logic) and Plan 07 (practice/challenge screens)

---
*Phase: 02-lesson-flow*
*Completed: 2026-03-29*
