import { describe, it, expect } from 'vitest';
import { nullEnergyCondition, ringSamples } from './nullEnergy';

describe('nullEnergyCondition', () => {
  it('passes for a positive constant density', () => {
    const res = nullEnergyCondition(() => 1, ringSamples({ x: 0, y: 0 }, 1, 12));
    expect(res.pass).toBe(true);
    expect(res.violators).toHaveLength(0);
    expect(res.minDensity).toBeCloseTo(1);
  });
  it('fails when any sample is negative', () => {
    const rho = (x: number, _y: number) => (x < 0 ? -0.5 : 1);
    const res = nullEnergyCondition(rho, ringSamples({ x: 0, y: 0 }, 1, 8));
    expect(res.pass).toBe(false);
    expect(res.violators.length).toBeGreaterThan(0);
    expect(res.minDensity).toBeLessThan(0);
  });
});

describe('ringSamples', () => {
  it('returns `count` samples on a circle of the given radius', () => {
    const samples = ringSamples({ x: 0, y: 0 }, 2, 6);
    expect(samples).toHaveLength(6);
    for (const s of samples) {
      expect(Math.hypot(s.x, s.y)).toBeCloseTo(2, 6);
    }
  });
});
