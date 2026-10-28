import { useState } from "react";
import { Archive, Check, CircleArrowUp, Layers3, Search, Wand2, X } from "lucide-react";
import { rosterLibrary, type RosterSummary } from "../desktop/desktopData";
import "./phone-lists.css";

/**
 * Phone Lists with search, the filter row and grouping (TFB-005): the tablet Rosters controls on the phone. All and
 * More / Less stay fixed with only the game system and Needs attention choices scrolling between them; the icon-only
 * Group by game system toggle is fixed at the trailing end of the same row. Grouping shows a section per game system.
 * The search and filters share the tablet page's state, so a width change keeps them. Synthetic rosters only.
 */
const needsAttention = (r: RosterSummary) => r.status === "data-changed" || r.status === "faction-removed";
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function systemsOf(rosters: RosterSummary[]) {
  const counts = new Map<string, number>();
  for (const r of rosters) counts.set(r.system, (counts.get(r.system) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count }));
}

function Tag({ r }: { r: RosterSummary }) {
  if (r.status === "data-changed") return <span className="ux-lf-tag info"><CircleArrowUp size={11} />Changed by update</span>;
  if (r.status === "faction-removed") return <span className="ux-lf-tag neutral"><Archive size={11} />Faction removed</span>;
  if (r.status === "issues") return <span className="ux-lf-tag err">{plural(r.issues ?? 1, "error")}</span>;
  return null;
}

export function PhoneListsFilters({ initialGrouped = false, initialExpanded = false }: { initialGrouped?: boolean; initialExpanded?: boolean }) {
  const [promptOpen, setPromptOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(initialExpanded);
  const [system, setSystem] = useState<string | null>(null);
  const [attention, setAttention] = useState(false);
  const [grouped, setGrouped] = useState(initialGrouped);
  const rosters = rosterLibrary;
  const systems = systemsOf(rosters);
  const bySystem = systems.length >= 2;
  const attentionCount = rosters.filter(needsAttention).length;
  const q = query.trim().toLowerCase();
  const visible = rosters.filter((r) => `${r.name} ${r.faction} ${r.system}`.toLowerCase().includes(q) && (!attention || needsAttention(r)) && (system === null || r.system === system));
  const groups = bySystem && grouped ? systems.map((s) => ({ name: s.name, rows: visible.filter((r) => r.system === s.name) })).filter((g) => g.rows.length > 0) : null;
  const more = ["More", system, attention ? "Needs attention" : null].filter(Boolean).join(" · ");
  const clear = () => { setQuery(""); setSystem(null); setAttention(false); };
  const row = (r: RosterSummary) => (
    <article key={r.name} className="ux-source-row ux-src-row ux-lf-roster">
      <span><strong>{r.name}</strong><small>{r.faction} · {r.system}</small><small>Opened {r.opened}</small></span>
      <span className="ux-ro-list-trailing"><b className={r.used > r.limit ? "over" : ""}>{r.used} / {r.limit} pts</b><Tag r={r} /></span>
    </article>
  );
  return (
    <main className="ux-lists-main ux-lf">
      {promptOpen ? <div className="ux-cmd-hero"><button type="button" className="ux-cmd-hero-close" aria-label="Close getting started prompt" onClick={() => setPromptOpen(false)}><X size={16} /></button><Wand2 size={20} /><h2>What do you want to build?</h2><p>Start a new roster. Rosters you open stay here, most recent first.</p></div> : null}
      <label className="ux-lf-search"><Search size={16} aria-hidden /><input value={query} onChange={(e) => setQuery(e.currentTarget.value)} placeholder="Find a roster or faction…" aria-label="Find a roster" /></label>
      <div className="ux-lf-row">
        <div className="ux-lf-filters" role="group" aria-label="Show rosters">
          <button type="button" className={`ux-lf-chip start ${!attention && system === null ? "active" : ""}`} aria-pressed={!attention && system === null} onClick={() => { setSystem(null); setAttention(false); }}>All {rosters.length}</button>
          {expanded ? <div className="ux-lf-scroll" role="group" aria-label="Additional roster filters">
            {bySystem && systems.map((s) => <button type="button" key={s.name} className={`ux-lf-chip ${system === s.name ? "active" : ""}`} aria-pressed={system === s.name} aria-label={`${s.name}, ${plural(s.count, "roster")}`} onClick={() => setSystem(system === s.name ? null : s.name)}>{system === s.name ? <Check size={15} aria-hidden /> : null}<span>{s.name}</span> {s.count}</button>)}
            {attentionCount > 0 ? <button type="button" className={`ux-lf-chip ${attention ? "active" : ""}`} aria-pressed={attention} onClick={() => setAttention(!attention)}>{attention ? <Check size={15} aria-hidden /> : null}Needs attention {attentionCount}</button> : null}
          </div> : null}
          {expanded
            ? <button type="button" className="ux-lf-chip end" aria-expanded={true} onClick={() => setExpanded(false)}>Less</button>
            : <button type="button" className={`ux-lf-chip end ${system !== null || attention ? "active" : ""}`} aria-expanded={false} onClick={() => setExpanded(true)}><span>{more}</span></button>}
        </div>
        {bySystem ? <button type="button" className={`ux-lf-group ${grouped ? "active" : ""}`} aria-pressed={grouped} aria-label="Group by game system" title="Group by game system" onClick={() => setGrouped(!grouped)}><Layers3 size={19} aria-hidden /></button> : null}
      </div>
      {groups && groups.length > 0 ? null : <div className="ux-result-label">Recent</div>}
      {visible.length === 0
        ? <div className="ux-search-empty"><Search size={19} /><strong>No rosters match</strong><small>Try another name, or clear the filters.</small><button type="button" className="ux-job-btn" onClick={clear}>Clear filters</button></div>
        : groups
          ? groups.map((g) => <section key={g.name} className="ux-lf-group-section" aria-label={g.name}><h3 className="ux-lf-group-head" aria-label={`${g.name}, ${plural(g.rows.length, "roster")}`}><span>{g.name}</span><span aria-hidden>· {g.rows.length}</span></h3>{g.rows.map(row)}</section>)
          : <div className="ux-lf-list">{visible.map(row)}</div>}
    </main>
  );
}
