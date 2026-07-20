export interface MorrisThorneParams {
  b0: number;
  center: [number, number];
  phiCoefficients: number[];
}

export function shapeB(r: number, b0: number): number {
  if (r < b0) return b0;
  return (b0 * b0) / r;
}

export function shapeBDerivative(r: number, b0: number): number {
  if (r < b0) return 0;
  return -(b0 * b0) / (r * r);
}

export function flareOutSatisfied(p: MorrisThorneParams): boolean {
  const bPrime = shapeBDerivative(p.b0 + 1e-9, p.b0);
  return bPrime < 1;
}

export function redshiftPhi(r: number, coeffs: number[]): number {
  let phi = 0;
  let term = 1;
  const invR = 1 / r;
  for (const c of coeffs) {
    phi += c * term;
    term *= invR;
  }
  return phi;
}

export function throatDisplacement(x: number, y: number, p: MorrisThorneParams): number {
  const dx = x - p.center[0];
  const dy = y - p.center[1];
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r < 1e-6) return -p.b0;
  if (r < p.b0) {
    const t = r / p.b0;
    return -p.b0 * Math.sqrt(1 - t * t);
  }
  const z = p.b0 * Math.log((r + Math.sqrt(r * r - p.b0 * p.b0)) / p.b0);
  return -p.b0 + (z - p.b0);
}

export function embeddingZ(r: number, b0: number): number {
  if (r <= b0) return 0;
  return b0 * Math.acosh(r / b0);
}
