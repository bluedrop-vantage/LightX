import { describe, it, expect } from 'vitest';
import { krasnikovProfile, krasnikovStressDensity, type KrasnikovParams } from './krasnikov';

const P: KrasnikovParams = {
  routeStart: [-5, 0],
  routeEnd: [5, 0],
  tubeWidth: 0.5,
  v_s: 1,
  t: 10,
};

describe('Krasnikov tube profile', () => {
  it('is concentrated on the route (higher at perp=0)', () => {
    const on = krasnikovProfile(0, 0, P);
    const off = krasnikovProfile(0, 1.5, P);
    expect(on).toBeGreaterThan(off);
  });
  it('has non-positive stress-energy density along the tube', () => {
    const rho = krasnikovStressDensity(0, 0, P);
    expect(rho).toBeLessThanOrEqual(0);
  });
  it('vanishes far from the route', () => {
    expect(krasnikovProfile(0, 20, P)).toBeLessThan(1e-6);
  });
});
