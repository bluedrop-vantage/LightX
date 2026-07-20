import { useState } from 'react';
import type { Verdict } from '../types/domain';
import { TheoremExplainer } from '../ui/TheoremExplainer';
import { HelpButton } from '../ui/HelpButton';

interface Props {
  verdict: Verdict;
}

const LEVEL_COPY: Record<Verdict['level'], { label: string; icon: string; className: string }> = {
  worksInReality: { label: 'Works in reality', icon: '●', className: 'verdict-green' },
  worksWithSeals: { label: 'Works only with seals broken', icon: '◐', className: 'verdict-yellow' },
  incoherent: { label: "Doesn't work — even in fiction", icon: '✕', className: 'verdict-red' },
};

export function VerdictCard({ verdict }: Props) {
  const l = LEVEL_COPY[verdict.level];
  const [activeCitation, setActiveCitation] = useState<string | null>(null);
  return (
    <section className={`verdict-card ${l.className}`} aria-live="polite">
      <header className="verdict-header">
        <span className="verdict-icon" aria-hidden>
          {l.icon}
        </span>
        <div className="verdict-title">
          <div className="verdict-label">
            {l.label}
            <HelpButton helpKey="metric-verdict" />
          </div>
          <div className="verdict-headline">{verdict.headline}</div>
        </div>
      </header>
      {verdict.reason && <p className="verdict-reason">{verdict.reason}</p>}
      <dl className="verdict-metrics">
        <div>
          <dt>
            NEC
            <HelpButton helpKey="metric-nec" />
          </dt>
          <dd className={`nec-${verdict.necStatus.toLowerCase()}`}>{verdict.necStatus}</dd>
        </div>
        <div>
          <dt>Ford–Roman ratio</dt>
          <dd>{verdict.fordRomanRatio > 0 ? verdict.fordRomanRatio.toExponential(2) : '—'}</dd>
        </div>
        <div>
          <dt>Chronology horizon</dt>
          <dd>{verdict.chronologyHorizon ? 'forming' : 'clear'}</dd>
        </div>
      </dl>
      {verdict.sealsBroken.length > 0 && (
        <div className="verdict-seals">
          <div className="verdict-seals-label">Seals broken this build</div>
          <ul>
            {verdict.sealsBroken.map((s, i) => (
              <li key={i}>
                <strong>{s.seal}</strong>: {s.reason}{' '}
                <button
                  type="button"
                  className="cite"
                  onClick={() => setActiveCitation(s.citation)}
                >
                  — {s.citation}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {verdict.citedTheorems.length > 0 && verdict.sealsBroken.length === 0 && (
        <div className="verdict-cites">
          Cited:{' '}
          {verdict.citedTheorems.map((c, i) => (
            <span key={c}>
              {i > 0 && ' · '}
              <button type="button" className="cite" onClick={() => setActiveCitation(c)}>
                {c}
              </button>
            </span>
          ))}
        </div>
      )}
      <TheoremExplainer citation={activeCitation} onClose={() => setActiveCitation(null)} />
    </section>
  );
}
