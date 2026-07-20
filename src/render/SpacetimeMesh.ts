import * as THREE from 'three';

const CONTRACT_COLOR = new THREE.Color(0x4aa3ff);
const EXPAND_COLOR = new THREE.Color(0xff5a4a);
const FLAT_COLOR = new THREE.Color(0x21313f);

export type MeshEvaluator = (
  x: number,
  y: number,
) => { z: number; expansion: number; xOffset?: number; yOffset?: number };

export class SpacetimeMesh {
  readonly group: THREE.Group;
  readonly mesh: THREE.LineSegments;
  private cols: number;
  private rows: number;
  private baseX: Float32Array;
  private baseY: Float32Array;
  private baseZ: Float32Array;

  constructor(width: number, height: number, resolution = 48) {
    this.cols = resolution;
    this.rows = resolution;

    const positions: number[] = [];
    const colors: number[] = [];

    const stepX = width / (this.cols - 1);
    const stepY = height / (this.rows - 1);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 1; c++) {
        const x0 = -width / 2 + c * stepX;
        const x1 = -width / 2 + (c + 1) * stepX;
        const y = -height / 2 + r * stepY;
        positions.push(x0, y, 0, x1, y, 0);
        colors.push(0, 0, 0, 0, 0, 0);
      }
    }
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows - 1; r++) {
        const x = -width / 2 + c * stepX;
        const y0 = -height / 2 + r * stepY;
        const y1 = -height / 2 + (r + 1) * stepY;
        positions.push(x, y0, 0, x, y1, 0);
        colors.push(0, 0, 0, 0, 0, 0);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    this.mesh = new THREE.LineSegments(geometry, material);
    this.group = new THREE.Group();
    this.group.add(this.mesh);

    const posAttr = geometry.getAttribute('position');
    this.baseX = new Float32Array(posAttr.count);
    this.baseY = new Float32Array(posAttr.count);
    this.baseZ = new Float32Array(posAttr.count);
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < posAttr.count; i++) {
      this.baseX[i] = arr[i * 3];
      this.baseY[i] = arr[i * 3 + 1];
      this.baseZ[i] = arr[i * 3 + 2];
    }
  }

  update(evaluator: MeshEvaluator): void {
    const posAttr = this.mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorAttr = this.mesh.geometry.getAttribute('color') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const cArr = colorAttr.array as Float32Array;
    const tmp = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      const bx = this.baseX[i];
      const by = this.baseY[i];
      const { z, expansion, xOffset = 0, yOffset = 0 } = evaluator(bx, by);
      arr[i * 3] = bx + xOffset;
      arr[i * 3 + 1] = by + yOffset;
      arr[i * 3 + 2] = z + this.baseZ[i];

      const e = Math.max(-1, Math.min(1, expansion * 1.4));
      if (e > 0) {
        tmp.copy(FLAT_COLOR).lerp(EXPAND_COLOR, e);
      } else {
        tmp.copy(FLAT_COLOR).lerp(CONTRACT_COLOR, -e);
      }
      cArr[i * 3] = tmp.r;
      cArr[i * 3 + 1] = tmp.g;
      cArr[i * 3 + 2] = tmp.b;
    }
    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  }

  resize(_width: number, _height: number): void {
    // reserved for future dynamic re-tessellation
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
