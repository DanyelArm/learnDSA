# Codebase Structure

**Analysis Date:** 2026-03-29

## Directory Layout

```
dsa-quest/                          # Monorepo root (npm workspaces)
├── package.json                    # Root workspace config + dev scripts
├── tsconfig.base.json              # Shared TS compiler base config
├── package-lock.json               # Lockfile
│
├── client/                         # React/Vite/TypeScript frontend
│   ├── index.html                  # Vite HTML entry point
│   ├── vite.config.ts              # Vite config (@ alias, /api proxy)
│   ├── tailwind.config.js          # Tailwind theme (custom colors, fonts)
│   ├── postcss.config.js           # PostCSS for Tailwind
│   ├── eslint.config.js            # ESLint config
│   ├── tsconfig.json               # TS project references
│   ├── tsconfig.app.json           # App compiler options
│   ├── tsconfig.node.json          # Vite/Node compiler options
│   ├── public/                     # Static assets served as-is
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── main.tsx                # React DOM bootstrap (mounts <App />)
│       ├── App.tsx                 # Router + route definitions
│       ├── App.css                 # Global CSS resets
│       ├── index.css               # Tailwind directives
│       ├── assets/                 # Image assets (hero.png, etc.)
│       ├── styles/
│       │   └── globals.css         # Custom CSS classes: scroll-panel, btn-gold, input-parchment, parchment-bg
│       ├── pages/                  # Route-level page components
│       │   ├── LoginPage.tsx       # /login route
│       │   ├── RegisterPage.tsx    # /register route
│       │   ├── MapPage.tsx         # / route — adventure map + node state logic
│       │   └── LessonPage.tsx      # /topic/:order route — placeholder for Phase 2
│       ├── components/
│       │   ├── auth/               # Auth-specific components
│       │   │   ├── LoginForm.tsx   # Form with react-hook-form + zod
│       │   │   ├── RegisterForm.tsx
│       │   │   └── ProtectedRoute.tsx  # Redirects unauthenticated users to /login
│       │   ├── map/                # Adventure map rendering components
│       │   │   ├── AdventureMap.tsx    # Root map component: manages transform, renders layers
│       │   │   ├── MapCanvas.tsx       # SVG layer: terrain, paths between nodes
│       │   │   ├── TopicNode.tsx       # Individual topic node (icon, state, animation, tooltip)
│       │   │   ├── MapPath.tsx         # SVG path connector between two nodes
│       │   │   ├── MapLegend.tsx       # Fixed overlay: legend for node states
│       │   │   ├── TerrainLayer.tsx    # SVG background terrain decorations
│       │   │   └── NodeTooltip.tsx     # Hover tooltip for a topic node
│       │   └── ui/                 # Shared themed UI primitives
│       │       ├── Navbar.tsx          # Fixed top nav: logo, sandbox link, XP badge, user menu
│       │       ├── ParchmentPanel.tsx  # Themed wrapper div with scroll-panel CSS class
│       │       └── GoldBadge.tsx       # XP + level display with progress bar
│       ├── hooks/                  # Custom React hooks (thin wrappers over stores)
│       │   ├── useAuth.ts          # Wraps authStore — exposes isAuthenticated, login, logout
│       │   ├── useTopics.ts        # Wraps topicsStore — triggers fetchTopics on mount
│       │   └── useMapTransform.ts  # Pan/zoom logic for the adventure map canvas
│       ├── stores/                 # Zustand global state stores
│       │   ├── authStore.ts        # Auth state: token, user, login/register/logout actions
│       │   ├── topicsStore.ts      # Topics list: fetch from /api/topics, cached after first load
│       │   └── uiStore.ts          # UI state: map pan/zoom transform, selected node order
│       ├── lib/                    # Shared utilities and constants
│       │   ├── api.ts              # Axios instance with baseURL=/api, auth interceptor, 401 redirect
│       │   └── constants.ts        # TOPIC_NODES config (order, x/y coords, label, icon), WORLD dimensions, XP/level helpers
│       └── content/                # (Planned) Static lesson markdown, quiz JSON, exercise test cases
│
├── server/                         # Node.js/Express/Prisma backend
│   ├── package.json                # Server dependencies
│   ├── tsconfig.json               # TS compiler options for server
│   ├── .env.example                # Documents required env vars
│   ├── prisma/
│   │   ├── schema.prisma           # DB schema: User + Topic models
│   │   ├── dev.db                  # SQLite database file (local dev)
│   │   └── migrations/             # Prisma migration history
│   │       └── 20260326182141_init/migration.sql
│   ├── seed/
│   │   ├── index.ts                # Seed runner: upserts topics from topics.data.ts
│   │   └── topics.data.ts          # Static array of all 20 DSA topics with descriptions
│   └── src/
│       ├── index.ts                # Express app entry: middleware, route mounting, listen
│       ├── routes/                 # Route definitions (thin: just wire URL → middleware → controller)
│       │   ├── auth.ts             # POST /api/auth/register, POST /api/auth/login
│       │   ├── topics.ts           # GET /api/topics
│       │   └── users.ts            # GET /api/users/me (protected)
│       ├── controllers/            # Request handlers — business logic + DB queries
│       │   ├── authController.ts   # register() and login() — bcrypt, prisma, signToken
│       │   ├── topicsController.ts # listTopics() — returns ordered topic list
│       │   └── usersController.ts  # getMe() — returns authenticated user's profile
│       ├── middleware/             # Express middleware
│       │   ├── authenticate.ts     # Bearer JWT verification, attaches req.user
│       │   ├── errorHandler.ts     # Central error handler: AppError, ZodError, Prisma P2002
│       │   └── validate.ts         # Zod schema validation middleware factory
│       ├── schemas/                # Zod request validation schemas (inferred types exported)
│       │   └── authSchemas.ts      # RegisterSchema, LoginSchema + inferred input types
│       └── lib/                    # Server-side shared utilities
│           ├── jwt.ts              # signToken() and verifyToken() using jsonwebtoken
│           └── prismaClient.ts     # Singleton Prisma client (cached on globalThis in dev)
│
└── shared/                         # Cross-boundary TypeScript types and constants
    ├── package.json                # name: @dsa-quest/shared, main: src/index.ts
    └── src/
        ├── index.ts                # Re-exports everything from types.ts and constants.ts
        ├── types.ts                # AuthUser, TopicDTO, ApiResponse<T>, ApiError, NodeState, TopicStage
        └── constants.ts            # XP_PER_STAGE, bonus values, level formula (xpForLevel), TOPIC_STAGES
```

## Module Boundaries

The monorepo has three distinct packages with clear ownership:

**`client` (frontend) — never imported by server**
- Owns all React components, Zustand stores, hooks, pages, and frontend constants
- Communicates with `server` exclusively via HTTP through the `/api` proxy
- Imports types from `@dsa-quest/shared` but never from `server/`

**`server` (backend) — never imported by client**
- Owns Express routes, controllers, middleware, Prisma schema, and seed scripts
- Communicates with `client` only over HTTP (REST responses)
- Imports types from `@dsa-quest/shared` but never from `client/`

**`shared` — imported by both client and server**
- Contains only pure TypeScript: interfaces, type aliases, and pure functions
- No framework dependencies (no React, no Express, no Prisma)
- Exposes everything through `shared/src/index.ts`
- Imported as `@dsa-quest/shared` in both workspaces

## API Surface (Client ↔ Server Boundary)

All client-server communication goes through the axios instance at `client/src/lib/api.ts`.
Vite proxies `/api` requests to `http://localhost:3001` in development.

| Method | Path | Auth Required | Handler |
|--------|------|---------------|---------|
| POST | `/api/auth/register` | No | `authController.register` |
| POST | `/api/auth/login` | No | `authController.login` |
| GET | `/api/users/me` | Yes (Bearer JWT) | `usersController.getMe` |
| GET | `/api/topics` | No | `topicsController.listTopics` |
| GET | `/api/health` | No | inline in `index.ts` |

## Key Files and Their Roles

**`client/src/App.tsx`**
Defines all client routes using React Router. The only place to add or remove routes.
Routes: `/login`, `/register`, `/` (MapPage), `/topic/:order` (LessonPage).

**`client/src/lib/api.ts`**
Single axios instance used by all stores. Automatically attaches the JWT from localStorage. Redirects to `/login` on any 401 response. All server calls must go through this instance.

**`client/src/lib/constants.ts`**
Canonical source for the 20 topic node configs (`TOPIC_NODES`) including x/y positions on the world canvas. Also defines `WORLD_WIDTH`, `WORLD_HEIGHT`, `LEVEL_THRESHOLDS`, and `getLevelFromXP()`. Update here to change map layout.

**`server/src/index.ts`**
Express application bootstrap. Mounts middleware (helmet, cors, rate-limit) and all route prefixes. The `errorHandler` middleware must always be the last `app.use()` call.

**`server/prisma/schema.prisma`**
Source of truth for the database schema. Changes here require a Prisma migration (`npm run db:migrate`).

**`server/seed/topics.data.ts`**
Static data array for all 20 DSA topics. Run with `npm run db:seed`. Seed uses `upsert` so it is safe to re-run.

**`shared/src/types.ts`**
Canonical TypeScript types shared across the boundary: `AuthUser`, `TopicDTO`, `ApiResponse<T>`, `NodeState` (`'locked' | 'available' | 'completed' | 'mastered'`), `TopicStage`.

**`shared/src/constants.ts`**
XP values per stage, bonus amounts, and the `xpForLevel()` formula. The single source of truth for gamification math.

## Client Organization

**Pages (`client/src/pages/`)**
Route-level components. Each page is responsible for:
- Fetching data via hooks
- Computing derived state (e.g., `nodeStates` map in `MapPage.tsx`)
- Composing components
- Handling navigation

Pages are named `[Name]Page.tsx` using PascalCase.

**Components (`client/src/components/`)**
Organized into domain subdirectories:
- `auth/` — forms and route guards for authentication
- `map/` — all adventure map rendering (SVG canvas, nodes, paths, terrain)
- `ui/` — shared themed primitives that any page can use

Components are named `[Name].tsx` using PascalCase. They receive props, do not fetch data directly (hooks do that).

**Hooks (`client/src/hooks/`)**
Thin wrappers over Zustand stores or complex imperative logic. Named `use[Name].ts` in camelCase. `useAuth` and `useTopics` are the primary data-access hooks. `useMapTransform` encapsulates all pan/zoom event handling.

**Stores (`client/src/stores/`)**
Zustand stores. Named `[domain]Store.ts` in camelCase. Three stores:
- `authStore.ts` — authentication state, persisted to `localStorage` via `zustand/middleware`
- `topicsStore.ts` — topics list, cached after first fetch (no persistence)
- `uiStore.ts` — ephemeral UI state (map transform, selected node)

Components should access stores through hooks in `hooks/`, not directly.

**Lib (`client/src/lib/`)**
Pure utilities: the axios client (`api.ts`) and front-end constants/config (`constants.ts`). Not React-specific.

**Styles (`client/src/styles/globals.css`)**
Custom Tailwind `@layer components` classes live here: `scroll-panel`, `parchment-bg`, `btn-gold`, `btn-wood`, `input-parchment`, `shadow-scroll`, `shadow-node-glow`. Use these classes before writing inline styles.

## Server Organization

**Routes (`server/src/routes/`)**
Thin files. Each file creates an Express `Router`, wires URL methods to middleware and controller functions, and exports the router. Routes do not contain business logic. Named by domain: `auth.ts`, `topics.ts`, `users.ts`.

**Controllers (`server/src/controllers/`)**
All business logic and DB access. Each exported function has the signature `(req, res, next) => Promise<void>`. Errors are passed to `next(err)`. Named `[domain]Controller.ts`.

**Middleware (`server/src/middleware/`)**
- `authenticate.ts` — JWT verification; attaches `req.user`. Apply per-route or per-router.
- `validate.ts` — factory function: `validate(ZodSchema)` returns middleware that parses `req.body`.
- `errorHandler.ts` — must be registered last. Handles `AppError`, `ZodError`, Prisma `P2002`, and unknown errors.

**Schemas (`server/src/schemas/`)**
Zod schemas for request validation. Named `[domain]Schemas.ts`. Export both the schema and the inferred TypeScript type. Used by `validate()` middleware and typed controller signatures.

**Lib (`server/src/lib/`)**
Server-side singletons and utilities: `prismaClient.ts` (singleton Prisma instance), `jwt.ts` (sign/verify helpers).

**Prisma (`server/prisma/`)**
- `schema.prisma` — models. Edit here, then run `npm run db:migrate`.
- `dev.db` — local SQLite file. Not committed to production.
- `migrations/` — committed migration history.

**Seed (`server/seed/`)**
- `topics.data.ts` — static data for all 20 topics. Edit here to update topic metadata.
- `index.ts` — runs upsert for each topic. Safe to re-run.

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `TopicNode.tsx`, `MapPage.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useAuth.ts`, `useMapTransform.ts`)
- Stores: `camelCase` with `Store` suffix (e.g., `authStore.ts`, `uiStore.ts`)
- Server controllers: `camelCase` with `Controller` suffix (e.g., `authController.ts`)
- Server routes: domain name only (e.g., `auth.ts`, `topics.ts`)
- Server schemas: domain name with `Schemas` suffix (e.g., `authSchemas.ts`)
- Shared types/constants: lowercase descriptive (e.g., `types.ts`, `constants.ts`)

**Directories:**
- Component subdirectories: lowercase by domain (`auth/`, `map/`, `ui/`)
- All other directories: lowercase (`hooks/`, `stores/`, `lib/`, `pages/`, `routes/`, `controllers/`, `middleware/`, `schemas/`)

## Where to Add New Code

**New API route:**
1. Add handler function to an existing controller in `server/src/controllers/` or create `server/src/controllers/[domain]Controller.ts`
2. Add Zod schema to `server/src/schemas/[domain]Schemas.ts` if body validation is needed
3. Wire the route in `server/src/routes/[domain].ts` using `validate()` and `authenticate` as needed
4. If it's a new domain, create `server/src/routes/[domain].ts` and mount it in `server/src/index.ts` as `app.use('/api/[domain]', [domain]Routes)`

**New database model:**
1. Add model to `server/prisma/schema.prisma`
2. Run `npm run db:migrate` to create and apply the migration
3. Add seed data to `server/seed/topics.data.ts` (or create a parallel seed file) and update `server/seed/index.ts`

**New page:**
1. Create `client/src/pages/[Name]Page.tsx`
2. Add route to `client/src/App.tsx`
3. Wrap in `<ProtectedRoute />` if authentication is required

**New component:**
- Domain-specific: add to the matching subdirectory in `client/src/components/[domain]/`
- General-purpose themed UI: add to `client/src/components/ui/`
- New domain: create `client/src/components/[domain]/` and add components there

**New Zustand store:**
1. Create `client/src/stores/[domain]Store.ts`
2. Create a companion hook `client/src/hooks/use[Domain].ts` that wraps it
3. Components access the store through the hook, not directly

**New shared type or constant:**
- Add to `shared/src/types.ts` (interfaces, type aliases, enums)
- Add to `shared/src/constants.ts` (pure values and pure functions)
- Both are automatically exported via `shared/src/index.ts`

**New CSS utility class (themed):**
- Add to `client/src/styles/globals.css` under `@layer components`
- Reference in components using the class name string

**New custom hook (non-store):**
- Add to `client/src/hooks/use[Name].ts`
- For map/canvas interaction logic, follow the pattern in `useMapTransform.ts` (imperative event listeners, synced to a Zustand store)

## Special Directories

**`client/dist/`**
- Purpose: Vite production build output
- Generated: Yes
- Committed: No (.gitignore'd)

**`client/node_modules/` and `server/node_modules/`**
- Purpose: Workspace-local dependencies
- Generated: Yes (npm install)
- Committed: No

**`server/prisma/migrations/`**
- Purpose: Prisma migration history — one folder per migration with a `migration.sql` file
- Generated: Yes (by `prisma migrate dev`)
- Committed: Yes — migrations are source-controlled

**`server/prisma/dev.db`**
- Purpose: Local SQLite database file
- Generated: Yes (on first migrate)
- Committed: No (contains local data)

**`client/src/content/`**
- Purpose: (Planned for Phase 2) Static lesson markdown, quiz JSON, exercise test cases, and hint tiers for all 20 topics
- Generated: No (hand-authored)
- Committed: Yes

---

*Structure analysis: 2026-03-29*
