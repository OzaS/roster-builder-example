import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { defaultBindings, formatCombo } from './desktopKeys';
import './desktop-menus.css';

// macOS menu bar for the desktop app (Electron application menu). Shortcuts follow the default key
// bindings; in the app they follow the user's bindings. Windows/Linux show the same menus in the window.

type Item = { label: string; keys?: string; disabled?: string; submenu?: Item[] } | 'separator';
const k = (combo: string) => formatCombo(combo);

const MENUS: Array<{ label: string; items: Item[] }> = [
  { label: 'Battle Augur', items: [{ label: 'About Battle Augur' }, 'separator', { label: 'Settings…', keys: k(defaultBindings.settings) }, { label: 'Check for game data updates' }, 'separator', { label: 'Hide Battle Augur', keys: '⌘ H' }, { label: 'Hide others', keys: '⌥ ⌘ H' }, 'separator', { label: 'Quit Battle Augur', keys: '⌘ Q' }] },
  { label: 'File', items: [{ label: 'New roster…', keys: k(defaultBindings.newRoster) }, { label: 'Open roster…', keys: k(defaultBindings.rosters) }, { label: 'Open recent', submenu: [{ label: 'The Ashen Expedition' }, { label: 'Northern Watch' }, { label: 'Operation First Light' }, 'separator', { label: 'Clear menu' }] }, 'separator', { label: 'Import roster…' }, { label: 'Export roster…', disabled: 'Open a roster to export it' }, 'separator', { label: 'Install game data from a file…' }, 'separator', { label: 'Close tab', keys: '⌘ W' }] },
  { label: 'Edit', items: [{ label: 'Undo add unit', keys: '⌘ Z' }, { label: 'Redo', keys: '⇧ ⌘ Z', disabled: 'Nothing to redo' }, 'separator', { label: 'Cut', keys: '⌘ X' }, { label: 'Copy', keys: '⌘ C' }, { label: 'Paste', keys: '⌘ V' }, 'separator', { label: 'Duplicate unit', keys: '⌘ D' }, { label: 'Remove unit', keys: '⌫' }, 'separator', { label: 'Find in catalogue', keys: '⌘ ⇧ F' }] },
  { label: 'Roster', items: [{ label: 'Roster summary', keys: k(defaultBindings.summary) }, { label: 'Rename roster…' }, { label: 'Points limit', submenu: [{ label: '500 pts' }, { label: '1,000 pts' }, { label: '1,500 pts' }, { label: '2,000 pts' }, 'separator', { label: 'Custom…' }, { label: 'No limit' }] }, 'separator', { label: 'Add detachment…' }, { label: 'Validation details' }] },
  { label: 'View', items: [{ label: 'Show catalogue', keys: k(defaultBindings.toggleCatalogue) }, { label: 'Show inspector', keys: k(defaultBindings.toggleInspector) }, 'separator', { label: 'Command palette', keys: k(defaultBindings.palette) }, 'separator', { label: 'Appearance', submenu: [{ label: 'System' }, { label: 'Light' }, { label: 'Dark' }] }, { label: 'Colour scheme', submenu: [{ label: 'Default' }, { label: 'Crimson' }, { label: 'Gilded' }, { label: 'Azure' }, { label: 'Verdant' }] }, 'separator', { label: 'Actual size', keys: '⌘ 0' }, { label: 'Zoom in', keys: '⌘ +' }, { label: 'Zoom out', keys: '⌘ −' }, 'separator', { label: 'Enter full screen', keys: '⌃ ⌘ F' }] },
  { label: 'Go', items: [{ label: 'Welcome' }, { label: 'Rosters', keys: k(defaultBindings.rosters) }, { label: 'Lookup', keys: k(defaultBindings.lookup) }, { label: 'Sources' }, { label: 'Settings', keys: k(defaultBindings.settings) }] },
  { label: 'Window', items: [{ label: 'Minimise', keys: '⌘ M' }, { label: 'Zoom' }, 'separator', { label: 'Show previous tab', keys: '⌃ ⇧ ⇥' }, { label: 'Show next tab', keys: '⌃ ⇥' }, 'separator', { label: 'Bring all to front' }] },
  { label: 'Help', items: [{ label: 'Battle Augur help' }, { label: 'Key bindings' }, 'separator', { label: 'Report a problem…' }] },
];

function MenuList({ items, onPick }: { items: Item[]; onPick: (label: string) => void }) {
  const [sub, setSub] = useState<string | null>(null);
  return <div className="dtm-menu" role="menu">{items.map((item, i) => item === 'separator' ? <hr key={i} /> :
    <div key={item.label} className="dtm-item-wrap" onMouseEnter={() => setSub(item.submenu ? item.label : null)}>
      <button type="button" role="menuitem" aria-haspopup={item.submenu ? 'menu' : undefined} aria-expanded={item.submenu ? sub === item.label : undefined} aria-disabled={!!item.disabled} title={item.disabled} className="dtm-item"
        onClick={() => item.disabled ? undefined : item.submenu ? setSub(item.label) : onPick(item.label)}>
        <span>{item.label}</span>{item.keys && <kbd>{item.keys}</kbd>}{item.submenu && <ChevronRight size={13} />}
      </button>
      {item.submenu && sub === item.label && <div className="dtm-sub"><MenuList items={item.submenu} onPick={onPick} /></div>}
    </div>)}</div>;
}

export function DesktopMenuBar({ onPick }: { onPick?: (label: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => { if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(null); };
    window.addEventListener('mousedown', close); window.addEventListener('keydown', close);
    return () => { window.removeEventListener('mousedown', close); window.removeEventListener('keydown', close); };
  }, [open]);
  return <div className="dtm-bar" ref={ref} role="menubar" aria-label="Application menu">
    {MENUS.map((m, i) => <div key={m.label} className="dtm-top">
      <button type="button" role="menuitem" aria-haspopup="menu" aria-expanded={open === m.label} className={`${open === m.label ? 'open' : ''} ${i === 0 ? 'app' : ''}`}
        onClick={() => setOpen(open === m.label ? null : m.label)} onMouseEnter={() => open && setOpen(m.label)}>{m.label}</button>
      {open === m.label && <MenuList items={m.items} onPick={label => { setOpen(null); onPick?.(label); }} />}
    </div>)}
    <span className="dtm-clock" aria-hidden="true">Tue 21 Oct 16:20</span>
  </div>;
}
