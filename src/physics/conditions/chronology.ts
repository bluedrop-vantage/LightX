import { C } from '../constants';

export interface WormholeMouthState {
  position: [number, number];
  properTimeOffset: number;
}

export function chronologyHorizonForming(
  a: WormholeMouthState,
  b: WormholeMouthState,
): boolean {
  const dx = b.position[0] - a.position[0];
  const dy = b.position[1] - a.position[1];
  const spatial = Math.sqrt(dx * dx + dy * dy);
  const lightTravel = spatial / C;
  return Math.abs(b.properTimeOffset - a.properTimeOffset) > lightTravel;
}

export interface WarpState {
  position: [number, number];
  velocity: [number, number];
  bubbleRadius: number;
}

export function ctcFromCrossingWarps(a: WarpState, b: WarpState): boolean {
  const speedA = Math.hypot(a.velocity[0], a.velocity[1]);
  const speedB = Math.hypot(b.velocity[0], b.velocity[1]);
  if (speedA <= C && speedB <= C) return false;
  const dx = b.position[0] - a.position[0];
  const dy = b.position[1] - a.position[1];
  const separation = Math.hypot(dx, dy);
  return separation < a.bubbleRadius + b.bubbleRadius;
}
