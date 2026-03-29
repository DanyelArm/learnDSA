# Roadmap: DSA Quest

## Overview

DSA Quest is built in 5 phases, moving from foundation to content. Phase 1 (complete) delivers auth and the adventure map shell. Phase 2 adds the core learning loop. Phase 3 layers on gamification. Phase 4 adds the free-play sandbox. Phase 5 fills all 20 topics with real content and polishes the experience.

## Phases

- [x] **Phase 1: Foundation** - Monorepo, auth, adventure map shell, seeded DB
- [x] **Phase 2: Lesson Flow** - Theory/quiz/code editor/test runner/linear unlock (completed 2026-03-29)
- [ ] **Phase 3: Gamification** - XP, levels, achievements, hints, animations
- [ ] **Phase 4: Sandbox** - Free-play editor, DSAVisualizer, step-through, presets
- [ ] **Phase 5: Content & Polish** - All 20 topic lessons/quizzes/exercises, landing page

## Phase Details

### Phase 1: Foundation
**Goal**: Monorepo is running, auth works, adventure map displays 20 hardcoded topic nodes, DB is seeded
**Depends on**: Nothing
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07
**Status**: Complete ✓
**Success Criteria**:
  1. `npm run dev` starts both client (5173) and server (3001) without errors
  2. User can register, login, and persist session across refresh
  3. Adventure map renders 20 topic nodes in correct DSA order
  4. `npx prisma db seed` populates all 20 topics
**Plans**: 3 plans (complete)

### Phase 2: Lesson Flow
**Goal**: A user can click a topic node, read theory, pass a quiz, write Python code in a Monaco editor that runs via Pyodide, submit practice and challenge exercises with test validation, and the next topic unlocks on completion
**Depends on**: Phase 1
**Requirements**: LESS-01, LESS-02, LESS-03, LESS-04, LESS-05, LESS-06, LESS-07, LESS-08, LESS-09
**Success Criteria**:
  1. User can navigate to any unlocked topic and view its theory markdown
  2. Quiz blocks progress until ≥80% score; unlimited retries work
  3. Monaco editor renders with Python syntax highlighting; Pyodide executes code in a Web Worker
  4. Practice/challenge test runner shows per-test pass/fail output
  5. Completing challenge unlocks next map node; map updates visually
**Plans**: 8 plans

Plans:
- [x] 02-01-PLAN.md — Wave 0: Vitest infrastructure (client + server configs, 5 stub test files)
- [x] 02-02-PLAN.md — Prisma schema migration (UserProgress, QuizQuestion, Exercise) + shared types + Big-O sample content
- [x] 02-03-PLAN.md — Progress API endpoints (GET progress, POST quiz, POST exercise/:stage) + server unit tests
- [x] 02-04-PLAN.md — Lesson shell (nested routing, LessonPage, Outlet) + lessonStore + TheoryView + StageProgressBar
- [x] 02-05-PLAN.md — Quiz component (scoring, retry, 80% gate, per-question feedback) + quiz unit tests
- [x] 02-06-PLAN.md — Monaco editor + Pyodide Web Worker (persistent singleton, 10s timeout) + TestResultTable
- [x] 02-07-PLAN.md — Practice + Challenge routes wired to EditorView + testRunner unit tests
- [x] 02-08-PLAN.md — Linear unlock (map reads nodeState from API) + human verification checkpoint

### Phase 3: Gamification
**Goal**: XP and level system is live, achievements unlock at milestones, hints cost mini-challenges, animations play on level-up and badge unlock
**Depends on**: Phase 2
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06, GAME-07
**Success Criteria**:
  1. Completing each stage awards correct XP (quiz: 50, practice: 100, challenge: 200)
  2. Level-up modal fires when XP threshold crossed
  3. Achievement badges unlock and display for defined milestones
  4. Hint modal prompts mini-challenge before revealing hint token
  5. All 3 hint tiers display in correct order
**Plans**: TBD

Plans:
- [ ] 03-01: XP award API endpoints and level-up logic
- [ ] 03-02: XP bar and level display components
- [ ] 03-03: Achievement system (definitions, checks, display)
- [ ] 03-04: Hint system with mini-challenge gate
- [ ] 03-05: Level-up, badge, and map reveal animations

### Phase 4: Sandbox
**Goal**: Free-play Monaco+Pyodide editor works, DSAVisualizer renders step-through animations from state snapshots, preset templates load correctly
**Depends on**: Phase 2
**Requirements**: SAND-01, SAND-02, SAND-03, SAND-04
**Success Criteria**:
  1. Sandbox editor runs arbitrary Python without test constraints
  2. DSAVisualizer renders array/linked-list/tree/graph animations from snapshot arrays
  3. Running sandbox code with instrumentation emits state snapshots to visualizer
  4. At least 5 preset templates load without error
**Plans**: TBD

Plans:
- [ ] 04-01: Sandbox page and free-play editor
- [ ] 04-02: DSAVisualizer component (D3/canvas, snapshot-driven)
- [ ] 04-03: Code instrumentation for snapshot emission
- [ ] 04-04: Preset templates

### Phase 5: Content & Polish
**Goal**: All 20 DSA topics have real theory, quizzes, exercises, challenges, and hints; landing page exists; app feels production-ready
**Depends on**: Phase 3
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07
**Success Criteria**:
  1. All 20 topics have non-empty theory markdown
  2. All 20 topics have ≥5 quiz questions
  3. All 20 practice exercises have ≥3 test cases each
  4. All 20 challenges have ≥5 test cases each
  5. Landing page renders at `/`
  6. No placeholder content remains in production build
**Plans**: TBD

Plans:
- [ ] 05-01: Topics 1–5 content (Big-O, Arrays, Linked Lists, Stacks, Queues)
- [ ] 05-02: Topics 6–10 content (Hash Tables, Recursion, Sorting, Searching, Trees/BST)
- [ ] 05-03: Topics 11–15 content (Heaps, Graph Repr, BFS/DFS, DP Basics, DP Advanced)
- [ ] 05-04: Topics 16–20 content (Greedy, Backtracking, Tries, Union-Find, Segment Trees)
- [ ] 05-05: Landing page
- [ ] 05-06: Final animations and polish pass

---
*Roadmap initialized: 2026-03-29*
*Last updated: 2026-03-29 — Phase 2 planned (8 plans)*
