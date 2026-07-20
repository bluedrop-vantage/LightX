import { describe, it, expect } from 'vitest';
import { buildVerdict } from './verdict';
import type { Construct } from '../types/domain';

function warp(placements: Construct['placements'], parameters: Record<string, number> = {}): Construct {
  return {
    kind: 'warp',
    placements,
    parameters: { v_s: 0.5, wallThickness: 1, energyBudget: 1, ...parameters },
  };
}
function wormhole(placements: Construct['placements'], parameters: Record<string, number> = {}): Construct {
  return {
    kind: 'wormhole',
    placements,
    parameters: { throatRadius: 1, mouthTimeOffset: 0, mouthSeparation: 5, ...parameters },
  };
}

describe('buildVerdict — warp', () => {
  it('is incoherent with an empty wall', () => {
    const v = buildVerdict({ construct: warp([]), activeSeals: [] });
    expect(v.level).toBe('incoherent');
    expect(v.sealsBroken).toHaveLength(0);
  });

  it('is incoherent (planet, not drive) with positive matter in the wall', () => {
    const v = buildVerdict({
      construct: warp([{ ingredient: 'ordinary', amount: 1, slot: 'bubbleWall' }]),
      activeSeals: [],
    });
    expect(v.level).toBe('incoherent');
    expect(v.headline).toMatch(/planet/i);
  });

  it('is incoherent when dark energy is dropped into the wall (unshapeable)', () => {
    const v = buildVerdict({
      construct: warp([{ ingredient: 'darkEnergy', amount: 1, slot: 'bubbleWall' }]),
      activeSeals: [],
    });
    expect(v.level).toBe('incoherent');
    expect(v.headline).toMatch(/cannot form/i);
  });

  it('works only with seals broken when negative energy is used', () => {
    const v = buildVerdict({
      construct: warp([{ ingredient: 'negativeEnergy', amount: 1e30, slot: 'bubbleWall' }]),
      activeSeals: ['quantumInequality'],
    });
    expect(v.level).toBe('worksWithSeals');
    expect(v.sealsBroken.length).toBeGreaterThan(0);
    expect(v.sealsBroken.some((s) => s.seal === 'energyCondition')).toBe(true);
  });

  it('never produces worksInReality when negative energy was placed', () => {
    for (const activeSeals of [[], ['quantumInequality'] as const]) {
      const v = buildVerdict({
        construct: warp([{ ingredient: 'negativeEnergy', amount: 1e30, slot: 'bubbleWall' }]),
        activeSeals: [...activeSeals],
      });
      expect(v.level).not.toBe('worksInReality');
    }
  });
});

describe('buildVerdict — wormhole', () => {
  it('is incoherent with positive matter (throat pinches)', () => {
    const v = buildVerdict({
      construct: wormhole([{ ingredient: 'ordinary', amount: 1, slot: 'throat' }]),
      activeSeals: [],
    });
    expect(v.level).toBe('incoherent');
    expect(v.headline).toMatch(/pinch/i);
  });

  it('fires chronology alarm when |Δt| > Δx and seal is not broken', () => {
    const v = buildVerdict({
      construct: wormhole(
        [{ ingredient: 'negativeEnergy', amount: 1, slot: 'throat' }],
        { throatRadius: 1, mouthTimeOffset: 30, mouthSeparation: 5 },
      ),
      activeSeals: ['quantumInequality'],
    });
    expect(v.level).toBe('incoherent');
    expect(v.chronologyHorizon).toBe(true);
    expect(v.headline).toMatch(/chronology/i);
  });

  it('overrides chronology alarm when chronologyProtection seal is broken', () => {
    const v = buildVerdict({
      construct: wormhole(
        [{ ingredient: 'negativeEnergy', amount: 1, slot: 'throat' }],
        { throatRadius: 1, mouthTimeOffset: 30, mouthSeparation: 5 },
      ),
      activeSeals: ['quantumInequality', 'chronologyProtection'],
    });
    expect(v.level).toBe('worksWithSeals');
    expect(v.sealsBroken.some((s) => s.seal === 'chronologyProtection')).toBe(true);
  });
});

describe('Verdict invariant', () => {
  it('has __brand === "Verdict" (nominal typing)', () => {
    const v = buildVerdict({ construct: warp([]), activeSeals: [] });
    expect(v.__brand).toBe('Verdict');
  });
});
