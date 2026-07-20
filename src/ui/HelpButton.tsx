import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HELP_ENTRIES } from './helpContent';

interface Props {
  helpKey: string;
  label?: string;
}

interface PopoverPos {
  top: number;
  left: number;
  arrow: 'top' | 'bottom';
}

const POPOVER_WIDTH = 320;
const MARGIN = 8;
const GAP = 6;

export function HelpButton({ helpKey, label }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const computePosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    let left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
    left = Math.max(MARGIN, Math.min(vpW - POPOVER_WIDTH - MARGIN, left));

    const popoverH = popoverRef.current?.offsetHeight ?? 180;
    const wantBottom = rect.bottom + GAP + popoverH < vpH - MARGIN;
    const arrow: PopoverPos['arrow'] = wantBottom ? 'top' : 'bottom';
    const top = wantBottom ? rect.bottom + GAP : rect.top - GAP - popoverH;
    setPos({ top, left, arrow });
  };

  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !popoverRef.current) return;
    computePosition();
  }, [open, helpKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(t) &&
        buttonRef.current &&
        !buttonRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const entry = HELP_ENTRIES[helpKey];

  return (
    <span className="help-wrap">
      <button
        ref={buttonRef}
        type="button"
        className={`help-btn ${open ? 'active' : ''}`}
        aria-label={label ?? `Help: ${entry?.title ?? helpKey}`}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        ?
      </button>
      {open && entry && pos && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={popoverRef}
              className={`help-popover help-popover-${pos.arrow}`}
              role="dialog"
              aria-label={entry.title}
              style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
            >
              <div className="help-popover-eyebrow">Help</div>
              <div className="help-popover-title">{entry.title}</div>
              <div className="help-popover-body">{entry.body}</div>
              {entry.spec && <div className="help-popover-spec">{entry.spec}</div>}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
