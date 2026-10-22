import type { ComponentType } from 'react';
import { BookMarked, Database, Hammer, Home, LibraryBig, Plus, Search, Settings2 } from 'lucide-react';
import type { TabletInput } from './tabletDevices';
import { HintButton } from './TabletHint';

export type TabletPage = 'home' | 'rosters' | 'lookup' | 'tools' | 'library' | 'sources' | 'settings';
type Item = { id: TabletPage; label: string; icon: ComponentType<{ size?: number; strokeWidth?: number }>; hint: string };

// Rosters keeps the phone's Lists icon (LibraryBig); Library takes BookMarked so the two never share an icon.
export const railTop: Item[] = [
  { id: 'home', label: 'Home', icon: Home, hint: 'Home: continue a roster, recent rosters and data status' },
  { id: 'rosters', label: 'Rosters', icon: LibraryBig, hint: 'Rosters: find, open and manage your rosters' },
  { id: 'lookup', label: 'Lookup', icon: Search, hint: 'Lookup: search rules, units and equipment in your game data' },
  { id: 'tools', label: 'Tools', icon: Hammer, hint: 'Tools: coming soon' },
  { id: 'library', label: 'Library', icon: BookMarked, hint: 'Library: coming soon' },
];
export const railBottom: Item[] = [
  { id: 'sources', label: 'Sources', icon: Database, hint: 'Sources: installed game data and updates' },
  { id: 'settings', label: 'Settings', icon: Settings2, hint: 'Settings: appearance, language, storage' },
];
export const tabletPages = [...railTop, ...railBottom];
export const isTabletPage = (value: string): value is TabletPage => tabletPages.some(item => item.id === value);

/**
 * The main navigation of the tablet: New roster on top, the five features, Sources and Settings pinned to the bottom.
 * Material 3 navigation rail: the create action is an icon-only FAB (56 px, tonal, no shadow), top-aligned with the page
 * content; destinations show a pill indicator behind the icon with the label under it. The FAB's label is its hint and
 * accessible name (an extended FAB with a text label belongs to an expanded rail, which the tablet does not use).
 */
export function TabletRail({ page, input, onPage, onNewRoster }: { page: TabletPage; input: TabletInput; onPage: (page: TabletPage) => void; onNewRoster: () => void }) {
  const item = ({ id, label, icon: Icon, hint }: Item) => <HintButton key={id} hint={hint} input={input} className={`tb-rail-item ${page === id ? 'active' : ''}`} aria-current={page === id ? 'page' : undefined} onClick={() => onPage(id)}>
    <span className="tb-rail-ind"><Icon size={22} strokeWidth={page === id ? 2.3 : 2} /></span><span>{label}</span>
  </HintButton>;
  return <nav className="tb-rail" aria-label="Main navigation">
    <HintButton hint="New roster: choose a game system, faction and points limit" input={input} aria-label="New roster" className="tb-rail-fab" onClick={onNewRoster}><Plus size={24} strokeWidth={2.4} /></HintButton>
    {railTop.map(item)}
    <span className="tb-rail-spacer" />
    {railBottom.map(item)}
  </nav>;
}
