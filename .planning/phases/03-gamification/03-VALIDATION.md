---
phase: 3
slug: gamification
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-01
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (server unit) + @testing-library/react (client components) |
| **Config file** | `dsa-quest/server/vitest.config.ts` / `dsa-quest/client/vite.config.ts` |
| **Quick run command** | `npm run test --workspace=server` |
| **Full suite command** | `npm run test --workspace=server && npm run test --workspace=client` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test --workspace=server`
- **After every plan wave:** Run `npm run test --workspace=server && npm run test --workspace=client`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Wave 0 Plan

**Plan 03-00** creates all test stub files listed below using `it.todo()` entries. This plan runs before any Wave 1 plans and ensures the Nyquist baseline exists.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-00-01 | 00 | 0 | ALL | stubs | `vitest run --workspace=server` | Plan 00 | pending |
| 03-00-02 | 00 | 0 | ALL | stubs | `vitest run --workspace=client` | Plan 00 | pending |
| 03-01-01 | 01 | 1 | GAME-01 | unit | `npm run test --workspace=server -- xp` | W0 stub | pending |
| 03-01-02 | 01 | 1 | GAME-01 | unit | `npm run test --workspace=server -- xp` | W0 stub | pending |
| 03-01-03 | 01 | 1 | GAME-03 | unit | `npm run test --workspace=server -- xp` | W0 stub | pending |
| 03-01-04 | 01 | 1 | GAME-02 | unit | `npm run test --workspace=server -- level` | W0 stub | pending |
| 03-02-01 | 02 | 2 | GAME-01 | component | `npm run test --workspace=client -- XpBar` | W0 stub | pending |
| 03-02-02 | 02 | 2 | GAME-02 | component | `npm run test --workspace=client -- XpBar` | W0 stub | pending |
| 03-03-01 | 03 | 3 | GAME-04 | unit | `npm run test --workspace=server -- achievement` | W0 stub | pending |
| 03-03-02 | 03 | 3 | GAME-04 | unit | `npm run test --workspace=server -- achievement` | W0 stub | pending |
| 03-03-03 | 03 | 3 | GAME-04 | component | `npm run test --workspace=client -- BadgeModal` | W0 stub | pending |
| 03-04-01 | 04 | 3 | GAME-05 | unit | `npm run test --workspace=client -- MiniChallenge` | W0 stub | pending |
| 03-04-02 | 04 | 3 | GAME-05 | component | `npm run test --workspace=client -- HintGate` | W0 stub | pending |
| 03-04-03 | 04 | 3 | GAME-06 | component | `npm run test --workspace=client -- HintGate` | W0 stub | pending |
| 03-05-01 | 05 | 4 | GAME-02 | component | `npm run test --workspace=client -- LevelUpModal` | W0 stub | pending |
| 03-05-02 | 05 | 4 | GAME-07 | component | `npm run test --workspace=client -- BadgeModal` | W0 stub | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [x] `server/src/__tests__/xpCalculation.test.ts` — stubs for GAME-01, GAME-03 XP award logic (Plan 03-00, Task 1)
- [x] `server/src/__tests__/achievementChecker.test.ts` — stubs for all 12 achievement trigger conditions (Plan 03-00, Task 1)
- [x] `client/src/components/gamification/__tests__/XpBar.test.tsx` — stubs for GAME-01/GAME-02 UI (Plan 03-00, Task 2)
- [x] `client/src/components/gamification/__tests__/MiniChallenge.test.tsx` — stubs for GAME-05 mini-challenge types (Plan 03-00, Task 2)
- [x] `client/src/components/gamification/__tests__/HintGate.test.tsx` — stubs for GAME-05/GAME-06 hint flow (Plan 03-00, Task 2)
- [x] `client/src/components/gamification/__tests__/LevelUpModal.test.tsx` — stubs for GAME-02 modal (Plan 03-00, Task 2)
- [x] `client/src/components/gamification/__tests__/BadgeModal.test.tsx` — stubs for GAME-07 badge animation (Plan 03-00, Task 2)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Parchment scroll unfurl animation plays smoothly | GAME-02 | CSS/framer-motion animation timing is visual | Complete any quiz, trigger level-up; watch scroll modal unfurl from top of screen |
| Badge flip/stamp animation is visually distinct from level-up | GAME-07 | Visual distinctness is subjective | Trigger badge unlock; confirm smaller badge modal appears AFTER level-up modal dismissal |
| Sequential modal queue: level-up then badge, never simultaneous | GAME-07 | Animation sequencing is visual | Trigger both in same action; verify level-up modal appears first, badge modal after click-dismiss |
| "Prove Your Worth" medieval theming in hint gate | GAME-05 | UX copy and visual theme is subjective | Request a hint; confirm gate prompt uses medieval language and matches parchment theme |
| Navbar XP bar updates without page reload | GAME-01 | Reactive state update timing is visual | Complete a stage; confirm XP bar in Navbar animates to new value without refresh |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (Plan 03-00 creates all 7 stubs)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
