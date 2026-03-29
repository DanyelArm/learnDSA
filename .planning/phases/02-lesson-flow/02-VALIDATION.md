---
phase: 2
slug: lesson-flow
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (client), Vitest (server) — Wave 0 installs both |
| **Config file** | `dsa-quest/client/vitest.config.ts`, `dsa-quest/server/vitest.config.ts` — Wave 0 creates |
| **Quick run command** | `cd dsa-quest && npm run test:ci 2>/dev/null \|\| npx vitest run --reporter=verbose 2>&1 \| tail -20` |
| **Full suite command** | `cd dsa-quest/client && npx vitest run && cd ../server && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | LESS-07 | unit | `cd dsa-quest/server && npx vitest run prisma` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | LESS-07,08 | unit | `cd dsa-quest/server && npx vitest run progress` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | LESS-01 | e2e-manual | See manual table | N/A | ⬜ pending |
| 02-03-01 | 03 | 2 | LESS-02 | unit | `cd dsa-quest/client && npx vitest run quiz` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 3 | LESS-03,04 | integration | `cd dsa-quest/client && npx vitest run pyodide` | ❌ W0 | ⬜ pending |
| 02-05-01 | 05 | 3 | LESS-05,06 | unit | `cd dsa-quest/client && npx vitest run testRunner` | ❌ W0 | ⬜ pending |
| 02-06-01 | 06 | 4 | LESS-07,09 | unit | `cd dsa-quest/server && npx vitest run unlock` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `dsa-quest/client/vitest.config.ts` — Vitest config for client (jsdom environment)
- [ ] `dsa-quest/server/vitest.config.ts` — Vitest config for server (node environment)
- [ ] `dsa-quest/client/src/__tests__/quiz.test.ts` — Quiz scoring unit test stubs (LESS-02)
- [ ] `dsa-quest/client/src/__tests__/testRunner.test.ts` — Test runner result parsing stubs (LESS-05, LESS-06)
- [ ] `dsa-quest/client/src/__tests__/pyodideWorker.test.ts` — Pyodide worker message protocol stubs (LESS-03, LESS-04)
- [ ] `dsa-quest/server/src/__tests__/progress.test.ts` — UserProgress API stubs (LESS-07, LESS-08)
- [ ] `dsa-quest/server/src/__tests__/unlock.test.ts` — Linear unlock logic stubs (LESS-07, LESS-09)
- [ ] `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom` in client
- [ ] `npm install -D vitest` in server

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Theory markdown renders correctly | LESS-01 | Visual rendering, no DOM assertion | Open `/topics/1/theory`, confirm markdown renders with headings, code blocks, adventure theme |
| Monaco Editor loads with Python highlighting | LESS-03 | Browser API, cannot mock in Vitest | Open practice screen, confirm Monaco renders Python code with syntax colors |
| Pyodide runs in Web Worker (not main thread) | LESS-04 | Worker threading — not testable in jsdom | Open DevTools → Sources → Workers, confirm `pyodide.worker` is running |
| Map node state updates after challenge | LESS-09 | Visual map update | Complete topic 1 challenge, confirm topic 2 node changes from locked to available without page reload |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
