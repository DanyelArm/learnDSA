# Architecture

**Analysis Date:** 2026-03-29

## Pattern Overview

**Overall:** Three-package npm workspaces monorepo with a React SPA frontend and a REST API backend, sharing a typed contract package.

**Key Characteristics:**
- Strict client/server separation — no server-side rendering; the frontend is a fully client-rendered SPA
- Shared TypeScript types and game constants live in a third workspace (`@dsa-quest/shared`) imported by both client and server
- Backend follows a layered Routes → Controllers → Prisma pattern (no service layer yet)
- Frontend uses Zustand stores as the single source of truth; components read from stores, never from local state for cross-cutting data
- All API communication goes through a single Axios instance (`client/src/lib/api.ts`) with centralized auth token injection and 401 redirect handling

## Layers

**Shared Contract (`shared/`):**
- Purpose: Shared TypeScript interfaces, DTO types, and game constants used by both client and server
- Location: `dsa-quest/shared/src/`
- Contains: `AuthUser`, `TopicDTO`, `ApiResponse<T>`, `ApiError`, `NodeState`, `TopicStage` types; XP/level constants and `xpForLevel()` helper
- Depends on: nothing
- Used by: client stores, client components; server controllers (not yet — controllers inline types for now)

**API Layer — Routes (`server/src/routes/`):**
- Purpose: Map HTTP verbs + paths to controller functions; attach middleware
- Location: `dsa-quest/server/src/routes/`
- Contains: `auth.ts`, `users.ts`, `topics.ts`
- Depends on: controllers, middleware
- Used by: `server/src/index.ts` mounts them at `/api/*`

**API Layer — Controllers (`server/src/controllers/`):**
- Purpose: Handle request/response cycle; call Prisma; throw `AppError` on failure
- Location: `dsa-quest/server/src/controllers/`
- Contains: `authController.ts` (register/login), `usersController.ts` (getMe), `topicsController.ts` (listTopics)
- Depends on: `lib/prismaClient`, `lib/jwt`, `middleware/errorHandler`
- Used by: routes

**API Layer — Middleware (`server/src/middleware/`):**
- Purpose: Cross-cutting request concerns
- Location: `dsa-quest/server/src/middleware/`
- Contains: `authenticate.ts` (JWT verification, attaches `req.user`), `validate.ts` (Zod schema parse gate), `errorHandler.ts` (global error normaliser)
- Depends on: `lib/jwt`, `errorHandler` (AppError class)
- Used by: routes (per-route), `server/src/index.ts` (errorHandler last)

**API Layer — Lib (`server/src/lib/`):**
- Purpose: Stateless utility singletons
- Location: `dsa-quest/server/src/lib/`
- Contains: `prismaClient.ts` (global singleton pattern), `jwt.ts` (`signToken`/`verifyToken` wrappers)
- Depends on: `@prisma/client`, `jsonwebtoken`
- Used by: controllers, authenticate middleware

**Frontend — Stores (`client/src/stores/`):**
- Purpose: Global client state; the only place that calls the API directly
- Location: `dsa-quest/client/src/stores/`
- Contains: `authStore.ts` (token + user, persisted to localStorage via zustand/persist), `topicsStore.ts` (cached topic list), `uiStore.ts` (map pan/zoom transform, selected node)
- Depends on: `lib/api`, `@dsa-quest/shared` types
- Used by: hooks, which are consumed by pages and components

**Frontend — Hooks (`client/src/hooks/`):**
- Purpose: Thin façades over stores; keep components decoupled from store internals
- Location: `dsa-quest/client/src/hooks/`
- Contains: `useAuth.ts` (re-exports authStore with `isAuthenticated` computed), `useTopics.ts` (triggers fetchTopics on mount), `useMapTransform.ts` (attaches wheel/mouse event listeners for pan-zoom)
- Depends on: stores, constants
- Used by: pages, components

**Frontend — Pages (`client/src/pages/`):**
- Purpose: Route-level components; compose feature components; orchestrate navigation
- Location: `dsa-quest/client/src/pages/`
- Contains: `LoginPage.tsx`, `RegisterPage.tsx`, `MapPage.tsx` (computes nodeStates from user progress), `LessonPage.tsx` (stub, reads from static TOPIC_NODES)
- Depends on: hooks, components, shared types
- Used by: `App.tsx` router

**Frontend — Components (`client/src/components/`):**
- Purpose: Reusable and feature UI components
- Location: `dsa-quest/client/src/components/`
- Sub-directories:
  - `auth/` — `LoginForm.tsx`, `RegisterForm.tsx`, `ProtectedRoute.tsx`
  - `map/` — `AdventureMap.tsx`, `MapCanvas.tsx`, `TopicNode.tsx`, `MapPath.tsx`, `MapLegend.tsx`, `NodeTooltip.tsx`, `TerrainLayer.tsx`
  - `ui/` — `Navbar.tsx`, `ParchmentPanel.tsx`, `GoldBadge.tsx`
- Depends on: hooks, stores, shared types, constants
- Used by: pages

## Data Flow

**User Registration / Login:**
1. User submits `LoginForm` / `RegisterForm` (react-hook-form + Zod validation client-side)
2. Form calls `authStore.login()` or `authStore.register()`
3. Store POSTs to `/api/auth/login` or `/api/auth/register` via `lib/api.ts` (Axios)
4. Server: `validate(LoginSchema)` middleware parses body; `authController` queries Prisma, compares bcrypt hash, calls `signToken`
5. Server returns `{ token, user: AuthUser }`
6. Store writes token to `localStorage` (`dsa-quest-token`) and into Zustand state (persisted via `zustand/persist` as `dsa-quest-auth`)
7. React Router navigates to `/` (MapPage)

**Authenticated API Request (e.g., GET /api/users/me):**
1. Axios request interceptor (`lib/api.ts`) reads token from `localStorage` and sets `Authorization: Bearer <token>`
2. Server `authenticate` middleware calls `verifyToken`; attaches `req.user = { id, email }`
3. Controller queries Prisma and returns data
4. On 401, Axios response interceptor clears localStorage and redirects to `/login`

**Map Rendering / Node State Computation:**
1. `MapPage` calls `useTopics()` hook → triggers `topicsStore.fetchTopics()` (fetches once, cached)
2. `MapPage` calls `useAuth()` to get `user.currentTopicId`
3. `MapPage.useMemo` derives a `Map<order, NodeState>` (locked / available / completed) by comparing each topic's `order` against `currentTopicId`
4. `AdventureMap` receives `nodeStates` and passes per-node state down to `TopicNode` components
5. SVG terrain + paths rendered by `MapCanvas`; HTML nodes overlaid by `TopicNode` components

**Map Pan/Zoom:**
1. `useMapTransform` hook attaches `wheel` and `mousedown/move/up` event listeners to the container ref
2. Computed transform `{ x, y, scale }` is written to `uiStore.mapTransform`
3. `AdventureMap` reads `transform` from the hook return value and applies as CSS `transform` to the world `<div>`

**State Management:**
- `authStore` — persisted (localStorage) Zustand store; token + user object; actions: login, register, logout, updateUser
- `topicsStore` — in-memory Zustand store; topic list; lazy-loaded once on first mount
- `uiStore` — in-memory Zustand store; map viewport transform and selected node; no persistence

## Key Abstractions

**AppError:**
- Purpose: Typed HTTP error that carries a status code; thrown in controllers and middleware
- Location: `server/src/middleware/errorHandler.ts`
- Pattern: Custom Error subclass; global `errorHandler` middleware inspects `instanceof AppError` to decide response status

**Zod Schema + Middleware Validation:**
- Purpose: Request body validation and type narrowing before controllers run
- Location: `server/src/middleware/validate.ts`, `server/src/schemas/authSchemas.ts`
- Pattern: `validate(ZodSchema)` factory returns an Express middleware that calls `schema.parse(req.body)` — throws `ZodError` on failure, which `errorHandler` catches and normalises to 400

**TopicNodeConfig + TOPIC_NODES:**
- Purpose: Static client-side map for the 20 DSA topics — each node has pixel coordinates on the 3000×2000 world canvas
- Location: `client/src/lib/constants.ts`
- Pattern: Immutable array of `TopicNodeConfig` objects imported directly by map components and `LessonPage`

**NodeState:**
- Purpose: Per-topic display state — `'locked' | 'available' | 'completed' | 'mastered'`
- Location: `shared/src/types.ts`
- Pattern: Derived at runtime in `MapPage` by comparing topic `order` against `user.currentTopicId`; passed down as props

**PrismaClient singleton:**
- Purpose: Prevent multiple Prisma client instances in development (ts-node-dev hot reload)
- Location: `server/src/lib/prismaClient.ts`
- Pattern: Attaches instance to `globalThis` when `NODE_ENV !== 'production'`

## Entry Points

**Server:**
- Location: `dsa-quest/server/src/index.ts`
- Triggers: `npm run dev --workspace=server` (ts-node-dev) or `node dist/index.js` (production)
- Responsibilities: Instantiate Express, register Helmet/CORS/rate-limit/body-parser globally, mount route prefixes (`/api/auth`, `/api/users`, `/api/topics`, `/api/health`), register global error handler last, call `app.listen`

**Client:**
- Location: `dsa-quest/client/src/main.tsx`
- Triggers: Vite dev server or built `index.html`
- Responsibilities: Mount React root; render `<App />` which owns the `BrowserRouter` and all routes

**App Router:**
- Location: `dsa-quest/client/src/App.tsx`
- Routes:
  - `/login` → `LoginPage`
  - `/register` → `RegisterPage`
  - `/` → `MapPage` (protected)
  - `/topic/:order` → `LessonPage` (protected)
  - `*` → redirect to `/`

## Error Handling

**Strategy:** Throw-and-catch with a centralised Express error handler on the server; silent store-level error strings on the client.

**Server Patterns:**
- Controllers wrap all Prisma calls in try/catch; pass errors to `next(err)`
- `AppError(statusCode, message)` produces structured JSON `{ error: string }`
- `ZodError` produces 400 with `{ error: 'Validation failed', details: [...] }`
- Prisma unique constraint code `P2002` produces 409
- All other errors produce 500 and `console.error`

**Client Patterns:**
- Zustand action catch blocks extract `response.data.error` from Axios errors and write to `store.error`
- Axios response interceptor handles 401 globally — clears localStorage and hard-redirects to `/login`
- Components read `error` from stores/hooks and display inline error messages

## Cross-Cutting Concerns

**Logging:** `console.error` for unexpected server errors only; no structured logging library.

**Validation:** Zod — schemas defined in `server/src/schemas/`, applied via `validate()` middleware on mutation routes; client-side validation also uses Zod via `@hookform/resolvers/zod`.

**Authentication:** JWT Bearer tokens — 7-day expiry, signed with `JWT_SECRET` env var, verified per-request in `authenticate` middleware; token stored in `localStorage` and Zustand persist.

**Rate Limiting:** `express-rate-limit` — 100 requests per 15-minute window, applied globally.

**Security Headers:** `helmet` applied globally on all routes.

**CORS:** Restricted to `CLIENT_URL` env var (default `http://localhost:5173`), with credentials enabled.

---

*Architecture analysis: 2026-03-29*
