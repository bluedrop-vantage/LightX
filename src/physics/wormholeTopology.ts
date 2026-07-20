export interface SplitPath {
  paneA: Float32Array | null;
  paneB: Float32Array | null;
}

/**
 * Split a 2D geodesic path at the point where it enters the wormhole throat,
 * modeling the Morris–Thorne topology of "two asymptotic regions joined at r = b0".
 *
 * The pre-throat segment stays in the originating universe (pane A).
 * The post-throat segment is re-emitted in the destination universe (pane B),
 * rotated by π around mouth B so it visibly exits on the opposite side.
 *
 * A ray is considered to have "traversed" the throat if it enters the shell
 * r < b0 · throatMultiplier and later exits it.
 *
 * Rays that *start* inside the throat (r₀ < b0 · throatMultiplier) are a diagnostic
 * fan — e.g. the 200-ray traversal test emitted from the throat center — and are
 * rendered fully in pane A so their outward defocusing shape stays visible.
 */
export function splitPathAtThroat(
  points: Float32Array,
  b0: number,
  throatMultiplier = 1.35,
): SplitPath {
  const stepsPerRay = points.length / 2;
  const throatR = b0 * throatMultiplier;

  let lastValid = stepsPerRay;
  for (let i = 0; i < stepsPerRay; i++) {
    if (Number.isNaN(points[i * 2]) || Number.isNaN(points[i * 2 + 1])) {
      lastValid = i;
      break;
    }
  }
  if (lastValid < 2) return { paneA: null, paneB: null };

  const startR = Math.hypot(points[0], points[1]);
  if (startR < throatR) {
    const paneA = points.slice(0, lastValid * 2);
    return { paneA: paneA.length >= 4 ? paneA : null, paneB: null };
  }

  let entryIdx = -1;
  let exitIdx = -1;
  for (let i = 0; i < lastValid; i++) {
    const x = points[i * 2];
    const y = points[i * 2 + 1];
    const r = Math.hypot(x, y);
    if (entryIdx === -1) {
      if (r < throatR) entryIdx = i;
    } else if (exitIdx === -1) {
      if (r > throatR) exitIdx = i;
    }
  }

  if (entryIdx === -1) {
    return { paneA: points, paneB: null };
  }

  const paneA = points.slice(0, entryIdx * 2);

  if (exitIdx === -1 || exitIdx >= lastValid) {
    return { paneA: paneA.length >= 4 ? paneA : null, paneB: null };
  }

  const remaining = lastValid - exitIdx;
  const paneB = new Float32Array(remaining * 2);
  for (let i = 0; i < remaining; i++) {
    paneB[i * 2] = -points[(exitIdx + i) * 2];
    paneB[i * 2 + 1] = -points[(exitIdx + i) * 2 + 1];
  }

  return {
    paneA: paneA.length >= 4 ? paneA : null,
    paneB: paneB.length >= 4 ? paneB : null,
  };
}
