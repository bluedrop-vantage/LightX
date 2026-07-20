import { useStore } from '../state/store';
import type { UiMode } from '../types/domain';
import { LogoMark } from './LogoMark';

const OPTIONS: Array<{ mode: UiMode; title: string; body: string }> = [
  {
    mode: 'story',
    title: 'Story',
    body: 'Plain-language captions. No equations on screen. Best for a first look.',
  },
  {
    mode: 'student',
    title: 'Student',
    body: 'Key relations rendered in KaTeX with hover links to the canvas. Undergraduate-friendly.',
  },
  {
    mode: 'physicist',
    title: 'Physicist',
    body: 'Full expressions, numerics readouts, references. For the deep end.',
  },
];

export function ModePicker() {
  const setUiMode = useStore((s) => s.setUiMode);
  return (
    <div className="mode-picker" role="dialog" aria-modal="true" aria-label="Choose a depth mode">
      <div className="mode-picker-panel">
        <h1 className="mode-picker-title">
          <LogoMark size={30} />
          LightX
        </h1>
        <p className="mode-picker-tagline">
          The geometry was never the problem. Stock the pantry and see.
        </p>
        <p className="mode-picker-intro">
          Pick the depth at which the physics is presented. You can change modes later.
        </p>
        <div className="mode-options">
          {OPTIONS.map((o) => (
            <button key={o.mode} type="button" onClick={() => setUiMode(o.mode)}>
              <div className="mode-title">{o.title}</div>
              <div className="mode-body">{o.body}</div>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mode-skip"
          onClick={() => setUiMode('student')}
        >
          Skip (default to Student)
        </button>
      </div>
    </div>
  );
}
