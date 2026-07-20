import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { SceneController } from './SceneController';

interface Props {
  controller: SceneController;
  onWorldClick?: (world: { x: number; y: number }) => void;
}

export function Canvas3D({ controller, onWorldClick }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const clickHandlerRef = useRef<typeof onWorldClick>(onWorldClick);
  clickHandlerRef.current = onWorldClick;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const initial = host.getBoundingClientRect();
    renderer.setSize(initial.width, initial.height, false);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.cursor = 'crosshair';

    controller.resize(initial.width, initial.height);

    const onPointerDown = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const world = controller.screenToWorld(
        ev.clientX - rect.left,
        ev.clientY - rect.top,
        rect.width,
        rect.height,
      );
      clickHandlerRef.current?.(world);
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      controller.tick(dt);
      renderer.render(controller.scene, controller.camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      renderer.setSize(width, height, false);
      controller.resize(width, height);
    });
    ro.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [controller]);

  return <div ref={hostRef} className="canvas3d-host" />;
}
