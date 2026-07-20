import { useCallback, useState } from 'react';
import { EXAMPLE_PACK, loadStoredPack, parseMissionPack, saveStoredPack } from './pack';
import type { Mission } from '../types/domain';

interface Props {
  onPackLoaded: (extra: Mission[]) => void;
}

export function ClassroomLoader({ onPackLoaded }: Props) {
  const [text, setText] = useState(loadStoredPack() ? JSON.stringify(loadStoredPack(), null, 2) : '');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<string | null>(loadStoredPack()?.name ?? null);

  const load = useCallback(() => {
    try {
      const pack = parseMissionPack(text);
      saveStoredPack(pack);
      onPackLoaded(pack.missions);
      setLoaded(pack.name);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }, [text, onPackLoaded]);

  const clear = useCallback(() => {
    saveStoredPack(null);
    onPackLoaded([]);
    setLoaded(null);
    setText('');
  }, [onPackLoaded]);

  const loadExample = useCallback(() => setText(EXAMPLE_PACK), []);

  return (
    <div className="classroom-loader">
      <div className="classroom-header">
        <strong>Classroom pack</strong>
        {loaded && <span className="classroom-loaded">loaded: {loaded}</span>}
      </div>
      <textarea
        rows={6}
        placeholder="Paste a JSON mission pack…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <div className="classroom-error">{error}</div>}
      <div className="classroom-actions">
        <button type="button" onClick={load}>Load pack</button>
        <button type="button" onClick={loadExample}>Insert example</button>
        <button type="button" onClick={clear}>Clear</button>
      </div>
    </div>
  );
}
