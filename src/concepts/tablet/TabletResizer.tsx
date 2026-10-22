import { useEffect, useRef, useState } from 'react';
import { Check, EyeOff } from 'lucide-react';
import type { TabletInput } from './tabletDevices';

// The tablet pane resizer (T4; plan Risks: dragging a narrow divider is hard on touch). A grab handle on the pane border with
// three preset widths:
//   Touch: tap the handle to cycle Narrow → Default → Wide; drag it and it snaps to the nearest preset on release; press and
//          hold for a menu with the presets and Hide.
//   Pointer: drag freely (the presets pull the handle within 12 px), double-click resets, hover shows the grip and a title.
//   Keyboard (any mode): arrows move it 16 px (Shift: 48), Home and End go to the limits, Enter or Space cycles the presets.
// The width shown while it moves or after a tap names the preset it sits on.

export type PanePresets = { min: number; max: number; narrow: number; initial: number; wide: number };
type Preset = { id: 'narrow' | 'default' | 'wide'; label: string; width: number };
export const presetsOf = (p: PanePresets): Preset[] => [{ id: 'narrow', label: 'Narrow', width: p.narrow }, { id: 'default', label: 'Default', width: p.initial }, { id: 'wide', label: 'Wide', width: p.wide }];
const clamp = (v: number, p: PanePresets) => Math.round(Math.min(p.max, Math.max(p.min, v)));
const HOLD_MS = 500;
const MOVE_PX = 6;
const MAGNET_PX = 12;

export function TabletResizer({ side, width, presets, label, pane, input, onWidth, onHide, defaultMenu = false }: {
  side: 'left' | 'right'; width: number; presets: PanePresets; label: string; /** "catalogue", "unit details": used in Hide and the hint. */ pane: string;
  input: TabletInput; onWidth: (w: number) => void; onHide?: () => void; /** Gallery: show the long-press menu open. */ defaultMenu?: boolean;
}) {
  const [menu, setMenu] = useState(defaultMenu);
  const [dragging, setDragging] = useState(false);
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<number>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const list = presetsOf(presets);
  const sign = side === 'left' ? 1 : -1;
  const current = list.find(p => p.width === width);
  const valueText = `${current ? `${current.label}, ` : ''}${width} px`;
  const touch = input === 'touch';

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);
  useEffect(() => {
    if (!menu) return;
    const outside = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setMenu(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setMenu(false); } };
    document.addEventListener('pointerdown', outside, true); window.addEventListener('keydown', key, true);
    return () => { document.removeEventListener('pointerdown', outside, true); window.removeEventListener('keydown', key, true); };
  }, [menu]);

  const show = (w: number) => { onWidth(w); setFlash(true); window.clearTimeout(flashTimer.current); flashTimer.current = window.setTimeout(() => setFlash(false), 1200); };
  const cycle = () => { const i = list.findIndex(p => p.width === width); const next = i < 0 ? list.find(p => p.width > width) ?? list[0] : list[(i + 1) % list.length]; show(next.width); };
  const nearest = (w: number) => list.reduce((a, b) => Math.abs(b.width - w) < Math.abs(a.width - w) ? b : a).width;

  return <div ref={wrapRef} className={`tbr ${side} ${touch ? 'touch' : 'pointer'} ${dragging ? 'dragging' : ''}`} style={side === 'left' ? { left: width } : { right: width }}>
    <div role="separator" aria-orientation="vertical" aria-label={label} aria-valuenow={width} aria-valuemin={presets.min} aria-valuemax={presets.max} aria-valuetext={valueText} tabIndex={0}
      title={touch ? undefined : `Drag to resize the ${pane} · double-click resets · Enter cycles Narrow, Default, Wide`} className="tbr-handle"
      onDoubleClick={() => { if (!touch) show(presets.initial); }}
      onContextMenu={e => { e.preventDefault(); setMenu(true); }}
      onKeyDown={e => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(clamp(width + (e.shiftKey ? 48 : 16) * (e.key === 'ArrowRight' ? 1 : -1) * sign, presets)); }
        else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); show(e.key === 'Home' ? presets.min : presets.max); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycle(); }
      }}
      onPointerDown={e => {
        if (e.button !== 0) return;
        const el = e.currentTarget; const startX = e.clientX; const start = width;
        const k = el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1; // gallery frame scale and display zoom
        let moved = false; let held = false; let last = start;
        try { el.setPointerCapture(e.pointerId); } catch { /* a synthetic pointer */ }
        const hold = touch ? window.setTimeout(() => { held = true; setMenu(true); }, HOLD_MS) : undefined;
        const move = (ev: PointerEvent) => {
          const dx = (ev.clientX - startX) / k;
          if (!moved && Math.abs(dx) < MOVE_PX) return;
          if (held) return;
          if (!moved) { moved = true; window.clearTimeout(hold); setDragging(true); setFlash(true); setMenu(false); }
          let w = clamp(start + dx * sign, presets);
          if (!touch) { const n = nearest(w); if (Math.abs(n - w) <= MAGNET_PX) w = n; }
          last = w; onWidth(w);
        };
        const up = () => {
          window.clearTimeout(hold); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
          setDragging(false);
          if (held) return;
          if (moved) show(touch ? nearest(last) : last);
          else if (touch) cycle();
        };
        el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      }}>
      <span className="tbr-grip" aria-hidden="true"><i /></span>
    </div>
    {(flash || dragging) && !menu && <span className="tbr-label" aria-hidden="true">{current ? <><b>{current.label}</b> · </> : null}{width} px</span>}
    {menu && <div className="tbe-menu tbr-menu" role="menu" aria-label={`${pane[0].toUpperCase()}${pane.slice(1)} width`}>
      <span className="tbe-menu-label">{pane} width</span>
      {list.map(p => <button type="button" role="menuitemradio" aria-checked={p.width === width} key={p.id} onClick={() => { setMenu(false); show(p.width); }}>
        <span className="tbr-swatch" aria-hidden="true"><i style={{ width: `${Math.round((p.width - presets.min) / (presets.max - presets.min) * 70 + 30)}%` }} /></span>
        <span className="tbr-menu-main"><strong>{p.label}</strong><small>{p.width} px</small></span>{p.width === width && <Check size={18} className="tbe-check" />}
      </button>)}
      {onHide && <><hr /><button type="button" role="menuitem" onClick={() => { setMenu(false); onHide(); }}><EyeOff size={18} />Hide {pane}</button></>}
    </div>}
  </div>;
}
