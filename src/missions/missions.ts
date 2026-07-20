import type { Mission } from '../types/domain';

export const MISSIONS: Mission[] = [
  {
    id: 'sandbox',
    title: 'Sandbox — unlimited exotic credits',
    origin: 'earth',
    destination: 'proxima',
    mode: 'sandbox',
    goal: 'reach',
  },
  {
    id: 'proxima-shortest',
    title: 'Proxima — reach it, seals be damned',
    origin: 'earth',
    destination: 'proxima',
    mode: 'challenge',
    goal: 'reach',
    exoticCreditBudget: 5,
  },
  {
    id: 'proxima-fewest',
    title: 'Proxima — with the fewest seals broken',
    origin: 'earth',
    destination: 'proxima',
    mode: 'challenge',
    goal: 'fewestSeals',
    exoticCreditBudget: 3,
  },
  {
    id: 'forward-time',
    title: 'Forward time-travel cruise (zero seals)',
    origin: 'earth',
    destination: 'andromeda',
    mode: 'classroom',
    goal: 'zeroSeals',
    exoticCreditBudget: 0,
  },
  {
    id: 'mars-rocket',
    title: 'Mars — ordinary-rocket run (zero seals)',
    origin: 'earth',
    destination: 'mars',
    mode: 'classroom',
    goal: 'zeroSeals',
    exoticCreditBudget: 0,
  },
];

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}
