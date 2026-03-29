# Coding Conventions

**Analysis Date:** 2026-03-29

## Naming Patterns

**Files:**
- React components: PascalCase `.tsx` — e.g., `TopicNode.tsx`, `LoginForm.tsx`, `ParchmentPanel.tsx`
- Hooks: camelCase prefixed with `use`, `.ts` — e.g., `useAuth.ts`, `useMapTransform.ts`, `useTopics.ts`
- Stores: camelCase suffixed with `Store`, `.ts` — e.g., `authStore.ts`, `topicsStore.ts`, `uiStore.ts`
- Server controllers: camelCase suffixed with `Controller`, `.ts` — e.g., `authController.ts`, `topicsController.ts`
- Server middleware: camelCase, `.ts` — e.g., `authenticate.ts`, `errorHandler.ts`, `validate.ts`
- Server routes: camelCase noun, `.ts` — e.g., `auth.ts`, `topics.ts`, `users.ts`
- Schema files: camelCase suffixed with `Schemas`, `.ts` — e.g., `authSchemas.ts`
- Utility/lib files: camelCase, `.ts` — e.g., `api.ts`, `constants.ts`, `jwt.ts`, `prismaClient.ts`

**Functions:**
- React components: PascalCase named exports — `export function AdventureMap(...)`, `export function useAuth()`
- Helper/utility functions: camelCase — `safeUser()`, `getLevelFromXP()`, `clampTranslation()`
- Event handlers: camelCase prefixed with `handle` or `on` — `handleLogout()`, `handleNodeSelect()`, `onSubmit()`, `onWheel`, `onMouseDown`
- Server controllers: camelCase named exports — `export async function register(...)`, `export async function listTopics(...)`

**Variables and Constants:**
- Module-level constants: SCREAMING_SNAKE_CASE — `WORLD_WIDTH`, `WORLD_HEIGHT`, `TOPIC_NODES`, `LEVEL_THRESHOLDS`, `MAX_SCALE`
- Local variables: camelCase — `nodeStates`, `transformRef`, `isDragging`
- React state variables: camelCase — `hovered`, `isLoading`, `error`
- Config/lookup objects: SCREAMING_SNAKE_CASE — `STATE_CONFIG`

**Types and Interfaces:**
- Interfaces: PascalCase, descriptive — `AdventureMapProps`, `TopicNodeConfig`, `AuthState`, `MapTransform`
- Types (inferred from Zod): PascalCase suffixed with `Input` — `RegisterInput`, `LoginInput`, `FormData`
- Zod schemas: PascalCase suffixed with `Schema` — `RegisterSchema`, `LoginSchema`
- Zustand stores export the hook directly: `useAuthStore`, `useTopicsStore`, `useUIStore`

## Code Style

**Formatting:**
- No Prettier config found — project relies on ESLint for code quality checks.
- 2-space indentation (observed throughout all files).
- Single quotes for strings in TypeScript/TSX.
- Trailing commas in multi-line objects and arrays.
- Opening braces on the same line as statements.

**Linting:**
- Config: `dsa-quest/client/eslint.config.js` (flat config format, ESLint 9+)
- Rules: `@eslint/js` recommended + `typescript-eslint` recommended
- Plugins: `eslint-plugin-react-hooks` (hooks rules), `eslint-plugin-react-refresh` (HMR boundaries)
- Applies to: `**/*.{ts,tsx}` only (client workspace)
- Compiler as linter: `tsconfig.app.json` enforces `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`, `noUncheckedSideEffectImports`
- Server has no ESLint config — TypeScript strict mode serves as primary guard.

## TypeScript Usage Patterns

**Strict Mode:**
- Both client and server run with `"strict": true`.
- Client additionally enforces `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`.

**Type Imports:**
- `type` keyword used for import-only types: `import type { NodeState } from '@dsa-quest/shared'`
- Mixed imports split when value and type are both needed: `import { type ReactNode } from 'react'`

**`verbatimModuleSyntax`:**
- Enabled on the client — type-only imports must use `import type` syntax. This is enforced at compile time.

**Generic Typing:**
- Zustand stores are typed with an explicit state interface: `create<AuthState>()(...)`, `create<UIState>()((set) => ...)`
- Axios calls typed with response shape: `api.post<{ token: string; user: AuthUser }>(...)`
- Express routes typed with request body generics: `Request<object, object, RegisterInput>`

**Unknown Error Handling:**
- Catch blocks use `err: unknown` then narrow with type assertions:
  ```typescript
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      'Login failed'
  ```
- Server catch blocks pass directly to `next(err)` — no casting needed.

**Type Inference:**
- Prefer inferred types for local variables; explicit types on function signatures and interface definitions.
- Zod `z.infer<typeof Schema>` used to derive TypeScript types from runtime validation schemas:
  ```typescript
  export type RegisterInput = z.infer<typeof RegisterSchema>
  type FormData = z.infer<typeof schema>
  ```

**Shared Types:**
- Cross-package types live in `dsa-quest/shared/` and are imported as `@dsa-quest/shared`.
- Types referenced: `AuthUser`, `TopicDTO`, `NodeState`.

## Component Structure

**Function Components:**
- Always named exports, never default exports for components — `export function LoginForm()`.
- Exception: `App.tsx` uses `export default App` (React Router convention).
- Props interface declared immediately above the component function:
  ```typescript
  interface TopicNodeProps {
    node: TopicNodeConfig
    state: NodeState
    onSelect?: (order: number) => void
  }
  export function TopicNode({ node, state, onSelect }: TopicNodeProps) { ... }
  ```
- Optional callback props typed with `?` and called with optional chaining: `onSelect?.(node.order)`

**Sub-components:**
- Private sub-components defined in the same file and placed above the main export when they are tightly coupled — e.g., `TopicIcon` in `TopicNode.tsx`.
- No barrel `index.ts` files observed in component directories.

**Hooks:**
- Thin facade hooks wrap Zustand stores to provide a clean public interface:
  ```typescript
  // useAuth.ts
  export function useAuth() {
    const { token, user, ... } = useAuthStore()
    return { token, user, isAuthenticated: !!token, ... }
  }
  ```
- Side-effect hooks (data fetching) trigger inside `useEffect` within the hook, not in components:
  ```typescript
  // useTopics.ts
  useEffect(() => { fetchTopics() }, [fetchTopics])
  ```

## Import Organization

**Order (observed pattern):**
1. External library imports — `import { create } from 'zustand'`, `import axios from 'axios'`
2. Internal path-alias imports (`@/`) — `import { useAuth } from '@/hooks/useAuth'`
3. Shared package imports — `import type { AuthUser } from '@dsa-quest/shared'`
4. Relative imports — `import { NodeTooltip } from './NodeTooltip'`

**Path Aliases:**
- Client: `@/` maps to `dsa-quest/client/src/` — configured in both `vite.config.ts` and `tsconfig.app.json`
- Server: no path aliases — uses relative imports (`../lib/prismaClient`, `'./errorHandler'`)
- Shared package: `@dsa-quest/shared` — resolved via npm workspaces

## CSS and Tailwind Conventions

**Tailwind Usage:**
- Utility classes applied directly in JSX `className` strings.
- Complex or reusable styles extracted to `@layer components` in `dsa-quest/client/src/styles/globals.css`.
- Raw CSS `style={{}}` props used for values that cannot be expressed as Tailwind classes (e.g., exact `boxShadow`, `transform`, `background` gradients).

**Semantic Component Classes (defined in globals.css):**
- `.btn-carved` — brown wooden button with inset shadow
- `.btn-gold` — gold accent button
- `.scroll-panel` — parchment-toned container panel (equivalent to `<ParchmentPanel>` styling)
- `.input-parchment` — styled text input
- `.parchment-bg` — page background gradient

**Custom Theme Tokens (tailwind.config.js):**
- Colors: `parchment`, `brown`, `forest`, `ocean`, `gold`, `crimson` — each with `DEFAULT`, `light`, `dark` variants
- Fonts: `font-heading` (Pirata One), `font-body` (Georgia), `font-code` (JetBrains Mono)
- Shadows: `shadow-scroll`, `shadow-node-glow`, `shadow-carved`, `shadow-parchment`
- Animations: `animate-pulse-gold`, `animate-float`, `animate-unfurl`, `animate-shimmer`

**Mixing inline styles with Tailwind:**
- When applying Tailwind classes alongside a `style` prop, `className` handles layout/typography/color tokens and `style` handles dynamic values or non-tokenizable properties:
  ```tsx
  <div
    className="absolute inset-0 rounded-full bg-gold/20 border-2 border-gold"
    style={{ boxShadow: '0 0 20px rgba(212,163,46,0.7)' }}
  />
  ```

## Server-Side Patterns

**Controller Pattern:**
- Controllers are plain `async` functions — `(req, res, next)` — no class-based approach.
- Always wrap in `try/catch` and call `next(err)` on failure.
- Throw `AppError(statusCode, message)` for expected errors; let unexpected errors bubble to `errorHandler`.

**Validation Pattern:**
- Zod schemas defined in `dsa-quest/server/src/schemas/` and re-exported as TypeScript types.
- `validate(Schema)` middleware parses and replaces `req.body` before reaching the controller.
- Validation errors are handled centrally in `errorHandler` as `ZodError`.

**Error Handling:**
- Centralized in `dsa-quest/server/src/middleware/errorHandler.ts`.
- Three handled error types: `AppError` (expected), `ZodError` (validation), Prisma `P2002` (unique constraint).
- All other errors: `console.error(err)` then 500 response.
- Unused parameters prefixed with `_` to satisfy TypeScript: `_req`, `_res`, `_next`.

## Comment Conventions

**Inline Comments:**
- Used sparingly to explain non-obvious logic — coordinate math, clamping behavior, zoom calculations.
- JSX comments appear as `{/* Section label */}` to group related markup blocks.
- Short explanatory comments at the top of logical sections: `// Center map on mount`, `// Lazy import to avoid circular dependency`.

**No JSDoc/TSDoc:**
- No JSDoc or TSDoc comment blocks observed anywhere in the codebase.
- Clarity is achieved through TypeScript types and descriptive naming rather than documentation comments.

**TODO-style comments:**
- Not used in committed code. Placeholder content uses UI text instead: `"Lesson content coming soon — Phase 2 in progress."`.

---

*Convention analysis: 2026-03-29*
