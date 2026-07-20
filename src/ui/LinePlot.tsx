import { useMemo } from 'react';

export interface PlotSeries {
  points: Array<[number, number]>;
  color?: string;
  label?: string;
  strokeWidth?: number;
}

export interface MarkerPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

interface Props {
  series: PlotSeries[];
  markers?: MarkerPoint[];
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
  yZeroLine?: boolean;
  padding?: { top: number; right: number; bottom: number; left: number };
}

const DEFAULT_PADDING = { top: 12, right: 18, bottom: 26, left: 34 };

export function LinePlot({
  series,
  markers = [],
  xLabel,
  yLabel,
  width = 320,
  height = 180,
  yZeroLine = true,
  padding = DEFAULT_PADDING,
}: Props) {
  const { xMin, xMax, yMin, yMax, plotSeries } = useMemo(() => {
    let xLo = Infinity;
    let xHi = -Infinity;
    let yLo = Infinity;
    let yHi = -Infinity;
    for (const s of series) {
      for (const [x, y] of s.points) {
        if (x < xLo) xLo = x;
        if (x > xHi) xHi = x;
        if (y < yLo) yLo = y;
        if (y > yHi) yHi = y;
      }
    }
    for (const m of markers) {
      if (m.x < xLo) xLo = m.x;
      if (m.x > xHi) xHi = m.x;
      if (m.y < yLo) yLo = m.y;
      if (m.y > yHi) yHi = m.y;
    }
    if (!isFinite(xLo)) {
      xLo = 0;
      xHi = 1;
      yLo = 0;
      yHi = 1;
    }
    if (yHi === yLo) {
      yHi += 1;
      yLo -= 1;
    }
    if (xHi === xLo) {
      xHi += 1;
    }
    const padY = (yHi - yLo) * 0.08;
    yHi += padY;
    yLo -= padY;
    return { xMin: xLo, xMax: xHi, yMin: yLo, yMax: yHi, plotSeries: series };
  }, [series, markers]);

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const sx = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * innerW;
  const sy = (y: number) => padding.top + (1 - (y - yMin) / (yMax - yMin)) * innerH;

  const yTicks = 4;
  const xTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / yTicks);
  const xTickValues = Array.from({ length: xTicks + 1 }, (_, i) => xMin + ((xMax - xMin) * i) / xTicks);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="line-plot">
      <rect x={0} y={0} width={width} height={height} fill="rgba(255,255,255,0.02)" rx={6} />
      {yTickValues.map((v) => (
        <g key={`yt-${v.toFixed(4)}`}>
          <line
            x1={padding.left}
            y1={sy(v)}
            x2={width - padding.right}
            y2={sy(v)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
          <text
            x={padding.left - 4}
            y={sy(v) + 3}
            fontSize={9}
            textAnchor="end"
            fill="rgba(200,210,225,0.55)"
          >
            {fmt(v)}
          </text>
        </g>
      ))}
      {xTickValues.map((v) => (
        <g key={`xt-${v.toFixed(4)}`}>
          <text
            x={sx(v)}
            y={height - padding.bottom + 12}
            fontSize={9}
            textAnchor="middle"
            fill="rgba(200,210,225,0.55)"
          >
            {fmt(v)}
          </text>
        </g>
      ))}
      {yZeroLine && yMin < 0 && yMax > 0 && (
        <line
          x1={padding.left}
          y1={sy(0)}
          x2={width - padding.right}
          y2={sy(0)}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}
      {plotSeries.map((s, i) => (
        <polyline
          key={i}
          points={s.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')}
          fill="none"
          stroke={s.color ?? '#6cc4ff'}
          strokeWidth={s.strokeWidth ?? 2}
        />
      ))}
      {markers.map((m, i) => (
        <g key={`m-${i}`}>
          <line
            x1={sx(m.x)}
            y1={padding.top}
            x2={sx(m.x)}
            y2={height - padding.bottom}
            stroke={m.color ?? '#ffe27a'}
            strokeWidth={1}
            strokeDasharray="2 2"
            opacity={0.55}
          />
          <circle cx={sx(m.x)} cy={sy(m.y)} r={3.5} fill={m.color ?? '#ffe27a'} />
          {m.label && (
            <text
              x={sx(m.x) + 6}
              y={sy(m.y) - 6}
              fontSize={10}
              fill={m.color ?? '#ffe27a'}
            >
              {m.label}
            </text>
          )}
        </g>
      ))}
      {yLabel && (
        <text
          x={10}
          y={padding.top + innerH / 2}
          fontSize={10}
          textAnchor="middle"
          fill="rgba(200,210,225,0.7)"
          transform={`rotate(-90 10 ${padding.top + innerH / 2})`}
        >
          {yLabel}
        </text>
      )}
      {xLabel && (
        <text
          x={padding.left + innerW / 2}
          y={height - 4}
          fontSize={10}
          textAnchor="middle"
          fill="rgba(200,210,225,0.7)"
          fontStyle="italic"
        >
          {xLabel}
        </text>
      )}
    </svg>
  );
}

function fmt(v: number): string {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 100 || a < 0.01) return v.toExponential(1);
  if (Math.abs(v - Math.round(v)) < 1e-9) return v.toFixed(0);
  return v.toFixed(2);
}
