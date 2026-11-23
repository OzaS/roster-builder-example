import { ArrowDownLeft, Bell, Check, ChevronDown, ChevronRight, Code2, CornerDownLeft, EyeOff, FileText, Focus, Layers, Maximize2, Minimize2, Minus, PanelRightOpen, PictureInPicture2, Play, Plus, Search, SlidersHorizontal, Table2, Undo2, X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { MacWindow, TrafficLights } from "../frames";
import { DiagIcon, KindIcon } from "../glyphs";
import { diagLabel, diagnostics, diagOne, entry, type DiagKind, type Diagnostic } from "../sample";
import { DContext, M, entryOfDiag, issuesFor, pageFor, rowCount, sourceById, sourceOfEntry, sources, tables, type DSource } from "./direction-d-content";
import "./direction-d.css";

/**
 * Direction D, the user's mix (2026-11-22): B's sidebar and document page, A's dense source list beside the sidebar,
 * a floating helper box (B's margin notes as one floating object) that expands into C's inspector panel.
 * Everything is held in React state so the gallery can be clicked through.
 */
export type DState = "default" | "collapsed" | "panel" | "focus" | "focus-panel";
type Helper = "collapsed" | "floating" | "panel";
type Tab = "issues" | "suggestions" | "properties";
type Scope = "entry" | "dataset";

const NAV_W = 232;
const SRC_W = 318;
/** In focus mode the list also carries the window controls, so it is a little wider. */
const SRC_FOCUS_W = 348;
const PANEL_MIN = 260;
const PANEL_MAX = 520;

/** Several windows can be on one gallery page; the keyboard goes to the one used last. */
let activeWindow: string | null = null;

const code = (text: string) => text.split("`").map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part));

export function DirectionD({ mode, initial = "default", interactive = true }: { mode: "light" | "dark"; initial?: DState; interactive?: boolean }) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const rows = useRef<HTMLDivElement>(null);
  const [sourceId, setSourceId] = useState<string | null>("iron-wardens");
  const [entryId, setEntryId] = useState(entry.full);
  const [focus, setFocus] = useState(initial === "focus" || initial === "focus-panel");
  const [helper, setHelper] = useState<Helper>(initial === "collapsed" ? "collapsed" : initial.endsWith("panel") ? "panel" : "floating");
  const [tab, setTab] = useState<Tab>("issues");
  const [scope, setScope] = useState<Scope>("entry");
  const [panelW, setPanelW] = useState(328);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(["iron-wardens"]));
  const [folded, setFolded] = useState<ReadonlySet<string>>(new Set());
  const [filter, setFilter] = useState("");
  const [resolved, setResolved] = useState<ReadonlySet<string>>(new Set());
  const [slash, setSlash] = useState(false);
  const [selIssue, setSelIssue] = useState<string | null>(null);
  const [diffOpen, setDiffOpen] = useState<string | null>(null);
  const [navSel, setNavSel] = useState<string | null>(null);
  const [checking, setChecking] = useState<"idle" | "busy" | "done">("idle");

  const source = sourceId ? sourceById(sourceId) : undefined;
  const page = pageFor(entryId);
  const pageIssues = issuesFor(entryId);
  const open = diagnostics.filter((d) => !resolved.has(d.id));
  const elsewhere = open.filter((d) => !pageIssues.includes(d)).length;

  /* ---------- Actions ---------- */
  const openSource = (id: string) => { setSourceId(id); setFilter(""); setNavSel(null); };
  const openEntry = (id: string) => {
    setEntryId(id); setSlash(false); setSelIssue(null); setDiffOpen(null); setNavSel(null);
    setSourceId((current) => {
      if (!current) return current;
      const shown = sourceById(current);
      if (shown?.groups.some((group) => group.rows.some((row) => row.id === id))) return current;
      return sourceOfEntry(id)?.id ?? current;
    });
  };
  const enterFocus = () => { setSourceId((current) => current ?? sourceOfEntry(entryId)?.id ?? "iron-wardens"); setFocus(true); };
  const exitFocus = () => setFocus(false);
  const toggleFocus = () => (focus ? exitFocus() : enterFocus());
  const closeSource = () => { setSourceId(null); setFocus(false); };
  const expandPanel = (nextTab: Tab = "issues", nextScope?: Scope) => { setHelper("panel"); setTab(nextTab); if (nextScope) setScope(nextScope); };
  const resolve = (id: string) => setResolved((current) => new Set(current).add(id));
  const unresolve = (id: string) => setResolved((current) => { const next = new Set(current); next.delete(id); return next; });
  const runChecks = () => { if (checking === "busy") return; setChecking("busy"); window.setTimeout(() => setChecking("done"), 900); };
  const goTo = (d: Diagnostic) => {
    const target = entryOfDiag(d.where);
    if (target) openEntry(target);
    else { setSourceId(d.where.split(":")[0]); }
  };

  /* ---------- Keyboard: Esc and ⌘. for the window used last ---------- */
  const keys = useRef<{ esc: () => boolean; toggleFocus: () => void }>({ esc: () => false, toggleFocus: () => undefined });
  useLayoutEffect(() => {
    keys.current = {
      esc: () => {
        if (slash) { setSlash(false); return true; }
        if (focus) { exitFocus(); return true; }
        if (helper === "panel") { setHelper("floating"); return true; }
        return false;
      },
      toggleFocus,
    };
  });
  useEffect(() => {
    if (!interactive) return;
    if (activeWindow === null) activeWindow = uid;
    const onKey = (event: KeyboardEvent) => {
      if (activeWindow !== uid) return;
      if ((event.metaKey || event.ctrlKey) && event.key === ".") { event.preventDefault(); keys.current.toggleFocus(); return; }
      if (event.key === "Escape" && keys.current.esc()) event.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); if (activeWindow === uid) activeWindow = null; };
  }, [uid, interactive]);
  const claim = () => { if (interactive) activeWindow = uid; };

  /* ---------- Panel resize (pointer drag on the left edge, or arrow keys); corrects for a scaled-down frame ---------- */
  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const el = root.current;
    const scale = el ? el.getBoundingClientRect().width / el.offsetWidth || 1 : 1;
    const startX = event.clientX;
    const startW = panelW;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    setDragging(true);
    const move = (e: PointerEvent) => setPanelW(Math.round(Math.min(PANEL_MAX, Math.max(PANEL_MIN, startW - (e.clientX - startX) / scale))));
    const up = () => { setDragging(false); target.removeEventListener("pointermove", move); target.removeEventListener("pointerup", up); target.removeEventListener("pointercancel", up); };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  };
  const resizeKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); setPanelW((w) => Math.min(PANEL_MAX, w + 16)); }
    if (event.key === "ArrowRight") { event.preventDefault(); setPanelW((w) => Math.max(PANEL_MIN, w - 16)); }
  };

  /* ---------- Source column rows (filtered), with ↑ ↓ / j k ---------- */
  const query = filter.trim().toLowerCase();
  const groups = (source?.groups ?? []).map((group) => ({ ...group, rows: query ? group.rows.filter((row) => row.name.toLowerCase().includes(query) || row.id.includes(query)) : group.rows })).filter((group) => group.rows.length);
  const visible = groups.filter((group) => !folded.has(group.label)).flatMap((group) => group.rows);
  const rowsKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).tagName === "INPUT") return;
    const step = event.key === "ArrowDown" || event.key === "j" ? 1 : event.key === "ArrowUp" || event.key === "k" ? -1 : 0;
    if (!step || !visible.length) return;
    event.preventDefault();
    const index = visible.findIndex((row) => row.id === entryId);
    const next = visible[Math.min(visible.length - 1, Math.max(0, index + step))];
    openEntry(next.id);
    requestAnimationFrame(() => rows.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus());
  };

  const srcW = focus ? SRC_FOCUS_W : SRC_W;
  const columns = `${focus ? 0 : NAV_W}px ${source ? srcW : 0}px minmax(0, 1fr) ${helper === "panel" ? panelW : 0}px`;
  const crumbsSource = sourceOfEntry(entryId)?.name ?? "Dataset";

  return (
    <MacWindow mode={mode} className={`fc-d${interactive ? "" : " static"}`}>
      <DContext.Provider value={{ open: openEntry, resolved }}>
        <div ref={root} className={`d-grid${dragging ? " dragging" : ""}`} style={{ gridTemplateColumns: columns }} onPointerDownCapture={claim} onFocusCapture={claim}>
          {/* ---------- Sidebar (B) ---------- */}
          <aside className="d-side" inert={focus} aria-hidden={focus} aria-label="Dataset sidebar">
            <div className="d-side-in" style={{ width: NAV_W }}>
              <div className="d-side-top"><TrafficLights /></div>
              <button type="button" className="d-ws" title="Switch dataset"><span className="d-ws-mark">D</span><strong>Demo Skirmish</strong><ChevronDown size={14} /></button>
              <button type="button" className={`d-item${navSel === "search" ? " active" : ""}`} onClick={() => setNavSel("search")}><Search size={15} />Search<kbd>⌘K</kbd></button>
              <button type="button" className="d-item" onClick={() => expandPanel("issues", "dataset")} title="Open every issue in the helper panel"><Bell size={15} />Updates<span className="d-count">{open.length}</span></button>
              <button type="button" className={`d-item${navSel === "layers" ? " active" : ""}`} onClick={() => setNavSel("layers")}><Layers size={15} />Layers<span className="d-muted">3 of 4</span></button>

              <h3>Sources</h3>
              {sources.map((s) => {
                const isOpen = expanded.has(s.id);
                const children = s.groups.find((group) => group.label === "Units")?.rows ?? s.groups.filter((group) => group.label === "Forces" || group.label === "Rules").flatMap((group) => group.rows.slice(0, 1));
                return (
                  <div key={s.id} className="d-tree-group">
                    <div className={`d-item d-src-item${sourceId === s.id ? " active" : ""}`}>
                      <button type="button" className="d-tog" aria-label={`${isOpen ? "Collapse" : "Expand"} ${s.name} in the tree`} title={isOpen ? "Collapse" : "Expand"} aria-expanded={isOpen}
                        onClick={() => setExpanded((current) => { const next = new Set(current); if (next.has(s.id)) next.delete(s.id); else next.add(s.id); return next; })}>
                        {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                      <button type="button" className="d-src-btn" title={`Open ${s.name} beside the page · double-click for focus mode`} aria-pressed={sourceId === s.id}
                        onClick={() => openSource(s.id)} onDoubleClick={() => { openSource(s.id); setFocus(true); }}>
                        <KindIcon kind="system" size={15} />{s.name}{s.tag ? <span className="d-muted">{s.tag}</span> : null}
                      </button>
                    </div>
                    {isOpen ? children.map((row) => (
                      <button type="button" key={row.id} className={`d-item i1${entryId === row.id ? " current" : ""}`} onClick={() => openEntry(row.id)}>
                        <span className="d-tog-space" /><KindIcon kind={row.kind} size={15} /><span className={row.noText ? "d-notext" : ""}>{row.name}</span>
                      </button>
                    )) : null}
                  </div>
                );
              })}
              <button type="button" className="d-item d-add" title="New entry (not part of this mock)"><Plus size={14} />New entry</button>

              <h3>Tables</h3>
              {tables.map((t) => (
                <button type="button" key={t.id} className={`d-item${sourceId === t.id ? " active" : ""}`} aria-pressed={sourceId === t.id} title={`Open ${t.name} beside the page · double-click for focus mode`}
                  onClick={() => openSource(t.id)} onDoubleClick={() => { openSource(t.id); setFocus(true); }}>
                  <Table2 size={15} />{t.name}<span className="d-muted">{rowCount(t)}</span>
                </button>
              ))}
              <button type="button" className={`d-item${navSel === "text" ? " active" : ""}`} onClick={() => setNavSel("text")}><FileText size={15} />Text pack · en</button>
              <footer className="d-side-foot"><span className="d-dot" />Saved · fmt clean</footer>
            </div>
          </aside>

          {/* ---------- Source column (A) ---------- */}
          <section className="d-src" inert={!source} aria-hidden={!source} aria-label={source ? `${source.name} entries` : undefined}>
            {source ? (
              <div className="d-src-in" style={{ width: srcW }}>
                <header className="d-src-head" title="Double-click to turn focus mode on or off" onDoubleClick={(event) => { if (!(event.target as HTMLElement).closest("button, input")) toggleFocus(); }}>
                  {focus ? <TrafficLights /> : null}
                  {source.table ? <Table2 size={15} /> : <KindIcon kind="system" size={15} />}
                  <strong>{source.name}</strong>
                  {focus ? null : <span className="d-muted">{rowCount(source)}</span>}
                  {source.tag && !focus ? <span className="d-layer">{source.tag}</span> : null}
                  <span className="d-spacer" />
                  {focus ? (
                    <button type="button" className="d-exit" onClick={exitFocus} aria-label="Exit focus mode" title="Exit focus mode: show the sidebar (Esc or ⌘.)"><Minimize2 size={13} />Exit focus<kbd>Esc</kbd></button>
                  ) : (
                    <button type="button" className="d-icon" onClick={enterFocus} aria-label="Focus mode: hide the sidebar" title="Focus mode: hide the sidebar (⌘.)"><Maximize2 size={14} /></button>
                  )}
                  {focus ? null : <button type="button" className="d-icon" onClick={closeSource} aria-label={`Close ${source.name}`} title="Close the source list"><X size={15} /></button>}
                </header>
                <div className="d-src-tools">
                  <label className="d-filter">
                    <Search size={13} />
                    <input value={filter} placeholder={`Filter ${source.name}`} aria-label={`Filter ${source.name}`} onChange={(event) => setFilter(event.target.value)}
                      onKeyDown={(event) => { if (event.key === "Escape" && filter) { event.stopPropagation(); setFilter(""); } }} />
                  </label>
                  <button type="button" className="d-icon sm" aria-label="Display options" title="Display options"><SlidersHorizontal size={14} /></button>
                </div>
                <div className="d-colheads" aria-hidden><span>Name</span><span title="Changed by a layer">Layer</span><span>pts</span><span /></div>
                <div className="d-rows" ref={rows} onKeyDown={rowsKey}>
                  {groups.length ? groups.map((group) => {
                    const isFolded = folded.has(group.label);
                    return (
                      <div key={group.label} role="group" aria-label={group.label}>
                        <button type="button" className="d-group" aria-expanded={!isFolded} onClick={() => setFolded((current) => { const next = new Set(current); if (next.has(group.label)) next.delete(group.label); else next.add(group.label); return next; })}>
                          {isFolded ? <ChevronRight size={13} /> : <ChevronDown size={13} />}{group.label}<span>{group.rows.length}</span>
                        </button>
                        {isFolded ? null : group.rows.map((row) => (
                          <button type="button" key={row.id} data-id={row.id} className={`d-row${row.id === entryId ? " selected" : ""}${row.diag ? ` edge-${row.diag}` : ""}`} aria-current={row.id === entryId ? "true" : undefined} onClick={() => openEntry(row.id)}>
                            <KindIcon kind={row.kind} size={14} />
                            <span className={`d-name${row.noText ? " d-notext" : ""}`}>{row.name}</span>
                            <span className={`d-changed${row.changed ? "" : " off"}`} title={row.changed ? `Changed by ${row.changed}` : undefined} aria-label={row.changed ? `Changed by ${row.changed}` : undefined} />
                            <span className="d-cost num">{row.was !== undefined ? <s>{row.was}</s> : null}{row.cost ?? "–"}</span>
                            <span className="d-diag" title={row.diag ? diagOne[row.diag] : undefined}>{row.diag ? <DiagIcon kind={row.diag} size={13} /> : null}</span>
                          </button>
                        ))}
                      </div>
                    );
                  }) : <p className="d-empty">No entry matches “{filter}”. <button type="button" onClick={() => setFilter("")}>Clear filter</button></p>}
                </div>
                <footer className="d-src-foot"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>⌘.</kbd> focus <span className="d-spacer" />{source.table ? "Table view" : source.tag ? `${source.tag} layer · by kind` : "Grouped by kind"}</footer>
              </div>
            ) : null}
          </section>

          {/* ---------- Editor (B's page) with the floating helper ---------- */}
          <main className="d-main" aria-label="Entry">
            <header className="d-top">
              <span className="d-crumbs">{crumbsSource}<span>/</span>{page.name}</span>
              <span className="d-spacer" />
              <span className="d-muted">Edited just now</span>
              <button type="button" className={`d-ghost${focus ? " on" : ""}`} aria-pressed={focus} onClick={toggleFocus} title={focus ? "Exit focus mode (⌘. or Esc)" : "Focus mode: hide the sidebar, keep the list and the page (⌘.)"}><Focus size={14} />Focus<kbd>⌘.</kbd></button>
              <button type="button" className="d-ghost" title="Show the DKLPO source (not part of this mock)"><Code2 size={14} />Source</button>
            </header>

            <div className={`d-scroll helper-${helper}`}>
              <div className="d-doc">
                <article className="d-page" key={entryId}>
                  <div className="d-pageicon"><KindIcon kind={page.kind} size={28} /></div>
                  <h1 className={page.noText ? "d-notext" : ""}>{page.name}{page.noText ? <span className="d-tag warn">No en text</span> : null}</h1>
                  <p className="d-backlinks"><ArrowDownLeft size={14} /><span className="d-muted">{page.backlinks.length} backlink{page.backlinks.length === 1 ? "" : "s"}</span>{page.backlinks.map((link) => <M key={link.label} to={link.to} hint="Root entry of this source">{link.label}</M>)}</p>

                  <dl className="d-props">
                    {page.props.map((prop) => <div key={prop.label}><dt>{prop.icon}{prop.label}</dt><dd>{prop.value}</dd></div>)}
                    <div className="d-more"><dt><button type="button" onClick={() => expandPanel("properties")}><Plus size={14} />{page.more.length} more {page.more.length === 1 ? "property" : "properties"}</button></dt><dd /></div>
                  </dl>

                  <div className="d-blocks">
                    {page.blocks}
                    <div className="d-block i0 typing">
                      <span className="d-tog-space" />
                      <button type="button" className="d-slashbtn" aria-expanded={slash} onClick={() => setSlash(!slash)}><span className="d-slash">/</span>{slash ? <span className="d-caret" /> : null}<span className="d-placeholder">{slash ? "Type to filter statements" : "Type / to insert a statement"}</span></button>
                    </div>
                    {slash ? (
                      <div className="d-slashmenu" role="menu" aria-label="Insert a statement">
                        <p>Valid in <span className="mono">{page.kind} {page.id.split(":")[1]}</span></p>
                        {[
                          { icon: <KindIcon kind="upgrade" size={15} />, name: "Upgrade", syntax: "upgrade key range" },
                          { icon: <KindIcon kind="group" size={15} />, name: "Group", syntax: "group key n default ref" },
                          { icon: <KindIcon kind="profile-type" size={15} />, name: "Profile", syntax: "profile key: type | values" },
                          { icon: <span className="d-hash">#</span>, name: "Cost", syntax: "cost type value" },
                          { icon: <EyeOff size={15} />, name: "Hide when", syntax: "hide when condition" },
                        ].map((item, index) => (
                          <button type="button" role="menuitem" key={item.name} className={index === 0 ? "sel" : ""} onClick={() => setSlash(false)}>
                            {item.icon}<span><strong>{item.name}</strong><small className="mono">{item.syntax}</small></span>{index === 0 ? <kbd>↵</kbd> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              </div>
            </div>

            {helper === "floating" ? (
              <HelperBox
                issues={pageIssues} resolved={resolved} elsewhere={elsewhere} checking={checking}
                onCollapse={() => setHelper("collapsed")} onExpand={() => expandPanel("issues")}
                onFix={resolve} onUndo={unresolve}
                onDiff={(d) => { setSelIssue(d.id); setDiffOpen(d.id); expandPanel("issues", "entry"); }}
                onAll={() => expandPanel("issues", "dataset")}
                onChecks={runChecks} onInsert={() => setSlash(true)} onProperties={() => expandPanel("properties")}
              />
            ) : null}
            {helper === "collapsed" ? <HelperPill issues={pageIssues.filter((d) => !resolved.has(d.id))} onOpen={() => setHelper("floating")} /> : null}
          </main>

          {/* ---------- Helper panel (C's inspector) ---------- */}
          <aside className="d-panel" inert={helper !== "panel"} aria-hidden={helper !== "panel"} aria-label="Helper panel">
            <div className="d-resize" role="separator" aria-orientation="vertical" aria-label="Resize the helper panel" title="Drag to resize" tabIndex={0}
              aria-valuenow={panelW} aria-valuemin={PANEL_MIN} aria-valuemax={PANEL_MAX} onPointerDown={startResize} onKeyDown={resizeKey} />
            <div className="d-panel-in" style={{ width: panelW }}>
              <header className="d-ptabs">
                <div role="tablist" aria-label="Helper">
                  {(["issues", "suggestions", "properties"] as Tab[]).map((t) => {
                    const count = t === "properties" ? undefined : scoped(scope, pageIssues, t).filter((d) => !resolved.has(d.id)).length;
                    return (
                      <button type="button" role="tab" key={t} aria-selected={tab === t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                        {t === "issues" ? "Issues" : t === "suggestions" ? "Suggestions" : "Properties"}
                        {count ? <span className={`d-pcount ${t}`}>{count}</span> : null}
                      </button>
                    );
                  })}
                </div>
                <span className="d-spacer" />
                <button type="button" className="d-icon" onClick={() => setHelper("floating")} aria-label="Back to the floating box" title="Back to the floating box (Esc)"><PictureInPicture2 size={15} /></button>
              </header>

              {tab !== "properties" ? (
                <div className="d-seg" role="radiogroup" aria-label="Scope">
                  {(["entry", "dataset"] as Scope[]).map((s) => (
                    <button type="button" role="radio" key={s} aria-checked={scope === s} className={scope === s ? "active" : ""} onClick={() => setScope(s)}>
                      {s === "entry" ? "This entry" : "Dataset"} <span className="d-muted">{scoped(s, pageIssues, tab).filter((d) => !resolved.has(d.id)).length}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="d-pbody">
                {tab === "properties" ? (
                  <>
                    <p className="d-plabel">{page.name}</p>
                    <dl className="d-pprops">
                      {page.props.map((prop) => <div key={prop.label}><dt>{prop.label}</dt><dd>{prop.value}</dd></div>)}
                      {page.more.map((prop) => <div key={prop.label}><dt>{prop.label}</dt><dd>{prop.value}</dd></div>)}
                    </dl>
                    <p className="d-plabel">Keys</p>
                    <p className="d-keys"><kbd>C</kbd> cost <kbd>T</kbd> categories <kbd>L</kbd> layer <kbd>F12</kbd> definition <kbd>⇧F12</kbd> backlinks</p>
                  </>
                ) : (
                  (tab === "issues" ? (["error", "preservation"] as DiagKind[]) : (["suggestion"] as DiagKind[])).map((kind) => {
                    const list = scoped(scope, pageIssues, tab).filter((d) => d.kind === kind);
                    return (
                      <section key={kind} className="d-igroup">
                        <h3><DiagIcon kind={kind} size={13} />{diagLabel[kind]}<span className="d-muted">{list.filter((d) => !resolved.has(d.id)).length}</span></h3>
                        {list.length ? list.map((d) => {
                          const done = resolved.has(d.id);
                          const selected = selIssue === d.id || (tab === "suggestions" && !done);
                          const here = pageIssues.includes(d);
                          return (
                            <div key={d.id} className={`d-issue edge-${kind}${selIssue === d.id ? " selected" : ""}${done ? " done" : ""}`} onClick={() => setSelIssue(d.id)}>
                              <p>{done ? <><Check size={13} />{kind === "error" ? "Fixed" : "Applied"}: {d.fix?.replace(/`/g, "")}</> : code(d.message)}</p>
                              <p className="mono d-muted">{d.where}{here ? <span className="d-here"> · this entry</span> : null}</p>
                              {done ? (
                                <span className="d-fix"><button type="button" className="d-btn sm" onClick={(event) => { event.stopPropagation(); unresolve(d.id); }}><Undo2 size={12} />Undo</button></span>
                              ) : selected ? (
                                <span className="d-fix">
                                  {d.kind === "preservation" ? (
                                    <button type="button" className="d-btn primary sm" aria-expanded={diffOpen === d.id} onClick={(event) => { event.stopPropagation(); setDiffOpen(diffOpen === d.id ? null : d.id); }}>{diffOpen === d.id ? "Hide diff" : "Show diff"}</button>
                                  ) : (
                                    <button type="button" className="d-btn primary sm" onClick={(event) => { event.stopPropagation(); resolve(d.id); }}><CornerDownLeft size={12} />{d.fix?.replace(/`/g, "")}</button>
                                  )}
                                  {!here ? <button type="button" className="d-btn sm" onClick={(event) => { event.stopPropagation(); goTo(d); }}>Go to</button> : null}
                                </span>
                              ) : null}
                              {diffOpen === d.id ? (
                                <pre className="d-diff" aria-label="Export difference"><span className="del">- # review: second pass</span>{"\n"}<span>  {entry.extra.key}: draft</span>{"\n"}<span className="add">+ # review: second pass</span></pre>
                              ) : null}
                            </div>
                          );
                        }) : <p className="d-none"><Check size={13} />None {scope === "entry" ? "on this entry" : "in the dataset"}</p>}
                      </section>
                    );
                  })
                )}
              </div>
              <footer className="d-pfoot"><kbd>Esc</kbd> {focus ? "exits focus first, then back to the box" : "back to the box"} · drag the left edge to resize</footer>
            </div>
          </aside>
        </div>
      </DContext.Provider>
    </MacWindow>
  );
}

function scoped(scope: Scope, pageIssues: Diagnostic[], tab: Tab) {
  const list = scope === "entry" ? pageIssues : diagnostics;
  return tab === "suggestions" ? list.filter((d) => d.kind === "suggestion") : list.filter((d) => d.kind !== "suggestion");
}

/** The floating helper box: this page's issues, suggestions and actions in one raised object at the top right of the editor. */
function HelperBox(props: {
  issues: Diagnostic[]; resolved: ReadonlySet<string>; elsewhere: number; checking: "idle" | "busy" | "done";
  onCollapse: () => void; onExpand: () => void; onFix: (id: string) => void; onUndo: (id: string) => void; onDiff: (d: Diagnostic) => void; onAll: () => void;
  onChecks: () => void; onInsert: () => void; onProperties: () => void;
}) {
  const { issues, resolved } = props;
  const problems = issues.filter((d) => d.kind !== "suggestion");
  const suggestions = issues.filter((d) => d.kind === "suggestion");
  const row = (d: Diagnostic) => {
    const done = resolved.has(d.id);
    return (
      <li key={d.id} className={done ? "done" : ""}>
        {done ? <Check size={14} className="d-ok" /> : <DiagIcon kind={d.kind} size={14} />}
        <span className="d-hmsg">{done ? `${d.kind === "error" ? "Fixed" : "Applied"}: ${d.fix?.replace(/`/g, "")}` : code(d.message)}</span>
        {done ? (
          <button type="button" className="d-btn sm" onClick={() => props.onUndo(d.id)}>Undo</button>
        ) : d.kind === "preservation" ? (
          <button type="button" className="d-btn sm" onClick={() => props.onDiff(d)}>Show diff</button>
        ) : (
          <button type="button" className="d-btn sm" onClick={() => props.onFix(d.id)}>{d.fix?.replace(/`/g, "")}</button>
        )}
      </li>
    );
  };
  const counts = (["error", "preservation", "suggestion"] as DiagKind[]).map((kind) => ({ kind, n: issues.filter((d) => d.kind === kind && !resolved.has(d.id)).length })).filter((c) => c.n);
  return (
    <aside className="d-helper" aria-label="Helper for this page">
      <header>
        <strong>This page</strong>
        <span className="d-hcounts">{counts.length ? counts.map((c) => <span key={c.kind} title={`${c.n} ${diagOne[c.kind].toLowerCase()}${c.n === 1 ? "" : "s"}`}><DiagIcon kind={c.kind} size={12} />{c.n}</span>) : <span><Check size={12} className="d-ok" />Clear</span>}</span>
        <span className="d-spacer" />
        <button type="button" className="d-icon sm" onClick={props.onCollapse} aria-label="Collapse the helper to a pill" title="Collapse to a pill"><Minus size={14} /></button>
        <button type="button" className="d-icon sm" onClick={props.onExpand} aria-label="Expand the helper to a panel" title="Expand to a panel"><PanelRightOpen size={14} /></button>
      </header>
      <h4>Issues<span>{problems.filter((d) => !resolved.has(d.id)).length}</span></h4>
      {problems.length ? <ul>{problems.map(row)}</ul> : <p className="d-none"><Check size={13} />None on this page</p>}
      <h4>Suggestions<span>{suggestions.filter((d) => !resolved.has(d.id)).length}</span></h4>
      {suggestions.length ? <ul>{suggestions.map(row)}</ul> : <p className="d-none"><Check size={13} />None on this page</p>}
      <h4>Actions</h4>
      <ul className="d-actions">
        <li><button type="button" onClick={props.onChecks} disabled={props.checking === "busy"}><Play size={14} />{props.checking === "busy" ? "Checking…" : props.checking === "done" ? "Checked just now" : "Run checks"}<kbd>⌘⇧C</kbd></button></li>
        <li><button type="button" onClick={props.onInsert}><Plus size={14} />Insert a statement<kbd>/</kbd></button></li>
        <li><button type="button" onClick={props.onProperties}><SlidersHorizontal size={14} />All properties</button></li>
      </ul>
      <footer>{props.elsewhere} more in other pages · <button type="button" onClick={props.onAll}>Open all</button></footer>
    </aside>
  );
}

/** The helper collapsed to a pill: counts by kind; click to bring the box back. */
function HelperPill({ issues, onOpen }: { issues: Diagnostic[]; onOpen: () => void }) {
  const counts = (["error", "preservation", "suggestion"] as DiagKind[]).map((kind) => ({ kind, n: issues.filter((d) => d.kind === kind).length })).filter((c) => c.n);
  const label = counts.length ? counts.map((c) => `${c.n} ${diagOne[c.kind].toLowerCase()}`).join(", ") : "no issues";
  return (
    <button type="button" className="d-pill" onClick={onOpen} aria-label={`Show the helper: ${label} on this page`} title="Show the helper box">
      {counts.length ? counts.map((c) => <span key={c.kind}><DiagIcon kind={c.kind} size={13} />{c.n}</span>) : <span><Check size={13} className="d-ok" />No issues</span>}
      <Maximize2 size={12} className="d-pill-open" />
    </button>
  );
}
