import { HBAR, C } from '../constants';

export function fordRomanBound(tau: number): number {
  if (tau <= 0) return Number.POSITIVE_INFINITY;
  return (3 * HBAR) / (32 * Math.PI * Math.PI * Math.pow(tau, 4) * Math.pow(C, -3));
}

export function fordRomanRatio(rhoNegPeak: number, sustainedFor: number): number {
  const bound = fordRomanBound(sustainedFor);
  if (!Number.isFinite(bound) || bound === 0) return 0;
  return Math.abs(rhoNegPeak) / bound;
}
