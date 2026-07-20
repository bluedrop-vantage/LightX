import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  Construct,
  ConstructKind,
  IngredientId,
  IngredientPlacement,
  Mission,
  SealBreak,
  SealName,
  UiMode,
  Verdict,
} from '../types/domain';
import { buildVerdict } from '../physics/verdict';
import { storage } from '../storage/storage';
import { STORAGE_KEYS } from '../storage/schema';

const initialWarp: Construct = {
  kind: 'warp',
  placements: [],
  parameters: { v_s: 0.5, wallThickness: 1, energyBudget: 1 },
};

const initialWormhole: Construct = {
  kind: 'wormhole',
  placements: [],
  parameters: {
    throatRadius: 1,
    mouthTimeOffset: 0,
    mouthSeparation: 3,
  },
};

function initialConstructFor(kind: ConstructKind): Construct {
  switch (kind) {
    case 'warp':
      return { ...initialWarp, placements: [], parameters: { ...initialWarp.parameters } };
    case 'wormhole':
      return {
        ...initialWormhole,
        placements: [],
        parameters: { ...initialWormhole.parameters },
      };
    case 'krasnikov':
      return {
        kind: 'krasnikov',
        placements: [],
        parameters: { v_s: 1, wallThickness: 0.7 },
      };
    case 'hyperspace':
      return {
        kind: 'hyperspace',
        placements: [],
        parameters: { portalEnergy: 1 },
      };
    default:
      return { kind, placements: [], parameters: {} };
  }
}

export type MainView = 'construct' | 'community';

export interface StoreState {
  uiMode: UiMode | null;
  setUiMode: (mode: UiMode) => void;

  activeView: MainView;
  setActiveView: (view: MainView) => void;

  activeKind: ConstructKind;
  activeConstruct: Construct;
  verdict: Verdict | null;

  activeSeals: SealName[];
  toggleSeal: (seal: SealName) => void;

  setActiveKind: (kind: ConstructKind) => void;
  setParameter: (name: string, value: number) => void;
  placeIngredient: (placement: IngredientPlacement) => void;
  removePlacement: (index: number) => void;
  clearPlacements: () => void;

  sealLog: SealBreak[];
  recordSeal: (seal: SealBreak) => void;

  dragging: IngredientId | null;
  setDragging: (id: IngredientId | null) => void;

  highlighted: string | null;
  setHighlight: (id: string | null) => void;

  activeMission: Mission | null;
  creditsSpent: number;
  canBreak: (seal: SealName) => boolean;
  setActiveMission: (m: Mission | null) => void;
}

export const useStore = create<StoreState>()(
  subscribeWithSelector((set, get) => ({
    uiMode: storage.get<UiMode>(STORAGE_KEYS.mode) ?? null,
    setUiMode: (mode) => {
      storage.set(STORAGE_KEYS.mode, mode);
      set({ uiMode: mode });
    },

    activeView: 'construct',
    setActiveView: (view) => set({ activeView: view }),

    activeKind: 'warp',
    activeConstruct: initialConstructFor('warp'),
    verdict: null,

    activeSeals: [],
    toggleSeal: (seal) => {
      const mission = get().activeMission;
      const active = get().activeSeals;
      const alreadyActive = active.includes(seal);
      if (!alreadyActive && mission?.exoticCreditBudget !== undefined) {
        if (get().creditsSpent >= mission.exoticCreditBudget) return;
        set({ creditsSpent: get().creditsSpent + 1 });
      }
      const next = alreadyActive ? active.filter((s) => s !== seal) : [...active, seal];
      set({ activeSeals: next });
      recompute(get, set);
    },

    setActiveKind: (kind) => {
      set({
        activeKind: kind,
        activeConstruct: initialConstructFor(kind),
        verdict: null,
      });
      recompute(get, set);
    },

    setParameter: (name, value) => {
      const c = get().activeConstruct;
      const next: Construct = {
        ...c,
        parameters: { ...c.parameters, [name]: value },
      };
      set({ activeConstruct: next });
      recompute(get, set);
    },

    placeIngredient: (placement) => {
      const c = get().activeConstruct;
      set({
        activeConstruct: {
          ...c,
          placements: [...c.placements, placement],
        },
      });
      recompute(get, set);
    },

    removePlacement: (index) => {
      const c = get().activeConstruct;
      set({
        activeConstruct: {
          ...c,
          placements: c.placements.filter((_, i) => i !== index),
        },
      });
      recompute(get, set);
    },

    clearPlacements: () => {
      const c = get().activeConstruct;
      set({ activeConstruct: { ...c, placements: [] } });
      recompute(get, set);
    },

    sealLog: storage.get<SealBreak[]>(STORAGE_KEYS.sealLog) ?? [],
    recordSeal: (entry) => {
      const next = [...get().sealLog, entry].slice(-500);
      storage.set(STORAGE_KEYS.sealLog, next);
      set({ sealLog: next });
    },

    dragging: null,
    setDragging: (id) => set({ dragging: id }),

    highlighted: null,
    setHighlight: (id) => set({ highlighted: id }),

    activeMission: null,
    creditsSpent: 0,
    canBreak: (seal) => {
      const m = get().activeMission;
      if (!m || m.exoticCreditBudget === undefined) return true;
      if (get().activeSeals.includes(seal)) return true;
      return get().creditsSpent < m.exoticCreditBudget;
    },
    setActiveMission: (m) => set({ activeMission: m, creditsSpent: 0, activeSeals: [] }),
  })),
);

function recompute(get: () => StoreState, set: (partial: Partial<StoreState>) => void): void {
  const state = get();
  const verdict = buildVerdict({
    construct: state.activeConstruct,
    activeSeals: state.activeSeals,
    ...(state.activeMission?.id !== undefined ? { missionId: state.activeMission.id } : {}),
    onSealBreak: (entry) => state.recordSeal(entry),
  });
  set({ verdict });
}

recompute(useStore.getState, (partial) => useStore.setState(partial));
