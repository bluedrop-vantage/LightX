import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EmbeddingDiagram } from './EmbeddingDiagram';
import { embeddingZ } from '../physics/metrics/morrisThorne';
import type { GeodesicPath } from './GeodesicLayer';
import { createShipMesh, disposeShipMesh } from './ShipMesh';

interface Props {
  b0: number;
  rays?: GeodesicPath[];
  traversalPhaseRef?: React.MutableRefObject<number>;
}

const MAX_R = 8;

function projectPathToFunnel(points: Float32Array, b0: number): Float32Array | null {
  const total = points.length / 2;
  if (total === 0) return null;
  const out = new Float32Array(total * 3);
  let written = 0;
  for (let i = 0; i < total; i++) {
    const x = points[i * 2];
    const y = points[i * 2 + 1];
    if (Number.isNaN(x) || Number.isNaN(y)) break;
    const r = Math.hypot(x, y);
    if (r > MAX_R * 1.05) continue;
    const rClamped = Math.max(b0, Math.min(MAX_R, r));
    const z = embeddingZ(rClamped, b0);
    out[written * 3] = x;
    out[written * 3 + 1] = y;
    out[written * 3 + 2] = z + 0.04;
    written++;
  }
  if (written < 2) return null;
  return out.slice(0, written * 3);
}

/**
 * Phase 0 → 1 maps to descend-upper → traverse-throat → ascend-lower.
 * Entry sits at θ=0 on the upper sheet; exit sits at θ=π on the lower sheet,
 * so the ship visibly emerges on the "far side" of the diagram.
 */
function shipPositionOnFunnel(phase: number, b0: number): THREE.Vector3 {
  const clamped = Math.max(0, Math.min(1, phase));
  const descendEnd = 0.4;
  const traverseEnd = 0.6;
  const startR = MAX_R * 0.7;
  const lift = 0.55;

  if (clamped < descendEnd) {
    const t = clamped / descendEnd;
    const r = startR - (startR - b0) * t;
    const z = embeddingZ(r, b0) + lift;
    return new THREE.Vector3(r, 0, z);
  }

  if (clamped < traverseEnd) {
    const t = (clamped - descendEnd) / (traverseEnd - descendEnd);
    const theta = t * Math.PI;
    const x = Math.cos(theta) * b0;
    const y = Math.sin(theta) * b0;
    const zTop = lift;
    const zBottom = -lift;
    const z = zTop + (zBottom - zTop) * t;
    return new THREE.Vector3(x, y, z);
  }

  const t = (clamped - traverseEnd) / (1 - traverseEnd);
  const r = b0 + (startR - b0) * t;
  const z = -embeddingZ(r, b0) - lift;
  return new THREE.Vector3(-r, 0, z);
}

export function EmbeddingView({ b0, rays, traversalPhaseRef }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rayGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080d17);

    const rect = host.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 200);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(6, 10, 6);
    scene.add(key);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const diagram = new EmbeddingDiagram();
    scene.add(diagram.group);
    diagram.updateThroat(b0);

    const ship = createShipMesh({ scale: 1.5, lit: true });
    ship.renderOrder = 10;
    ship.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => (m.depthTest = false));
        } else if (mesh.material) {
          (mesh.material as THREE.Material).depthTest = false;
        }
      }
    });
    ship.position.copy(shipPositionOnFunnel(traversalPhaseRef?.current ?? 0, b0));
    scene.add(ship);

    const trailGeom = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(80 * 3);
    trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xffe27a,
      transparent: true,
      opacity: 0.7,
      depthTest: false,
    });
    const trail = new THREE.Line(trailGeom, trailMat);
    trail.renderOrder = 9;
    scene.add(trail);
    for (let i = 0; i <= 40; i++) {
      const p = shipPositionOnFunnel(i / 40, b0);
      trailPositions[i * 3] = p.x;
      trailPositions[i * 3 + 1] = p.y;
      trailPositions[i * 3 + 2] = p.z;
    }
    trailGeom.setDrawRange(0, 41);
    trailGeom.attributes.position.needsUpdate = true;

    const rayGroup = new THREE.Group();
    scene.add(rayGroup);
    rayGroupRef.current = rayGroup;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(rect.width, rect.height, false);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    let raf = 0;
    let angle = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      angle += dt * 0.35;
      camera.position.set(Math.cos(angle) * 16, 8, Math.sin(angle) * 16);
      camera.lookAt(0, 0, 0);
      const phase = traversalPhaseRef?.current ?? 0;
      const pos = shipPositionOnFunnel(phase, b0);
      ship.position.copy(pos);
      const lookAhead = shipPositionOnFunnel(Math.min(1, phase + 0.02), b0);
      ship.lookAt(lookAhead);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    });
    ro.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      for (const child of [...rayGroup.children]) {
        rayGroup.remove(child);
        if ((child as THREE.Line).geometry) (child as THREE.Line).geometry.dispose();
        if ((child as THREE.Line).material) ((child as THREE.Line).material as THREE.Material).dispose();
      }
      rayGroupRef.current = null;
      diagram.dispose();
      disposeShipMesh(ship);
      trailGeom.dispose();
      trailMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [b0, traversalPhaseRef]);

  useEffect(() => {
    const group = rayGroupRef.current;
    if (!group) return;
    for (const child of [...group.children]) {
      group.remove(child);
      if ((child as THREE.Line).geometry) (child as THREE.Line).geometry.dispose();
      if ((child as THREE.Line).material) ((child as THREE.Line).material as THREE.Material).dispose();
    }
    if (!rays) return;
    for (const path of rays) {
      const projected = projectPathToFunnel(path.points, b0);
      if (!projected) continue;
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(projected, 3));
      const mat = new THREE.LineBasicMaterial({
        color: path.color,
        transparent: true,
        opacity: 0.9,
      });
      group.add(new THREE.Line(geom, mat));
    }
  }, [rays, b0]);

  return <div ref={hostRef} className="embedding-view" />;
}
