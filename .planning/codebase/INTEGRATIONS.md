# External Integrations

**Analysis Date:** 2026-03-29

## APIs & External Services

**No third-party external APIs are integrated.** All data is self-contained:
- DSA content (topics, lessons, quizzes, exercises) lives as static files in the repo
- No CMS, no external content API, no LeetCode API calls
- No analytics, error tracking, or monitoring services are currently wired up

## Data Storage

**Databases:**
- SQLite via Prisma ORM
  - Connection env var: `DATABASE_URL` (e.g., `file:./dev.db`)
  - Schema: `dsa-quest/server/prisma/schema.prisma`
  - Client singleton: `dsa-quest/server/src/lib/prismaClient.ts`
  - Migrations: `dsa-quest/server/prisma/migrations/`
  - Seed script: `dsa-quest/server/seed/index.ts` (seeds `topics` table from `dsa-quest/server/seed/topics.data.ts`)
  - Studio command: `npm run db:studio --workspace=server` (Prisma Studio GUI)

**Models (Phase 1):**
- `User` — id, username, email, passwordHash, xp, level, currentTopicId, timestamps
- `Topic` — id, order, title, slug, description, theoryContent, visualizationType, createdAt

**File Storage:**
- Local filesystem only. No S3, GCS, or CDN integration.

**Caching:**
- None. No Redis or in-memory cache layer.
- Client-side: Zustand `topicsStore` caches the topics list in memory for the session lifetime (skips re-fetch if already loaded).

## Authentication & Identity

**Auth Provider:**
- Custom (self-hosted) — no third-party auth service (no Auth0, Firebase Auth, Clerk, etc.)

**Implementation:**
- Registration: `POST /api/auth/register` — validates with Zod (`RegisterSchema`), hashes password with `bcryptjs` (12 rounds), creates `User`, returns JWT
- Login: `POST /api/auth/login` — validates credentials, returns JWT
- Token: JWT signed with `JWT_SECRET` env var, 7-day expiry, payload `{ sub: userId, email }`
- Server middleware: `dsa-quest/server/src/middleware/authenticate.ts` — extracts `Bearer` token from `Authorization` header, verifies with `jsonwebtoken`, attaches `{ id, email }` to `req.user`
- Client token storage: `localStorage` key `dsa-quest-token`
- Client user storage: Zustand `authStore` with `persist` middleware under key `dsa-quest-auth` (also mirrors to `localStorage`)
- Auto-logout: Axios response interceptor in `dsa-quest/client/src/lib/api.ts` clears localStorage and redirects to `/login` on any 401 response

## HTTP Communication

**Client → Server:**
- All API calls go through the Axios instance at `dsa-quest/client/src/lib/api.ts`
- Base URL: `/api` (relative — resolved via Vite dev proxy to `http://localhost:3001` during development)
- Auth injection: request interceptor reads `dsa-quest-token` from `localStorage` and sets `Authorization: Bearer <token>` header on every request
- Error handling: response interceptor handles 401 globally; per-call errors surfaced via Zustand store `error` state

**Vite Dev Proxy:**
- Configured in `dsa-quest/client/vite.config.ts`: `/api` → `http://localhost:3001` with `changeOrigin: true`
- This means no CORS issues in development; in production the client must be configured to point at the real server origin

**Server CORS:**
- Configured in `dsa-quest/server/src/index.ts` with `origin: CLIENT_URL` (from env var) and `credentials: true`
- `CLIENT_URL` defaults to `http://localhost:5173`

## API Endpoints (Phase 1)

| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/api/auth/register` | No | Create account, returns JWT + user |
| POST | `/api/auth/login` | No | Authenticate, returns JWT + user |
| GET | `/api/users/me` | Yes | Return current user profile |
| GET | `/api/topics` | No | List all topics |
| GET | `/api/health` | No | Server health check |

Routes defined in:
- `dsa-quest/server/src/routes/auth.ts`
- `dsa-quest/server/src/routes/users.ts`
- `dsa-quest/server/src/routes/topics.ts`

## Validation

**Server:**
- Zod schemas in `dsa-quest/server/src/schemas/authSchemas.ts` (`RegisterSchema`, `LoginSchema`)
- `validate` middleware (`dsa-quest/server/src/middleware/validate.ts`) wraps `schema.parse(req.body)` — throws `ZodError` on failure, caught by `errorHandler`

**Client:**
- Zod schemas used with React Hook Form via `@hookform/resolvers/zod`
- Shared types from `@dsa-quest/shared` used for response typing

## Shared Package (Inter-workspace)

**`@dsa-quest/shared`** (workspace: `dsa-quest/shared/`):
- Consumed by both client and server as a local npm workspace dependency
- Exports TypeScript types: `AuthUser`, `TopicDTO`, `ApiResponse<T>`, `ApiError`, `TopicStage`, `NodeState`
- Exports game constants and helpers: `XP_PER_STAGE`, `XP_BONUS_FIRST_TRY`, `XP_BONUS_SPEED`, `LEVEL_BASE`, `LEVEL_EXP`, `xpForLevel()`, `TOPIC_STAGES`
- Entry point: `dsa-quest/shared/src/index.ts`
- Consumed via `import type { AuthUser } from '@dsa-quest/shared'` in both client and server

## Webhooks & Event Systems

**Incoming webhooks:** None.

**Outgoing webhooks:** None.

**Real-time / WebSockets:** None currently. All communication is request/response REST.

## Planned But Not Yet Implemented

The following integrations are planned per the CLAUDE.md roadmap but not present in the Phase 1 codebase:

- **Pyodide (WebAssembly)** — Python code execution engine. Will run in a Web Worker with a 10-second timeout. No network calls; loaded from CDN or bundled. Planned for Phase 2.
- **Monaco Editor** — Browser code editor (`@monaco-editor/react`). Not yet in `client/package.json`. Planned for Phase 2.
- **D3.js / React Flow visualization** — D3.js is installed (`^7.9.0`) and used for the SVG adventure map in Phase 1. The `<DSAVisualizer>` component consuming it for step-through algorithm visualization is planned for Phase 4.

---

*Integration audit: 2026-03-29*
