import type {
  Construct,
  IngredientPlacement,
  SealBreak,
  SealName,
  Verdict,
  VerdictLevel,
} from '../types/domain';
import { getIngredient } from '../pantry/ingredients';
import { fordRomanRatio } from './conditions/fordRoman';

export interface BuildVerdictInput {
  construct: Construct;
  activeSeals: SealName[];
  missionId?: string;
  now?: number;
  onSealBreak?: (seal: SealBreak) => void;
}

interface Draft {
  level: VerdictLevel | null;
  headline: string;
  reason: string;
  necStatus: 'PASS' | 'VIOLATED' | 'NA';
  fordRomanRatio: number;
  chronologyHorizon: boolean;
  sealsBroken: SealBreak[];
  citedTheorems: Set<string>;
}

function seal(
  draft: Draft,
  input: BuildVerdictInput,
  name: SealName,
  reason: string,
  citation: string,
  triggeredBy: SealBreak['triggeredBy'],
): void {
  const now = input.now ?? Date.now();
  const entry: SealBreak = {
    seal: name,
    reason,
    citation,
    triggeredBy,
    timestamp: now,
  };
  if (input.missionId !== undefined) {
    entry.missionId = input.missionId;
  }
  draft.sealsBroken.push(entry);
  draft.citedTheorems.add(citation);
  input.onSealBreak?.(entry);
}

function classifyPlacements(placements: IngredientPlacement[]) {
  const negativeShapeable: IngredientPlacement[] = [];
  const positive: IngredientPlacement[] = [];
  const unshapeable: IngredientPlacement[] = [];
  const topological: IngredientPlacement[] = [];

  for (const p of placements) {
    const def = getIngredient(p.ingredient);
    if (def.topological) topological.push(p);
    else if (!def.shapeable) unshapeable.push(p);
    else if (def.energyDensity === 'negative') negativeShapeable.push(p);
    else if (def.energyDensity === 'positive') positive.push(p);
  }
  return { negativeShapeable, positive, unshapeable, topological };
}

function evaluateWarp(input: BuildVerdictInput, draft: Draft): void {
  const slot = input.construct.kind === 'krasnikov' ? 'route' : 'bubbleWall';
  const wall = input.construct.placements.filter((p) => p.slot === slot);
  const cats = classifyPlacements(wall);

  if (cats.unshapeable.length > 0) {
    draft.level = 'incoherent';
    draft.headline = 'Ingredient cannot form a wall';
    const first = cats.unshapeable[0];
    draft.reason = `${getIngredient(first.ingredient).displayName} is not a shapeable substance — it is a property of space (or bound to its apparatus). You cannot pour it into the bubble wall.`;
    draft.necStatus = 'NA';
    return;
  }

  if (cats.negativeShapeable.length === 0) {
    draft.level = 'incoherent';
    if (cats.positive.length === 0) {
      draft.headline = 'Empty bubble wall';
      draft.reason = 'A warp bubble needs a wall. Drop something into it.';
    } else {
      draft.headline = 'You built a planet, not a drive';
      draft.reason =
        'Positive energy focuses spacetime — the ship falls into a gravity well instead of surfing. Only negative energy defocuses and drives the bubble.';
      draft.necStatus = 'PASS';
      draft.citedTheorems.add('Olum 1998');
    }
    return;
  }

  const totalNegative = cats.negativeShapeable.reduce((s, p) => s + p.amount, 0);
  const thickness = input.construct.parameters.wallThickness ?? 1;
  const v_s = input.construct.parameters.v_s ?? 1;

  draft.necStatus = 'VIOLATED';
  draft.fordRomanRatio = fordRomanRatio(-totalNegative, thickness);

  const quantumInequalityActive = input.activeSeals.includes('quantumInequality');
  const chronologyActive = input.activeSeals.includes('chronologyProtection');

  seal(
    draft,
    input,
    'energyCondition',
    'Warp bubble wall requires negative energy density; NEC is violated by construction (Alcubierre 1994).',
    'Alcubierre 1994',
    'geometry',
  );

  if (draft.fordRomanRatio > 1) {
    if (!quantumInequalityActive) {
      draft.level = 'incoherent';
      draft.headline = 'Quantum inequality forbids this bubble';
      draft.reason = `The sustained negative energy density in the wall exceeds the Ford–Roman bound by a factor of ${draft.fordRomanRatio.toExponential(2)}. Enable "Suspend Quantum Inequalities" to build it anyway.`;
      draft.citedTheorems.add('Ford–Roman 1995');
      return;
    }
    seal(
      draft,
      input,
      'quantumInequality',
      `Ford–Roman ratio ${draft.fordRomanRatio.toExponential(2)}: this wall breaks the quantum-inequality bound.`,
      'Ford–Roman 1995',
      'user',
    );
  }

  if (v_s > 1) {
    draft.chronologyHorizon = true;
    if (!chronologyActive) {
      draft.headline = 'Superluminal bubble — steering severed';
      draft.reason = `Bubble at ${v_s.toFixed(2)}c: the pilot cannot signal the front wall (causally disconnected). Combining multiple superluminal bubbles will trigger a chronology alarm.`;
    }
  }

  draft.level = 'worksWithSeals';
  draft.headline = draft.headline || 'Bubble surfs — seals broken';
  draft.reason =
    draft.reason ||
    'Metric well-formed; grid contracts ahead and expands behind. Interior is inertial (coffee stays in the cup).';
}

function evaluateWormhole(input: BuildVerdictInput, draft: Draft): void {
  const throat = input.construct.placements.filter((p) => p.slot === 'throat');
  const cats = classifyPlacements(throat);
  const maldacenaMode = (input.construct.parameters.maldacena ?? 0) > 0.5;
  const darkFermions = throat.filter((p) => p.ingredient === 'darkSectorFermion');

  if (maldacenaMode && darkFermions.length > 0) {
    seal(
      draft,
      input,
      'realAvailability',
      'Maldacena–Milekhin wormholes rely on a hypothetical dark-sector fermion field — not confirmed physics.',
      'Maldacena–Milekhin 2020',
      'user',
    );
    draft.necStatus = 'PASS';
    draft.chronologyHorizon = false;
    draft.level = 'worksWithSeals';
    draft.headline = 'Throat holds — sub-light traversal only';
    draft.reason =
      'Dark-sector fermion coupling pries the throat open without exotic matter. The trip is strictly slower than a light signal outside — no shortcut, no chronology alarm.';
    return;
  }

  if (cats.unshapeable.length > 0) {
    draft.level = 'incoherent';
    draft.headline = 'Ingredient cannot hold a throat';
    draft.reason = `${getIngredient(cats.unshapeable[0].ingredient).displayName} cannot be concentrated at a wormhole throat.`;
    draft.necStatus = 'NA';
    return;
  }

  if (cats.negativeShapeable.length === 0) {
    draft.level = 'incoherent';
    if (darkFermions.length > 0 && !maldacenaMode) {
      draft.headline = 'Dark-sector fermions need Maldacena mode';
      draft.reason =
        'Enable "Maldacena mode" to use dark-sector fermions to hold the throat open (sub-light traversal only).';
      draft.necStatus = 'PASS';
      draft.citedTheorems.add('Maldacena–Milekhin 2020');
      return;
    }
    if (cats.positive.length === 0) {
      draft.headline = 'Empty throat';
      draft.reason = 'The throat has no exotic matter. Einstein–Rosen behavior: pinches off before anything can traverse.';
    } else {
      draft.headline = 'Throat pinches off';
      draft.reason =
        'Positive energy focuses light rays — the throat collapses. Only negative energy satisfies the flare-out condition.';
    }
    draft.necStatus = 'PASS';
    draft.citedTheorems.add('Morris–Thorne 1988');
    return;
  }

  const totalNegative = cats.negativeShapeable.reduce((s, p) => s + p.amount, 0);
  const throatRadius = input.construct.parameters.throatRadius ?? 1;
  const mouthOffset = input.construct.parameters.mouthTimeOffset ?? 0;
  const mouthSeparation = input.construct.parameters.mouthSeparation ?? 1;

  draft.necStatus = 'VIOLATED';
  draft.fordRomanRatio = fordRomanRatio(-totalNegative, throatRadius);

  seal(
    draft,
    input,
    'energyCondition',
    'Traversable wormhole throat violates NEC by the flare-out condition (Morris–Thorne 1988).',
    'Morris–Thorne 1988',
    'geometry',
  );

  if (draft.fordRomanRatio > 1) {
    if (!input.activeSeals.includes('quantumInequality')) {
      draft.level = 'incoherent';
      draft.headline = 'Quantum inequality forbids this throat';
      draft.reason = `Required negative energy density exceeds the Ford–Roman bound by a factor of ${draft.fordRomanRatio.toExponential(2)}.`;
      draft.citedTheorems.add('Ford–Roman 1995');
      return;
    }
    seal(
      draft,
      input,
      'quantumInequality',
      `Ford–Roman ratio ${draft.fordRomanRatio.toExponential(2)}.`,
      'Ford–Roman 1995',
      'user',
    );
  }

  const chronologyForming =
    Math.abs(mouthOffset) > mouthSeparation;
  if (chronologyForming) {
    draft.chronologyHorizon = true;
    if (!input.activeSeals.includes('chronologyProtection')) {
      draft.level = 'incoherent';
      draft.headline = 'Chronology alarm — wormhole detonates';
      draft.reason =
        'Mouth clocks are desynchronized enough to form a closed timelike curve. Vacuum fluctuations amplify and destroy the throat (Hawking 1992). Enable "Suspend Chronology Protection" to override.';
      draft.citedTheorems.add('Hawking 1992');
      return;
    }
    seal(
      draft,
      input,
      'chronologyProtection',
      'Closed timelike curve formed; chronology-protection seal broken.',
      'Hawking 1992',
      'user',
    );
  }

  draft.level = 'worksWithSeals';
  draft.headline = 'Throat holds — traversable';
  draft.reason = 'Light rays defocus at the throat; a probe can traverse.';
}

function evaluateHyperspace(input: BuildVerdictInput, draft: Draft): void {
  const source = input.construct.placements.filter((p) => p.slot === 'source');
  const hasPermit = source.some((p) => getIngredient(p.ingredient).topological);
  if (!hasPermit) {
    draft.level = 'incoherent';
    draft.headline = 'No hyperspace permit';
    draft.reason = 'Bulk shortcut routing requires the Hyperspace Permit ingredient.';
    return;
  }
  seal(
    draft,
    input,
    'realAvailability',
    'Braneworld hyperspace routing is beyond confirmed physics; every use is flagged.',
    'braneworld (speculative)',
    'user',
  );
  draft.level = 'worksWithSeals';
  draft.headline = 'Portal opens — beyond known physics';
  draft.reason = 'Assumes large extra dimensions and a mechanism to open a brane portal.';
}

function evaluateCustom(input: BuildVerdictInput, draft: Draft): void {
  const placements = input.construct.placements;
  if (placements.length === 0) {
    draft.level = 'incoherent';
    draft.headline = 'Empty rig';
    draft.reason = 'Place at least one ingredient.';
    return;
  }
  const cats = classifyPlacements(placements);
  if (cats.negativeShapeable.length === 0 && cats.topological.length === 0) {
    draft.level = 'worksInReality';
    draft.headline = 'Works in reality';
    draft.reason =
      'Ordinary rocket / gravitational slingshot / time-dilation cruise. No seals broken.';
    draft.necStatus = 'PASS';
    return;
  }
  evaluateWarp(input, draft);
}

const BLANK: Draft = {
  level: null,
  headline: '',
  reason: '',
  necStatus: 'NA',
  fordRomanRatio: 0,
  chronologyHorizon: false,
  sealsBroken: [],
  citedTheorems: new Set(),
};

function newDraft(): Draft {
  return {
    ...BLANK,
    sealsBroken: [],
    citedTheorems: new Set(),
  };
}

export function buildVerdict(input: BuildVerdictInput): Verdict {
  const draft = newDraft();

  switch (input.construct.kind) {
    case 'warp':
      evaluateWarp(input, draft);
      break;
    case 'wormhole':
      evaluateWormhole(input, draft);
      break;
    case 'hyperspace':
      evaluateHyperspace(input, draft);
      break;
    case 'krasnikov':
      evaluateWarp(input, draft);
      break;
    case 'custom':
      evaluateCustom(input, draft);
      break;
  }

  const level: VerdictLevel = draft.level ?? 'incoherent';
  if (level === 'worksInReality' && draft.sealsBroken.length > 0) {
    throw new Error('verdict invariant violated: worksInReality with broken seals');
  }

  const verdict: Verdict = {
    level,
    headline: draft.headline,
    reason: draft.reason,
    necStatus: draft.necStatus,
    fordRomanRatio: draft.fordRomanRatio,
    chronologyHorizon: draft.chronologyHorizon,
    sealsBroken: [...draft.sealsBroken],
    citedTheorems: [...draft.citedTheorems],
    __brand: 'Verdict',
  };
  return verdict;
}
