import { describe, it, expect } from 'vitest';
import { shapeB, shapeBDerivative, flareOutSatisfied, embeddingZ } from './morrisThorne';

describe('Morris–Thorne shape function b(r) = b0^2 / r', () => {
  it('equals b0 at the throat', () => {
    expect(shapeB(1.5, 1.5)).toBeCloseTo(1.5, 6);
  });
  it('decays as r grows', () => {
    const b0 = 1;
    expect(shapeB(2, b0)).toBeLessThan(shapeB(1.5, b0));
    expect(shapeB(10, b0)).toBeLessThan(shapeB(2, b0));
  });
});

describe('Morris–Thorne flare-out condition', () => {
  it('is satisfied for the b(r) = b0^2 / r ansatz', () => {
    expect(flareOutSatisfied({ b0: 1, center: [0, 0], phiCoefficients: [0] })).toBe(true);
    expect(flareOutSatisfied({ b0: 0.5, center: [0, 0], phiCoefficients: [0] })).toBe(true);
  });
});

describe('Morris–Thorne embedding', () => {
  it('vanishes at the throat', () => {
    expect(embeddingZ(1, 1)).toBeCloseTo(0, 6);
  });
  it('grows with r beyond the throat', () => {
    const b0 = 1;
    expect(embeddingZ(2, b0)).toBeGreaterThan(0);
    expect(embeddingZ(5, b0)).toBeGreaterThan(embeddingZ(2, b0));
  });
});

describe('Morris–Thorne shape derivative', () => {
  it('is negative for r > b0 (b decreases)', () => {
    expect(shapeBDerivative(2, 1)).toBeLessThan(0);
    expect(shapeBDerivative(5, 1)).toBeLessThan(0);
  });
});
