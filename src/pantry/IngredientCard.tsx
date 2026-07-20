import { useState, useCallback } from 'react';
import type { IngredientDef } from '../types/domain';
import { useStore } from '../state/store';

interface Props {
  def: IngredientDef;
}

const STATUS_ICON: Record<IngredientDef['realStatus'], string> = {
  confirmed: '✔',
  inferred: '◎',
  observed: '◐',
  hypothetical: '⚠',
  speculative: '?',
};

export function IngredientCard({ def }: Props) {
  const [flipped, setFlipped] = useState(false);
  const setDragging = useStore((s) => s.setDragging);

  const onDragStart = useCallback(
    (ev: React.DragEvent<HTMLDivElement>) => {
      ev.dataTransfer.setData('application/x-ingredient', def.id);
      ev.dataTransfer.effectAllowed = 'copy';
      setDragging(def.id);
    },
    [def.id, setDragging],
  );

  const onDragEnd = useCallback(() => setDragging(null), [setDragging]);

  return (
    <div
      className={`ingredient-card ${flipped ? 'flipped' : ''} density-${def.energyDensity}`}
      draggable
      data-ingredient={def.id}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => setFlipped((f) => !f)}
      title="Click to flip. Drag onto a slot."
    >
      {!flipped ? (
        <div className="card-face front">
          <div className="card-header">
            <span className="card-name">{def.displayName}</span>
            <span className={`status status-${def.realStatus}`} title={def.realStatusLabel}>
              {STATUS_ICON[def.realStatus]} {def.realStatusLabel}
            </span>
          </div>
          <p className="card-body">{def.frontCopy}</p>
          <div className="card-tags">
            <span className={`tag energy-${def.energyDensity}`}>
              ρ:{' '}
              {def.energyDensity === 'positive'
                ? '+'
                : def.energyDensity === 'negative'
                  ? '−'
                  : '0'}
            </span>
            <span className={`tag gravity-${def.gravity}`}>
              gravity: {def.gravity}
            </span>
            {!def.shapeable && <span className="tag warn">unshapeable</span>}
            {def.topological && <span className="tag warn">topological</span>}
          </div>
        </div>
      ) : (
        <div className="card-face back">
          <div className="card-header">
            <span className="card-name">What physics says</span>
          </div>
          <p className="card-body">{def.flipSide}</p>
          {def.blockingTheorem && (
            <div className="card-cite">Cited: {def.blockingTheorem}</div>
          )}
        </div>
      )}
    </div>
  );
}
