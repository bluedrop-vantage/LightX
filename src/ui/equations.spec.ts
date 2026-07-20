import { describe, it, expect } from 'vitest';
import { expandLinkMacros } from './equations';

describe('expandLinkMacros', () => {
  it('rewrites \\link{id}{term} into an \\htmlClass wrapper', () => {
    expect(expandLinkMacros('\\link{pantry}{T_{\\mu\\nu}}')).toBe('\\htmlClass{link-pantry}{T_{\\mu\\nu}}');
  });

  it('rewrites multiple link macros in one source', () => {
    const src = '\\link{mesh}{G_{\\mu\\nu}} = \\link{pantry}{T_{\\mu\\nu}}';
    const out = expandLinkMacros(src);
    expect(out).toBe('\\htmlClass{link-mesh}{G_{\\mu\\nu}} = \\htmlClass{link-pantry}{T_{\\mu\\nu}}');
  });

  it('is a no-op when no \\link macro is present', () => {
    const src = 'ds^2 = -dt^2 + dx^2';
    expect(expandLinkMacros(src)).toBe(src);
  });
});
