import type { SealName } from '../types/domain';
import { HelpButton } from './HelpButton';

interface Props {
  seal: SealName;
  label: string;
  active: boolean;
  disabled?: boolean;
  onToggle: () => void;
  helpKey?: string;
}

export function SealBreakBadge({ label, active, disabled, onToggle, helpKey }: Props) {
  return (
    <div className="seal-badge-row">
      <button
        type="button"
        className={`seal-badge ${active ? 'broken' : 'sealed'} ${disabled ? 'disabled' : ''}`}
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={active}
      >
        <span className="seal-icon" aria-hidden>
          {active ? '⚡' : '🔒'}
        </span>
        <span className="seal-label">{label}</span>
        <span className="seal-state">{active ? 'BROKEN' : 'sealed'}</span>
      </button>
      {helpKey && <HelpButton helpKey={helpKey} />}
    </div>
  );
}
