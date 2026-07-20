import { useEffect } from 'react';
import { getTheorem } from '../physics/theorems';

interface Props {
  citation: string | null;
  onClose: () => void;
}

export function TheoremExplainer({ citation, onClose }: Props) {
  useEffect(() => {
    if (citation === null) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [citation, onClose]);

  if (citation === null) return null;
  const entry = getTheorem(citation);

  return (
    <div className="theorem-explainer" role="dialog" aria-modal="true" aria-label="Theorem explainer">
      <div className="theorem-backdrop" onClick={onClose} />
      <div className="theorem-panel">
        <button type="button" className="theorem-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {entry ? (
          <>
            <div className="theorem-eyebrow">Blocking principle</div>
            <h2>{entry.title}</h2>
            <p className="theorem-body">{entry.oneScreen}</p>
            <p className="theorem-citation">{entry.citation}</p>
          </>
        ) : (
          <>
            <div className="theorem-eyebrow">No explainer available</div>
            <h2>{citation}</h2>
            <p className="theorem-body">
              This citation is not linked to a one-screen explainer yet. The relevant seal is still logged with the label above.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
