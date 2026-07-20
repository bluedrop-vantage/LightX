import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { MISSIONS } from './missions';
import { loadStoredPack } from './pack';
import type { Mission } from '../types/domain';

export function MissionRunner() {
  const activeMission = useStore((s) => s.activeMission);
  const setActiveMission = useStore((s) => s.setActiveMission);
  const creditsSpent = useStore((s) => s.creditsSpent);
  const sealsActive = useStore((s) => s.activeSeals.length);
  const verdict = useStore((s) => s.verdict);
  const [extraMissions, setExtraMissions] = useState<Mission[]>([]);

  useEffect(() => {
    const pack = loadStoredPack();
    if (pack) setExtraMissions(pack.missions);
  }, []);

  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as Mission[] | undefined;
      setExtraMissions(detail ?? []);
    };
    window.addEventListener('exotic-pantry:missions-changed', handler);
    return () => window.removeEventListener('exotic-pantry:missions-changed', handler);
  }, []);

  const allMissions = [...MISSIONS, ...extraMissions];

  const onChange = (id: string) => {
    if (id === '') {
      setActiveMission(null);
      return;
    }
    const m = allMissions.find((x) => x.id === id);
    setActiveMission(m ?? null);
  };

  return (
    <div className="mission-runner">
      <label className="mission-label">Mission</label>
      <select
        className="mission-select"
        value={activeMission?.id ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— Free sandbox (no mission) —</option>
        {allMissions.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title}
          </option>
        ))}
      </select>
      {activeMission && (
        <div className="mission-body">
          <div className="mission-goal">
            {activeMission.origin} → {activeMission.destination} · goal:{' '}
            {activeMission.goal.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </div>
          {activeMission.exoticCreditBudget !== undefined && (
            <MissionBudget
              spent={creditsSpent}
              budget={activeMission.exoticCreditBudget}
              activeSeals={sealsActive}
            />
          )}
          {verdict && activeMission.goal === 'zeroSeals' && verdict.sealsBroken.length > 0 && (
            <div className="mission-fail">
              This mission requires zero seals broken. {verdict.sealsBroken.length} broken.
            </div>
          )}
          {verdict &&
            activeMission.goal === 'zeroSeals' &&
            verdict.sealsBroken.length === 0 &&
            verdict.level === 'worksInReality' && (
              <div className="mission-pass">
                Mission complete — {activeMission.destination} reached without breaking any seals.
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function MissionBudget({
  spent,
  budget,
  activeSeals,
}: {
  spent: number;
  budget: number;
  activeSeals: number;
}) {
  const remaining = Math.max(0, budget - spent);
  const pct = budget === 0 ? (spent > 0 ? 100 : 0) : Math.min(100, (spent / budget) * 100);
  return (
    <div className="mission-budget">
      <div className="budget-row">
        <span>Exotic credits</span>
        <span>
          {spent} spent / {budget} budget · {activeSeals} active
        </span>
      </div>
      <div className="budget-track" aria-hidden>
        <div
          className={`budget-fill ${remaining === 0 ? 'exhausted' : 'ok'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {remaining === 0 && (
        <div className="budget-hint">
          Budget exhausted — you can only toggle currently-active seals off.
        </div>
      )}
    </div>
  );
}
