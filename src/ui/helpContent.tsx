import type { ReactNode } from 'react';

export interface HelpEntry {
  title: string;
  body: ReactNode;
  spec?: string;
}

export const HELP_ENTRIES: Record<string, HelpEntry> = {
  'panel-warp': {
    title: 'Warp Bubble (Alcubierre)',
    body: (
      <>
        <p>
          An Alcubierre warp bubble contracts space in front of a ship and expands it behind, letting the bubble surf faster than light while the crew stays locally inertial (no time dilation, no g-forces).
        </p>
        <p>
          Drop a negative-energy ingredient into the wall to open the bubble. The mesh will bunch up ahead (blue) and stretch apart behind (red). At v<sub>s</sub> &gt; 1c you'll see the "steering severed" indicator because the pilot cannot signal the front wall — that's honest physics, not a bug.
        </p>
      </>
    ),
    spec: 'Alcubierre 1994 · spec §3',
  },
  'panel-wormhole': {
    title: 'Wormhole (Morris–Thorne)',
    body: (
      <>
        <p>
          Two asymptotic regions joined by a throat of radius b₀. To keep it open, the flare-out condition must hold at the throat — which forces the null energy condition to be violated.
        </p>
        <p>
          Drop negative energy into the throat, or enable <em>Maldacena mode</em> and drop a dark-sector fermion for a sub-light traversable variant. Positive matter alone pinches the throat off (Einstein–Rosen collapse).
        </p>
      </>
    ),
    spec: 'Morris–Thorne 1988 · spec §4',
  },
  'panel-krasnikov': {
    title: 'Krasnikov Tube',
    body: (
      <>
        <p>
          A permanent superluminal corridor. As a ship travels a route, it lays negative-energy pipe behind itself — enabling a fast return trip along the same tube.
        </p>
        <p>
          Unlike a warp bubble, the tube persists after the outbound ship passes. Drop negative-energy ingredients into the <em>Route</em> slot to lay it.
        </p>
      </>
    ),
    spec: 'Krasnikov 1998',
  },
  'panel-hyperspace': {
    title: 'Hyperspace / Brane Portal',
    body: (
      <>
        <p>
          Braneworld models with large extra dimensions <em>could</em> permit shortcut routing through the bulk. This module treats hyperspace as a labeled fiction: every mission that uses it is marked <em>"beyond confirmed physics"</em>.
        </p>
        <p>
          Drop the Hyperspace Permit, then <em>Charge portal</em> (energy cost ∝ aperture²) and <em>Launch through</em>. Each launch logs a <code>realAvailability</code> seal.
        </p>
      </>
    ),
    spec: 'braneworld models · spec §2.2',
  },
  'panel-freebuild': {
    title: 'Free Build · Energy source rack + Field painter',
    body: (
      <>
        <p>
          Two ways to compose a custom rig. Drop pantry ingredients into the <em>Energy source rack</em> for discrete contributions, and/or paint continuous energy density onto the canvas with the brushes. The verdict combines both.
        </p>
        <p>
          Fire rays (<em>Trace</em>) or launch the ship into the field to test how light and a timelike observer behave in your painted potential. Positive-mass paint focuses rays, negative-energy paint defocuses them.
        </p>
      </>
    ),
    spec: 'spec §6',
  },

  'slider-vs': {
    title: 'Bubble velocity (v_s)',
    body: (
      <>
        <p>
          The coordinate velocity of the bubble in Earth's frame, in units of c. Below 1c the trip is ordinary. Above 1c the bubble surfs faster than light — but nothing locally moves faster than light inside the bubble (that's the whole trick).
        </p>
        <p>
          At v<sub>s</sub> &gt; 1c the pilot's back wall is in causal contact with the crew, but the front wall isn't — hence the "steering severed" indicator.
        </p>
      </>
    ),
  },
  'slider-wall-thickness': {
    title: 'Wall thickness',
    body: (
      <>
        <p>
          The characteristic width σ⁻¹ of the wall transition between "inside the bubble" and "flat outside". Thinner walls need less <em>total</em> negative energy but higher <em>density</em>, which pushes past the Ford–Roman quantum bound faster.
        </p>
      </>
    ),
  },
  'slider-throat-radius': {
    title: 'Throat radius b₀',
    body: (
      <p>
        Radius of the wormhole throat. Larger throats keep tidal forces at the throat below human-lethal levels but require correspondingly more exotic matter.
      </p>
    ),
  },
  'slider-mouth-separation': {
    title: 'Mouth separation Δx',
    body: (
      <p>
        Spatial distance between mouth A and mouth B in the outside universe. Combined with the mouth clock offset, controls whether the wormhole permits a closed timelike curve.
      </p>
    ),
  },
  'slider-mouth-offset': {
    title: 'Mouth clock offset Δt',
    body: (
      <p>
        Proper-time desynchronization between the two mouths. When |Δt| &gt; Δx/c, a closed timelike curve forms — vacuum fluctuations amplify at the chronology horizon and (in the physical case) destroy the wormhole. Toggle <em>Suspend chronology protection</em> to override.
      </p>
    ),
    spec: 'Hawking 1992',
  },

  'toggle-twin-bubble': {
    title: 'Twin bubble on a crossing path',
    body: (
      <p>
        Adds a second warp bubble on a diagonal trajectory. When both are superluminal and they overlap, the CTC-from-crossing-warps detector fires — spec §6.3's "aha moment": FTL and time travel are the same request.
      </p>
    ),
    spec: 'spec §6.3',
  },
  'toggle-maldacena': {
    title: 'Maldacena mode',
    body: (
      <>
        <p>
          Swap the exotic-matter requirement for a coupling to a hypothetical dark-sector U(1) gauge field with charged fermions. Casimir-like energy of that field holds the throat open.
        </p>
        <p>
          The tradeoff: traversal is enforced <em>sub-light</em> (never faster than the outside light-travel time between mouths), so there's no chronology alarm — but the fermion field is beyond confirmed physics.
        </p>
      </>
    ),
    spec: 'Maldacena–Milekhin 2020',
  },
  'toggle-light-cones': {
    title: 'Light-cone ribbons',
    body: (
      <p>
        Overlays a grid of local light cones on the mesh. Each cone tilts with the local metric. Inside the bubble the cones stay upright — the visual proof that <em>nothing locally outruns light</em> even when the bubble is superluminal.
      </p>
    ),
    spec: 'spec §5.2',
  },
  'toggle-ship-cone': {
    title: "Ship's local light cone",
    body: (
      <p>
        Every 250 ms, fires a fan of null geodesics from the ship's current position and animates them expanding outward as a light front. Inside a moving bubble, the front is carried along with it — showing how the bubble drags the local light structure without breaking causality.
      </p>
    ),
  },
  'toggle-ship-geodesic': {
    title: 'Ship-as-geodesic (RK4)',
    body: (
      <p>
        Replaces the scripted ship animation with a proper RK4 integration of a comoving timelike observer in the Alcubierre metric. The ship's position becomes a physically-integrated result rather than a preset.
      </p>
    ),
  },

  'metric-ford-roman': {
    title: 'Ford–Roman ratio',
    body: (
      <>
        <p>
          The ratio of demanded negative-energy density to the Ford–Roman quantum-inequality bound. QFT allows brief negative-energy excursions bounded by |⟨T₀₀⟩| · τ⁴ ≲ ℏ/c³.
        </p>
        <p>
          Ratio ≤ 1: within the quantum bound, physically allowed. Ratio &gt; 1: bulk violation — requires the "Suspend Quantum Inequalities" seal to be broken.
        </p>
      </>
    ),
    spec: 'Ford–Roman 1995',
  },
  'metric-nec': {
    title: 'Null energy condition (NEC)',
    body: (
      <>
        <p>
          T<sub>μν</sub> k<sup>μ</sup> k<sup>ν</sup> ≥ 0 for every null vector k — roughly, "energy density is non-negative for any observer." NEC is the weakest classical energy condition and it's the one Alcubierre and Morris–Thorne geometries have to break.
        </p>
        <p>
          PASS = geometry consistent with classical GR. VIOLATED = only possible with negative-energy sources.
        </p>
      </>
    ),
  },
  'metric-verdict': {
    title: 'Verdict card',
    body: (
      <>
        <p>
          The single trustworthy signal in the app. Green = <em>works in reality</em> (nothing exotic invoked). Yellow = <em>works only with seals broken</em> (fictional allowances made, all logged). Red = <em>doesn't work even in fiction</em> (geometrically incoherent).
        </p>
        <p>
          Only <code>physics/verdict.ts</code> can emit a green banner — no other component can spoof one. Click any citation to open the theorem explainer.
        </p>
      </>
    ),
    spec: 'spec §6.2 · §8.1',
  },
  'metric-trip-clocks': {
    title: 'Trip clocks',
    body: (
      <>
        <p>
          <strong>Ship τ</strong>: proper time on the crew's clock. <strong>Earth t</strong>: coordinate time in the outside observer's frame. <strong>Δx</strong>: coordinate distance covered.
        </p>
        <p>
          Alcubierre's interior is locally inertial, so τ = t (no dilation penalty). The FTL character shows up as Δx/τ = v<sub>s</sub> &gt; 1c — the bubble covered more distance than a light signal could, without the crew moving faster than light locally.
        </p>
      </>
    ),
  },

  'seal-quantum-inequality': {
    title: 'Suspend Quantum Inequalities',
    body: (
      <p>
        Break the Ford–Roman bound on sustained negative energy density. Every macroscopic warp / wormhole construct needs this seal broken. All breaks are logged in the seal log with citations.
      </p>
    ),
    spec: 'Ford–Roman 1995',
  },
  'seal-chronology': {
    title: 'Suspend Chronology Protection',
    body: (
      <p>
        Hawking's conjecture that vacuum fluctuations amplify at any nascent chronology horizon, preventing closed timelike curves from forming. Breaking this seal lets you build wormholes and warp configurations that would produce CTCs — time-travel geometries.
      </p>
    ),
    spec: 'Hawking 1992',
  },
  'seal-real-availability': {
    title: 'Beyond confirmed physics',
    body: (
      <p>
        The catch-all seal for constructs that assume physics we've never verified — hyperspace/braneworld routing, Maldacena's dark-sector fermion field, etc. Doesn't invalidate the sandbox; just labels the pretense honestly.
      </p>
    ),
  },

  'ui-mode': {
    title: 'Depth mode',
    body: (
      <>
        <p>
          <strong>Story</strong>: plain-language captions, no equations. <strong>Student</strong>: KaTeX equations with hover-linked terms (hover a term to highlight its target on the canvas). <strong>Physicist</strong>: adds live numeric readouts (θ, ρ, Ford–Roman ratio) and full paper citations.
        </p>
      </>
    ),
  },
  'mission': {
    title: 'Mission',
    body: (
      <>
        <p>
          Missions frame a build with a goal (reach a destination, break the fewest seals, or break zero seals). Challenge and classroom missions come with an <em>exotic-credit budget</em> — each seal you break costs one credit. The budget is enforced structurally at the <code>canBreak()</code> chokepoint.
        </p>
      </>
    ),
  },

  'button-200-ray': {
    title: '200-ray traversal test',
    body: (
      <p>
        Fires 200 null geodesics radially outward from the throat center. If they visibly <em>defocus</em>, the flare-out condition holds and the throat is traversable — the direct visual proof that negative energy pries light rays apart. If they focused instead, the throat would be an Einstein–Rosen bridge (untraversable).
      </p>
    ),
    spec: 'spec §4.1 · §7',
  },
  'button-launch-through': {
    title: 'Launch ship through',
    body: (
      <p>
        Animates a ship traversing the wormhole: descends into mouth A on the upper sheet, crosses the throat, ascends out of mouth B on the lower sheet. In the two-pane view the ship visibly disappears from Universe A and re-emerges in Universe B.
      </p>
    ),
  },
  'button-charge-portal': {
    title: 'Charge portal',
    body: (
      <p>
        Builds up the brane-punching energy required to open the hyperspace portal. Charge time scales with aperture² (more surface = more energy). Once fully charged, the <em>Launch through</em> button enables.
      </p>
    ),
  },
  'recipe-shortcuts': {
    title: 'Try a recipe',
    body: (
      <>
        <p>
          Each recipe auto-fills a common combination of pantry ingredients so you can see what happens without hunting through the pantry. The colored icon previews the outcome: <em>●</em> works in reality, <em>◐</em> works only with seals broken, <em>✕</em> doesn't work.
        </p>
        <p>
          Clicking a recipe clears the current placements first, then applies the recipe. You can still fine-tune afterward — drag more ingredients in, adjust sliders, toggle Maldacena mode, etc.
        </p>
      </>
    ),
  },
  'button-launch-field-ship': {
    title: 'Launch ship into field',
    body: (
      <p>
        Releases a ship at (−8, 8) with velocity (1.6, −1.6) and integrates its motion through the painted energy field using the field's analytic gradient as acceleration. Positive-mass paint attracts (ship falls in); negative-energy paint repels (ship deflects around).
      </p>
    ),
  },
};
