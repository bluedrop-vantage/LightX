import { useCallback } from 'react';
import type { ConstructKind } from '../types/domain';
import { useStore } from '../state/store';
import { RECIPES, type Recipe } from '../constructs/recipes';
import { HelpButton } from './HelpButton';

interface Props {
  kind: ConstructKind;
  label?: string;
}

const OUTCOME_ICON: Record<Recipe['outcome'], string> = {
  real:'●',
  yellow: '◐',
  red: '✕',
};

const OUTCOME_CLASS: Record<Recipe['outcome'], string> = {
  real:'outcome-real',
  yellow: 'outcome-yellow',
  red: 'outcome-red',
};

export function RecipeShortcuts({ kind, label = 'Try a recipe' }: Props) {
  const recipes = RECIPES[kind] ?? [];
  const clearPlacements = useStore((s) => s.clearPlacements);
  const placeIngredient = useStore((s) => s.placeIngredient);
  const setParameter = useStore((s) => s.setParameter);

  const applyRecipe = useCallback(
    (r: Recipe) => {
      clearPlacements();
      for (const p of r.placements) placeIngredient(p);
      if (r.parameters) {
        for (const [k, v] of Object.entries(r.parameters)) setParameter(k, v);
      }
    },
    [clearPlacements, placeIngredient, setParameter],
  );

  if (recipes.length === 0) return null;

  return (
    <div className="recipe-shortcuts">
      <div className="recipe-shortcuts-label">
        {label}
        <HelpButton helpKey="recipe-shortcuts" />
      </div>
      <div className="recipe-shortcuts-buttons">
        {recipes.map((r, i) => (
          <button
            key={i}
            type="button"
            className={`recipe-btn ${OUTCOME_CLASS[r.outcome]}`}
            onClick={() => applyRecipe(r)}
            title={r.note}
          >
            <span className="recipe-outcome" aria-hidden>
              {OUTCOME_ICON[r.outcome]}
            </span>
            <span className="recipe-label">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
