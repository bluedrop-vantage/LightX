import * as THREE from 'three';

export type ConeTiltEvaluator = (x: number, y: number) => { tiltX: number; tiltY: number };

interface ConeInstance {
  root: THREE.Group;
  base: THREE.Mesh;
}

const HALF_ANGLE = Math.PI / 5;

export class LightConeLayer {
  readonly group: THREE.Group;
  private cones: ConeInstance[] = [];
  private cols = 5;
  private rows = 5;

  constructor(extent = 8) {
    this.group = new THREE.Group();
    this.group.visible = false;
    const coneGeom = new THREE.ConeGeometry(0.35, 0.6, 24, 1, true);
    coneGeom.translate(0, 0.3, 0);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x8affea,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const px = -extent + (2 * extent * (c + 0.5)) / this.cols;
        const py = -extent + (2 * extent * (r + 0.5)) / this.rows;
        const root = new THREE.Group();
        root.position.set(px, py, 0.4);
        const base = new THREE.Mesh(coneGeom.clone(), mat.clone());
        root.add(base);
        this.group.add(root);
        this.cones.push({ root, base });
      }
    }
    void HALF_ANGLE;
  }

  setVisible(v: boolean): void {
    this.group.visible = v;
  }

  update(tilt: ConeTiltEvaluator): void {
    if (!this.group.visible) return;
    for (const cone of this.cones) {
      const { tiltX, tiltY } = tilt(cone.root.position.x, cone.root.position.y);
      const rx = Math.max(-1.2, Math.min(1.2, tiltY));
      const ry = Math.max(-1.2, Math.min(1.2, -tiltX));
      cone.root.rotation.set(rx, ry, 0);
    }
  }

  dispose(): void {
    for (const c of this.cones) {
      (c.base.geometry as THREE.BufferGeometry).dispose();
      (c.base.material as THREE.Material).dispose();
    }
  }
}
