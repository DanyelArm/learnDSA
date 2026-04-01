# Phase 3: Gamification — Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 adds the gamification layer on top of the working lesson flow from Phase 2. Specifically: XP awards on stage completion, level-up detection and animation, achievement unlocks with badge reveal, a hint system gated behind mini-challenges, and a persistent XP/level indicator in the Navbar.

This phase does NOT add sandbox/visualizer (Phase 4), does NOT author the remaining 19 topic content files (Phase 5), and does NOT add social/leaderboard features (v2).

</domain>

<decisions>
## Implementation Decisions

### XP Award System

- **D-01:** XP is awarded server-side — extend existing `completeExercise` and `submitQuiz` controllers to calculate XP, update `User.xp` + `User.level`, and return the updated user with a `leveledUp: boolean` flag in the response
- **D-02:** XP values are locked in `shared/constants.ts`: theory quiz pass = 50 XP, practice = 100 XP, challenge = 200 XP
- **D-03:** First-try bonus (+50 XP): awarded when `attempts === 1` at the moment of completion (already tracked in `UserProgress.practiceAttempts` / `challengeAttempts`)
- **D-04:** Speed bonus (+25 XP): awarded when client submits elapsed time ≤ `Exercise.timeBonusThreshold` seconds; client sends `{ attempts, elapsedSeconds }` in the POST body
- **D-05:** Level formula already defined in `shared/constants.ts`: `xpForLevel(n) = Math.floor(100 * n^1.5)`; server recalculates level after each XP award

### Achievement System

- **D-06:** All 12 achievements implemented in Phase 3 (not deferred to Phase 5)
- **D-07:** Full achievement list and trigger conditions:

| ID | Name | Trigger |
|----|------|---------|
| ACH-01 | First Steps | Complete Topic 1 (challengeCompleted = true for topicId 1) |
| ACH-02 | Arena Champion | Complete first challenge (any topic) |
| ACH-03 | On a Roll | Complete 3 topics in a row (consecutive challengeCompleted) |
| ACH-04 | Unstoppable | Complete 5 topics in a row |
| ACH-05 | Halfway There | 10 of 20 topics challengeCompleted |
| ACH-06 | Quest Complete | All 20 topics challengeCompleted |
| ACH-07 | Speed Demon | Earn speed bonus on any challenge |
| ACH-08 | Perfectionist | Pass a quiz on first try with 100% score |
| ACH-09 | No Hints Needed | Complete a topic (all 3 stages) with hintsUsed = 0 |
| ACH-10 | Hint Hoarder | Use all 3 hint tiers on a single exercise |
| ACH-11 | Persistent | Retry a quiz 3+ times before passing (quizAttempts >= 3 on pass) |
| ACH-12 | Python Master | Complete all 20 challenges |

- **D-08:** Achievement checks run server-side after each XP-awarding action; return `unlockedAchievements[]` in the same API response as XP/level updates
- **D-09:** New `Achievement` and `UserAchievement` Prisma models needed (Achievement: id, key, name, description; UserAchievement: userId, achievementKey, unlockedAt)
- **D-10:** `UserProgress` needs a `quizAttempts` field to track retry count (needed for ACH-11 "Persistent" trigger — currently only tracks pass/fail, not attempt count)

### Hint System

- **D-11:** Hint gate: user must pass a mini-challenge to earn 1 hint token; token grants access to the next locked hint tier
- **D-12:** 3 hint tiers per exercise (already stored as `Exercise.hints` JSON array): tier 1 = high-level approach, tier 2 = pseudocode, tier 3 = key code snippet
- **D-13:** Mini-challenge has **3 types**: timed multiple-choice, code trace (fill in the output), fill-in-the-blank code snippet
- **D-14:** Type is selected **randomly** each time a hint is requested
- **D-15:** Mini-challenge content is **authored per exercise** in content files — add a `miniChallenges` array to `exercise.json`; Phase 3 authors content for the Big-O sample topic; Phase 5 authors the rest
- **D-16:** Mini-challenge content schema: `{ type: 'multiple-choice' | 'code-trace' | 'fill-blank', prompt: string, options?: string[], correctAnswer: string | number, timeLimit: number }`
- **D-17:** Hint unlock tracked server-side via `UserProgress.hintsUsed` (already in schema); mini-challenge validation happens client-side (Pyodide not needed — it's logic/output questions)

### XP Bar / Level Display

- **D-18:** Persistent XP/level indicator lives in **Navbar** — always visible while logged in
- **D-19:** Display format: level badge + XP progress bar — `"Lv. 3 ▓▓▓▓░░ 340/500 XP"` in medieval theme
- **D-20:** Navbar XP bar updates reactively via `authStore.updateUser()` — no page reload needed; API responses include updated `{ xp, level }` in user payload

### Animations

- **D-21:** Level-up animation: **parchment scroll modal** — scroll unfurls from top of screen, "Level Up! You are now Level N" in Pirata One font, dismisses on click; plays when `leveledUp: true` in API response
- **D-22:** Badge unlock animation: **distinct badge reveal** — badge icon flips in (coin flip or stamp effect) in a separate smaller modal; visually distinct from level-up modal; plays when `unlockedAchievements.length > 0` in API response
- **D-23:** If both level-up AND badge unlock happen in the same action, play level-up modal first, then badge modal after dismissal (sequential, not simultaneous)

### Claude's Discretion

- Zustand store design for gamification state (modal queue, achievement list, etc.)
- Specific CSS animation implementation for scroll unfurl and coin flip
- Whether to add a dedicated `/achievements` page or show them only via map/profile — not scoped in Phase 3
- `quizAttempts` field placement (add to `UserProgress` or derive from a new attempt log)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Codebase
- `dsa-quest/shared/src/constants.ts` — XP values, level formula, TOPIC_STAGES already defined; extend here for achievement definitions
- `dsa-quest/shared/src/types.ts` — AuthUser (has xp, level), UserProgressDTO (has hintsUsed, xpEarned); extend for AchievementDTO, MiniChallengeDTO
- `dsa-quest/server/prisma/schema.prisma` — Current schema; needs Achievement, UserAchievement models and quizAttempts field on UserProgress
- `dsa-quest/server/src/controllers/topicsController.ts` — `completeExercise` and `submitQuiz` are the XP/achievement integration points
- `dsa-quest/client/src/stores/authStore.ts` — Has `updateUser(Partial<AuthUser>)` for reactive XP/level updates
- `dsa-quest/client/src/stores/uiStore.ts` — Add modal queue here (or create gamificationStore)
- `dsa-quest/client/src/components/ui/Navbar.tsx` — XP bar goes here
- `dsa-quest/client/src/components/ui/GoldBadge.tsx` — Existing badge component to leverage for achievement reveal
- `dsa-quest/client/src/content/topics/01-big-o/exercise.json` — Add `miniChallenges` array here as the Phase 3 sample

### Architecture Reference
- `.planning/codebase/ARCHITECTURE.md` — Layered Routes → Controllers → Prisma pattern to follow
- `.planning/codebase/STRUCTURE.md` — Where to add new files (gamification/ component directory)

### Project Spec
- `CLAUDE.md` — XP values (lines confirm 50/100/200), achievement list ("first topic, speed runs, streaks"), hint tier definitions, UI theme palette
- `.planning/REQUIREMENTS.md` — GAME-01 through GAME-07 are the acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `GoldBadge.tsx` — badge component exists; extend or wrap for achievement reveal animation
- `ParchmentPanel.tsx` — parchment-styled panel; use as base for scroll modal wrapper
- `authStore.updateUser()` — reactive user update without re-login; the XP bar subscribes to this
- `UserProgress.hintsUsed` + `UserProgress.xpEarned` — already in schema, just not populated yet
- `User.xp` + `User.level` — already in schema and `AuthUser` type; just not updated by server yet
- `XP_PER_STAGE`, `XP_BONUS_FIRST_TRY`, `XP_BONUS_SPEED`, `xpForLevel()` — all in `shared/constants.ts`

### Established Patterns
- Server-authoritative progress: client POSTs completion, server returns updated state; same pattern for XP
- Zustand stores for client state (`authStore`, `lessonStore`, `topicsStore`, `uiStore`)
- `ApiResponse<T>` wrapper for all API responses
- Prisma `upsert` with `@@unique([userId, topicId])` for UserProgress

### Integration Points
- `completeExercise` controller — add XP calculation + achievement check after upsert
- `submitQuiz` controller — add XP award on `quizPassed` transition + achievement check
- `Navbar.tsx` — add XP bar component as child
- `LessonPage` or top-level `App.tsx` — intercept API responses to trigger modal queue

</code_context>

<specifics>
## Specific Ideas

- Level-up modal: parchment scroll unfurls from top; "Level Up!" + new level in Pirata One font; click to dismiss
- Badge reveal: coin-flip or stamp animation on the badge icon; separate smaller modal below/after level-up
- Sequential modal queue: level-up first → badge second, never simultaneous
- Hint gate UI: "Prove Your Worth" prompt before showing mini-challenge; thematically medieval
- Mini-challenge time limit field in content schema so each challenge can set its own timer

</specifics>

<deferred>
## Deferred Ideas

- Achievements page / profile screen — not scoped in Phase 3; achievements surface via modal only
- Social sharing of badges — v2 (V2-01)
- Leaderboard (XP rankings) — v2 (V2-02)
- Sound effects on level-up/badge — Phase 5 polish
- DSAVisualizer inline in theory view — Phase 4
- Mini-challenge content for topics 2–20 — Phase 5

</deferred>

---

*Phase: 03-gamification*
*Context gathered: 2026-04-01*
