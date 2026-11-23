import { ArrowDownLeft, CircleAlert, Code2, CornerDownLeft, FileText, Focus, PictureInPicture2, Plus, Wrench, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type RefObject } from "react";
import { DiagIcon, KindIcon } from "../../glyphs";
import { backlinks, type Diagnostic } from "../../sample";
import { DContext, M, lookupRow, pageFor, sourceById, sourceOfEntry } from "../../directions/direction-d-content";
import { HelperBox } from "../../directions/DirectionD";
import { allDiagnostics, blockEnd, frostWardens, houseRules, ironWardens, lineOf, modulesById, place, type ModuleText } from "./data";
import { CodeHead, CodeView, SynText } from "./code";
import { Blocks, flagsFrom, LinkedPage, propLines, type Follow } from "./page";
import { Pill } from "./parts";
import { BackForward, EditorGrid, Sidebar, SourceList, Win, type Mode } from "./shell";

/**
 * Screen 2: go to definition, peek and backlinks. Following a reference keeps a history (Back / Forward, ⌘[ / ⌘]) and
 * updates the breadcrumbs; ⌥F12 peeks the target inline under its line; ⇧F12 lists every place that refers to the entry
 * in the helper panel's Backlinks tab (the panel is where D already lists things to work through, and it stays while
 * you open one place after another); a reference that resolves to nothing offers its fix instead of navigating.
 */
export type RefState = "definition" | "peek" | "backlinks" | "unresolved";
type Place = { kind: "entry"; id: string } | { kind: "text"; module: string; line: number };

const label = (p: Place) => (p.kind === "entry" ? pageFor(p.id).name : `${modulesById[p.module]?.path ?? p.module}:${p.line}`);
const moduleOf = (id: string): ModuleText | undefined => (id.startsWith("iron-wardens:") ? ironWardens : id.startsWith("frost-wardens:") ? frostWardens : undefined);

/** Warden Squad's backlinks from the sample, with the line each sits on. */
const links = [
  { ...backlinks[0], module: "iron-wardens", line: lineOf(ironWardens, "root use warden-squad"), kind: "catalogue" as const, group: "Iron Wardens · Base", open: { kind: "text", module: "iron-wardens", line: lineOf(ironWardens, "root use warden-squad") } as Place },
  { ...backlinks[1], module: "iron-wardens", line: lineOf(ironWardens, "association leads 0..1 to warden-squad in force"), kind: "unit" as const, group: "Iron Wardens · Base", open: { kind: "entry", id: "iron-wardens:warden-captain" } as Place },
  { ...backlinks[2], module: "demo-skirmish-house", line: lineOf(houseRules, "set warden-squad.cost.pts 20 -> 18"), kind: "rule" as const, group: "House rules · Variant layer", open: { kind: "text", module: "demo-skirmish-house", line: lineOf(houseRules, "set warden-squad.cost.pts 20 -> 18") } as Place },
];

export function ReferencesScreen({ mode, state = "definition", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (["definition", "peek", "backlinks", "unresolved"].includes(state) ? state : "definition") as RefState;
  const start: Place = s === "definition" ? { kind: "entry", id: "demo-skirmish:shield-wall" } : s === "unresolved" ? { kind: "entry", id: "frost-wardens:ice-guard" } : { kind: "entry", id: "iron-wardens:warden-squad" };
  const [back, setBack] = useState<Place[]>(s === "definition" ? [{ kind: "entry", id: "iron-wardens:warden-squad" }] : []);
  const [forward, setForward] = useState<Place[]>([]);
  const [here, setHere] = useState<Place>(start);
  const [peek, setPeek] = useState<{ id: string; line: number; view: "page" | "text" } | null>(s === "peek" ? { id: "iron-wardens:spear", line: lineOf(ironWardens, "group weapon 1 default spear"), view: "page" } : null);
  const [panel, setPanel] = useState(s === "backlinks");
  const [linkSel, setLinkSel] = useState(0);
  const [unresolved, setUnresolved] = useState<{ key: string; line: number } | null>(s === "unresolved" ? { key: "iron-wardens:halbred", line: lineOf(frostWardens, "use iron-wardens:halbred") } : null);
  const [fixed, setFixed] = useState(false);
  const [listSource, setListSource] = useState<string | null>(s === "definition" ? "demo-skirmish" : s === "unresolved" ? "frost-wardens" : s === "backlinks" ? null : "iron-wardens");
  const panelRef = useRef<HTMLDivElement>(null);

  const go = (to: Place) => {
    setBack((b) => [...b, here]); setForward([]); setHere(to); setPeek(null); setUnresolved(null);
    if (to.kind === "entry") setListSource((cur) => (cur ? sourceOfEntry(to.id)?.id ?? cur : cur));
  };
  const goBack = () => { if (!back.length) return; setForward((f) => [here, ...f]); setHere(back[back.length - 1]); setBack((b) => b.slice(0, -1)); setPeek(null); setUnresolved(null); };
  const goForward = () => { if (!forward.length) return; setBack((b) => [...b, here]); setHere(forward[0]); setForward((f) => f.slice(1)); setPeek(null); setUnresolved(null); };
  const follow: Follow = ({ id, key, peek: wantPeek, line }) => {
    if (!id) { setUnresolved({ key, line }); setPeek(null); return; }
    if (wantPeek) { setPeek((p) => (p?.id === id && p.line === line ? null : { id, line, view: "page" })); setUnresolved(null); return; }
    go({ kind: "entry", id });
  };

  /* Keys for the window: ⌘[ / ⌘] history, ⇧F12 backlinks, Esc closes the innermost thing open. */
  const keys = useRef({ goBack, goForward, esc: () => false as boolean, backlinks: () => undefined as void });
  keys.current = {
    goBack, goForward,
    esc: () => { if (unresolved) { setUnresolved(null); return true; } if (peek) { setPeek(null); return true; } if (panel) { setPanel(false); return true; } return false; },
    backlinks: () => { setPanel(true); setLinkSel(0); requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>(".cg-bl.sel")?.focus()); },
  };
  useEffect(() => {
    if (!interactive) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "[") { event.preventDefault(); keys.current.goBack(); }
      if (event.metaKey && event.key === "]") { event.preventDefault(); keys.current.goForward(); }
      if (event.key === "F12" && event.shiftKey) { event.preventDefault(); keys.current.backlinks(); }
      if (event.key === "Escape" && keys.current.esc()) event.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [interactive]);

  const resolved = new Set(fixed ? ["d1"] : []);
  const open = allDiagnostics.filter((d) => !resolved.has(d.id));
  const entryId = here.kind === "entry" ? here.id : undefined;
  const pageIssues = entryId ? open.filter((d) => d.where === entryId || d.where.startsWith(`${entryId}/`)) : [];
  const list = listSource ? sourceById(listSource) : undefined;
  const crumbs = here.kind === "entry" ? <>{sourceOfEntry(here.id)?.name ?? "Dataset"}<span>/</span>{pageFor(here.id).name}</> : <>{modulesById[here.module]?.name}<span>/</span><span className="mono cg-crumb-mono">{modulesById[here.module]?.path.split("/").pop()}:{here.line}</span></>;
  /** Four tabs need 412 px (D opens its panel at 328 for three); the page keeps at least 480 beside the sidebar and the list. */
  const panelW = 412;
  const [helperPill, setHelperPill] = useState(s === "peek" || s === "unresolved");

  /* ---------- The page area ---------- */
  let body: ReactNode;
  if (here.kind === "text") {
    const m = modulesById[here.module];
    body = (
      <div className="cg-split" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
        <div className="cg-split-text">
          <CodeHead path={m.path} where={`line ${here.line}, opened from a backlink`}><button type="button" className="d-ghost sm" onClick={goBack} title="Back (⌘[)">Back to {back.length ? label(back[back.length - 1]) : "the page"}</button></CodeHead>
          <CodeView lines={m.lines} selected={[here.line, blockEnd(m.lines, here.line)]} caret={{ line: here.line, col: m.lines[here.line - 1].indexOf("warden-squad") }} scrollTo={here.line} label={`${m.path}, DKLPO text`} />
        </div>
      </div>
    );
  } else {
    const id = here.id;
    const module = moduleOf(id);
    const placed = module ? allDiagnostics.filter((d) => !resolved.has(d.id)).map((d) => place(d)).filter((p): p is NonNullable<typeof p> => Boolean(p && p.module === module.id)) : [];
    const after: Record<number, ReactNode> = {};
    if (peek) after[peek.line] = <Peek target={peek.id} view={peek.view} onView={(view) => setPeek({ ...peek, view })} onOpen={() => go({ kind: "entry", id: peek.id })} onClose={() => setPeek(null)} />;
    if (unresolved) after[unresolved.line] = <div className="cg-anchor-row"><Unresolved keyText={unresolved.key} onFix={() => { setFixed(true); setUnresolved(null); }} onClose={() => setUnresolved(null)} /></div>;
    body = (
      <div className={`d-scroll helper-${panel ? "panel" : helperPill ? "collapsed" : "floating"}`}>
        <div className="d-doc">
          {back.length && back[back.length - 1].kind === "entry" ? <button type="button" className="cg-from" onClick={goBack} title="Back (⌘[)"><CornerDownLeft size={13} />From {label(back[back.length - 1])}<kbd>⌘[</kbd></button> : null}
          {module ? (
            <LinkedPage key={id} id={id} module={fixed ? { ...module, lines: module.lines.map((l) => l.replace("iron-wardens:halbred", "iron-wardens:halberd")) } : module}
              flags={flagsFrom(placed, resolved)} follow={follow} after={after} folded={[lineOf(ironWardens, "upgrade banner ..1")]}
              brokenLines={fixed ? [] : [lineOf(frostWardens, "use iron-wardens:halbred")]} onBacklinks={id === "iron-wardens:warden-squad" ? () => keys.current.backlinks() : undefined} />
          ) : <DPage id={id} />}
        </div>
      </div>
    );
  }

  return (
    <Win mode={mode} interactive={interactive}>
      <DContext.Provider value={{ open: (id) => go({ kind: "entry", id }), resolved }}>
        <EditorGrid panelWidth={panelW}
          side={<Sidebar source={listSource} entry={entryId} updates={open.length} onEntry={(id) => go({ kind: "entry", id })} onSource={(id) => setListSource(id)} />}
          list={list ? <SourceList source={list} entry={entryId} onEntry={(id) => go({ kind: "entry", id })} onClose={() => setListSource(null)} /> : undefined}
          panel={panel ? <BacklinksPanel width={panelW} panelRef={panelRef} sel={linkSel} onSel={setLinkSel} onOpen={(i) => go(links[i].open)} onClose={() => setPanel(false)} /> : undefined}>
          <main className="d-main" aria-label="Entry">
            <header className="d-top">
              <BackForward back={back.length ? label(back[back.length - 1]) : undefined} forward={forward.length ? label(forward[0]) : undefined} onBack={goBack} onForward={goForward} />
              <span className="d-crumbs">{crumbs}</span>
              <span className="d-spacer" />
              <span className="d-muted">Edited just now</span>
              <button type="button" className="d-ghost" title="Focus mode: hide the sidebar (⌘.)"><Focus size={14} />Focus<kbd>⌘.</kbd></button>
              <button type="button" className="d-ghost" title="Show the DKLPO text beside the page (⌘⌥U)"><Code2 size={14} />Source</button>
            </header>
            {body}
            {!panel && here.kind === "entry" && helperPill ? <Pill issues={pageIssues} onOpen={() => setHelperPill(false)} /> : null}
            {!panel && here.kind === "entry" && !helperPill ? (
              <HelperBox issues={pageIssues as Diagnostic[]} resolved={resolved} elsewhere={open.length - pageIssues.length} checking="idle" onCollapse={() => setHelperPill(true)} onExpand={() => keys.current.backlinks()}
                onFix={(id) => { if (id === "d1") setFixed(true); }} onUndo={() => setFixed(false)} onDiff={() => undefined} onAll={() => undefined} onChecks={() => undefined} onInsert={() => undefined} onProperties={() => undefined} />
            ) : null}
          </main>
        </EditorGrid>
      </DContext.Provider>
    </Win>
  );
}

/** An entry that has no module text in this mock: D's own page (title, backlinks, properties, blocks). */
function DPage({ id }: { id: string }) {
  const page = pageFor(id);
  return (
    <article className="d-page" key={id}>
      <div className="d-pageicon"><KindIcon kind={page.kind} size={28} /></div>
      <h1>{page.name}</h1>
      <p className="d-backlinks"><ArrowDownLeft size={14} /><span className="d-muted">{page.backlinks.length} backlink{page.backlinks.length === 1 ? "" : "s"}</span>{page.backlinks.map((link) => <M key={link.label} to={link.to}>{link.label}</M>)}</p>
      <dl className="d-props">{page.props.map((prop) => <div key={prop.label}><dt>{prop.icon}{prop.label}</dt><dd>{prop.value}</dd></div>)}</dl>
      <div className="d-blocks">{page.blocks}</div>
    </article>
  );
}

/**
 * The peek: the target entry inline under the line that refers to it, editable in place, with its own header (path,
 * source and layer, Page / Text, Open, Close). It is an embedded view of another entry, so it gets a frame with an
 * accent edge on the page's paper, not a raised card.
 */
export function Peek({ target, view, onView, onOpen, onClose }: { target: string; view: "page" | "text"; onView: (v: "page" | "text") => void; onOpen: () => void; onClose: () => void }) {
  const row = lookupRow(target);
  const module = moduleOf(target) ?? ironWardens;
  const key = target.split(":")[1];
  const decl = module.lines.findIndex((line) => line.startsWith(`upgrade ${key}`) || line.startsWith(`unit ${key}`)) + 1;
  const end = blockEnd(module.lines, decl);
  const placed = allDiagnostics.map((d) => place(d)).filter((p): p is NonNullable<typeof p> => Boolean(p && p.module === module.id && p.line >= decl && p.line <= end));
  const props = propLines(module, decl);
  const page = pageFor(target);
  return (
    <section className="cg-peek" aria-label={`Peek: ${row?.row.name ?? key}`} onClick={(event) => event.stopPropagation()}>
      <header className="cg-peek-head">
        <KindIcon kind={row?.row.kind ?? "upgrade"} size={15} />
        <strong>{row?.row.name ?? key}</strong>
        <span className="mono">{target}</span>
        <span className="d-layer">{row?.source.name} · Base</span>
        <span className="d-spacer" />
        <span className="cg-seg" role="radiogroup" aria-label="Peek shows">
          <button type="button" role="radio" aria-checked={view === "page"} className={view === "page" ? "active" : ""} onClick={() => onView("page")}><FileText size={13} />Page</button>
          <button type="button" role="radio" aria-checked={view === "text"} className={view === "text" ? "active" : ""} onClick={() => onView("text")}><Code2 size={13} />Text</button>
        </span>
        <button type="button" className="d-btn sm" onClick={onOpen} title={`Open ${row?.row.name} in place of this page (F12)`}>Open<kbd>F12</kbd></button>
        <button type="button" className="d-icon sm" onClick={onClose} aria-label="Close the peek" title="Close the peek (Esc)"><X size={14} /></button>
      </header>
      {view === "page" ? (
        <div className="cg-peek-body">
          <dl className="d-props cg-peek-props">
            {page.props.filter((p) => p.label !== "Layer").map((prop) => (
              <div key={prop.label}><dt>{prop.icon}{prop.label}</dt><dd className={prop.label === "Cost" ? "cg-editing" : undefined}>{prop.label === "Cost" ? <><strong className="num">0</strong><span className="cg-caret" aria-hidden /><span>pts</span><span className="cg-peek-note"><DiagIcon kind="suggestion" size={12} />0 is the default</span><span className="d-muted">↵ saves</span></> : prop.value}{props[prop.label] ? <span className="cg-lineno">{props[prop.label]}</span> : null}</dd></div>
            ))}
          </dl>
          <div className="d-blocks"><Blocks module={module} decl={decl} flags={flagsFrom(placed)} /></div>
        </div>
      ) : (
        <div className="cg-peek-text"><CodeView lines={module.lines} start={decl} end={end} marks={placed.map((p) => ({ id: p.id, line: p.line, from: p.from, to: p.to, kind: p.kind }))} caret={{ line: end, col: 11 }} label={`${target}, DKLPO text`} compact /></div>
      )}
      <footer className="cg-peek-foot"><span className="mono">{module.path}:{decl}</span><span>edits save there</span><span className="d-spacer" /><span><kbd>F12</kbd> open</span><span><kbd>Esc</kbd> close</span></footer>
    </section>
  );
}

/** Go to definition on a reference that resolves to nothing: say so where the caret is, offer the fix, navigate nowhere. */
export function Unresolved({ keyText, onFix, onClose }: { keyText: string; onFix: () => void; onClose: () => void }) {
  return (
    <div className="cg-unresolved" role="dialog" aria-label="No definition">
      <p className="cg-hc-head"><CircleAlert size={14} className="cg-err" /><strong>No definition to go to</strong><span className="mono">dklpo/ref-unknown</span></p>
      <p><code>{keyText}</code> resolves to nothing: Iron Wardens has no entry with the key <code>halbred</code>. Nothing was opened.</p>
      <p className="cg-hc-actions">
        <button type="button" className="d-btn sm primary" onClick={onFix}><CornerDownLeft size={12} />Change to <code>halberd</code><kbd>⌥↵</kbd></button>
        <button type="button" className="d-btn sm"><Plus size={12} />Create upgrade halbred…</button>
      </p>
      <p className="cg-hc-foot"><Wrench size={12} />Closest: Halberd, 2 pts, Iron Wardens · <kbd>Esc</kbd> <button type="button" className="cg-linkbtn" onClick={onClose}>close</button></p>
    </div>
  );
}

/** The helper panel with a fourth tab, Backlinks: every place that refers to the entry, by source and layer, each with its line. */
export function BacklinksPanel({ width, panelRef, sel, onSel, onOpen, onClose }: { width: number; panelRef: RefObject<HTMLDivElement | null>; sel: number; onSel: (i: number) => void; onOpen: (i: number) => void; onClose: () => void }) {
  const groups = [...new Set(links.map((l) => l.group))];
  const key = (event: ReactKeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.max(0, Math.min(links.length - 1, sel + (event.key === "ArrowDown" ? 1 : -1)));
      onSel(next);
      requestAnimationFrame(() => panelRef.current?.querySelectorAll<HTMLElement>(".cg-bl")[next]?.focus());
    }
    if (event.key === "Enter") { event.preventDefault(); onOpen(sel); }
  };
  return (
    <aside className="d-panel" aria-label="Helper panel">
      <div className="d-panel-in" style={{ width }} ref={panelRef}>
        <header className="d-ptabs">
          <div role="tablist" aria-label="Helper">
            <button type="button" role="tab" aria-selected={false}>Issues<span className="d-pcount issues">1</span></button>
            <button type="button" role="tab" aria-selected={false}>Suggestions<span className="d-pcount">1</span></button>
            <button type="button" role="tab" aria-selected={false}>Properties</button>
            <button type="button" role="tab" aria-selected className="active">Backlinks<span className="d-pcount">{links.length}</span></button>
          </div>
          <span className="d-spacer" />
          <button type="button" className="d-icon" onClick={onClose} aria-label="Back to the floating box" title="Back to the floating box (Esc)"><PictureInPicture2 size={15} /></button>
        </header>
        <p className="cg-bl-lede">{links.length} places refer to <strong>Warden Squad</strong></p>
        <div className="d-pbody" onKeyDown={key}>
          {groups.map((group) => (
            <section key={group} className="d-igroup">
              <h3>{group}<span className="d-muted">{links.filter((l) => l.group === group).length}</span></h3>
              {links.map((l, i) => (l.group !== group ? null : (
                <div key={l.where} className={`cg-bl${sel === i ? " sel" : ""}`} tabIndex={sel === i ? 0 : -1} role="button" aria-label={`${l.note}: ${l.where}`} onClick={() => onSel(i)} onDoubleClick={() => onOpen(i)}>
                  <p className="cg-bl-line"><SynText text={modulesById[l.module].lines[l.line - 1].trim()} /></p>
                  <p className="cg-bl-note"><KindIcon kind={l.kind} size={13} />{l.note}<span className="d-spacer" /><span className="mono">{modulesById[l.module].path.split("/")[0]}:{l.line}</span></p>
                  {sel === i ? (
                    <span className="d-fix">
                      <button type="button" className="d-btn primary sm" onClick={(event) => { event.stopPropagation(); onOpen(i); }}><CornerDownLeft size={12} />{l.open.kind === "entry" ? `Open ${pageFor(l.open.id).name}` : "Open at its line"}</button>
                    </span>
                  ) : null}
                </div>
              )))}
            </section>
          ))}
        </div>
        <footer className="d-pfoot"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> open <kbd>⇧F12</kbd> from any page · <kbd>Esc</kbd> back to the box</footer>
      </div>
    </aside>
  );
}

