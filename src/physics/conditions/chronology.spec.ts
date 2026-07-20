import { describe, it, expect } from 'vitest';
import { chronologyHorizonForming, ctcFromCrossingWarps } from './chronology';
import { C } from '../constants';

describe('chronologyHorizonForming (mouth clocks)', () => {
  it('is false when |Δt| < Δx/c', () => {
    const a = { position: [0, 0] as [number, number], properTimeOffset: 0 };
    const b = { position: [C * 10, 0] as [number, number], properTimeOffset: 1 };
    expect(chronologyHorizonForming(a, b)).toBe(false);
  });
  it('is true when |Δt| > Δx/c', () => {
    const a = { position: [0, 0] as [number, number], properTimeOffset: 0 };
    const b = { position: [C, 0] as [number, number], properTimeOffset: 100 };
    expect(chronologyHorizonForming(a, b)).toBe(true);
  });
});

describe('ctcFromCrossingWarps', () => {
  it('is false when both bubbles are subluminal', () => {
    const a = { position: [0, 0] as [number, number], velocity: [C * 0.5, 0] as [number, number], bubbleRadius: 3 };
    const b = { position: [1, 0] as [number, number], velocity: [C * 0.5, 0] as [number, number], bubbleRadius: 3 };
    expect(ctcFromCrossingWarps(a, b)).toBe(false);
  });
  it('is true when two superluminal bubbles cross', () => {
    const a = { position: [0, 0] as [number, number], velocity: [C * 2, 0] as [number, number], bubbleRadius: 3 };
    const b = { position: [4, 0] as [number, number], velocity: [0, C * 2] as [number, number], bubbleRadius: 3 };
    expect(ctcFromCrossingWarps(a, b)).toBe(true);
  });
});
