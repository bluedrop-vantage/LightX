import { HelpButton } from './HelpButton';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  hint?: string;
  helpKey?: string;
}

export function Slider({ label, value, min, max, step = 0.01, unit, format, onChange, hint, helpKey }: Props) {
  const display = format ? format(value) : value.toFixed(2);
  return (
    <label className="slider">
      <div className="slider-row">
        <span className="slider-label">
          {label}
          {helpKey && <HelpButton helpKey={helpKey} />}
        </span>
        <span className="slider-value">
          {display}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(ev) => onChange(parseFloat(ev.target.value))}
      />
      {hint && <div className="slider-hint">{hint}</div>}
    </label>
  );
}
