import { useEffect, useRef, useState, type RefObject } from 'react';
import { Keyboard, X } from 'lucide-react';
import { comboFromEvent } from '../desktop/desktopKeys';
import type { TabletDevice } from './tabletDevices';

// Hardware keyboard on the tablet (T4; plan: Keyboard row). Fixed shortcuts, no bindings editor (that stays on the desktop).
// iPad lists them in the system overlay while ⌘ is held; Android lists them in its keyboard shortcuts helper (Ctrl + /).
// Combos use the desktop notation: "Mod" is ⌘ on iPad and Ctrl on Android.

export type Shortcut = { combo: string; label: string };
export type ShortcutGroup = { title: string; items: Shortcut[] };

export const generalShortcuts: ShortcutGroup = { title: 'General', items: [
  { combo: 'Mod+N', label: 'New roster' },
  { combo: 'Mod+F', label: 'Find on this page' },
  { combo: 'Mod+1', label: 'Home' },
  { combo: 'Mod+2', label: 'Rosters' },
  { combo: 'Mod+3', label: 'Lookup' },
  { combo: 'Mod+4', label: 'Tools' },
  { combo: 'Mod+5', label: 'Library' },
  { combo: 'Mod+,', label: 'Settings' },
  { combo: 'Escape', label: 'Close a sheet, menu or popover' },
] };
export const editorShortcuts: ShortcutGroup = { title: 'Roster editor', items: [
  { combo: 'Mod+Z', label: 'Undo' },
  { combo: 'Mod+Shift+Z', label: 'Redo' },
  { combo: 'Mod+F', label: 'Find a unit to add' },
  { combo: 'Mod+E', label: 'Export roster' },
  { combo: 'Escape', label: 'Close, or back to the roster' },
] };
/** What the overlay and Settings list: in the editor its own group first, then the app-wide ones (Find on the page is the editor's). */
export const shortcutGroups = (editing: boolean): ShortcutGroup[] => editing
  ? [editorShortcuts, { ...generalShortcuts, items: generalShortcuts.items.filter(s => s.combo !== 'Mod+F' && s.combo !== 'Escape') }]
  : [generalShortcuts];

type System = TabletDevice['system'];
/** Key caps for a combo: iPad uses the Apple glyph order (⇧⌘Z), Android spells the modifiers (Ctrl + Shift + Z). */
export function keyCaps(combo: string, system: System): string[] {
  const parts = combo.split('+');
  const key = parts[parts.length - 1] === 'Escape' ? (system === 'ios' ? 'esc' : 'Esc') : parts[parts.length - 1];
  const has = (m: string) => parts.includes(m);
  if (system === 'ios') return [has('Shift') ? '⇧' : '', has('Alt') ? '⌥' : '', has('Mod') ? '⌘' : '', key].filter(Boolean);
  return [has('Mod') ? 'Ctrl' : '', has('Alt') ? 'Alt' : '', has('Shift') ? 'Shift' : '', key].filter(Boolean);
}
export const keyLabel = (combo: string, system: System) => keyCaps(combo, system).join(system === 'ios' ? '' : ' + ');

/** Does this app root take the keyboard? Yes when focus is inside it, or nothing is focused and it is the first tablet app on
 *  the page (a gallery canvas or the standalone link). Never while one of its form sheets is open (the sheet keeps the keys). */
export function ownsKeys(node: HTMLElement | null): boolean {
  const root = node?.closest<HTMLElement>('.tb-app') ?? node;
  if (!root || root.querySelector('.tbs-scrim')) return false;
  const active = document.activeElement as HTMLElement | null;
  if (active && root.contains(active)) return true;
  if (active && active !== document.body && active.closest('.tb-app')) return false;
  return document.querySelector('.tb-app') === root;
}
const typing = (e: KeyboardEvent) => { const t = e.target as HTMLElement | null; return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable); };

/** Runs the handler of a combo (e.g. `Mod+Z`) when this root takes the keyboard. `textToo` lists combos that also run while
 *  typing in a field (the others leave the field its own behaviour, such as text undo). */
export function useShortcuts(root: RefObject<HTMLElement | null>, handlers: Record<string, () => void>, textToo: string[] = []) {
  const latest = useRef(handlers); latest.current = handlers;
  const textCombos = useRef(textToo); textCombos.current = textToo;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || !ownsKeys(root.current)) return;
      const combo = comboFromEvent(e); if (!combo) return;
      const run = latest.current[combo]; if (!run) return;
      if (typing(e) && !textCombos.current.includes(combo)) return;
      e.preventDefault(); run();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [root]);
}

/** The shortcut overlay. iPad: shown while ⌘ is held for a moment, gone when it is released or another key is pressed.
 *  Android: Ctrl + / opens the keyboard shortcuts helper; Escape, Ctrl + / or a tap outside closes it. */
export function useShortcutOverlay(root: RefObject<HTMLElement | null>, system: System, initial = false) {
  const [open, setOpen] = useState(initial);
  useEffect(() => {
    let timer: number | undefined;
    const down = (e: KeyboardEvent) => {
      if (!ownsKeys(root.current)) return;
      if (system === 'ios') {
        window.clearTimeout(timer);
        if (e.key === 'Meta' && !e.repeat) timer = window.setTimeout(() => setOpen(true), 600);
        else if (e.key !== 'Meta') setOpen(false);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.code === 'Slash')) { e.preventDefault(); setOpen(v => !v); }
      else if (e.key === 'Escape') setOpen(false);
    };
    const up = (e: KeyboardEvent) => { if (system === 'ios' && e.key === 'Meta') { window.clearTimeout(timer); setOpen(false); } };
    const blur = () => { window.clearTimeout(timer); if (system === 'ios') setOpen(false); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur);
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); };
  }, [root, system]);
  return [open, setOpen] as const;
}

/** The overlay itself, in the style of each system. Lists the fixed shortcuts of what is on screen. */
export function ShortcutOverlay({ system, groups, onClose }: { system: System; groups: ShortcutGroup[]; onClose: () => void }) {
  if (system === 'ios') return <div className="tbk-overlay ios" role="dialog" aria-label="Keyboard shortcuts" onPointerDown={onClose}>
    <div className="tbk-panel" onPointerDown={e => e.stopPropagation()}>
      <header><strong>Battle Augur</strong><small>Hold ⌘ to see these anywhere</small></header>
      <div className="tbk-cols">{groups.map(g => <section key={g.title}><h3>{g.title}</h3>
        {g.items.map(s => <div className="tbk-row" key={g.title + s.combo}><span>{s.label}</span><kbd>{keyLabel(s.combo, 'ios')}</kbd></div>)}</section>)}</div>
    </div>
  </div>;
  return <div className="tbk-overlay android" onPointerDown={onClose}>
    <div className="tbk-panel" role="dialog" aria-label="Keyboard shortcuts" onPointerDown={e => e.stopPropagation()}>
      <header><Keyboard size={22} /><strong>Keyboard shortcuts</strong><button type="button" aria-label="Close keyboard shortcuts" onClick={onClose}><X size={20} /></button></header>
      <p className="tbk-app">Battle Augur · Ctrl + / shows this list</p>
      <div className="tbk-cols">{groups.map(g => <section key={g.title}><h3>{g.title}</h3>
        {g.items.map(s => <div className="tbk-row" key={g.title + s.combo}><span>{s.label}</span><span className="tbk-caps">{keyCaps(s.combo, 'android').map((c, i) => <kbd key={i}>{c}</kbd>)}</span></div>)}</section>)}</div>
    </div>
  </div>;
}
