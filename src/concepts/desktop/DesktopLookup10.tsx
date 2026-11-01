import { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, CircleAlert, Clock3, Database, RotateCw, Search, Unlink, X } from 'lucide-react';
import { lookupById, lookupSystems, sourceLine, type LookupEntity } from '../../data/lookupData';
import { LookupEntryBody, LookupSection } from '../ux/PhoneLookup';
import { plural, useLookup } from '../ux/useLookup';
import { PageTitle } from './DesktopPages';
import './desktop-lookup-states.css';

/** R0-03 (DEC-054): lifecycle states of Lookup 1.0, each with its own gallery screen. */
export type LookupState = 'loading' | 'failed' | 'unavailable' | 'text-200' | 'text-150' | 'no-data' | 'start' | 'narrow';
/** R0 gaps (approved 2026-11-01): references the static screens open, in groups that start folded. */
const RECENT_IDS = ['r-hold-line', 'u-line-fc', 'd-line-formation'];
/** Synthetic long title for the large-text state (DEC-001: game-neutral). */
const LONG_NAME = 'Veteran Line Infantry with Reinforced Field Equipment and Additional Support Options';
const LONG_ID = 'u-veteran-line';
/** A saved reference whose source is no longer installed: it is never resolved to a same-name entry elsewhere. */
const MISSING_REF = { name: 'Line Infantry', source: 'Example System Three v2.1' };

/**
 * Desktop Lookup 1.0 (design session 2026-10-31): the earlier page (large search, chip row with the result count, results
 * card and entry card) with the phone's grouping and reference content. Links in the entry card push onto its own stack;
 * Back (and Alt+Left) returns; choosing a result in the list starts a new stack.
 *
 * States (R0-03): Loading keeps the query and filters and shows progress, never "nothing found"; Failure says the search
 * could not finish (not zero results) with Retry; Reference unavailable is an opened or saved reference whose source is gone,
 * with Back to results; at 200 % text, titles (result names and the entry heading) stop at two lines with the full name in
 * the tooltip, the accessible name and a Full name disclosure. The cap applies to titles only.
 */
export function DesktopLookup10({ initial = 'u-line-fc', state: initialState, openGroup = false, narrowEntry = false, onAddData }: { initial?: string; state?: LookupState; openGroup?: boolean; narrowEntry?: boolean; onAddData?: () => void }) {
  const lk = useLookup(initialState === 'start' || initialState === 'no-data' ? '' : 'line');
  // Recently viewed (LK-09): the last references opened, newest first, shown before a search is typed.
  const [recent, setRecent] = useState(RECENT_IDS);
  const noData = initialState === 'no-data';
  const [state, setState] = useState<LookupState | undefined>(initialState);
  const [stack, setStack] = useState<string[]>(initialState === 'loading' || initialState === 'failed' || initialState === 'start' || noData || (initialState === 'narrow' && !narrowEntry) ? [] : initialState === 'unavailable' ? ['missing'] : [initialState === 'text-200' || initialState === 'text-150' ? LONG_ID : initial]);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const retryTimer = useRef<number>(undefined);
  useEffect(() => { searchRef.current?.focus({ preventScroll: true }); return () => window.clearTimeout(retryTimer.current); }, []);
  const large = state === 'text-200' || state === 'text-150';
  const open = (id: string) => { setStack([id]); setRecent(r => [id, ...r.filter(x => x !== id)].slice(0, 5)); };
  // A static screen for a folded group (detachment, upgrade, rule) opens that group so the opened row shows.
  useEffect(() => { const group = openGroup ? lookupById(initial)?.group : undefined; if (group && !lk.openIds.includes(group)) lk.toggle(group); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const busy = state === 'loading' || state === 'failed';
  const nameOf = (e: LookupEntity) => large && e.id === LONG_ID ? LONG_NAME : e.name;
  const top = stack[stack.length - 1];
  const current = top && top !== 'missing' ? lookupById(top) : undefined;
  const previous = stack.length > 1 ? lookupById(stack[stack.length - 2]) : undefined;
  // Retry runs the same search again: it shows Loading, then the results (the prototype always succeeds the second time).
  const retry = () => { setState('loading'); window.clearTimeout(retryTimer.current); retryTimer.current = window.setTimeout(() => setState(undefined), 1400); };
  const backToResults = () => { setStack([]); requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>('.dtp-result')?.focus()); };
  return <main className={`dtp-page dtp-lookup10 ${large ? 'dtl-large' : ''} ${initialState === 'text-200' ? 'dtl-keep-split' : ''}`}>
    {/* DEC-050: no visible page title; the search fills the top row, as on Rosters and Sources. */}
    <PageTitle>Lookup</PageTitle>
    <div className="dtp-toolbar dtp-top-row">
      <label className="dtp-search large"><Search size={17} /><input ref={searchRef} disabled={noData} placeholder="Search units, forces, upgrades and rules in the installed data…" aria-label="Search game data" value={lk.query} onChange={e => { lk.setQuery(e.target.value); if (state === 'failed') setState(undefined); }} />{lk.query && <button aria-label="Clear search" onClick={() => lk.setQuery('')}><X size={14} /></button>}</label>
    </div>
    {!noData && <div className="dtp-toolbar tight">
      {lookupSystems.length > 1 ? <div className="dtp-chips" role="group" aria-label="Game systems to search">
        <button className={lk.systems === null ? 'active' : ''} aria-pressed={lk.systems === null} onClick={() => lk.setSystems(null)}>All{lk.typed && !busy && <b>{lk.allResults.length}</b>}</button>
        {lookupSystems.map(s => { const on = lk.systems?.includes(s.name) ?? false; return <button key={s.name} className={on ? 'active' : ''} aria-pressed={on} onClick={() => lk.pickSystem(s.name)}>{s.name}{lk.typed && !busy && <b>{lk.countIn(s.name)}</b>}</button>; })}
      </div> : null}
      <span className="dtp-muted dtp-push" aria-live="polite">{state === 'loading' ? 'Searching…' : state === 'failed' ? '' : lk.typed ? plural(lk.results.length, 'result') : ''}</span>
    </div>}
    {/* No game data installed (LK-09): nothing to search, so the search is disabled and the page offers Add game data. */}
    {noData ? <section className="dtp-card dtl-nodata" aria-label="No game data"><div className="dtp-empty"><span className="dtl-unavailable-icon"><BookOpen size={22} /></span><strong>Nothing to look up yet</strong><p>Lookup searches the units, forces, upgrades and rules of your installed game data. Install a game system and it is here, offline.</p><button className="dtp-btn primary" onClick={onAddData}><Database size={15} />Add game data</button></div></section>
    : <div className="dtp-split lookup" data-pane={stack.length ? 'entry' : 'list'}>
      <section className="dtp-card dtp-list" aria-label="Results" aria-busy={state === 'loading' || undefined}><div className="dtp-scroll ux-lk-results" ref={listRef}>
        {state === 'loading' ? <div className="dtl-loading" role="status"><p><span className="dtl-spinner" aria-hidden="true" />Searching installed data…</p>{[72, 58, 66, 48, 62].map((w, i) => <div key={i} className="dtl-skeleton-row" aria-hidden="true"><i style={{ width: `${w}%` }} /><i style={{ width: `${w - 22}%` }} /></div>)}</div>
          : state === 'failed' ? <div className="dtp-empty dtl-failed" role="alert"><CircleAlert size={24} /><strong>Search could not finish</strong><p>Your installed data is still on this device.</p><button className="dtp-btn" onClick={retry}><RotateCw size={14} />Retry</button></div>
          : !lk.typed ? <div className="dtl-start"><p className="ux-lk-hint">Type a name, or part of one, to search units, forces, upgrades and rules.</p>
            <section aria-label="Recently viewed"><h3 className="dtl-recent-head"><Clock3 size={14} aria-hidden="true" />Recently viewed</h3>
              {recent.map(id => lookupById(id)).filter((e): e is LookupEntity => !!e).map(e => <button key={e.id} className={`dtp-row dtp-result ${stack[0] === e.id ? 'selected' : ''}`} aria-current={stack[0] === e.id ? 'true' : undefined} onClick={() => open(e.id)}><span><strong className="dtl-title">{e.name}</strong><small>{e.summary} · {sourceLine(e, true)}</small></span><span className="ux-ro-list-trailing">{e.cost ? <b className="dtp-cost">{e.cost}</b> : null}{e.conditional ? <span className="ux-lf-tag info">Conditional</span> : null}</span></button>)}
            </section></div>
          : lk.ordered.length === 0 ? <div className="dtp-empty"><Search size={22} /><strong>Nothing found for “{lk.query.trim()}”</strong><p>Check the spelling, or try part of the name.</p>{lk.systems !== null && <button className="dtp-btn" onClick={() => lk.setSystems(null)}>Search all systems</button>}</div>
          : lk.ordered.map(g => <LookupSection key={g.id} label={g.label} count={g.rows.length} names={g.rows.map(nameOf)} folded={!lk.openIds.includes(g.id) && !(large && g.rows.some(e => e.id === LONG_ID))} onToggle={() => lk.toggle(g.id)}>
            {g.rows.map(e => <button key={e.id} className={`dtp-row dtp-result ${stack[0] === e.id ? 'selected' : ''}`} aria-current={stack[0] === e.id ? 'true' : undefined} title={large ? nameOf(e) : undefined} onClick={() => open(e.id)}><span><strong className="dtl-title">{nameOf(e)}</strong><small>{e.summary} · {sourceLine(e, lk.withSystem)}</small></span><span className="ux-ro-list-trailing">{e.cost ? <b className="dtp-cost">{e.cost}</b> : null}{e.conditional ? <span className="ux-lf-tag info">Conditional</span> : null}</span></button>)}
          </LookupSection>)}
      </div></section>
      <article className="dtp-card dtp-detail lookup-detail" aria-label="Entry details" onKeyDown={e => { if (e.altKey && e.key === 'ArrowLeft' && previous) setStack(s => s.slice(0, -1)); }}>
        {top === 'missing' ? <div className="dtl-unavailable" role="alert">
          <span className="dtl-unavailable-icon"><Unlink size={22} /></span>
          <h2>Reference unavailable</h2>
          <p>The source for this saved reference is no longer installed.</p>
          <small>Saved reference: {MISSING_REF.name} · {MISSING_REF.source}</small>
          <button className="dtp-btn" onClick={backToResults}><ChevronLeft size={15} />Back to results</button>
        </div> : current ? <div className="ux-mobile-unit-options ux-lk-detail ux-lk-pane">
          <button type="button" className="ux-lk-pane-back dtl-narrow-back" aria-label="Back to results" title="Back to results" onClick={backToResults}><ChevronLeft size={18} /><span>Results</span></button>
          {previous ? <button type="button" className="ux-lk-pane-back" aria-label={`Back to ${nameOf(previous)}`} title="Back (Alt+Left)" onClick={() => setStack(s => s.slice(0, -1))}><ChevronLeft size={18} /><span>{nameOf(previous)}</span></button> : null}
          {large ? <>
            <div className="ux-lk-heading dtl-heading"><h2 className="dtl-title" title={nameOf(current)}>{nameOf(current)}</h2>{current.cost ? <strong className="ux-lk-base-cost">{current.cost}</strong> : null}</div>
            {nameOf(current).length > 40 && <details className="dtl-fullname"><summary>Full name</summary><p>{nameOf(current)}</p></details>}
          </> : null}
          <LookupEntryBody key={current.id} entity={current} showHeading={!large} onOpen={id => setStack(s => [...s, id])} />
        </div> : <div className="dtl-detail-empty"><BookOpen size={22} /><p>{busy ? 'The entry opens when you choose a result.' : 'Choose a result to read its reference.'}</p></div>}
      </article>
    </div>}
  </main>;
}
