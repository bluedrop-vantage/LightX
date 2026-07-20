export interface TheoremEntry {
  id: string;
  title: string;
  citation: string;
  oneScreen: string;
}

export const THEOREMS: Record<string, TheoremEntry> = {
  alcubierre1994: {
    id: 'alcubierre1994',
    title: 'Alcubierre warp metric',
    citation: 'Alcubierre, M. (1994). "The warp drive: hyper-fast travel within general relativity." Class. Quantum Grav. 11, L73.',
    oneScreen:
      'A metric that contracts space ahead of and expands space behind a bubble, letting the bubble surf faster than light while nothing inside moves faster than light locally. Requires a shell of negative energy density — a stress-energy tensor that violates every classical energy condition.',
  },
  morrisThorne1988: {
    id: 'morrisThorne1988',
    title: 'Morris–Thorne traversable wormhole',
    citation: 'Morris, M. S. & Thorne, K. S. (1988). "Wormholes in spacetime and their use for interstellar travel." Am. J. Phys. 56, 395.',
    oneScreen:
      'Static, spherically symmetric wormholes are traversable only when a "flare-out" condition holds at the throat — which forces the null energy condition to be violated. Only negative-energy matter can pry the throat open against gravitational collapse.',
  },
  fordRoman1995: {
    id: 'fordRoman1995',
    title: 'Ford–Roman quantum inequalities',
    citation: 'Ford, L. H. & Roman, T. A. (1995). "Averaged energy conditions and quantum inequalities." Phys. Rev. D 51, 4277.',
    oneScreen:
      'Quantum field theory allows brief negative-energy excursions, but any sustained negative energy density is bounded: |⟨T_00⟩| · τ² ≲ ℏ / (const). Bulk, long-lived negative-energy shells needed for macroscopic warp drives and wormholes exceed this bound by many orders of magnitude.',
  },
  hawkingChronology1992: {
    id: 'hawkingChronology1992',
    title: 'Hawking chronology protection',
    citation: 'Hawking, S. W. (1992). "The chronology protection conjecture." Phys. Rev. D 46, 603.',
    oneScreen:
      'Vacuum fluctuations diverge at the chronology horizon, plausibly preventing the formation of closed timelike curves and "making the universe safe for historians." Any construct that would produce a CTC (crossing warps, desynchronized wormhole mouths) triggers the alarm.',
  },
  olumSuperluminal1998: {
    id: 'olumSuperluminal1998',
    title: 'Olum superluminal energy-condition theorem',
    citation: 'Olum, K. D. (1998). "Superluminal travel requires negative energy density." Phys. Rev. Lett. 81, 3567.',
    oneScreen:
      'Any spacetime that allows an observer to travel between two points faster than a light signal in Minkowski space requires a region of negative energy density along the path. Formalizes the intuition behind Alcubierre and its variants.',
  },
  maldacenaMilekhin2020: {
    id: 'maldacenaMilekhin2020',
    title: 'Maldacena–Milekhin traversable wormhole',
    citation: 'Maldacena, J. & Milekhin, A. (2020). "Humanly traversable wormholes." Phys. Rev. D 103, 066007.',
    oneScreen:
      'A construction using a coupling to a hypothetical dark-sector U(1) gauge field with charged fermions. The Casimir-like energy of the fermion field holds the throat open — no exotic-matter shell required — but the traversal is strictly slower than the outside light-travel time between mouths. No chronology-protection violation.',
  },
  alphaG2023: {
    id: 'alphaG2023',
    title: 'ALPHA-g antihydrogen freefall',
    citation: 'Anderson, E. K. et al. (ALPHA Collaboration, 2023). "Observation of the effect of gravity on the motion of antimatter." Nature 621, 716.',
    oneScreen:
      'Direct measurement of antihydrogen atoms freefalling in Earth\'s gravity. Antimatter falls DOWN with acceleration consistent with 1 g — the same as ordinary matter. Antimatter has attractive gravity, not repulsive.',
  },
};

const CITATION_ALIASES: Record<string, string> = {
  'Alcubierre 1994': 'alcubierre1994',
  'Morris–Thorne 1988': 'morrisThorne1988',
  'Ford–Roman 1995': 'fordRoman1995',
  'Hawking 1992': 'hawkingChronology1992',
  'Olum 1998': 'olumSuperluminal1998',
  'Maldacena–Milekhin 2020': 'maldacenaMilekhin2020',
  'ALPHA-g 2023': 'alphaG2023',
};

export function getTheorem(idOrCitation: string): TheoremEntry | undefined {
  if (THEOREMS[idOrCitation]) return THEOREMS[idOrCitation];
  const alias = CITATION_ALIASES[idOrCitation];
  return alias ? THEOREMS[alias] : undefined;
}
