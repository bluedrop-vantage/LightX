import * as THREE from 'three';
import { embeddingZ } from '../physics/metrics/morrisThorne';

export class EmbeddingDiagram {
  readonly group: THREE.Group;
  private geometry: THREE.BufferGeometry;
  private mesh: THREE.Mesh;
  private wireMesh: THREE.LineSegments;
  private radialSegments = 96;
  private ringSegments = 40;
  private rMax = 8;

  constructor() {
    this.group = new THREE.Group();
    this.geometry = new THREE.BufferGeometry();
    this.buildGeometry(1);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x2a4666,
      metalness: 0.2,
      roughness: 0.75,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      flatShading: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, mat);
    this.group.add(this.mesh);

    const wireGeom = new THREE.WireframeGeometry(this.geometry);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x6cc4ff, transparent: true, opacity: 0.35 });
    this.wireMesh = new THREE.LineSegments(wireGeom, wireMat);
    this.group.add(this.wireMesh);
  }

  private buildGeometry(b0: number): void {
    const rings = this.ringSegments;
    const radial = this.radialSegments;
    const positions: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= rings; i++) {
      const t = i / rings;
      const r = b0 + (this.rMax - b0) * (t * t);
      const zAbs = embeddingZ(r, b0);
      const sheet = i / rings < 0.5 ? -1 : 1;
      const z = sheet * zAbs;
      for (let j = 0; j <= radial; j++) {
        const theta = (j / radial) * Math.PI * 2;
        positions.push(Math.cos(theta) * r, Math.sin(theta) * r, z);
      }
    }
    for (let i = 0; i < rings; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * (radial + 1) + j;
        const b = a + radial + 1;
        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }
    this.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    );
    this.geometry.setIndex(indices);
    this.geometry.computeVertexNormals();
  }

  updateThroat(b0: number): void {
    this.buildGeometry(b0);
    (this.wireMesh.geometry as THREE.WireframeGeometry).dispose();
    const wireGeom = new THREE.WireframeGeometry(this.geometry);
    this.wireMesh.geometry = wireGeom;
  }

  dispose(): void {
    this.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    (this.wireMesh.geometry as THREE.WireframeGeometry).dispose();
    (this.wireMesh.material as THREE.Material).dispose();
  }
}
