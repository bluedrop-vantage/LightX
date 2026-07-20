# CLAUDE.md

Notes for future Claude sessions on this repo.

## What this project is

An educational browser sandbox from [`exotic-pantry-spec.md`](exotic-pantry-spec.md). Users assemble faster-than-light constructs from a pantry of hypothetical + real energy sources; the app scores each construct against real GR and logs every fictional allowance explicitly. The user cares deeply about **content integrity** — never silently render "success" for impossible physics.

## Commands

```
npm run dev          # http://localhost:5173
npm run build
npm run preview
npm test             # Vitest — pure physics
npm run test:e2e     # Playwright — headless Chromium
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint 9 flat config
```

Always run `npm run typecheck`, `npm test`, `npm run lint`, `npm run test:e2e` before declaring work done.

## Locked-in stack

- Vite + React 18 + TypeScript
- Three.js **without** `@react-three/fiber` (the 60 fps mesh loop can't afford reconciler overhead)
- Zustand with `subscribeWithSelector` (imperative render loop reads state without triggering re-renders)
- comlink Web Worker for the RK4 geodesic integrator
- KaTeX for equations, with term-level hover-linking via a custom `\link{id}{term}` macro
- localStorage behind a `KeyValueStorage` interface in [`storage/storage.ts`](src/storage/storage.ts)

## Content-integrity chokepoints (do not go around these)

1. **`Verdict` is nominally branded** (`readonly __brand: 'Verdict'`). The only factory is [`buildVerdict`](src/physics/verdict.ts). [`VerdictCard`](src/constructs/VerdictCard.tsx) requires this branded type as prop, so nothing else can render a green banner.
2. **ESLint custom rule** [`eslint/verdictInvariant.js`](eslint/verdictInvariant.js) forbids `\b(work|works|succeeds?|success|worked)\b` in any `.tsx`/`.ts` outside the allowlist (VerdictCard, verdict.ts, theorems.ts, verdict.spec.ts). Word-boundary anchored so camelCase `worksInReality` type values don't trigger.
3. **`sealLog.record()` is the only seal-log mutator.** Every cheat toggle routes through `useStore.toggleSeal()` → `missionState.canBreak()` → optionally `recordSeal()`. Do not write to the log from anywhere else.
4. **Ingredient behavior is data-driven** from [`pantry/ingredients.ts`](src/pantry/ingredients.ts). Antimatter's `gravity: 'attractive'` (ALPHA-g 2023) and dark energy's `shapeable: false` drive slot drop-handlers and metric evaluators — never branch on ingredient IDs.
5. **Footer disclaimer** is rendered unconditionally in [`App.tsx`](src/App.tsx). Do not gate it.

## Where to find things

| Domain | File |
|---|---|
| Ingredient defs | [`src/pantry/ingredients.ts`](src/pantry/ingredients.ts) |
| Alcubierre / Morris–Thorne / Krasnikov closed-form metrics | [`src/physics/metrics/`](src/physics/metrics/) |
| NEC / Ford–Roman / chronology checkers | [`src/physics/conditions/`](src/physics/conditions/) |
| Verdict assembler | [`src/physics/verdict.ts`](src/physics/verdict.ts) |
| Theorem citations + explainer copy | [`src/physics/theorems.ts`](src/physics/theorems.ts) |
| RK4 worker + comlink client | [`src/workers/`](src/workers/) |
| Three.js scene controller + layers | [`src/render/`](src/render/) |
| Constructor tabs | [`src/constructs/`](src/constructs/) |
| Zustand store | [`src/state/store.ts`](src/state/store.ts) |
| Missions + classroom pack loader | [`src/missions/`](src/missions/) |
| Playwright specs | [`e2e/`](e2e/) |

## Testing patterns to match

- **Physics** tests live next to the module as `*.spec.ts` under `src/physics/`. Prefer analytic-answer assertions (`shapeFunction(0, R, σ) ≈ 1`, NEC violated for Alcubierre wall). See [`src/physics/verdict.spec.ts`](src/physics/verdict.spec.ts) for the branded-Verdict invariant test.
- **Playwright** specs live in `e2e/`. Drag-and-drop uses [`e2e/helpers.ts`](e2e/helpers.ts) `dragIngredient()` which dispatches synthetic `DragEvent`s with a `DataTransfer` payload — HTML5 dnd via `page.dragAndDrop()` doesn't fire the right handlers. Ingredient cards carry `data-ingredient="<id>"` for stable selection.

## Bundle notes

Vite `manualChunks` splits `three`, `katex`, `react`, `workers`, `state`. Biggest chunk is `three` at ~471 KB. Keep it that way — do not import Three.js dynamically from render-critical paths.

## Historical plan file

The originally-approved plan lives at `~/.claude/plans/parsed-snuggling-hopcroft.md`. It documents Phase 1–3 scope + the three follow-up items (bundle-split / Playwright / ESLint rule), all shipped.
