import { useEffect, useId, useRef, type FocusEvent, type ReactNode } from 'react';
import './tablet-sheet.css';

// The tablet form sheet (plan: "Creation and other dialogs"): the desktop dialog layout with the mobile controls inside.
// A centred sheet over a scrim with a header of Cancel · title · primary action. When its window is narrow (split view,
// under 700 px) it fills the window height instead. It positions itself inside the nearest positioned ancestor (the editor
// or the app root), so a device frame in the gallery keeps it inside the frame.
// It takes focus (`[data-autofocus]` or the first field), keeps Tab inside, closes on Escape and a tap on the scrim, and
// scrolls a focused field into the visible part of the sheet (the keyboard never hides the focused field).

export type SheetAction = { label: string; onClick: () => void; disabled?: boolean; icon?: ReactNode; destructive?: boolean };

export function TabletSheet({ title, sub, action, cancelLabel = 'Cancel', wide = false, onClose, children }: {
  title: string; sub?: ReactNode;
  /** The primary action of the header (right). Enter in a single-line field runs it too. */
  action?: SheetAction;
  cancelLabel?: string;
  /** Roomier variant for two-column content such as the export preview. */
  wide?: boolean;
  onClose: () => void; children: ReactNode;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const nodes = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []).filter(el => !el.hasAttribute('disabled'));
    (ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current?.querySelector<HTMLElement>('.tbs-body input, .tbs-body select, .tbs-body textarea, .tbs-body button') ?? nodes()[0])?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); return; }
      if (e.key !== 'Tab') return;
      const list = nodes(); const first = list[0]; const last = list[list.length - 1];
      if (!ref.current?.contains(document.activeElement)) { e.preventDefault(); first?.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previous?.focus?.({ preventScroll: true }); };
  }, []);
  const reveal = (e: FocusEvent<HTMLElement>) => { const t = e.target; if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) t.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
  return <div className="tbs-scrim" onClick={onClose}>
    <form ref={ref} className={`tbs-sheet ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={e => e.stopPropagation()} onFocus={reveal}
      onSubmit={e => { e.preventDefault(); if (action && !action.disabled) action.onClick(); }}>
      <header className="tbs-head">
        <button type="button" className="tbs-cancel" onClick={onClose}>{cancelLabel}</button>
        <span className="tbs-title"><strong id={titleId}>{title}</strong>{sub && <small>{sub}</small>}</span>
        {action ? <button type="submit" className={`tbs-primary ${action.destructive ? 'destructive' : ''}`} disabled={action.disabled}>{action.icon}{action.label}</button> : <span />}
      </header>
      <div className="tbs-body">{children}</div>
    </form>
  </div>;
}
