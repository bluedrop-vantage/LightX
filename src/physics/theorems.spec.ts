import { describe, it, expect } from 'vitest';
import { getTheorem } from './theorems';

describe('getTheorem', () => {
  it('resolves by internal id', () => {
    expect(getTheorem('alcubierre1994')?.title).toMatch(/warp metric/i);
    expect(getTheorem('maldacenaMilekhin2020')?.title).toMatch(/traversable wormhole/i);
  });

  it('resolves by short citation alias (as used in seals)', () => {
    expect(getTheorem('Alcubierre 1994')?.id).toBe('alcubierre1994');
    expect(getTheorem('Ford–Roman 1995')?.id).toBe('fordRoman1995');
    expect(getTheorem('Hawking 1992')?.id).toBe('hawkingChronology1992');
    expect(getTheorem('Maldacena–Milekhin 2020')?.id).toBe('maldacenaMilekhin2020');
  });

  it('returns undefined for unknown citations', () => {
    expect(getTheorem('nonexistent')).toBeUndefined();
    expect(getTheorem('braneworld (speculative)')).toBeUndefined();
  });

  it('every theorem has a one-screen body', () => {
    for (const id of [
      'alcubierre1994',
      'morrisThorne1988',
      'fordRoman1995',
      'hawkingChronology1992',
      'olumSuperluminal1998',
      'maldacenaMilekhin2020',
      'alphaG2023',
    ]) {
      const t = getTheorem(id);
      expect(t).toBeDefined();
      expect(t!.oneScreen.length).toBeGreaterThan(80);
    }
  });
});
