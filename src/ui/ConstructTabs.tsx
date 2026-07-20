import type { ConstructKind } from '../types/domain';
import { useStore } from '../state/store';
import { MissionRunner } from '../missions/MissionRunner';
import { HelpButton } from './HelpButton';

const TABS: Array<{ kind: ConstructKind | 'community'; label: string; hint: string }> = [
  { kind: 'warp', label: 'Warp Bubble', hint: 'Alcubierre construction' },
  { kind: 'wormhole', label: 'Wormhole', hint: 'Morris–Thorne + Maldacena mode' },
  { kind: 'krasnikov', label: 'Krasnikov Tube', hint: 'Route-laying warp' },
  { kind: 'hyperspace', label: 'Hyperspace', hint: 'Brane portal (beyond known physics)' },
  { kind: 'custom', label: 'Free Build', hint: 'Paint your own energy field' },
  { kind: 'community', label: 'Community', hint: 'Gallery + classroom mission pack' },
];

export function ConstructTabs() {
  const activeKind = useStore((s) => s.activeKind);
  const activeView = useStore((s) => s.activeView);
  const setActiveKind = useStore((s) => s.setActiveKind);
  const setActiveView = useStore((s) => s.setActiveView);
  return (
    <nav className="construct-tabs" aria-label="Constructs">
      {TABS.map((t) => (
        <button
          key={t.kind}
          type="button"
          className={
            t.kind === 'community'
              ? activeView === 'community' ? 'active' : ''
              : activeView === 'construct' && activeKind === t.kind ? 'active' : ''
          }
          onClick={() => {
            if (t.kind === 'community') {
              setActiveView('community');
            } else {
              setActiveView('construct');
              setActiveKind(t.kind);
            }
          }}
          title={t.hint}
        >
          {t.label}
        </button>
      ))}
      <div className="tabs-right">
        <span className="tabs-mission-hint">
          <MissionRunner />
          <HelpButton helpKey="mission" />
        </span>
        <span className="tabs-mode-hint">
          Depth: <ModeChanger />
          <HelpButton helpKey="ui-mode" />
        </span>
      </div>
    </nav>
  );
}

function ModeChanger() {
  const uiMode = useStore((s) => s.uiMode);
  const setUiMode = useStore((s) => s.setUiMode);
  return (
    <select
      className="mode-select"
      value={uiMode ?? 'student'}
      onChange={(e) => setUiMode(e.target.value as 'story' | 'student' | 'physicist')}
    >
      <option value="story">Story</option>
      <option value="student">Student</option>
      <option value="physicist">Physicist</option>
    </select>
  );
}
