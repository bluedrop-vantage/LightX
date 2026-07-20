import { INGREDIENTS, MVP_INGREDIENTS, PHASE3_INGREDIENTS } from './ingredients';
import { IngredientCard } from './IngredientCard';
import { useStore } from '../state/store';

export function PantryRack() {
  const activeKind = useStore((s) => s.activeKind);
  const showPhase3 = activeKind === 'wormhole' || activeKind === 'hyperspace' || activeKind === 'custom';

  return (
    <aside className="pantry-rack" aria-label="Pantry">
      <h2>Pantry</h2>
      <p className="pantry-hint">Drag an ingredient onto a slot in the constructor.</p>
      <div className="pantry-cards">
        {MVP_INGREDIENTS.map((id) => (
          <IngredientCard key={id} def={INGREDIENTS[id]} />
        ))}
      </div>
      {showPhase3 && (
        <>
          <h3 className="pantry-subhead">Advanced</h3>
          <div className="pantry-cards">
            {PHASE3_INGREDIENTS.map((id) => (
              <IngredientCard key={id} def={INGREDIENTS[id]} />
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
