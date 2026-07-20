export interface KrasnikovParams {
  routeStart: [number, number];
  routeEnd: [number, number];
  tubeWidth: number;
  v_s: number;
  t: number;
}

function projectToRoute(x: number, y: number, p: KrasnikovParams) {
  const rx = p.routeEnd[0] - p.routeStart[0];
  const ry = p.routeEnd[1] - p.routeStart[1];
  const L2 = rx * rx + ry * ry + 1e-9;
  const t = ((x - p.routeStart[0]) * rx + (y - p.routeStart[1]) * ry) / L2;
  const clamped = Math.max(0, Math.min(1, t));
  const px = p.routeStart[0] + clamped * rx;
  const py = p.routeStart[1] + clamped * ry;
  const perp = Math.hypot(x - px, y - py);
  const along = clamped * Math.sqrt(L2);
  return { perp, along, routeLength: Math.sqrt(L2) };
}

export function krasnikovProfile(x: number, y: number, p: KrasnikovParams): number {
  const { perp, along, routeLength } = projectToRoute(x, y, p);
  const width = Math.max(0.15, p.tubeWidth);
  const perpAttenuation = Math.exp(-(perp * perp) / (width * width));
  const wavefront = p.v_s * p.t;
  const alongAttenuation = along < wavefront ? 1 : Math.exp(-((along - wavefront) ** 2) / 1.5);
  const endTaper = along > routeLength ? Math.exp(-((along - routeLength) ** 2)) : 1;
  return perpAttenuation * alongAttenuation * endTaper;
}

export function krasnikovMeshOffset(
  x: number,
  y: number,
  p: KrasnikovParams,
): { z: number; expansion: number } {
  const intensity = krasnikovProfile(x, y, p);
  return {
    z: intensity * 0.9,
    expansion: intensity * 0.7,
  };
}

export function krasnikovStressDensity(x: number, y: number, p: KrasnikovParams): number {
  return -krasnikovProfile(x, y, p);
}
