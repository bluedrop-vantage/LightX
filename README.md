# LightX

An interactive physics sandbox for faster-than-light constructs — warp bubbles, wormholes, Krasnikov tubes, hyperspace portals, and freely painted energy fields. The pedagogy is **honest physics wearing a fictional costume**: every construct is scored against the real equations of general relativity, and every fictional allowance ("suspend the null energy condition," "suspend chronology protection," "beyond confirmed physics") is explicit, logged, and cited.

**🚀 Live demo → https://bluedrop-vantage.github.io/LightX/**

[![CI](https://github.com/bluedrop-vantage/LightX/actions/workflows/ci.yml/badge.svg)](https://github.com/bluedrop-vantage/LightX/actions/workflows/ci.yml)
[![E2E](https://github.com/bluedrop-vantage/LightX/actions/workflows/e2e.yml/badge.svg)](https://github.com/bluedrop-vantage/LightX/actions/workflows/e2e.yml)
[![Deploy](https://github.com/bluedrop-vantage/LightX/actions/workflows/deploy.yml/badge.svg)](https://github.com/bluedrop-vantage/LightX/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node ≥ 20](https://img.shields.io/badge/node-%E2%89%A520-brightgreen)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](tsconfig.json)

- **Tagline:** _The geometry was never the problem. Stock the pantry and see._
- **Target audience:** High-school + undergraduate physics students, science enthusiasts, educators.
- **Depth modes:** Story (plain-language), Student (KaTeX + hover-linked terms), Physicist (equations + numerics readouts).

## Try it locally

Requires Node 20+ and npm 10+.

```bash
git clone https://github.com/bluedrop-vantage/LightX.git
cd LightX
npm install
npm run dev            # http://localhost:5173
```

Optional for e2e tests:

```bash
npx playwright install chromium
npm run test:e2e
```

## What's inside

| Tab | Feature (spec §) |
|---|---|
| **Warp Bubble** | Alcubierre metric with v_s / wall-thickness sliders, Ford–Roman meter, light-cone ribbons, ship's local light cone, ship-as-geodesic (RK4), TripClocks, twin-bubble mode that fires the CTC-from-crossing-warps alarm (§6.3). |
| **Wormhole** | Morris–Thorne throat with a click-to-emit ray tracer, a 200-ray traversal test, chronology alarm at \|Δt\|>Δx/c, Maldacena mode toggle for sub-light dark-sector traversal, 2D / 3D-embedding / two-pane multiverse view switcher, and full ship traversal animation. |
| **Krasnikov Tube** | Route-laying superluminal corridor. |
| **Hyperspace** | Braneworld portal with charge-and-launch flow. |
| **Free Build** | Paint positive/negative energy density with a brush, drop pantry ingredients into an energy source rack, fire rays that bend through the painted field, launch a ship whose trajectory is integrated through the field's analytic gradient, save builds to `localStorage`, copy a Lab Report to clipboard. |
| **Community** | Publish a saved build to the shared gallery scope; paste a JSON mission pack for classroom challenges. |

Each tab includes a **"Try a recipe"** row of pre-built one-click configurations, per-panel and per-widget **help popovers** (`?` chips), and an **interactive equation tutor** that plugs your current build's numbers into the equation and animates the plot from a baseline to your values.

## Physics-honest safeguards (spec §8, non-negotiable)

1. **`Verdict` is nominally branded.** Only [`physics/verdict.ts`](src/physics/verdict.ts)`::buildVerdict` can produce one; [`VerdictCard`](src/constructs/VerdictCard.tsx) requires it as a prop, so no other component can render "success" copy.
2. **ESLint invariant guard.** [`eslint/verdictInvariant.js`](eslint/verdictInvariant.js) flags `works|succeeds?|success` in any `.tsx`/`.ts` outside the allowlist.
3. **Seal-break chokepoint.** `sealLog.record()` is the only mutator; every seal toggle routes through `missionState.canBreak()` first, so classroom missions can enforce an `exoticCreditBudget`.
4. **Data-driven ingredient behavior.** Antimatter's `gravity: 'attractive'` (ALPHA-g 2023) and dark energy's `shapeable: false` come from [`pantry/ingredients.ts`](src/pantry/ingredients.ts) and drive the slot drop-handlers and metric evaluators. There is no code branch for "antimatter falls up."
5. **Persistent footer.** *"Sandbox physics. Seals broken here remain unbroken in the universe — so far."*

## Architecture at a glance

```
src/
  types/domain.ts             # Ingredient, Construct, Verdict (branded), SealBreak, Mission
  pantry/                     # Static ingredient defs + drag-and-drop cards
  physics/
    metrics/                  # Closed-form Alcubierre / Morris–Thorne / Krasnikov
    conditions/               # NEC checker + Ford–Roman meter + chronology detector
    verdict.ts                # Sole producer of branded Verdict — content-integrity chokepoint
    theorems.ts               # Citation → one-screen explainer copy
  workers/                    # RK4 geodesic integrator (comlink)
  render/                     # Three.js scene: SpacetimeMesh, GeodesicLayer, LightConeLayer, EmbeddingDiagram
  constructs/{warp,wormhole,krasnikov,hyperspace,freebuild}/
  ui/                         # EquationsPanel + tutor (KaTeX), FordRomanMeter, TripClocks, HelpButton, ...
  missions/                   # Static missions + classroom JSON pack loader
  state/store.ts              # Zustand slices — sealLog is the only seal writer
  storage/                    # localStorage adapter behind a KeyValueStorage interface
```

More detail (invariants, testing patterns, bundle notes): [`CLAUDE.md`](CLAUDE.md).

## Scripts

```
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # Production bundle in dist/
npm run preview      # Preview the built bundle
npm test             # Vitest — pure physics unit tests
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright — headless-Chromium smoke tests
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint 9 flat config incl. the custom verdict-invariant rule
```

## Cited physics

Every seal-break carries a citation that links to a one-screen explainer:

- **Alcubierre 1994** — warp metric
- **Morris–Thorne 1988** — traversable wormhole
- **Ford–Roman 1995** — quantum inequalities on negative energy
- **Hawking 1992** — chronology-protection conjecture
- **Olum 1998** — superluminal-requires-negative-energy theorem
- **Maldacena–Milekhin 2020** — sub-light traversable wormhole from dark-sector fermions
- **ALPHA-g 2023** — antihydrogen freefall (attractive antimatter gravity)

## Contributing

PRs welcome — read [`CONTRIBUTING.md`](CONTRIBUTING.md) first. The physics-integrity checklist there is the important part.

Bug reports and physics-accuracy issues: use the templates in [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/).

## Product spec

The complete 1.0 draft that guides all design decisions lives in [`exotic-pantry-spec.md`](exotic-pantry-spec.md).

## License

MIT © Ajay Rambhia — see [`LICENSE`](LICENSE).
