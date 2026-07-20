import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { EQUATIONS, expandLinkMacros } from './equations';
import { useStore } from '../state/store';
import { EquationTutor } from './EquationTutor';

interface Props {
  keys: string[];
}

export function EquationsPanel({ keys }: Props) {
  const mode = useStore((s) => s.uiMode) ?? 'student';
  const setHighlight = useStore((s) => s.setHighlight);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeEq, setActiveEq] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const nodes = containerRef.current.querySelectorAll<HTMLElement>('[data-katex]');
    nodes.forEach((node) => {
      const src = node.getAttribute('data-katex') ?? '';
      try {
        katex.render(expandLinkMacros(src), node, {
          throwOnError: false,
          displayMode: false,
          trust: (ctx) => ctx.command === '\\htmlClass',
          strict: 'ignore',
        });
      } catch {
        node.textContent = src;
      }
    });

    const linkedTerms = containerRef.current.querySelectorAll<HTMLElement>(
      '[class*="link-"]',
    );
    const handlers: Array<[HTMLElement, () => void, () => void]> = [];
    linkedTerms.forEach((el) => {
      const linkClass = Array.from(el.classList).find((c) => c.startsWith('link-'));
      if (!linkClass) return;
      const id = linkClass.slice('link-'.length);
      el.classList.add('term-link');
      const onEnter = () => setHighlight(id);
      const onLeave = () => setHighlight(null);
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      handlers.push([el, onEnter, onLeave]);
    });

    return () => {
      for (const [el, onEnter, onLeave] of handlers) {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      }
    };
  }, [keys, mode, setHighlight]);

  return (
    <>
      <section className="equations-panel" ref={containerRef} aria-label="Equations">
        <div className="equations-mode">
          Depth: {mode}
          <span className="equations-hint">· click an equation to open the tutor</span>
        </div>
        <ul>
          {keys.map((k) => {
            const eq = EQUATIONS[k];
            if (!eq) return null;
            return (
              <li key={k} className="equation">
                <button
                  type="button"
                  className="equation-open-tutor"
                  onClick={() => setActiveEq(k)}
                  aria-label={`Open tutor for ${eq.title}`}
                >
                  <div className="equation-title">
                    {eq.title}
                    <span className="equation-tutor-cue">Tutor →</span>
                  </div>
                  {mode === 'story' ? (
                    <p className="equation-story">{eq.story}</p>
                  ) : (
                    <>
                      <div className="equation-katex" data-katex={eq.katex} />
                      {mode === 'physicist' && eq.reference && (
                        <div className="equation-ref">{eq.reference}</div>
                      )}
                      <p className="equation-story dim">{eq.story}</p>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <EquationTutor equationKey={activeEq} onClose={() => setActiveEq(null)} />
    </>
  );
}
