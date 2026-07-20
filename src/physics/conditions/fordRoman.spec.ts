import { describe, it, expect } from 'vitest';
import { fordRomanBound, fordRomanRatio } from './fordRoman';

describe('fordRomanBound(τ)', () => {
  it('is monotonically decreasing in τ (longer holds are harder)', () => {
    const b1 = fordRomanBound(1e-15);
    const b2 = fordRomanBound(1e-14);
    const b3 = fordRomanBound(1e-13);
    expect(b1).toBeGreaterThan(b2);
    expect(b2).toBeGreaterThan(b3);
  });
  it('returns +Infinity for non-positive τ', () => {
    expect(fordRomanBound(0)).toBe(Number.POSITIVE_INFINITY);
    expect(fordRomanBound(-1)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('fordRomanRatio', () => {
  it('is 0 when the bound is +Infinity', () => {
    expect(fordRomanRatio(1e30, 0)).toBe(0);
  });
  it('is greater than 1 for typical macroscopic warp demand', () => {
    const ratio = fordRomanRatio(1e35, 1);
    expect(ratio).toBeGreaterThan(1);
  });
});
