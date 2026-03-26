# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DSA Quest** — a gamified, adventure-map-themed full-stack web app for learning Data Structures & Algorithms. Users progress linearly through 20 DSA topics, each with theory, a quiz, a practice exercise, and a LeetCode-style challenge. All user-written code is Python only, executed in-browser via Pyodide (WebAssembly).

## Planned Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + TypeScript + Tailwind CSS |
| Code editor | Monaco Editor |
| Visualization | D3.js or React Flow |
| State management | Zustand |
| Code execution | Pyodide (WebAssembly Python) in a Web Worker |
| Backend | Node.js + Express |
| Database | SQLite via Prisma ORM |
| Auth | JWT (email + password) |

## Planned Project Structure

```
dsa-quest/
├── client/src/
│   ├── components/
│   │   ├── map/         # Adventure map (main nav hub)
│   │   ├── editor/      # Monaco editor + test runner
│   │   ├── sandbox/     # Free-play editor + visualizer
│   │   ├── lesson/      # Theory, quiz, practice, challenge views
│   │   ├── gamification/# XP bar, achievements, level-up modals
│   │   └── ui/          # Shared themed components
│   ├── stores/          # Zustand stores
│   ├── content/         # Lesson markdown, quiz JSON, exercises (static files)
│   ├── lib/             # Pyodide runner, DSAVisualizer engine
│   └── pages/
├── server/
│   ├── routes/ controllers/ middleware/
│   ├── prisma/schema.prisma
│   └── seed/            # DB seed from content files
└── shared/              # Shared TypeScript types/constants
```

## Build Order (Phases)

Follow this sequence when implementing:

1. **Phase 1 — Foundation:** monorepo setup, Tailwind theme, adventure map UI (20 hardcoded nodes), basic auth, User + Topic models + seed script.
2. **Phase 2 — Lesson Flow:** theory/markdown view, quiz component (≥80% to pass, unlimited retries), Monaco + Pyodide code editor, practice/challenge screens with test validation, linear unlock logic.
3. **Phase 3 — Gamification:** XP/level system, achievement checks, hint system with mini-challenge modal, animations (level-up, badge unlock, map node reveal).
4. **Phase 4 — Sandbox:** free-play editor, `<DSAVisualizer>` component, step-through execution, preset templates.
5. **Phase 5 — Content & Polish:** all 20 topic lessons/quizzes/exercises, animations, landing page.

## Key Architecture Decisions

### Code Execution
- Pyodide runs in a **Web Worker** with a 10-second timeout — never on the main thread.
- Test case verification: run user code in Pyodide, capture stdout + return values, compare against expected outputs stored in `content/`.

### Visualization Engine
- Build a single reusable `<DSAVisualizer>` component that accepts `{ type, stateSnapshots[] }` and renders with D3/canvas.
- The Sandbox hooks into this by instrumenting user code to emit state snapshots at each operation.

### Content Storage
- All lessons, quiz questions, exercises, test cases, and hints are stored as **JSON/markdown files in `client/src/content/`** — no CMS.
- Seed the database on first run from these files.

### XP & Unlock Rules
- Theory quiz passed: 50 XP | Practice passed: 100 XP | Challenge solved: 200 XP
- First-try bonus: +50 XP | Speed bonus: +25 XP
- Strict linear unlock: completing topic N unlocks topic N+1 only.

### Hint System
- Hints are not free — users must pass a **mini-challenge** (timed multiple-choice / code trace / fill-in-the-blank) to earn 1 hint token.
- Each exercise/challenge has 3 hint tiers: high-level approach → pseudocode → key code snippet.

## UI Theme

- **Color palette:** parchment beige `#F5E6C8`, deep brown `#5C3A1E`, forest green `#2D5A27`, ocean blue `#1A4B6E`, gold `#D4A32E`, crimson `#8B1A1A`.
- **Fonts:** "Pirata One" or "MedievalSharp" (Google Fonts) for headings; JetBrains Mono / Fira Code for code.
- UI elements styled as scrolls, wooden signs, leather panels, carved-wood buttons, rope/vine progress bars.

## DSA Topic Order (20 Topics)

Big-O → Arrays/Strings → Linked Lists → Stacks → Queues/Deques → Hash Tables → Recursion → Sorting → Searching → Trees/BST → Heaps → Graph Representation → Graph Traversal (BFS/DFS) → DP Basics → DP Advanced → Greedy → Backtracking → Tries → Union-Find → Segment/Fenwick Trees

## Scope Constraints

- Desktop only (tablet nice-to-have, mobile out of scope).
- User-written code is **Python only**.
- Challenge problems are stored locally — not fetched from LeetCode.
- No CMS — all content lives in the repo as static files.
