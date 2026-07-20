import { useCallback, useEffect, useState } from 'react';
import { storage } from '../../storage/storage';
import { STORAGE_KEYS } from '../../storage/schema';
import type { Build } from '../../types/domain';

interface StoredBuild extends Build {
  brushSamples?: unknown[];
}

export function LabReport() {
  const [builds, setBuilds] = useState<StoredBuild[]>([]);

  const reload = useCallback(() => {
    const index = storage.get<string[]>(STORAGE_KEYS.buildIndex) ?? [];
    const loaded = index
      .map((id) => storage.get<StoredBuild>(STORAGE_KEYS.build(id)))
      .filter((b): b is StoredBuild => b !== undefined)
      .reverse();
    setBuilds(loaded);
  }, []);

  useEffect(() => {
    reload();
    const listener = () => reload();
    window.addEventListener('storage', listener);
    const interval = window.setInterval(reload, 1500);
    return () => {
      window.removeEventListener('storage', listener);
      window.clearInterval(interval);
    };
  }, [reload]);

  const remove = useCallback((id: string) => {
    storage.remove(STORAGE_KEYS.build(id));
    const index = storage.get<string[]>(STORAGE_KEYS.buildIndex) ?? [];
    storage.set(STORAGE_KEYS.buildIndex, index.filter((x) => x !== id));
    reload();
  }, [reload]);

  const copyReport = useCallback((build: StoredBuild) => {
    const v = build.verdict;
    const lines: string[] = [
      'Exotic Pantry — Lab Report',
      `Build ${build.id}`,
      `Created: ${new Date(build.createdAt).toISOString()}`,
      '',
      `Verdict: ${v.level}`,
      `Headline: ${v.headline}`,
      `Reason: ${v.reason}`,
      `NEC: ${v.necStatus}`,
      `Ford–Roman ratio: ${v.fordRomanRatio.toExponential(2)}`,
      `Chronology horizon: ${v.chronologyHorizon ? 'forming' : 'clear'}`,
      '',
      'Seals broken:',
      ...v.sealsBroken.map((s) => `  - ${s.seal} (${s.citation}): ${s.reason}`),
      '',
      `Cited theorems: ${v.citedTheorems.join(', ')}`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
  }, []);

  if (builds.length === 0) {
    return (
      <section className="lab-report empty" aria-label="Saved builds">
        <div className="lab-report-title">Saved Builds</div>
        <p className="lab-report-empty">No saved builds yet. Paint a field, then hit "Save Build".</p>
      </section>
    );
  }

  return (
    <section className="lab-report" aria-label="Saved builds">
      <div className="lab-report-title">Saved Builds</div>
      <ul>
        {builds.map((b) => (
          <li key={b.id}>
            <div className="build-row">
              <span className={`verdict-dot verdict-${b.verdict.level}`} />
              <span className="build-headline">{b.verdict.headline || b.verdict.level}</span>
              <span className="build-time">{new Date(b.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="build-meta">
              NEC {b.verdict.necStatus} · seals {b.verdict.sealsBroken.length} · FR{' '}
              {b.verdict.fordRomanRatio > 0 ? b.verdict.fordRomanRatio.toExponential(1) : '—'}
            </div>
            <div className="build-actions">
              <button type="button" onClick={() => copyReport(b)}>Copy Lab Report</button>
              <button type="button" onClick={() => remove(b.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
