import type { IngredientPlacement } from '../../types/domain';
import { getIngredient } from '../../pantry/ingredients';
import type { FieldSample } from './FieldBrush';

/**
 * Convert Energy-Source-Rack placements into synthetic FieldBrush samples so
 * that a dropped pantry ingredient contributes a visible bump / well to the
 * mesh + drives ship motion + bends rays the same way brush strokes do.
 *
 * Placement position is arbitrarily chosen — we distribute contributing items
 * on a small circle around the origin so multiple placements are visually
 * distinguishable. Topological items (Hyperspace Permit) have no gravitational
 * effect and are skipped.
 *
 * Sign convention (matches FieldBrush.paint):
 *   attractive gravity → intensity > 0  → z dips downward (well; ship falls in, rays lens toward it).
 *   repulsive gravity  → intensity < 0  → z bumps upward (bump; ship deflects, rays defocus).
 */
export function rackToSamples(placements: readonly IngredientPlacement[]): FieldSample[] {
  const contributing = placements.filter((p) => {
    const def = getIngredient(p.ingredient);
    return def.gravity !== 'none';
  });
  const N = contributing.length;
  const orbitR = N > 1 ? 3 : 0;
  const radius = 1.8;
  return contributing.map((p, i) => {
    const def = getIngredient(p.ingredient);
    const theta = (i / N) * Math.PI * 2;
    const signedIntensity =
      (def.gravity === 'attractive' ? 1 : -1) * Math.max(0.2, p.amount) * 0.8;
    return {
      x: Math.cos(theta) * orbitR,
      y: Math.sin(theta) * orbitR,
      intensity: signedIntensity,
      radius,
    };
  });
}

/** Field contribution at (x, y) from a set of samples (matches FieldBrush.evaluate). */
export function samplesEvaluate(
  samples: readonly FieldSample[],
  x: number,
  y: number,
): { z: number; expansion: number } {
  let z = 0;
  let expansion = 0;
  for (const s of samples) {
    const dx = x - s.x;
    const dy = y - s.y;
    const r2 = dx * dx + dy * dy;
    const gauss = Math.exp(-r2 / (s.radius * s.radius));
    z += -s.intensity * 0.5 * gauss;
    expansion += Math.sign(s.intensity) * 0.5 * gauss;
  }
  return { z, expansion };
}

/** ∇z at (x, y) from a set of samples (matches FieldBrush.gradientZ). */
export function samplesGradientZ(
  samples: readonly FieldSample[],
  x: number,
  y: number,
): { gx: number; gy: number } {
  let gx = 0;
  let gy = 0;
  for (const s of samples) {
    const dx = x - s.x;
    const dy = y - s.y;
    const r2 = dx * dx + dy * dy;
    const w2 = s.radius * s.radius;
    const gauss = Math.exp(-r2 / w2);
    const coeff = -s.intensity * 0.5 * gauss * (-2 / w2);
    gx += coeff * dx;
    gy += coeff * dy;
  }
  return { gx, gy };
}
