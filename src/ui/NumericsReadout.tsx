import { useEffect, useState } from 'react';
import { useStore } from '../state/store';

export interface NumericSample {
  label: string;
  value: number;
  format?: (v: number) => string;
  unit?: string;
}

interface Props {
  compute: () => NumericSample[];
  intervalMs?: number;
}

export function NumericsReadout({ compute, intervalMs = 250 }: Props) {
  const mode = useStore((s) => s.uiMode);
  const [samples, setSamples] = useState<NumericSample[]>([]);

  useEffect(() => {
    if (mode !== 'physicist') return;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last > intervalMs) {
        last = t;
        setSamples(compute());
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [compute, intervalMs, mode]);

  if (mode !== 'physicist') return null;

  return (
    <section className="numerics-readout" aria-label="Physicist numerics">
      <div className="numerics-title">Numerics</div>
      <dl>
        {samples.map((s, i) => (
          <div key={i}>
            <dt>{s.label}</dt>
            <dd>
              {s.format ? s.format(s.value) : s.value.toExponential(3)}
              {s.unit && <span className="unit"> {s.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
