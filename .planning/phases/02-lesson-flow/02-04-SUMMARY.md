---
plan: "02-04"
title: "Lesson Shell + Theory View + lessonStore"
status: complete
completed_at: "2026-03-29"
---

## What was built

The lesson shell and theory stage — the entry point for all lesson flows:

- **lessonStore** (`stores/lessonStore.ts`) — Zustand store with `topicId`, `topicInfo`, `progress`, `quizQuestions`, `exercises`. `loadLesson(topicId)` fetches from `GET /api/topics/:id/progress`.
- **topicsStore** — added `invalidate()` action to clear cached topics and force re-fetch after progress changes.
- **useLesson hook** — wraps lessonStore with a `useEffect` guard to avoid redundant fetches.
- **TheoryView** — renders `topicInfo.theoryContent` via `react-markdown` with adventure-themed prose styling. Shows "Take the Quiz" CTA or "Enter The Forge" CTA based on progress state.
- **StageProgressBar** — sidebar showing theory/practice/challenge stages as completed/current/locked with themed icons.
- **LessonPage** — shell with `Navbar`, breadcrumb back-to-map, loading/error states, and `<Outlet />` for nested stages.
- **App.tsx** — updated to nested routes: `/topic/:id` → `theory`, `quiz`, `practice`, `challenge` child routes (quiz/practice/challenge are stubs for Plans 05–07).

## Commits

- `1c3cd36` — feat(02-04): lessonStore + invalidate() on topicsStore + useLesson hook
- `245489f` — feat(02-04): TheoryView + StageProgressBar + LessonPage shell + nested router

## Deviations

- `getProgress` endpoint extended (in same commit) to return `topic` object with `theoryContent` — required by lessonStore to avoid a separate content API call.
- Route param changed from `:order` to `:id` as planned; TOPIC_NODES lookup still works by matching `n.order === topicId`.
