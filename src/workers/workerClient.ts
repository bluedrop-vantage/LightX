import * as Comlink from 'comlink';
import type { GeodesicApi } from './geodesicApi';

let cached: { worker: Worker; api: Comlink.Remote<GeodesicApi> } | null = null;

export function getGeodesicClient(): Comlink.Remote<GeodesicApi> {
  if (cached) return cached.api;
  const worker = new Worker(new URL('./geodesic.worker.ts', import.meta.url), {
    type: 'module',
  });
  const api = Comlink.wrap<GeodesicApi>(worker);
  cached = { worker, api };
  return api;
}

export function disposeGeodesicClient(): void {
  if (!cached) return;
  cached.worker.terminate();
  cached = null;
}
