import { useCallback, useState } from 'react';
import type { IngredientId, SlotName } from '../types/domain';
import { getIngredient } from '../pantry/ingredients';
import { useStore } from '../state/store';

interface Props {
  slot: SlotName;
  label: string;
  hint?: string;
  accept?: (id: IngredientId) => boolean;
}

export function Slot({ slot, label, hint, accept }: Props) {
  const place = useStore((s) => s.placeIngredient);
  const removePlacement = useStore((s) => s.removePlacement);
  const placements = useStore((s) => s.activeConstruct.placements);
  const [hover, setHover] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);

  const local = placements
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => p.slot === slot);

  const onDragOver = useCallback((ev: React.DragEvent) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'copy';
    setHover(true);
  }, []);
  const onDragLeave = useCallback(() => setHover(false), []);
  const onDrop = useCallback(
    (ev: React.DragEvent) => {
      ev.preventDefault();
      setHover(false);
      const id = ev.dataTransfer.getData('application/x-ingredient') as IngredientId;
      if (!id) return;
      const def = getIngredient(id);
      if (accept && !accept(id)) {
        setRejected(`${def.displayName} cannot go here — ${def.shapeable ? 'wrong role' : 'unshapeable substance'}.`);
        setTimeout(() => setRejected(null), 2500);
        return;
      }
      place({ ingredient: id, amount: 1, slot });
    },
    [accept, place, slot],
  );

  return (
    <div
      className={`slot ${hover ? 'hover' : ''} ${rejected ? 'rejected' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="slot-label">{label}</div>
      {hint && <div className="slot-hint">{hint}</div>}
      <ul className="slot-items">
        {local.length === 0 && <li className="slot-empty">(empty)</li>}
        {local.map(({ p, index }) => {
          const def = getIngredient(p.ingredient);
          return (
            <li key={index} className={`slot-item density-${def.energyDensity}`}>
              <span>{def.displayName} ×{p.amount.toFixed(0)}</span>
              <button
                type="button"
                className="slot-remove"
                onClick={() => removePlacement(index)}
                aria-label={`Remove ${def.displayName}`}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
      {rejected && <div className="slot-reject" role="status">{rejected}</div>}
    </div>
  );
}
