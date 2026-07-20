import * as THREE from 'three';

export interface GeodesicPath {
  points: Float32Array;
  color: number;
}

export class GeodesicLayer {
  readonly group: THREE.Group;
  private readonly maxRays: number;
  private readonly stepsPerRay: number;
  private lines: THREE.Line[] = [];
  private validCounts: number[] = [];
  private drawFraction = 1;

  constructor(maxRays = 32, stepsPerRay = 300) {
    this.maxRays = maxRays;
    this.stepsPerRay = stepsPerRay;
    this.group = new THREE.Group();
    for (let i = 0; i < maxRays; i++) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(stepsPerRay * 3), 3),
      );
      const mat = new THREE.LineBasicMaterial({
        color: 0xffe27a,
        transparent: true,
        opacity: 0.85,
      });
      const line = new THREE.Line(geom, mat);
      line.visible = false;
      this.lines.push(line);
      this.validCounts.push(0);
      this.group.add(line);
    }
  }

  setPaths(paths: GeodesicPath[]): void {
    for (let i = 0; i < this.maxRays; i++) {
      const line = this.lines[i];
      if (i >= paths.length) {
        line.visible = false;
        this.validCounts[i] = 0;
        continue;
      }
      const p = paths[i];
      const posAttr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const n = Math.min(this.stepsPerRay, p.points.length / 2);
      let validPoints = 0;
      for (let s = 0; s < n; s++) {
        const x = p.points[s * 2];
        const y = p.points[s * 2 + 1];
        if (Number.isNaN(x) || Number.isNaN(y)) {
          for (let j = s; j < this.stepsPerRay; j++) {
            arr[j * 3] = arr[(s > 0 ? s - 1 : 0) * 3];
            arr[j * 3 + 1] = arr[(s > 0 ? s - 1 : 0) * 3 + 1];
            arr[j * 3 + 2] = 0.3;
          }
          break;
        }
        arr[s * 3] = x;
        arr[s * 3 + 1] = y;
        arr[s * 3 + 2] = 0.3;
        validPoints = s + 1;
      }
      for (let s = validPoints; s < this.stepsPerRay; s++) {
        arr[s * 3] = arr[(validPoints > 0 ? validPoints - 1 : 0) * 3];
        arr[s * 3 + 1] = arr[(validPoints > 0 ? validPoints - 1 : 0) * 3 + 1];
        arr[s * 3 + 2] = 0.3;
      }
      posAttr.needsUpdate = true;
      (line.material as THREE.LineBasicMaterial).color.setHex(p.color);
      line.visible = true;
      this.validCounts[i] = validPoints;
      this.applyDrawRange(i);
    }
  }

  setDrawFraction(fraction: number): void {
    this.drawFraction = Math.max(0, Math.min(1, fraction));
    for (let i = 0; i < this.maxRays; i++) {
      if (this.lines[i].visible) this.applyDrawRange(i);
    }
  }

  private applyDrawRange(i: number): void {
    const valid = this.validCounts[i];
    if (valid === 0) return;
    const shown = Math.max(2, Math.round(valid * this.drawFraction));
    this.lines[i].geometry.setDrawRange(0, shown);
  }

  clear(): void {
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].visible = false;
      this.validCounts[i] = 0;
    }
  }

  dispose(): void {
    for (const l of this.lines) {
      l.geometry.dispose();
      (l.material as THREE.Material).dispose();
    }
  }
}
