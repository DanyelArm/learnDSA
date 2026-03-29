# Testing Patterns

**Analysis Date:** 2026-03-29

## Test Framework

**Status: No test framework installed.**

Neither `client/package.json` nor `server/package.json` includes any testing library (no Vitest, Jest, Testing Library, Supertest, or Playwright). There are zero test files anywhere in the codebase.

**Run Commands:**
```bash
# None configured — no test scripts exist in either package.json
```

## Test File Locations

**Status: No test files exist.**

No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files are present anywhere under `dsa-quest/`.

No test configuration files exist:
- `client/vitest.config.ts` — missing
- `server/jest.config.ts` — missing
- `client/src/setupTests.ts` — missing

## Coverage Status

**Overall: 0%**

No coverage tooling is installed or configured. All application code is untested.

---

## Untested Code — Risk Assessment

### Backend: High Risk

**`server/src/controllers/authController.ts`**
- Functions: `register`, `login`
- Untested logic: duplicate email/username detection (409), password hashing with bcrypt, JWT issuance, error propagation to `next()`
- Risk: Auth bugs reach production silently. Password comparison path and error messages are unverified.

**`server/src/middleware/authenticate.ts`**
- Function: `authenticate`
- Untested logic: missing/malformed `Authorization` header, expired or tampered JWT tokens, valid token flow setting `req.user`
- Risk: Protected routes could be accessible or erroneously blocked; regressions in token handling go undetected.

**`server/src/lib/jwt.ts`**
- Functions: `signToken`, `verifyToken`
- Untested logic: token signing with `JWT_SECRET`, expiry (`7d`), verification of tampered payloads
- Risk: JWT_SECRET misconfiguration or expiry behavior would not be caught until runtime.

**`server/src/middleware/validate.ts`**
- Function: `validate` (Zod schema middleware)
- Untested logic: invalid body causes 400 with `ZodError`, valid body passes through cleanly
- Risk: Malformed requests may behave unexpectedly; Zod version upgrades could silently break parsing.

**`server/src/middleware/errorHandler.ts`**
- Function: `errorHandler`
- Untested logic: `AppError` path (status + message), `ZodError` path (400 + details), Prisma P2002 path (409), generic 500 fallback
- Risk: Error response shapes are consumed by the frontend — shape changes here break client-side error display.

**`server/src/controllers/topicsController.ts`**
- Function: `listTopics`
- Untested logic: correct ordering by `order` asc, correct shape of selected fields, Prisma error forwarding
- Risk: Field selection changes or schema migrations could produce broken API responses silently.

**`server/src/routes/auth.ts`, `server/src/routes/topics.ts`, `server/src/routes/users.ts`**
- Untested logic: route-to-controller wiring, middleware application order (`validate` → `authenticate` → controller)
- Risk: Middleware applied in wrong order or to wrong routes is invisible without integration tests.

### Frontend: Medium–High Risk

**`client/src/stores/authStore.ts`**
- Untested logic: `login` and `register` actions (Axios calls, state transitions, error handling), `logout` clearing localStorage, `persist` middleware rehydration, `updateUser` partial update
- Risk: State bugs (e.g., token stored in Zustand but not localStorage, or vice versa) cause invisible auth failures. The dual-write to both localStorage and Zustand persist is particularly fragile.

**`client/src/hooks/useAuth.ts`**
- Untested logic: `isAuthenticated` derived from `!!token`
- Risk: Low complexity, but any refactor of `authStore` could silently break the derived value.

**`client/src/hooks/useTopics.ts`**
- Untested logic: fetch behavior, loading/error states, topic list shape
- Risk: API contract changes break the map silently.

**`client/src/lib/api.ts`**
- Untested logic: Axios instance configuration, base URL, auth header injection (if any interceptors exist)
- Risk: Auth headers not attached to requests would cause all protected calls to fail with 401 silently during development.

**`client/src/components/auth/LoginForm.tsx`, `RegisterForm.tsx`**
- Untested logic: form validation (react-hook-form + Zod), submit flow, error display from store
- Risk: Validation rule changes break UX; no regression protection.

**`client/src/components/auth/ProtectedRoute.tsx`**
- Untested logic: redirect behavior when unauthenticated, render behavior when authenticated
- Risk: Route protection failures expose authenticated pages to unauthenticated users.

**`client/src/components/map/TopicNode.tsx`, `AdventureMap.tsx`, `MapCanvas.tsx`**
- Untested logic: node state rendering (`locked` / `available` / `completed` / `mastered`), click handlers, D3 transform integration
- Risk: Visual regressions in the core navigation UI go unnoticed.

### Future Code: Critical Risk (Planned but Not Yet Built)

**Pyodide Web Worker (planned: `client/src/lib/pyodideWorker.ts` or similar)**
- This will execute untrusted user Python code in WebAssembly.
- Risk without tests: timeout enforcement (10s), stdout capture, return value extraction, and error containment are all safety-critical. Any bug here affects every code exercise.
- Required test coverage: timeout fires correctly, stdout captured and returned, invalid Python returns clean error (not crash), worker terminates after execution.

**XP / unlock logic (planned: `server/src/lib/xp.ts` or similar)**
- XP award rules (50/100/200 XP by stage), first-try bonus (+50), speed bonus (+25), linear unlock (topic N unlocks N+1 only)
- Risk without tests: XP calculation bugs corrupt user progress permanently; unlock gate failures block or skip content.

**Quiz scoring (planned: `client/src/components/lesson/`)**
- ≥80% pass threshold, unlimited retries
- Risk without tests: off-by-one errors in pass threshold go undetected.

---

## Recommended Test Setup

### Frontend: Vitest + React Testing Library

Vitest integrates directly with the existing Vite config and requires minimal setup.

**Install:**
```bash
cd dsa-quest/client
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

**`client/vite.config.ts` — add test block:**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
})
```

**`client/src/setupTests.ts`:**
```ts
import '@testing-library/jest-dom'
```

**`client/package.json` scripts to add:**
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

**Test file location:** Co-locate with source files.
- `client/src/stores/authStore.test.ts`
- `client/src/hooks/useAuth.test.ts`
- `client/src/components/auth/LoginForm.test.tsx`
- `client/src/components/auth/ProtectedRoute.test.tsx`

### Backend: Vitest (preferred) or Jest

Vitest works in Node environments and avoids the ESM/CJS friction that Jest has with TypeScript.

**Install:**
```bash
cd dsa-quest/server
npm install --save-dev vitest supertest @types/supertest
```

**`server/vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
})
```

**`server/package.json` scripts to add:**
```json
"test": "vitest",
"test:coverage": "vitest run --coverage"
```

**Test file location:** Co-locate with source files.
- `server/src/lib/jwt.test.ts`
- `server/src/middleware/authenticate.test.ts`
- `server/src/middleware/errorHandler.test.ts`
- `server/src/middleware/validate.test.ts`
- `server/src/controllers/authController.test.ts`

For controller/route integration tests, use Supertest to mount the Express app without starting a real server. Use an in-memory SQLite database or mock `prismaClient` to avoid touching the real database.

---

## Test Types

### Unit Tests

**Scope:** Pure functions and isolated modules with all dependencies mocked.

**Priority targets:**
- `server/src/lib/jwt.ts` — `signToken` / `verifyToken` round-trip, tampered token rejection
- `server/src/middleware/errorHandler.ts` — each error branch (`AppError`, `ZodError`, P2002, generic 500)
- `server/src/middleware/validate.ts` — valid body passes, invalid body throws `ZodError`
- `client/src/stores/authStore.ts` — each action with mocked Axios responses
- Future XP calculation logic

### Integration Tests

**Scope:** HTTP routes tested end-to-end through Express using Supertest, with Prisma mocked or pointed at a test database.

**Priority targets:**
- `POST /api/auth/register` — happy path, duplicate email, duplicate username, missing fields
- `POST /api/auth/login` — happy path, wrong password, unknown email
- `GET /api/topics` — authenticated request returns ordered list, unauthenticated returns 401
- Middleware ordering: validate fires before authenticate fires before controller

### E2E Tests

**Framework:** Playwright (not yet installed)

**Scope:** Full browser flows against a running dev stack.

**Priority targets (future phases):**
- Register → login → view map → click available topic node
- Complete quiz → verify topic unlocks
- Submit correct code → verify XP awarded and next topic unlocked
- Submit incorrect code → verify error shown and XP not awarded

**Install when ready:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

---

## Mocking Patterns (Recommended)

**Prisma (backend unit tests):**
```ts
vi.mock('../lib/prismaClient', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))
```

**Axios (frontend store tests):**
```ts
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))
```

**Pyodide Worker (future):**
The worker must be mocked in component tests. Real Pyodide execution should be covered by dedicated worker unit tests that run the actual WebAssembly in a Node.js environment.

---

*Testing analysis: 2026-03-29*
