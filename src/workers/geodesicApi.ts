import type { AlcubierreParams } from '../physics/metrics/alcubierre';
import type { MorrisThorneParams } from '../physics/metrics/morrisThorne';
import type { KrasnikovParams } from '../physics/metrics/krasnikov';

export type MetricKind =
  | 'alcubierre'
  | 'morrisThorne'
  | 'krasnikov'
  | 'hyperspace'
  | 'flat'
  | 'positiveMass'
  | 'paintedField';

export interface PositiveMassParams {
  center: [number, number];
  mass: number;
}

export interface HyperspaceParams {
  center: [number, number];
  aperture: number;
}

export interface PaintedFieldSample {
  x: number;
  y: number;
  intensity: number;
  radius: number;
}

export interface PaintedFieldParams {
  samples: PaintedFieldSample[];
  forceScale?: number;
}

export type MetricParamsFor<K extends MetricKind> = K extends 'alcubierre'
  ? AlcubierreParams
  : K extends 'morrisThorne'
    ? MorrisThorneParams
    : K extends 'krasnikov'
      ? KrasnikovParams
      : K extends 'hyperspace'
        ? HyperspaceParams
        : K extends 'positiveMass'
          ? PositiveMassParams
          : K extends 'paintedField'
            ? PaintedFieldParams
            : Record<string, never>;

export interface Ray {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: 'null' | 'timelike';
}

export interface GeodesicRequest {
  metricKind: MetricKind;
  metricParams: unknown;
  rays: Ray[];
  steps: number;
  dt: number;
}

export interface GeodesicResponse {
  paths: Float32Array[];
  finalRays: Ray[];
}

export interface GeodesicApi {
  integrate(req: GeodesicRequest): Promise<GeodesicResponse>;
}
