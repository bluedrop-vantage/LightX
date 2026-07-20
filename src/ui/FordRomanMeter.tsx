import { HelpButton } from './HelpButton';

interface Props {
  ratio: number;
  label?: string;
  helpKey?: string;
}

export function FordRomanMeter({ ratio, label = 'Ford–Roman ratio', helpKey = 'metric-ford-roman' }: Props) {
  const logRatio = ratio > 0 ? Math.log10(ratio) : 0;
  const clamped = Math.max(-2, Math.min(10, logRatio));
  const pct = ((clamped + 2) / 12) * 100;
  const violated = ratio > 1;
  const severe = ratio > 1e6;

  return (
    <div className="fr-meter" aria-label={label}>
      <div className="fr-meter-row">
        <span className="fr-meter-label">
          {label}
          {helpKey && <HelpButton helpKey={helpKey} />}
        </span>
        <span className={`fr-meter-value ${violated ? 'violated' : 'ok'}`}>
          {ratio > 0 ? ratio.toExponential(2) : '—'}
        </span>
      </div>
      <div className="fr-meter-track" aria-hidden>
        <div
          className={`fr-meter-fill ${severe ? 'severe' : violated ? 'violated' : 'ok'}`}
          style={{ width: `${pct}%` }}
        />
        <div className="fr-meter-tick" style={{ left: `${((0 + 2) / 12) * 100}%` }}>
          <span>1</span>
        </div>
      </div>
      <div className="fr-meter-hint">
        {ratio === 0
          ? 'No negative-energy demand yet.'
          : violated
            ? `Exceeds the quantum-inequality bound by ${ratio.toExponential(1)}× — needs the seal.`
            : 'Within the quantum bound.'}
      </div>
    </div>
  );
}
