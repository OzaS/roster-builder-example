import { CircleAlert, Code2, Columns2, FileText, Focus, PanelLeftClose, X } from "lucide-react";
import { useState } from "react";
import { TrafficLights } from "../../frames";
import { DiagIcon } from "../../glyphs";
import { sourceById, sourceOfEntry } from "../../directions/direction-d-content";
import { HelperBox } from "../../directions/DirectionD";
import { layout } from "../../language/layout";
import { allDiagnostics, blockEnd, frostBroken, frostWardens, ironWardens, lineOf, place, plain, type ModuleText } from "./data";
import { CodeHead, CodeStatus, CodeView, type CodeCaret, type CodeMark, type CodePop } from "./code";
import { declOf, entryAt, flagsFrom, LinkedPage } from "./page";
import { DiagCard, FixMenu, Pill } from "./parts";
import { BackForward, EditorGrid, Sidebar, SourceList, Win, type Mode, useWindowKeys } from "./shell";

/**
 * Screen 1: source text beside the page. Source (⌘⌥U) splits the page area: the entry page on the left, its module's
 * DKLPO text on the right, synced both ways. The split needs `SPLIT_MIN` px (page 480 + text 520); narrower, the Source
 * button switches between page and text instead. A module that doesn't parse opens as text only.
 */
export type SourceState = "split" | "text-only" | "error" | "parse-error" | "large" | "narrow";
type View = "page" | "split" | "text";

export const TEXT_MIN = 520;
export const SPLIT_MIN = layout.pageMin + TEXT_MIN; // 1000

const fixedLines = (module: ModuleText, resolved: ReadonlySet<string>) => {
  let lines = module.lines;
  if (resolved.has("d1")) lines = lines.map((line) => line.replace("iron-wardens:halbred", "iron-wardens:halberd"));
  if (resolved.has("indent")) lines = frostWardens.lines;
  for (const id of ["d5", "d9", "d10", "d7"]) {
    if (!resolved.has(id)) continue;
    const d = allDiagnostics.find((x) => x.id === id);
    const placed = d ? place(d, lines) : undefined;
    if (placed && placed.module === module.id) lines = lines.filter((_, i) => i !== placed.line - 1);
  }
  if (resolved.has("d4")) lines = lines.filter((line) => line.trim() !== "x-bs.exampleReviewState: draft");
  return lines;
};

export function SourceScreen({ mode, state = "split", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (["split", "text-only", "error", "parse-error", "large", "narrow"].includes(state) ? state : "split") as SourceState;
  const narrow = s === "narrow";
  const width = narrow ? layout.windowMin : layout.windowDesign;
  const startModule = s === "parse-error" ? frostBroken : s === "text-only" || s === "error" ? frostWardens : ironWardens;
  const startEntry = s === "error" || s === "text-only" || s === "parse-error" ? "frost-wardens:ice-guard" : "iron-wardens:warden-squad";

  const [moduleId, setModuleId] = useState(startModule.id);
  const [entry, setEntry] = useState(startEntry);
  const [view, setView] = useState<View>(s === "text-only" || s === "parse-error" || narrow ? "text" : "split");
  const [resolved, setResolved] = useState<ReadonlySet<string>>(new Set());
  const [listOpen, setListOpen] = useState(s === "text-only");
  const broken = s === "parse-error" && !resolved.has("indent");
  const module = moduleId === "frost-wardens" ? (s === "parse-error" ? frostBroken : frostWardens) : ironWardens;
  const lines = fixedLines(module, resolved);

  const initialSel = s === "error" ? lineOf(frostWardens, "use iron-wardens:halbred") : s === "parse-error" ? lineOf(frostBroken, "cost pts 9") : s === "text-only" ? lineOf(frostWardens, "unit ice-guard") : lineOf(ironWardens, "x-bs.exampleReviewState: draft");
  const [sel, setSel] = useState<number | null>(s === "text-only" || s === "parse-error" ? null : initialSel);
  const [caret, setCaret] = useState<CodeCaret | null>(() => {
    if (s === "error") return { line: initialSel, col: frostWardens.lines[initialSel - 1].indexOf("halbred") + 4 };
    if (s === "parse-error") return { line: initialSel, col: 3 };
    if (s === "text-only") return { line: lineOf(frostWardens, "use iron-wardens:halbred"), col: 6 };
    return { line: initialSel, col: 2 };
  });
  const [hover, setHover] = useState<string | null>(s === "split" || s === "large" ? "d4" : null);
  const [menu, setMenu] = useState(s === "error");

  /* Placed diagnostics in the current text; the bad indent is a parse error of its own. */
  const placed = allDiagnostics.filter((d) => !resolved.has(d.id)).map((d) => place(d, lines)).filter((p): p is NonNullable<typeof p> => Boolean(p && p.module === module.id));
  const indentLine = broken ? lines.findIndex((line) => line === "   cost pts 9") + 1 : 0;
  const marks: CodeMark[] = broken ? [{ id: "indent", line: indentLine, from: 0, to: 3, kind: "error" }] : placed.map((p) => ({ id: p.id, line: p.line, from: p.from, to: p.to, kind: p.kind }));

  const pageModule: ModuleText = { ...module, lines };
  const open = allDiagnostics.filter((d) => !resolved.has(d.id));
  const pageIssues = open.filter((d) => d.where === entry || d.where.startsWith(`${entry}/`));
  const resolve = (id: string) => { setResolved((current) => new Set(current).add(id)); setMenu(false); setHover(null); };

  const selectLine = (line: number) => {
    const at = entryAt(pageModule, line);
    if (at && at !== entry) setEntry(at);
    const text = lines[line - 1]?.trim() ?? "";
    setSel(text && !text.startsWith("#") && declOf(lines, line) ? line : null);
    setCaret({ line, col: (lines[line - 1]?.length ?? 0) - (lines[line - 1]?.trimStart().length ?? 0) });
    setMenu(false);
  };
  const selectBlock = (line: number) => { setSel(line); setCaret({ line, col: lines[line - 1].length - lines[line - 1].trimStart().length }); setMenu(false); };
  const openEntry = (id: string) => {
    const src = sourceOfEntry(id)?.id;
    if (src === "iron-wardens" || src === "frost-wardens") setModuleId(src);
    setEntry(id); setSel(null); setMenu(false);
  };

  /* ⌘⌥U toggles the text; ⌥↵ opens the quick fixes at the caret; Esc closes the menu. */
  const claim = useWindowKeys(interactive, (event: KeyboardEvent) => {
      if (event.metaKey && event.altKey && event.code === "KeyU") { event.preventDefault(); setView((v) => (v === "page" ? (narrow ? "text" : "split") : "page")); }
      if (event.altKey && event.key === "Enter") { event.preventDefault(); setMenu(true); }
      if (event.key === "Escape") setMenu(false);
  });

  const caretDiags = caret ? placed.filter((p) => p.line === caret.line && (p.kind !== "preservation")) : [];
  const hoverDiag = hover ? placed.filter((p) => p.id === hover || (p.line === placed.find((x) => x.id === hover)?.line)) : [];
  let pop: CodePop | null = null;
  if (menu && caret && broken) {
    pop = { line: caret.line, col: 0, node: <FixMenu title={<>Parse error · <span className="mono">dklpo/indent</span></>} items={[{ label: "Indent to 4 spaces (one level)", key: "↵" }, { label: "Indent to 2 spaces", key: "" }]} onPick={() => resolve("indent")} /> };
  } else if (menu && caret && caretDiags.length) {
    const d = caretDiags[0];
    pop = {
      line: caret.line, col: d.from,
      node: d.id === "d1"
        ? <FixMenu title={<>Unknown reference <span className="mono">iron-wardens:halbred</span></>} items={[
            { label: <>Change to <span className="mono">iron-wardens:halberd</span></>, key: "↵", hint: "Halberd, 2 pts: the closest key in Iron Wardens" },
            { label: <>Change to <span className="mono">rime-blade</span></>, hint: "Rime Blade, 3 pts, in this module" },
            { label: <>Create upgrade <span className="mono">halbred</span> in Frost Wardens…</>, icon: "idea" },
            { label: "Open Iron Wardens' upgrades", icon: "idea", key: "" },
          ]} onPick={(index) => (index === 0 ? resolve("d1") : setMenu(false))} />
        : <FixMenu title={<>{plain(d.message)}</>} items={[{ label: plain(d.fix ?? "Fix"), key: "↵" }, { label: <>Fix every <span className="mono">dklpo/{d.code}</span> in this file</>, icon: "idea" }]} onPick={() => resolve(d.id)} />,
    };
  } else if (hoverDiag.length) {
    const first = hoverDiag[0];
    pop = { line: first.line, col: first.from, node: <DiagCard list={hoverDiag} onFix={(d) => resolve(d.id)} /> };
  }

  const fullyFits = !narrow;
  const showText = view !== "page";
  const showPage = view === "page" || (view === "split" && fullyFits);
  const decl = declOf(lines, sel ?? caret?.line ?? 0);
  const selRange: [number, number] | null = sel ? [sel, blockEnd(lines, sel)] : null;
  const entryName = sourceById(module.id)?.groups.flatMap((g) => g.rows).find((r) => r.id === entry)?.name ?? entry;
  const entryDecl = lines.findIndex((line) => line.split(" ")[1] === entry.split(":")[1] && !line.startsWith(" ") && !line.startsWith("root")) + 1;
  const where = broken ? "doesn't parse" : view === "text" ? `${lines.length} lines` : `${entryName}, lines ${entryDecl}–${blockEnd(lines, entryDecl)}`;
  const counts = { error: marks.filter((m) => m.kind === "error").length, preservation: marks.filter((m) => m.kind === "preservation").length, suggestion: marks.filter((m) => m.kind === "suggestion").length };
  const inline = broken ? { [indentLine]: (
    <p><DiagIcon kind="error" size={13} /><strong>Parse error</strong><span className="mono">dklpo/indent</span><span>Indented 3 spaces: a level is exactly 2 spaces, so this line can't belong to <code>model guard</code>.</span>
      <button type="button" className="d-btn sm primary" onClick={() => resolve("indent")}>Indent to 4 spaces<kbd>⌥↵</kbd></button></p>
  ) } : undefined;

  const text = (
    <div className="cg-split-text" aria-label="Source text">
      <CodeHead path={module.path} where={where}>
        {view === "split" ? <button type="button" className="d-ghost sm" onClick={() => setView("text")} title="Show the text alone (⌘⌥⇧U)"><Code2 size={14} />Text only</button> : null}
        {view === "text" && fullyFits && !broken ? <button type="button" className="d-ghost sm" onClick={() => { setView("split"); setListOpen(false); }} title="Show the page beside the text; the source list folds away (⌘⌥⇧U)"><Columns2 size={14} />Page beside</button> : null}
        {!broken ? <button type="button" className="d-icon sm" onClick={() => setView("page")} aria-label="Close the text" title="Close the text: page only (⌘⌥U)"><X size={14} /></button> : null}
      </CodeHead>
      <CodeView lines={lines} marks={marks} selected={selRange} caret={caret} pop={pop} inline={inline} label={`${module.path}, DKLPO text`}
        onLine={(line) => selectLine(line)} onHover={(id) => { if (!menu) setHover(id); }} scrollTo={sel ?? caret?.line} />
      <CodeStatus caret={caret} fmt={broken ? "blocked" : "clean"} counts={counts}>
        {broken ? <span className="cg-status-err">Pages wait for a parse</span> : null}
      </CodeStatus>
    </div>
  );

  const page = broken ? (
    <div className="cg-split-page cg-noparse" aria-label="Page">
      <div className="cg-noparse-in">
        <CircleAlert size={22} />
        <h2>Frost Wardens doesn't parse</h2>
        <p>Line {indentLine} has a parse error, so its entries can't be drawn as pages. The pages show again as soon as the text parses; nothing older is shown meanwhile.</p>
        <p className="cg-noparse-actions">
          <button type="button" className="d-btn primary" onClick={() => { setCaret({ line: indentLine, col: 0 }); setMenu(true); }}>Go to line {indentLine}<kbd>F8</kbd></button>
          <button type="button" className="d-btn" disabled title="fmt runs only on text that parses">Format file</button>
        </p>
        <p className="d-muted">Ice Guard, frost-seer and Rime Blade come back when it parses. Saving keeps the text as typed.</p>
      </div>
    </div>
  ) : (
    <div className="cg-split-page" aria-label="Page">
      {view === "split" ? <Pill issues={pageIssues} className="cg-split-pill" /> : null}
      <div className="d-doc">
        <LinkedPage key={entry} id={entry} module={pageModule} flags={flagsFrom(placed)} follow={({ id }) => { if (id) openEntry(id); }} folded={s === "split" || s === "large" ? [lineOf(ironWardens, "upgrade banner ..1")] : []}
          sel={{ line: sel && decl && entryAt(pageModule, sel) === entry ? sel : null, onSelect: selectBlock }} brokenLines={resolved.has("d1") ? [] : [lineOf(frostWardens, "use iron-wardens:halbred")]} noTail={view === "split"} />
      </div>
    </div>
  );

  const crumbs = sourceOfEntry(entry)?.name ?? "Dataset";
  const list = listOpen && !narrow ? sourceById(module.id) : undefined;
  return (
    <Win mode={mode} width={width} large={s === "large"} interactive={interactive} onClaim={claim}>
      <EditorGrid hideSide={narrow}
        side={<Sidebar source={list ? module.id : null} entry={entry} updates={open.length} broken={broken ? "frost-wardens" : undefined} onEntry={openEntry} onSource={(id) => { if (id === "iron-wardens" || id === "frost-wardens") { setModuleId(id); setListOpen(true); setView((v) => (v === "split" ? "text" : v)); } }}
          foot={broken ? <><span className="d-dot cg-dot-err" />Saved · 1 parse error</> : undefined} />}
        list={list ? <SourceList source={list} entry={entry} onEntry={(id) => { openEntry(id); const l = lines.findIndex((line) => line.split(" ")[1] === id.split(":")[1] && !line.startsWith(" ") && !line.startsWith("root")) + 1; if (l) { setSel(l); setCaret({ line: l, col: 0 }); } }} onClose={() => setListOpen(false)} /> : undefined}>
        <main className="d-main" aria-label="Entry">
          <header className="d-top">
            {narrow ? <TrafficLights /> : null}
            <BackForward />
            <span className="d-crumbs">{broken ? module.name : crumbs}<span>/</span>{broken ? "module.dkl" : entryName}</span>
            <span className="d-spacer" />
            <span className="d-muted">Edited just now</span>
            <button type="button" className={`d-ghost${narrow ? " on" : ""}`} title={narrow ? "Exit focus mode (⌘. or Esc)" : "Focus mode: hide the sidebar (⌘.)"} aria-pressed={narrow}><Focus size={14} />Focus<kbd>⌘.</kbd></button>
            {narrow ? (
              <span className="cg-seg" role="radiogroup" aria-label="Show">
                <button type="button" role="radio" aria-checked={view === "page"} className={view === "page" ? "active" : ""} disabled={broken} onClick={() => setView("page")} title={broken ? "The module doesn't parse: no page to show" : "Show the page (⌘⌥U)"}><FileText size={13} />Page</button>
                <button type="button" role="radio" aria-checked={view !== "page"} className={view !== "page" ? "active" : ""} onClick={() => setView("text")} title="Show the text (⌘⌥U)"><Code2 size={13} />Text</button>
              </span>
            ) : (
              <button type="button" className={`d-ghost${showText ? " on" : ""}`} aria-pressed={showText} disabled={broken} onClick={() => setView(showText ? "page" : "split")}
                title={broken ? "The module doesn't parse: it stays in text until it does" : showText ? "Hide the text (⌘⌥U)" : "Show the DKLPO text beside the page (⌘⌥U)"}><Code2 size={14} />Source<kbd>⌘⌥U</kbd></button>
            )}
          </header>
          {narrow ? <p className="cg-narrow-note"><PanelLeftClose size={13} />Page and text side by side need {SPLIT_MIN} px; this window is {width} px, so Source switches between them.</p> : null}
          {view === "page" ? (
            <div className="d-scroll helper-floating">
              <div className="d-doc"><LinkedPage key={entry} id={entry} module={pageModule} flags={flagsFrom(placed)} follow={({ id }) => { if (id) openEntry(id); }} brokenLines={resolved.has("d1") ? [] : [lineOf(frostWardens, "use iron-wardens:halbred")]} /></div>
              {!narrow ? <HelperBox issues={pageIssues} resolved={resolved} elsewhere={open.length - pageIssues.length} checking="idle" onCollapse={() => undefined} onExpand={() => undefined} onFix={resolve} onUndo={() => undefined} onDiff={() => undefined} onAll={() => undefined} onChecks={() => undefined} onInsert={() => undefined} onProperties={() => undefined} /> : null}
            </div>
          ) : (
            <div className={`cg-split${showPage || broken ? "" : " text-only"}`} style={showPage || broken ? { gridTemplateColumns: `minmax(${layout.pageMin}px, 1fr) minmax(${TEXT_MIN}px, 1.1fr)` } : undefined}>
              {showPage || broken ? page : null}
              {text}
            </div>
          )}
        </main>
      </EditorGrid>
    </Win>
  );
}
