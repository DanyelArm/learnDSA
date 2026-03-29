# Requirements: DSA Quest

**Defined:** 2026-03-29
**Core Value:** A motivated learner completes all 20 DSA topics in order via a gamified adventure-map journey

## v1 Requirements

### Foundation (Phase 1 — Complete)

- [x] **FOUND-01**: Monorepo with npm workspaces (client, server, shared)
- [x] **FOUND-02**: User can register with email and password
- [x] **FOUND-03**: User can log in and receive a JWT
- [x] **FOUND-04**: User session persists across browser refresh
- [x] **FOUND-05**: Adventure map displays 20 DSA topic nodes
- [x] **FOUND-06**: User and Topic models exist in SQLite via Prisma
- [x] **FOUND-07**: Database seeded with all 20 DSA topics in order

### Lesson Flow (Phase 2)

- [x] **LESS-01**: User can view theory content (markdown) for a topic
- [x] **LESS-02**: User can take a quiz (≥80% to pass, unlimited retries)
- [x] **LESS-03**: User can write Python code in a Monaco editor in-browser
- [x] **LESS-04**: Python code runs via Pyodide in a Web Worker (10-second timeout)
- [x] **LESS-05**: User can submit practice exercise and see pass/fail against test cases
- [x] **LESS-06**: User can submit challenge solution and see pass/fail against test cases
- [x] **LESS-07**: Completing a topic's stages unlocks the next topic (linear unlock)
- [x] **LESS-08**: Topic stages must be completed in order: theory → quiz → practice → challenge
- [ ] **LESS-09**: Map nodes reflect completion state (locked/available/complete)

### Gamification (Phase 3)

- [ ] **GAME-01**: User earns XP for completing each stage (50/100/200 XP per stage tier)
- [ ] **GAME-02**: User levels up when XP threshold reached; level-up animation plays
- [ ] **GAME-03**: First-try bonus (+50 XP) and speed bonus (+25 XP) awarded when applicable
- [ ] **GAME-04**: Achievements unlock for milestones (first topic, speed runs, streaks, etc.)
- [ ] **GAME-05**: Hint system: user passes a mini-challenge to earn one hint token
- [ ] **GAME-06**: Each exercise has 3 hint tiers (approach → pseudocode → key snippet)
- [ ] **GAME-07**: Badge unlock and map node reveal animations play on completion

### Sandbox (Phase 4)

- [ ] **SAND-01**: Free-play Python editor (Monaco + Pyodide) with no test-case restrictions
- [ ] **SAND-02**: DSAVisualizer component renders step-through animation from state snapshots
- [ ] **SAND-03**: Sandbox instruments user code to emit state snapshots at each operation
- [ ] **SAND-04**: Preset templates available for each DSA type (array, linked list, tree, etc.)

### Content & Polish (Phase 5)

- [ ] **CONT-01**: All 20 topic theory lessons written and stored in `client/src/content/`
- [ ] **CONT-02**: All 20 topic quizzes (5+ questions each) written in JSON
- [ ] **CONT-03**: All 20 practice exercises with test cases written
- [ ] **CONT-04**: All 20 challenge problems with test cases written
- [ ] **CONT-05**: All 20 hint sets (3 tiers each) written
- [ ] **CONT-06**: Landing/home page built
- [ ] **CONT-07**: Full-app animations and micro-interactions polished

## v2 Requirements

### Social / Progress Sharing

- **V2-01**: User can share a completion badge to social media
- **V2-02**: Leaderboard (XP rankings)

### Multiplayer / Challenge Mode

- **V2-03**: Timed challenge mode (compete against others)

### Mobile

- **V2-04**: Responsive layout for tablet and mobile

## Out of Scope

| Feature | Reason |
|---------|--------|
| LeetCode API integration | Challenges stored locally — no external dependency |
| CMS for content | Static JSON/markdown files in repo; no CMS complexity |
| Non-Python execution | Pyodide only; scope constraint |
| OAuth login | Email/password sufficient for v1 |
| Mobile layout | Desktop-first; mobile deferred to v2 |
| Real-time multiplayer | High complexity; not core to learning value |
| Server-side code execution | Pyodide in-browser eliminates need for sandboxed server execution |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 through FOUND-07 | Phase 1 | Complete |
| LESS-01 | Phase 2 | Complete |
| LESS-02 | Phase 2 | Complete |
| LESS-03 | Phase 2 | Complete |
| LESS-04 | Phase 2 | Complete |
| LESS-05 | Phase 2 | Complete |
| LESS-06 | Phase 2 | Complete |
| LESS-07 | Phase 2 | Complete |
| LESS-08 | Phase 2 | Complete |
| LESS-09 | Phase 2 | Pending |
| GAME-01 | Phase 3 | Pending |
| GAME-02 | Phase 3 | Pending |
| GAME-03 | Phase 3 | Pending |
| GAME-04 | Phase 3 | Pending |
| GAME-05 | Phase 3 | Pending |
| GAME-06 | Phase 3 | Pending |
| GAME-07 | Phase 3 | Pending |
| SAND-01 | Phase 4 | Pending |
| SAND-02 | Phase 4 | Pending |
| SAND-03 | Phase 4 | Pending |
| SAND-04 | Phase 4 | Pending |
| CONT-01 | Phase 5 | Pending |
| CONT-02 | Phase 5 | Pending |
| CONT-03 | Phase 5 | Pending |
| CONT-04 | Phase 5 | Pending |
| CONT-05 | Phase 5 | Pending |
| CONT-06 | Phase 5 | Pending |
| CONT-07 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 30 total (7 complete, 23 pending)
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 after initial definition*
