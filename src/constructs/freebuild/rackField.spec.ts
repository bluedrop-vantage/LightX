import { describe, it, expect } from 'vitest';
import { rackToSamples, samplesEvaluate, samplesGradientZ } from './rackField';
import type { IngredientPlacement } from '../../types/domain';

function place(id: IngredientPlacement['ingredient'], amount = 1): IngredientPlacement {
  return { ingredient: id, amount, slot: 'field' };
}

describe('rackToSamples', () => {
  it('skips topological ingredients (hyperspace permit has no gravity)', () => {
    const out = rackToSamples([place('hyperspacePermit')]);
    expect(out).toHaveLength(0);
  });

  it('maps attractive gravity to positive intensity (ordinary, dark matter, antimatter)', () => {
    for (const id of ['ordinary', 'darkMatter', 'antimatter'] as const) {
      const [s] = rackToSamples([place(id)]);
      expect(s.intensity).toBeGreaterThan(0);
    }
  });

  it('maps repulsive gravity to negative intensity (negative energy)', () => {
    const [s] = rackToSamples([place('negativeEnergy')]);
    expect(s.intensity).toBeLessThan(0);
  });

  it('distributes multiple contributing items around the origin', () => {
    const samples = rackToSamples([place('ordinary'), place('antimatter'), place('darkMatter')]);
    expect(samples).toHaveLength(3);
    for (const s of samples) {
      expect(Math.hypot(s.x, s.y)).toBeCloseTo(3, 5);
    }
  });
});

describe('samplesEvaluate + samplesGradientZ (matter attracts, negative energy repels)', () => {
  it('a matter sample produces a downward z (a well) at its center', () => {
    const [s] = rackToSamples([place('ordinary')]);
    const { z } = samplesEvaluate([s], s.x, s.y);
    expect(z).toBeLessThan(0);
  });

  it('a matter sample gradient points AWAY from center — so -∇z points TOWARD center (ship falls in)', () => {
    const [s] = rackToSamples([place('ordinary')]);
    const { gx, gy } = samplesGradientZ([s], s.x + 1, s.y);
    expect(gx).toBeGreaterThan(0); // ∇z at (+1, 0) is +x → -∇z is -x → toward center. Correct.
    expect(Math.abs(gy)).toBeLessThan(1e-9);
  });

  it('a negative-energy sample produces an upward z (a bump) at its center', () => {
    const [s] = rackToSamples([place('negativeEnergy')]);
    const { z } = samplesEvaluate([s], s.x, s.y);
    expect(z).toBeGreaterThan(0);
  });
});
