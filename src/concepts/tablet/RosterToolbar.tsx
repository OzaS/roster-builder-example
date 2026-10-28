import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { HintButton } from './TabletHint';
import type { TabletInput } from './tabletDevices';

/** TFB-011: search replaces the title in the same toolbar row; other page actions stay put. */
export function RosterToolbar({ query, onQueryChange, input, initialOpen = false, children }: {
  query: string; onQueryChange: (query: string) => void; input: TabletInput; initialOpen?: boolean; children: ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(initialOpen || query.length > 0);
  const root = useRef<HTMLElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const focusRequested = useRef(false);
  const fieldId = useId();
  useEffect(() => {
    if (searchOpen && focusRequested.current) { field.current?.focus(); focusRequested.current = false; }
  }, [searchOpen]);
  const close = () => {
    onQueryChange(''); setSearchOpen(false);
    root.current?.querySelector<HTMLButtonElement>('.tb-search-toggle')?.focus();
  };
  return <header className="tb-roster-toolbar" ref={root}>
    <div className="tb-roster-toolbar-slot">
      <h1 hidden={searchOpen}>Rosters</h1>
      <label id={fieldId} className="ux-search tb-search tb-toolbar-search-field" hidden={!searchOpen}>
        <Search size={18} aria-hidden="true" />
        <input ref={field} type="search" value={query} aria-label="Find a roster or faction" placeholder="Find a roster or faction…" onChange={e => onQueryChange(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }} />
      </label>
    </div>
    <div className="tb-roster-toolbar-commands" role="group" aria-label="Rosters actions">
      <HintButton aria-label={searchOpen ? 'Close search' : 'Search rosters'} aria-expanded={searchOpen} aria-controls={fieldId}
        hint={searchOpen ? 'Close search and clear the query (Esc)' : 'Search rosters by name or faction'} input={input} side="bottom" className="ux-job-btn tb-search-toggle"
        onClick={() => { if (searchOpen) close(); else { focusRequested.current = true; setSearchOpen(true); } }}>
        {searchOpen ? <X size={20} aria-hidden="true" /> : <Search size={20} aria-hidden="true" />}
      </HintButton>
      {children}
    </div>
  </header>;
}
