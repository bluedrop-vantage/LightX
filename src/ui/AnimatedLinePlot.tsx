import { useEffect, useRef, useState } from 'react';
import { LinePlot, type PlotSeries, type MarkerPoint } from './LinePlot';

interface Props {
  fromSeries: PlotSeries[];
  toSeries: PlotSeries[];
  fromMarkers?: MarkerPoint[];
  toMarkers?: MarkerPoint[];
  durationMs?: number;
  xLabel?: string;
  yLabel?: string;
  replayNonce?: number;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpSeries(a: PlotSeries[], b: PlotSeries[], t: number): PlotSeries[] {
  const out: PlotSeries[] = [];
  const seriesCount = Math.min(a.length, b.length);
  for (let s = 0; s < seriesCount; s++) {
    const A = a[s];
    const B = b[s];
    const n = Math.min(A.points.length, B.points.length);
    const points: Array<[number, number]> = new Array(n);
    for (let i = 0; i < n; i++) {
      const [ax, ay] = A.points[i];
      const [bx, by] = B.points[i];
      points[i] = [ax + (bx - ax) * t, ay + (by - ay) * t];
    }
    out.push({
      points,
      color: B.color ?? A.color,
      ...(B.label !== undefined ? { label: B.label } : {}),
      ...(B.strokeWidth !== undefined ? { strokeWidth: B.strokeWidth } : {}),
    });
  }
  return out;
}

function lerpMarkers(a: MarkerPoint[], b: MarkerPoint[], t: number): MarkerPoint[] {
  const n = Math.min(a.length, b.length);
  const out: MarkerPoint[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const A = a[i];
    const B = b[i];
    out[i] = {
      x: A.x + (B.x - A.x) * t,
      y: A.y + (B.y - A.y) * t,
      color: B.color ?? A.color,
      ...(B.label !== undefined ? { label: B.label } : {}),
    };
  }
  return out;
}

export function AnimatedLinePlot({
  fromSeries,
  toSeries,
  fromMarkers,
  toMarkers,
  durationMs = 1600,
  xLabel,
  yLabel,
  replayNonce = 0,
}: Props) {
  const [progress, setProgress] = useState(1);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    setProgress(0);
    const loop = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / durationMs);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [durationMs, replayNonce]);

  const t = easeInOutCubic(progress);
  const series = lerpSeries(fromSeries, toSeries, t);
  const markers =
    fromMarkers && toMarkers ? lerpMarkers(fromMarkers, toMarkers, t) : toMarkers ?? fromMarkers;

  return (
    <LinePlot
      series={series}
      {...(markers !== undefined ? { markers } : {})}
      {...(xLabel !== undefined ? { xLabel } : {})}
      {...(yLabel !== undefined ? { yLabel } : {})}
    />
  );
}
