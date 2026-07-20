export type IngredientId =
  | 'ordinary'
  | 'antimatter'
  | 'darkMatter'
  | 'darkEnergy'
  | 'negativeEnergy'
  | 'squeezedVacuum'
  | 'casimir'
  | 'hyperspacePermit'
  | 'darkSectorFermion';

export type EnergyDensitySign = 'positive' | 'negative' | 'none';
export type PressureSign = -1 | 0 | 1;
export type GravityBehavior = 'attractive' | 'repulsive' | 'none';

export type RealStatus =
  | 'confirmed'
  | 'inferred'
  | 'observed'
  | 'hypothetical'
  | 'speculative';

export interface IngredientDef {
  id: IngredientId;
  displayName: string;
  energyDensity: EnergyDensitySign;
  pressureSign: PressureSign;
  gravity: GravityBehavior;
  shapeable: boolean;
  topological: boolean;
  realStatus: RealStatus;
  realStatusLabel: string;
  blockingTheorem?: string;
  frontCopy: string;
  flipSide: string;
}

export type ConstructKind = 'warp' | 'wormhole' | 'krasnikov' | 'hyperspace' | 'custom';

export type SlotName = 'bubbleWall' | 'throat' | 'route' | 'source' | 'field';

export interface IngredientPlacement {
  ingredient: IngredientId;
  amount: number;
  slot: SlotName;
}

export type SealName =
  | 'quantumInequality'
  | 'energyCondition'
  | 'chronologyProtection'
  | 'equivalencePrinciple'
  | 'realAvailability';

export interface SealBreak {
  seal: SealName;
  reason: string;
  citation: string;
  triggeredBy: IngredientId | 'user' | 'geometry';
  timestamp: number;
  missionId?: string;
}

export interface Construct {
  kind: ConstructKind;
  placements: IngredientPlacement[];
  parameters: Record<string, number>;
}

export type VerdictLevel = 'worksInReality' | 'worksWithSeals' | 'incoherent';

export interface Verdict {
  readonly level: VerdictLevel;
  readonly headline: string;
  readonly reason: string;
  readonly necStatus: 'PASS' | 'VIOLATED' | 'NA';
  readonly fordRomanRatio: number;
  readonly chronologyHorizon: boolean;
  readonly sealsBroken: readonly SealBreak[];
  readonly citedTheorems: readonly string[];
  readonly __brand: 'Verdict';
}

export interface Build {
  id: string;
  construct: Construct;
  verdict: Verdict;
  createdAt: number;
  missionId?: string;
  labReport?: string;
}

export type Location = 'earth' | 'mars' | 'proxima' | 'andromeda';

export interface Mission {
  id: string;
  title: string;
  origin: Location;
  destination: Location;
  mode: 'sandbox' | 'classroom' | 'challenge';
  exoticCreditBudget?: number;
  goal: 'reach' | 'fewestSeals' | 'zeroSeals';
}

export type UiMode = 'story' | 'student' | 'physicist';

export interface Vec2 {
  x: number;
  y: number;
}
