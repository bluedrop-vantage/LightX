import * as THREE from 'three';

export interface ShipMeshOptions {
  /** Overall body tint. Default: near-white. */
  primaryColor?: number;
  /** Accent tint applied to the cockpit dome + fin tips. Default: cool blue. */
  accentColor?: number;
  /** Engine glow tint. Default: warm cyan (matches negative-energy branding). */
  engineColor?: number;
  /**
   * If `lit`, use MeshStandardMaterial that responds to scene lights (for the 3D embedding).
   * Otherwise use MeshBasicMaterial with emissive tint (for the 2D top-down ortho view).
   */
  lit?: boolean;
  /** Uniform scale factor. Default: 1. */
  scale?: number;
}

/**
 * Build a procedural spacecraft mesh:
 *   nose cone → fuselage cylinder → two swept-back fins → engine ring w/ glow.
 * Aligned so the nose points along +X; the whole ship sits centered at its origin.
 * Returns a THREE.Group whose materials + geometries can be disposed via `disposeShipMesh`.
 */
export function createShipMesh(options: ShipMeshOptions = {}): THREE.Group {
  const primary = options.primaryColor ?? 0xf1f4f8;
  const accent = options.accentColor ?? 0x6cc4ff;
  const engine = options.engineColor ?? 0x8affea;
  const scale = options.scale ?? 1;
  const lit = options.lit ?? true;

  const bodyMat = lit
    ? new THREE.MeshStandardMaterial({
        color: primary,
        metalness: 0.55,
        roughness: 0.35,
        emissive: 0x101820,
      })
    : new THREE.MeshBasicMaterial({ color: primary });

  const cockpitMat = lit
    ? new THREE.MeshStandardMaterial({
        color: accent,
        metalness: 0.7,
        roughness: 0.1,
        emissive: 0x0a3a5a,
        emissiveIntensity: 0.85,
      })
    : new THREE.MeshBasicMaterial({ color: accent });

  const finMat = lit
    ? new THREE.MeshStandardMaterial({
        color: primary,
        metalness: 0.35,
        roughness: 0.6,
      })
    : new THREE.MeshBasicMaterial({ color: 0xcfd6dd });

  const engineHousingMat = lit
    ? new THREE.MeshStandardMaterial({
        color: 0x2a2f38,
        metalness: 0.85,
        roughness: 0.25,
      })
    : new THREE.MeshBasicMaterial({ color: 0x2a2f38 });

  const engineGlowMat = new THREE.MeshBasicMaterial({
    color: engine,
    transparent: true,
    opacity: 0.9,
  });

  const group = new THREE.Group();

  const fuselage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.7, 20),
    bodyMat,
  );
  fuselage.rotation.z = Math.PI / 2;
  fuselage.position.x = -0.05;
  group.add(fuselage);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 20), bodyMat);
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = 0.5;
  group.add(nose);

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    cockpitMat,
  );
  cockpit.position.set(0.18, 0, 0.11);
  group.add(cockpit);

  const finGeom = new THREE.BoxGeometry(0.28, 0.02, 0.22);
  const finLeft = new THREE.Mesh(finGeom, finMat);
  finLeft.position.set(-0.25, -0.18, 0);
  finLeft.rotation.z = Math.PI / 12;
  group.add(finLeft);

  const finRight = new THREE.Mesh(finGeom, finMat);
  finRight.position.set(-0.25, 0.18, 0);
  finRight.rotation.z = -Math.PI / 12;
  group.add(finRight);

  const engineHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.11, 0.14, 18),
    engineHousingMat,
  );
  engineHousing.rotation.z = Math.PI / 2;
  engineHousing.position.x = -0.47;
  group.add(engineHousing);

  const engineGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 14, 10),
    engineGlowMat,
  );
  engineGlow.position.x = -0.56;
  engineGlow.scale.set(0.7, 1, 1);
  group.add(engineGlow);

  group.scale.setScalar(scale);
  group.userData.ownedMaterials = [
    bodyMat,
    cockpitMat,
    finMat,
    engineHousingMat,
    engineGlowMat,
  ];
  group.userData.ownedGeometries = [
    fuselage.geometry,
    nose.geometry,
    cockpit.geometry,
    finGeom,
    engineHousing.geometry,
    engineGlow.geometry,
  ];
  return group;
}

export function disposeShipMesh(group: THREE.Group): void {
  const mats = group.userData.ownedMaterials as THREE.Material[] | undefined;
  const geoms = group.userData.ownedGeometries as THREE.BufferGeometry[] | undefined;
  mats?.forEach((m) => m.dispose());
  geoms?.forEach((g) => g.dispose());
}
