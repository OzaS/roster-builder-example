import { useEffect, useRef, type ReactNode, type Ref } from 'react';
import { X } from 'lucide-react';
import './workspace.css';

/** Scrim plus dialog section. Clicking the scrim closes; clicks inside do not. Focus handling is up to the host
 *  (see `Dialog` for a shell that takes focus, keeps Tab inside and closes on Escape). */
export function ModalShell({ label, onClose, scrimClassName = '', className = '', sectionRef, children }: { label: string; onClose: () => void; scrimClassName?: string; className?: string; sectionRef?: Ref<HTMLElement>; children: ReactNode }) {
  return <div className={`dt-modal-scrim ${scrimClassName}`.trim()} onClick={onClose}><section ref={sectionRef} className={`dt-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-label={label} onClick={e => e.stopPropagation()}>{children}</section></div>;
}

/** A centred dialog that takes focus (`[data-autofocus]` or the first control), keeps Tab inside and closes on
 *  Escape; focus returns to where it was. `wide` is the roomy variant for previews. */
export function Dialog({ label, wide = false, onClose, children }: { label: string; wide?: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const nodes = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []).filter(el => !el.hasAttribute('disabled'));
    (ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? nodes()[0])?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); return; }
      if (e.key !== 'Tab') return;
      const list = nodes(); const first = list[0]; const last = list[list.length - 1];
      if (!ref.current?.contains(document.activeElement)) { e.preventDefault(); first?.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previous?.focus?.(); };
  }, []);
  return <ModalShell label={label} onClose={onClose} scrimClassName="dte-scrim" className={`dte-dialog ${wide ? 'wide' : ''}`} sectionRef={ref}>{children}</ModalShell>;
}

export function DialogHeader({ title, sub, onClose }: { title: string; sub?: ReactNode; onClose: () => void }) {
  return <header className="dte-head"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div><button type="button" className="dt-icon" aria-label="Close" title="Close (Esc)" onClick={onClose}><X size={16} /></button></header>;
}
