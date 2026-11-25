import { Check, CircleAlert, Code2, CornerDownLeft, Focus, Play, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DiagIcon } from "../../glyphs";
import { layout } from "../../language/layout";
import { HelperBox } from "../../directions/DirectionD";
import { Pill } from "../editor/parts";
import { useWindowKeys, type Mode } from "../editor/shell";
import { allDiagnostics } from "../editor/data";
import { ProgressRow, type StepStatus } from "../start/parts";
import { checkResults, checkSteps, type CheckState } from "./data";
import { ClassRow, CommandLine, EditorBehind, Facts, Head } from "./common";

/**
 * Screen 1: Run checks (⌘⇧C) inside the editor. The page toolbar carries the check status as a button (what the last
 * run said, or that it is running or out of date); ⌘⇧C or the button runs the checks and opens the run popover under it:
 * the steps with counts and Cancel while it runs, then the result (complete or not, counts per class with their codes,
 * the time, what was checked) leading into the diagnostics inbox. The run is `augur dklpo check --with <layers>` (parse,
 * compile, lower) plus `export --dry-run --exact` (the preservation failures), the same commands as the command line.
 */

const TICKS = { parse: [0, 3], compile: [3, 5], lower: [8, 3], export: [11, 3] } as const;
const END = 14;

type Outcome = "passed" | "failed" | "no-compile";
type Run = { tick: number } | null;

function stepRows(tick: number, outcome: Outcome | null) {
  return checkSteps.map((s) => {
    const [start, len] = TICKS[s.id];
    const p = tick >= start + len ? 1 : tick <= start ? 0 : (tick - start) / len;
    let status: StepStatus = p >= 1 ? "done" : tick >= start ? "running" : "waiting";
    let count: ReactNode = status === "waiting" ? "" : `${Math.round(p * s.of)} of ${s.of} ${s.unit}`;
    if (status === "done") {
      if (s.id === "parse") count = `${s.of} files · 412 KB`;
      if (s.id === "compile") count = "5 modules · 2 layers · 1 patch";
      if (s.id === "lower") count = "alone and with 2 layers · logic hash compared";
      if (s.id === "export") count = "5 documents · dry run, exact";
    }
    if (outcome === "no-compile" && tick >= END) {
      if (s.id === "parse") { status = "failed"; count = "30 of 31 files parse"; }
      if (s.id === "compile") { status = "failed"; count = "incomplete: Frost Wardens left out"; }
      if (s.id === "lower" || s.id === "export") { status = "waiting"; count = "not run"; }
    }
    return { ...s, status, count, value: p };
  });
}

/**
 * E1-5 as built (approved by the user 2026-11-25): A3, the check button stands in the page toolbar before Focus, Source
 * and Run, and reads Run checks ⌘⇧C before any run; A4, the sidebar's foot keeps Saved until a run exists, then the
 * checks foot replaces it; A8 with G6 (E1-6), the command to copy is the two commands the run is: `check --with` the
 * layers that are on, then the export check of the dataset alone.
 */
const AS_BUILT_COMMAND = "augur dklpo check ~/Datasets/demo-skirmish --with house-rules --with frost-wardens && augur dklpo export bsdata ~/Datasets/demo-skirmish --dry-run --exact";

export function ChecksScreen({ mode, state = "failed", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const asBuilt = state === "before-run" || state === "as-built";
  const beforeRun = state === "before-run";
  const s = (asBuilt ? "failed" : ["running", "passed", "failed", "no-compile", "stale"].includes(state) ? state : "failed") as CheckState;
  const initialOutcome: Outcome | null = beforeRun ? null : s === "running" ? null : s === "stale" ? "failed" : s;
  const [outcome, setOutcome] = useState<Outcome | null>(initialOutcome);
  const [run, setRun] = useState<Run>(s === "running" ? { tick: 6 } : null);
  const [stale, setStale] = useState(s === "stale");
  const [open, setOpen] = useState(!beforeRun);
  const [fixed, setFixed] = useState(false);
  const target = useRef<Outcome>(s === "passed" ? "passed" : s === "no-compile" ? "no-compile" : "failed");
  const timer = useRef<number | null>(null);
  const live = interactive;

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);
  const start = () => {
    if (!interactive || (run && timer.current)) return;
    setOpen(true); setStale(false); setOutcome(null); setRun({ tick: 0 });
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setRun((r) => {
        if (!r) return r;
        const next = r.tick + 1;
        const stop = target.current === "no-compile" ? TICKS.lower[0] : END;
        if (next >= stop) {
          if (timer.current) window.clearInterval(timer.current);
          timer.current = null;
          setOutcome(target.current);
          return null;
        }
        return { tick: next };
      });
    }, 160);
  };
  const cancel = () => { if (timer.current) window.clearInterval(timer.current); timer.current = null; setRun(null); setOutcome(initialOutcome === null ? "failed" : initialOutcome); setStale(true); };

  const keys = useRef({ start, cancel, esc: () => undefined as void });
  keys.current = { start, cancel, esc: () => { if (run) cancel(); else setOpen(false); } };
  const claim = useWindowKeys(live, (event: KeyboardEvent) => {
    if (event.metaKey && event.shiftKey && event.key.toLowerCase() === "c") { event.preventDefault(); keys.current.start(); }
    if (event.key === "Escape") keys.current.esc();
  });

  const running = Boolean(run);
  const tick = run?.tick ?? END;
  const steps = stepRows(tick, running ? null : outcome);
  const result = outcome === "passed" ? checkResults.passed : checkResults.failed;
  const nIssues = outcome === "no-compile" ? 1 : result.counts.reduce((n, c) => n + c.n, 0);

  /* ---------- Toolbar status button and the sidebar's foot ---------- */
  let status: ReactNode;
  let foot: ReactNode;
  if (running) {
    const current = steps.find((x) => x.status === "running") ?? steps[0];
    status = <><RefreshCw size={14} className="cg-spin" />Checking · {current.label.toLowerCase()} {current.count}</>;
    foot = <><RefreshCw size={12} className="cg-spin" />Checking…</>;
  } else if (stale) {
    status = <><span className="d-dot cg-dot-warn" />3 edits since 14:06</>;
    foot = <><span className="d-dot cg-dot-warn" />Edited since the check</>;
  } else if (outcome === null) {
    status = <><Play size={14} />Run checks</>;
    foot = <><span className="d-dot" />Saved · fmt clean</>;
  } else if (outcome === "passed") {
    status = <><Check size={14} className="d-ok" />Complete · {result.at}</>;
    foot = <><span className="d-dot" />Checked {result.at} · complete</>;
  } else if (outcome === "no-compile") {
    status = <><CircleAlert size={14} className="cg-err" />Doesn’t compile</>;
    foot = <><span className="d-dot cg-dot-err" />Doesn’t compile</>;
  } else {
    status = <><DiagIcon kind="error" size={14} />2 errors · {result.at}</>;
    foot = <><span className="d-dot cg-dot-err" />Checked {result.at} · 2 errors</>;
  }
  const checkButton = (
    <button type="button" className="d-ghost cg-tl-checkbtn" aria-expanded={open} aria-haspopup="dialog" onClick={() => (running || open ? setOpen(!open) : start())}
      title={running ? "Checks are running: show the steps" : "Run checks on the dataset and its layers (⌘⇧C)"}>
      {status}<kbd>⌘⇧C</kbd>
    </button>
  );
  const top = asBuilt ? (
    <>
      {checkButton}
      <button type="button" className="d-ghost" title="Focus mode: hide the sidebar (⌘.)"><Focus size={14} />Focus<kbd>⌘.</kbd></button>
      <button type="button" className="d-ghost" title="Show the DKLPO text beside the page (⌘⌥U)"><Code2 size={14} />Source<kbd>⌘⌥U</kbd></button>
      <button type="button" className="d-ghost" title="Run a roster against the dataset (⌘R)"><Play size={14} />Run<kbd>⌘R</kbd></button>
    </>
  ) : (
    <>
      <span className="d-muted">Edited just now</span>
      {checkButton}
    </>
  );

  /* ---------- The run popover ---------- */
  let body: ReactNode;
  if (running) {
    body = (
      <>
        <p className="cg-tl-note">The page stays editable while checks run; an edit made now marks this run out of date when it ends.</p>
        <p className="cg-tl-actions"><button type="button" className="d-btn" onClick={cancel}>Cancel<kbd>Esc</kbd></button><span className="d-muted">Last check 14:06: 2 errors, 2 preservation failures, 6 suggestions</span></p>
      </>
    );
  } else if (outcome === "no-compile") {
    body = (
      <>
        <p className="cg-tl-result error"><CircleAlert size={15} />Doesn’t compile: stopped before Lower</p>
        <div className="cg-tl-errline">
          <p><DiagIcon kind="error" size={13} /><span className="mono">frost-wardens/module.dkl:22</span><span className="mono d-muted">dklpo/indent</span></p>
          <p>Indented 3 spaces: a level is exactly 2 spaces.</p>
          <p className="cg-tl-actions">
            <button type="button" className="d-btn sm primary" onClick={() => { setFixed(true); target.current = "failed"; }} disabled={fixed}><CornerDownLeft size={12} />{fixed ? "Indented: run checks again" : "Indent to 4 spaces"}{fixed ? null : <kbd>⌥↵</kbd>}</button>
            <button type="button" className="d-btn sm">Go to line 22</button>
          </p>
        </div>
        <p className="cg-tl-note">Lower and the export check need a dataset that compiles complete, so they didn’t run. The inbox keeps the results of 14:06, marked out of date.</p>
      </>
    );
  } else {
    body = (
      <>
        {stale ? (
          <div className="cg-ib-stale cg-tl-stale" role="status">
            <RefreshCw size={14} />
            <p><strong>Out of date.</strong> 3 edits in Warden Squad and Ice Guard since this check at 14:06.</p>
            <button type="button" className="d-btn sm primary" onClick={start}>Run checks<kbd>⌘⇧C</kbd></button>
          </div>
        ) : (
          <p className={`cg-tl-result ${outcome === "passed" ? "ok" : "error"}`}>
            {outcome === "passed" ? <><Check size={15} />Complete: no errors</> : <><DiagIcon kind="error" size={15} />Incomplete: 2 errors</>}
            <span className="d-muted">{result.time} · today {result.at}</span>
          </p>
        )}
        <div className="cg-tl-classes" role="group" aria-label="Results by class">
          {result.counts.map((c) => <ClassRow key={c.kind} kind={c.kind} n={c.n} codes={c.codes} muted={stale} />)}
        </div>
        <Head note="what this run looked at">Checked</Head>
        <Facts rows={[
          { label: "Dataset", value: <>Demo Skirmish 3.2.0<span className="d-muted">lenient profile · 5 modules</span></> },
          { label: "Layers", value: <>House rules 1.0.0, Frost Wardens 0.3.0<span className="d-muted">Draft points is off: not checked</span></> },
          { label: "Patch", value: <><span className="mono">patch house → iron-wardens</span><span className="d-muted">{result.patch}</span></> },
          { label: "Export", value: <>XML data files<span className="d-muted">{asBuilt ? "the dataset alone · dry run, exact: 5 documents" : "dry run, exact: 5 documents"}</span></> },
        ]} />
      </>
    );
  }
  const popover = open ? (
    <section className="cg-tl-runpop" style={{ width: layout.pageMin }} role="dialog" aria-label="Check run">
      <header className="cg-tl-pophead">
        <strong>{running ? "Checking Demo Skirmish with 2 layers" : "Check run"}</strong>
        <span className="d-spacer" />
        <button type="button" className="d-icon sm" onClick={() => setOpen(false)} aria-label="Close the check run" title="Close (Esc); checks keep running"><X size={14} /></button>
      </header>
      <div className="cg-tl-steps">{steps.map((x) => <ProgressRow key={x.id} status={x.status} label={x.label} count={x.count} value={x.status === "running" ? x.value : undefined} />)}</div>
      {body}
      {running ? null : (
        <footer className="cg-tl-popfoot">
          {outcome !== "no-compile" && !stale ? <button type="button" className="d-btn primary" title="Show every diagnostic of the dataset (⌘⇧U)">Open the inbox<kbd>⌘⇧U</kbd></button> : null}
          <button type="button" className="d-btn" onClick={start}><Play size={13} />{stale ? "Run checks" : "Run again"}</button>
          <button type="button" className="d-btn" disabled={asBuilt} title={asBuilt ? "Strict profile once is in no slice yet" : "Check once under the strict profile (the dataset stays lenient)"}>Strict profile once</button>
        </footer>
      )}
      {!running ? <CommandLine command={asBuilt ? AS_BUILT_COMMAND : "augur dklpo check ~/Datasets/demo-skirmish --with house-rules --with frost-wardens"} /> : null}
    </section>
  ) : null;

  const pageIssues = allDiagnostics.filter((d) => d.where.startsWith("iron-wardens:warden-squad"));
  /* Before any run (as built): no popover, so the floating helper stands as its box; with the popover open it is its pill. */
  const helper = beforeRun && !open && outcome === null && !running
    ? <HelperBox noFixes issues={pageIssues} resolved={new Set()} elsewhere={allDiagnostics.length - pageIssues.length} checking="idle" onCollapse={() => undefined} onExpand={() => undefined}
        onFix={() => undefined} onUndo={() => undefined} onDiff={() => undefined} onAll={() => undefined} onChecks={start} onInsert={() => undefined} onProperties={() => undefined} />
    : open ? null : <Pill issues={outcome === "passed" ? pageIssues.filter((d) => d.kind === "suggestion") : pageIssues} />;
  return (
    <EditorBehind mode={mode} interactive={interactive} onClaim={claim} top={top} foot={foot} updates={outcome === "passed" ? 4 : beforeRun && outcome === null ? allDiagnostics.length : nIssues}
      popover={<>{helper}{popover}</>} />
  );
}
