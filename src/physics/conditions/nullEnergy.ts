import type { Vec2 } from '../../types/domain';

export interface NullEnergyResult {
  pass: boolean;
  violators: Vec2[];
  minDensity: number;
}

export function nullEnergyCondition(
  densityAt: (x: number, y: number) => number,
  samples: Vec2[],
): NullEnergyResult {
  const violators: Vec2[] = [];
  let minDensity = Number.POSITIVE_INFINITY;
  for (const s of samples) {
    const rho = densityAt(s.x, s.y);
    if (rho < minDensity) minDensity = rho;
    if (rho < 0) violators.push(s);
  }
  return {
    pass: violators.length === 0,
    violators,
    minDensity: Number.isFinite(minDensity) ? minDensity : 0,
  };
}

export function ringSamples(
  center: Vec2,
  radius: number,
  count: number,
): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2;
    out.push({
      x: center.x + Math.cos(theta) * radius,
      y: center.y + Math.sin(theta) * radius,
    });
  }
  return out;
}
