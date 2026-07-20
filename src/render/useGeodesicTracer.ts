import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeodesicPath } from './GeodesicLayer';
import type { SceneController } from './SceneController';
import { getGeodesicClient } from '../workers/workerClient';
import type { MetricKind, Ray } from '../workers/geodesicApi';

interface Options {
  metricKind: MetricKind;
  getMetricParams: () => unknown;
  scene: SceneController;
  raysPerBurst?: number;
  color?: number;
  steps?: number;
  dt?: number;
}

export function useGeodesicTracer(options: Options) {
  const { scene } = options;

  const optsRef = useRef(options);
  optsRef.current = options;

  const pathsRef = useRef<GeodesicPath[]>([]);
  const [rayCount, setRayCount] = useState(0);
  const [paths, setPaths] = useState<GeodesicPath[]>([]);

  const emitBundle = useCallback(
    async (rays: Ray[]) => {
      const client = getGeodesicClient();
      const o = optsRef.current;
      const response = await client.integrate({
        metricKind: o.metricKind,
        metricParams: o.getMetricParams(),
        rays,
        steps: o.steps ?? 220,
        dt: o.dt ?? 0.04,
      });
      const color = o.color ?? 0xffe27a;
      const next: GeodesicPath[] = response.paths.map((points) => ({ points, color }));
      pathsRef.current = [...pathsRef.current, ...next].slice(-240);
      scene.setGeodesicPaths(pathsRef.current);
      setRayCount(pathsRef.current.length);
      setPaths(pathsRef.current);
    },
    [scene],
  );

  const emitFrom = useCallback(
    async (origin: { x: number; y: number }, direction?: { x: number; y: number }) => {
      const raysPerBurst = optsRef.current.raysPerBurst ?? 12;
      const rays: Ray[] = [];
      const baseTheta = direction ? Math.atan2(direction.y, direction.x) : 0;
      const spread = direction ? Math.PI / 12 : Math.PI * 2;
      for (let i = 0; i < raysPerBurst; i++) {
        const theta = direction
          ? baseTheta + (i / (raysPerBurst - 1 || 1) - 0.5) * spread
          : (i / raysPerBurst) * Math.PI * 2;
        rays.push({
          x: origin.x,
          y: origin.y,
          vx: Math.cos(theta),
          vy: Math.sin(theta),
          kind: 'null',
        });
      }
      await emitBundle(rays);
    },
    [emitBundle],
  );

  const emitTraversalBundle = useCallback(
    async (origin: { x: number; y: number }, count = 200) => {
      const rays: Ray[] = [];
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        rays.push({
          x: origin.x,
          y: origin.y,
          vx: Math.cos(theta),
          vy: Math.sin(theta),
          kind: 'null',
        });
      }
      await emitBundle(rays);
    },
    [emitBundle],
  );

  const clear = useCallback(() => {
    pathsRef.current = [];
    scene.clearGeodesics();
    setRayCount(0);
    setPaths([]);
  }, [scene]);

  useEffect(() => {
    return () => scene.clearGeodesics();
  }, [scene]);

  return { emitFrom, emitTraversalBundle, clear, rayCount, paths };
}
