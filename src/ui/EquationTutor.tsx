import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { EQUATIONS, expandLinkMacros } from './equations';
import { LinePlot } from './LinePlot';
import { AnimatedLinePlot } from './AnimatedLinePlot';
import { useStore } from '../state/store';
import { getIngredient } from '../pantry/ingredients';
import type {
  ConstructKind,
  IngredientPlacement,
  VerdictLevel,
} from '../types/domain';

interface Props {
  equationKey: string | null;
  onClose: () => void;
}

const CONSTRUCT_LABEL: Record<ConstructKind, string> = {
  warp: 'Warp Bubble',
  wormhole: 'Wormhole',
  krasnikov: 'Krasnikov Tube',
  hyperspace: 'Hyperspace Portal',
  custom: 'Free Build',
};

const VERDICT_LABEL: Record<VerdictLevel, string> = {
  worksInReality: 'works in reality',
  worksWithSeals: 'works only with seals broken',
  incoherent: "doesn't work — even in fiction",
};

function BuildContext({
  activeKind,
  placements,
  params,
  verdictLevel,
  verdictHeadline,
}: {
  activeKind: ConstructKind;
  placements: readonly IngredientPlacement[];
  params: Record<string, number>;
  verdictLevel?: VerdictLevel;
  verdictHeadline?: string;
}) {
  const shownParams = Object.entries(params)
    .filter(([, v]) => Number.isFinite(v))
    .slice(0, 4);
  return (
    <section className="tutor-section tutor-context">
      <div className="tutor-section-label">
        Your current build
        <span className="tutor-diff-hint"> · live · updates as you change the build</span>
      </div>
      <div className="tutor-context-body">
        <div className="tutor-context-row">
          <span className="tutor-context-key">Construct</span>
          <span className="tutor-context-val">{CONSTRUCT_LABEL[activeKind]}</span>
        </div>
        <div className="tutor-context-row">
          <span className="tutor-context-key">Placements</span>
          <span className="tutor-context-val">
            {placements.length === 0 ? (
              <em>empty — drop pantry ingredients into a slot</em>
            ) : (
              placements
                .map(
                  (p) =>
                    `${getIngredient(p.ingredient).displayName} ×${p.amount} → ${p.slot}`,
                )
                .join(' · ')
            )}
          </span>
        </div>
        {shownParams.length > 0 && (
          <div className="tutor-context-row">
            <span className="tutor-context-key">Parameters</span>
            <span className="tutor-context-val">
              {shownParams
                .map(([k, v]) => `${k}=${typeof v === 'number' ? v.toFixed(2) : v}`)
                .join(' · ')}
            </span>
          </div>
        )}
        {verdictLevel && (
          <div className="tutor-context-row">
            <span className="tutor-context-key">Verdict</span>
            <span className={`tutor-context-val verdict-tag verdict-${verdictLevel}`}>
              {VERDICT_LABEL[verdictLevel]}
              {verdictHeadline && <span className="tutor-context-headline"> — {verdictHeadline}</span>}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export function EquationTutor({ equationKey, onClose }: Props) {
  const params = useStore((s) => s.activeConstruct.parameters);
  const placements = useStore((s) => s.activeConstruct.placements);
  const activeKind = useStore((s) => s.activeKind);
  const verdict = useStore((s) => s.verdict);
  const originalRef = useRef<HTMLDivElement>(null);
  const substitutedRef = useRef<HTMLDivElement>(null);
  const [replayNonce, setReplayNonce] = useState(0);
  const entry = equationKey ? EQUATIONS[equationKey] : null;

  const tutor = useMemo(() => {
    if (!entry || !entry.computeTutor) return null;
    return entry.computeTutor(params, verdict);
  }, [entry, params, verdict]);

  useEffect(() => {
    if (!equationKey) return;
    setReplayNonce((n) => n + 1);
  }, [equationKey, placements, params]);

  useEffect(() => {
    if (!entry) return;
    if (!originalRef.current) return;
    try {
      katex.render(expandLinkMacros(entry.katex), originalRef.current, {
        throwOnError: false,
        displayMode: true,
        trust: (ctx) => ctx.command === '\\htmlClass',
        strict: 'ignore',
      });
    } catch {
      originalRef.current.textContent = entry.katex;
    }
  }, [entry]);

  useEffect(() => {
    if (!tutor?.substitutedKatex || !substitutedRef.current) return;
    try {
      katex.render(tutor.substitutedKatex, substitutedRef.current, {
        throwOnError: false,
        displayMode: true,
        strict: 'ignore',
      });
    } catch {
      if (substitutedRef.current) substitutedRef.current.textContent = tutor.substitutedKatex;
    }
  }, [tutor]);

  useEffect(() => {
    if (!equationKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [equationKey, onClose]);

  const replay = useCallback(() => setReplayNonce((n) => n + 1), []);

  if (!entry) return null;

  const hasAnimation =
    tutor?.plot &&
    tutor.plot.kind === 'line' &&
    tutor.plot.baselineSeries &&
    tutor.plot.baselineSeries.length > 0;

  return (
    <div className="equation-tutor" role="dialog" aria-label={`${entry.title} explainer`}>
      <div className="tutor-panel">
        <button type="button" className="theorem-close" onClick={onClose} aria-label="Close (Esc)">
          ×
        </button>
        <div className="tutor-hint">Modify your build to see values update live · Esc or × to close</div>
        <div className="tutor-eyebrow">Equation tutor</div>
        <h2 className="tutor-title">{entry.title}</h2>
        <BuildContext
          activeKind={activeKind}
          placements={placements}
          params={params}
          verdictLevel={verdict?.level}
          verdictHeadline={verdict?.headline}
        />
        <section className="tutor-section">
          <div className="tutor-section-label">Original</div>
          <div ref={originalRef} className="tutor-katex" />
        </section>
        {entry.explanation && (
          <section className="tutor-section">
            <div className="tutor-section-label">What it says</div>
            <p className="tutor-explanation">{entry.explanation}</p>
          </section>
        )}
        {tutor && (
          <>
            <section className="tutor-section">
              <div className="tutor-section-label">
                Current values from your build
                {tutor.variables.some((v) => v.baseline !== undefined) && (
                  <span className="tutor-diff-hint"> · showing default → your value</span>
                )}
              </div>
              <dl className="tutor-vars">
                {tutor.variables.map((v, i) => (
                  <div key={i} className="tutor-var">
                    <dt>
                      <span className="tutor-var-symbol">{v.symbol}</span>
                      <span className="tutor-var-name">{v.name}</span>
                    </dt>
                    <dd>
                      {v.baseline !== undefined && (
                        <span className="tutor-baseline">
                          {v.baseline}
                          <span className="tutor-arrow" aria-hidden> → </span>
                        </span>
                      )}
                      <span className="tutor-current">{typeof v.value === 'number' ? v.value : v.value}</span>
                      {v.unit && <span className="tutor-var-unit"> {v.unit}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            {tutor.substitutedKatex && (
              <section className="tutor-section">
                <div className="tutor-section-label">Plug in the values</div>
                <div ref={substitutedRef} className="tutor-katex tutor-katex-substituted" />
              </section>
            )}
            {tutor.result && (
              <section className="tutor-section tutor-result">
                <div className="tutor-result-label">
                  Result{tutor.result.label ? ` (${tutor.result.label})` : ''}
                </div>
                <div className="tutor-result-value">
                  {tutor.result.baseline !== undefined && (
                    <span className="tutor-baseline">
                      {tutor.result.baseline}
                      <span className="tutor-arrow" aria-hidden> → </span>
                    </span>
                  )}
                  {tutor.result.value}
                  {tutor.result.unit && <span className="tutor-result-unit"> {tutor.result.unit}</span>}
                </div>
              </section>
            )}
            {tutor.plot && tutor.plot.kind === 'line' && (
              <section className="tutor-section">
                <div className="tutor-section-label">
                  Visualization
                  {hasAnimation && (
                    <button type="button" className="tutor-replay" onClick={replay}>
                      ↻ Replay
                    </button>
                  )}
                </div>
                {hasAnimation ? (
                  <AnimatedLinePlot
                    fromSeries={tutor.plot.baselineSeries!}
                    toSeries={tutor.plot.series}
                    {...(tutor.plot.baselineMarkers !== undefined
                      ? { fromMarkers: tutor.plot.baselineMarkers }
                      : {})}
                    {...(tutor.plot.markers !== undefined ? { toMarkers: tutor.plot.markers } : {})}
                    {...(tutor.plot.xLabel !== undefined ? { xLabel: tutor.plot.xLabel } : {})}
                    {...(tutor.plot.yLabel !== undefined ? { yLabel: tutor.plot.yLabel } : {})}
                    replayNonce={replayNonce}
                  />
                ) : (
                  <LinePlot
                    series={tutor.plot.series}
                    {...(tutor.plot.markers !== undefined ? { markers: tutor.plot.markers } : {})}
                    {...(tutor.plot.xLabel !== undefined ? { xLabel: tutor.plot.xLabel } : {})}
                    {...(tutor.plot.yLabel !== undefined ? { yLabel: tutor.plot.yLabel } : {})}
                  />
                )}
              </section>
            )}
            {tutor.interpretation && (
              <section className="tutor-section tutor-interpretation">
                <div className="tutor-section-label">Read it back</div>
                <p>{tutor.interpretation}</p>
              </section>
            )}
          </>
        )}
        {entry.reference && <div className="tutor-reference">{entry.reference}</div>}
      </div>
    </div>
  );
}
