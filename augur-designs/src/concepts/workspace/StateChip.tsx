import { useEffect, useId, useRef, useState } from 'react';
import { Ban, TriangleAlert } from 'lucide-react';
import './workspace.css';

// DEC-050: a catalogue row's state chip ("Adds over limit", "Unavailable") is an icon in the chip's tone. Its caption shows in
// the hint bubble: on touch a press (tap) shows it for a few seconds (a second press hides it), with a pointer hovering or
// focusing it shows it. The accessible name is the full caption. Shared by the tablet and desktop catalogues.

export type StateChipTone = 'warn' | 'err';
const SHOW_MS = 2600;

export function StateChip({ tone, caption, input, side = 'left', open: forced = false }: {
  tone: StateChipTone; caption: string; input: 'touch' | 'pointer'; side?: 'left' | 'top'; open?: boolean;
}) {
  const [open, setOpen] = useState(forced);
  const timer = useRef<number>(undefined);
  const id = useId();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => { setOpen(forced); }, [forced]);
  const Icon = tone === 'err' ? Ban : TriangleAlert;
  const press = () => {
    window.clearTimeout(timer.current);
    if (input === 'touch') { setOpen(v => { if (!v) timer.current = window.setTimeout(() => setOpen(false), SHOW_MS); return !v; }); return; }
    setOpen(true);
  };
  return <span className="tb-hint-wrap ws-state-chip-wrap">
    <button type="button" className={`ws-state-chip ${tone} ${open ? 'open' : ''}`} aria-label={caption} aria-describedby={open ? id : undefined}
      onClick={event => { event.stopPropagation(); press(); }}
      onPointerEnter={() => { if (input === 'pointer') setOpen(true); }} onPointerLeave={() => { if (input === 'pointer' && !forced) setOpen(false); }}
      onFocus={() => { if (input === 'pointer') setOpen(true); }} onBlur={() => { if (!forced) setOpen(false); }}
      onKeyDown={event => { if (event.key === 'Escape' && open) { event.stopPropagation(); setOpen(false); } }}>
      <i aria-hidden="true"><Icon size={14} strokeWidth={2.4} /></i>
    </button>
    {open && <span id={id} role="tooltip" className={`tb-hint-bubble ws-chip-bubble ${side}`}>{caption}</span>}
  </span>;
}
