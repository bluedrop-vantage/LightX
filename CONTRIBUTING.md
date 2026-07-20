# Contributing to LightX

Thanks for your interest — LightX is an educational physics sandbox and every contribution helps sharpen it. Read this once before your first PR.

## Ground rules

**Content integrity is non-negotiable** (see spec §8).

- No component may render a green "works in reality" verdict without a branded `Verdict` produced by [`src/physics/verdict.ts`](src/physics/verdict.ts). The custom ESLint rule `exotic-pantry/verdict-invariant` enforces this at CI time.
- Every "cheat" (broken quantum inequality, chronology-protection override, hyperspace jump, etc.) MUST route through `sealLog.record()` via the store's `toggleSeal()` chokepoint. Do not write to the seal log from anywhere else.
- Ingredient behavior is data-driven from [`src/pantry/ingredients.ts`](src/pantry/ingredients.ts) — no branching on ingredient IDs in physics code. Antimatter's `gravity: 'attractive'` (ALPHA-g 2023) and dark energy's `shapeable: false` are structural, not decorative.
- New physics claims need a paper citation. Add it to [`src/physics/theorems.ts`](src/physics/theorems.ts) so the Theorem Explainer can link to it from any seal that cites it.

## Getting started

```
git clone https://github.com/<you>/LightX.git
cd LightX
npm install
npx playwright install chromium   # only if you'll run e2e tests
npm run dev                        # http://localhost:5173
```

Requires Node 20+ and npm 10+.

## Development loop

```
npm run dev          # Vite dev server with HMR
npm run typecheck    # tsc --noEmit
npm test             # Vitest — pure physics unit tests
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright — headless Chromium smoke tests
npm run lint         # ESLint 9 flat config
npm run build        # Production bundle in dist/
```

**Before opening a PR** run `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build`. CI runs all of these; failing checks block merge.

## Adding a new equation to the tutor

1. Add an entry to `EQUATIONS` in [`src/ui/equations.ts`](src/ui/equations.ts).
2. If it has runtime-varying inputs, add a `computeTutor(params, verdict)` function that returns `TutorContext`.
3. To animate baseline → current in the tutor's plot, produce both `baselineSeries` and `series` in the returned `PlotDescriptor`.
4. Reference the equation's key in the constructor's `EQUATIONS` list (e.g., `WARP_EQUATIONS` in `WarpConstructor.tsx`).

## Adding a new construct

1. Create a folder under `src/constructs/<name>/` with `<Name>Constructor.tsx` and any recipe metric functions.
2. Add the closed-form metric to `src/physics/metrics/<name>.ts` with a matching `.spec.ts` (Vitest expects analytic answers).
3. Extend `ConstructKind` in [`src/types/domain.ts`](src/types/domain.ts).
4. Add a case in `initialConstructFor()` in [`src/state/store.ts`](src/state/store.ts).
5. Add an evaluator branch in [`src/physics/verdict.ts`](src/physics/verdict.ts).
6. Add recipes to [`src/constructs/recipes.ts`](src/constructs/recipes.ts).
7. Wire a tab in [`src/ui/ConstructTabs.tsx`](src/ui/ConstructTabs.tsx) and a case in `src/App.tsx`.
8. Add Playwright smoke coverage in `e2e/`.

## Style

- TypeScript strict mode is on. No `any` unless justified.
- Prefer editing existing files to adding new ones.
- Only add comments when the WHY is non-obvious — no restating what the code does.
- Match the surrounding formatting (Prettier-compatible defaults). Run your editor's format-on-save.

## Commits + PRs

- Small, focused commits. Descriptive subjects.
- PR title: short imperative (`Add Krasnikov tube constructor`, `Fix twin-bubble CTC alarm sign`).
- Fill out the PR template — especially the physics-grounding section if you touched a verdict path.
- If you're adding a new dep, say why in the PR body.

## Reporting bugs

Open a `Bug report` issue with reproduction steps. Include browser + OS, and any red console messages.

## Reporting physics inaccuracies

We take these seriously — cite the paper you're reading against and open an issue with the label `physics-accuracy`. Structural fixes to metric evaluators or verdict logic need corresponding Vitest additions to lock the fix in.

## Code of Conduct

See [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
