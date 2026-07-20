# Product Specification — "The Exotic Pantry"
### An Interactive Physics Sandbox for Faster-Than-Light Constructs
**Version 1.0 · Draft for Review**

---

## 1. Concept & Vision

The Exotic Pantry is a browser-based educational sandbox that asks: *what if the missing ingredients of physics were available?* The app grants the user a stocked pantry of hypothetical and real energy sources — negative energy, dark matter, dark energy, hyperspace access, antimatter, ordinary matter — and lets them assemble spacetime machines (warp drives, wormholes, custom hybrids) on an interactive canvas.

The pedagogical trick: the app is **honest physics wearing a fictional costume**. Every construct enforces the real equations of general relativity. The pantry items behave according to their true physical properties (dark matter attracts; antimatter falls down; only negative energy defocuses light). Users discover *by experimentation* why only certain ingredients make certain machines work — the same conclusions physicists reached, but learned through play rather than lecture.

**Tagline:** "The geometry was never the problem. Stock the pantry and see."

**Target audience:** High-school and undergraduate physics students, science enthusiasts, educators. No math prerequisite for play mode; full equations available in "Physicist Mode."

---

## 2. Core Domain Model

### 2.1 The Pantry (Ingredient System)

Each pantry item is a typed resource with real physical properties. Items are draggable cards.

| Ingredient | Energy Density | Pressure | Gravitational Effect | Real Status Badge |
|---|---|---|---|---|
| Ordinary Matter | Positive | ~0 | Attractive | ✅ Confirmed |
| Antimatter | Positive | ~0 | Attractive (falls down) | ✅ Confirmed (ALPHA-g 2023) |
| Dark Matter | Positive | ~0 | Attractive | 🔭 Inferred |
| Dark Energy (Λ) | Positive | Strongly negative | Repulsive at cosmic scale, unmanipulable | 🔭 Observed |
| **Negative Energy** | **Negative** | Configurable | **Repulsive / defocusing** | ⚠️ Hypothetical at scale |
| Squeezed Vacuum | Negative (pulsed) | — | Tiny, time-limited (Ford–Roman meter) | ✅ Lab-confirmed (tiny) |
| Casimir Plates | Negative (static) | — | Tiny, bound to apparatus | ✅ Lab-confirmed (tiny) |
| Hyperspace Permit | N/A (topological) | N/A | Enables bulk shortcut routing | ❓ Speculative (braneworld) |

**Design rule:** every card shows a flip side with "What physics actually says" — quantities available in reality, and which theorem blocks scaling it up (quantum inequalities, energy conditions, equivalence principle).

### 2.2 Machines (Constructs)

Constructs are recipes that consume pantry ingredients and produce a spacetime geometry:

- **Warp Bubble (Alcubierre)** — requires negative energy shaped into a bubble wall
- **Wormhole (Morris–Thorne)** — requires negative energy concentrated at a throat
- **Krasnikov Tube** — requires negative energy laid along a route (unlockable)
- **Hyperspace Jump** — requires Hyperspace Permit + energy to open a brane portal (clearly badged "beyond known physics")
- **Custom Drive** — user-assembled combination (Section 6)

---

## 3. Feature A — Warp Drive Constructor

### 3.1 Build Flow
1. User drags a spaceship onto the canvas (flat spacetime grid shown as a deformable mesh).
2. User drags ingredients into the **Bubble Wall Slot**.
3. The app computes the resulting geometry live:
   - **Negative energy in wall** → space contracts ahead (grid lines compress, blue tint), expands behind (grid stretches, red tint). Bubble begins to surf.
   - **Positive-energy ingredients** (matter, dark matter, antimatter) → grid dips *toward* the mass (attractive well). Ship sinks into a gravity well instead of surfing. Tooltip: "Positive energy focuses — you built a planet, not a drive."
   - **Dark energy** → uniform gentle expansion everywhere; unshapeable. Tooltip: "Repulsive but unmanipulable — it is a property of space, not a substance."

### 3.2 Controls
- **Bubble velocity slider** (0.1c → 10c). Crossing 1.0c triggers:
  - Horizon overlay: front wall shades out of causal contact; a "steering disabled" indicator appears on the ship console (physically honest: the pilot cannot signal the front wall).
  - Blueshift hazard meter at destination.
- **Wall thickness slider** — thinner walls need less total negative energy but higher density; a live readout compares demand vs. the Ford–Roman quantum bound (which the sandbox lets you override with a clearly labeled **"Suspend Quantum Inequalities"** toggle — the fictional cheat, visually styled as breaking a seal).
- **Energy budget gauge** — shows requirement in solar masses; Van Den Broeck optimization toggle shrinks it.

### 3.3 Visualization
- 2D deformable spacetime mesh (default) + optional 3D embedding-diagram view.
- Interior of bubble rendered flat and calm: crew figure shown standing, coffee cup unspilled (no g-forces — a running visual gag that is also the physics).
- External observer clock vs. ship clock displayed side by side.

---

## 4. Feature B — Wormhole Constructor

### 4.1 Build Flow
1. User places two mouths anywhere on the canvas (or one mouth in "our universe" pane and one in a second pane).
2. Embedding diagram renders: two funnels joined by a throat.
3. User drags ingredients into the **Throat Slot**:
   - **Negative energy** → throat holds open; light-ray test particles pass through and *defocus* (animated ray bundle spreading — the key physical requirement).
   - **Any positive-energy ingredient** → throat pinches off in an animated collapse (Einstein–Rosen behavior); traversal test fails with the ray bundle focusing to a crunch. Tooltip: "Gravity focuses. Only negative energy pries light rays apart."
4. **Traversal test:** send a probe (then a crew capsule) through; timers show trip duration vs. the outside light-travel time between mouths.

### 4.2 Advanced Controls
- **Throat radius slider** — tidal-force meter warns when a human-safe radius requires more exotic matter.
- **Mouth relocation** — dragging one mouth at relativistic speed desynchronizes mouth clocks; when the time offset exceeds the spatial separation ÷ c, a **Chronology Alarm** fires: the visualization shows vacuum fluctuations circulating and amplifying at the chronology horizon (particles looping mouth-to-mouth, brightening each pass), and the wormhole detonates unless the user has enabled the labeled cheat **"Suspend Chronology Protection."**
- **Maldacena mode (unlockable):** replace exotic matter with "dark-sector fermion field" cards; wormhole becomes traversable but the trip is enforced slower-than-light — the UI makes the tradeoff explicit.

---

## 5. Feature C — Equations Panel & Principled Animation

### 5.1 Equation Layer (three depth settings)
- **Story mode:** plain-language captions ("Space shrinks ahead of the bubble…").
- **Student mode:** key relations rendered via KaTeX, with hover-highlighting that links each term to the on-canvas element it governs:
  - Einstein field equations: `G_{μν} = 8πG/c⁴ · T_{μν}` — hovering `T_{μν}` highlights pantry ingredients; hovering `G_{μν}` highlights the mesh curvature.
  - Alcubierre metric: `ds² = −dt² + (dx − v_s f(r_s) dt)² + dy² + dz²` — the shape function `f(r_s)` is plotted live and deforms as the wall-thickness slider moves.
  - Energy-density expression for the bubble wall (shows the negative sign, highlighted red).
  - Morris–Thorne metric and the flare-out condition at the throat.
  - Null energy condition: `T_{μν} k^μ k^ν ≥ 0` — displayed with a live PASS/VIOLATED status chip per construct.
  - Ford–Roman inequality (schematic form) driving the quantum-bound meter.
- **Physicist mode:** full expressions plus a numerics readout (energy densities, wall thickness, York time / expansion scalar θ plotted as the classic front-contraction/rear-expansion surface).

### 5.2 Animation Requirements
- Spacetime mesh deformation at 60 fps, computed from the analytic metric (no PDE solving needed — geometry is closed-form for both canonical constructs).
- Light-cone ribbons: optional overlay drawing local light cones tilting inside the warp bubble / through the throat — the visual proof that nothing locally outruns light.
- Test-particle and light-ray tracer: user clicks to emit geodesics; integration via RK4 on the analytic metric.
- Scenario scrubber: play / pause / scrub timeline; side-by-side "ship frame" and "Earth frame" clocks throughout.

---

## 6. Feature D — Experiment Canvas (Free Build Mode)

### 6.1 Interaction Model
An open canvas where users design **custom drives** by composing:
- **Energy source rack:** any pantry combination, with quantity dials (each shows real-world availability vs. dialed amount; exceeding reality auto-applies the relevant "seal-break" cheat and logs it).
- **Geometry templates:** bubble, tube, throat, brane-portal, or freeform field-painting (user paints positive/negative energy density onto the grid with a brush; the app computes and renders the resulting curvature).
- **Ship & mission:** pick origin/destination (Earth → Mars → Proxima → Andromeda), launch, and watch outcomes.

### 6.2 The Physics Engine's Honest Verdicts
Every custom build is evaluated against the real rulebook and returns a **Verdict Card**:
- ✅ *Works in reality* (e.g., ordinary rocket, gravitational slingshot, time-dilation "forward time travel" cruise — these are includable missions and always succeed).
- 🟡 *Works only with seals broken* — lists exactly which physical principles were suspended (energy conditions, quantum inequalities, chronology protection, equivalence principle) and cites the blocking theorem.
- ❌ *Doesn't work even in fiction* — geometrically incoherent builds (e.g., dark energy shaped into a wall) fail with an explanation of *why the ingredient cannot do that job*.

### 6.3 Emergent Discoveries (designed "aha" moments)
- Combining two superluminal warp bubbles on crossing paths triggers the closed-timelike-curve detector → chronology alarm → the app links to a mini-lesson: "Why FTL and time travel are the same request."
- Stacking Casimir plates to scale up negative energy fails: the meter shows plate mass-energy growing faster than the deficit — the real reason it can't work.
- The "forward time travel" mission (relativistic cruise) is the only FTL-adjacent mission that completes with zero seals broken — quietly making the conversation's deepest point.

### 6.4 Persistence & Sharing
- Builds saved via key-value storage (`builds:{id}`), including ingredient list, geometry, seal-break log, and verdict.
- Shareable "Lab Report" export: a generated summary card (construct diagram, equations used, seals broken, mission result).
- Optional shared gallery (`gallery:{id}`, shared scope) — users informed that gallery posts are visible to others.

---

## 7. Architecture & Technical Requirements

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React (single-file artifact viable for MVP; Vite app for full build) | Canvas rendering via HTML5 Canvas or Three.js for 3D embedding views |
| Math | Closed-form metrics + RK4 geodesic integrator in a Web Worker | No server-side compute needed |
| Equations | KaTeX | Hover-link term↔canvas mapping via shared IDs |
| State | In-memory (React state); persistence via storage API | No localStorage (per artifact constraints) |
| Assets | Procedural (SVG/canvas) — no external art dependencies | |

**Performance targets:** 60 fps mesh animation on mid-range laptop; < 3 s initial load; geodesic tracer ≤ 16 ms/frame for 200 rays.

**Accessibility:** all color-coded physics states (contraction/expansion, PASS/VIOLATED) doubled with icons/patterns; full keyboard operation of sliders; captions for all animations.

---

## 8. Content Integrity Requirements (Non-negotiable)

1. Every fictional allowance is explicit, logged, and visually distinct (broken-seal motif). The app never silently pretends impossible physics is possible.
2. Real ingredients always behave per confirmed physics (antimatter falls down; dark matter attracts; dark energy is unshapeable).
3. Each blocking principle links to a one-screen explainer with the actual result it derives from (Alcubierre 1994; Morris–Thorne 1988; Ford–Roman quantum inequalities; Olum / Gao–Wald superluminal theorems; Hawking chronology protection; ALPHA-g 2023).
4. A persistent footer disclaimer: "Sandbox physics. Seals broken here remain unbroken in the universe — so far."

---

## 9. MVP Scope vs. Roadmap

**MVP (Phase 1):** Pantry (6 core items), Warp Bubble constructor with velocity/thickness sliders and mesh animation, Wormhole constructor with throat slot and traversal test, Student-mode equations panel, Verdict Cards.

**Phase 2:** Free-build canvas with field painting, geodesic tracer, chronology alarm system, Ford–Roman meter, save/share.

**Phase 3:** Krasnikov tube, Maldacena mode, Hyperspace/brane pane, 3D embedding views, shared gallery, classroom mode (teacher-curated challenge missions: "Reach Proxima breaking the fewest seals").

---

## 10. Open Questions for Review

1. Should seal-breaking be gamified (limited "exotic credits" per mission) or unlimited with logging only?
2. Is the two-pane multiverse view (for wormhole mouths in different bubbles) in scope for Phase 3, or a separate module?
3. Age targeting: default to Story mode or Student mode on first launch?
