import { useState, type ReactNode } from "react";
import { Anchor, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Clock3, Compass, Crown, Database, Feather, Flag, Gem, Hexagon, Info, Search, Shield, Star, Target, X, type LucideIcon } from "lucide-react";
import { factionLabel, kindLabel, lookupById, lookupEntities, lookupSystems, sourceLine, systemVersion, type LookupEntity } from "../../data/lookupData";
import { PhoneSearchHeader } from "./PhoneSearchHeader";
import { FoldSection } from "./MobileUnitOptions";
import { plural, useLookup } from "./useLookup";
import "./phone-lists.css";
import "./phone-lookup.css";

/**
 * Lookup 1.0 on the phone (design session 2026-10-31). Name search over every installed game system, or the chosen
 * ones; search expands across the top bar, replacing the title and avatar. System chips stay visible and scroll. Results sit in
 * four sections with a count each: Units, Forces & detachments, Upgrades, Rules. Units start open on top;
 * the others start folded, and folded sections always sort below the open ones (fixed group order inside each part).
 * No units → the first group with results opens instead. Fold state lasts for the search; clearing the field resets it.
 * A result opens a read-only reference page (a pushed page; Back names where it returns). D10: hidden-by-default or
 * conditional entries are listed with a Conditional tag and explained on their page; costs are the data's base values.
 */
const recentIds = ["r-hold-line", "u-line-fc", "d-line-formation"];

export function PhoneLookup({ initialQuery = "line", initialStack = [], noData = false, trailing, onAddData }: { initialQuery?: string; initialStack?: string[]; noData?: boolean; trailing?: ReactNode; onAddData?: () => void }) {
  const lk = useLookup(initialQuery);
  const { query, systems, results, allResults, ordered, openIds, typed, withSystem } = lk;
  const [stack, setStack] = useState<string[]>(initialStack);
  const [recent, setRecent] = useState(recentIds);
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
      <PhoneSearchHeader title="Lookup" subtitle={noData ? "No game data yet" : `${plural(lookupSystems.length, "game system")} installed`}
        query={query} onQueryChange={lk.setQuery} placeholder="Search units, rules, upgrades…" trailing={trailing} initialOpen={!!initialQuery} searchable={!noData} />
      <div className="ux-wb-home-body ux-lk-body">
        {noData ? (
          <div className="ux-search-empty ux-lk-empty"><BookOpen size={22} /><strong>Nothing to look up yet</strong><small>Lookup searches the units, detachments, upgrades and rules of your installed game data.</small><button type="button" className="ux-job-btn" onClick={onAddData}><Database size={15} />Add game data</button></div>
        ) : <>
          {lookupSystems.length > 1 ? <div className="ux-lf-row"><div className="ux-lf-filters ux-lf-scroll ux-lf-always" role="group" aria-label="Game systems to search">
            <button type="button" className={`ux-lf-chip ${systems === null ? "active" : ""}`} aria-pressed={systems === null} aria-label={typed ? `All systems, ${plural(allResults.length, "result")}` : "All systems"} onClick={() => lk.setSystems(null)}>All{typed ? ` ${allResults.length}` : ""}</button>
            {lookupSystems.map((s) => { const on = systems?.includes(s.name) ?? false; const n = lk.countIn(s.name); return <button type="button" key={s.name} className={`ux-lf-chip ${on ? "active" : ""}`} aria-pressed={on} aria-label={typed ? `${s.name}, ${plural(n, "result")}` : s.name} onClick={() => lk.pickSystem(s.name)}><span>{s.name}</span>{typed ? ` ${n}` : ""}</button>; })}
          </div></div> : null}
          {!typed ? (
            <section className="ux-lk-start" aria-label="Recently viewed">
              <p className="ux-lk-hint">Type a name, or part of one. Lookup searches units, detachments, upgrades and rules{systems === null ? " in every installed system" : ""}.</p>
              <h3 className="ux-lk-recent-head"><Clock3 size={14} aria-hidden />Recently viewed</h3>
              <div className="ux-lk-rows">{recent.map((id) => lookupById(id)).filter((e): e is LookupEntity => !!e).map((e) => row(e, true))}</div>
            </section>
          ) : ordered.length === 0 ? (
            <div className="ux-search-empty ux-lk-empty"><Search size={19} /><strong>Nothing found for “{query.trim()}”</strong><small>Check the spelling, or try part of the name.</small>{systems !== null ? <button type="button" className="ux-job-btn" onClick={() => lk.setSystems(null)}>Search all systems</button> : null}</div>
          ) : (
            <div className="ux-lk-results" role="status" aria-label={`${plural(results.length, "result")}`}>
              {ordered.map((g) => <LookupSection key={g.id} label={g.label} count={g.rows.length} names={g.rows.map((e) => e.name)} folded={!openIds.includes(g.id)} onToggle={() => lk.toggle(g.id)}>{g.rows.map((e) => row(e))}</LookupSection>)}
            </div>
          )}
        </>}
      </div>
      {top ? <div className="ux-lk-page"><LookupEntryPage key={top.id} entity={top} back={stack.length > 1 ? lookupById(stack[stack.length - 2])?.name ?? "Lookup" : "Lookup"} onBack={() => setStack((s) => s.slice(0, -1))} onOpen={push} /></div> : null}
    </>
  );
}

/** A result section: header button with the group's count (and a preview of the names while folded), then its rows. */
export function LookupSection({ label, count, names, folded, onToggle, children }: { label: string; count: number; names: string[]; folded: boolean; onToggle: () => void; children: ReactNode }) {
  return <section className={`ux-lk-section ${folded ? "folded" : ""}`} aria-label={label}>
    <h3><button type="button" className="ux-lk-head" aria-expanded={!folded} aria-label={`${label}, ${plural(count, "result")}`} onClick={onToggle}>
      <span><span className="ux-lk-head-title"><strong>{label}</strong><span>· {count}</span></span>{folded ? <small>{names.join(", ")}</small> : null}</span>
      {folded ? <ChevronRight size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
    </button></h3>
    {folded ? null : <div className="ux-lk-rows">{children}</div>}
  </section>;
}

/** Read-only reference page for one result. */
export function LookupEntryPage({ entity: e, back, onBack, onOpen }: { entity: LookupEntity; back: string; onBack: () => void; onOpen: (id: string) => void }) {
  const kind = kindLabel(e);
  return <section className="ux-mobile-unit-options ux-lk-detail" aria-label={`${kind}: ${e.name}`}>
    <header className="ux-5a-header ux-nested-back ios"><button type="button" onClick={onBack} aria-label={`Back to ${back}`}><ChevronLeft size={24} /><span>{back}</span></button></header>
    <LookupEntryBody entity={e} onOpen={onOpen} />
  </section>;
}

/** The reference content, shared by the phone page and the tablet/desktop detail panes. */
export function LookupEntryBody({ entity: e, onOpen }: { entity: LookupEntity; onOpen: (id: string) => void }) {
  const kind = kindLabel(e);
  // The model range belongs to Layout; do not repeat it in the reference heading.
  const summary = e.layout ? e.summary.split(" · ").filter(part => part !== e.layout?.models).join(" · ") : e.summary;
  return <>
    <div className="ux-lk-title">
      <div className="ux-lk-heading"><h2>{e.name}</h2>{e.cost ? <strong className="ux-lk-base-cost">{e.cost}</strong> : null}</div>
      <small className="ux-lk-kind">{summary.startsWith(kind) ? summary : `${kind} · ${summary}`}</small>
      <small>{factionLabel(e)} · {e.system} {systemVersion(e.system)}</small>
      {e.cost && e.costNote ? <small className="ux-lk-cost-note">{e.costNote}</small> : null}
    </div>
    {e.conditional ? <div className="ux-5a-notice ux-lk-cond" role="note"><Info size={18} /><span><strong>Conditional</strong><small>{e.conditional}</small></span></div> : null}
    {e.group === "unit" ? <UnitBody e={e} onOpen={onOpen} /> : null}
    {e.group === "force" ? <ForceBody e={e} onOpen={onOpen} /> : null}
    {e.group === "upgrade" ? <UpgradeBody e={e} onOpen={onOpen} /> : null}
    {e.group === "rule" ? <RuleBody e={e} onOpen={onOpen} /> : null}
    <small className="ux-lk-foot">Read-only reference from {e.system} {systemVersion(e.system)}.{e.cost || e.options ? " Costs are the data’s base values; a roster can change them." : ""}</small>
  </>;
}

function UnitBody({ e, onOpen }: { e: LookupEntity; onOpen: (id: string) => void }) {
  const [folds, setFolds] = useState<string[]>([]);
  return <>
    {e.layout ? <section className="ux-lk-composition" aria-label="Model layout">
      <header><h4>Layout <span>· {e.layout.models}</span></h4>{e.layout.limits?.length ? <small>{e.layout.limits.join(" · ")}</small> : null}</header>
      <dl>{e.layout.rows.map((r) => <div className="ux-lk-model-row" key={r.name}>
        <dt>{r.name} <small>{r.count} {r.count === "1" ? "model" : "models"}</small></dt><dd>{r.cost}</dd>
      </div>)}</dl>
    </section> : null}
    <Profiles e={e} />
    <RuleList ids={e.rules} onOpen={onOpen} />
    {e.options?.length ? <><h4>Options</h4><div className="ux-5a-card">{e.options.map((o) => <FoldSection key={o.title} title={o.title} counter={o.limit} folded={!folds.includes(o.title)} onFold={() => setFolds((f) => f.includes(o.title) ? f.filter((x) => x !== o.title) : [...f, o.title])}>
      {o.items.map((item) => <button type="button" key={item.name} className="ux-5a-choice ux-lk-link-row" disabled={!item.id} onClick={() => item.id && onOpen(item.id)}><span><strong>{item.name}</strong><small>{item.cost}</small></span>{item.id ? <ChevronRight size={18} aria-hidden /> : null}</button>)}
    </FoldSection>)}</div></> : null}
    {e.categories?.length ? <><h4>Categories</h4><div className="ux-5a-chips">{e.categories.map((c) => <span key={c}>{c}</span>)}</div></> : null}
  </>;
}

function ForceBody({ e, onOpen }: { e: LookupEntity; onOpen: (id: string) => void }) {
  const parent = e.partOf ? lookupById(e.partOf) : undefined;
  const detachments = (e.detachments ?? []).map((id) => lookupById(id)).filter((d): d is LookupEntity => !!d);
  return <>
    {e.rules?.length ? <><h4>Rules</h4>{e.rules.map((id) => lookupById(id)).filter((r): r is LookupEntity => !!r).map((r) => <div className="ux-5a-card ux-lk-rule-card" key={r.id}><button type="button" className="ux-5a-choice ux-lk-link-row" onClick={() => onOpen(r.id)}><span><strong>{r.name}</strong><small>{r.summary}</small></span><ChevronRight size={18} aria-hidden /></button><p>{r.text}</p></div>)}</> : null}
    {e.slots?.length ? <><h4>Layout</h4><div className="ux-5a-card"><ForceSchema system={e.system} slots={e.slots} /></div></> : null}
    {detachments.length ? <><h4>Detachments</h4><div className="ux-5a-card ux-lk-list">{detachments.map((d) => <button type="button" key={d.id} className="ux-5a-choice ux-lk-link-row" onClick={() => onOpen(d.id)}><span><strong>{d.name}</strong><small>{slotSummary(d)}</small></span>{d.conditional ? <span className="ux-lf-tag info">Conditional</span> : null}<ChevronRight size={18} aria-hidden /></button>)}</div></> : null}
    {parent ? <><h4>Part of</h4><div className="ux-5a-card ux-lk-list"><button type="button" className="ux-5a-choice ux-lk-link-row" onClick={() => onOpen(parent.id)}><span><strong>{parent.name}</strong><small>Force · {slotSummary(parent)}</small></span><ChevronRight size={18} aria-hidden /></button></div></> : null}
  </>;
}

const rangeLabel = (min: number, max: number) => max < 0 ? `${min}+` : min === max ? `${min}` : `${min}–${max}`;
const slotSummary = (e: LookupEntity) => (e.slots ?? []).map((s) => `${s.category} ${rangeLabel(s.min, s.max)}`).join(" · ");

/** Neutral icons for slot categories. The data has none, so each game system's slot categories, sorted by name, take
 * the icons in order: every category of a system has its own icon, the same in every force. The name is always printed,
 * so the icon is decoration only. */
const schemaIcons: LucideIcon[] = [Crown, Shield, Star, Flag, Compass, Hexagon, Gem, Anchor, Target, Feather];
function slotIcon(system: string, name: string) {
  const names = [...new Set(lookupEntities.filter((e) => e.system === system).flatMap((e) => e.slots ?? []).map((s) => s.category))].sort();
  return schemaIcons[Math.max(0, names.indexOf(name)) % schemaIcons.length];
}

/**
 * Force layout as a schema, after the printed force charts: one ring per slot, grouped by category, the category and
 * its range under each group. Required slots (the minimum) have a heavy, spiked ring; optional ones a thin ring.
 * At most 6 rings per category; the rest is a "+n" pill, and no maximum is a "+∞" pill.
 */
export function ForceSchema({ system, slots }: { system: string; slots: Array<{ category: string; min: number; max: number }> }) {
  return <div className="ux-lk-schema-wrap">
    <div className="ux-lk-schema" role="list" aria-label="Slots">
      {slots.map((s) => {
        const Icon = slotIcon(system, s.category);
        const optional = s.max < 0 ? 1 : s.max - s.min;
        const req = Math.min(s.min, 6);
        const opt = Math.min(optional, 6 - req);
        const more = s.max < 0 ? "+∞" : s.min - req + optional - opt > 0 ? `+${s.min - req + optional - opt}` : null;
        return <div role="listitem" key={s.category} className="ux-lk-slotgroup" aria-label={`${s.category}: ${s.min ? `${s.min} required` : "optional"}${s.max < 0 ? ", no maximum" : s.max > s.min ? `, up to ${s.max}` : ""}`}>
          <div className="ux-lk-rings" aria-hidden>
            {Array.from({ length: req }, (_, i) => <span key={`r${i}`} className="ux-lk-ring req"><Icon size={18} /></span>)}
            {Array.from({ length: opt }, (_, i) => <span key={`o${i}`} className="ux-lk-ring"><Icon size={18} /></span>)}
            {more ? <span className="ux-lk-more">{more}</span> : null}
          </div>
          <span className="ux-lk-slotname" aria-hidden><strong>{s.category}</strong><small>{rangeLabel(s.min, s.max)}</small></span>
        </div>;
      })}
    </div>
    <div className="ux-lk-legend" aria-hidden><span><i className="ux-lk-ring req mini" />Required</span><span><i className="ux-lk-ring mini" />Optional</span></div>
  </div>;
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
    {e.usedBy?.length ? <><h4>Used by</h4><div className="ux-5a-card ux-lk-list">{e.usedBy.map((id) => lookupById(id)).filter((u): u is LookupEntity => !!u).map((u) => <button type="button" key={u.id} className="ux-5a-choice ux-lk-link-row" onClick={() => onOpen(u.id)}><span><strong>{u.name}</strong><small>{kindLabel(u)} · {factionLabel(u)}</small></span><ChevronRight size={18} aria-hidden /></button>)}</div></> : null}
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

