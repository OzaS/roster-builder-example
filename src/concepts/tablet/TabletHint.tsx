import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
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
