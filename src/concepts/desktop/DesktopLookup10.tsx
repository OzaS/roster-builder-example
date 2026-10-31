import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Search, X } from 'lucide-react';
import { lookupById, lookupSystems, sourceLine } from '../../data/lookupData';
import { LookupEntryBody, LookupSection } from '../ux/PhoneLookup';
import { plural, useLookup } from '../ux/useLookup';

/**
 * Desktop Lookup 1.0 (design session 2026-10-31): the earlier page (large search, chip row with the result count, results
 * card and entry card) with the phone's grouping and reference content. Links in the entry card push onto its own stack;
 * Back (and Alt+Left) returns; choosing a result in the list starts a new stack.
 */
export function DesktopLookup10({ initial = 'u-line-fc' }: { initial?: string }) {
  const lk = useLookup('line');
  const [stack, setStack] = useState<string[]>([initial]);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { searchRef.current?.focus({ preventScroll: true }); }, []);
  const current = lookupById(stack[stack.length - 1]);
  const previous = stack.length > 1 ? lookupById(stack[stack.length - 2]) : undefined;
  return <main className="dtp-page dtp-lookup10">
    <div className="dtp-toolbar">
      <label className="dtp-search large"><Search size={17} /><input ref={searchRef} placeholder="Search units, forces, upgrades and rules in the installed data…" aria-label="Search game data" value={lk.query} onChange={e => lk.setQuery(e.target.value)} />{lk.query && <button aria-label="Clear search" onClick={() => lk.setQuery('')}><X size={14} /></button>}</label>
    </div>
    <div className="dtp-toolbar tight">
      {lookupSystems.length > 1 ? <div className="dtp-chips" role="group" aria-label="Game systems to search">
        <button className={lk.systems === null ? 'active' : ''} aria-pressed={lk.systems === null} onClick={() => lk.setSystems(null)}>All{lk.typed && <b>{lk.allResults.length}</b>}</button>
        {lookupSystems.map(s => { const on = lk.systems?.includes(s.name) ?? false; return <button key={s.name} className={on ? 'active' : ''} aria-pressed={on} onClick={() => lk.pickSystem(s.name)}>{s.name}{lk.typed && <b>{lk.countIn(s.name)}</b>}</button>; })}
      </div> : null}
      <span className="dtp-muted dtp-push">{lk.typed ? plural(lk.results.length, 'result') : ''}</span>
    </div>
    <div className="dtp-split lookup">
      <section className="dtp-card dtp-list" aria-label="Results"><div className="dtp-scroll ux-lk-results">
        {!lk.typed ? <p className="ux-lk-hint">Type a name, or part of one, to search units, forces, upgrades and rules.</p>
          : lk.ordered.length === 0 ? <div className="dtp-empty"><Search size={22} /><strong>Nothing found for “{lk.query.trim()}”</strong><p>Check the spelling, or try part of the name.</p>{lk.systems !== null && <button className="dtp-btn" onClick={() => lk.setSystems(null)}>Search all systems</button>}</div>
          : lk.ordered.map(g => <LookupSection key={g.id} label={g.label} count={g.rows.length} names={g.rows.map(e => e.name)} folded={!lk.openIds.includes(g.id)} onToggle={() => lk.toggle(g.id)}>
            {g.rows.map(e => <button key={e.id} className={`dtp-row dtp-result ${stack[0] === e.id ? 'selected' : ''}`} aria-current={stack[0] === e.id ? 'true' : undefined} onClick={() => setStack([e.id])}><span><strong>{e.name}</strong><small>{e.summary} · {sourceLine(e, lk.withSystem)}</small></span><span className="ux-ro-list-trailing">{e.cost ? <b className="dtp-cost">{e.cost}</b> : null}{e.conditional ? <span className="ux-lf-tag info">Conditional</span> : null}</span></button>)}
          </LookupSection>)}
      </div></section>
      <article className="dtp-card dtp-detail lookup-detail" aria-label="Entry details" onKeyDown={e => { if (e.altKey && e.key === 'ArrowLeft' && previous) setStack(s => s.slice(0, -1)); }}>
        {current ? <div className="ux-mobile-unit-options ux-lk-detail ux-lk-pane">
          {previous ? <button type="button" className="ux-lk-pane-back" aria-label={`Back to ${previous.name}`} title="Back (Alt+Left)" onClick={() => setStack(s => s.slice(0, -1))}><ChevronLeft size={18} /><span>{previous.name}</span></button> : null}
          <LookupEntryBody key={current.id} entity={current} onOpen={id => setStack(s => [...s, id])} />
        </div> : null}
      </article>
    </div>
  </main>;
}
