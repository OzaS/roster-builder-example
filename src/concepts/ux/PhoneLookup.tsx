import { useState, type ReactNode } from "react";
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, Clock3, Database, Info, Search, X } from "lucide-react";
import { factionLabel, lookupById, lookupGroups, lookupSystems, searchLookup, sourceLine, systemVersion, type LookupEntity, type LookupGroupId } from "../../data/lookupData";
import { FoldSection } from "./MobileUnitOptions";
import "./phone-lists.css";
import "./phone-lookup.css";

/**
 * Lookup 1.0 on the phone (design session 2026-10-31). Name search over every installed game system, or the chosen
 * ones. Results sit in four sections with a count each: Units, Detachments, Upgrades, Rules. Units start open on top;
 * the others start folded, and folded sections always sort below the open ones (fixed group order inside each part).
 * No units → the first group with results opens instead. Fold state lasts for the search; clearing the field resets it.
 * A result opens a read-only reference page (a pushed page; Back names where it returns). D10: hidden-by-default or
 * conditional entries are listed with a Conditional tag and explained on their page; costs are the data's base values.
 */
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const recentIds = ["r-hold-line", "u-line-fc", "d-line-formation"];

export function PhoneLookup({ initialQuery = "line", initialStack = [], noData = false, trailing, onAddData }: { initialQuery?: string; initialStack?: string[]; noData?: boolean; trailing?: ReactNode; onAddData?: () => void }) {
  const [query, setQuery] = useState(initialQuery);
  const [systems, setSystems] = useState<string[] | null>(null);
  const [open, setOpen] = useState<LookupGroupId[] | null>(null);
  const [stack, setStack] = useState<string[]>(initialStack);
  const [recent, setRecent] = useState(recentIds);
  const results = searchLookup(query, systems);
  const allResults = searchLookup(query, null);
  const groups = lookupGroups.map((g) => ({ ...g, rows: results.filter((e) => e.group === g.id) })).filter((g) => g.rows.length > 0);
  const defaultOpen: LookupGroupId[] = groups.some((g) => g.id === "unit") ? ["unit"] : groups.slice(0, 1).map((g) => g.id);
  const openIds = open ?? defaultOpen;
  const ordered = [...groups.filter((g) => openIds.includes(g.id)), ...groups.filter((g) => !openIds.includes(g.id))];
  const withSystem = systems === null ? lookupSystems.length > 1 : systems.length > 1;
  const typed = query.trim().length > 0;

  const toggle = (id: LookupGroupId) => setOpen(openIds.includes(id) ? openIds.filter((x) => x !== id) : [...openIds, id]);
  const changeQuery = (next: string) => { setQuery(next); if (!next.trim()) setOpen(null); };
  const pickSystem = (name: string) => {
    const current = systems ?? [];
    const next = current.includes(name) ? current.filter((s) => s !== name) : [...current, name];
    setSystems(next.length === 0 || next.length === lookupSystems.length ? null : next);
  };
  const push = (id: string) => { setStack((s) => [...s, id]); setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 5)); };
  const row = (e: LookupEntity, wide = withSystem) => (
    <button type="button" key={e.id} className="ux-source-row ux-src-row ux-lk-row" onClick={() => push(e.id)} aria-label={[e.name, e.summary, sourceLine(e, true), e.cost, e.conditional ? "Conditional" : ""].filter(Boolean).join(", ")}>
      <span><strong>{e.name}</strong><small>{e.summary}</small><small>{sourceLine(e, wide)}</small></span>
      <span className="ux-ro-list-trailing">{e.cost ? <b>{e.cost}</b> : null}{e.conditional ? <span className="ux-lf-tag info">Conditional</span> : null}</span>
    </button>
  );

  const top = stack.length ? lookupById(stack[stack.length - 1]) : undefined;
  return (
    <>
      <header className="ux-wb-top ux-wb-home-top">
        <div className="ux-wb-title"><strong>Lookup</strong><small>{noData ? "No game data yet" : `${plural(lookupSystems.length, "game system")} installed`}</small></div>
        {trailing}
      </header>
      <div className="ux-wb-home-body ux-lk-body">
        {noData ? (
          <div className="ux-search-empty ux-lk-empty"><BookOpen size={22} /><strong>Nothing to look up yet</strong><small>Lookup searches the units, detachments, upgrades and rules of your installed game data.</small><button type="button" className="ux-job-btn" onClick={onAddData}><Database size={15} />Add game data</button></div>
        ) : <>
          <label className="ux-lf-search"><Search size={16} aria-hidden /><input value={query} onChange={(e) => changeQuery(e.currentTarget.value)} placeholder="Search units, rules, upgrades…" aria-label="Search the game data" />{typed ? <button type="button" className="ux-lk-clear" aria-label="Clear search" onClick={() => changeQuery("")}><X size={16} /></button> : null}</label>
          {lookupSystems.length > 1 ? <div className="ux-lf-row"><div className="ux-lf-filters ux-lf-scroll" role="group" aria-label="Game systems to search">
            <button type="button" className={`ux-lf-chip ${systems === null ? "active" : ""}`} aria-pressed={systems === null} onClick={() => setSystems(null)}>All systems{typed ? ` ${allResults.length}` : ""}</button>
            {lookupSystems.map((s) => { const on = systems?.includes(s.name) ?? false; const n = allResults.filter((e) => e.system === s.name).length; return <button type="button" key={s.name} className={`ux-lf-chip ${on ? "active" : ""}`} aria-pressed={on} aria-label={typed ? `${s.name}, ${plural(n, "result")}` : s.name} onClick={() => pickSystem(s.name)}><span>{s.name}</span>{typed ? ` ${n}` : ""}</button>; })}
          </div></div> : null}
          {!typed ? (
            <section className="ux-lk-start" aria-label="Recently viewed">
              <p className="ux-lk-hint">Type a name, or part of one. Lookup searches units, detachments, upgrades and rules{systems === null ? " in every installed system" : ""}.</p>
              <h3 className="ux-lk-recent-head"><Clock3 size={14} aria-hidden />Recently viewed</h3>
              <div className="ux-lk-rows">{recent.map((id) => lookupById(id)).filter((e): e is LookupEntity => !!e).map((e) => row(e, true))}</div>
            </section>
          ) : groups.length === 0 ? (
            <div className="ux-search-empty ux-lk-empty"><Search size={19} /><strong>Nothing found for “{query.trim()}”</strong><small>Check the spelling, or try part of the name.</small>{systems !== null ? <button type="button" className="ux-job-btn" onClick={() => setSystems(null)}>Search all systems</button> : null}</div>
          ) : (
            <div className="ux-lk-results" role="status" aria-label={`${plural(results.length, "result")}`}>
              {ordered.map((g) => {
                const folded = !openIds.includes(g.id);
                return <section key={g.id} className={`ux-lk-section ${folded ? "folded" : ""}`} aria-label={g.label}>
                  <h3><button type="button" className="ux-lk-head" aria-expanded={!folded} aria-label={`${g.label}, ${plural(g.rows.length, "result")}`} onClick={() => toggle(g.id)}>
                    <span><span className="ux-lk-head-title"><strong>{g.label}</strong><span>· {g.rows.length}</span></span>{folded ? <small>{g.rows.map((e) => e.name).join(", ")}</small> : null}</span>
                    {folded ? <ChevronRight size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
                  </button></h3>
                  {folded ? null : <div className="ux-lk-rows">{g.rows.map((e) => row(e))}</div>}
                </section>;
              })}
            </div>
          )}
        </>}
      </div>
      {top ? <div className="ux-lk-page"><LookupEntryPage key={top.id} entity={top} back={stack.length > 1 ? lookupById(stack[stack.length - 2])?.name ?? "Lookup" : "Lookup"} onBack={() => setStack((s) => s.slice(0, -1))} onOpen={push} /></div> : null}
    </>
  );
}

/** Read-only reference page for one result. */
export function LookupEntryPage({ entity: e, back, onBack, onOpen }: { entity: LookupEntity; back: string; onBack: () => void; onOpen: (id: string) => void }) {
  const kind = lookupGroups.find((g) => g.id === e.group)?.singular ?? "";
  return <section className="ux-mobile-unit-options ux-lk-detail" aria-label={`${kind}: ${e.name}`}>
    <header className="ux-5a-header ux-nested-back ios"><button type="button" onClick={onBack} aria-label={`Back to ${back}`}><ChevronLeft size={24} /><span>{back}</span></button></header>
    <LookupEntryBody entity={e} onOpen={onOpen} />
  </section>;
}

/** The reference content, shared by the phone page and the tablet/desktop detail panes. */
export function LookupEntryBody({ entity: e, onOpen }: { entity: LookupEntity; onOpen: (id: string) => void }) {
  const kind = lookupGroups.find((g) => g.id === e.group)?.singular ?? "";
  return <>
    <div className="ux-lk-title">
      <small className="ux-lk-kind">{kind} · {e.summary}</small><h2>{e.name}</h2><small>{factionLabel(e)} · {e.system} {systemVersion(e.system)}</small>
      {e.cost ? <p className="ux-lk-cost"><strong>{e.cost}</strong>{e.costNote ? <small>{e.costNote}</small> : null}</p> : null}
    </div>
    {e.conditional ? <div className="ux-5a-notice ux-lk-cond" role="note"><Info size={18} /><span><strong>Conditional</strong><small>{e.conditional}</small></span></div> : null}
    {e.group === "unit" ? <UnitBody e={e} onOpen={onOpen} /> : null}
    {e.group === "detachment" ? <DetachmentBody e={e} onOpen={onOpen} /> : null}
    {e.group === "upgrade" ? <UpgradeBody e={e} onOpen={onOpen} /> : null}
    {e.group === "rule" ? <RuleBody e={e} onOpen={onOpen} /> : null}
    <small className="ux-lk-foot">Read-only reference from {e.system} {systemVersion(e.system)}.{e.cost || e.options ? " Costs are the data’s base values; a roster can change them." : ""}</small>
  </>;
}

function UnitBody({ e, onOpen }: { e: LookupEntity; onOpen: (id: string) => void }) {
  const [folds, setFolds] = useState<string[]>([]);
  return <>
    {e.layout ? <><h4>Layout</h4><div className="ux-5a-card ux-lk-layout">
      <strong className="ux-lk-models">{e.layout.models}</strong>
      {e.layout.rows.map((r) => <div className="ux-lk-line" key={r.name}><span><strong>{r.name}</strong><small>{r.count} {r.count === "1" ? "model" : "models"}</small></span><b>{r.cost}</b></div>)}
      {e.layout.limits?.length ? <small className="ux-lk-limits">{e.layout.limits.join(" · ")}</small> : null}
    </div></> : null}
    <Profiles e={e} />
    <RuleList ids={e.rules} onOpen={onOpen} />
    {e.options?.length ? <><h4>Options</h4><div className="ux-5a-card">{e.options.map((o) => <FoldSection key={o.title} title={o.title} counter={o.limit} folded={!folds.includes(o.title)} onFold={() => setFolds((f) => f.includes(o.title) ? f.filter((x) => x !== o.title) : [...f, o.title])}>
      {o.items.map((item) => <button type="button" key={item.name} className="ux-5a-choice ux-lk-link-row" disabled={!item.id} onClick={() => item.id && onOpen(item.id)}><span><strong>{item.name}</strong><small>{item.cost}</small></span>{item.id ? <ChevronRight size={18} aria-hidden /> : null}</button>)}
    </FoldSection>)}</div></> : null}
    {e.categories?.length ? <><h4>Categories</h4><div className="ux-5a-chips">{e.categories.map((c) => <span key={c}>{c}</span>)}</div></> : null}
  </>;
}

function DetachmentBody({ e, onOpen }: { e: LookupEntity; onOpen: (id: string) => void }) {
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  return <>
    {e.rules?.length ? <><h4>Rules</h4>{e.rules.map((id) => lookupById(id)).filter((r): r is LookupEntity => !!r).map((r) => <div className="ux-5a-card ux-lk-rule-card" key={r.id}><button type="button" className="ux-5a-choice ux-lk-link-row" onClick={() => onOpen(r.id)}><span><strong>{r.name}</strong><small>{r.summary}</small></span><ChevronRight size={18} aria-hidden /></button><p>{r.text}</p></div>)}</> : null}
    {e.slots?.length ? <><h4>Layout</h4><div className="ux-5a-card ux-lk-layout">
      {e.slots.map((s) => { const isOpen = openSlot === s.category; return <div key={s.category} className="ux-lk-slot">
        <button type="button" className="ux-5a-choice" aria-expanded={isOpen} disabled={!s.units.length} onClick={() => setOpenSlot(isOpen ? null : s.category)}><span><strong>{s.category}</strong><small>{s.units.length ? plural(s.units.length, "unit") : "No units in the installed data"}</small></span><b className="ux-lk-range">{s.min === s.max ? s.min : `${s.min}–${s.max}`}</b>{s.units.length ? isOpen ? <ChevronDown size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden /> : null}</button>
        {isOpen ? <div className="ux-lk-slot-units">{s.units.map((id) => lookupById(id)).filter((u): u is LookupEntity => !!u).map((u) => <button type="button" key={u.id} className="ux-5a-choice ux-lk-link-row" onClick={() => onOpen(u.id)}><span><strong>{u.name}</strong><small>{u.summary}</small></span>{u.cost ? <b>{u.cost}</b> : null}<ChevronRight size={18} aria-hidden /></button>)}</div> : null}
      </div>; })}
      <small className="ux-lk-limits">Minimum–maximum units of each category in this detachment.</small>
    </div></> : null}
  </>;
}

function UpgradeBody({ e, onOpen }: { e: LookupEntity; onOpen: (id: string) => void }) {
  return <>
    <Profiles e={e} />
    {e.text ? <><h4>Description</h4><div className="ux-5a-card"><p className="ux-lk-text">{e.text}</p></div></> : null}
    <RuleList ids={e.rules} onOpen={onOpen} />
    {e.takenBy?.length ? <><h4>Taken by</h4><div className="ux-5a-card ux-lk-list">{e.takenBy.map((t) => { const u = lookupById(t.id); return u ? <button type="button" key={t.id} className="ux-5a-choice ux-lk-link-row" onClick={() => onOpen(u.id)}><span><strong>{u.name}</strong><small>{t.cost} · {t.limit}</small></span><ChevronRight size={18} aria-hidden /></button> : null; })}</div></> : null}
  </>;
}

function RuleBody({ e, onOpen }: { e: LookupEntity; onOpen: (id: string) => void }) {
  return <>
    <div className="ux-5a-card"><p className="ux-lk-text">{e.text}</p></div>
    {e.usedBy?.length ? <><h4>Used by</h4><div className="ux-5a-card ux-lk-list">{e.usedBy.map((id) => lookupById(id)).filter((u): u is LookupEntity => !!u).map((u) => <button type="button" key={u.id} className="ux-5a-choice ux-lk-link-row" onClick={() => onOpen(u.id)}><span><strong>{u.name}</strong><small>{lookupGroups.find((g) => g.id === u.group)?.singular} · {factionLabel(u)}</small></span><ChevronRight size={18} aria-hidden /></button>)}</div></> : null}
  </>;
}

function Profiles({ e }: { e: LookupEntity }) {
  if (!e.profiles?.length) return null;
  return <><h4>Profiles</h4>{e.profiles.map((p) => <div className="ux-5a-card ux-5b-table-card" key={p.title}><strong>{p.title}</strong><div className="ux-5b-table"><table><thead><tr><th />{p.columns.map((c) => <th key={c} className={p.text ? "text" : undefined}>{c}</th>)}</tr></thead><tbody>{p.rows.map((r) => <tr key={r.name} aria-label={[r.name, ...p.columns.map((c, i) => `${c}: ${r.values[i]}`)].join(", ")}><th>{r.name}</th>{r.values.map((v, i) => <td key={i} className={p.text ? "text" : undefined}>{v}</td>)}</tr>)}</tbody></table></div></div>)}</>;
}

/** Rules expand in place, as on the unit Profile tab; the page link shows where else a rule is used. */
function RuleList({ ids, onOpen }: { ids?: string[]; onOpen: (id: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const rules = (ids ?? []).map((id) => lookupById(id)).filter((r): r is LookupEntity => !!r);
  if (!rules.length) return null;
  return <><h4>Rules</h4><div className="ux-5a-card">{rules.map((r) => <div key={r.id}>
    <button type="button" className="ux-5a-choice" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)}><span><strong>{r.name}</strong><small>{r.summary}</small></span>{open === r.id ? <ChevronDown size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}</button>
    {open === r.id ? <div className="ux-lk-rule-open"><p className="ux-lk-text">{r.text}</p><button type="button" className="ux-5a-link" onClick={() => onOpen(r.id)}>Where it’s used <ChevronRight size={15} /></button></div> : null}
  </div>)}</div></>;
}

