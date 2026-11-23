import { Code2, ExternalLink, FileText, Play, ScanSearch } from "lucide-react";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { TrafficLights } from "../../frames";
import { DiagIcon } from "../../glyphs";
import { pageFor, sourceOfEntry } from "../../directions/direction-d-content";
import { layout } from "../../language/layout";
import { allDiagnostics, ironWardens, lineOf } from "../editor/data";
import { CodeHead, CodeStatus, CodeView } from "../editor/code";
import { LinkedPage } from "../editor/page";
import { Pill } from "../editor/parts";
import { BackForward, EditorGrid, Sidebar, Win, type Mode, useWindowKeys } from "../editor/shell";
import { RunnerPane, type RunnerState } from "./runner";
import "./layers.css";
import "./runner.css";

/**
 * Screen 3: the dataset runner (Run, ⌘R). Docked beside the editor as a right-hand pane (the source list folds and the
 * helper box becomes its pill while it is open; the pane is resizable by its left edge) or detached into its own window.
 * At 960 px the runner takes the window's page area and ⌘R switches between page and runner. Hot reload: every save
 * (or, by setting, a pause in typing) rebuilds the dataset and the runner swaps to the new build keeping the roster.
 */

const ALL: RunnerState[] = ["empty", "progress", "reloaded", "error", "review", "save-test", "detached", "narrow"];
/** The page beside the runner keeps at least `pageMin`; the runner is at most what is left at the design width. */
const RUNNER_MAX = layout.windowDesign - layout.sidebar - layout.pageMin; // 728

/** iron-wardens/module.dkl after the save of the "reloaded" state: the captain's cost and the longbow's cost changed. */
const savedLines = (() => {
  const lines = ironWardens.lines
    .map((l) => (l === "  cost pts 45" ? "  cost pts 48" : l))
    .map((l, i, all) => (l === "  cost pts 4" && all[i - 2]?.startsWith("upgrade longbow") ? "  cost pts 5" : l))
    .map((l) => l.replace(/^upgrade halberd$/, "upgrade pole-halberd").replace(/use halberd$/, "use pole-halberd").replace("default halberd", "default pole-halberd"));
  /* The banner moved from the Warden model to a Command group of the unit (a structural move, recorded in moves.dkl). */
  const at = lines.indexOf("    upgrade banner ..1");
  const banner = lines.splice(at, 3).map((l) => l.slice(2));
  lines.splice(lines.indexOf("  cost pts 20") + 1, 0, "  group command 0..1", ...banner.map((l) => `  ${l}`));
  return lines;
})();
/** The same module while typing, with a bad indent (the "error" state): it doesn't parse, the runner keeps the last good build. */
const typingLines = ironWardens.lines.map((l, i) => (i === 19 ? "   cost pts 8" : l));

export function RunnerScreen({ mode, state = "progress", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (ALL.includes(state as RunnerState) ? state : "progress") as RunnerState;
  const narrow = s === "narrow";
  const [where, setWhere] = useState<"docked" | "detached" | "closed">(s === "detached" ? "detached" : "docked");
  const [narrowView, setNarrowView] = useState<"page" | "runner">("runner");
  const [entry, setEntry] = useState(s === "reloaded" ? "iron-wardens:warden-captain" : "iron-wardens:warden-squad");
  const [left, setLeft] = useState<"page" | "text">(s === "reloaded" || s === "error" ? "text" : "page");
  const [reveal, setReveal] = useState<{ id: string; n: number } | undefined>(undefined);
  const [width, setWidth] = useState(RUNNER_MAX);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; w: number } | null>(null);

  const toggleRun = () => { if (narrow) setNarrowView((v) => (v === "runner" ? "page" : "runner")); else setWhere((w) => (w === "closed" ? "docked" : w === "docked" ? "closed" : "detached")); };
  const openEntry = (id: string) => { setEntry(id); setLeft("page"); if (narrow) setNarrowView("page"); };
  const showInRunner = () => { setReveal({ id: entry, n: (reveal?.n ?? 0) + 1 }); if (narrow) setNarrowView("runner"); if (where === "closed") setWhere("docked"); };
  const claim = useWindowKeys(interactive, (event: KeyboardEvent) => {
    if ((event.target as HTMLElement).tagName === "INPUT") return;
    if (event.metaKey && event.altKey && event.code === "KeyR") { event.preventDefault(); showInRunner(); return; }
    if (event.metaKey && !event.shiftKey && event.code === "KeyR") { event.preventDefault(); toggleRun(); }
  });

  const onResizeDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { x: event.clientX, w: width };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onResizeMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const scale = event.currentTarget.getBoundingClientRect().height / layout.windowHeight || 1;
    setWidth(Math.max(layout.runnerMin, Math.min(RUNNER_MAX, drag.current.w - (event.clientX - drag.current.x) / scale)));
  };
  const onResizeUp = () => { drag.current = null; setDragging(false); };

  const pageIssues = allDiagnostics.filter((d) => d.where === entry || d.where.startsWith(`${entry}/`));
  const crumbs = <>{sourceOfEntry(entry)?.name ?? "Dataset"}<span>/</span>{left === "text" ? <span className="mono cg-crumb-mono">module.dkl</span> : pageFor(entry).name}</>;
  const runnerOpen = narrow ? narrowView === "runner" : where === "docked";

  /* The page area: the entry page, or the module text when the state is about a save or typing. */
  const page = left === "text" ? (
    <div className="cg-split-text cg-rn-text" aria-label="Source text">
      <CodeHead path={ironWardens.path} where={s === "error" ? "doesn't parse · typing" : "saved 12:06:01"}><button type="button" className="d-ghost sm" onClick={() => setLeft("page")}>Page</button></CodeHead>
      {s === "error" ? (
        <CodeView lines={typingLines} marks={[{ id: "indent", line: 20, from: 0, to: 3, kind: "error" }]} caret={{ line: 20, col: 13 }} scrollTo={20} label={`${ironWardens.path}, DKLPO text`}
          inline={{ 20: <p><DiagIcon kind="error" size={13} /><strong>Parse error</strong><span className="mono">dklpo/indent</span><span>Indented 3 spaces: a level is exactly 2 spaces.</span></p> }} />
      ) : (
        <CodeView lines={savedLines} selected={[lineOf({ ...ironWardens, lines: savedLines }, "cost pts 48"), lineOf({ ...ironWardens, lines: savedLines }, "cost pts 48")]} caret={{ line: lineOf({ ...ironWardens, lines: savedLines }, "cost pts 48"), col: 13 }} scrollTo={lineOf({ ...ironWardens, lines: savedLines }, "cost pts 48")} label={`${ironWardens.path}, DKLPO text`} />
      )}
      <CodeStatus caret={{ line: s === "error" ? 20 : lineOf({ ...ironWardens, lines: savedLines }, "cost pts 48"), col: 13 }} fmt={s === "error" ? "blocked" : "clean"} counts={s === "error" ? { error: 1 } : { preservation: 1, suggestion: 3 }}>{s === "error" ? <span className="cg-status-err">The runner keeps the last good build</span> : null}</CodeStatus>
    </div>
  ) : (
    <div className="d-scroll helper-collapsed">
      <div className="d-doc"><LinkedPage key={entry} id={entry} module={ironWardens} folded={[lineOf(ironWardens, "upgrade banner ..1")]} /></div>
    </div>
  );

  const toolbar = (
    <header className="d-top">
      {narrow ? <TrafficLights /> : null}
      <BackForward />
      <span className="d-crumbs">{narrow && narrowView === "runner" ? <>Demo Skirmish<span>/</span>Runner</> : crumbs}</span>
      <span className="d-spacer" />
      {narrow || runnerOpen ? null : <span className="d-muted">{s === "error" ? "Typing…" : s === "reloaded" ? "Saved 12:06:01" : "Edited just now"}</span>}
      {(runnerOpen || where === "detached") && !(narrow && narrowView === "runner") ? (
        runnerOpen && !narrow
          ? <button type="button" className="d-icon" onClick={showInRunner} aria-label={`Show ${pageFor(entry).name} in the runner`} title={`Show in runner: select ${pageFor(entry).name} in the roster (⌥⌘R)`}><ScanSearch size={15} /></button>
          : <button type="button" className="d-ghost" onClick={showInRunner} title={`Select ${pageFor(entry).name} in the runner's roster (⌥⌘R)`}><ScanSearch size={14} />Show in runner<kbd>⌥⌘R</kbd></button>
      ) : null}
      {narrow ? null : runnerOpen
        ? <button type="button" className={`d-icon${left === "text" ? " cg-rn-on" : ""}`} aria-pressed={left === "text"} onClick={() => setLeft(left === "text" ? "page" : "text")} aria-label="Source" title="Show the DKLPO text (⌘⌥U)"><Code2 size={15} /></button>
        : <button type="button" className={`d-ghost${left === "text" ? " on" : ""}`} onClick={() => setLeft(left === "text" ? "page" : "text")} title="Show the DKLPO text (⌘⌥U)"><Code2 size={14} />Source</button>}
      {narrow ? (
        <span className="cg-seg" role="radiogroup" aria-label="Show">
          <button type="button" role="radio" aria-checked={narrowView === "page"} className={narrowView === "page" ? "active" : ""} onClick={() => setNarrowView("page")} title="Show the page (⌘R)"><FileText size={13} />Page</button>
          <button type="button" role="radio" aria-checked={narrowView === "runner"} className={narrowView === "runner" ? "active" : ""} onClick={() => setNarrowView("runner")} title="Show the runner (⌘R)"><Play size={13} />Runner</button>
        </span>
      ) : where === "detached" ? (
        <button type="button" className="d-ghost on" onClick={() => setWhere("docked")} title="The runner is in its own window: dock it here (⌘R)"><ExternalLink size={14} />Runner window<kbd>⌘R</kbd></button>
      ) : (
        <button type="button" className={`d-ghost${runnerOpen ? " on" : ""}`} aria-pressed={runnerOpen} onClick={toggleRun} title={runnerOpen ? "Close the runner (⌘R); the roster is kept" : "Run the dataset: build a roster against it, reloaded on every save (⌘R)"}><Play size={14} />Run<kbd>⌘R</kbd></button>
      )}
    </header>
  );

  if (narrow) {
    return (
      <Win mode={mode} width={layout.windowMin} interactive={interactive} onClaim={claim}>
        <EditorGrid hideSide side={<Sidebar entry={entry} updates={allDiagnostics.length} />}>
          <main className="d-main" aria-label={narrowView === "runner" ? "Runner" : "Entry"}>
            {toolbar}
            {narrowView === "runner" ? (
              <>
                <p className="cg-narrow-note"><ExternalLink size={13} />Page and runner side by side need {layout.pageMin + layout.runnerMin} px (page {layout.pageMin} + runner {layout.runnerMin}); this window is {layout.windowMin} px, so the runner takes the page area and ⌘R switches. Its own window keeps both in view.</p>
                <div className="cg-rn-fullwrap"><RunnerPane state="progress" variant="full" interactive={interactive} onOpenEntry={openEntry} reveal={reveal} onDetach={() => undefined} /></div>
              </>
            ) : page}
            {narrowView === "page" ? <Pill issues={pageIssues} /> : null}
          </main>
        </EditorGrid>
      </Win>
    );
  }

  const dock = where === "docked" ? (
    <aside className={`d-panel cg-rn-dock${dragging ? " dragging" : ""}`} aria-label="Runner">
      <div className="d-resize" role="separator" aria-orientation="vertical" aria-label="Resize the runner" aria-valuenow={Math.round(width)} aria-valuemin={layout.runnerMin} aria-valuemax={RUNNER_MAX} tabIndex={0}
        onPointerDown={onResizeDown} onPointerMove={onResizeMove} onPointerUp={onResizeUp} onPointerCancel={onResizeUp}
        onKeyDown={(e) => { if (e.key === "ArrowLeft") setWidth((w) => Math.min(RUNNER_MAX, w + 16)); if (e.key === "ArrowRight") setWidth((w) => Math.max(layout.runnerMin, w - 16)); }} title="Drag to resize; the page keeps at least 480 px" />
      <div className="cg-rn-dockin" style={{ width }}>
        <RunnerPane state={s} variant="docked" interactive={interactive} onOpenEntry={openEntry} reveal={reveal} onDetach={() => setWhere("detached")} onClose={() => setWhere("closed")} onGoToError={() => setLeft("text")} />
      </div>
    </aside>
  ) : undefined;

  return (
    <Win mode={mode} interactive={interactive} onClaim={claim}>
      <EditorGrid panelWidth={width} panel={dock}
        side={<Sidebar entry={entry} source={null} updates={allDiagnostics.length} onEntry={openEntry} foot={s === "error" ? <><span className="d-dot cg-dot-err" />Unsaved · 1 parse error</> : undefined} />}>
        <main className="d-main" aria-label="Entry">
          {toolbar}
          {page}
          {left === "page" ? <Pill issues={pageIssues} /> : null}
        </main>
      </EditorGrid>
      {where === "detached" ? (
        <div className={`cg-rn-window ${mode}`} role="dialog" aria-label="Runner window">
          <div className="cg-rn-wtitle"><TrafficLights /><span>Runner — Demo Skirmish</span></div>
          <RunnerPane state={s} variant="detached" interactive={interactive} onOpenEntry={openEntry} reveal={reveal} onDock={() => setWhere("docked")} />
        </div>
      ) : null}
    </Win>
  );
}
