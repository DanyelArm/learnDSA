# Phase 3: Gamification — Research

**Researched:** 2026-04-02
**Domain:** Gamification layer — XP/level system, achievement engine, hint gate, modal animations
**Confidence:** HIGH

## Summary

Phase 3 adds the motivational scaffolding on top of the working Phase 2 lesson flow. The implementation is well-defined: all XP constants, the level formula, and the `User.xp`/`User.level` fields already exist in the codebase but are never written to by the server. Phase 3 wires them up. Similarly, `UserProgress.hintsUsed`, `UserProgress.xpEarned`, `UserProgress.practiceAttempts`, and `UserProgress.challengeAttempts` are already in the schema and tracked — only XP calculation and achievement checks are missing from the server controllers.

The two controllers that need modification — `submitQuiz` and `completeExercise` in `topicsController.ts` — follow a clean pattern: they upsert UserProgress and return a plain `{ data: { progress } }`. Phase 3 extends those responses to include `{ xp, level, leveledUp, unlockedAchievements[] }` pulled from the updated User row, then the client reacts to those new fields by calling `authStore.updateUser()` and enqueuing modals.

The animation library (`framer-motion` 12.x) is already installed. The Tailwind config already defines `unfurl` and `pulse-gold` keyframes that map directly to the scroll modal and gold badge glow effects. The `ParchmentPanel` component is a ready base for the level-up scroll wrapper. The `GoldBadge` component already renders level + XP progress and only needs a wrapper animation for the badge-reveal modal.

**Primary recommendation:** Implement in five discrete plans: (1) XP/level server logic, (2) XP bar client components, (3) achievement system (DB models + server checks + client display), (4) hint system with mini-challenge gate, (5) level-up and badge animations. Each plan is independently testable and shippable.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**XP Award System**
- D-01: XP is awarded server-side — extend existing `completeExercise` and `submitQuiz` controllers to calculate XP, update `User.xp` + `User.level`, and return the updated user with a `leveledUp: boolean` flag in the response
- D-02: XP values are locked in `shared/constants.ts`: theory quiz pass = 50 XP, practice = 100 XP, challenge = 200 XP
- D-03: First-try bonus (+50 XP): awarded when `attempts === 1` at the moment of completion (already tracked in `UserProgress.practiceAttempts` / `challengeAttempts`)
- D-04: Speed bonus (+25 XP): awarded when client submits elapsed time <= `Exercise.timeBonusThreshold` seconds; client sends `{ attempts, elapsedSeconds }` in the POST body
- D-05: Level formula in `shared/constants.ts`: `xpForLevel(n) = Math.floor(100 * n^1.5)`; server recalculates level after each XP award

**Achievement System**
- D-06: All 12 achievements implemented in Phase 3
- D-07: Full achievement list with trigger conditions (ACH-01 through ACH-12 as defined in CONTEXT.md)
- D-08: Achievement checks run server-side after each XP-awarding action; return `unlockedAchievements[]` in same API response
- D-09: New `Achievement` and `UserAchievement` Prisma models needed
- D-10: `UserProgress` needs a `quizAttempts` field

**Hint System**
- D-11: Hint gate — user must pass a mini-challenge to earn 1 hint token
- D-12: 3 hint tiers per exercise (stored as `Exercise.hints` JSON array)
- D-13: Mini-challenge has 3 types: timed multiple-choice, code trace, fill-in-the-blank code snippet
- D-14: Type selected randomly each time a hint is requested
- D-15: Mini-challenge content authored per exercise in content files; `miniChallenges` array added to `exercise.json`; Phase 3 authors for Big-O only
- D-16: Mini-challenge content schema: `{ type: 'multiple-choice' | 'code-trace' | 'fill-blank', prompt: string, options?: string[], correctAnswer: string | number, timeLimit: number }`
- D-17: Hint unlock tracked server-side via `UserProgress.hintsUsed`; mini-challenge validation happens client-side

**XP Bar / Level Display**
- D-18: Persistent XP/level indicator lives in Navbar — always visible while logged in
- D-19: Display format: level badge + XP progress bar — `"Lv. 3 ▓▓▓▓░░ 340/500 XP"` in medieval theme
- D-20: Navbar XP bar updates reactively via `authStore.updateUser()` — no page reload needed

**Animations**
- D-21: Level-up animation: parchment scroll modal — scroll unfurls from top of screen using Pirata One font; dismisses on click; plays when `leveledUp: true` in API response
- D-22: Badge unlock animation: badge icon flips in (coin flip or stamp effect) in a separate smaller modal; visually distinct from level-up modal
- D-23: If both level-up AND badge unlock happen in same action, level-up modal plays first, then badge modal after dismissal (sequential, not simultaneous)

### Claude's Discretion

- Zustand store design for gamification state (modal queue, achievement list, etc.)
- Specific CSS animation implementation for scroll unfurl and coin flip
- Whether to add a dedicated `/achievements` page or show them only via map/profile (not scoped in Phase 3)
- `quizAttempts` field placement (add to `UserProgress` or derive from a new attempt log)

### Deferred Ideas (OUT OF SCOPE)

- Achievements page / profile screen — not scoped in Phase 3; achievements surface via modal only
- Social sharing of badges — v2 (V2-01)
- Leaderboard (XP rankings) — v2 (V2-02)
- Sound effects on level-up/badge — Phase 5 polish
- DSAVisualizer inline in theory view — Phase 4
- Mini-challenge content for topics 2–20 — Phase 5
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GAME-01 | User earns XP for completing each stage (50/100/200 XP per stage tier) | XP constants already in `shared/constants.ts`; `User.xp` field exists; only server-side award logic missing in `submitQuiz` / `completeExercise` |
| GAME-02 | User levels up when XP threshold reached; level-up animation plays | `xpForLevel()` exists in shared constants; `User.level` field exists; `unfurl` Tailwind keyframe defined; `framer-motion` installed |
| GAME-03 | First-try bonus (+50 XP) and speed bonus (+25 XP) awarded when applicable | `practiceAttempts`/`challengeAttempts` tracked; `timeBonusThreshold` on Exercise model; client sends `elapsedSeconds` per D-04 |
| GAME-04 | Achievements unlock for milestones (first topic, speed runs, streaks, etc.) | 12 achievement definitions locked in D-07; requires new `Achievement`/`UserAchievement` Prisma models (D-09) and `quizAttempts` field on UserProgress (D-10) |
| GAME-05 | Hint system: user passes a mini-challenge to earn one hint token | `UserProgress.hintsUsed` already in schema; mini-challenge schema locked in D-16; client-side validation per D-17 |
| GAME-06 | Each exercise has 3 hint tiers (approach → pseudocode → key snippet) | `Exercise.hints` JSON array already seeded for Big-O topic; `miniChallenges` array needs to be added to `exercise.json` |
| GAME-07 | Badge unlock and map node reveal animations play on completion | `framer-motion` installed; `GoldBadge` component exists; `pulse-gold` and `unfurl` Tailwind keyframes defined |
</phase_requirements>

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | ^12.38.0 (installed) | Level-up scroll modal animation, badge flip/stamp animation | Already a dependency; declarative React animation with `AnimatePresence` for mount/unmount sequences |
| Tailwind CSS | ^3.4.19 (installed) | Utility styling for modal overlays, badge reveal | `unfurl` and `pulse-gold` keyframes already defined in `tailwind.config.js` |
| Zustand | ^5.0.12 (installed) | Modal queue store, gamification state | Established pattern in this codebase; `uiStore` is the natural home for modal queue |
| Prisma | ^6.7.0 (installed) | `Achievement`, `UserAchievement` new models; `quizAttempts` migration | Established ORM; SQLite backend |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | ^16.3.2 (installed) | Unit tests for XpBar, modal components | Client-side component tests |
| vitest | ^4.1.2 (installed) | Server-side unit tests for XP calculation, achievement checks | Server pure-function tests (already used for `calculateQuizScore`) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| framer-motion | Pure CSS `@keyframes` + Tailwind | Tailwind `unfurl` already exists; but `AnimatePresence` makes exit animations and sequential modal queue trivial — framer-motion is already installed so no cost |
| Zustand modal queue in uiStore | Dedicated `gamificationStore` | Either works; gamificationStore is cleaner if the state grows (achievement list, modal queue, active hint tier) |

**Installation:** No new packages required. All dependencies are already installed.

---

## Architecture Patterns

### Recommended Project Structure (new files in Phase 3)

```
dsa-quest/
├── server/src/
│   ├── controllers/
│   │   └── topicsController.ts        # extend submitQuiz + completeExercise
│   └── lib/
│       └── achievementChecker.ts      # pure function: checkAchievements(userId, progress, user) => AchievementKey[]
├── server/prisma/
│   └── schema.prisma                  # add Achievement, UserAchievement, quizAttempts
├── shared/src/
│   ├── constants.ts                   # add ACHIEVEMENTS definition array
│   └── types.ts                       # add AchievementDTO, MiniChallengeDTO, GamificationResult
├── client/src/
│   ├── stores/
│   │   └── gamificationStore.ts       # modal queue + active achievement list
│   ├── components/
│   │   ├── gamification/
│   │   │   ├── XpBar.tsx              # extracted from GoldBadge for Navbar
│   │   │   ├── LevelUpModal.tsx       # scroll unfurl modal
│   │   │   ├── BadgeModal.tsx         # badge flip/stamp modal
│   │   │   ├── GamificationOrchestrator.tsx  # consumes modal queue, renders active modal
│   │   │   ├── HintGate.tsx           # "Prove Your Worth" UI + mini-challenge
│   │   │   └── MiniChallenge.tsx      # renders the 3 challenge types
│   │   └── ui/
│   │       └── Navbar.tsx             # extend: add XpBar + level display
└── client/src/content/
    └── topics/01-big-o/
        └── exercise.json              # add miniChallenges array
```

### Pattern 1: XP Award in Server Controllers

**What:** After a successful quiz pass or exercise completion, calculate XP, update `User.xp`/`User.level`, run achievement checks, and return a `GamificationResult` alongside the existing progress data.

**When to use:** Every mutation that can award XP (`submitQuiz` on first pass, `completeExercise` on first completion).

**Example:**
```typescript
// In submitQuiz, after the upsert — server-side
const isFirstPass = !existing?.quizPassed && quizPassed
if (isFirstPass) {
  const xpGained = XP_PER_STAGE.theory  // 50
  const firstTry = (progress.quizAttempts ?? 0) + 1 === 1 ? XP_BONUS_FIRST_TRY : 0
  const totalXp = xpGained + firstTry

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: totalXp }, level: newLevel },
  })

  const leveledUp = newLevel > existingLevel
  const unlockedAchievements = await checkAchievements(userId, updatedProgress, updatedUser)

  return res.json({
    data: {
      progress: updatedProgress,
      score,
      quizPassed,
      xpGained: totalXp,
      user: { xp: updatedUser.xp, level: updatedUser.level },
      leveledUp,
      unlockedAchievements,
    }
  })
}
```

### Pattern 2: Level Calculation (Server-Side)

**What:** After incrementing `User.xp`, derive the new level using the shared `xpForLevel()` formula. The client `getLevelFromXP()` in `client/src/lib/constants.ts` uses `LEVEL_THRESHOLDS` (a lookup table), while `shared/constants.ts` uses `xpForLevel(n) = Math.floor(100 * n^1.5)`. These must agree.

**Critical finding:** There is a discrepancy between the two implementations:
- `shared/constants.ts` uses `xpForLevel(n) = Math.floor(100 * n^1.5)` — server canonical formula
- `client/src/lib/constants.ts` uses a hardcoded `LEVEL_THRESHOLDS` array `[0, 100, 250, 450, 700, ...]`

For Phase 3, the server must derive level using `xpForLevel()`. The client `getLevelFromXP()` also uses `LEVEL_THRESHOLDS`. These should agree or the displayed level will diverge from the server-authoritative level. The planner should include a task to verify these align (or update `getLevelFromXP` to use `xpForLevel` from shared).

**Recommended approach:** Server derives level by finding the highest N where `xpForLevel(N) <= userTotalXp`:
```typescript
function deriveLevel(totalXp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= totalXp) level++
  return level
}
```

### Pattern 3: Achievement Checker (Pure Server Function)

**What:** A pure function that receives the current user state and progress state, checks all 12 achievement conditions, and returns the keys of newly unlocked achievements (filtering out ones already in `UserAchievement`).

**When to use:** Called after every XP-awarding action in controllers.

**Example structure:**
```typescript
// server/src/lib/achievementChecker.ts
export async function checkAchievements(
  userId: number,
  allProgress: UserProgress[],
  user: User
): Promise<string[]> {
  const existing = await prisma.userAchievement.findMany({ where: { userId } })
  const existingKeys = new Set(existing.map(a => a.achievementKey))
  const unlocked: string[] = []

  // ACH-01: First Steps — Topic 1 challenge complete
  if (!existingKeys.has('ACH-01') && allProgress.some(p => p.topicId === 1 && p.challengeCompleted)) {
    unlocked.push('ACH-01')
  }
  // ... etc for all 12
  if (unlocked.length > 0) {
    await prisma.userAchievement.createMany({
      data: unlocked.map(key => ({ userId, achievementKey: key, unlockedAt: new Date() }))
    })
  }
  return unlocked
}
```

**Note on consecutive streak detection (ACH-03, ACH-04):** These require checking `challengeCompleted` across all topics in order. The checker must fetch all UserProgress for the user, sort by topicId/order, and count the longest consecutive streak. This requires a JOIN with the Topic table (for `order`) or a separate query.

### Pattern 4: Modal Queue in Zustand (gamificationStore)

**What:** A queue-based store that holds pending modals. The `GamificationOrchestrator` dequeues and displays one at a time. When the user dismisses, the next modal in queue plays.

**When to use:** API response returns `leveledUp: true` AND `unlockedAchievements.length > 0` — both must queue without colliding.

**Example:**
```typescript
// stores/gamificationStore.ts
type ModalItem =
  | { type: 'level-up'; newLevel: number }
  | { type: 'badge'; achievement: AchievementDTO }

interface GamificationState {
  modalQueue: ModalItem[]
  enqueue: (items: ModalItem[]) => void
  dequeue: () => void
}

export const useGamificationStore = create<GamificationState>()((set) => ({
  modalQueue: [],
  enqueue: (items) => set((s) => ({ modalQueue: [...s.modalQueue, ...items] })),
  dequeue: () => set((s) => ({ modalQueue: s.modalQueue.slice(1) })),
}))
```

The `GamificationOrchestrator` renders the first item in the queue, wrapped in `AnimatePresence`, and calls `dequeue()` on dismiss.

### Pattern 5: Mini-Challenge Gate (Client-Side)

**What:** When the user requests a hint, the `HintGate` component checks `UserProgress.hintsUsed` against the desired hint tier. If the tier is locked, it renders the mini-challenge UI. On correct answer, it calls the hint token API endpoint (`POST /api/topics/:id/hint`), which increments `UserProgress.hintsUsed` and returns the unlocked tier count.

**Note on `quizAttempts` placement (Claude's discretion):** The simplest approach is to add `quizAttempts Int @default(0)` directly to the `UserProgress` model. This mirrors how `practiceAttempts` and `challengeAttempts` are already tracked. The alternative — a separate `QuizAttempt` table — adds complexity with no benefit for Phase 3's trigger condition.

### Anti-Patterns to Avoid

- **Client-side XP calculation:** XP must be authoritative from the server. Never award XP on the client and sync up later — the server response is the source of truth.
- **Blocking the lesson flow on animation:** The `GamificationOrchestrator` should render modals independently from lesson navigation. Do not block routing on modal completion — make modals dismissable independently.
- **Re-awarding XP on retry:** Both `submitQuiz` and `completeExercise` already guard against re-grading. XP should only be awarded on the transition from not-passed to passed (check `isFirstPass` / `isFirstCompletion`).
- **Running achievement checks outside the existing transaction pattern:** Achievement checks should be called inside the same controller `try/catch` block after the UserProgress upsert, not as a fire-and-forget side effect.
- **Concurrent modal display:** Level-up and badge unlock must queue sequentially (D-23). Using `AnimatePresence` with queue ensures this naturally.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Entrance/exit animations for modals | Custom CSS transitions with JS state flags | `framer-motion` `AnimatePresence` + `motion.div` | Handles unmount animation correctly; already installed |
| Timer for mini-challenge | `setInterval` + manual cleanup | `useEffect` with `Date.now()` delta + cleanup on unmount | Simpler and already the pattern used in Phase 2 for Pyodide timeout |
| Achievement badge icons | Custom SVG components per badge | Emoji or single themed SVG slot (the badge key determines the emoji/icon) | 12 badges is manageable with a lookup; no icon library needed |
| Consecutive streak detection | SQL window functions | JavaScript array sort + scan after fetching all UserProgress rows | SQLite has limited window function support; a short JS scan over 20 rows max is fine |

**Key insight:** framer-motion's `AnimatePresence` makes modal queue animations trivially correct — it handles the exit animation before rendering the next item. Without it, you'd need manual timing logic for sequential modal display.

---

## Common Pitfalls

### Pitfall 1: Level-Formula Drift Between Client and Server

**What goes wrong:** `shared/constants.ts` uses `xpForLevel(n) = Math.floor(100 * n^1.5)` to compute level thresholds. `client/src/lib/constants.ts` uses a hardcoded `LEVEL_THRESHOLDS` array. If these diverge, the level displayed in the XP bar will not match the server-authoritative level stored in `User.level`.

**Why it happens:** The client `getLevelFromXP()` was written before the shared formula was finalized. Both compute level but from different sources.

**How to avoid:** Either (a) update `client/src/lib/constants.ts` to derive `LEVEL_THRESHOLDS` dynamically using `xpForLevel` from `@dsa-quest/shared`, or (b) always use the server-returned `user.level` for display (which is the correct approach since XP is server-authoritative). The GoldBadge already receives `level` as a prop from the AuthUser — the XP bar display should trust `authStore.user.level`, not recompute it.

**Warning signs:** After an XP award, the Navbar shows a different level than what the server returns in the API response.

### Pitfall 2: Double XP Award on Hot-Reload or Retry

**What goes wrong:** `completeExercise` currently uses `upsert` but does NOT guard against the case where `practiceCompleted` is already `true`. The XP increment would fire again on a duplicate POST.

**Why it happens:** The existing controller updates `practiceCompleted: true` unconditionally in the `update` block. If the client retries the request (network error, dev hot reload), the server runs the XP update again.

**How to avoid:** Read the current progress row before the upsert and only award XP if the stage is transitioning from `false` to `true`:
```typescript
const isFirstCompletion = !existingProgress?.practiceCompleted
if (isFirstCompletion) { /* award XP */ }
```
This pattern already applies to `submitQuiz` (which checks `existing?.quizPassed`).

### Pitfall 3: Achievement Checks Requiring All UserProgress Rows

**What goes wrong:** Achievements like ACH-03 ("On a Roll: 3 topics in a row") and ACH-04 require querying all UserProgress rows for the user, not just the current topic. If `checkAchievements` only receives the current progress row, streak-based achievements will never fire.

**Why it happens:** The controller's local variable `progress` refers only to the current topic. The achievement checker needs the full picture.

**How to avoid:** The `checkAchievements` function must `prisma.userProgress.findMany({ where: { userId } })` internally, then join with Topic order (or receive the sorted progress list as a parameter). The full progress list is short (max 20 rows) so this is not a performance concern.

### Pitfall 4: Mini-Challenge Validation Is Client-Side but Hint Increment Is Server-Side

**What goes wrong:** If the mini-challenge answer validation is purely client-side (D-17), a savvy user can call `POST /api/topics/:id/hint` without passing the challenge. The server has no proof the challenge was passed.

**Why it happens:** D-17 specifies client-side validation for simplicity (no Pyodide needed).

**How to avoid:** This is a known and accepted trade-off for v1 per D-17. The hint endpoint should still exist and require authentication — it just won't re-validate the answer. Document this as an intentional v1 simplification. The server endpoint still tracks `hintsUsed` authoritatively.

### Pitfall 5: `quizAttempts` vs Existing Quiz Guard

**What goes wrong:** `submitQuiz` currently throws `403` if `existing?.quizPassed`. This means `quizAttempts` can never increment after passing. But ACH-11 ("Persistent: retry a quiz 3+ times before passing") needs the attempt count at the moment of passing.

**Why it happens:** The server correctly prevents re-grading, but the attempt counter is not incremented on each failed attempt.

**How to avoid:** Increment `quizAttempts` on EVERY quiz submission (not just on pass), including failed attempts. The ACH-11 check fires at the moment of passing: `if (updatedProgress.quizAttempts >= 3 && quizPassed)`.

### Pitfall 6: framer-motion AnimatePresence and Modal Queue

**What goes wrong:** Rendering multiple modals by mapping over the queue causes all of them to animate in simultaneously rather than sequentially.

**Why it happens:** `AnimatePresence` needs to control one child at a time.

**How to avoid:** Only render the **first item** in the modal queue, not the full array. When the user dismisses (`dequeue()`), the next item becomes the first and animates in naturally via `AnimatePresence`.

---

## Code Examples

### XP Award with Level-Up Detection (Server)

```typescript
// topicsController.ts — after successful quiz pass
import { xpForLevel } from '@dsa-quest/shared'

function deriveLevel(totalXp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= totalXp) level++
  return level
}

// Inside submitQuiz, after confirming isFirstPass:
const xpGained = XP_PER_STAGE.theory
  + (quizAttempts === 0 ? XP_BONUS_FIRST_TRY : 0)  // first-try bonus when attempts was 0 before this submission

const user = await prisma.user.findUnique({ where: { id: userId } })
const newXp = (user?.xp ?? 0) + xpGained
const newLevel = deriveLevel(newXp)
const leveledUp = newLevel > (user?.level ?? 1)

await prisma.user.update({ where: { id: userId }, data: { xp: newXp, level: newLevel } })
```

### Modal Queue Consumer (Client)

```typescript
// GamificationOrchestrator.tsx
import { AnimatePresence } from 'framer-motion'
import { useGamificationStore } from '@/stores/gamificationStore'
import { LevelUpModal } from './LevelUpModal'
import { BadgeModal } from './BadgeModal'

export function GamificationOrchestrator() {
  const { modalQueue, dequeue } = useGamificationStore()
  const current = modalQueue[0]

  return (
    <AnimatePresence mode="wait">
      {current?.type === 'level-up' && (
        <LevelUpModal key="level-up" level={current.newLevel} onDismiss={dequeue} />
      )}
      {current?.type === 'badge' && (
        <BadgeModal key={current.achievement.key} achievement={current.achievement} onDismiss={dequeue} />
      )}
    </AnimatePresence>
  )
}
```

### Scroll Unfurl Modal (framer-motion + Tailwind unfurl keyframe)

```typescript
// LevelUpModal.tsx
import { motion } from 'framer-motion'

export function LevelUpModal({ level, onDismiss }: { level: number; onDismiss: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        exit={{ scaleY: 0, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ transformOrigin: 'top' }}
        className="scroll-panel max-w-sm w-full mx-4 text-center"
      >
        <p className="font-heading text-gold text-3xl tracking-widest mb-2">Level Up!</p>
        <p className="font-heading text-brown-dark text-5xl">{level}</p>
        <p className="font-body text-brown text-sm mt-3">Click to continue your quest</p>
      </motion.div>
    </div>
  )
}
```

### Badge Flip Animation (framer-motion rotateY)

```typescript
// BadgeModal.tsx
import { motion } from 'framer-motion'

export function BadgeModal({ achievement, onDismiss }: { achievement: AchievementDTO; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onDismiss}>
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -90, opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ perspective: 600 }}
        className="bg-brown-dark border-2 border-gold rounded-xl p-6 max-w-xs text-center shadow-node-glow"
      >
        <div className="text-5xl mb-3">{achievement.icon}</div>
        <p className="font-heading text-gold text-xl">{achievement.name}</p>
        <p className="font-body text-parchment/80 text-sm mt-1">{achievement.description}</p>
      </motion.div>
    </div>
  )
}
```

### Prisma Schema Additions

```prisma
// schema.prisma additions

model Achievement {
  id          Int    @id @default(autoincrement())
  key         String @unique   // "ACH-01", "ACH-02", etc.
  name        String
  description String
  icon        String           // emoji or icon identifier
  userAchievements UserAchievement[]
}

model UserAchievement {
  id             Int      @id @default(autoincrement())
  userId         Int
  achievementKey String
  unlockedAt     DateTime @default(now())
  user           User     @relation(fields: [userId], references: [id])
  achievement    Achievement @relation(fields: [achievementKey], references: [key])

  @@unique([userId, achievementKey])
}

// Add to UserProgress:
// quizAttempts Int @default(0)

// Add to User:
// achievements UserAchievement[]
```

### Mini-Challenge Content Schema (exercise.json extension)

```json
{
  "practice": {
    "...existing fields...": "...",
    "miniChallenges": [
      {
        "type": "multiple-choice",
        "prompt": "What is the Big-O of a single for-loop over n elements?",
        "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        "correctAnswer": 2,
        "timeLimit": 30
      },
      {
        "type": "code-trace",
        "prompt": "What does this print?\n```python\nfor i in range(3):\n    print(i)\n```",
        "correctAnswer": "0\n1\n2",
        "timeLimit": 45
      },
      {
        "type": "fill-blank",
        "prompt": "Complete: `if num ___ 2 == 0:` to check if num is even.",
        "correctAnswer": "%",
        "timeLimit": 20
      }
    ]
  }
}
```

### New API Endpoint: POST /api/topics/:id/hint

```typescript
// New controller function — unlockHint
export async function unlockHint(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const topicId = Number(req.params.id)
    const { stage } = req.body as { stage: 'practice' | 'challenge' }

    const progress = await prisma.userProgress.findUnique({
      where: { userId_topicId: { userId, topicId } }
    })
    if (!progress) throw new AppError(404, 'No progress found for this topic')

    const updated = await prisma.userProgress.update({
      where: { userId_topicId: { userId, topicId } },
      data: { hintsUsed: { increment: 1 } }
    })

    res.json({ data: { hintsUsed: updated.hintsUsed } })
  } catch (err) {
    next(err)
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS `@keyframes` only | `framer-motion` `AnimatePresence` for mount/unmount sequences | framer-motion v11+ | Exit animations work correctly without manual state management |
| Hardcoded level lookup table in client | Server-authoritative level in `User.level` (derived from shared formula) | Phase 3 decision | Client should trust server-returned level, not recompute |

**Note:** framer-motion v12 (installed) uses the same API as v11 for `motion.div`, `AnimatePresence`, and `useAnimation`. No breaking changes affecting this phase.

---

## Open Questions

1. **Level formula alignment between client and server**
   - What we know: `shared/constants.ts` has `xpForLevel(n) = Math.floor(100 * n^1.5)`. `client/src/lib/constants.ts` has `LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, ...]` (11 levels hardcoded).
   - What's unclear: Do the two agree numerically? `xpForLevel(2) = floor(100*2^1.5) = floor(282.8) = 282`, but `LEVEL_THRESHOLDS[1] = 100` for level 2. They don't agree — `LEVEL_THRESHOLDS` is a separately authored table.
   - Recommendation: The planner should include a task to reconcile these. Best approach: remove `LEVEL_THRESHOLDS` from `client/src/lib/constants.ts` and derive them from the shared `xpForLevel` (or always trust `authStore.user.level` from the server). The XP bar progress calculation (`progress` fraction) needs the "XP needed for current level" and "XP needed for next level" — these should come from `xpForLevel(level)` and `xpForLevel(level+1)`.

2. **Achievement seed data**
   - What we know: A new `Achievement` model needs 12 rows seeded.
   - What's unclear: Whether to seed these in the existing `server/seed/index.ts` file or generate them via a Prisma migration initial data seed.
   - Recommendation: Add to `server/seed/index.ts` using the same `deleteMany + createMany` idempotency pattern already established for Topics.

3. **`hintsUsed` tracks total hints or per-exercise hints**
   - What we know: `UserProgress.hintsUsed` is per-row (per topic). A topic has both practice and challenge exercises, each with 3 tiers.
   - What's unclear: Does `hintsUsed` track total hints across both exercises (0–6) or just one (0–3)? ACH-10 "Hint Hoarder: Use all 3 hint tiers on a single exercise" needs per-exercise tracking.
   - Recommendation: Since `hintsUsed` is per UserProgress row (per topic), and each topic has two exercises, consider whether the hint gate needs to track hints separately per exercise (practice vs challenge). The simplest approach: track `practiceHintsUsed` and `challengeHintsUsed` separately on UserProgress, or use a separate `exerciseId` key. However, for ACH-10, checking `hintsUsed >= 3` per-exercise is needed. The planner should decide this — the simplest path that satisfies ACH-10 is adding `practiceHintsUsed` and `challengeHintsUsed` as separate Int fields on UserProgress.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 3 is a pure code/schema extension with no external dependencies beyond what is already installed and running. All required tools (Node.js, npm, Prisma, Vite, vitest) are part of the existing project setup.

---

## Validation Architecture

`workflow.nyquist_validation` is not set to `false` in `.planning/config.json` (only `_auto_chain_active` is present), so this section is included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.2 |
| Server config | `dsa-quest/server/vitest.config.ts` (environment: node) |
| Client config | `dsa-quest/client/vitest.config.ts` (environment: jsdom) |
| Server quick run | `npm run test --workspace=server` |
| Client quick run | `npm run test --workspace=client` |
| Full suite | `npm run test --workspace=server && npm run test --workspace=client` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAME-01 | `calculateXpAward()` returns correct XP per stage | unit (server) | `npm run test --workspace=server` | Wave 0 |
| GAME-01 | XP not double-awarded on duplicate POST | unit (server) | `npm run test --workspace=server` | Wave 0 |
| GAME-02 | `deriveLevel()` computes correct level from XP | unit (server) | `npm run test --workspace=server` | Wave 0 |
| GAME-02 | `leveledUp: true` returned when level increases | unit (server) | `npm run test --workspace=server` | Wave 0 |
| GAME-03 | First-try bonus awarded when `attempts===1` | unit (server) | `npm run test --workspace=server` | Wave 0 |
| GAME-03 | Speed bonus awarded when `elapsedSeconds <= threshold` | unit (server) | `npm run test --workspace=server` | Wave 0 |
| GAME-04 | ACH-01 fires after Topic 1 challenge complete | unit (server) | `npm run test --workspace=server` | Wave 0 |
| GAME-04 | ACH-03/04 streak counting logic correct | unit (server) | `npm run test --workspace=server` | Wave 0 |
| GAME-05 | `MiniChallenge` renders correct answer check | unit (client) | `npm run test --workspace=client` | Wave 0 |
| GAME-06 | HintGate blocks tier N+1 until `hintsUsed >= N` | unit (client) | `npm run test --workspace=client` | Wave 0 |
| GAME-07 | `LevelUpModal` renders with correct level value | unit (client) | `npm run test --workspace=client` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run test --workspace=server` (for server tasks) or `npm run test --workspace=client` (for client tasks)
- **Per wave merge:** `npm run test --workspace=server && npm run test --workspace=client`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `dsa-quest/server/src/__tests__/xpAward.test.ts` — covers GAME-01, GAME-02, GAME-03 (pure functions: `calculateXpAward`, `deriveLevel`)
- [ ] `dsa-quest/server/src/__tests__/achievements.test.ts` — covers GAME-04 (pure function: `checkAchievements`)
- [ ] `dsa-quest/client/src/components/gamification/__tests__/MiniChallenge.test.tsx` — covers GAME-05
- [ ] `dsa-quest/client/src/components/gamification/__tests__/HintGate.test.tsx` — covers GAME-06
- [ ] `dsa-quest/client/src/components/gamification/__tests__/LevelUpModal.test.tsx` — covers GAME-07

---

## Project Constraints (from CLAUDE.md)

| Constraint | Source | Applies To |
|------------|--------|------------|
| XP values: quiz=50, practice=100, challenge=200 | CLAUDE.md + shared/constants.ts | Plan 03-01 |
| First-try bonus: +50 XP, Speed bonus: +25 XP | CLAUDE.md + shared/constants.ts | Plan 03-01 |
| Level formula: `xpForLevel(n) = Math.floor(100 * n^1.5)` | CLAUDE.md + shared/constants.ts | Plan 03-01 |
| Hint system: 3 tiers, mini-challenge gate | CLAUDE.md | Plan 03-04 |
| Hint tiers: approach → pseudocode → code snippet | CLAUDE.md | Plan 03-04 |
| Adventure-map theme: parchment, brown, gold, crimson, forest, ocean | CLAUDE.md | All UI plans |
| Font: "Pirata One" for headings, JetBrains Mono for code | CLAUDE.md | Plans 03-02, 03-05 |
| Desktop-only scope | CLAUDE.md | All plans |
| Python-only code execution (Pyodide) | CLAUDE.md | Plan 03-04 (mini-challenge is NOT code execution — client-side string/number comparison only) |
| Content stored as JSON/markdown in `client/src/content/` | CLAUDE.md | Plan 03-04 (miniChallenges array in exercise.json) |
| No CMS | CLAUDE.md | All plans |

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection — `shared/constants.ts`, `shared/types.ts`, `server/prisma/schema.prisma`, `server/src/controllers/topicsController.ts`, `client/src/stores/authStore.ts`, `client/src/stores/uiStore.ts`, `client/src/components/ui/Navbar.tsx`, `client/src/components/ui/GoldBadge.tsx`, `client/src/components/ui/ParchmentPanel.tsx`, `client/src/lib/constants.ts`, `client/tailwind.config.js`, `client/package.json`, `server/package.json`
- `client/src/content/topics/01-big-o/exercise.json` — existing hint and exercise structure
- `dsa-quest/client/vitest.config.ts`, `dsa-quest/server/vitest.config.ts` — confirmed test framework setup
- `dsa-quest/server/src/__tests__/progress.test.ts` — confirmed vitest unit test pattern for pure controller functions
- `.planning/codebase/ARCHITECTURE.md` — confirmed layered pattern and store conventions
- `.planning/phases/03-gamification/03-CONTEXT.md` — all locked decisions

### Secondary (MEDIUM confidence)

- framer-motion v12 API compatibility: `AnimatePresence`, `motion.div`, `rotateY` — based on installed version 12.38.0 and knowledge that framer-motion v11/v12 API is stable for these primitives

### Tertiary (LOW confidence)

- None — all claims are grounded in direct codebase inspection or locked CONTEXT.md decisions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in use
- Architecture: HIGH — patterns directly observed in existing codebase
- Pitfalls: HIGH — derived from direct code inspection (level formula drift observed, double-award gap identified in completeExercise, quizAttempts gap identified)
- Schema changes: HIGH — current schema read directly

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable stack, no fast-moving dependencies)
