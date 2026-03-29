---
plan: "02-02"
phase: 2
subsystem: "data-layer"
tags: ["prisma", "schema", "shared-types", "content", "seed"]
dependency_graph:
  requires: ["02-01"]
  provides: ["UserProgress model", "QuizQuestion model", "Exercise model", "Phase 2 DTOs", "Big-O sample content"]
  affects: ["02-03", "02-04", "02-05", "02-06", "02-07", "02-08"]
tech_stack:
  added: []
  patterns: ["Prisma SQLite JSON-encoded arrays for options/testCases/hints", "idempotent seed with deleteMany+createMany", "static content JSON/md files in client/src/content/"]
key_files:
  created:
    - dsa-quest/server/prisma/migrations/20260329140930_add_lesson_models/migration.sql
    - dsa-quest/client/src/content/topics/01-big-o/theory.md
    - dsa-quest/client/src/content/topics/01-big-o/quiz.json
    - dsa-quest/client/src/content/topics/01-big-o/exercise.json
  modified:
    - dsa-quest/server/prisma/schema.prisma
    - dsa-quest/shared/src/types.ts
    - dsa-quest/server/seed/index.ts
    - dsa-quest/server/package.json
decisions:
  - "SQLite has no array type — options, testCases, and hints stored as JSON-encoded strings in DB"
  - "Seed uses deleteMany+createMany pattern for idempotency (no unique key on quiz/exercise rows)"
  - "theory.md loaded via fs.readFileSync in seed and stored in Topic.theoryContent column"
metrics:
  duration: "3m 12s"
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_changed: 8
---

# Phase 2 Plan 02: DB Schema Migration + Shared Types + Sample Topic Content Summary

**One-liner:** Prisma schema extended with UserProgress/QuizQuestion/Exercise models; shared DTOs published; Big-O sample content (theory.md, 5-question quiz, practice+challenge exercises) created and seeded into SQLite.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Prisma schema migration — add UserProgress, QuizQuestion, Exercise | 4aeb129 | schema.prisma, migrations/20260329140930_add_lesson_models/ |
| 2 | Extend shared types + Big-O content + extend seed | 20a3d87 | types.ts, theory.md, quiz.json, exercise.json, seed/index.ts, package.json |

## What Was Built

### Task 1 — Prisma Schema Migration
- Added `UserProgress` model with full per-stage tracking: `theoryCompleted`, `quizScore`, `quizPassed`, `practiceCompleted/Attempts`, `challengeCompleted/Attempts`, `hintsUsed`, `xpEarned`
- Added `QuizQuestion` model with JSON-encoded `options` field (SQLite has no array type)
- Added `Exercise` model with JSON-encoded `testCases` and `hints` fields
- Added back-reference relation arrays (`progress`, `quizQuestions`, `exercises`) to existing `User` and `Topic` models
- Migration applied: `20260329140930_add_lesson_models`; Prisma client regenerated

### Task 2 — Shared Types, Big-O Content, Seed Extension
- Added `TestCase`, `TestResult`, `UserProgressDTO`, `QuizQuestionDTO`, `ExerciseDTO`, `TopicWithProgressDTO` to `@dsa-quest/shared`
- `index.ts` already uses `export * from './types'` — no change needed
- Created `theory.md` (~580 words): Big-O notation, 5 growth rates, space vs time complexity, loop analysis, best/worst/average case
- Created `quiz.json`: 5 questions covering array O(1) access, linear search O(n), nested loops O(n²), binary search O(log n), worst-case meaning
- Created `exercise.json`: practice `count_evens` (O(n) single loop) + challenge `find_duplicate` (O(n) with set)
- Extended `seed/index.ts` to: deleteMany+createMany QuizQuestion rows, deleteMany+create Exercise rows, update Topic.theoryContent from theory.md
- Added `prisma.seed` config to `server/package.json` so `npx prisma db seed` works

## Verification Results

- `npx prisma validate` — passes
- `npx prisma db seed` — exits 0, seeds idempotently
- DB counts: QuizQuestion (topicId=1) = 5, Exercise (topicId=1) = 2
- All 6 shared DTOs exported from `@dsa-quest/shared`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added `prisma.seed` config to package.json**
- **Found during:** Task 2 verification
- **Issue:** The plan's verification step calls `npx prisma db seed`, but `package.json` had no `prisma.seed` field configured. The command would have silently done nothing.
- **Fix:** Added `"prisma": { "seed": "ts-node seed/index.ts" }` to `server/package.json`
- **Files modified:** `dsa-quest/server/package.json`
- **Commit:** 20a3d87

**2. [Rule 2 - Seed Pattern] Removed redundant upsert before deleteMany+createMany**
- **Found during:** Task 2 implementation
- **Issue:** Plan's seed code sample had a redundant upsert with `where: { id: -1 }` (which would always fail to find a record) followed immediately by deleteMany+createMany. The upsert was removed; only deleteMany+createMany is used.
- **Fix:** Implemented seed with `deleteMany` then `createMany` (idempotent) without the broken upsert stub.
- **Files modified:** `dsa-quest/server/seed/index.ts`
- **Commit:** 20a3d87

## Known Stubs

None — all content files are fully populated with real data. Theory, quiz, and exercise data is complete and wired to the seed.

## Self-Check: PASSED
