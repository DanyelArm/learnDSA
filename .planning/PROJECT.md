# DSA Quest

## What This Is

DSA Quest is a gamified, adventure-map-themed full-stack web app for learning Data Structures & Algorithms. Users progress linearly through 20 DSA topics, each with theory, a quiz, a practice exercise, and a LeetCode-style challenge. All user-written code is Python only, executed in-browser via Pyodide (WebAssembly).

## Core Value

A motivated learner can go from zero DSA knowledge to confident problem-solver by completing all 20 topics in order — the adventure-map framing makes that journey feel like progress, not a grind.

## Requirements

### Validated

- ✓ Monorepo structure (npm workspaces: client, server, shared) — Phase 1
- ✓ JWT auth (register/login/getMe) — Phase 1
- ✓ Adventure map UI with 20 hardcoded topic nodes — Phase 1
- ✓ User and Topic database models with Prisma/SQLite — Phase 1
- ✓ Seed script populating all 20 DSA topics — Phase 1

### Active

- [ ] Theory/markdown view per topic
- [ ] Quiz component (≥80% to pass, unlimited retries)
- [ ] Monaco + Pyodide in-browser Python code editor
- [ ] Practice and challenge screens with test case validation
- [ ] Linear unlock logic (completing topic N unlocks topic N+1)
- [ ] XP/level system with gamification rewards
- [ ] Achievement system with badge unlocks
- [ ] Hint system gated behind mini-challenges
- [ ] Sandbox free-play editor with DSAVisualizer
- [ ] All 20 topic lessons, quizzes, exercises, and challenges as static content
- [ ] Landing page and final polish

### Out of Scope

- Mobile layout — desktop only (tablet nice-to-have)
- LeetCode API integration — challenges stored locally
- CMS — all content lives in the repo as static files
- Non-Python code execution — Python only via Pyodide
- OAuth login — email/password sufficient

## Context

- Phase 1 is complete: monorepo at `dsa-quest/`, auth working, adventure map rendered, DB seeded with 20 topics.
- Frontend: React 18 + Vite + TypeScript + Tailwind, Zustand for state, Axios for API calls.
- Backend: Node.js + Express + Prisma (SQLite), JWT auth, Zod validation.
- Shared package (`@dsa-quest/shared`) holds TypeScript types and XP/level constants.
- Code execution will use Pyodide in a Web Worker (10-second timeout, never on main thread).
- UI theme: parchment/medieval aesthetic — "Pirata One" font, beige/brown/forest-green palette.
- Known concern: single-integer progress model in Phase 1 needs extension for per-stage tracking (theory/quiz/practice/challenge) in Phase 2.

## Constraints

- **Tech Stack**: React + TypeScript + Tailwind (frontend), Node/Express + Prisma/SQLite (backend), Pyodide (code execution) — established in Phase 1
- **Desktop Only**: Mobile out of scope — no responsive breakpoints required below tablet
- **Python Only**: All user code execution uses Pyodide; no other language runtimes
- **Static Content**: Lessons/quizzes/exercises stored as JSON/markdown in `client/src/content/` — no CMS

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pyodide in Web Worker | Keep main thread free; 10s timeout enforced | — Pending |
| npm workspaces monorepo | Client + server + shared types in one repo | ✓ Good |
| SQLite via Prisma | Zero-infrastructure DB for solo/small-team dev | — Pending |
| JWT in localStorage | Expedient for Phase 1; XSS risk acknowledged | ⚠️ Revisit |
| Static content files | No CMS complexity; content lives in repo | — Pending |
| Linear unlock (topic N → N+1) | Keeps learning path structured | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-29 after initialization*
