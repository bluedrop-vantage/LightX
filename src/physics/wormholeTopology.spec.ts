import { describe, it, expect } from 'vitest';
import { splitPathAtThroat } from './wormholeTopology';

function toFloat32(points: Array<[number, number]>): Float32Array {
  const out = new Float32Array(points.length * 2);
  for (let i = 0; i < points.length; i++) {
    out[i * 2] = points[i][0];
    out[i * 2 + 1] = points[i][1];
  }
  return out;
}

describe('splitPathAtThroat', () => {
  it('does not split a ray that never approaches the throat', () => {
    const points = toFloat32([
      [5, 0],
      [6, 0],
      [7, 0],
      [8, 0],
    ]);
    const { paneA, paneB } = splitPathAtThroat(points, 1);
    expect(paneA).toBe(points);
    expect(paneB).toBeNull();
  });

  it('splits a ray that enters and exits the throat', () => {
    const points = toFloat32([
      [5, 0],
      [3, 0],
      [1.2, 0],
      [0.5, 0],
      [1.2, 0],
      [3, 0],
      [5, 0],
    ]);
    const { paneA, paneB } = splitPathAtThroat(points, 1);
    expect(paneA).not.toBeNull();
    expect(paneB).not.toBeNull();
    // paneA should contain the pre-throat portion (r > throatR = 1.35)
    for (let i = 0; i < (paneA!.length / 2); i++) {
      const r = Math.hypot(paneA![i * 2], paneA![i * 2 + 1]);
      expect(r).toBeGreaterThanOrEqual(1.35);
    }
    // paneB should be a rotated-by-π version of the post-throat portion
    for (let i = 0; i < (paneB!.length / 2); i++) {
      const r = Math.hypot(paneB![i * 2], paneB![i * 2 + 1]);
      expect(r).toBeGreaterThanOrEqual(1.35);
    }
  });

  it('rotates paneB by π so the ray exits on the opposite side', () => {
    const points = toFloat32([
      [5, 0],
      [1.2, 0],
      [1.4, 0],
      [3, 0],
    ]);
    const { paneB } = splitPathAtThroat(points, 1);
    expect(paneB).not.toBeNull();
    // The exit point (1.4, 0) rotated by π becomes (-1.4, 0)
    expect(paneB![0]).toBeCloseTo(-1.4);
    expect(paneB![1]).toBeCloseTo(0);
  });

  it('returns null paneB when the ray enters but never exits the throat', () => {
    const points = toFloat32([
      [5, 0],
      [3, 0],
      [1, 0],
      [0.5, 0],
      [0.2, 0],
    ]);
    const { paneA, paneB } = splitPathAtThroat(points, 1);
    expect(paneA).not.toBeNull();
    expect(paneB).toBeNull();
  });

  it('renders full path in paneA when the ray starts inside the throat (traversal-test diagnostic)', () => {
    const points = toFloat32([
      [0, 0],
      [0.5, 0],
      [1, 0],
      [1.5, 0],
      [2, 0],
      [3, 0],
    ]);
    const { paneA, paneB } = splitPathAtThroat(points, 1);
    expect(paneA).not.toBeNull();
    expect(paneB).toBeNull();
    expect(paneA!.length).toBe(points.length);
  });

  it('honors a NaN sentinel in the input points', () => {
    const points = toFloat32([
      [5, 0],
      [4, 0],
      [3, 0],
      [1.2, 0],
      [1.4, 0],
      [2.0, 0],
      [3.0, 0],
      [NaN, NaN],
      [999, 999],
    ]);
    const { paneA, paneB } = splitPathAtThroat(points, 1);
    expect(paneA).not.toBeNull();
    expect(paneB).not.toBeNull();
    // The 999 point should not leak into paneB
    for (let i = 0; i < paneB!.length / 2; i++) {
      expect(paneB![i * 2]).not.toBe(999);
      expect(paneB![i * 2]).not.toBe(-999);
    }
  });
});
