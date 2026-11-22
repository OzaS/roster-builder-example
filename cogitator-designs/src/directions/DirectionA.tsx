import { ArrowDown, ArrowUp, ChevronDown, Code2, Copy, Eye, Filter, Inbox, Layers, ListFilter, PenLine, Play, Plus, Search, SlidersHorizontal } from "lucide-react";
import { MacWindow, TrafficLights } from "../frames";
import { DiagIcon, KindIcon } from "../glyphs";
import { backlinks, diagCounts, diagnostics, entry, type DiagKind, type Kind } from "../sample";
import "./direction-a.css";

type Row = { name: string; path: string; kind: Kind; cost?: number; was?: number; diag?: DiagKind; noText?: boolean; changed?: boolean };
const groups: { label: string; rows: Row[] }[] = [
  { label: "Units", rows: [
    { name: "Warden Squad", path: "iron-wardens:warden-squad", kind: "unit", cost: 18, was: 20, diag: "preservation", changed: true },
    { name: "Warden Captain", path: "iron-wardens:warden-captain", kind: "unit", cost: 45, diag: "suggestion" },
    { name: "Ice Guard", path: "frost-wardens:ice-guard", kind: "unit", cost: 24, diag: "error" },
    { name: "frost-seer", path: "frost-wardens:frost-seer", kind: "unit", cost: 50, diag: "suggestion", noText: true },
  ] },
  { label: "Models", rows: [
    { name: "Warden", path: "warden-squad/warden", kind: "model", cost: 8 },
    { name: "Captain", path: "warden-captain/captain", kind: "model" },
    { name: "Guard", path: "ice-guard/guard", kind: "model", cost: 9 },
    { name: "Seer", path: "frost-seer/seer", kind: "model" },
  ] },
  { label: "Upgrades", rows: [
    { name: "Banner", path: "warden-squad/warden/banner", kind: "upgrade", cost: 10 },
    { name: "Spear", path: "iron-wardens:spear", kind: "upgrade", cost: 0, diag: "suggestion" },
    { name: "Halberd", path: "iron-wardens:halberd", kind: "upgrade", cost: 2 },
    { name: "Rime Blade", path: "frost-wardens:rime-blade", kind: "upgrade", cost: 3 },
  ] },
  { label: "Groups", rows: [
    { name: "Weapon", path: "warden-squad/warden/weapon", kind: "group" },
    { name: "Weapon", path: "ice-guard/guard/weapon", kind: "group", diag: "error" },
  ] },
  { label: "Rules", rows: [{ name: "Shield Wall", path: "demo-skirmish:shield-wall", kind: "rule", changed: true }] },
  { label: "Categories", rows: [
    { name: "Leader", path: "demo-skirmish:leader", kind: "category" },
    { name: "Line", path: "demo-skirmish:line", kind: "category" },
    { name: "Infantry", path: "demo-skirmish:infantry", kind: "category" },
  ] },
  { label: "Forces", rows: [
    { name: "Warband", path: "demo-skirmish:warband", kind: "force" },
    { name: "Vanguard", path: "warband/vanguard", kind: "force" },
  ] },
];

const entryIssues = diagnostics.filter((d) => d.where === entry.full);

/** Direction A, Linear-first: sidebar, dense grouped list, detail with a properties panel, diagnostics as an inbox. */
export function DirectionA({ mode }: { mode: "light" | "dark" }) {
  return (
    <MacWindow mode={mode} className="fc-a">
      <div className="a-grid">
        <aside className="a-side">
          <div className="a-side-top"><TrafficLights /><span className="a-icons"><PenLine size={15} /></span></div>
          <button className="a-dataset"><span className="a-ds-mark">DS</span><span><strong>Demo Skirmish</strong><small>3.2.0 · 3 of 4 layers</small></span><ChevronDown size={14} /></button>
          <button className="a-search"><Search size={14} />Search or run a command<kbd>⌘K</kbd></button>
          <nav className="a-nav">
            <button className="a-item"><Inbox size={15} />Inbox<span className="a-badge">{diagnostics.length}</span></button>
            <button className="a-item sub"><DiagIcon kind="error" size={13} />Errors<span className="num">{diagCounts.error}</span></button>
            <button className="a-item sub"><DiagIcon kind="preservation" size={13} />Preservation<span className="num">{diagCounts.preservation}</span></button>
            <button className="a-item sub"><DiagIcon kind="suggestion" size={13} />Suggestions<span className="num">{diagCounts.suggestion}</span></button>
            <button className="a-item"><Play size={15} />Checks<span className="muted">2 min ago</span></button>
            <button className="a-item"><Layers size={15} />Layers<span className="num">4</span></button>
          </nav>
          <h3>Views</h3>
          <nav className="a-nav">
            <button className="a-item active"><ListFilter size={15} />All entries<span className="num">20</span></button>
            <button className="a-item"><Layers size={15} />Changed by layers<span className="num">2</span></button>
            <button className="a-item"><Eye size={15} />Unreferenced<span className="num">1</span></button>
          </nav>
          <h3>Modules</h3>
          <nav className="a-nav">
            <button className="a-item"><KindIcon kind="system" size={15} />Demo Skirmish<span className="num">6</span></button>
            <button className="a-item"><KindIcon kind="system" size={15} />Iron Wardens<span className="num">8</span></button>
            <button className="a-item"><KindIcon kind="system" size={15} />Frost Wardens<span className="a-layer">Frost</span><span className="num">6</span></button>
          </nav>
          <footer className="a-side-foot"><span className="a-dot" />Saved · fmt clean</footer>
        </aside>

        <section className="a-list" aria-label="Entries">
          <header className="a-bar">
            <strong>All entries</strong>
            <span className="muted">20</span>
            <span className="a-spacer" />
            <button className="a-icon" aria-label="Filter"><Filter size={15} /></button>
            <button className="a-icon" aria-label="Display"><SlidersHorizontal size={15} /></button>
          </header>
          <div className="a-filters"><span className="a-chip">Group: kind</span><span className="a-chip">Layer: all</span><span className="a-chip ghost"><Plus size={12} />Filter</span><span className="a-cols"><span>Cost</span></span></div>
          <div className="a-rows">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="a-group"><ChevronDown size={13} />{group.label}<span className="muted">{group.rows.length}</span></div>
                {group.rows.map((row) => (
                  <div key={row.path} className={`a-row${row.path === entry.full ? " selected" : ""}`}>
                    <KindIcon kind={row.kind} size={14} />
                    <span className={`a-name${row.noText ? " notext" : ""}`}>{row.name}</span>
                    <span className="a-path mono">{row.path}</span>
                    {row.changed ? <span className="a-changed" title="Changed by a layer" /> : <span className="a-changed off" />}
                    <span className="a-cost num">{row.cost ?? "–"}</span>
                    <span className="a-diag">{row.diag ? <DiagIcon kind={row.diag} size={13} /> : null}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="a-detail" aria-label="Entry">
          <header className="a-bar">
            <span className="a-crumbs">All entries<span>›</span>Units<span>›</span><strong>Warden Squad</strong></span>
            <span className="a-spacer" />
            <span className="muted">1 / 20</span>
            <button className="a-icon" aria-label="Previous entry"><ArrowUp size={15} /></button>
            <button className="a-icon" aria-label="Next entry"><ArrowDown size={15} /></button>
            <button className="a-ghost"><Code2 size={14} />Source<kbd>⌘E</kbd></button>
          </header>
          <div className="a-detail-grid">
            <div className="a-body">
              <h1>{entry.name}</h1>
              <p className="a-pathline mono">{entry.full}<Copy size={12} /></p>

              <div className="a-issues">
                <h2><Inbox size={14} />In your inbox<span className="muted">{entryIssues.length}</span></h2>
                {entryIssues.map((issue) => (
                  <div key={issue.id} className="a-issue">
                    <DiagIcon kind={issue.kind} size={14} />
                    <span>{issue.message.split("`").map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part))}</span>
                    <button className="a-ghost sm">{issue.fix}</button>
                  </div>
                ))}
              </div>

              <h2 className="a-h">Contents<span className="muted">3 children · 9 statements</span><button className="a-icon sm" aria-label="Add child"><Plus size={14} /></button></h2>
              <ul className="a-sub">
                <li className="d0"><KindIcon kind="model" size={14} /><strong>Warden</strong><span className="mono muted">model warden 5..10</span><span className="num">8</span></li>
                <li className="d1"><span className="a-k">profile</span><span className="mono">fighter | 5" | 3 | 1</span></li>
                <li className="d1"><KindIcon kind="upgrade" size={14} /><strong>Banner</strong><span className="mono muted">upgrade banner ..1</span><span className="num">10</span></li>
                <li className="d2"><span className="a-k">hide when</span><span className="mono">no(<a>warden-captain</a> in force, deep)</span></li>
                <li className="d1"><KindIcon kind="group" size={14} /><strong>Weapon</strong><span className="mono muted">group weapon 1 default spear</span></li>
                <li className="d2"><span className="a-k">use</span><span className="mono"><a>spear</a>, <a>halberd</a></span><span className="num muted">0, 2</span></li>
              </ul>

              <h2 className="a-h">Text<span className="muted">en</span></h2>
              <div className="a-text"><span className="muted mono">warden-squad</span><span>Warden Squad</span></div>

              <h2 className="a-h">Backlinks<span className="muted">{backlinks.length}</span></h2>
              <ul className="a-feed">
                {backlinks.map((link) => (
                  <li key={link.from}><span className="a-feed-dot" /><span><a className="mono">{link.from}</a> <span className="muted">· {link.note}</span><br /><code>{link.where}</code></span><span className="muted">{link.layer}</span></li>
                ))}
              </ul>
            </div>

            <aside className="a-props" aria-label="Properties">
              <h2>Properties</h2>
              <dl>
                <dt>Kind</dt><dd><KindIcon kind="unit" size={14} />Unit</dd>
                <dt>Module</dt><dd>Iron Wardens</dd>
                <dt>Cost</dt><dd><strong className="num">18 pts</strong><span className="a-was">20</span><span className="a-layer">House rules</span></dd>
                <dt>Categories</dt><dd className="wrap"><span className="a-chip">infantry</span><span className="a-chip">line</span><Plus size={13} className="muted" /></dd>
                <dt>Root</dt><dd className="mono">cat line*</dd>
                <dt>Rules</dt><dd><a>Shield Wall</a></dd>
                <dt>Layer</dt><dd>Base<span className="muted">+ 1 patch</span></dd>
                <dt>BSData id</dt><dd className="mono">{entry.bsdataId}</dd>
                <dt>Text key</dt><dd className="mono">{entry.textKey}</dd>
                <dt>Extra</dt><dd className="mono wrap">{entry.extra.key}: {entry.extra.value}</dd>
              </dl>
              <h2>Keys</h2>
              <p className="a-keys"><kbd>C</kbd> cost <kbd>T</kbd> categories <kbd>L</kbd> layer <kbd>F12</kbd> definition <kbd>⇧F12</kbd> backlinks <kbd>F2</kbd> rename</p>
            </aside>
          </div>
        </section>
      </div>
    </MacWindow>
  );
}
