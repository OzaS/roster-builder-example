import { Search, X } from 'lucide-react';
import type { TabletInput } from './tabletDevices';
import { TabletToolbar, type ToolbarAction } from './TabletToolbar';

/** DEC-050 (supersedes TFB-011's search toggle): Rosters' top row is its search, always shown and filling the row, then
 *  Import. The query filters the list as before; Escape or the clear button empties it. The page title is hidden. */
export function RosterToolbar({ query, onQueryChange, input, actions }: {
  query: string; onQueryChange: (query: string) => void; input: TabletInput; actions: ToolbarAction[];
}) {
  const search = <label className="ux-search tb-search tb-toolbar-search-field">
    <Search size={18} aria-hidden="true" />
    <input type="search" value={query} aria-label="Find a roster or faction" placeholder="Find a roster or faction…" onChange={e => onQueryChange(e.target.value)}
      onKeyDown={e => { if (e.key === 'Escape' && query) { e.preventDefault(); e.stopPropagation(); onQueryChange(''); } }} />
    {query && <button type="button" className="tb-search-clear" aria-label="Clear search" title="Clear search (Esc)" onClick={() => onQueryChange('')}><X size={16} aria-hidden="true" /></button>}
  </label>;
  return <TabletToolbar title="Rosters" search={search} actions={actions} input={input} />;
}
