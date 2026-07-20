export interface AlcubierreParams {
  v_s: number;
  R: number;
  sigma: number;
  center: [number, number];
  t: number;
}

export function shapeFunction(r_s: number, R: number, sigma: number): number {
  const num = Math.tanh(sigma * (r_s + R)) - Math.tanh(sigma * (r_s - R));
  const den = 2 * Math.tanh(sigma * R);
  return num / den;
}

export function shapeFunctionDerivative(r_s: number, R: number, sigma: number): number {
  const s1 = 1 / Math.cosh(sigma * (r_s + R));
  const s2 = 1 / Math.cosh(sigma * (r_s - R));
  const den = 2 * Math.tanh(sigma * R);
  return (sigma * (s1 * s1 - s2 * s2)) / den;
}

function radialDistance(x: number, y: number, p: AlcubierreParams): number {
  const dx = x - (p.center[0] + p.v_s * p.t);
  const dy = y - p.center[1];
  return Math.sqrt(dx * dx + dy * dy);
}

export function warpDisplacement(x: number, y: number, p: AlcubierreParams): number {
  const r_s = radialDistance(x, y, p);
  return shapeFunction(r_s, p.R, p.sigma) * p.v_s;
}

export function expansionScalar(x: number, y: number, p: AlcubierreParams): number {
  const r_s = radialDistance(x, y, p);
  if (r_s < 1e-9) return 0;
  const xs = p.center[0] + p.v_s * p.t;
  const dx = x - xs;
  const df = shapeFunctionDerivative(r_s, p.R, p.sigma);
  return (p.v_s * dx * df) / r_s;
}

export function stressEnergyDensity(x: number, y: number, p: AlcubierreParams): number {
  const r_s = radialDistance(x, y, p);
  if (r_s < 1e-9) return 0;
  const dy = y - p.center[1];
  const df = shapeFunctionDerivative(r_s, p.R, p.sigma);
  const rho_s = dy * dy;
  return -((p.v_s * p.v_s * rho_s) / (32 * Math.PI * r_s * r_s)) * df * df;
}

export function alcubierreMeshOffset(
  x: number,
  y: number,
  p: AlcubierreParams,
): { z: number; expansion: number; xOffset: number } {
  const r_s = radialDistance(x, y, p);
  const f = shapeFunction(r_s, p.R, p.sigma);
  const xs = p.center[0] + p.v_s * p.t;
  const dx = x - xs;
  const along = dx / (r_s + 1e-9);
  const compression = -p.v_s * f * along;
  const z = compression * 0.55;
  const shift = 0.9 * f * along;
  return {
    z,
    xOffset: -shift,
    expansion: expansionScalar(x, y, p),
  };
}

/**
 * Coordinate velocity of a comoving observer in the Alcubierre metric.
 * dx/dt = v_s · f(r_s), dy/dt = 0. Feeds the ship-as-geodesic integrator.
 */
export function comovingCoordinateVelocity(
  x: number,
  y: number,
  p: AlcubierreParams,
): { vx: number; vy: number } {
  const r_s = radialDistance(x, y, p);
  const f = shapeFunction(r_s, p.R, p.sigma);
  return { vx: p.v_s * f, vy: 0 };
}
