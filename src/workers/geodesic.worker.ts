import * as Comlink from 'comlink';
import type {
  GeodesicApi,
  GeodesicRequest,
  GeodesicResponse,
  Ray,
  HyperspaceParams,
  PaintedFieldParams,
} from './geodesicApi';
import type { AlcubierreParams } from '../physics/metrics/alcubierre';
import { shapeFunction } from '../physics/metrics/alcubierre';
import type { MorrisThorneParams } from '../physics/metrics/morrisThorne';
import type { KrasnikovParams } from '../physics/metrics/krasnikov';
import { krasnikovProfile } from '../physics/metrics/krasnikov';

interface Force {
  ax: number;
  ay: number;
  bulkVx: number;
  bulkVy: number;
}

function alcubierreForce(x: number, y: number, p: AlcubierreParams, t: number): Force {
  const xs = p.center[0] + p.v_s * t;
  const dx = x - xs;
  const dy = y - p.center[1];
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r < 1e-6) {
    return { ax: 0, ay: 0, bulkVx: p.v_s, bulkVy: 0 };
  }
  const f = shapeFunction(r, p.R, p.sigma);
  const bulkVx = p.v_s * f;
  const eps = 0.05;
  const fx1 = shapeFunction(Math.sqrt((dx + eps) ** 2 + dy ** 2), p.R, p.sigma);
  const fx0 = shapeFunction(Math.sqrt((dx - eps) ** 2 + dy ** 2), p.R, p.sigma);
  const fy1 = shapeFunction(Math.sqrt(dx ** 2 + (dy + eps) ** 2), p.R, p.sigma);
  const fy0 = shapeFunction(Math.sqrt(dx ** 2 + (dy - eps) ** 2), p.R, p.sigma);
  const gradFx = (fx1 - fx0) / (2 * eps);
  const gradFy = (fy1 - fy0) / (2 * eps);
  const strength = 4.0;
  return {
    ax: -strength * p.v_s * gradFx,
    ay: -strength * p.v_s * gradFy,
    bulkVx,
    bulkVy: 0,
  };
}

function morrisThorneForce(x: number, y: number, p: MorrisThorneParams): Force {
  const dx = x - p.center[0];
  const dy = y - p.center[1];
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r < 1e-6) return { ax: 0, ay: 0, bulkVx: 0, bulkVy: 0 };
  const b0 = p.b0;
  const outward = r < b0 ? 1 : b0 * b0 / (r * r * r + 1e-6);
  const strength = 2.5;
  return {
    ax: strength * outward * (dx / r),
    ay: strength * outward * (dy / r),
    bulkVx: 0,
    bulkVy: 0,
  };
}

function positiveMassForce(x: number, y: number, center: [number, number], mass: number): Force {
  const dx = center[0] - x;
  const dy = center[1] - y;
  const r2 = dx * dx + dy * dy + 0.5;
  const inv = mass / (r2 * Math.sqrt(r2));
  return { ax: dx * inv, ay: dy * inv, bulkVx: 0, bulkVy: 0 };
}

function krasnikovForce(x: number, y: number, p: KrasnikovParams, t: number): Force {
  const params: KrasnikovParams = { ...p, t };
  const eps = 0.05;
  const p0 = krasnikovProfile(x, y, params);
  const px1 = krasnikovProfile(x + eps, y, params);
  const py1 = krasnikovProfile(x, y + eps, params);
  const gradX = (px1 - p0) / eps;
  const gradY = (py1 - p0) / eps;
  const rx = p.routeEnd[0] - p.routeStart[0];
  const ry = p.routeEnd[1] - p.routeStart[1];
  const L = Math.hypot(rx, ry) + 1e-9;
  const strength = 3.0;
  return {
    ax: -strength * gradX * 2,
    ay: -strength * gradY * 2,
    bulkVx: (rx / L) * p.v_s * p0,
    bulkVy: (ry / L) * p.v_s * p0,
  };
}

/**
 * Force from a painted energy field. Mirrors FieldBrush.gradientZ so ray-tracing
 * and ship-motion see the same potential. Positive-intensity samples pull rays in
 * (gravitational lensing); negative-intensity samples deflect rays outward
 * (defocusing — spec's central claim about negative energy).
 */
function paintedFieldForce(x: number, y: number, p: PaintedFieldParams): Force {
  let gx = 0;
  let gy = 0;
  for (const s of p.samples) {
    const dx = x - s.x;
    const dy = y - s.y;
    const r2 = dx * dx + dy * dy;
    const w2 = s.radius * s.radius;
    const gauss = Math.exp(-r2 / w2);
    const coeff = -s.intensity * 0.5 * gauss * (-2 / w2);
    gx += coeff * dx;
    gy += coeff * dy;
  }
  const scale = p.forceScale ?? 6;
  return { ax: -gx * scale, ay: -gy * scale, bulkVx: 0, bulkVy: 0 };
}

function hyperspaceForce(x: number, y: number, p: HyperspaceParams): Force {
  const dx = x - p.center[0];
  const dy = y - p.center[1];
  const r2 = dx * dx + dy * dy;
  const swirl = Math.exp(-r2 / (p.aperture * p.aperture * 3));
  const strength = 4.5;
  return {
    ax: strength * swirl * (-dx),
    ay: strength * swirl * (-dy),
    bulkVx: -dy * swirl * 0.6,
    bulkVy: dx * swirl * 0.6,
  };
}

function forceFor(kind: string, params: unknown, x: number, y: number, t: number): Force {
  switch (kind) {
    case 'alcubierre':
      return alcubierreForce(x, y, { ...(params as AlcubierreParams), t }, t);
    case 'morrisThorne':
      return morrisThorneForce(x, y, params as MorrisThorneParams);
    case 'krasnikov':
      return krasnikovForce(x, y, params as KrasnikovParams, t);
    case 'hyperspace':
      return hyperspaceForce(x, y, params as HyperspaceParams);
    case 'paintedField':
      return paintedFieldForce(x, y, params as PaintedFieldParams);
    case 'positiveMass': {
      const p = params as { center: [number, number]; mass: number };
      return positiveMassForce(x, y, p.center, p.mass);
    }
    default:
      return { ax: 0, ay: 0, bulkVx: 0, bulkVy: 0 };
  }
}

function stepRk4(
  kind: string,
  params: unknown,
  r: Ray,
  t: number,
  dt: number,
): { r: Ray; alive: boolean } {
  const speed = Math.hypot(r.vx, r.vy);
  const normalize = r.kind === 'null' && speed > 0 ? 1 / speed : 1;

  const k1 = deriv(kind, params, r.x, r.y, r.vx, r.vy, t);
  const k2 = deriv(
    kind,
    params,
    r.x + 0.5 * dt * k1.vx,
    r.y + 0.5 * dt * k1.vy,
    r.vx + 0.5 * dt * k1.ax,
    r.vy + 0.5 * dt * k1.ay,
    t + 0.5 * dt,
  );
  const k3 = deriv(
    kind,
    params,
    r.x + 0.5 * dt * k2.vx,
    r.y + 0.5 * dt * k2.vy,
    r.vx + 0.5 * dt * k2.ax,
    r.vy + 0.5 * dt * k2.ay,
    t + 0.5 * dt,
  );
  const k4 = deriv(
    kind,
    params,
    r.x + dt * k3.vx,
    r.y + dt * k3.vy,
    r.vx + dt * k3.ax,
    r.vy + dt * k3.ay,
    t + dt,
  );

  const nx = r.x + (dt / 6) * (k1.vx + 2 * k2.vx + 2 * k3.vx + k4.vx);
  const ny = r.y + (dt / 6) * (k1.vy + 2 * k2.vy + 2 * k3.vy + k4.vy);
  let nvx = r.vx + (dt / 6) * (k1.ax + 2 * k2.ax + 2 * k3.ax + k4.ax);
  let nvy = r.vy + (dt / 6) * (k1.ay + 2 * k2.ay + 2 * k3.ay + k4.ay);

  if (r.kind === 'null') {
    const s = Math.hypot(nvx, nvy);
    if (s > 0) {
      nvx = (nvx / s) / normalize;
      nvy = (nvy / s) / normalize;
    }
  }

  const alive = Math.abs(nx) < 30 && Math.abs(ny) < 30;
  return { r: { x: nx, y: ny, vx: nvx, vy: nvy, kind: r.kind }, alive };
}

function deriv(
  kind: string,
  params: unknown,
  x: number,
  y: number,
  vx: number,
  vy: number,
  t: number,
): { vx: number; vy: number; ax: number; ay: number } {
  const f = forceFor(kind, params, x, y, t);
  return {
    vx: vx + f.bulkVx,
    vy: vy + f.bulkVy,
    ax: f.ax,
    ay: f.ay,
  };
}

const api: GeodesicApi = {
  async integrate(req: GeodesicRequest): Promise<GeodesicResponse> {
    const paths: Float32Array[] = [];
    const finalRays: Ray[] = [];
    for (const initial of req.rays) {
      const buf = new Float32Array(req.steps * 2);
      let r = { ...initial };
      let t = 0;
      let stored = 0;
      let alive = true;
      for (let i = 0; i < req.steps; i++) {
        buf[i * 2] = r.x;
        buf[i * 2 + 1] = r.y;
        stored = i + 1;
        if (!alive) {
          for (let j = i * 2 + 2; j < buf.length; j++) buf[j] = NaN;
          break;
        }
        const step = stepRk4(req.metricKind, req.metricParams, r, t, req.dt);
        r = step.r;
        alive = step.alive;
        t += req.dt;
      }
      if (stored < req.steps) {
        for (let j = stored * 2; j < buf.length; j++) buf[j] = NaN;
      }
      paths.push(buf);
      finalRays.push(r);
    }
    return { paths, finalRays };
  },
};

Comlink.expose(api);
