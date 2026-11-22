import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { BookMarked, Ellipsis, Hammer, LibraryBig, Search, Settings2, Wifi } from 'lucide-react';
import { HintButton } from '../tablet/TabletHint';
import type { BarIcon, BarItem, BarMenuItem, BarRegistry } from './duoBarItems';
import type { DuoPose } from './duoPoses';

/** Destinations of the foldable: one set on every display and pose (HIG: keep functionality the same between displays).
 *  Lookup has the search role, so it sits apart from the other tabs, as the system search tab does. Sources opens from
 *  Settings (as on the phone); Home stays a tablet page. */
export type DuoPage = 'rosters' | 'lookup' | 'tools' | 'library' | 'settings' | 'sources';
type Tab = { id: DuoPage; label: string; icon: BarIcon; hint: string };
export const duoTabs: Tab[] = [
  { id: 'rosters', label: 'Rosters', icon: LibraryBig, hint: 'Rosters: find, open and manage your rosters' },
  { id: 'tools', label: 'Tools', icon: Hammer, hint: 'Tools: coming soon' },
  { id: 'library', label: 'Library', icon: BookMarked, hint: 'Library: coming soon' },
  { id: 'settings', label: 'Settings', icon: Settings2, hint: 'Settings: appearance, language, game data and storage' },
];
export const searchTab: Tab = { id: 'lookup', label: 'Lookup', icon: Search, hint: 'Lookup: search units, forces, upgrades and rules in your game data' };
const tabOf = (page: DuoPage): DuoPage => page === 'sources' ? 'settings' : page;

const BTN = 46;
const GAP = 10;

/** Status at the top of the side bar: the time over the Wi-Fi glyph inside the battery ring. */
function DuoStatus() {
  return <div className="duo-status" role="img" aria-label="Status: 9:41, Wi-Fi connected, battery 80 percent">
    <time>9:41</time><span className="duo-ring"><Wifi size={14} strokeWidth={2.6} /></span>
  </div>;
}

/** The outer front camera: always visible in the corner, where the Dynamic Island grows for Live Activities. */
export const DuoIsland = () => <i className="duo-island" aria-hidden="true" />;

/** Splits the declared items into what fits the toolbar's height and what goes into More. Navigation and the prominent item
 *  stay; the other items overflow from the bottom up, lower `priority` last. */
function fitItems(items: BarItem[], menu: BarMenuItem[], room: number) {
  const heightOf = (shown: BarItem[], more: boolean) => {
    const groups = shown.filter(i => i.group !== 'secondary').length;
    const rest = shown.filter(i => i.group === 'secondary').length + (more ? 1 : 0);
    const blocks = groups + (rest ? 1 : 0);
    return (groups + rest) * BTN + Math.max(0, blocks - 1) * GAP;
  };
  let shown = items;
  const removable = items.map((item, i) => ({ item, i })).filter(x => x.item.group === 'secondary')
    .sort((a, b) => (b.item.priority ?? b.i) - (a.item.priority ?? a.i)).map(x => x.item);
  let hidden: BarItem[] = [];
  while (heightOf(shown, menu.length > 0 || hidden.length > 0) > room && removable.length) {
    const drop = removable.shift()!; hidden = [...hidden, drop]; shown = shown.filter(i => i !== drop);
  }
  const overflow: BarMenuItem[] = [...items.filter(i => hidden.includes(i)).map(i => ({ id: i.id, label: i.label, icon: i.icon, disabled: i.disabled, onClick: i.onClick })), ...menu];
  return { shown, overflow };
}

function BarButton({ item, onRun, className = '' }: { item: BarItem; onRun: (id: string) => void; className?: string }) {
  const Icon = item.icon;
  return <HintButton hint={item.hint ?? item.label} input="touch" side="left" aria-label={item.label} aria-pressed={item.pressed} disabled={item.disabled}
    className={`duo-btn ${item.prominent ? 'prominent' : ''} ${item.pressed ? 'active' : ''} ${className}`} onClick={() => onRun(item.id)}>
    <Icon size={21} strokeWidth={item.prominent ? 2.4 : 2.1} />
  </HintButton>;
}

/** More: the system overflow menu (ellipsis), opening beside the bar. */
function MoreButton({ entries, onRun }: { entries: BarMenuItem[]; onRun: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away); window.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', away); window.removeEventListener('keydown', key); };
  }, [open]);
  return <div className="duo-more" ref={wrap}>
    <HintButton hint={`More: ${entries.map(e => e.label).join(', ')}`} input="touch" side="left" aria-label="More actions" aria-haspopup="menu" aria-expanded={open} className={`duo-btn ${open ? 'active' : ''}`} onClick={() => setOpen(!open)}><Ellipsis size={21} /></HintButton>
    {open && <div className="duo-menu" role="menu" aria-label="More actions">
      {entries.map(e => <div key={e.id}>{e.divider && <hr />}<button type="button" role="menuitem" disabled={e.disabled} className={e.danger ? 'danger' : ''} onClick={() => { setOpen(false); onRun(e.id); }}><e.icon size={18} />{e.label}</button></div>)}
    </div>}
  </div>;
}

/** The toolbar part of the side bar: what the shown screens declared, laid out top to bottom in the system order. */
function VerticalToolbar({ registry }: { registry: BarRegistry }) {
  const { items, menu } = useSyncExternalStore(registry.subscribe, registry.getSnapshot);
  const box = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(1000);
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const measure = () => setRoom(el.clientHeight);
    measure();
    const observer = new ResizeObserver(measure); observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const { shown, overflow } = fitItems(items, menu, room);
  const run = (id: string) => registry.run(id);
  const rest = shown.filter(i => i.group === 'secondary');
  return <div className="duo-tools" ref={box} role="toolbar" aria-orientation="vertical" aria-label="Toolbar">
    {shown.filter(i => i.group !== 'secondary').map(item => <BarButton key={item.id} item={item} onRun={run} />)}
    {(rest.length > 0 || overflow.length > 0) && <div className="duo-capsule">
      {rest.map(item => <BarButton key={item.id} item={item} onRun={run} />)}
      {overflow.length > 0 && <MoreButton entries={overflow} onRun={run} />}
    </div>}
  </div>;
}

const TabButton = ({ tab, current, onPick, className = '' }: { tab: Tab; current: DuoPage; onPick: (page: DuoPage) => void; className?: string }) =>
  <HintButton hint={tab.hint} input="touch" side="left" aria-label={tab.label} aria-current={tabOf(current) === tab.id ? 'page' : undefined}
    className={`duo-btn duo-tab ${tabOf(current) === tab.id ? 'active' : ''} ${className}`} onClick={() => onPick(tab.id)}>
    <tab.icon size={21} strokeWidth={tabOf(current) === tab.id ? 2.4 : 2} />
  </HintButton>;

/** The vertical tab bar: icon-only tabs in a capsule, the search tab apart below it. Minimized (task-focused screens such as
 *  the roster editor) it is one button showing the current tab; tapping it brings the tab bar back. */
function VerticalTabs({ page, minimized, onPick }: { page: DuoPage; minimized: boolean; onPick: (page: DuoPage) => void }) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setExpanded(false); }, [minimized]);
  if (minimized && !expanded) {
    const current = [...duoTabs, searchTab].find(t => t.id === tabOf(page)) ?? duoTabs[0];
    return <nav className="duo-tabs" aria-label="Main navigation">
      <HintButton hint={`Tab bar: ${current.label}. Show all tabs`} input="touch" side="left" aria-label={`Show tabs (current: ${current.label})`} aria-expanded={false} className="duo-btn duo-tab-min" onClick={() => setExpanded(true)}><current.icon size={21} /></HintButton>
    </nav>;
  }
  return <nav className="duo-tabs" aria-label="Main navigation">
    <div className="duo-capsule duo-tab-capsule">{duoTabs.map(tab => <TabButton key={tab.id} tab={tab} current={page} onPick={p => { setExpanded(false); onPick(p); }} />)}</div>
    <TabButton tab={searchTab} current={page} onPick={p => { setExpanded(false); onPick(p); }} />
  </nav>;
}

/** The trailing edge of the foldable in the vertical poses: Dynamic Island, status, toolbar, tab bar (HIG order, top to
 *  bottom). Closed in landscape the camera is at the bottom corner and the status is hidden. */
export function DuoSideBar({ pose, registry, page, minimized, onPick }: { pose: DuoPose; registry: BarRegistry; page: DuoPage; minimized: boolean; onPick: (page: DuoPage) => void }) {
  return <aside className={`duo-bar camera-${pose.camera ?? 'none'}`} aria-label="Controls">
    {pose.camera === 'top' && <DuoIsland />}
    {pose.status && <DuoStatus />}
    <VerticalToolbar registry={registry} />
    <VerticalTabs page={page} minimized={minimized} onPick={onPick} />
    {pose.camera === 'bottom' && <DuoIsland />}
  </aside>;
}

/** The open display in portrait keeps standard horizontal bars: the tab bar floats at the bottom, labels under the icons,
 *  with the search tab beside it. */
export function DuoBottomTabs({ page, onPick }: { page: DuoPage; onPick: (page: DuoPage) => void }) {
  return <nav className="duo-tabs-h" aria-label="Main navigation">
    <div className="duo-capsule-h">{duoTabs.map(tab => <button key={tab.id} type="button" className={`duo-tab-h ${tabOf(page) === tab.id ? 'active' : ''}`} aria-current={tabOf(page) === tab.id ? 'page' : undefined} onClick={() => onPick(tab.id)}>
      <tab.icon size={21} strokeWidth={tabOf(page) === tab.id ? 2.4 : 2} /><span>{tab.label}</span></button>)}</div>
    <button type="button" className={`duo-btn duo-search-h ${page === 'lookup' ? 'active' : ''}`} aria-label={searchTab.label} aria-current={page === 'lookup' ? 'page' : undefined} onClick={() => onPick('lookup')}><Search size={21} /></button>
  </nav>;
}
