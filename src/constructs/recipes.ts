import type { ConstructKind, IngredientPlacement } from '../types/domain';

export interface Recipe {
  label: string;
  note: string;
  placements: IngredientPlacement[];
  /** Optional parameter overrides applied when this recipe is chosen. */
  parameters?: Record<string, number>;
  /** Optional expected outcome to display in the button subtitle. */
  outcome: 'real' | 'yellow' | 'red';
}

const WARP_RECIPES: Recipe[] = [
  {
    label: 'Negative Energy',
    note: 'Classic Alcubierre setup — bubble surfs (needs the quantum-inequality seal).',
    outcome: 'yellow',
    placements: [{ ingredient: 'negativeEnergy', amount: 1, slot: 'bubbleWall' }],
  },
  {
    label: 'Casimir Plates',
    note: 'Real lab-scale negative energy — same qualitative behavior, still exceeds the QI bound at bulk.',
    outcome: 'yellow',
    placements: [{ ingredient: 'casimir', amount: 1, slot: 'bubbleWall' }],
  },
  {
    label: 'Ordinary Matter',
    note: 'Positive matter focuses spacetime — you build a planet, not a drive.',
    outcome: 'red',
    placements: [{ ingredient: 'ordinary', amount: 1, slot: 'bubbleWall' }],
  },
  {
    label: 'Dark Energy',
    note: 'Unshapeable — rejected by the wall slot. Shows why "repulsive" alone is not enough.',
    outcome: 'red',
    placements: [{ ingredient: 'darkEnergy', amount: 1, slot: 'bubbleWall' }],
  },
];

const WORMHOLE_RECIPES: Recipe[] = [
  {
    label: 'Negative Energy',
    note: 'Traversable Morris–Thorne throat — flare-out satisfied via exotic matter.',
    outcome: 'yellow',
    placements: [{ ingredient: 'negativeEnergy', amount: 1, slot: 'throat' }],
  },
  {
    label: 'Maldacena wormhole',
    note: 'Dark-sector fermion + Maldacena mode ON — sub-light traversable, no exotic matter.',
    outcome: 'yellow',
    placements: [{ ingredient: 'darkSectorFermion', amount: 1, slot: 'throat' }],
    parameters: { maldacena: 1 },
  },
  {
    label: 'Ordinary Matter',
    note: 'Positive matter focuses light — throat pinches off (Einstein–Rosen collapse).',
    outcome: 'red',
    placements: [{ ingredient: 'ordinary', amount: 1, slot: 'throat' }],
  },
  {
    label: 'Antimatter',
    note: 'Same attractive gravity as matter (ALPHA-g 2023) — also pinches the throat.',
    outcome: 'red',
    placements: [{ ingredient: 'antimatter', amount: 1, slot: 'throat' }],
  },
];

const KRASNIKOV_RECIPES: Recipe[] = [
  {
    label: 'Negative Energy',
    note: 'Lays a working superluminal corridor along the route.',
    outcome: 'yellow',
    placements: [{ ingredient: 'negativeEnergy', amount: 1, slot: 'route' }],
  },
  {
    label: 'Casimir Plates',
    note: 'Real negative-energy source — same shape, same QI-seal cost.',
    outcome: 'yellow',
    placements: [{ ingredient: 'casimir', amount: 1, slot: 'route' }],
  },
  {
    label: 'Ordinary Matter',
    note: 'Positive matter along a route builds a wall, not a shortcut.',
    outcome: 'red',
    placements: [{ ingredient: 'ordinary', amount: 1, slot: 'route' }],
  },
];

const HYPERSPACE_RECIPES: Recipe[] = [
  {
    label: 'Hyperspace Permit',
    note: 'The only ingredient that arms the portal — a topological routing token.',
    outcome: 'yellow',
    placements: [{ ingredient: 'hyperspacePermit', amount: 1, slot: 'source' }],
  },
];

const FREEBUILD_RECIPES: Recipe[] = [
  {
    label: 'Negative energy field',
    note: 'Single negative-energy ingredient — try painting some too and firing rays.',
    outcome: 'yellow',
    placements: [{ ingredient: 'negativeEnergy', amount: 1, slot: 'field' }],
  },
  {
    label: 'Positive-mass well',
    note: 'A stack of ordinary matter — expect gravitational lensing when you fire rays.',
    outcome: 'real',
    placements: [
      { ingredient: 'ordinary', amount: 1, slot: 'field' },
      { ingredient: 'darkMatter', amount: 1, slot: 'field' },
    ],
  },
  {
    label: 'Antimatter check',
    note: 'ALPHA-g 2023: antimatter falls DOWN. Verify by painting and launching the ship.',
    outcome: 'real',
    placements: [{ ingredient: 'antimatter', amount: 1, slot: 'field' }],
  },
  {
    label: 'Mixed exotic + matter',
    note: 'Sum of both energy densities — the verdict weighs both.',
    outcome: 'red',
    placements: [
      { ingredient: 'negativeEnergy', amount: 1, slot: 'field' },
      { ingredient: 'ordinary', amount: 1, slot: 'field' },
    ],
  },
];

export const RECIPES: Record<ConstructKind, Recipe[]> = {
  warp: WARP_RECIPES,
  wormhole: WORMHOLE_RECIPES,
  krasnikov: KRASNIKOV_RECIPES,
  hyperspace: HYPERSPACE_RECIPES,
  custom: FREEBUILD_RECIPES,
};
