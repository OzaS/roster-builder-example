import { Check, CheckCheck, ChevronDown, Code2, Copy, CornerDownLeft, FileDiff, Play, RefreshCw, Search, Undo2, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { DiagIcon, KindIcon } from "../../glyphs";
import { diagOne, type DiagKind, type Diagnostic } from "../../sample";
import { lookupRow, sourceOfEntry } from "../../directions/direction-d-content";
import { allDiagnostics, kindHeading, kindOrder, modulesById, place, plain } from "./data";
import { CodeView } from "./code";
import { code } from "./parts";
import { BackForward, EditorGrid, Sidebar, Win, type Mode, useWindowKeys } from "./shell";

/**
 * Screen 3: the diagnostics inbox. The sidebar's Updates opens it as a full view in place of the list and the page
 * (D's helper panel stays the quick, per-page view; its Dataset scope and the box's "Open all" lead here). Linear-style:
 * grouped by kind, filters (source, layer, code), keyboard triage, a detail pane with the affected text and the fix,
 * the export difference for a preservation failure, and a bulk fix for a suggestion code.
 */
export type InboxState = "inbox" | "preservation" | "stale" | "clear";

type Row = Diagnostic & { entry?: string; entryName: string; source: string; file: string; line?: number };
const rows: Row[] = allDiagnostics.map((d) => {
  const top = d.where.split("/")[0];
  const entry = top.includes(":") && lookupRow(top) ? top : undefined;
  const p = place(d);
  const moduleId = p?.module ?? d.where.split(":")[0];
  const m = modulesById[moduleId];
  const source = entry ? sourceOfEntry(entry)?.name ?? "" : m?.name ?? (moduleId === "demo-skirmish" ? "Demo Skirmish" : moduleId);
  const entryName = entry ? lookupRow(entry)?.row.name ?? entry : d.where.includes(":house") ? "patch house" : "module header";
  return { ...d, entry, entryName, source, file: m?.path ?? `${moduleId}/module.dkl`, line: p?.line };
});

/** Export differences for the preservation failures (what the XML data files export writes against the original). */
const diffs: Record<string, { file: string; note: string; lines: { t: " " | "-" | "+"; text: string }[] }> = {
  d2: {
    file: "iron-wardens.cat", note: "The comment is kept (in the compatibility envelope), but the export writes it inside the entry, after the attributes, instead of before it. The data is the same; only the comment's place differs.",
    lines: [
      { t: "-", text: "<!-- review: second pass -->" },
      { t: " ", text: "<selectionEntry id=\"1f0a-5e1e-0000-0001\" name=\"Warden Squad\" type=\"unit\" exampleReviewState=\"draft\">" },
      { t: "+", text: "  <!-- review: second pass -->" },
      { t: " ", text: "  <categoryLinks>" },
    ],
  },
  d3: {
    file: "demo-skirmish.gst", note: "The element is kept with its namespace, but the export writes the namespace on the element instead of the prefix declared on the root. Readers that compare text see a change; readers that parse XML don't.",
    lines: [
      { t: " ", text: "<gameSystem id=\"d5a0-0000-0000-0001\" name=\"Demo Skirmish\" xmlns:ex=\"https://example.org/editor\">" },
      { t: "-", text: "  <ex:editorState pinned=\"true\"/>" },
      { t: "+", text: "  <editorState xmlns=\"https://example.org/editor\" pinned=\"true\"/>" },
    ],
  },
};

const CHECKED = "14:06";

export function DiagnosticsScreen({ mode, state = "inbox", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (["inbox", "preservation", "stale", "clear"].includes(state) ? state : "inbox") as InboxState;
  const [selId, setSelId] = useState(s === "preservation" ? "d2" : "d1");
  const [resolved, setResolved] = useState<ReadonlySet<string>>(new Set(s === "clear" ? allDiagnostics.map((d) => d.id) : []));
  const [stale, setStale] = useState(s === "stale");
  const [checking, setChecking] = useState<"idle" | "busy">("idle");
  const [checkedAt, setCheckedAt] = useState(s === "clear" ? "14:21" : CHECKED);
  const [filters, setFilters] = useState<{ source?: string; layer?: string; code?: string }>({});
  const [menu, setMenu] = useState<"source" | "layer" | "code" | null>(null);
  const [query, setQuery] = useState("");
  const [opened, setOpened] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const shown = rows.filter((r) => (!filters.source || r.source === filters.source) && (!filters.layer || r.layer === filters.layer) && (!filters.code || r.code === filters.code) && (!q || plain(r.message).toLowerCase().includes(q) || r.where.includes(q)));
  const open = rows.filter((r) => !resolved.has(r.id));
  const ordered = kindOrder.flatMap((k) => shown.filter((r) => r.kind === k));
  const sel = rows.find((r) => r.id === selId) ?? ordered[0];
  const resolve = (ids: string[]) => setResolved((cur) => { const next = new Set(cur); ids.forEach((id) => next.add(id)); return next; });
  const unresolve = (id: string) => setResolved((cur) => { const next = new Set(cur); next.delete(id); return next; });
  const runChecks = () => { if (checking === "busy") return; setChecking("busy"); window.setTimeout(() => { setChecking("idle"); setStale(false); setCheckedAt("14:22"); }, 900); };
  const move = (step: number) => {
    const live = ordered;
    const i = live.findIndex((r) => r.id === sel?.id);
    const next = live[Math.max(0, Math.min(live.length - 1, i + step))];
    if (next) { setSelId(next.id); requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus()); }
  };

  /* Keyboard triage: ↑ ↓ / j k move, ↵ opens the entry, ⌥↵ applies the fix, ⌘⇧C runs checks. */
  const keys = useRef({ move, enter: () => undefined as void, fix: () => undefined as void, run: runChecks });
  keys.current = {
    move, run: runChecks,
    enter: () => { if (sel?.entry) setOpened(sel.entryName); },
    fix: () => { if (sel && sel.kind !== "preservation" && !resolved.has(sel.id)) resolve([sel.id]); },
  };
  const claim = useWindowKeys(interactive, (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).tagName === "INPUT") return;
      if (event.metaKey && event.shiftKey && event.key.toLowerCase() === "c") { event.preventDefault(); keys.current.run(); return; }
      if (event.key === "ArrowDown" || event.key === "j") { event.preventDefault(); keys.current.move(1); }
      if (event.key === "ArrowUp" || event.key === "k") { event.preventDefault(); keys.current.move(-1); }
      if (event.key === "Enter" && event.altKey) { event.preventDefault(); keys.current.fix(); return; }
      if (event.key === "Enter") keys.current.enter();
      if (event.key === "Escape") { setMenu(null); setOpened(null); }
  });

  const all = open.length === 0;
  const options = {
    source: [...new Set(rows.map((r) => r.source))],
    layer: [...new Set(rows.map((r) => r.layer))],
    code: [...new Set(rows.map((r) => r.code))],
  };
  const chip = (key: "source" | "layer" | "code", labelText: string) => (
    <span className="cg-chipwrap" key={key}>
      <button type="button" className={`cg-chip${filters[key] ? " on" : ""}`} aria-haspopup="menu" aria-expanded={menu === key} onClick={() => setMenu(menu === key ? null : key)}
        title={`Show only one ${labelText.toLowerCase()}`}>{labelText}<strong>{filters[key] ? (key === "code" ? `dklpo/${filters[key]}` : filters[key]) : "All"}</strong><ChevronDown size={12} /></button>
      {filters[key] ? <button type="button" className="cg-chip-x" aria-label={`Clear the ${labelText.toLowerCase()} filter`} title="Clear this filter" onClick={() => setFilters({ ...filters, [key]: undefined })}><X size={12} /></button> : null}
      {menu === key ? (
        <div className="cg-menu cg-chipmenu" role="menu">
          <button type="button" role="menuitemradio" aria-checked={!filters[key]} className={`cg-menu-item${!filters[key] ? " sel" : ""}`} onClick={() => { setFilters({ ...filters, [key]: undefined }); setMenu(null); }}>All {labelText.toLowerCase()}s<span className="cg-menu-key">{rows.length}</span></button>
          <div className="cg-menu-sep" />
          {options[key].map((o) => (
            <button type="button" role="menuitemradio" aria-checked={filters[key] === o} key={o} className={`cg-menu-item${filters[key] === o ? " sel" : ""}`} onClick={() => { setFilters({ ...filters, [key]: o }); setMenu(null); }}>
              {key === "code" ? <span className="mono">dklpo/{o}</span> : o}<span className="cg-menu-key">{rows.filter((r) => r[key] === o).length}</span>
            </button>
          ))}
        </div>
      ) : null}
    </span>
  );

  const listBody = all ? null : kindOrder.map((kind) => {
    const list = shown.filter((r) => r.kind === kind);
    if (!list.length) return null;
    return (
      <section key={kind} className="cg-ib-group" role="group" aria-label={kindHeading[kind]}>
        <h3><DiagIcon kind={kind} size={13} />{kindHeading[kind]}<span className="d-muted">{list.filter((r) => !resolved.has(r.id)).length}</span></h3>
        {list.map((r) => {
          const done = resolved.has(r.id);
          const edited = stale && (r.entry === "iron-wardens:warden-squad" || r.entry === "frost-wardens:ice-guard");
          return (
            <div key={r.id} data-id={r.id} role="option" aria-selected={sel?.id === r.id} tabIndex={sel?.id === r.id ? 0 : -1}
              className={`cg-ib-row edge-${kind}${sel?.id === r.id ? " selected" : ""}${done ? " done" : ""}`} onClick={() => setSelId(r.id)} onDoubleClick={() => r.entry && setOpened(r.entryName)}>
              <p className="cg-ib-msg">{done ? <><Check size={13} className="d-ok" />{kind === "error" ? "Fixed" : "Applied"}: {plain(r.fix ?? "")}</> : code(r.message)}</p>
              <p className="cg-ib-meta">
                {r.entry ? <KindIcon kind={lookupRow(r.entry)?.row.kind ?? "unit"} size={13} /> : <Code2 size={13} />}
                <span className="cg-ib-entry">{r.entryName}</span>
                <span className="mono">{r.source}</span>
                {r.layer !== "Base" ? <span className="d-layer">{r.layer}</span> : null}
                {edited ? <span className="cg-ib-edited">edited since the check</span> : null}
                <span className="d-spacer" />
                <span className="mono cg-ib-codename">{r.code}</span>
              </p>
            </div>
          );
        })}
      </section>
    );
  });

  return (
    <Win mode={mode} interactive={interactive} onClaim={claim}>
      <EditorGrid side={<Sidebar active="updates" updates={open.length} entry={null} source={null} foot={stale ? <><span className="d-dot cg-dot-warn" />Edited since the check</> : undefined} />}>
        <main className="d-main" aria-label="Updates">
          <header className="d-top">
            <BackForward back="Warden Squad" />
            <span className="d-crumbs">Demo Skirmish<span>/</span>Updates</span>
            <span className="d-spacer" />
            <span className={`d-muted${stale ? " cg-stale-text" : ""}`}>{checking === "busy" ? "Checking 3 sources…" : stale ? `Checked ${CHECKED}, 3 edits since` : `Checked ${checkedAt} · lenient`}</span>
            <button type="button" className="d-btn" onClick={runChecks} disabled={checking === "busy"} title="Check the whole dataset again (⌘⇧C)">{checking === "busy" ? <RefreshCw size={14} className="cg-spin" /> : <Play size={14} />}{checking === "busy" ? "Checking…" : "Run checks"}<kbd>⌘⇧C</kbd></button>
          </header>

          {all ? (
            <Clear checkedAt={checkedAt} onRun={runChecks} busy={checking === "busy"} />
          ) : (
            <>
              <div className="cg-ib-filters" role="toolbar" aria-label="Filters">
                <label className="d-filter cg-ib-search"><Search size={13} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter messages and paths" aria-label="Filter messages and paths" /></label>
                {chip("source", "Source")}{chip("layer", "Layer")}{chip("code", "Code")}
                <span className="d-spacer" />
                <span className="d-muted cg-ib-total">{open.length} open · {shown.length} shown</span>
              </div>
              <div className="cg-ib">
                <div className="cg-ib-list" ref={listRef} role="listbox" aria-label="Diagnostics">
                  {stale ? (
                    <div className="cg-ib-stale" role="status">
                      <RefreshCw size={14} />
                      <p><strong>Out of date.</strong> 3 edits in Warden Squad and Ice Guard since the check at {CHECKED}; some of these may be fixed or new ones may exist.</p>
                      <button type="button" className="d-btn sm primary" onClick={runChecks} disabled={checking === "busy"}>{checking === "busy" ? "Checking…" : "Run checks"}<kbd>⌘⇧C</kbd></button>
                    </div>
                  ) : null}
                  <div className={stale ? "cg-ib-dim" : undefined}>{listBody}</div>
                  {shown.length ? null : <p className="d-empty">No diagnostic matches these filters. <button type="button" onClick={() => { setFilters({}); setQuery(""); }}>Clear filters</button></p>}
                </div>
                {sel ? <Detail row={sel} stale={stale} done={resolved.has(sel.id)} onFix={(ids) => resolve(ids)} onUndo={unresolve} resolved={resolved} onOpen={() => sel.entry && setOpened(sel.entryName)} /> : null}
              </div>
              <footer className="cg-ib-keys"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> open the entry <kbd>⌥↵</kbd> apply the fix <kbd>⌘⇧C</kbd> run checks <span className="d-spacer" />{opened ? <span className="cg-ib-opened">Opens {opened} with this issue in its helper · <kbd>⌘[</kbd> back here</span> : <span>The helper panel's Dataset scope shows the same list beside a page</span>}</footer>
            </>
          )}
        </main>
      </EditorGrid>
    </Win>
  );
}

function Detail({ row, done, resolved, onFix, onUndo, onOpen, stale }: { row: Row; done: boolean; resolved: ReadonlySet<string>; stale?: boolean; onFix: (ids: string[]) => void; onUndo: (id: string) => void; onOpen: () => void }) {
  const p = place(row);
  const m = p ? modulesById[p.module] : undefined;
  const sameCode = rows.filter((r) => r.code === row.code && !resolved.has(r.id));
  const diff = diffs[row.id];
  let fix: ReactNode;
  if (done) fix = <p className="cg-ib-done"><Check size={14} className="d-ok" />{row.kind === "error" ? "Fixed" : "Applied"}: {plain(row.fix ?? "")}<button type="button" className="d-btn sm" onClick={() => onUndo(row.id)}><Undo2 size={12} />Undo<kbd>⌘Z</kbd></button></p>;
  else if (row.kind === "preservation") fix = (
    <div className="cg-ib-actions">
      <button type="button" className="d-btn" onClick={onOpen} disabled={!row.entry} title={row.entry ? undefined : "A module-level difference: no entry page"}><CornerDownLeft size={13} />{row.entry ? `Open ${row.entryName}` : "No entry to open"}<kbd>↵</kbd></button>
      <button type="button" className="d-btn"><Copy size={13} />Copy the difference</button>
    </div>
  );
  else fix = (
    <div className="cg-ib-actions">
      <button type="button" className="d-btn primary" onClick={() => onFix([row.id])}><CornerDownLeft size={13} />{code(row.fix ?? "Fix")}<kbd>⌥↵</kbd></button>
      {row.kind === "suggestion" && sameCode.length > 1 ? <button type="button" className="d-btn" onClick={() => onFix(sameCode.map((r) => r.id))} title={`${row.fix} in every place with dklpo/${row.code}`}><CheckCheck size={13} />Apply to all {sameCode.length} of this kind</button> : null}
      <button type="button" className="d-btn" onClick={onOpen} disabled={!row.entry}>{row.entry ? `Open ${row.entryName}` : "Open the patch"}<kbd>↵</kbd></button>
    </div>
  );
  return (
    <section className="cg-ib-detail" aria-label="Diagnostic detail">
      <p className="cg-ib-kicker"><DiagIcon kind={row.kind} size={14} />{diagOne[row.kind]}<span className="mono">dklpo/{row.code}</span></p>
      <h2>{code(row.message)}</h2>
      {stale && (row.entry === "iron-wardens:warden-squad" || row.entry === "frost-wardens:ice-guard") ? <p className="cg-ib-stalenote"><RefreshCw size={13} />{row.entryName} was edited after the check: this may already be fixed. Run checks (⌘⇧C) to be sure.</p> : null}
      <dl className="cg-ib-facts">
        <div><dt>Entry</dt><dd>{row.entry ? <span className="d-mwrap"><span className="d-mention">{row.entryName}</span></span> : <span className="d-muted">{row.entryName}</span>}</dd></div>
        <div><dt>Path</dt><dd className="mono">{row.where}</dd></div>
        <div><dt>File</dt><dd className="mono">{row.file}{p ? `:${p.line}` : ""}</dd></div>
        <div><dt>Layer</dt><dd>{row.layer}{row.layer === "Base" ? <span className="d-muted">Demo Skirmish 3.2.0</span> : row.layer === "House rules" ? <span className="d-muted">variant · rules 1.0.0</span> : <span className="d-muted">add-on · content 0.3.0</span>}</dd></div>
      </dl>
      {diff ? (
        <>
          <h3 className="cg-ib-h">Export difference<span className="d-muted">XML data files · {diff.file}</span></h3>
          <div className="cg-diff" aria-label="Export difference">
            <p className="cg-diff-head"><FileDiff size={13} />original<span>→</span>export<span className="d-spacer" />1 line moves</p>
            {diff.lines.map((l, i) => <p key={i} className={`cg-diff-line ${l.t === "-" ? "del" : l.t === "+" ? "add" : ""}`}><span className="cg-diff-sign" aria-label={l.t === "-" ? "removed" : l.t === "+" ? "added" : undefined}>{l.t}</span><span>{l.text}</span></p>)}
          </div>
          <p className="cg-ib-note">{diff.note}</p>
        </>
      ) : m && p ? (
        <>
          <h3 className="cg-ib-h">Affected text<span className="d-muted">{m.path}</span></h3>
          <div className="cg-ib-code"><CodeView lines={done && row.id === "d1" ? m.lines.map((l) => l.replace("halbred", "halberd")) : m.lines} start={Math.max(1, p.line - 3)} end={Math.min(m.lines.length, p.line + 2)} marks={done ? [] : [{ id: row.id, line: p.line, from: p.from, to: p.to, kind: row.kind }]} selected={[p.line, p.line]} label={`${m.path}, lines around ${p.line}`} compact /></div>
        </>
      ) : null}
      <h3 className="cg-ib-h">{row.kind === "preservation" ? "What you can do" : "Fix"}</h3>
      {row.kind === "preservation" && !done ? <p className="cg-ib-note">No fix is needed to keep the data. For a byte-identical export, move the comment in the original data files; until then the export report lists this difference.</p> : null}
      {fix}
    </section>
  );
}

function Clear({ checkedAt, onRun, busy }: { checkedAt: string; onRun: () => void; busy: boolean }) {
  return (
    <div className="cg-ib-clear" role="status">
      <span className="cg-ib-clear-mark"><Check size={22} /></span>
      <h2>No issues in Demo Skirmish</h2>
      <p>Checked today at {checkedAt}, lenient profile: no errors, no preservation failures and no authoring suggestions.</p>
      <dl className="cg-ib-facts cg-ib-checked">
        <div><dt>Sources</dt><dd>Demo Skirmish, Iron Wardens, Frost Wardens<span className="d-muted">24 entries</span></dd></div>
        <div><dt>Layers</dt><dd>House rules, Frost Wardens<span className="d-muted">Draft points is off: not checked</span></dd></div>
        <div><dt>Text</dt><dd>Text pack en<span className="d-muted">every name has text</span></dd></div>
        <div><dt>Export</dt><dd>XML data files<span className="d-muted">byte-identical to the originals</span></dd></div>
      </dl>
      <p className="cg-ib-actions">
        <button type="button" className="d-btn" onClick={onRun} disabled={busy}>{busy ? <RefreshCw size={14} className="cg-spin" /> : <Play size={14} />}{busy ? "Checking…" : "Run checks again"}<kbd>⌘⇧C</kbd></button>
        <button type="button" className="d-btn" title="Check under the strict profile once (the dataset stays lenient)">Check with the strict profile</button>
      </p>
    </div>
  );
}
