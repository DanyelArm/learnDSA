# Technology Stack

**Analysis Date:** 2026-03-29

## Languages

**Primary:**
- TypeScript ~5.9.3 (client) / ^5.8.3 (server) - All application code across client, server, and shared packages

**Secondary:**
- Python - User-written code only; executed in-browser via Pyodide (WebAssembly). Not part of the Node.js build.

## Runtime

**Environment:**
- Node.js - Server-side and build tooling
- Browser (WebAssembly) - Python execution via Pyodide (planned for Phase 2+)

**Package Manager:**
- npm with workspaces
- Lockfile: present (`package-lock.json` expected at `dsa-quest/`)
- Workspace roots: `dsa-quest/client`, `dsa-quest/server`, `dsa-quest/shared`

## Monorepo Structure

```
dsa-quest/
├── package.json          # Workspace root — npm workspaces
├── tsconfig.base.json    # Shared TypeScript base config
├── client/               # React frontend (Vite)
├── server/               # Express API
└── shared/               # Shared TypeScript types and constants
```

Workspace root scripts use `concurrently` to run client and server dev servers simultaneously (`npm run dev`).

## Frameworks

**Frontend:**
- React 19.2.4 - UI rendering
- React Router DOM 7.13.2 - Client-side routing (BrowserRouter)
- Tailwind CSS 3.4.19 - Utility-first styling with custom medieval theme tokens
- Framer Motion 12.38.0 - Animation library (level-up, badge unlock, map transitions)
- D3.js 7.9.0 - SVG-based adventure map rendering and future visualizer engine

**Backend:**
- Express 4.21.2 - HTTP server and REST API

**Build/Dev:**
- Vite 8.0.1 - Frontend bundler and dev server
- `@vitejs/plugin-react` 6.0.1 - React Fast Refresh via Vite
- `ts-node-dev` 2.0.0 - Server dev runner with auto-restart on change
- `tsc` - TypeScript compiler (server production build)

## Key Dependencies

**State Management:**
- Zustand 5.0.12 - Lightweight client-side state stores
  - `zustand/middleware` `persist` middleware used for auth state persistence to `localStorage`
  - Three stores: `authStore`, `topicsStore`, `uiStore`

**Forms and Validation:**
- React Hook Form 7.72.0 - Form state management
- `@hookform/resolvers` 3.10.0 - Zod schema adapter for React Hook Form
- Zod 4.3.6 (client) / 3.24.3 (server) - Schema validation (note: different major versions across workspaces)

**HTTP Client:**
- Axios 1.13.6 - API communication; configured with request/response interceptors for JWT injection and 401 handling

**Authentication and Security:**
- `jsonwebtoken` 9.0.2 - JWT signing and verification (7-day expiry)
- `bcryptjs` 3.0.2 - Password hashing (12 salt rounds)
- `helmet` 8.1.0 - HTTP security headers
- `express-rate-limit` 7.5.0 - Rate limiting (100 req/15 min per IP)
- `cors` 2.8.5 - Cross-origin config (origin restricted to `CLIENT_URL`)

**Database:**
- `@prisma/client` 6.19.2 - ORM client for SQLite
- `prisma` 6.7.0 (dev) - Migration and schema tooling

**Shared Package:**
- `@dsa-quest/shared` (local workspace) - TypeScript types (`AuthUser`, `TopicDTO`, `ApiResponse`, `NodeState`, `TopicStage`) and game constants (`XP_PER_STAGE`, `LEVEL_BASE`, `xpForLevel`)

**CSS Tooling:**
- PostCSS 8.5.8 - CSS transformation pipeline
- Autoprefixer 10.4.27 - Vendor prefix injection
- `@tailwindcss/typography` 0.5.19 - Prose typography plugin (for lesson markdown)

## Configuration

**Environment (server only — `.env` at `dsa-quest/server/.env`):**
- `DATABASE_URL` - SQLite file path (e.g., `file:./dev.db`)
- `JWT_SECRET` - HMAC signing secret for JWTs
- `PORT` - Server port (default: `3001`)
- `CLIENT_URL` - Allowed CORS origin (default: `http://localhost:5173`)

**Build:**
- `dsa-quest/client/vite.config.ts` - Vite config; `@` alias → `./src`; dev proxy `/api` → `http://localhost:3001`
- `dsa-quest/client/tsconfig.app.json` - Client TS config: `ES2023` target, `bundler` module resolution, strict mode, `@/*` path alias
- `dsa-quest/server/tsconfig.json` - Server TS config: `ES2020` target, `CommonJS` module, outputs to `dist/`
- `dsa-quest/tsconfig.base.json` - Shared base: `strict`, `esModuleInterop`, `sourceMap`, `declaration`
- `dsa-quest/client/tailwind.config.js` - Custom color palette (`parchment`, `brown`, `forest`, `ocean`, `gold`, `crimson`), custom fonts (`heading: Pirata One`, `code: JetBrains Mono/Fira Code`), custom animations and keyframes
- `dsa-quest/client/eslint.config.js` - ESLint config using `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

## Platform Requirements

**Development:**
- Node.js (version not pinned — no `.nvmrc` or `.node-version` detected)
- npm (workspaces support, npm 7+)
- Both processes must run concurrently: Vite dev server on port 5173, Express on port 3001

**Production:**
- Client: static files built by Vite (`dsa-quest/client/dist/`) — deployable to any static host or served by Express
- Server: compiled to `dsa-quest/server/dist/index.js` via `tsc`; requires SQLite file present and env vars set
- Database: SQLite file on server filesystem — no external database service required

---

*Stack analysis: 2026-03-29*
