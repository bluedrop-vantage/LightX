import type { Verdict } from '../types/domain';
import type { PlotSeries, MarkerPoint } from './LinePlot';

/**
 * TutorContext is what an equation's `computeTutor` returns to the modal.
 * The modal renders the substituted KaTeX, the numeric result, and an
 * optional inline plot / interpretation.
 */
export interface TutorVariable {
  symbol: string;
  name: string;
  value: number | string;
  baseline?: number | string;
  unit?: string;
  hint?: string;
}

export interface PlotDescriptor {
  kind: 'line';
  series: PlotSeries[];
  baselineSeries?: PlotSeries[];
  markers?: MarkerPoint[];
  baselineMarkers?: MarkerPoint[];
  xLabel?: string;
  yLabel?: string;
}

export interface TutorResult {
  value: number | string;
  baseline?: number | string;
  unit?: string;
  label?: string;
}

export interface TutorContext {
  variables: TutorVariable[];
  substitutedKatex?: string;
  result?: TutorResult;
  interpretation?: string;
  plot?: PlotDescriptor;
}

// Default parameters used when producing the "baseline" curves shown before
// the tutor animates to the user's current values.
export const BASELINE_PARAMS = {
  v_s: 0.5,
  wallThickness: 1,
  throatRadius: 1,
} as const;

export interface EquationEntry {
  id: string;
  title: string;
  story: string;
  katex: string;
  reference?: string;
  explanation?: string;
  computeTutor?: (
    params: Record<string, number>,
    verdict: Verdict | null,
  ) => TutorContext | null;
}

export const EQUATIONS: Record<string, EquationEntry> = {
  einsteinField: {
    id: 'einsteinField',
    title: 'Einstein field equations',
    story: 'Matter tells spacetime how to curve; curvature tells matter how to move.',
    katex: '\\link{mesh}{G_{\\mu\\nu}} = \\dfrac{8 \\pi G}{c^4}\\, \\link{pantry}{T_{\\mu\\nu}}',
    reference: 'GR foundations',
    explanation:
      "Einstein's field equations relate the Einstein tensor G (curvature of spacetime) to the stress-energy tensor T (energy, momentum, pressure of matter). The constant 8πG/c⁴ ≈ 2.077 × 10⁻⁴³ m/J is why huge energies bend spacetime only slightly at everyday scales, and why bulk exotic energies would be needed for any macroscopic warp/wormhole.",
  },
  alcubierreMetric: {
    id: 'alcubierreMetric',
    title: 'Alcubierre metric',
    story: 'Space contracts ahead of the bubble and expands behind it. The bubble surfs.',
    katex:
      'ds^2 = -\\,dt^2 + \\bigl(dx - v_s\\,\\link{wallThickness}{f(r_s)}\\,dt\\bigr)^2 + dy^2 + dz^2',
    reference: 'Alcubierre 1994',
    explanation:
      'Coordinate-time slices of Minkowski space are warped by the shape function f(r_s). At the bubble center f = 1 and the coordinate velocity of a comoving observer is exactly v_s. Far from the bubble f → 0 and space is flat. The wall between them is where all the exotic stress-energy lives.',
    computeTutor: (params) => {
      const v_s = params.v_s ?? BASELINE_PARAMS.v_s;
      const sigma = 1 / Math.max(0.2, params.wallThickness ?? 1);
      const sigmaBaseline = 1 / BASELINE_PARAMS.wallThickness;
      return {
        variables: [
          { symbol: 'v_s', name: 'Bubble velocity', value: v_s, baseline: BASELINE_PARAMS.v_s, unit: 'c' },
          { symbol: 'R', name: 'Bubble radius', value: 3, unit: 'L (fixed)' },
          {
            symbol: 'σ',
            name: 'Wall steepness',
            value: sigma.toFixed(2),
            baseline: sigmaBaseline.toFixed(2),
            unit: '1/L',
          },
        ],
        interpretation:
          v_s > 1
            ? `v_s = ${v_s.toFixed(2)}c means the bubble surfs faster than a light signal outside — but nothing locally moves faster than light inside, so no relativity axiom is broken.`
            : `v_s = ${v_s.toFixed(2)}c is subluminal — no exotic FTL, but the interior is still inertial.`,
      };
    },
  },
  shapeFunction: {
    id: 'shapeFunction',
    title: 'Shape function f(r_s)',
    story: 'Where and how sharply space transitions between "inside the bubble" and "flat outside".',
    katex:
      '\\link{wallThickness}{f(r_s)} = \\dfrac{\\tanh(\\sigma(r_s + R)) - \\tanh(\\sigma(r_s - R))}{2\\,\\tanh(\\sigma R)}',
    explanation:
      'The shape function is 1 inside the bubble, 0 outside, and transitions across a wall of width ~1/σ centered at r_s = R. A steeper wall (larger σ) means less total negative-energy volume — but higher peak density — which is what makes the Ford–Roman ratio climb.',
    computeTutor: (params) => {
      const R = 3;
      const sigma = 1 / Math.max(0.2, params.wallThickness ?? 1);
      const sigmaBaseline = 1 / BASELINE_PARAMS.wallThickness;
      const N = 80;
      const buildSeries = (s: number) => {
        const points: Array<[number, number]> = [];
        for (let i = 0; i <= N; i++) {
          const r_s = (i / N) * R * 2.2;
          points.push([r_s, shapeFunctionLocal(r_s, R, s)]);
        }
        return points;
      };
      const points = buildSeries(sigma);
      const baselinePoints = buildSeries(sigmaBaseline);
      const sample_r_s = R;
      const f_at_wall = shapeFunctionLocal(sample_r_s, R, sigma);
      const f_baseline = shapeFunctionLocal(sample_r_s, R, sigmaBaseline);
      return {
        variables: [
          {
            symbol: 'σ',
            name: 'Wall steepness (1/thickness)',
            value: sigma.toFixed(2),
            baseline: sigmaBaseline.toFixed(2),
            unit: '1/L',
          },
          { symbol: 'R', name: 'Bubble radius', value: R, unit: 'L' },
          { symbol: 'r_s', name: 'Radial distance (sample at wall)', value: sample_r_s, unit: 'L' },
        ],
        substitutedKatex: `f(${sample_r_s}) = \\dfrac{\\tanh(${sigma.toFixed(2)} \\cdot ${(sample_r_s + R).toFixed(1)}) - \\tanh(${sigma.toFixed(2)} \\cdot ${(sample_r_s - R).toFixed(1)})}{2\\,\\tanh(${sigma.toFixed(2)} \\cdot ${R})}`,
        result: {
          value: f_at_wall.toFixed(3),
          baseline: f_baseline.toFixed(3),
          label: `f(${sample_r_s})`,
        },
        interpretation: `At the wall (r_s = R = ${R}) the shape function has fallen to about half. Change the wall-thickness slider to make σ larger — the transition sharpens and the ratio climbs.`,
        plot: {
          kind: 'line',
          series: [{ points, color: '#6cc4ff', label: 'f(r_s)' }],
          baselineSeries: [{ points: baselinePoints, color: '#6cc4ff' }],
          markers: [{ x: sample_r_s, y: f_at_wall, label: `wall @ r_s=${sample_r_s}`, color: '#ffe27a' }],
          baselineMarkers: [{ x: sample_r_s, y: f_baseline, color: '#ffe27a' }],
          xLabel: 'r_s',
          yLabel: 'f',
        },
      };
    },
  },
  nullEnergy: {
    id: 'nullEnergy',
    title: 'Null energy condition (NEC)',
    story:
      'Roughly: energy density is non-negative for any observer. Warp and wormhole geometries need it broken.',
    katex: '\\link{pantry}{T_{\\mu\\nu}}\\, k^{\\mu}\\, k^{\\nu} \\;\\geq\\; 0',
    reference: 'Classical GR',
    explanation:
      'The NEC is the weakest of the classical energy conditions — it says energy density projected along any null direction is non-negative. Both Alcubierre and Morris–Thorne geometries provably require T_μν k^μ k^ν < 0 somewhere. If your current verdict says NEC = VIOLATED, that means the physics module found regions of your construct that break this bound.',
    computeTutor: (_params, verdict) => {
      if (!verdict) return null;
      return {
        variables: [
          { symbol: 'status', name: 'Current NEC status', value: verdict.necStatus },
          {
            symbol: 'seals',
            name: 'Energy-condition seal broken?',
            value: verdict.sealsBroken.some((s) => s.seal === 'energyCondition') ? 'yes' : 'no',
          },
        ],
        interpretation:
          verdict.necStatus === 'VIOLATED'
            ? 'The construct violates the NEC — mathematically it requires negative energy density somewhere. Every classical energy condition is broken along with it.'
            : verdict.necStatus === 'PASS'
              ? 'No NEC violation detected — this construct is compatible with classical GR (though might still fail other physical checks).'
              : 'NEC not applicable to this construct (e.g. Maldacena-mode wormhole uses a Casimir-like effect that sidesteps the classical NEC).',
      };
    },
  },
  fordRoman: {
    id: 'fordRoman',
    title: 'Ford–Roman inequality (schematic)',
    story: 'Quantum theory allows brief negative-energy dips, but caps how much and for how long.',
    katex: '\\bigl|\\langle \\link{pantry}{T_{00}}\\rangle\\bigr|\\, \\tau^4 \\;\\lesssim\\; \\dfrac{\\hbar}{c^3}',
    reference: 'Ford–Roman 1995',
    explanation:
      'The Ford–Roman quantum inequality bounds the magnitude and duration of any sustained negative energy density: brief tiny dips are OK, but macroscopic and long-lived negative energy exceeds the bound by many orders of magnitude. This is why warp-bubble and wormhole shells need to break a seal.',
    computeTutor: (params, verdict) => {
      const tau = params.wallThickness ?? params.throatRadius ?? 1;
      const ratio = verdict?.fordRomanRatio ?? 0;
      return {
        variables: [
          {
            symbol: 'τ',
            name: 'Wall thickness (sustained duration ~ 1/σ)',
            value: tau.toFixed(2),
            baseline: BASELINE_PARAMS.wallThickness.toFixed(2),
            unit: 'L',
          },
          {
            symbol: 'ratio',
            name: 'Demand / bound',
            value: ratio > 0 ? ratio.toExponential(2) : '—',
            unit: 'unitless',
          },
        ],
        interpretation:
          ratio === 0
            ? 'No negative energy in the current build — the Ford–Roman bound is not stressed.'
            : ratio > 1
              ? `Ratio ≈ ${ratio.toExponential(2)} — exceeds the bound by roughly this factor. This is why the "Suspend Quantum Inequalities" seal must be broken.`
              : `Ratio ≈ ${ratio.toExponential(2)} — within the bound, physically achievable.`,
      };
    },
  },
  morrisThorne: {
    id: 'morrisThorne',
    title: 'Morris–Thorne wormhole',
    story:
      'Static, symmetric wormhole geometry parameterized by a shape function b(r) and a redshift function Φ(r).',
    katex:
      'ds^2 = -e^{2\\Phi(r)}\\, dt^2 + \\dfrac{dr^2}{1 - \\link{throat}{b(r)}/r} + r^2\\, d\\Omega^2',
    reference: 'Morris–Thorne 1988',
    explanation:
      'The metric of a spherically-symmetric traversable wormhole. Two functions define the geometry: the shape function b(r) controls the throat, and the redshift Φ(r) is chosen to avoid horizons and tidal-force limits. Traversable = passable in finite proper time by a human observer.',
    computeTutor: (params) => {
      const b0 = params.throatRadius ?? 1;
      const b0Baseline = BASELINE_PARAMS.throatRadius;
      const N = 80;
      const rMax = Math.max(b0, b0Baseline) * 5;
      const buildSeries = (b: number) => {
        const points: Array<[number, number]> = [];
        for (let i = 0; i <= N; i++) {
          const r = b + (i / N) * (rMax - b);
          points.push([r, (b * b) / r]);
        }
        return points;
      };
      const points = buildSeries(b0);
      const baselinePoints = buildSeries(b0Baseline);
      return {
        variables: [
          {
            symbol: 'b₀',
            name: 'Throat radius',
            value: b0.toFixed(2),
            baseline: b0Baseline.toFixed(2),
            unit: 'L',
          },
          { symbol: 'b(r) ansatz', name: 'Shape function', value: 'b₀²/r' },
        ],
        interpretation: `Throat radius b₀ = ${b0.toFixed(2)} L. Tidal forces scale as 1/b₀² near the throat — larger b₀ = safer for a human traversal but needs more exotic matter.`,
        plot: {
          kind: 'line',
          series: [{ points, color: '#8affea', label: 'b(r)' }],
          baselineSeries: [{ points: baselinePoints, color: '#8affea' }],
          markers: [{ x: b0, y: b0, label: 'throat', color: '#ffe27a' }],
          baselineMarkers: [{ x: b0Baseline, y: b0Baseline, color: '#ffe27a' }],
          xLabel: 'r',
          yLabel: 'b(r)',
        },
      };
    },
  },
  flareOut: {
    id: 'flareOut',
    title: 'Flare-out at the throat',
    story: 'The throat has to widen outward — the geometric statement that forces negative energy.',
    katex: '\\link{throat}{b\\,\'(b_0)} < 1',
    explanation:
      "Morris & Thorne showed that any static traversable wormhole must satisfy b'(b₀) < 1 at the throat. This forces T_μν k^μ k^ν < 0 for at least one null direction — i.e., NEC is violated. The flare-out condition is the geometric root of why exotic matter is inescapable.",
    computeTutor: (params) => {
      const b0 = params.throatRadius ?? 1;
      const bPrimeAtThroat = -1;
      return {
        variables: [
          { symbol: 'b₀', name: 'Throat radius', value: b0.toFixed(2), unit: 'L' },
          {
            symbol: "b'(b₀)",
            name: 'Shape derivative at throat',
            value: bPrimeAtThroat.toFixed(2),
          },
        ],
        substitutedKatex: `${bPrimeAtThroat.toFixed(2)} < 1 \\quad \\checkmark`,
        result: { value: 'SATISFIED', label: 'flare-out' },
        interpretation:
          "The b₀²/r ansatz gives b'(b₀) = -1, which satisfies b' < 1. Flare-out ⇒ NEC violated ⇒ exotic matter required. If Maldacena mode is on, the fermion field acts like exotic matter without requiring a bulk source.",
      };
    },
  },
};

function shapeFunctionLocal(r_s: number, R: number, sigma: number): number {
  const num = Math.tanh(sigma * (r_s + R)) - Math.tanh(sigma * (r_s - R));
  const den = 2 * Math.tanh(sigma * R);
  return num / den;
}

const LINK_MACRO = /\\link\{([^{}]+)\}\{((?:[^{}]|\{[^{}]*\})+)\}/g;

export function expandLinkMacros(src: string): string {
  return src.replace(LINK_MACRO, (_m, id, term) => `\\htmlClass{link-${id}}{${term}}`);
}
