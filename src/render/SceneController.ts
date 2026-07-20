import * as THREE from 'three';
import { SpacetimeMesh, type MeshEvaluator } from './SpacetimeMesh';
import { GeodesicLayer, type GeodesicPath } from './GeodesicLayer';
import { LightConeLayer, type ConeTiltEvaluator } from './LightConeLayer';
import { createShipMesh, disposeShipMesh } from './ShipMesh';

export type CanvasClickHandler = (world: { x: number; y: number }) => void;

export interface SceneController {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  mesh: SpacetimeMesh;
  ship: THREE.Object3D;
  geodesics: GeodesicLayer;
  viewSize: number;
  setEvaluator: (fn: MeshEvaluator) => void;
  setShipPosition: (x: number, y: number, z: number) => void;
  setShipVisible: (visible: boolean) => void;
  setShipSteeringSevered: (severed: boolean) => void;
  setBackgroundColor: (hex: number) => void;
  setBubbleIndicator: (visible: boolean, radius: number, center: [number, number]) => void;
  setSecondaryBubble: (visible: boolean, radius: number, center: [number, number]) => void;
  setSecondaryShipPosition: (x: number, y: number, z: number) => void;
  setGeodesicPaths: (paths: GeodesicPath[]) => void;
  clearGeodesics: () => void;
  setShipConePaths: (paths: GeodesicPath[]) => void;
  setShipConeDrawFraction: (fraction: number) => void;
  clearShipCone: () => void;
  setLightConesVisible: (v: boolean) => void;
  setConeTilt: (fn: ConeTiltEvaluator) => void;
  setClickHandler: (h: CanvasClickHandler | null) => void;
  screenToWorld: (screenX: number, screenY: number, width: number, height: number) => { x: number; y: number };
  tick: (dt: number) => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
}

export function createSceneController(viewSize = 10): SceneController {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f1a);

  const aspect = 1;
  const camera = new THREE.OrthographicCamera(
    -viewSize * aspect,
    viewSize * aspect,
    viewSize,
    -viewSize,
    0.01,
    100,
  );
  camera.position.set(0, 0, 20);
  camera.lookAt(0, 0, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);
  const rim = new THREE.DirectionalLight(0xffffff, 0.55);
  rim.position.set(4, 6, 10);
  scene.add(rim);

  const mesh = new SpacetimeMesh(viewSize * 2, viewSize * 2, 56);
  scene.add(mesh.group);

  const geodesics = new GeodesicLayer(240, 240);
  scene.add(geodesics.group);

  const shipCone = new GeodesicLayer(24, 120);
  scene.add(shipCone.group);

  const lightCones = new LightConeLayer(viewSize * 0.75);
  scene.add(lightCones.group);
  let coneTilt: ConeTiltEvaluator = () => ({ tiltX: 0, tiltY: 0 });

  const ship = createShipMesh({ scale: 1.1, lit: true });
  ship.position.set(0, 0, 0.5);
  scene.add(ship);

  const bubbleGeom = new THREE.RingGeometry(0.98, 1.02, 64);
  const bubbleMat = new THREE.MeshBasicMaterial({
    color: 0x6cc4ff,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const bubble = new THREE.Mesh(bubbleGeom, bubbleMat);
  bubble.visible = false;
  scene.add(bubble);

  const bubbleB = new THREE.Mesh(bubbleGeom.clone(), bubbleMat.clone());
  (bubbleB.material as THREE.MeshBasicMaterial).color.setHex(0xffa14a);
  bubbleB.visible = false;
  scene.add(bubbleB);

  const shipB = createShipMesh({
    scale: 1.1,
    lit: true,
    primaryColor: 0xffd8a3,
    accentColor: 0xffa14a,
    engineColor: 0xffbd6b,
  });
  shipB.visible = false;
  shipB.rotation.y = Math.PI;
  scene.add(shipB);

  const severedGeom = new THREE.RingGeometry(0.55, 0.7, 32);
  const severedMat = new THREE.MeshBasicMaterial({
    color: 0xff5a4a,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const severedRing = new THREE.Mesh(severedGeom, severedMat);
  severedRing.visible = false;
  scene.add(severedRing);

  let evaluator: MeshEvaluator = () => ({ z: 0, expansion: 0 });
  let clickHandler: CanvasClickHandler | null = null;
  let steeringSevered = false;

  const screenToWorld = (sx: number, sy: number, w: number, h: number) => {
    const asp = w / h;
    const wx = ((sx / w) * 2 - 1) * viewSize * asp;
    const wy = (1 - (sy / h) * 2) * viewSize;
    return { x: wx, y: wy };
  };

  return {
    scene,
    camera,
    mesh,
    ship,
    geodesics,
    viewSize,
    setEvaluator: (fn) => {
      evaluator = fn;
    },
    setShipPosition: (x, y, z) => {
      ship.position.set(x, y, z);
      severedRing.position.set(x, y, 0.4);
    },
    setShipVisible: (visible) => {
      ship.visible = visible;
      if (!visible) severedRing.visible = false;
    },
    setShipSteeringSevered: (severed) => {
      steeringSevered = severed && ship.visible;
      severedRing.visible = steeringSevered;
    },
    setBackgroundColor: (hex) => {
      (scene.background as THREE.Color).setHex(hex);
    },
    setBubbleIndicator: (visible, radius, center) => {
      bubble.visible = visible;
      bubble.scale.setScalar(radius);
      bubble.position.set(center[0], center[1], 0.2);
    },
    setSecondaryBubble: (visible, radius, center) => {
      bubbleB.visible = visible;
      bubbleB.scale.setScalar(radius);
      bubbleB.position.set(center[0], center[1], 0.2);
    },
    setSecondaryShipPosition: (x, y, z) => {
      shipB.visible = true;
      shipB.position.set(x, y, z);
    },
    setGeodesicPaths: (paths) => geodesics.setPaths(paths),
    clearGeodesics: () => geodesics.clear(),
    setShipConePaths: (paths) => shipCone.setPaths(paths),
    setShipConeDrawFraction: (fraction) => shipCone.setDrawFraction(fraction),
    clearShipCone: () => shipCone.clear(),
    setLightConesVisible: (v) => lightCones.setVisible(v),
    setConeTilt: (fn) => {
      coneTilt = fn;
    },
    setClickHandler: (h) => {
      clickHandler = h;
    },
    screenToWorld,
    tick: (dt) => {
      mesh.update(evaluator);
      lightCones.update(coneTilt);
      if (steeringSevered) {
        const s = 1 + 0.15 * Math.sin(performance.now() / 120);
        severedRing.scale.setScalar(s);
      }
      void dt;
    },
    resize: (w, h) => {
      const asp = w / h;
      camera.left = -viewSize * asp;
      camera.right = viewSize * asp;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();
    },
    dispose: () => {
      mesh.dispose();
      geodesics.dispose();
      shipCone.dispose();
      lightCones.dispose();
      disposeShipMesh(ship);
      disposeShipMesh(shipB);
      bubbleGeom.dispose();
      bubbleMat.dispose();
      (bubbleB.geometry as THREE.BufferGeometry).dispose();
      (bubbleB.material as THREE.Material).dispose();
      severedGeom.dispose();
      severedMat.dispose();
    },
    get clickHandler() {
      return clickHandler;
    },
  } as SceneController & { clickHandler: CanvasClickHandler | null };
}
