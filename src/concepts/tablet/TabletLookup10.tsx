import { useState } from 'react';
import { BookOpen, ChevronLeft, Database, Search } from 'lucide-react';
import { lookupById, lookupSystems, sourceLine, type LookupEntity } from '../../data/lookupData';
import { LookupEntryBody, LookupSection } from '../ux/PhoneLookup';
import { plural, useLookup } from '../ux/useLookup';
import { EmptyState, ListDetail, Row, SearchField, type SessionProps } from './TabletPieces';
import { TabletToolbar } from './TabletToolbar';

/**
 * Tablet Lookup 1.0 (design session 2026-10-31): the earlier page layout (search, chip row, list and detail panes) with
 * the phone's grouping. System chips stay visible (All n, one per system with its count, several can be chosen). The
 * list holds the four foldable sections; the detail pane shows the phone's reference content. A link inside the detail
 * pushes onto the pane's own stack (Back names the previous entry); choosing a result in the list starts a new stack.
 */
export function TabletLookup10({ env, session, onAddData, initial = 'u-line-fc' }: SessionProps & { onAddData: () => void; initial?: string }) {
  const lk = useLookup('line');
  const [stack, setStack] = useState<string[]>([initial]);
  const [open, setOpen] = useState(false);
  if (!session.hasData) return <div className="tb-page"><EmptyState icon={BookOpen} title="Nothing to look up yet" text="Lookup searches the units, forces, upgrades and rules of your installed game data."><button type="button" className="ux-primary tb-primary" onClick={onAddData}><Database size={17} />Add game data</button></EmptyState></div>;
  const current = lookupById(stack[stack.length - 1]);
  const previous = stack.length > 1 ? lookupById(stack[stack.length - 2]) : undefined;
  const choose = (e: LookupEntity) => { setStack([e.id]); setOpen(true); };
  const end = (e: LookupEntity) => e.cost || e.conditional ? <span className="ux-ro-list-trailing">{e.cost ? <b>{e.cost}</b> : null}{e.conditional ? <span className="ux-lf-tag info">Conditional</span> : null}</span> : undefined;
  return <div className="tb-page tb-lookup10">
    {/* DEC-050: the search fills the shared top row (heading visually hidden), level with Rosters and Sources. */}
    <TabletToolbar title="Lookup" input={env.input} search={<SearchField value={lk.query} onChange={lk.setQuery} label="Search the game data" placeholder="Search units, forces, upgrades and rules…" />} />
    {lookupSystems.length > 1 ? <div className="tb-filters" role="group" aria-label="Game systems to search">
      <button type="button" className={`tb-filter ${lk.systems === null ? 'active' : ''}`} aria-pressed={lk.systems === null} onClick={() => lk.setSystems(null)}>All{lk.typed ? ` ${lk.allResults.length}` : ''}</button>
      {lookupSystems.map(s => { const on = lk.systems?.includes(s.name) ?? false; return <button type="button" key={s.name} className={`tb-filter ${on ? 'active' : ''}`} aria-pressed={on} aria-label={lk.typed ? `${s.name}, ${plural(lk.countIn(s.name), 'result')}` : s.name} onClick={() => lk.pickSystem(s.name)}>{s.name}{lk.typed ? ` ${lk.countIn(s.name)}` : ''}</button>; })}
    </div> : null}
    <ListDetail env={env} label="Lookup results" open={open} onClose={() => setOpen(false)}
      list={<div className="tb-list scroll ux-lk-results">
        {!lk.typed ? <p className="ux-lk-hint">Type a name, or part of one, to search units, forces, upgrades and rules.</p>
          : lk.ordered.length === 0 ? <div className="ux-search-empty ux-lk-empty"><Search size={19} /><strong>Nothing found for “{lk.query.trim()}”</strong><small>Check the spelling, or try part of the name.</small>{lk.systems !== null ? <button type="button" className="ux-job-btn" onClick={() => lk.setSystems(null)}>Search all systems</button> : null}</div>
          : lk.ordered.map(g => <LookupSection key={g.id} label={g.label} count={g.rows.length} names={g.rows.map(e => e.name)} folded={!lk.openIds.includes(g.id)} onToggle={() => lk.toggle(g.id)}>
            {g.rows.map(e => <Row key={e.id} selected={e.id === stack[0]} title={e.name} sub={e.summary} foot={<small>{sourceLine(e, lk.withSystem)}</small>} end={end(e)} onClick={() => choose(e)} />)}
          </LookupSection>)}
      </div>}
      detail={current ? <div className="ux-mobile-unit-options ux-lk-detail ux-lk-pane">
        {previous ? <button type="button" className="ux-lk-pane-back" aria-label={`Back to ${previous.name}`} onClick={() => setStack(s => s.slice(0, -1))}><ChevronLeft size={20} /><span>{previous.name}</span></button> : null}
        <LookupEntryBody key={current.id} entity={current} onOpen={id => setStack(s => [...s, id])} />
      </div> : null} />
  </div>;
}
