import type { Mission } from '../types/domain';

interface MissionPack {
  name: string;
  author?: string;
  missions: Mission[];
}

const PACK_KEY = 'exotic-pantry:missionPack:v1';

const REQUIRED_FIELDS: (keyof Mission)[] = ['id', 'title', 'origin', 'destination', 'mode', 'goal'];

export function parseMissionPack(raw: string): MissionPack {
  const parsed = JSON.parse(raw) as unknown;
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Pack must be a JSON object.');
  }
  const p = parsed as Record<string, unknown>;
  if (typeof p.name !== 'string') throw new Error('Pack missing "name".');
  if (!Array.isArray(p.missions)) throw new Error('Pack missing "missions" array.');
  const missions: Mission[] = [];
  for (const raw of p.missions) {
    if (typeof raw !== 'object' || raw === null) throw new Error('Each mission must be an object.');
    const m = raw as Record<string, unknown>;
    for (const f of REQUIRED_FIELDS) {
      if (m[f] === undefined) throw new Error(`Mission missing "${f}".`);
    }
    missions.push({
      id: String(m.id),
      title: String(m.title),
      origin: m.origin as Mission['origin'],
      destination: m.destination as Mission['destination'],
      mode: m.mode as Mission['mode'],
      goal: m.goal as Mission['goal'],
      ...(typeof m.exoticCreditBudget === 'number' ? { exoticCreditBudget: m.exoticCreditBudget } : {}),
    });
  }
  const pack: MissionPack = { name: p.name, missions };
  if (typeof p.author === 'string') pack.author = p.author;
  return pack;
}

export function loadStoredPack(): MissionPack | null {
  try {
    const raw = window.localStorage.getItem(PACK_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MissionPack;
  } catch {
    return null;
  }
}

export function saveStoredPack(pack: MissionPack | null): void {
  if (pack === null) {
    window.localStorage.removeItem(PACK_KEY);
    return;
  }
  window.localStorage.setItem(PACK_KEY, JSON.stringify(pack));
}

export const EXAMPLE_PACK = `{
  "name": "Interstellar Basics",
  "author": "teacher@school",
  "missions": [
    {
      "id": "warp-mars",
      "title": "Reach Mars with a warp bubble, ≤ 1 seal broken",
      "origin": "earth",
      "destination": "mars",
      "mode": "classroom",
      "goal": "fewestSeals",
      "exoticCreditBudget": 1
    },
    {
      "id": "wormhole-proxima-safe",
      "title": "Traversable wormhole to Proxima (Maldacena mode encouraged)",
      "origin": "earth",
      "destination": "proxima",
      "mode": "classroom",
      "goal": "reach",
      "exoticCreditBudget": 2
    }
  ]
}`;
