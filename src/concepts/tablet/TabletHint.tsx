import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode, type RefObject } from 'react';
import type { TabletInput } from './tabletDevices';

// UX-024: every icon-led control carries a hint. Pointer mode: the native hover title. Touch mode: press and hold for about
// 500 ms shows a hint bubble (and swallows that press, so holding does not activate the control).
export const HOLD_MS = 500;
const SHOW_MS = 1800;

export function HintButton({ hint, input, side = 'right', wrapClassName = '', onClick, children, ...rest }: {
  hint: string; input: TabletInput; side?: 'right' | 'top' | 'bottom'; wrapClassName?: string; onClick?: (event: MouseEvent<HTMLButtonElement>) => void; children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'onClick'>) {
  const [shown, setShown] = useState(false);
  const hold = useRef<number>(undefined);
  const hide = useRef<number>(undefined);
  const held = useRef(false);
  const id = useId();
  useEffect(() => () => { window.clearTimeout(hold.current); window.clearTimeout(hide.current); }, []);
  const touch = input === 'touch';
  const start = () => {
    if (!touch) return;
    held.current = false;
    window.clearTimeout(hide.current);
    hold.current = window.setTimeout(() => { held.current = true; setShown(true); }, HOLD_MS);
  };
  const end = () => {
    window.clearTimeout(hold.current);
    if (!held.current) return;
    window.clearTimeout(hide.current);
    hide.current = window.setTimeout(() => { setShown(false); held.current = false; }, SHOW_MS);
  };
  return <span className={`tb-hint-wrap ${wrapClassName}`}>
    <button type="button" {...rest} title={touch ? undefined : hint} aria-describedby={shown ? id : undefined}
      onPointerDown={start} onPointerUp={end} onPointerLeave={end} onPointerCancel={end} onContextMenu={event => { if (touch) event.preventDefault(); }}
      onClick={event => { if (held.current) { event.preventDefault(); held.current = false; return; } onClick?.(event); }}>{children}</button>
    {shown && <span id={id} role="tooltip" className={`tb-hint-bubble ${side}`}>{hint}</span>}
  </span>;
}

/** Icon-only buttons that come from shared pieces (steppers, the workspace source flows, a field's clear button) are not
 *  HintButtons. This layer gives them the same hint: press and hold shows their label in a bubble on touch (and swallows that
 *  press); with a pointer their label becomes the hover title when they have none. It works on the app root by delegation. */
export function IconHints({ root, input }: { root: RefObject<HTMLElement | null>; input: TabletInput }) {
  const [bubble, setBubble] = useState<{ text: string; x: number; y: number; below: boolean } | null>(null);
  useEffect(() => {
    const host = root.current; if (!host) return;
    let hold: number | undefined; let hide: number | undefined; let held = false;
    const iconButton = (t: EventTarget | null) => {
      const el = (t as HTMLElement | null)?.closest?.('button');
      if (!el || !host.contains(el) || el.closest('.tb-hint-wrap') || (el.textContent ?? '').trim()) return null;
      return el.getAttribute('aria-label') || el.getAttribute('title') ? el : null;
    };
    const label = (el: HTMLElement) => el.getAttribute('title') || el.getAttribute('aria-label') || '';
    const over = (e: PointerEvent) => { if (input !== 'pointer') return; const el = iconButton(e.target); if (el && !el.title) el.title = label(el); };
    const down = (e: PointerEvent) => {
      if (input !== 'touch') return; const el = iconButton(e.target); if (!el) return;
      held = false; window.clearTimeout(hold); window.clearTimeout(hide);
      hold = window.setTimeout(() => {
        held = true;
        const box = host.getBoundingClientRect(); const r = el.getBoundingClientRect(); const k = box.width / host.offsetWidth || 1;
        const below = r.top - box.top < 80 * k;
        setBubble({ text: label(el), x: (r.left + r.width / 2 - box.left) / k, y: ((below ? r.bottom : r.top) - box.top) / k, below });
      }, HOLD_MS);
    };
    const up = () => { window.clearTimeout(hold); if (held) hide = window.setTimeout(() => { setBubble(null); held = false; }, SHOW_MS); };
    const click = (e: Event) => { if (held && iconButton(e.target)) { e.preventDefault(); e.stopPropagation(); held = false; } };
    const menu = (e: Event) => { if (input === 'touch' && iconButton(e.target)) e.preventDefault(); };
    host.addEventListener('pointerover', over); host.addEventListener('pointerdown', down); host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up); host.addEventListener('pointerleave', up);
    host.addEventListener('click', click, true); host.addEventListener('contextmenu', menu);
    return () => { window.clearTimeout(hold); window.clearTimeout(hide); host.removeEventListener('pointerover', over); host.removeEventListener('pointerdown', down); host.removeEventListener('pointerup', up); host.removeEventListener('pointercancel', up); host.removeEventListener('pointerleave', up); host.removeEventListener('click', click, true); host.removeEventListener('contextmenu', menu); };
  }, [root, input]);
  if (!bubble) return null;
  return <span role="tooltip" className={`tb-hint-bubble tb-hint-float ${bubble.below ? 'below' : 'above'}`} style={{ left: bubble.x, top: bubble.y }}>{bubble.text}</span>;
}
