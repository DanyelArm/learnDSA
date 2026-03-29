# DSA Quest

A gamified, adventure-map-themed web app for learning Data Structures & Algorithms. Progress through 20 topics — each with theory, a quiz, a practice exercise, and a LeetCode-style challenge. All user code runs in Python, executed in-browser via Pyodide (WebAssembly).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| State | Zustand |
| Code editor | Monaco Editor *(Phase 2)* |
| Visualization | D3.js *(Phase 4)* |
| Code execution | Pyodide in a Web Worker *(Phase 2)* |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite via Prisma ORM |
| Auth | JWT (email + password) |

## Prerequisites

- Node.js 22+ (install via [nvm](https://github.com/nvm-sh/nvm): `nvm install 22`)

## Getting Started

```bash
# 1. Install all dependencies (runs across all workspaces)
npm install

# 2. Set up server environment
cp server/.env.example server/.env
# Edit server/.env and set a strong JWT_SECRET

# 3. Run the initial database migration
npm run db:migrate

# 4. Seed the 20 DSA topics
npm run db:seed

# 5. Start both servers concurrently
npm run dev
```

The client runs at **http://localhost:5173** and the API at **http://localhost:3001**.

## Scripts

Run all scripts from the `dsa-quest/` root:

| Script | Description |
|---|---|
| `npm run dev` | Start client (:5173) and server (:3001) concurrently |
| `npm run build` | Production build for both client and server |
| `npm run db:migrate` | Run Prisma migrations (`--name <name>` to name a new migration) |
| `npm run db:seed` | Seed the database with 20 topics (idempotent — safe to re-run) |
| `npm run db:studio` | Open Prisma Studio to browse the database |

## Project Structure

```
dsa-quest/
├── client/src/
│   ├── components/
│   │   ├── map/         # Adventure map — AdventureMap, TopicNode, MapCanvas, MapPath
│   │   ├── auth/        # LoginForm, RegisterForm, ProtectedRoute
│   │   └── ui/          # Shared themed components (Navbar, ParchmentPanel, GoldBadge)
│   ├── hooks/           # useAuth, useTopics, useMapTransform
│   ├── stores/          # Zustand stores (authStore, topicsStore, uiStore)
│   ├── lib/             # api.ts (Axios), constants.ts (node coords, XP)
│   ├── pages/           # MapPage, LoginPage, RegisterPage
│   └── styles/          # globals.css (Tailwind + custom component classes)
├── server/src/
│   ├── controllers/     # authController, usersController, topicsController
│   ├── middleware/       # authenticate (JWT), validate (Zod), errorHandler
│   ├── routes/          # /api/auth, /api/users, /api/topics
│   ├── lib/             # jwt.ts, prismaClient.ts
│   └── schemas/         # Zod schemas for request validation
├── server/prisma/
│   └── schema.prisma    # User and Topic models
├── server/seed/
│   ├── topics.data.ts   # 20 topic definitions
│   └── index.ts         # Upsert-based seed runner
└── shared/src/
    ├── types.ts          # AuthUser, TopicDTO, NodeState, ApiResponse<T>
    └── constants.ts      # XP values, level formula
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/users/me` | Bearer token | Get current user |
| GET | `/api/topics` | — | List all 20 topics |
| GET | `/api/health` | — | Server health check |

## Adventure Map

The home screen is a zoomable, pannable parchment treasure map with 20 topic nodes laid out in an S-curve:

- **Scroll** to zoom (bounded — can't zoom out past the map edges)
- **Drag** to pan
- **+/−/⌂** buttons in the bottom-right corner for zoom controls

**Node states:** Locked 🔒 → Available ⚡ → Completed ★ → Mastered ♛

Progression is strictly linear — completing topic *N* unlocks topic *N+1*.

## XP System

| Action | XP |
|---|---|
| Theory quiz passed | 50 |
| Practice exercise passed | 100 |
| Challenge solved | 200 |
| First-try bonus | +50 |
| Speed bonus | +25 |

## DSA Topic Order

1. Big-O Notation & Complexity Analysis
2. Arrays & Strings
3. Linked Lists
4. Stacks
5. Queues & Deques
6. Hash Tables
7. Recursion
8. Sorting Algorithms
9. Searching Algorithms
10. Trees & BST
11. Heaps & Priority Queues
12. Graphs — Representation
13. Graph Traversal (BFS & DFS)
14. Dynamic Programming — Basics
15. Dynamic Programming — Advanced
16. Greedy Algorithms
17. Backtracking
18. Tries
19. Union-Find
20. Segment Trees & Fenwick Trees

## Build Phases

- **Phase 1** ✅ Monorepo, Tailwind theme, adventure map UI, JWT auth, Prisma models, seed
- **Phase 2** Lesson flow — theory/markdown, quiz (≥80% to pass), Monaco + Pyodide editor, linear unlock
- **Phase 3** Gamification — XP/levels, achievements, hint system with mini-challenges
- **Phase 4** Sandbox — free-play editor, `<DSAVisualizer>` step-through component
- **Phase 5** Content & polish — all 20 full lessons, animations, landing page

## Environment Variables

```env
# server/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-here"   # Change this — used to sign all JWTs
PORT=3001
CLIENT_URL="http://localhost:5173"
```
