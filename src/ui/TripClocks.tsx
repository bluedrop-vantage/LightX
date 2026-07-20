import { HelpButton } from './HelpButton';

interface Props {
  shipTau: number;
  earthT: number;
  distance: number;
  label?: string;
  hint?: string;
  helpKey?: string;
}

function fmt(t: number): string {
  if (Math.abs(t) < 1000) return t.toFixed(2);
  return t.toExponential(2);
}

export function TripClocks({
  shipTau,
  earthT,
  distance,
  label = 'Trip clocks',
  hint,
  helpKey = 'metric-trip-clocks',
}: Props) {
  const vAvg = shipTau > 1e-6 ? distance / shipTau : 0;
  const derivedHint = hint ?? (vAvg > 1
    ? `Coordinate v = Δx/τ ≈ ${vAvg.toFixed(2)}c — bubble surfs faster than a light signal outside, but the crew is inertial (τ = t).`
    : vAvg > 0
      ? `Coordinate v ≈ ${vAvg.toFixed(2)}c. Interior is locally inertial (τ = t).`
      : undefined);
  return (
    <div className="trip-clocks" aria-label={label}>
      <div className="trip-clocks-title">
        {label}
        {helpKey && <HelpButton helpKey={helpKey} />}
      </div>
      <div className="clocks-row">
        <div className="clock">
          <div className="clock-label">Ship τ</div>
          <div className="clock-value">{fmt(shipTau)}</div>
          <div className="clock-unit">s (interior, proper)</div>
        </div>
        <div className="clock">
          <div className="clock-label">Earth t</div>
          <div className="clock-value">{fmt(earthT)}</div>
          <div className="clock-unit">s (outside observer)</div>
        </div>
        <div className="clock">
          <div className="clock-label">Δx</div>
          <div className="clock-value">{fmt(distance)}</div>
          <div className="clock-unit">ly (coordinate)</div>
        </div>
      </div>
      {derivedHint && <div className="trip-clocks-hint">{derivedHint}</div>}
    </div>
  );
}
