import { describe, it, expect } from 'vitest';
import {
  shapeFunction,
  shapeFunctionDerivative,
  stressEnergyDensity,
  expansionScalar,
  type AlcubierreParams,
} from './alcubierre';

describe('Alcubierre shape function', () => {
  it('is ~1 inside the bubble (r_s = 0)', () => {
    const f = shapeFunction(0, 3, 4);
    expect(f).toBeGreaterThan(0.99);
  });

  it('is ~0 far outside the bubble', () => {
    const f = shapeFunction(50, 3, 4);
    expect(Math.abs(f)).toBeLessThan(1e-6);
  });

  it('is monotonically non-increasing beyond the bubble center, and strictly decreasing across the wall', () => {
    const R = 3;
    const sigma = 4;
    let prev = shapeFunction(0, R, sigma);
    for (let r = 0.5; r <= 20; r += 0.5) {
      const next = shapeFunction(r, R, sigma);
      expect(next).toBeLessThanOrEqual(prev + 1e-12);
      prev = next;
    }
    expect(shapeFunction(R - 0.5, R, sigma)).toBeGreaterThan(shapeFunction(R + 0.5, R, sigma));
  });

  it('derivative peaks near the wall radius R', () => {
    const R = 3;
    const sigma = 4;
    const dfAtWall = Math.abs(shapeFunctionDerivative(R, R, sigma));
    const dfCenter = Math.abs(shapeFunctionDerivative(0.01, R, sigma));
    const dfFar = Math.abs(shapeFunctionDerivative(10, R, sigma));
    expect(dfAtWall).toBeGreaterThan(dfCenter);
    expect(dfAtWall).toBeGreaterThan(dfFar);
  });
});

describe('Alcubierre stress-energy density', () => {
  it('is non-positive in the wall for v_s > 0', () => {
    const p: AlcubierreParams = { v_s: 2, R: 3, sigma: 4, center: [0, 0], t: 0 };
    const samples = [
      { x: 0, y: 3 },
      { x: 1.5, y: 2.5 },
      { x: 2.5, y: 1.8 },
      { x: 0.4, y: 3.2 },
    ];
    for (const s of samples) {
      const rho = stressEnergyDensity(s.x, s.y, p);
      expect(rho).toBeLessThanOrEqual(0);
    }
  });

  it('vanishes along the axis of motion (y = 0)', () => {
    const p: AlcubierreParams = { v_s: 2, R: 3, sigma: 4, center: [0, 0], t: 0 };
    for (const x of [0.5, 1, 2, 3, 4]) {
      expect(Math.abs(stressEnergyDensity(x, 0, p))).toBeLessThan(1e-12);
    }
  });
});

describe('Alcubierre expansion scalar', () => {
  it('has opposite sign ahead vs behind the bubble', () => {
    const p: AlcubierreParams = { v_s: 2, R: 3, sigma: 4, center: [0, 0], t: 0 };
    const ahead = expansionScalar(3.2, 0.5, p);
    const behind = expansionScalar(-3.2, 0.5, p);
    expect(ahead * behind).toBeLessThan(0);
  });
});
