import type { IngredientDef, IngredientId } from '../types/domain';

export const INGREDIENTS: Record<IngredientId, IngredientDef> = {
  ordinary: {
    id: 'ordinary',
    displayName: 'Ordinary Matter',
    energyDensity: 'positive',
    pressureSign: 0,
    gravity: 'attractive',
    shapeable: true,
    topological: false,
    realStatus: 'confirmed',
    realStatusLabel: 'Confirmed',
    frontCopy: 'Baryons and leptons. Every atom you have ever touched.',
    flipSide:
      'Attracts gravitationally. Focuses light rays. Cannot open a wormhole or drive a warp bubble — positive energy pinches spacetime, not pries it open.',
  },
  antimatter: {
    id: 'antimatter',
    displayName: 'Antimatter',
    energyDensity: 'positive',
    pressureSign: 0,
    gravity: 'attractive',
    shapeable: true,
    topological: false,
    realStatus: 'confirmed',
    realStatusLabel: 'Confirmed (ALPHA-g 2023)',
    blockingTheorem: 'ALPHA-g 2023',
    frontCopy: 'Charge-flipped ordinary matter. Positrons, antiprotons, antihydrogen.',
    flipSide:
      'Falls DOWN, not up. ALPHA-g (CERN, 2023) measured antihydrogen freefall directly. Same positive energy density as matter; same attractive gravity.',
  },
  darkMatter: {
    id: 'darkMatter',
    displayName: 'Dark Matter',
    energyDensity: 'positive',
    pressureSign: 0,
    gravity: 'attractive',
    shapeable: true,
    topological: false,
    realStatus: 'inferred',
    realStatusLabel: 'Inferred',
    frontCopy: 'Invisible mass inferred from galactic rotation curves and lensing.',
    flipSide:
      'Attracts like ordinary matter. Not exotic in the GR sense — same energy conditions apply. Cannot defocus light or hold a wormhole open.',
  },
  darkEnergy: {
    id: 'darkEnergy',
    displayName: 'Dark Energy (Λ)',
    energyDensity: 'positive',
    pressureSign: -1,
    gravity: 'repulsive',
    shapeable: false,
    topological: false,
    realStatus: 'observed',
    realStatusLabel: 'Observed',
    frontCopy: 'The accelerating-expansion component. Cosmological constant Λ.',
    flipSide:
      'Repulsive at cosmic scale, but a property of space itself — you cannot pour it into a bucket, shape it into a wall, or concentrate it at a throat. Unmanipulable.',
  },
  negativeEnergy: {
    id: 'negativeEnergy',
    displayName: 'Negative Energy',
    energyDensity: 'negative',
    pressureSign: 0,
    gravity: 'repulsive',
    shapeable: true,
    topological: false,
    realStatus: 'hypothetical',
    realStatusLabel: 'Hypothetical at scale',
    blockingTheorem: 'Ford–Roman 1995',
    frontCopy: 'Bulk exotic matter with T_00 < 0. The ingredient that makes warp drives and wormholes go.',
    flipSide:
      'No known process produces it in bulk. Quantum inequalities (Ford–Roman) bound how much and how long. Every macroscopic use here breaks the "Suspend Quantum Inequalities" seal.',
  },
  squeezedVacuum: {
    id: 'squeezedVacuum',
    displayName: 'Squeezed Vacuum',
    energyDensity: 'negative',
    pressureSign: 0,
    gravity: 'repulsive',
    shapeable: true,
    topological: false,
    realStatus: 'confirmed',
    realStatusLabel: 'Lab-confirmed (tiny)',
    blockingTheorem: 'Ford–Roman quantum inequalities',
    frontCopy: 'Quantum-optics states with T_00 briefly below vacuum.',
    flipSide:
      'Real, but negative periods are compensated by larger positive periods (Ford–Roman). Averaged energy density is non-negative. Cannot be stockpiled.',
  },
  casimir: {
    id: 'casimir',
    displayName: 'Casimir Plates',
    energyDensity: 'negative',
    pressureSign: 0,
    gravity: 'repulsive',
    shapeable: false,
    topological: false,
    realStatus: 'confirmed',
    realStatusLabel: 'Lab-confirmed (tiny)',
    blockingTheorem: 'Ford–Roman quantum inequalities',
    frontCopy: 'Two conductive plates create a small negative energy density between them.',
    flipSide:
      'Real and measured. But scaling up plates costs positive mass-energy that grows faster than the negative-energy deficit. Bound to the apparatus.',
  },
  hyperspacePermit: {
    id: 'hyperspacePermit',
    displayName: 'Hyperspace Permit',
    energyDensity: 'none',
    pressureSign: 0,
    gravity: 'none',
    shapeable: false,
    topological: true,
    realStatus: 'speculative',
    realStatusLabel: 'Speculative (braneworld)',
    frontCopy: 'Access to bulk dimensions in braneworld models. Not a substance — a routing token.',
    flipSide:
      'Beyond confirmed physics. Assumes large extra dimensions and a mechanism to open a brane portal. This app treats it as a labeled fiction; enabling it flags every mission that uses it.',
  },
  darkSectorFermion: {
    id: 'darkSectorFermion',
    displayName: 'Dark-Sector Fermion Field',
    energyDensity: 'positive',
    pressureSign: 0,
    gravity: 'attractive',
    shapeable: true,
    topological: false,
    realStatus: 'speculative',
    realStatusLabel: 'Speculative (Maldacena wormholes)',
    blockingTheorem: 'Maldacena–Milekhin 2020',
    frontCopy: 'Long-range fermion field of a hidden ("dark") sector. Not observed, but permitted by consistent QFT constructions.',
    flipSide:
      'In Maldacena–Milekhin traversable wormholes, a Casimir-like coupling of dark-sector fermions holds the throat open without exotic matter — but the trip is enforced sub-light (no chronology alarm, no shortcut).',
  },
};

export const MVP_INGREDIENTS: IngredientId[] = [
  'ordinary',
  'antimatter',
  'darkMatter',
  'darkEnergy',
  'negativeEnergy',
  'casimir',
];

export const PHASE3_INGREDIENTS: IngredientId[] = [
  'squeezedVacuum',
  'hyperspacePermit',
  'darkSectorFermion',
];

export const ALL_PANTRY: IngredientId[] = [...MVP_INGREDIENTS, ...PHASE3_INGREDIENTS];

export function getIngredient(id: IngredientId): IngredientDef {
  return INGREDIENTS[id];
}
