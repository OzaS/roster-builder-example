import { useState } from 'react';
import { BookOpen, ChevronLeft, Clock3, Database, Search } from 'lucide-react';
import { lookupById, lookupSystems, sourceLine, type LookupEntity } from '../../data/lookupData';
import { LookupEntryBody, LookupFailure, LookupLoading, LookupSection, LookupUnavailable, unavailableSample, type LookupPhase } from '../ux/PhoneLookup';
import { plural, useLookup } from '../ux/useLookup';
import { EmptyState, ListDetail, Row, SearchField, type SessionProps } from './TabletPieces';
import { TabletToolbar } from './TabletToolbar';

/**
 * Tablet Lookup 1.0 (design session 2026-10-31): the earlier page layout (search, chip row, list and detail panes) with
 * the phone's grouping. System chips stay visible (All n, one per system with its count, several can be chosen). The
 * list holds the four foldable sections; the detail pane shows the phone's reference content. A link inside the detail
 * pushes onto the pane's own stack (Back names the previous entry); choosing a result in the list starts a new stack.
 * R0-03 (DEC-054) gallery states (`state`): the search in progress (v1-loading) or failed (v1-failed), a saved reference whose source
 * is gone (v1-unavailable) and a long name for the 200 % text screen (v1-long).
 */
const recentIds = ['r-hold-line', 'u-line-fc', 'd-line-formation'];
/** R0 gap states (proposals): the start page with Recently viewed (v1-start); the upgrade, rule and detachment references (v1-upgrade, v1-rule, v1-detachment); the detail pane empty while the search runs or after it failed (v1-loading-empty, v1-failed-empty, aligned to the desktop). */
const referenceOf: Record<string, string> = { 'v1-upgrade': 'up-line-rifle', 'v1-rule': 'r-hold-line', 'v1-detachment': 'd-line-formation' };

export function TabletLookup10({ env, session, onAddData, initial = 'u-line-fc', state = '' }: SessionProps & { onAddData: () => void; initial?: string; state?: string }) {
  const emptyDetail = state.endsWith('-empty');
  const base = emptyDetail ? state.slice(0, -'-empty'.length) : state;
  const long = base === 'v1-long';
  const start = base === 'v1-start';
  const lk = useLookup(long ? 'reinforced' : start ? '' : 'line');
  const [stack, setStack] = useState<string[]>(emptyDetail || start ? [] : [long ? 'u-veteran-reinforced' : referenceOf[base] ?? initial]);
  const [open, setOpen] = useState(long || base === 'v1-unavailable' || base in referenceOf);
  const [phase, setPhase] = useState<LookupPhase>(base === 'v1-loading' ? 'loading' : base === 'v1-failed' ? 'failed' : 'ready');
  const [missing, setMissing] = useState(base === 'v1-unavailable');
  const [recent, setRecent] = useState(recentIds);
  const retry = () => { setPhase('loading'); window.setTimeout(() => setPhase('ready'), 1400); };
  const counted = lk.typed && phase === 'ready';
  if (!session.hasData) return <div className="tb-page"><EmptyState icon={BookOpen} title="Nothing to look up yet" text="Lookup searches the units, forces, upgrades and rules of your installed game data."><button type="button" className="ux-primary tb-primary" onClick={onAddData}><Database size={17} />Add game data</button></EmptyState></div>;
  const current = lookupById(stack[stack.length - 1]);
  const previous = stack.length > 1 ? lookupById(stack[stack.length - 2]) : undefined;
  const choose = (e: LookupEntity) => { setStack([e.id]); setMissing(false); setOpen(true); setRecent(r => [e.id, ...r.filter(x => x !== e.id)].slice(0, 5)); };
  const end = (e: LookupEntity) => e.cost || e.conditional ? <span className="ux-ro-list-trailing">{e.cost ? <b>{e.cost}</b> : null}{e.conditional ? <span className="ux-lf-tag info">Conditional</span> : null}</span> : undefined;
  return <div className="tb-page tb-lookup10">
    {/* DEC-050: the search fills the shared top row (heading visually hidden), level with Rosters and Sources. */}
    <TabletToolbar title="Lookup" input={env.input} search={<SearchField value={lk.query} onChange={lk.setQuery} label="Search the game data" placeholder="Search units, forces, upgrades and rules…" />} />
    {lookupSystems.length > 1 ? <div className="tb-filters" role="group" aria-label="Game systems to search">
      <button type="button" className={`tb-filter ${lk.systems === null ? 'active' : ''}`} aria-pressed={lk.systems === null} onClick={() => lk.setSystems(null)}>All{counted ? ` ${lk.allResults.length}` : ''}</button>
      {lookupSystems.map(s => { const on = lk.systems?.includes(s.name) ?? false; return <button type="button" key={s.name} className={`tb-filter ${on ? 'active' : ''}`} aria-pressed={on} aria-label={counted ? `${s.name}, ${plural(lk.countIn(s.name), 'result')}` : s.name} onClick={() => lk.pickSystem(s.name)}>{s.name}{counted ? ` ${lk.countIn(s.name)}` : ''}</button>; })}
    </div> : null}
    <ListDetail env={env} label="Lookup results" open={open} onClose={() => setOpen(false)}
      list={<div className="tb-list scroll ux-lk-results">
        {!lk.typed ? <section className="ux-lk-start" aria-label="Recently viewed">
          <p className="ux-lk-hint">Type a name, or part of one, to search units, forces, upgrades and rules.</p>
          <h3 className="ux-lk-recent-head"><Clock3 size={14} aria-hidden />Recently viewed</h3>
          <div className="ux-lk-rows">{recent.map(id => lookupById(id)).filter((e): e is LookupEntity => !!e).map(e => <Row key={e.id} selected={!missing && e.id === stack[0]} title={e.name} sub={e.summary} foot={<small>{sourceLine(e, true)}</small>} end={end(e)} onClick={() => choose(e)} />)}</div>
        </section>
          : phase === 'loading' ? <LookupLoading /> : phase === 'failed' ? <LookupFailure onRetry={retry} />
          : lk.ordered.length === 0 ? <div className="ux-search-empty ux-lk-empty"><Search size={19} /><strong>Nothing found for “{lk.query.trim()}”</strong><small>Check the spelling, or try part of the name.</small>{lk.systems !== null ? <button type="button" className="ux-job-btn" onClick={() => lk.setSystems(null)}>Search all systems</button> : null}</div>
          : lk.ordered.map(g => <LookupSection key={g.id} label={g.label} count={g.rows.length} names={g.rows.map(e => e.name)} folded={!lk.openIds.includes(g.id)} onToggle={() => lk.toggle(g.id)}>
            {g.rows.map(e => <Row key={e.id} selected={!missing && e.id === stack[0]} title={e.name} sub={e.summary} foot={<small>{sourceLine(e, lk.withSystem)}</small>} end={end(e)} onClick={() => choose(e)} />)}
          </LookupSection>)}
      </div>}
      detail={missing ? <div className="ux-mobile-unit-options ux-lk-detail ux-lk-pane"><LookupUnavailable saved={unavailableSample} onBack={() => { setMissing(false); setOpen(false); }} /></div>
        : current ? <div className="ux-mobile-unit-options ux-lk-detail ux-lk-pane">
        {previous ? <button type="button" className="ux-lk-pane-back" aria-label={`Back to ${previous.name}`} onClick={() => setStack(s => s.slice(0, -1))}><ChevronLeft size={20} /><span>{previous.name}</span></button> : null}
        <LookupEntryBody key={current.id} entity={current} fullNameOpen={long} onOpen={id => setStack(s => [...s, id])} />
      </div> : <div className="ux-lk-pane-empty"><BookOpen size={22} /><p>{phase !== 'ready' || emptyDetail ? 'The entry opens when you choose a result.' : 'Choose a result to read its reference.'}</p></div>} />
  </div>;
}
