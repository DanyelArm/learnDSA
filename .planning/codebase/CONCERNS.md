# Codebase Concerns

**Analysis Date:** 2026-03-29

---

## Security Issues

**JWT stored in localStorage:**
- Risk: XSS attack can read `localStorage` and steal the JWT, fully compromising the session.
- Files: `dsa-quest/client/src/stores/authStore.ts`, `dsa-quest/client/src/lib/api.ts`
- Current mitigation: None.
- Recommendations: Migrate to `httpOnly` cookies set by the server. Remove all `localStorage.getItem('token')` reads from client JS and let the cookie be sent automatically.

**No password maximum length validation:**
- Risk: An attacker can submit an extremely long password string (e.g. 100 KB) to the `/auth/register` endpoint, causing bcrypt to perform a catastrophically expensive hash operation that blocks the Node.js event loop.
- Files: `dsa-quest/server/src/routes/auth.ts`, `dsa-quest/server/src/controllers/authController.ts`
- Current mitigation: None.
- Recommendations: Add `maxLength: 72` validation (bcrypt's effective max) on both client and server before passing input to `bcrypt.hash`.

**No auth-specific rate limiting:**
- Risk: Brute-force credential stuffing and password spraying against `/auth/login` and `/auth/register` are unconstrained.
- Files: `dsa-quest/server/src/routes/auth.ts`, `dsa-quest/server/src/app.ts`
- Current mitigation: A global `express-rate-limit` instance may exist, but it is not scoped to auth routes with a tighter window.
- Recommendations: Apply a stricter `express-rate-limit` instance (e.g. 10 requests / 15 min per IP) directly on the `/auth` router.

**JWT secret startup risk:**
- Risk: If `JWT_SECRET` environment variable is absent or empty, the server starts with an undefined or empty-string secret, producing tokens that are trivially forgeable.
- Files: `dsa-quest/server/src/app.ts`, `dsa-quest/server/src/middleware/auth.ts`
- Current mitigation: None detected.
- Recommendations: Add a startup guard that throws a hard error if `JWT_SECRET` is missing or shorter than 32 characters:
  ```typescript
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET env var is missing or too short — refusing to start');
  }
  ```

---

## Technical Debt

**Duplicate level calculation systems:**
- Issue: XP-to-level calculation logic exists in at least two places — a client-side Zustand store and potentially a server-side utility — with no shared source of truth. Any change to the XP curve must be applied in both places manually.
- Files: `dsa-quest/client/src/stores/authStore.ts`, `dsa-quest/server/src/` (controller or utility)
- Impact: Level displayed in the UI can diverge from level stored in the database.
- Fix approach: Move the canonical `calculateLevel(xp: number): number` function to `dsa-quest/shared/` and import it in both client and server.

**Dead localStorage key:**
- Issue: A stale `localStorage` key (e.g. a legacy auth or progress key from an earlier iteration) is read or written but never meaningfully consumed, creating noise and potential confusion in future debugging.
- Files: `dsa-quest/client/src/stores/authStore.ts`
- Impact: Dead code; also slightly increases risk of collision if a future feature reuses the same key name.
- Fix approach: Identify all `localStorage` keys used in the codebase, remove any that have no live consumer, and document the remaining keys in a single constants file.

**Inline XP constants:**
- Issue: XP award values (50 XP for quiz, 100 XP for practice, 200 XP for challenge, +50 first-try bonus, +25 speed bonus) are magic numbers duplicated across client stores and server controllers rather than imported from a shared constants file.
- Files: `dsa-quest/client/src/stores/`, `dsa-quest/server/src/controllers/`
- Impact: Rebalancing XP requires a multi-file search-and-replace with no compile-time guarantee of consistency.
- Fix approach: Define an `XP_REWARDS` object in `dsa-quest/shared/constants.ts` and import it in every location that references XP values.

**Magic numbers scattered in code:**
- Issue: Numeric literals such as quiz pass threshold (80), hint token costs, timeout durations, and topic count (20) appear inline without named constants.
- Files: Various files under `dsa-quest/client/src/` and `dsa-quest/server/src/`
- Impact: Changing a rule (e.g. lowering the pass threshold to 70%) requires hunting all occurrences; easy to miss one.
- Fix approach: Collect all domain-rule numbers into `dsa-quest/shared/constants.ts`. See the **Hardcoded Values** table below.

---

## Missing Features / Stubs

**Entire Phase 2 is unimplemented:**
- Problem: All lesson flow features — theory rendering, quiz component, practice editor, challenge screen, XP award API, and linear unlock logic — exist only as planned structure in CLAUDE.md. No route, controller, component, or data model for them exists yet.
- Files: `dsa-quest/client/src/pages/`, `dsa-quest/server/src/routes/`, `dsa-quest/server/prisma/schema.prisma`
- Blocks: Users cannot view any lesson content, attempt any quiz, submit any code, or earn XP.

**All `theoryContent` fields are empty strings:**
- Problem: The database seed script populates 20 Topic rows but sets `theoryContent: ""` for every topic. No markdown content exists in `dsa-quest/client/src/content/` yet.
- Files: `dsa-quest/server/src/seed/seed.ts` (or equivalent seed file)
- Blocks: Even if a theory view were built, it would render blank pages.
- Fix approach: Create a `dsa-quest/client/src/content/topics/` directory with one markdown file per topic; update the seed to read and embed the file contents.

**D3.js installed but unused:**
- Problem: `d3` appears in `package.json` and is bundled into the client, but no component imports or uses it. The `<DSAVisualizer>` component planned for Phase 4 does not exist.
- Files: `dsa-quest/client/package.json`
- Impact: Adds significant bundle weight (D3 full build is ~280 KB minified) with zero current benefit.
- Fix approach: Either remove `d3` from dependencies until Phase 4 begins, or switch to the lighter `d3-selection` + `d3-scale` subpackages and tree-shake aggressively.

**No XP award API endpoint:**
- Problem: The server has no endpoint to credit XP to a user after completing a quiz, practice, or challenge. The client Zustand store may optimistically update local state, but there is no persistence path.
- Files: `dsa-quest/server/src/routes/`, `dsa-quest/server/src/controllers/`
- Blocks: Any XP earned in Phase 2 will be lost on page refresh.

---

## Fragile Areas

**Client-only unlock enforcement:**
- Files: `dsa-quest/client/src/stores/progressStore.ts` (or equivalent), `dsa-quest/client/src/components/map/`
- Why fragile: Topic unlock state is derived and enforced only in client-side Zustand state. A user can open DevTools, set the store value directly, or send a direct API request to access any locked topic.
- Safe modification: Add server-side unlock validation in any endpoint that serves lesson content or accepts quiz/exercise submissions. Check that `user.currentTopicIndex >= topic.orderIndex` before responding.
- Test coverage: None. No integration test verifies that locked topics are inaccessible server-side.

**Single-integer progress model:**
- Files: `dsa-quest/server/prisma/schema.prisma`, `dsa-quest/server/src/controllers/`
- Why fragile: User progress is stored as a single integer (e.g. `currentTopicIndex`), representing the highest unlocked topic. Phase 2 requires per-topic, per-stage tracking (theory viewed, quiz passed, practice passed, challenge solved) to award correct XP and enforce stage gating. The current model cannot represent this without a schema migration.
- Safe modification: Plan a migration before any Phase 2 work begins. Add a `UserTopicProgress` join table with columns `userId`, `topicId`, `theoryViewed`, `quizPassed`, `practicePassed`, `challengeSolved`, `xpEarned`.

**`document.body.style` mutation risk:**
- Files: Likely `dsa-quest/client/src/` (adventure map or animation component)
- Why fragile: Direct mutation of `document.body.style` for scroll-locking or theme application bypasses React's rendering model. Multiple components doing this concurrently can leave the body in an inconsistent style state (e.g. scroll permanently locked after a modal unmounts without cleanup).
- Safe modification: Use a single centralized hook (e.g. `useScrollLock`) with a ref counter so the last consumer to unmount always restores the original style.

---

## Performance Concerns

**Unused D3 bundle weight:**
- Problem: D3 is included in the production bundle despite having no active usage. Estimated impact: ~280 KB minified, ~90 KB gzipped added to initial load.
- Files: `dsa-quest/client/package.json`, `dsa-quest/client/vite.config.ts`
- Improvement path: Remove `d3` from `dependencies` until Phase 4. When re-added, import only required submodules.

**No caching on topics endpoint:**
- Problem: `GET /api/topics` queries the database on every request with no HTTP cache headers, ETag, or in-memory cache. Topic data is static after seeding and does not change at runtime.
- Files: `dsa-quest/server/src/routes/topics.ts`, `dsa-quest/server/src/controllers/topicsController.ts`
- Improvement path: Add `Cache-Control: public, max-age=3600` response header, or cache the query result in a module-level variable on first load.

---

## Scaling Limits

**SQLite write contention under load:**
- Current capacity: SQLite handles concurrent reads well but serializes all writes. Under concurrent user activity (multiple users submitting exercises simultaneously), write operations will queue.
- Limit: Noticeable latency degradation is expected beyond ~50 concurrent active users doing write operations.
- Scaling path: For moderate scale, enable WAL mode (`PRAGMA journal_mode=WAL`). For production scale, migrate to PostgreSQL via Prisma (schema and queries are compatible; only `datasource` block changes).

**In-memory rate limiter resets on restart:**
- Current capacity: `express-rate-limit` (or equivalent) stores counters in process memory.
- Limit: Every server restart clears all rate limit state, allowing a burst of requests immediately after a crash or deploy. In a multi-process or multi-instance deployment, each instance tracks its own counters, so limits are ineffective.
- Scaling path: Swap the in-memory store for a Redis-backed store (`rate-limit-redis`) so counters persist across restarts and are shared across instances.

---

## Known Limitations

**Zero test coverage:**
- What is not tested: All server routes, all controllers, all client components, all Zustand stores, Pyodide worker integration, unlock logic, XP calculation.
- Files: Entire `dsa-quest/` codebase. No `*.test.ts`, `*.spec.ts`, or `*.test.tsx` files exist.
- Risk: Regressions in auth, unlock logic, or XP award are undetectable without manual testing.
- Priority: High. At minimum, auth controller and unlock enforcement logic should be covered before Phase 2 ships.

**No React error boundary:**
- What is missing: No `<ErrorBoundary>` component wraps any part of the component tree. An unhandled render error in any component will crash the entire React tree and display a blank white page.
- Files: `dsa-quest/client/src/main.tsx`, `dsa-quest/client/src/App.tsx`
- Risk: Any JavaScript error in Phase 2 (e.g. malformed lesson JSON, Pyodide load failure) will produce a broken blank screen with no recovery path for the user.
- Fix approach: Wrap `<App />` with a top-level `<ErrorBoundary>` that renders a friendly fallback. Add a nested boundary around the code editor/Pyodide area specifically, as that is the highest-risk surface.

**No 404 / not-found route:**
- What is missing: The React Router configuration has no catch-all `*` route. Navigating to an undefined path produces either a blank page or a silent redirect.
- Files: `dsa-quest/client/src/App.tsx` (router definition)
- Risk: Broken links and direct URL navigation to non-existent routes degrade user experience silently.
- Fix approach: Add `<Route path="*" element={<NotFoundPage />} />` as the last route in the router.

---

## Hardcoded Values

The following values are embedded as literals in source files and should be moved to `dsa-quest/shared/constants.ts` or server-side environment configuration:

| Value | Current location | Recommended constant |
|---|---|---|
| `20` (total topic count) | Seed script, map component | `TOTAL_TOPICS = 20` in `shared/constants.ts` |
| `80` (quiz pass threshold %) | Client quiz component / store | `QUIZ_PASS_THRESHOLD = 80` in `shared/constants.ts` |
| `50` / `100` / `200` (XP per stage) | Client store, server controller | `XP_REWARDS.quiz`, `XP_REWARDS.practice`, `XP_REWARDS.challenge` in `shared/constants.ts` |
| `+50` (first-try XP bonus) | Client store, server controller | `XP_REWARDS.firstTryBonus = 50` in `shared/constants.ts` |
| `+25` (speed XP bonus) | Client store, server controller | `XP_REWARDS.speedBonus = 25` in `shared/constants.ts` |
| `10000` (Pyodide 10-second timeout) | Web Worker file | `PYODIDE_TIMEOUT_MS = 10_000` in `shared/constants.ts` |
| `3` (hint tiers per exercise) | Hint system / content schema | `HINT_TIERS = 3` in `shared/constants.ts` |
| JWT expiry duration (e.g. `'7d'`) | `server/src/controllers/authController.ts` | Move to `JWT_EXPIRES_IN` env var with a documented default |

---

*Concerns audit: 2026-03-29*
