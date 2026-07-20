# Changelog

All notable changes to LightX are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Initial public release of LightX — the interactive physics sandbox for FTL constructs.
- **Warp Bubble** (Alcubierre) constructor with velocity, wall-thickness, twin-bubble mode, light-cone ribbons, ship-cone light-front animation, and ship-as-geodesic RK4 integration.
- **Wormhole** (Morris–Thorne) constructor with Maldacena mode, 2D / 3D / two-pane multiverse views, ship traversal animation, and 200-ray traversal test.
- **Krasnikov Tube** and **Hyperspace / Brane Portal** constructors.
- **Free Build** — energy source rack + field brush + ray tracer + gradient-driven ship launch.
- Interactive **Equation Tutor** with baseline→current animation, live "your current build" context, and viewport-aware help popovers.
- **Recipe shortcuts** below every constructor slot for one-click "try this" combinations.
- **Community** — shared gallery + classroom mission-pack JSON loader.
- ESLint custom rule `verdict-invariant` guarding the branded `Verdict` chokepoint.
- Vitest + Playwright test suites (49 unit + 13 e2e).
