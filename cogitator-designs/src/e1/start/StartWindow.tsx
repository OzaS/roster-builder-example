import { ArrowRightLeft, BookOpen, FileInput, FileWarning, FileX, FolderOpen, FolderSearch, Lock, Search, Settings, Upload } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { TrafficLights, WinCaption } from "../../frames";
import { DiagIcon } from "../../glyphs";
import { layout } from "../../language/layout";
import type { E1Mode, E1Platform } from "../types";
import { recents, xmlFolder, type Recent } from "./data";
import { CheckCounts, Dialog, E1Window, ProgressRow, RecentHeads, RecentRow, keyFor, type DlgAction, type StepStatus } from "./parts";

/**
 * The start window: what Field Cogitator shows when no dataset is open (first launch, after Close dataset, File › Open).
 * B's quiet sidebar carries the app's actions; the main pane is the list of recent datasets (dense rows, status edges) with
 * a drop target. Opening shows its steps with counts and Cancel; when a dataset can't be opened as is, a sheet (macOS) or
 * dialog (Windows) says why and offers the choices.
 */
export type StartState = "recent" | "first-run" | "opening" | "missing";
export type OpenProblem = "not-dataset" | "newer-format" | "parse-errors" | "permission";

type Job = { kind: "open" | "convert"; title: string; path: string; readOnly?: boolean; files: number; modules: number; tick: number; static?: boolean };

/** Job steps from the tick count (each step takes a few ticks); a static job (the `opening` state) stops mid-compile. */
function jobSteps(job: Job): { label: string; status: StepStatus; count: string; value?: number }[] {
  const t = job.tick;
  const phase = (start: number, len: number) => (t >= start + len ? 1 : t <= start ? 0 : (t - start) / len);
  if (job.kind === "convert") {
    const read = phase(0, 4), conv = phase(4, 5), write = phase(9, 3), check = phase(12, 4);
    const st = (p: number, prev: number): StepStatus => (p >= 1 ? "done" : prev >= 1 ? "running" : "waiting");
    return [
      { label: "Reading XML data files", status: st(read, 1), count: `${Math.round(read * xmlFolder.files)} of ${xmlFolder.files} files`, value: read },
      { label: "Converting to DKLPO", status: st(conv, read), count: `${Math.round(conv * 5)} of 5 modules`, value: conv },
      { label: "Writing the dataset", status: st(write, conv), count: write >= 1 ? "38 files" : `${Math.round(write * 38)} of 38 files`, value: write },
      { label: "Checking", status: st(check, write), count: check >= 1 ? "6 suggestions" : check > 0 ? "lenient profile" : "", value: check },
    ];
  }
  const read = phase(0, 4), comp = phase(4, 5), check = phase(9, 4);
  const st = (p: number, prev: number): StepStatus => (p >= 1 ? "done" : prev >= 1 ? "running" : "waiting");
  return [
    { label: "Reading files", status: st(read, 1), count: read >= 1 ? `${job.files} files · 412 KB` : `${Math.round(read * job.files)} of ${job.files} files`, value: read },
    { label: "Compiling", status: st(comp, read), count: `${Math.round(comp * job.modules)} of ${job.modules} modules`, value: comp },
    { label: job.readOnly ? "Checking (read-only)" : "Checking", status: st(check, comp), count: check >= 1 ? "1 error, 2 preservation failures, 4 suggestions" : check > 0 ? "lenient profile" : "", value: check },
  ];
}
const jobDone = (job: Job) => jobSteps(job).every((s) => s.status === "done");

export function StartWindow({ mode, platform, initial = "recent", problem, interactive = true, width = 1440, height = 900, large }: {
  mode: E1Mode; platform: E1Platform; initial?: StartState; problem?: OpenProblem; interactive?: boolean; width?: number; height?: number; large?: boolean;
}) {
  const [list, setList] = useState<Recent[]>(initial === "first-run" ? [] : recents);
  const [sel, setSel] = useState<string | null>(initial === "missing" ? "glass-moors" : initial === "first-run" ? null : problemRow(problem) ?? "demo-skirmish");
  const [filter, setFilter] = useState("");
  const [removed, setRemoved] = useState<{ r: Recent; index: number } | null>(null);
  const [located, setLocated] = useState(false);
  const [drop, setDrop] = useState(false);
  const [dialog, setDialog] = useState<OpenProblem | null>(problem ?? null);
  const [job, setJob] = useState<Job | null>(initial === "opening" ? { kind: "open", title: "Demo Skirmish", path: recents[0].path[platform], files: 31, modules: 5, tick: 7, static: true } : null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const gridRef = useRef<HTMLDivElement>(null);
  const firstDialog = useRef(true);

  /* A dialog opened by the user takes the focus (its primary choice), so Return and Esc reach it; the starting state doesn't steal focus. */
  useEffect(() => {
    if (firstDialog.current) { firstDialog.current = false; return; }
    if (dialog) gridRef.current?.querySelector<HTMLElement>(".cg-dialog .d-btn.primary")?.focus();
  }, [dialog]);

  /* Job ticks (interactive jobs only; the `opening` state stays put for captures). */
  useEffect(() => {
    if (!job || job.static || jobDone(job)) return;
    const timer = window.setTimeout(() => setJob((j) => (j ? { ...j, tick: j.tick + 1 } : j)), 220);
    return () => window.clearTimeout(timer);
  }, [job]);

  const shown = list.map((r) => (r.id === "glass-moors" && located ? { ...r, missing: false, path: { mac: "/Volumes/Archive 2/glass-moors", windows: "F:\\Archive\\glass-moors" } } : r));
  const query = filter.trim().toLowerCase();
  const visible = query ? shown.filter((r) => r.title.toLowerCase().includes(query) || r.path[platform].toLowerCase().includes(query)) : shown;

  const startJob = (j: Omit<Job, "tick">) => { setDialog(null); setJob({ ...j, tick: 0 }); };
  const open = (r: Recent) => {
    if (r.missing) return;
    if (r.outcome && r.outcome !== "open") { setSel(r.id); setDialog(r.outcome); return; }
    startJob({ kind: "open", title: r.title, path: r.path[platform], readOnly: r.form !== "folder", files: r.files, modules: r.modules });
  };
  const remove = (id: string) => {
    const index = list.findIndex((r) => r.id === id);
    if (index < 0) return;
    setRemoved({ r: list[index], index });
    const next = list.filter((r) => r.id !== id);
    setList(next);
    setSel(next[Math.min(index, next.length - 1)]?.id ?? null);
  };
  const undo = () => {
    if (!removed) return;
    setList((current) => { const next = [...current]; next.splice(removed.index, 0, removed.r); return next; });
    setSel(removed.r.id); setRemoved(null);
  };
  const openFolder = () => setDialog("not-dataset");
  const convert = () => startJob({ kind: "convert", title: "skirmish-xml", path: xmlFolder[platform], files: xmlFolder.files, modules: 5 });
  const openSample = () => startJob({ kind: "open", title: "the Demo Skirmish sample", path: "Inside Field Cogitator", readOnly: true, files: 14, modules: 3 });
  const selected = visible.find((r) => r.id === sel);

  /* Keyboard: ↑ ↓ move, Enter opens, ⌘⌫ / Delete removes, ⌘Z undoes the removal, Esc cancels a dialog or a job, ⌘O opens a folder. */
  const onKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const mod = platform === "mac" ? event.metaKey : event.ctrlKey;
    if (event.key === "Escape") {
      if (dialog) { event.preventDefault(); setDialog(null); return; }
      if (job && !jobDone(job)) { event.preventDefault(); setJob(null); return; }
    }
    if (dialog) {
      if (event.key === "Enter" && (event.target as HTMLElement).tagName !== "BUTTON") { event.preventDefault(); primaryOf(dialog)(); }
      return;
    }
    if (job) return;
    if (mod && event.key.toLowerCase() === "o") { event.preventDefault(); openFolder(); return; }
    if (mod && event.key.toLowerCase() === "z" && removed) { event.preventDefault(); undo(); return; }
    if ((event.target as HTMLElement).tagName === "INPUT") return;
    if (!visible.length) return;
    const index = visible.findIndex((r) => r.id === sel);
    const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (step) {
      event.preventDefault();
      const next = visible[Math.min(visible.length - 1, Math.max(0, index + step))];
      setSel(next.id);
      requestAnimationFrame(() => rowRefs.current.get(next.id)?.focus());
      return;
    }
    if (event.key === "Enter" && selected) { event.preventDefault(); open(selected); return; }
    if (selected && ((platform === "mac" && event.metaKey && event.key === "Backspace") || (platform === "windows" && event.key === "Delete"))) { event.preventDefault(); remove(selected.id); }
  };

  /* ---------- The problems that stop a dataset opening as is ---------- */
  const problemDataset = list.find((r) => r.id === problemRow(dialog ?? undefined)) ?? recents.find((r) => r.id === problemRow(dialog ?? undefined));
  const primaryOf = (p: OpenProblem): (() => void) => {
    if (p === "not-dataset") return convert;
    const r = problemDataset!;
    if (p === "parse-errors") return () => startJob({ kind: "open", title: r.title, path: r.path[platform], files: r.files, modules: r.modules });
    return () => startJob({ kind: "open", title: r.title, path: r.path[platform], readOnly: true, files: r.files, modules: r.modules });
  };
  const close = () => setDialog(null);
  const dialogFor = (p: OpenProblem): ReactNode => {
    const r = problemDataset;
    const cancel: DlgAction = { label: "Cancel", cancel: true, onClick: close, title: "Close this and go back to the start window" };
    if (p === "not-dataset") {
      return (
        <Dialog platform={platform} tone="info" icon={<FolderSearch size={18} />} title="This folder isn’t a DKLPO dataset" target={xmlFolder[platform]}
          actions={[{ label: "Choose another folder…", left: true, onClick: close }, cancel, { label: "Convert…", kind: "primary", onClick: convert, title: "Make a new DKLPO dataset from the XML data files; they stay as they are" }]}>
          <p>Field Cogitator looked for a dataset manifest, <code>dataset.dkl</code>, at the top of the folder and found none.</p>
          <p>The folder holds {xmlFolder.files} XML data files (.gst, .cat). Convert them to make a new DKLPO dataset; the XML files aren’t changed.</p>
        </Dialog>
      );
    }
    if (p === "newer-format") {
      return (
        <Dialog platform={platform} tone="warn" icon={<FileWarning size={18} />} title={`${r?.title} was written for a newer DKLPO version`} target={r?.path[platform]}
          actions={[cancel, { label: "Open read-only", kind: "primary", onClick: primaryOf(p), title: "Open it without saving; parts written for 1.2 show as source text" }]}>
          <p>The dataset says <code>dklpo 1.2</code>; this build of Field Cogitator reads DKLPO 1.0.</p>
          <p>Read-only, what 1.2 added shows as source text and is left out of checks. Nothing is saved, so nothing written for 1.2 is lost. A newer Field Cogitator can edit it.</p>
        </Dialog>
      );
    }
    if (p === "parse-errors") {
      return (
        <Dialog platform={platform} tone="error" icon={<FileX size={18} />} title={`3 of ${r?.files} files in ${r?.title} don’t parse`} target={r?.path[platform]} width={500}
          actions={[cancel, { label: "Open anyway", kind: "primary", onClick: primaryOf(p), title: "Open the dataset; the 3 files open as source text with their errors" }]}>
          <ul className="cg-dialog-list" aria-label="Files that don't parse">
            <li><DiagIcon kind="error" size={13} /><span className="mono">harbour-guard/units.dkl:14</span><small>Expected <code>:</code> after the key <code>cost</code></small></li>
            <li><DiagIcon kind="error" size={13} /><span className="mono">harbour-guard/text/en.dkl:3</span><small>A string isn’t closed</small></li>
            <li><DiagIcon kind="error" size={13} /><span className="mono">reef-runners/module.dkl:1</span><small>Unknown header <code>catalog</code>; did you mean <code>catalogue</code>?</small></li>
          </ul>
          <p>Open anyway: these 3 files open as source text with their errors listed, and their entries are left out until they parse. The other {(r?.files ?? 0) - 3} files open as usual.</p>
        </Dialog>
      );
    }
    return (
      <Dialog platform={platform} tone="warn" icon={<Lock size={18} />} title="You can’t save to this folder" target={r?.path[platform]}
        actions={[cancel, { label: "Save as…", onClick: close, title: "Save a copy in a folder you can write to, and edit the copy" }, { label: "Open read-only", kind: "primary", onClick: primaryOf(p), title: "Open it without saving" }]}>
        <p>{r?.title} is in a folder you can read but not write to (permission denied).</p>
        <p>Open it read-only, or save a copy somewhere you can write to and edit the copy.</p>
      </Dialog>
    );
  };

  /* ---------- Sidebar: the app's actions ---------- */
  const app = <span className="e1s-app"><span className="d-ws-mark" aria-hidden>FC</span><span><strong>Field Cogitator</strong><small>No dataset open</small></span></span>;
  const side = (
    <aside className="d-side" aria-label="Start" inert={dialog ? true : undefined}>
      <div className="d-side-in" style={{ width: layout.sidebar }}>
        <div className="d-side-top">{platform === "mac" ? <TrafficLights /> : app}</div>
        {platform === "mac" ? app : null}
        <button type="button" className="d-item" onClick={openFolder} title="Open a dataset folder (one with dataset.dkl at its top)"><FolderOpen size={15} />Open folder…<kbd>{keyFor(platform, "⌘O", "Ctrl+O")}</kbd></button>
        <button type="button" className="d-item" onClick={openFolder} title="Open a .dkl file or a dataset archive (.zip)"><FileInput size={15} />Open file…<kbd>{keyFor(platform, "⇧⌘O", "Ctrl+Shift+O")}</kbd></button>
        <button type="button" className="d-item" onClick={convert} title="Pick a folder of XML data files (.gst, .cat) and make a DKLPO dataset from it"><ArrowRightLeft size={15} />Convert from XML data…</button>
        <h3>More</h3>
        <button type="button" className="d-item" onClick={openSample} title="Open the Demo Skirmish sample that ships with the app (read-only)"><BookOpen size={15} />Open the sample dataset</button>
        <button type="button" className="d-item" title="Open the settings window"><Settings size={15} />Settings…<kbd>{keyFor(platform, "⌘,", "Ctrl+,")}</kbd></button>
        <footer className="d-side-foot">DKLPO 1.0 · engine 0.14.0</footer>
      </div>
    </aside>
  );

  /* ---------- Main pane ---------- */
  const caption = platform === "windows" ? <WinCaption /> : null;
  let main: ReactNode;
  if (job) {
    const steps = jobSteps(job);
    const done = steps.every((s) => s.status === "done");
    const verb = job.kind === "convert" ? "Converting" : "Opening";
    main = (
      <>
        <header className="e1s-top"><Col top><strong>{done ? (job.kind === "convert" ? `Converted ${job.title}` : `Opened ${job.title}`) : `${verb} ${job.title}${job.readOnly ? " read-only" : ""}`}</strong></Col>{caption}</header>
        <div className="e1s-body">
          <Col><section className="e1s-job" style={{ maxWidth: layout.pageMax }} aria-label={`${verb} ${job.title}`} aria-live="polite">
            <p className="e1s-job-path">{job.kind === "convert" ? <>From <span className="mono">{job.path}</span> to <span className="mono">{job.path}-dklpo</span></> : <span className="mono">{job.path}</span>}</p>
            <div className="e1s-steps">{steps.map((s) => <ProgressRow key={s.label} status={s.status} label={s.label} count={s.count} value={s.value} />)}</div>
            {done ? (
              <>
                <p className="e1s-job-note">{job.kind === "convert" ? "The new dataset opens in the editor; the conversion report is in the helper panel." : "The dataset opens in the editor (Direction D)."} This mock stops here.</p>
                <span className="e1s-job-actions"><button type="button" className="d-btn" onClick={() => setJob(null)}>Back to the start window</button></span>
              </>
            ) : (
              <>
                <p className="e1s-job-note">{job.kind === "convert" ? "The XML data files aren’t changed. Cancel removes the half-written dataset." : "Nothing is written while a dataset opens. Cancel goes back to the list."}</p>
                <span className="e1s-job-actions"><button type="button" className="d-btn" onClick={() => setJob(null)}>Cancel {job.kind === "convert" ? "converting" : "opening"}<kbd>Esc</kbd></button></span>
              </>
            )}
          </section></Col>
        </div>
      </>
    );
  } else if (!list.length && !removed) {
    main = (
      <>
        <header className="e1s-top"><Col top><strong>Recent datasets</strong></Col>{caption}</header>
        <div className="e1s-body">
          <Col><section className="e1s-empty" style={{ maxWidth: layout.pageMax }} aria-label="Get started">
            <h2>No recent datasets yet</h2>
            <p>Open a dataset folder, a <code>.dkl</code> file or a dataset archive, or convert XML data files into a new dataset. Datasets you open are listed here.</p>
            <div className="e1s-starts">
              <StartAction icon={<FolderOpen size={18} />} verb="Open folder…" what="A folder with dataset.dkl at its top" k={keyFor(platform, "⌘O", "Ctrl+O")} onClick={openFolder} />
              <StartAction icon={<FileInput size={18} />} verb="Open file…" what="A .dkl file, or a dataset archive (.zip)" k={keyFor(platform, "⇧⌘O", "Ctrl+Shift+O")} onClick={openFolder} />
              <StartAction icon={<ArrowRightLeft size={18} />} verb="Convert from XML data…" what="A folder of XML data files (.gst, .cat) becomes a new DKLPO dataset" onClick={convert} />
              <StartAction icon={<BookOpen size={18} />} verb="Open the sample dataset" what="Demo Skirmish, read-only, ships with the app" onClick={openSample} />
            </div>
            <DropTarget drop={drop} setDrop={setDrop} tall onDrop={openFolder} />
          </section></Col>
        </div>
      </>
    );
  } else {
    main = (
      <>
        <header className="e1s-top">
          <Col top>
          <strong>Recent datasets</strong><span className="d-muted">{list.length}</span>
          <span className="d-spacer" />
          <label className="d-filter e1s-filter" style={{ maxWidth: layout.sourceListMin }}>
            <Search size={13} />
            <input value={filter} placeholder="Filter by name or folder" aria-label="Filter recent datasets" onChange={(event) => setFilter(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Escape" && filter) { event.stopPropagation(); setFilter(""); } }} />
          </label>
          </Col>
          {caption}
        </header>
        <div className="e1s-body">
          <Col>
          <RecentHeads />
          <div className="e1s-list" role="listbox" aria-label="Recent datasets">
            {visible.length ? visible.map((r) => (
              <RecentRow key={r.id} r={r} platform={platform} selected={r.id === sel} onSelect={() => setSel(r.id)} onOpen={() => open(r)}
                rowRef={(el) => { if (el) rowRefs.current.set(r.id, el); else rowRefs.current.delete(r.id); }}
                more={<RowMore r={r} platform={platform} onOpen={() => open(r)} onRemove={() => remove(r.id)} onLocate={() => setLocated(true)} />} />
            )) : <p className="d-empty">No recent dataset matches “{filter}”. <button type="button" onClick={() => setFilter("")}>Clear filter</button></p>}
          </div>
          <DropTarget drop={drop} setDrop={setDrop} onDrop={openFolder} />
          </Col>
        </div>
        <footer className="e1s-foot" aria-live="polite">
          {removed ? (
            <>Removed {removed.r.title} from the list; the folder isn’t touched.<button type="button" className="e1s-link" onClick={undo}>Undo</button><kbd>{keyFor(platform, "⌘Z", "Ctrl+Z")}</kbd></>
          ) : (
            <><kbd>↑</kbd><kbd>↓</kbd> move <kbd>{keyFor(platform, "↵", "Enter")}</kbd> open <kbd>{keyFor(platform, "⌘⌫", "Delete")}</kbd> remove from the list</>
          )}
          <span className="d-spacer" />
          {list.length} of up to 10 recent datasets
        </footer>
      </>
    );
  }

  return (
    <E1Window mode={mode} platform={platform} width={width} height={height} large={large} label="Field Cogitator start window" className={interactive ? "" : "static"}>
      <div ref={gridRef} className="e1s-grid" style={{ gridTemplateColumns: `${layout.sidebar}px minmax(0, 1fr)` }} onKeyDown={onKey}>
        {side}
        <main className="e1s-main" aria-label="Recent datasets" inert={dialog ? true : undefined}>{main}</main>
        {dialog ? <div className="cg-scrim" onClick={(event) => { if (event.target === event.currentTarget) setDialog(null); }}>{dialogFor(dialog)}</div> : null}
      </div>
    </E1Window>
  );
}

/** The list keeps to the minimum window's width at any window size, left-aligned, so its columns stay close together and the title row lines up with it. */
function Col({ children, top }: { children: ReactNode; top?: boolean }) {
  return <div className={`e1s-col${top ? " e1s-top-in" : ""}`} style={{ maxWidth: layout.windowMin }}>{children}</div>;
}

const problemRow = (p?: OpenProblem) => (p === "newer-format" ? "copper-vale" : p === "parse-errors" ? "tidewater" : p === "permission" ? "team-demo" : undefined);

function StartAction({ icon, verb, what, k, onClick }: { icon: ReactNode; verb: string; what: string; k?: string; onClick: () => void }) {
  return (
    <button type="button" className="e1s-start" onClick={onClick}>
      {icon}<span><strong>{verb}</strong><small>{what}</small></span>{k ? <kbd>{k}</kbd> : null}
    </button>
  );
}

function DropTarget({ drop, setDrop, tall, onDrop }: { drop: boolean; setDrop: (v: boolean) => void; tall?: boolean; onDrop: () => void }) {
  return (
    <div className={`cg-drop e1s-drop${drop ? " over" : ""}${tall ? " tall" : ""}`}
      onDragOver={(event) => { event.preventDefault(); setDrop(true); }} onDragLeave={() => setDrop(false)} onDrop={(event) => { event.preventDefault(); setDrop(false); onDrop(); }}>
      <Upload size={16} />{drop ? "Drop to open" : "Drop a dataset folder or a .zip archive here to open it"}
    </div>
  );
}

/** The selected row's second line: last check and actions, or what happened to a missing dataset. */
function RowMore({ r, platform, onOpen, onRemove, onLocate }: { r: Recent; platform: E1Platform; onOpen: () => void; onRemove: () => void; onLocate: () => void }) {
  const removeBtn = <button type="button" className="d-btn sm" onClick={(event) => { event.stopPropagation(); onRemove(); }} title="Remove from this list; the folder isn’t touched">Remove from the list<kbd>{keyFor(platform, "⌘⌫", "Delete")}</kbd></button>;
  if (r.missing) {
    return (
      <>
        <span className="e1s-missing-note">Not found at <span className="mono">{r.path[platform]}</span>. The drive may not be connected, or the folder was moved or renamed.</span>
        <span className="cg-recent-actions">
          <button type="button" className="d-btn primary sm" onClick={(event) => { event.stopPropagation(); onLocate(); }} title="Choose where the dataset is now">Locate…</button>
          {removeBtn}
        </span>
      </>
    );
  }
  return (
    <>
      {r.lastCheck ? <CheckCounts counts={r.lastCheck.counts} when={r.lastCheck.when} /> : <span className="cg-recent-check">Not checked yet</span>}
      {r.form === "archive" ? <span className="cg-recent-check">An archive opens read-only; Save as… writes a folder you can edit.</span> : null}
      {r.dklpo !== "1.0" ? <span className="cg-recent-check">Written for DKLPO {r.dklpo}; this build reads 1.0.</span> : null}
      <span className="cg-recent-actions">
        <button type="button" className="d-btn primary sm" onClick={(event) => { event.stopPropagation(); onOpen(); }} title={`Open ${r.title}`}>{r.form === "folder" ? "Open" : "Open read-only"}<kbd>{keyFor(platform, "↵", "Enter")}</kbd></button>
        {r.form !== "sample" ? <button type="button" className="d-btn sm" onClick={(event) => event.stopPropagation()} title={`Show the folder in ${platform === "mac" ? "Finder" : "File Explorer"}`}>{platform === "mac" ? "Show in Finder" : "Show in Explorer"}</button> : null}
        {removeBtn}
      </span>
    </>
  );
}
