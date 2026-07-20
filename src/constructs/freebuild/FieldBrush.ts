export interface FieldSample {
  x: number;
  y: number;
  intensity: number;
  radius: number;
}

export type BrushMode = 'positive' | 'negative';

export class FieldBrush {
  private samples: FieldSample[] = [];

  paint(x: number, y: number, mode: BrushMode, radius: number, strength: number): void {
    this.samples.push({
      x,
      y,
      intensity: mode === 'negative' ? -strength : strength,
      radius,
    });
    if (this.samples.length > 400) {
      this.samples.splice(0, this.samples.length - 400);
    }
  }

  clear(): void {
    this.samples = [];
  }

  size(): number {
    return this.samples.length;
  }

  totalPositive(): number {
    return this.samples.reduce((s, p) => s + (p.intensity > 0 ? p.intensity : 0), 0);
  }

  totalNegative(): number {
    return this.samples.reduce((s, p) => s + (p.intensity < 0 ? Math.abs(p.intensity) : 0), 0);
  }

  evaluate(x: number, y: number): { z: number; expansion: number } {
    let z = 0;
    let expansion = 0;
    for (const s of this.samples) {
      const dx = x - s.x;
      const dy = y - s.y;
      const r2 = dx * dx + dy * dy;
      const gauss = Math.exp(-r2 / (s.radius * s.radius));
      z += -s.intensity * 0.5 * gauss;
      expansion += Math.sign(s.intensity) * 0.5 * gauss;
    }
    return { z, expansion };
  }

  /**
   * Gradient of the z potential at (x, y). Positive intensity (matter) makes a well,
   * so ∇z points outward from wells → -∇z accelerates the ship toward mass. Negative
   * intensity (exotic energy) makes a bump → -∇z pushes the ship away. Physically honest.
   */
  gradientZ(x: number, y: number): { gx: number; gy: number } {
    let gx = 0;
    let gy = 0;
    for (const s of this.samples) {
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

  serialize(): FieldSample[] {
    return this.samples.slice();
  }
}
