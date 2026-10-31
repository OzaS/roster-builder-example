import { useState, type ReactNode } from "react";
import { Archive, ArrowLeft, Bell, Check, ChevronDown, ChevronRight, Circle, CircleArrowUp, CircleCheck, Clock, Copy, Database, Download, Ellipsis, FileArchive, FileInput, FileText, FolderGit2, FolderOpen, Globe, Hand, History, Info, Library, ListChecks, LoaderCircle, Lock, Minus, OctagonAlert, Plus, RefreshCw, Search, Star, Trash2, TextCursorInput, TriangleAlert, Upload, Wifi, X } from "lucide-react";
import type { ConceptProps } from "../shared";
import { Chip } from "./uxShared";

/*
 * Source data and background jobs (Battle Augur plan 2D, DEC-022/023).
 * All names are invented placeholders (DEC-001): game systems, factions and
 * repositories come from user-downloaded data at runtime.
 */

export const EXAMPLE_SYSTEM = { name: "Example System One", repo: "example-org/example-system-one", version: "a1b2c3d · 2026-10-12" };
export const EXAMPLE_FACTIONS = ["Northern Realms", "Ember Covenant", "Glass Legion", "Tidewardens", "Ashen Court", "Verdant Host", "Iron Choir", "Salt Kings", "Lantern Guild", "Hollow Crown"];

// ---------------------------------------------------------------- job modal

export type JobStepState = "done" | "active" | "waiting" | "needs" | "failed";
export type JobStep = { id: string; title: string; detail?: string; state: JobStepState; progress?: number; expandable?: string };
export type JobOutcome = "done" | "updated" | "failed" | "cancelled";

function StepIcon({ state }: { state: JobStepState }) {
  if (state === "done") return <CircleCheck size={18} className="ux-job-step-icon ok" aria-label="Done" />;
  if (state === "active") return <LoaderCircle size={18} className="ux-job-step-icon accent ux-spin" aria-label="In progress" />;
  if (state === "needs") return <Hand size={18} className="ux-job-step-icon accent" aria-label="Needs you" />;
  if (state === "failed") return <OctagonAlert size={18} className="ux-job-step-icon err" aria-label="Failed" />;
  return <Circle size={18} className="ux-job-step-icon muted" aria-label="Waiting" />;
}

export function JobProgressBar({ value, tone = "accent" }: { value?: number; tone?: "accent" | "ok" | "err" }) {
  return (
    <div className={`ux-job-bar ${tone} ${value === undefined ? "indeterminate" : ""}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value === undefined ? undefined : Math.round(value * 100)}>
      <span style={value === undefined ? undefined : { width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}

export function JobSteps({ steps }: { steps: JobStep[] }) {
  return (
    <ol className="ux-job-steps">
      {steps.map((step) => (
        <li key={step.id} className={`ux-job-step ${step.state}`}>
          <StepIcon state={step.state} />
          <span>
            <strong>{step.title}</strong>
            {step.detail ? <small>{step.detail}</small> : null}
            {step.state === "active" ? <JobProgressBar value={step.progress} /> : null}
            {step.expandable ? <button type="button" className="ux-job-link">{step.expandable}<ChevronDown size={13} /></button> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function JobOutcomeNotice({ outcome, title, body }: { outcome: JobOutcome; title: string; body: string }) {
  const tone = outcome === "failed" ? "error" : outcome === "cancelled" ? "info" : "ok";
  return (
    <div className={`ux-job-notice ${tone}`} role="status">
      {outcome === "failed" ? <OctagonAlert size={18} /> : outcome === "cancelled" ? <Circle size={18} /> : <CircleCheck size={18} />}
      <span><strong>{title}</strong><small>{body}</small></span>
    </div>
  );
}

export type OtherJob = { title: string; detail: string; percent?: number; waiting?: boolean; ended?: "done" | "failed" | "cancelled" };

/** The other running or waiting jobs, collapsed under the expanded one (several jobs at once, DEC-024). */
export function OtherJobs({ jobs }: { jobs: OtherJob[] }) {
  return (
    <div className="ux-job-others">
      <div className="ux-result-label">Other jobs</div>
      {jobs.map((job) => (
        <div key={job.title} className={`ux-job-other ${job.waiting ? "waiting" : ""} ${job.ended ?? ""}`}>
          {job.ended === "done" ? <CircleCheck size={16} aria-label="Done" /> : job.ended === "failed" ? <OctagonAlert size={16} aria-label="Failed" /> : job.ended === "cancelled" ? <X size={16} aria-label="Cancelled" /> : job.waiting ? <Clock size={16} aria-label="Waiting" /> : <LoaderCircle size={16} className="ux-spin" aria-label="In progress" />}
          <button type="button" className="ux-job-other-main" aria-label={`${job.title}, ${job.detail}. Show its steps.`}>
            <strong>{job.title}{job.percent === undefined || job.ended ? "" : ` · ${job.percent}%`}</strong>
            <small>{job.detail}</small>
            {job.waiting || job.ended ? null : <JobProgressBar value={job.percent === undefined ? undefined : job.percent / 100} />}
          </button>
          {job.ended ? null : <button type="button" className="ux-job-other-cancel" aria-label={`Cancel ${job.title}`}><X size={14} /></button>}
        </div>
      ))}
    </div>
  );
}

/** Asks for the notification permission in context, the first time a job is shown (DEC-024). */
export function NotifyRow() {
  return <button type="button" className="ux-job-notify"><Bell size={15} /><span>Notify me when it finishes</span><ChevronRight size={14} /></button>;
}

/** First download on mobile data: makes the off-by-default Wi-Fi-only setting known (shown once). */
export function MobileDataNotice() {
  return (
    <div className="ux-job-notice info" role="status">
      <Info size={18} />
      <span><strong>Using mobile data · 18.0 MB</strong><small>You can limit downloads to Wi-Fi in Settings.</small></span>
      <div className="ux-src-inline-actions"><button type="button" className="ux-job-link">Not now</button><button type="button" className="ux-job-btn">Wi-Fi only</button></div>
    </div>
  );
}

export function WifiWaitNotice() {
  return (
    <div className="ux-job-notice info" role="status">
      <Wifi size={18} />
      <span><strong>Waiting for Wi-Fi</strong><small>Download on Wi-Fi only is on. The install starts by itself when Wi-Fi is back.</small></span>
      <button type="button" className="ux-job-btn">Download now</button>
    </div>
  );
}

/** The hideable job sheet (native form sheet, large detent). Swipe down or Hide keeps the job running. */
export function JobModal({
  title,
  subtitle,
  percent,
  stepLabel,
  steps,
  others = [],
  overall,
  notify = false,
  outcome,
  notice,
  footer,
  children,
  inline = false,
}: {
  title: string;
  subtitle: string;
  percent?: number;
  stepLabel?: string;
  steps: JobStep[];
  others?: OtherJob[];
  overall?: number;
  notify?: boolean;
  outcome?: JobOutcome;
  notice?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  inline?: boolean;
}) {
  const several = others.length > 0;
  const body = (
    <>
      {percent !== undefined && !outcome ? (
        <div className="ux-job-overall">
          <JobProgressBar value={percent / 100} />
          <small>{percent}% · {stepLabel}</small>
        </div>
      ) : null}
      {notice}
      {children ?? <JobSteps steps={steps} />}
    </>
  );
  const sheet = (
    <section className={`ux-job-sheet ${inline ? "inline" : ""}`} role="dialog" aria-label={several ? `${others.length + 1} jobs` : title}>
      <span className="ux-sheet-grip" aria-hidden />
      <header className="ux-job-head">
        {several ? <span><strong>{others.length + 1} jobs</strong><small>{overall}% overall</small></span> : <span><strong>{title}</strong><small>{subtitle}</small></span>}
        {outcome ? <button type="button" className="ux-icon-btn" aria-label="Close"><X size={17} /></button> : <button type="button" className="ux-job-hide" aria-label="Hide. The work continues."><ChevronDown size={16} />Hide</button>}
      </header>
      {several ? (
        <section className="ux-job-card">
          <header className="ux-job-head"><span><strong>{title}</strong><small>{subtitle}</small></span><ChevronDown size={16} aria-hidden /></header>
          {body}
        </section>
      ) : body}
      {several ? <OtherJobs jobs={others} /> : null}
      {notify && !outcome ? <NotifyRow /> : null}
      <footer className="ux-job-footer">
        {footer ?? (
          <>
            <button type="button" className="ux-job-btn destructive">Cancel install</button>
            <button type="button" className="ux-job-btn secondary"><ChevronDown size={15} />Hide</button>
          </>
        )}
      </footer>
    </section>
  );
  if (inline) return sheet;
  return <div className="ux-job-scrim">{sheet}</div>;
}

// ---------------------------------------------------------------- indicator and toasts

/** Global job indicator: a floating pill above the tab bar (or the bottom safe area). Tap reopens the modal. */
export function JobPill({ label, percent, count = 1, needsYou = false, wifi = false, inline = false }: { label: string; percent?: number; count?: number; needsYou?: boolean; wifi?: boolean; inline?: boolean }) {
  const ring = percent === undefined ? undefined : { background: `conic-gradient(var(--ux-accent) ${percent * 3.6}deg, var(--ux-surface-3) 0)` };
  const text = count > 1 ? (percent === undefined ? "" : `${percent}%`) : `${label}${percent === undefined ? "" : ` · ${percent}%`}`;
  return (
    <button type="button" className={`ux-job-pill ${needsYou ? "needs" : ""} ${inline ? "inline" : ""}`} aria-label={`${count > 1 ? `${count} jobs` : label}${percent === undefined ? "" : `, ${percent} percent`}. Opens the progress.`}>
      {needsYou ? <Hand size={15} /> : wifi ? <Wifi size={15} /> : <span className="ux-job-ring" style={ring}><span /></span>}
      {count > 1 ? <b>{count} jobs</b> : null}
      <span>{text}</span>
      <ChevronRight size={14} />
    </button>
  );
}

export function JobToast({ tone, message, action }: { tone: "ok" | "err" | "neutral"; message: string; action?: string }) {
  return (
    <div className={`ux-job-toast ${tone}`} role="status">
      {tone === "ok" ? <CircleCheck size={17} /> : tone === "err" ? <OctagonAlert size={17} /> : null}
      <span>{message}</span>
      {action ? <button type="button">{action}</button> : null}
    </div>
  );
}

/** What the OS shows while a job runs in the background and when it ends (DEC-024; APIs are Inference until 2E). */
export function OsJobNotifications() {
  return (
    <div className="ux-os-notes">
      <small className="ux-os-label">iOS 26 · system progress (continued-processing task)</small>
      <div className="ux-os-note"><span className="ux-os-app" aria-hidden><Database size={14} /></span><span><strong>Installing {EXAMPLE_SYSTEM.name}</strong><small>Import · Faction 7 of 23</small><JobProgressBar value={0.46} /></span><button type="button">Cancel</button></div>
      <small className="ux-os-label">Android · ongoing notification (foreground service)</small>
      <div className="ux-os-note"><span className="ux-os-app" aria-hidden><Database size={14} /></span><span><strong>2 jobs · 38%</strong><small>Battle Augur · Installing {EXAMPLE_SYSTEM.name}</small><JobProgressBar value={0.38} /></span><button type="button">Cancel</button></div>
      <small className="ux-os-label">When a job ends in the background (local notification)</small>
      <div className="ux-os-note"><span className="ux-os-app" aria-hidden><Database size={14} /></span><span><strong>Installed {EXAMPLE_SYSTEM.name}</strong><small>23 factions · 41 MB. Tap to view.</small></span></div>
      <div className="ux-os-note"><span className="ux-os-app" aria-hidden><Database size={14} /></span><span><strong>Updated Example System Two · 1 roster changed</strong><small>Tap to see the update report.</small></span></div>
    </div>
  );
}

// ---------------------------------------------------------------- shared step sets

export function installSteps(stage: "download" | "import" | "failed" | "done", importDone = 7): JobStep[] {
  const total = 23;
  const at = (id: string): JobStepState => {
    const order = ["download", "read", "import", "write"];
    if (stage === "done") return "done";
    if (stage === "failed") return id === "import" ? "failed" : order.indexOf(id) < 2 ? "done" : "waiting";
    const cur = order.indexOf(stage);
    const i = order.indexOf(id);
    return i < cur ? "done" : i === cur ? "active" : "waiting";
  };
  return [
    { id: "download", title: "Download", detail: stage === "download" ? "12.4 MB of 18.0 MB" : "18.0 MB", state: at("download"), progress: 0.69 },
    { id: "read", title: "Read", detail: at("read") === "done" ? "412 files" : undefined, state: at("read") },
    { id: "import", title: "Import", detail: stage === "import" ? `Faction ${importDone} of ${total} · ${EXAMPLE_FACTIONS[3]}` : stage === "failed" ? `Stopped at faction ${importDone} of ${total}` : stage === "done" ? `${total} factions` : undefined, state: at("import"), progress: importDone / total, expandable: stage === "import" ? `Show factions (${total})` : undefined },
    { id: "write", title: "Write", state: at("write") },
  ];
}

// ---------------------------------------------------------------- advanced installation (plan 2B)

/** Settings → Rosters → Remember option sections (UX-005, DEC-035; a user preference, on by default). */
export function RememberSectionsSetting({ on, onToggle }: { on: boolean; onToggle?: () => void }) {
  return (
    <button type="button" className={`ux-setting-row ${on ? "on" : ""}`} role="switch" aria-checked={on} onClick={onToggle}>
      <span className="ux-setting-icon"><ChevronDown size={17} /></span>
      <span className="ux-setting-text"><strong>Remember option sections</strong><small>Reopen a unit's option sections as you left them. Off: every visit starts folded; you can still open sections while you are there.</small></span>
      <span className="ux-switch" aria-hidden />
    </button>
  );
}

/**
 * Settings → Advanced → Focus search when opening the catalogue (DEC-050, UX-059; a user preference, off by default). Off: Add
 * unit opens the catalogue for browsing, so the on-screen keyboard does not cover the list. `keys`: the platform's find shortcut,
 * named only where the platform has one (phone without a keyboard: left out).
 */
export function FocusCatalogueSearchSetting({ on, onToggle, keys }: { on: boolean; onToggle?: () => void; keys?: string }) {
  return (
    <button type="button" className={`ux-setting-row ${on ? "on" : ""}`} role="switch" aria-checked={on} onClick={onToggle}>
      <span className="ux-setting-icon"><TextCursorInput size={17} /></span>
      <span className="ux-setting-text"><strong>Focus search when opening the catalogue</strong><small>Off: Add unit opens the catalogue for browsing.{keys ? ` ${keys} always focuses the search.` : " The keyboard appears when you tap the search."}</small></span>
      <span className="ux-switch" aria-hidden />
    </button>
  );
}

/** Settings → Game data → Advanced installation (a user preference, off by default). */
export function AdvancedInstallSetting({ on, onToggle }: { on: boolean; onToggle?: () => void }) {
  return (
    <button type="button" className={`ux-setting-row ${on ? "on" : ""}`} role="switch" aria-checked={on} onClick={onToggle}>
      <span className="ux-setting-icon"><ListChecks size={17} /></span>
      <span className="ux-setting-text"><strong>Advanced installation</strong><small>Choose which factions to install when you add game data. Off: everything is installed.</small></span>
      <span className="ux-switch" aria-hidden />
    </button>
  );
}

const PICKER_FACTIONS = EXAMPLE_FACTIONS.map((name, index) => ({ name, documents: 1 + (index % 3), size: `${(0.4 + index * 0.17).toFixed(1)} MB`, installed: index === 2 }));

/** The faction picker shown in the job sheet at "Choose factions" (Advanced installation on). */
export function FactionPicker({ initial = ["Northern Realms", "Tidewardens"] }: { initial?: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial);
  const choosable = PICKER_FACTIONS.filter((f) => !f.installed).map((f) => f.name);
  const all = choosable.every((name) => selected.includes(name));
  const some = selected.length > 0 && !all;
  const toggle = (name: string) => setSelected((cur) => (cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]));
  return (
    <div className="ux-fp">
      <div className="ux-fp-head"><strong>Choose factions</strong><small>Only the factions you pick are installed, with the shared data they need.</small></div>
      <button type="button" className={`ux-fp-all ${all ? "all" : some ? "some" : ""}`} role="checkbox" aria-checked={all ? true : some ? "mixed" : false} onClick={() => setSelected(all ? [] : choosable)}>
        <span className="ux-src-check" aria-hidden>{all ? <Check size={14} /> : some ? <Minus size={14} /> : null}</span>
        <strong>{all ? "Deselect all" : "Select all"}</strong>
        <small>{selected.length} of {choosable.length} selected</small>
      </button>
      <div className="ux-col-search"><Search size={15} /><input aria-label="Search factions" placeholder="Search factions" /></div>
      <div className="ux-fp-list">
        {PICKER_FACTIONS.map((f) => {
          const on = selected.includes(f.name);
          return (
            <button key={f.name} type="button" className={`ux-fp-row ${on ? "selected" : ""} ${f.installed ? "installed" : ""}`} role="checkbox" aria-checked={on || f.installed} disabled={f.installed} onClick={() => toggle(f.name)}>
              <span className="ux-src-check" aria-hidden>{on || f.installed ? <Check size={14} /> : null}</span>
              <span><strong>{f.name}</strong><small>{f.documents} {f.documents === 1 ? "document" : "documents"} · {f.size}</small></span>
              {f.installed ? <Chip tone="valid">Installed</Chip> : null}
            </button>
          );
        })}
      </div>
      <footer className="ux-job-footer">
        <button type="button" className="ux-job-btn destructive">Cancel install</button>
        <button type="button" className="ux-job-btn primary" disabled={selected.length === 0}>{selected.length === 0 ? "Select factions to install" : `Install ${selected.length} ${selected.length === 1 ? "faction" : "factions"}`}</button>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------- gallery screen: install job

type InstallPreview = "running" | "hidden" | "several" | "several-hidden" | "mobile-data" | "wifi" | "background" | "choose" | "choose-hidden" | "done" | "updated" | "failed" | "cancelled" | "toasts" | "local" | "local-done" | "local-failed";

const INSTALL_PREVIEWS: Array<[InstallPreview, string]> = [
  ["running", "Running"],
  ["hidden", "Hidden"],
  ["several", "2 jobs"],
  ["several-hidden", "2 jobs hidden"],
  ["mobile-data", "Mobile data"],
  ["wifi", "Waiting for Wi-Fi"],
  ["background", "In the background"],
  ["choose", "Choose factions"],
  ["choose-hidden", "Needs you"],
  ["done", "Done"],
  ["updated", "Updated"],
  ["failed", "Failed"],
  ["cancelled", "Cancelled"],
  ["toasts", "Toasts"],
  ["local", "From a file"],
  ["local-done", "From a file · done"],
  ["local-failed", "From a file · errors"],
];

export function PreviewState<T extends string>({ label = "Preview state", value, options, onChange }: { label?: string; value: T; options: Array<[T, string]>; onChange: (value: T) => void }) {
  return (
    <div className="ux-prototype-state ux-job-preview" aria-label={label}>
      <small>{label}</small>
      <div>{options.map(([id, text]) => <button key={id} type="button" className={value === id ? "active" : ""} onClick={() => onChange(id)}>{text}</button>)}</div>
    </div>
  );
}

/** A compact Sources list behind the job sheet (the screen that started the job). */
function SourcesBackdrop({ props, children }: { props: ConceptProps; children?: ReactNode }) {
  return (
    <>
      <header className="ux-wb-top ux-wb-home-top reversed">
        <button type="button" className="ux-icon-btn" aria-label="Back" onClick={props.onBack}><ArrowLeft size={18} /></button>
        <div className="ux-wb-title"><strong>Sources</strong><small>Installed game data</small></div>
      </header>
      <div className="ux-wb-home-body ux-sources-body ux-src-body ux-job-backdrop">
        {children}
        <button type="button" className="ux-add-source-primary" onClick={() => props.onNavigate("add-source")}>
          <Plus size={18} /><span><strong>Add game data</strong><small>Collections, a repository link, or GitHub search</small></span><ChevronRight size={17} />
        </button>
        <div className="ux-result-label">Installed</div>
        <div className="ux-source-list ux-managed-source-list">
          <article className="ux-source-row on"><span><strong>Example System Two</strong><small>14 factions · Installed 3 days ago · e4f5a6b</small></span><Chip tone="valid">Ready</Chip></article>
          <article className="ux-source-row"><span><strong>{EXAMPLE_SYSTEM.name}</strong><small>Installing · 7 of 23 factions</small></span><Chip tone="cool">Installing</Chip></article>
        </div>
      </div>
    </>
  );
}

export function InstallJobScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<InstallPreview>("running");
  const [localError, setLocalError] = useState<LocalError>("too-large");
  const control = <PreviewState value={preview} options={INSTALL_PREVIEWS} onChange={setPreview} />;
  const subtitle = `${EXAMPLE_SYSTEM.repo} · ${EXAMPLE_SYSTEM.version}`;
  const title = `Installing ${EXAMPLE_SYSTEM.name}`;
  if (preview === "choose-hidden") {
    return (
      <>
        <SourcesBackdrop props={props}>{control}</SourcesBackdrop>
        <div className="ux-job-float"><JobPill needsYou label={`Choose factions for ${EXAMPLE_SYSTEM.name}`} /></div>
      </>
    );
  }
  if (preview === "choose") {
    return (
      <>
        <SourcesBackdrop props={props}>{control}</SourcesBackdrop>
        <div className="ux-job-scrim">
          <section className="ux-job-sheet tall" role="dialog" aria-label={title}>
            <span className="ux-sheet-grip" aria-hidden />
            <header className="ux-job-head"><span><strong>{title}</strong><small>{subtitle}</small></span><button type="button" className="ux-job-hide" aria-label="Hide. The install waits for your choice."><ChevronDown size={16} />Hide</button></header>
            <JobSteps steps={[{ id: "download", title: "Download", detail: "18.0 MB", state: "done" }, { id: "read", title: "Read", detail: "412 files", state: "done" }, { id: "choose", title: "Choose factions", detail: "Waiting for you", state: "needs" }]} />
            <FactionPicker />
          </section>
        </div>
      </>
    );
  }
  if (preview === "background") {
    return (
      <>
        <SourcesBackdrop props={props}>{control}</SourcesBackdrop>
        <div className="ux-os-stage"><span className="ux-os-clock">9:41</span><OsJobNotifications /></div>
      </>
    );
  }
  if (preview === "hidden" || preview === "several-hidden" || preview === "toasts") {
    return (
      <>
        <SourcesBackdrop props={props}>{control}</SourcesBackdrop>
        <div className="ux-job-float">
          {preview === "toasts" ? (
            <>
              <JobToast tone="neutral" message="Using mobile data · 18.0 MB. You can limit downloads to Wi-Fi in Settings." action="Wi-Fi only" />
              <JobToast tone="err" message={`Could not install ${EXAMPLE_SYSTEM.name}`} action="Details" />
              <JobToast tone="ok" message="Updated Example System Two" action="Check rosters" />
              <JobToast tone="ok" message={`Installed ${EXAMPLE_SYSTEM.name}`} action="View" />
            </>
          ) : preview === "several-hidden" ? <JobPill label={`Installing ${EXAMPLE_SYSTEM.name}`} percent={38} count={2} /> : <JobPill label={`Installing ${EXAMPLE_SYSTEM.name}`} percent={46} />}
        </div>
      </>
    );
  }
  let modal: ReactNode;
  // DS-3: a job from files on the phone. No repository or version under the title, "Copying files" in place of
  // Download; Cancel discards everything. Ended, it offers no Try again (the picked files are gone).
  const localTitle = `Installing ${LOCAL_FILE.label}`;
  const localSubtitle = `From a file · ${LOCAL_FILE.files} files · ${LOCAL_FILE.size}`;
  if (preview === "local") {
    modal = <JobModal title={localTitle} subtitle={localSubtitle} percent={8} stepLabel="Step 1 of 4" steps={localSteps("files")} notify />;
  } else if (preview === "local-done") {
    modal = (
      <JobModal title={`Installing ${LOCAL_SOURCE.name}`} subtitle={`From a file · ${LOCAL_FILE.label}`} steps={localSteps("done")} outcome="done"
        notice={<JobOutcomeNotice outcome="done" title={`Installed ${LOCAL_SOURCE.name}`} body="9 factions. Ready to use. It replaced the data installed from a file before; rosters use the new data." />}
        footer={<><button type="button" className="ux-job-btn secondary">View</button><button type="button" className="ux-job-btn primary">Done</button></>} />
    );
  } else if (preview === "local-failed") {
    modal = (
      <JobModal title={`Could not install ${LOCAL_FILE.label}`} subtitle={localSubtitle} steps={localSteps("failed")} outcome="failed"
        notice={<><PreviewState label="Error" value={localError} options={LOCAL_ERRORS.map(([id, label]) => [id, label] as [LocalError, string])} onChange={setLocalError} /><LocalImportError kind={localError} /></>}
        footer={<button type="button" className="ux-job-btn primary">Close</button>} />
    );
  } else if (preview === "running") {
    modal = <JobModal title={title} subtitle={subtitle} percent={46} stepLabel="Step 3 of 4" steps={installSteps("import")} notify />;
  } else if (preview === "several") {
    modal = <JobModal title={title} subtitle={subtitle} percent={46} stepLabel="Step 3 of 4" steps={installSteps("import")} overall={38} others={[{ title: "Updating Example System Two", detail: "Download · 4.1 MB of 29 MB", percent: 14 }, { title: "Installing Example System Three", detail: "Waiting for another install", waiting: true }, { title: "Installed Example System Four", detail: "12 factions. Ready to use.", ended: "done" }]} />;
  } else if (preview === "mobile-data") {
    modal = <JobModal title={title} subtitle={subtitle} percent={8} stepLabel="Step 1 of 4" steps={installSteps("download")} notice={<MobileDataNotice />} />;
  } else if (preview === "wifi") {
    modal = <JobModal title={title} subtitle={subtitle} steps={installSteps("download").map((s) => (s.id === "download" ? { ...s, state: "waiting", detail: "Waiting for Wi-Fi · 18.0 MB" } : s))} notice={<WifiWaitNotice />} />;
  } else if (preview === "updated") {
    modal = (
      <JobModal title={`Updating ${EXAMPLE_SYSTEM.name}`} subtitle={`${EXAMPLE_SYSTEM.repo} · 1a2b3c4 → a1b2c3d`} steps={installSteps("done")} outcome="updated"
        notice={<JobOutcomeNotice outcome="updated" title={`Updated ${EXAMPLE_SYSTEM.name}`} body="3 rosters use this data. Check them to see which changed." />}
        footer={<><button type="button" className="ux-job-btn secondary">Later</button><button type="button" className="ux-job-btn primary">Check rosters</button></>} />
    );
  } else if (preview === "done") {
    modal = (
      <JobModal title={title} subtitle={subtitle} steps={installSteps("done")} outcome="done"
        notice={<JobOutcomeNotice outcome="done" title={`Installed ${EXAMPLE_SYSTEM.name}`} body="23 factions · 41 MB. Ready to use." />}
        footer={<><button type="button" className="ux-job-btn secondary">View</button><button type="button" className="ux-job-btn primary">Done</button></>} />
    );
  } else if (preview === "failed") {
    modal = (
      <JobModal title={title} subtitle={subtitle} steps={installSteps("failed")} outcome="failed"
        notice={<JobOutcomeNotice outcome="failed" title={`Could not install ${EXAMPLE_SYSTEM.name}`} body="The data in this repository could not be read: a document is not valid XML." />}
        footer={<><button type="button" className="ux-job-btn secondary">Close</button><button type="button" className="ux-job-btn primary">Try again</button></>} />
    );
  } else {
    modal = (
      <JobModal title={title} subtitle={subtitle} steps={installSteps("failed").map((s) => (s.state === "failed" ? { ...s, state: "waiting", detail: "Cancelled" } : s))} outcome="cancelled"
        notice={<JobOutcomeNotice outcome="cancelled" title="Install cancelled" body="Nothing was installed." />}
        footer={<><button type="button" className="ux-job-btn secondary">Close</button><button type="button" className="ux-job-btn primary">Try again</button></>} />
    );
  }
  return (
    <>
      <SourcesBackdrop props={props}>{control}</SourcesBackdrop>
      {modal}
    </>
  );
}

// ---------------------------------------------------------------- shared screen chrome

export function SourceScreenHeader({ props, title, subtitle, right }: { props: ConceptProps; title: string; subtitle: string; right?: ReactNode }) {
  return (
    <header className={`ux-wb-top ux-wb-home-top reversed ${right ? "ux-src-top-actions" : ""}`}>
      <button type="button" className="ux-icon-btn" aria-label="Back" onClick={props.onBack}><ArrowLeft size={18} /></button>
      <div className="ux-wb-title"><strong>{title}</strong><small>{subtitle}</small></div>
      {right}
    </header>
  );
}

// ---------------------------------------------------------------- sources list with update states

type SourceStatus = "ready" | "update" | "review" | "broken" | "updating";
type ExampleSource = { name: string; factions: number; names: string; meta: string; status: SourceStatus };

export const EXAMPLE_SOURCES: ExampleSource[] = [
  { name: EXAMPLE_SYSTEM.name, factions: 23, names: "Northern Realms, Ember Covenant, Glass Legion…", meta: "Version a1b2c3d · changed upstream 2026-09-30 · 41 MB", status: "update" },
  { name: "Example System Two", factions: 14, names: "Tidewardens, Ashen Court, Verdant Host…", meta: "Version e4f5a6b · changed upstream 2026-10-02 · 29 MB", status: "update" },
  { name: "Example System Three", factions: 6, names: "Iron Choir, Salt Kings, Lantern Guild…", meta: "Version 9c8d7e6 · changed upstream 2026-10-11 · 12 MB", status: "ready" },
  { name: "Example System Four", factions: 9, names: "Hollow Crown, Glass Legion, Ember Covenant…", meta: "Version 0f1e2d3 · changed upstream 2026-08-21 · 18 MB", status: "review" },
];

export function SourceStatusChip({ status, percent = 46 }: { status: SourceStatus; percent?: number }) {
  if (status === "updating") return <Chip tone="cool"><LoaderCircle size={11} className="ux-spin" /> Updating {percent}%</Chip>;
  if (status === "update") return <Chip tone="cool"><CircleArrowUp size={11} /> Update available</Chip>;
  if (status === "review") return <Chip tone="warning"><TriangleAlert size={11} /> Needs review</Chip>;
  if (status === "broken") return <Chip tone="error"><OctagonAlert size={11} /> Unreadable</Chip>;
  return <Chip tone="valid"><CircleCheck size={11} /> Ready</Chip>;
}

export function SourceRow({ source, selecting = false, selected = false, onClick }: { source: ExampleSource; selecting?: boolean; selected?: boolean; onClick?: () => void }) {
  const selectable = source.status === "update";
  return (
    <article className={`ux-source-row ux-src-row ${selecting ? "selecting" : ""} ${selecting && !selectable ? "dimmed" : ""} ${selected ? "selected" : ""}`} onClick={onClick} role={selecting ? "checkbox" : "button"} aria-checked={selecting ? selected : undefined}>
      {selecting ? <span className="ux-src-check" aria-hidden>{selected ? <Check size={14} /> : null}</span> : null}
      <span><strong>{source.name}</strong><small>{source.factions} factions · {source.names}</small><small>{source.meta}</small></span>
      {selecting && !selectable ? <Chip tone="neutral">Up to date</Chip> : <SourceStatusChip status={source.status} />}
    </article>
  );
}

export function UpdatesNotice({ count = 2 }: { count?: number }) {
  return (
    <div className="ux-job-notice info ux-src-updates" role="status">
      <CircleArrowUp size={18} />
      <span><strong>{count} updates available</strong><small>New data for {EXAMPLE_SYSTEM.name} and Example System Two.</small></span>
      <button type="button" className="ux-job-btn primary">Update all</button>
    </div>
  );
}

type SourcesPreview = "installed" | "updates" | "selecting" | "updating" | "failed" | "interrupted" | "update-interrupted" | "local-choice" | "local-refused" | "local" | "local-interrupted" | "empty";

export function SourcesManageScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<SourcesPreview>("updates");
  const [selected, setSelected] = useState<string[]>([EXAMPLE_SYSTEM.name]);
  const selecting = preview === "selecting";
  const sources = EXAMPLE_SOURCES.map((s) => {
    if (preview === "installed") return { ...s, status: (s.status === "update" ? "ready" : s.status) as SourceStatus };
    if (preview === "updating" && s.name === EXAMPLE_SYSTEM.name) return { ...s, status: "updating" as SourceStatus };
    // DS-3: a source installed from a file shows where it came from and is never offered an update.
    if ((preview === "local" || preview === "local-choice") && s.name === LOCAL_SOURCE.name) return LOCAL_SOURCE;
    return s;
  });
  const toggle = (name: string) => setSelected((cur) => (cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]));
  return (
    <>
      <SourceScreenHeader props={props} title={selecting ? `${selected.length} selected` : "Sources"} subtitle={selecting ? "Choose sources to update" : "Installed game data"} right={selecting ? <button type="button" className="ux-job-hide" onClick={() => setPreview("updates")}>Cancel</button> : undefined} />
      <div className="ux-wb-home-body ux-sources-body ux-src-body">
        <PreviewState value={preview} options={[["installed", "Installed"], ["updates", "Updates"], ["selecting", "Selecting"], ["updating", "Updating"], ["failed", "Install failed"], ["interrupted", "Install interrupted"], ["update-interrupted", "Update interrupted"], ["local-choice", "From a file · choose"], ["local-refused", "From a file · refused"], ["local", "From a file · installed"], ["local-interrupted", "From a file · interrupted"], ["empty", "Empty"]]} onChange={setPreview} />
        {!selecting ? (
          <button type="button" className="ux-add-source-primary" onClick={() => props.onNavigate("add-source")}>
            <Plus size={18} /><span><strong>Add game data</strong><small>Collections, a repository link, or GitHub search</small></span><ChevronRight size={17} />
          </button>
        ) : null}
        {!selecting ? <LocalImportRow onClick={() => setPreview("local-choice")} /> : null}
        {preview === "local-refused" ? <LocalRefusedNotice /> : null}
        {preview === "updates" ? <UpdatesNotice /> : null}
        {preview === "empty" ? (
          <section className="ux-sources-empty">
            <span><Database size={25} /></span><strong>No game data yet</strong>
            <small>Add game data from a collection, a repository link or GitHub search. Everything in a source is installed unless Advanced installation is on.</small>
            <button type="button" onClick={() => props.onNavigate("add-source")}><Plus size={16} />Add game data</button>
          </section>
        ) : (
          <>
            <div className="ux-src-section-head"><span className="ux-result-label">Installed</span>{!selecting ? <button type="button" className="ux-job-link" onClick={() => setPreview("selecting")}>Select</button> : null}</div>
            {preview === "failed" ? (
              <div className="ux-job-notice error ux-src-failed">
                <OctagonAlert size={18} />
                <span><strong>Example System Five · Install failed</strong><small>GitHub could not be reached. Nothing was installed.</small></span>
                <div className="ux-src-inline-actions"><button type="button" className="ux-job-link">Dismiss</button><button type="button" className="ux-job-btn primary">Try again</button></div>
              </div>
            ) : null}
            {preview === "interrupted" ? (
              <div className="ux-job-notice warning ux-src-failed">
                <TriangleAlert size={18} />
                <span><strong>Example System Five · Install interrupted</strong><small>The install of Example System Five was interrupted. 3 of 9 factions were installed.</small></span>
                <div className="ux-src-inline-actions"><button type="button" className="ux-job-link">Dismiss</button><button type="button" className="ux-job-btn primary">Install the rest</button></div>
              </div>
            ) : null}
            {preview === "local-interrupted" ? <LocalInterruptedNotice /> : null}
            {preview === "update-interrupted" ? (
              <div className="ux-job-notice warning ux-src-failed">
                <TriangleAlert size={18} />
                <span><strong>Example System Five · Update interrupted</strong><small>The update of Example System Five was interrupted. The previous version stays in use.</small></span>
                <div className="ux-src-inline-actions"><button type="button" className="ux-job-link">Dismiss</button><button type="button" className="ux-job-btn primary">Try again</button></div>
              </div>
            ) : null}
            <div className="ux-source-list ux-managed-source-list ux-src-list">
              {sources.map((s) => <SourceRow key={s.name} source={s} selecting={selecting} selected={selected.includes(s.name)} onClick={selecting ? () => { if (s.status === "update") toggle(s.name); } : () => props.onNavigate("source-detail")} />)}
            </div>
            <small className="ux-src-footer">{preview === "installed" ? "Checked 2 min ago · pull to check again" : "Checked just now"}</small>
          </>
        )}
      </div>
      {selecting ? (
        <footer className="ux-src-selection-bar">
          <button type="button" className="ux-job-btn secondary" onClick={() => setSelected(EXAMPLE_SOURCES.filter((s) => s.status === "update").map((s) => s.name))}>Select all updates</button>
          <button type="button" className="ux-job-btn primary" disabled={selected.length === 0}>Update {selected.length} {selected.length === 1 ? "source" : "sources"}</button>
        </footer>
      ) : null}
      {preview === "updating" ? <div className="ux-job-float"><JobPill label={`Updating ${EXAMPLE_SYSTEM.name}`} percent={46} count={2} /></div> : null}
      {preview === "local-choice" ? <LocalImportChoiceDialog /> : null}
    </>
  );
}

// ---------------------------------------------------------------- install from a file (DS-3, DEC-035)

/**
 * Sources → "Install from a file on this phone" (battle-augur DS-3): archives (.zip, .bsr), data files
 * (.gst/.cat, .gstz/.catz, data .json) or a folder, read on the phone and installed through the same job
 * sheet as a download. The file names below are invented placeholders (DEC-001).
 */
export const LOCAL_FILE = { label: "example-data.zip", files: 12, size: "12 MB" };

/** The entry row under Add game data (a neutral icon tile: it is the second way in). */
export function LocalImportRow({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className="ux-add-source-primary ux-src-local-entry" onClick={onClick}>
      <FileArchive size={18} /><span><strong>Install from a file on this phone</strong><small>An archive, data files or a folder</small></span><ChevronRight size={17} />
    </button>
  );
}

/** The choice after tapping the row: the app's own menu dialog (UX-013), never a system alert. */
export function LocalImportChoiceDialog({ inline = false }: { inline?: boolean }) {
  return (
    <AppDialog
      inline={inline}
      layout="column"
      title="Install from a file"
      message="Pick archives or data files, or a whole folder. Hidden folders and other files are skipped."
      actions={[{ label: "Choose files", icon: <FileInput size={15} /> }, { label: "Choose a folder", icon: <FolderOpen size={15} /> }, { label: "Cancel" }]}
    />
  );
}

/** The job's steps: "Copying files" in place of Download (the bytes go to the engine one file at a time). */
export function localSteps(stage: "files" | "import" | "failed" | "done"): JobStep[] {
  const order = ["files", "read", "import", "write"];
  const at = (id: string): JobStepState => {
    if (stage === "done") return "done";
    if (stage === "failed") return id === "read" ? "failed" : order.indexOf(id) < 1 ? "done" : "waiting";
    const cur = order.indexOf(stage);
    const i = order.indexOf(id);
    return i < cur ? "done" : i === cur ? "active" : "waiting";
  };
  return [
    { id: "files", title: "Copying files", detail: stage === "files" ? "File 4 of 12 · example-faction.cat" : `${LOCAL_FILE.files} files · ${LOCAL_FILE.size}`, state: at("files"), progress: 4 / 12 },
    { id: "read", title: "Read", detail: at("read") === "done" ? "64 documents" : undefined, state: at("read") },
    { id: "import", title: "Import", detail: stage === "import" ? `Faction 3 of 9 · ${EXAMPLE_FACTIONS[1]}` : stage === "done" ? "9 factions" : undefined, state: at("import"), progress: 3 / 9 },
    { id: "write", title: "Write", state: at("write") },
  ];
}

export type LocalError = "too-large" | "no-data" | "no-system" | "two-systems" | "damaged" | "permission";

/** What a refused or failed pick says. Nothing is installed and the data already on the phone stays as it was. */
export const LOCAL_ERRORS: Array<[LocalError, string, string, string]> = [
  ["too-large", "Too large", "These files are too large", "Each file can be up to 50 MB and all of them together up to 200 MB, in at most 2000 files. Nothing was installed."],
  ["no-data", "No data files", "No game data in these files", "Pick .zip or .bsr archives, .gst or .cat files (also .gstz, .catz) or data .json files. Nothing was installed."],
  ["no-system", "No game system", "The game system file is missing", "The files have factions but not the game system they belong to. Add its .gst file and try again."],
  ["two-systems", "Two game systems", "These files hold two game systems", "Install one game system at a time: Example System One and Example System Two were found."],
  ["damaged", "Damaged archive", "This archive could not be read", "example-data.zip is damaged or not a supported archive. Nothing was installed."],
  ["permission", "Permission lost", "The phone no longer allows reading these files", "Pick the files again. If they are in a cloud folder, make sure they are downloaded first."],
];

export function LocalImportError({ kind }: { kind: LocalError }) {
  const [, , title, body] = LOCAL_ERRORS.find(([id]) => id === kind)!;
  return <JobOutcomeNotice outcome="failed" title={title} body={body} />;
}

/** A local source in the Sources list: where it came from instead of a version, and when it was imported. */
export const LOCAL_SOURCE: ExampleSource = { name: "Example System Three", factions: 9, names: "Iron Choir, Salt Kings, Lantern Guild…", meta: `From a file · ${LOCAL_FILE.label} · imported today · ${LOCAL_FILE.size}`, status: "ready" };

/** A pick refused before its job starts (too large, no data files, a folder the phone will not list): a notice under the row. */
export function LocalRefusedNotice() {
  return (
    <div className="ux-job-notice error ux-src-failed">
      <OctagonAlert size={18} />
      <span><strong>Could not install these files</strong><small>These files are too large: at most 2,000 files, 50 MB each and 200 MB together. Nothing was installed.</small></span>
      <div className="ux-src-inline-actions"><button type="button" className="ux-job-btn">Dismiss</button></div>
    </div>
  );
}

/** After a restart: the picked files are gone, so the only action is Dismiss. */
export function LocalInterruptedNotice() {
  return (
    <div className="ux-job-notice warning ux-src-failed">
      <TriangleAlert size={18} />
      <span><strong>{LOCAL_FILE.label} · Install interrupted</strong><small>The install from {LOCAL_FILE.label} was interrupted. Nothing was kept. Pick the files again to install them.</small></span>
      <div className="ux-src-inline-actions"><button type="button" className="ux-job-btn">Dismiss</button></div>
    </div>
  );
}

/** Source detail of a local source: no repository, version, update check, GitHub link or Install more factions. */
export function LocalSourceRows() {
  return (
    <div className="ux-src-group">
      <DetailRow label="From a file" value={LOCAL_FILE.label} />
      <DetailRow label="Imported" value="today" />
      <DetailRow label="Size on this phone" value={LOCAL_FILE.size} />
      <DetailRow label="Documents" value="64" />
    </div>
  );
}

export function LocalSourceNote() {
  return <div className="ux-job-notice info"><Info size={18} /><span><strong>Installed from a file</strong><small>It is never checked for updates. Install a newer file of the same game system to replace it; rosters move to the new data.</small></span></div>;
}

// ---------------------------------------------------------------- source detail with update states

export function SourceUpdateCard() {
  return (
    <section className="ux-src-card update">
      <header><CircleArrowUp size={18} /><span><strong>Update available</strong><small>Version 7d6c5b4 · 2026-10-14</small></span></header>
      <ul className="ux-src-changes">
        <li><b>Changed</b>Northern Realms, Glass Legion, Tidewardens</li>
        <li><b>New</b>Hollow Crown</li>
        <li><b>Removed</b>Salt Kings</li>
        <li><b>Game system</b>file changed</li>
      </ul>
      <div className="ux-job-notice warning"><TriangleAlert size={18} /><span><strong>2 rosters use Salt Kings, which this update removes.</strong><small>They will be marked Faction removed after the update.</small></span></div>
      <div className="ux-job-footer"><button type="button" className="ux-job-btn ux-src-ghost">View on GitHub</button><button type="button" className="ux-job-btn primary">Update</button></div>
    </section>
  );
}

export function LastUpdateCard({ onReport, checked = true }: { onReport?: () => void; checked?: boolean }) {
  return (
    <section className="ux-src-card">
      <header><History size={18} /><span><strong>Updated today from 1a2b3c4 to a1b2c3d</strong><small>{checked ? "3 rosters checked: 1 unchanged, 2 changed" : "3 rosters not checked yet"}</small></span></header>
      {checked ? <button type="button" className="ux-job-btn secondary block" onClick={onReport}>View report</button> : <button type="button" className="ux-job-btn primary block">Check rosters</button>}
    </section>
  );
}

type ExampleVersion = { commit: string; date: string; size: string };

/** The versions of the example source; `isoDate` shows commit dates relative to today (2026-10-17). */
const VERSION_NEWEST: ExampleVersion = { commit: "a1b2c3d", date: "5 days ago", size: "41 MB" };
const VERSION_PREVIOUS: ExampleVersion = { commit: "1a2b3c4", date: "17 days ago", size: "39 MB" };
const VERSION_OLDEST: ExampleVersion = { commit: "5e6f7a8", date: "Sep 2, 2026", size: "38 MB" };

/**
 * Source detail → Versions, shown while kept versions exist (Keep previous versions on, DEC-024; built in battle-augur plan 2G part 2):
 * the version in use first ("· In use"), then each kept version, newest first, with its line and Switch to this version / Delete.
 */
export function SourceVersions({ older = false, onDelete }: { older?: boolean; onDelete?: () => void }) {
  const inUse = older ? VERSION_PREVIOUS : VERSION_NEWEST;
  const kept = older ? [VERSION_NEWEST, VERSION_OLDEST] : [VERSION_PREVIOUS, VERSION_OLDEST];
  return (
    <>
      <div className="ux-result-label">Versions</div>
      <div className="ux-src-group">
        <div className="ux-src-kv ux-src-version in-use"><span><CircleCheck size={17} />Version {inUse.commit} · {inUse.date} · In use</span></div>
        {kept.map((v) => (
          <div key={v.commit} className="ux-src-kv ux-src-version kept">
            <strong>Version {v.commit} · {v.date} · {v.size}</strong>
            <span className="ux-src-version-actions">
              <button type="button" className="ux-job-btn sm"><History size={14} />Switch to this version</button>
              <button type="button" className="ux-job-btn sm destructive-outline" onClick={onDelete}><Trash2 size={14} />Delete</button>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

/** Top of the source detail when the version in use is older than a kept one: one row that switches to the newest kept version. */
export function OlderVersionRow({ commit = VERSION_NEWEST.commit }: { commit?: string }) {
  return (
    <button type="button" className="ux-src-card ux-src-older" aria-label={`Using an older version. Switch to ${commit}`}>
      <header><History size={18} /><span><strong>Using an older version · Switch to {commit}</strong></span><ChevronRight size={16} /></header>
    </button>
  );
}

/**
 * The app's own dialog (UX-013, DEC-027), replacing the system alerts: centred on a dimmed backdrop, title, message and actions.
 * Confirm: Cancel (secondary) beside the action, which is red when it destroys something. Menu: a vertical list of actions and a Cancel row.
 * Built in battle-augur apps/mobile/src/ds/dialog.
 */
export function AppDialog({ title, message, actions, layout = "row", inline = false }: { title: string; message?: string; actions: Array<{ label: string; tone?: "primary" | "destructive" | "secondary"; icon?: ReactNode }>; layout?: "row" | "column"; inline?: boolean }) {
  const dialog = (
    <div className="ux-dialog" role="alertdialog" aria-modal="true" aria-label={title}>
      <strong>{title}</strong>
      {message ? <small>{message}</small> : null}
      <div className={`ux-dialog-actions ${layout}`}>
        {actions.map((a) => <button key={a.label} type="button" className={`ux-dialog-btn ${a.tone ?? "secondary"}`}>{a.icon}{a.label}</button>)}
      </div>
    </div>
  );
  return inline ? <div className="ux-dialog-inline">{dialog}</div> : <div className="ux-job-scrim ux-alert-scrim">{dialog}</div>;
}

/** Confirmation before deleting a kept version: the space it frees, and that it cannot be undone. */
export function DeleteVersionAlert({ inline = false, version = VERSION_PREVIOUS }: { inline?: boolean; version?: ExampleVersion }) {
  return <AppDialog inline={inline} title={`Delete version ${version.commit}?`} message={`Frees ${version.size}. This cannot be undone.`} actions={[{ label: "Cancel" }, { label: "Delete", tone: "destructive" }]} />;
}

/** Confirmation before Remove: rosters stay, read-only (DEC-024). */
export function RemoveSourceAlert({ inline = false }: { inline?: boolean }) {
  return <AppDialog inline={inline} title={`Remove ${EXAMPLE_SYSTEM.name}?`} message="3 rosters will open read-only until this data is added again. Frees 41 MB." actions={[{ label: "Cancel" }, { label: "Remove", tone: "destructive" }]} />;
}

/** A short action menu (the ⋯ buttons): the same dialog with the actions stacked; Cancel last. */
export function ActionMenuDialog({ inline = false }: { inline?: boolean }) {
  return <AppDialog inline={inline} layout="column" title="Example unit" actions={[{ label: "Duplicate", icon: <Copy size={15} /> }, { label: "Delete", tone: "destructive", icon: <Trash2 size={15} /> }, { label: "Cancel" }]} />;
}

/**
 * Import report on the source detail (UX-014, DEC-027): the counts by severity stay visible, the groups of messages
 * (unresolved references, duplicate IDs …) start folded behind "Show {n}" and unfold on request.
 */
export function ImportReportGroups({ expanded = false, onToggle }: { expanded?: boolean; onToggle?: () => void }) {
  return (
    <>
      <div className="ux-src-section-head"><span className="ux-result-label">Import report</span><button type="button" className="ux-job-link" aria-expanded={expanded} onClick={onToggle}>{expanded ? "Hide" : "Show 3"}</button></div>
      <div className="ux-src-chips"><SeverityCount tone="error" label="2 errors" /><SeverityCount tone="warning" label="14 warnings" /><SeverityCount tone="info" label="1 note" /></div>
      {expanded ? (
        <div className="ux-src-group">
          <DetailRow label="Unresolved reference · missing-target" value="11" />
          <DetailRow label="Duplicate ID · duplicate-id" value="3" />
          <DetailRow label="Unused entry · unused-entry" value="1" />
        </div>
      ) : null}
    </>
  );
}

function SeverityCount({ tone, label }: { tone: "error" | "warning" | "info"; label: string }) {
  return <span className={`ux-src-sev ${tone}`}>{label}</span>;
}

type DetailPreview = "update" | "current" | "updating" | "updated" | "not-checked" | "failed" | "versions" | "older" | "switched" | "delete-version" | "remove" | "local";

function DetailRow({ label, value, action }: { label: string; value: string; action?: string }) {
  return <div className="ux-src-kv"><span>{label}</span><b>{value}</b>{action ? <button type="button" className="ux-job-link">{action}</button> : null}</div>;
}

export function SourceDetailScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<DetailPreview>("update");
  const [reportOpen, setReportOpen] = useState(false);
  // Switching back to 1a2b3c4 makes the source use an older version than a kept one.
  const older = preview === "older" || preview === "switched";
  const newest = preview === "updated" || preview === "not-checked" || preview === "versions" || preview === "delete-version";
  return (
    <>
      <SourceScreenHeader props={props} title={preview === "local" ? LOCAL_SOURCE.name : EXAMPLE_SYSTEM.name} subtitle={preview === "local" ? `From a file · ${LOCAL_FILE.label}` : EXAMPLE_SYSTEM.repo} />
      <div className="ux-wb-home-body ux-sources-body ux-src-body">
        <PreviewState value={preview} options={[["update", "Update available"], ["current", "Up to date"], ["updating", "Updating"], ["updated", "Updated"], ["not-checked", "Rosters not checked"], ["failed", "Update failed"], ["versions", "Versions"], ["older", "Older version"], ["switched", "Switched"], ["delete-version", "Delete version"], ["remove", "Remove"], ["local", "From a file"]]} onChange={setPreview} />
        {preview === "update" ? <SourceUpdateCard /> : null}
        {older ? <OlderVersionRow /> : null}
        {preview === "not-checked" ? <LastUpdateCard checked={false} /> : null}
        {preview === "current" ? <div className="ux-job-notice ok"><CircleCheck size={18} /><span><strong>Up to date · checked 5 min ago</strong></span></div> : null}
        {preview === "updating" ? (
          <button type="button" className="ux-src-card ux-src-progress" aria-label="Updating, 46 percent. Opens the progress.">
            <header><LoaderCircle size={18} className="ux-spin" /><span><strong>Updating · 46%</strong><small>Import · Faction 7 of 23</small></span><ChevronRight size={16} /></header>
            <JobProgressBar value={0.46} />
          </button>
        ) : null}
        {preview === "updated" ? <LastUpdateCard onReport={() => props.onNavigate("migration-report")} /> : null}
        {preview === "failed" ? (
          <div className="ux-job-notice error"><OctagonAlert size={18} /><span><strong>The last update failed</strong><small>GitHub could not be reached. The previous version is still in use.</small></span><button type="button" className="ux-job-btn primary">Try again</button></div>
        ) : null}
        {preview === "local" ? <><LocalSourceNote /><LocalSourceRows /></> : <div className="ux-src-group">
          <DetailRow label="Repository" value={EXAMPLE_SYSTEM.repo} />
          <DetailRow label="Version" value={newest ? VERSION_NEWEST.commit : VERSION_PREVIOUS.commit} />
          <DetailRow label="Changed upstream" value={newest ? VERSION_NEWEST.date : VERSION_PREVIOUS.date} />
          <DetailRow label="Installed" value="12 days ago" />
          <DetailRow label="Last checked" value={preview === "failed" ? "1 h ago" : "5 min ago"} action="Check now" />
          <DetailRow label="Size on this phone" value={older ? VERSION_PREVIOUS.size : VERSION_NEWEST.size} />
        </div>}
        {preview === "versions" || preview === "delete-version" || older ? <SourceVersions older={older} onDelete={() => setPreview("delete-version")} /> : null}
        <div className="ux-result-label">Installed factions</div>
        <div className="ux-src-group">{EXAMPLE_FACTIONS.slice(0, 4).map((f) => <DetailRow key={f} label={f} value="r14" />)}<DetailRow label="…and 19 more" value="" /></div>
        <ImportReportGroups expanded={reportOpen} onToggle={() => setReportOpen((v) => !v)} />
        <button type="button" className="ux-job-btn destructive block ux-src-remove" disabled={preview === "updating"}>Remove this data</button>
        {preview === "updating" ? <small className="ux-src-footer">This data is being updated. Try again when it finishes.</small> : null}
      </div>
      {preview === "remove" ? <RemoveSourceAlert /> : null}
      {preview === "delete-version" ? <DeleteVersionAlert /> : null}
      {preview === "switched" ? <div className="ux-job-float"><JobToast tone="neutral" message={`Switched to version ${VERSION_PREVIOUS.commit}`} /></div> : null}
    </>
  );
}

// ---------------------------------------------------------------- migration report

const DATA_CHANGES = <div className="ux-src-group"><DetailRow label="Glass Legion" value="r12 → r14" /><DetailRow label="Northern Realms" value="r30 → r31" /><DetailRow label="Hollow Crown" value="New" /><DetailRow label="Salt Kings" value="Removed" /></div>;

export function MigrationReportBody({ checked = true }: { checked?: boolean }) {
  if (!checked) {
    return (
      <>
        <div className="ux-job-notice info"><Info size={18} /><span><strong>3 rosters not checked yet</strong><small>Checking evaluates each roster on the new data and tags the ones that changed.</small></span><button type="button" className="ux-job-btn primary">Check rosters</button></div>
        <div className="ux-result-label">Data changes</div>
        {DATA_CHANGES}
      </>
    );
  }
  return (
    <>
      <div className="ux-src-chips"><Chip tone="neutral">3 rosters</Chip><Chip tone="valid">1 unchanged</Chip><Chip tone="warning">1 changed</Chip><Chip tone="neutral">1 faction removed</Chip></div>
      <div className="ux-result-label">Changed</div>
      <section className="ux-src-card">
        <header><TriangleAlert size={18} className="warn" /><span><strong>Spring league list</strong><small>Glass Legion</small></span><RosterDataTag kind="changed" /></header>
        <ul className="ux-src-changes">
          <li><b>Removed</b>Lantern Bearers (no longer in the data)</li>
          <li><b>Total</b>pts: 1,980 → 1,995</li>
          <li><b>Errors</b>1 new error</li>
        </ul>
        <button type="button" className="ux-job-btn secondary block">Open roster</button>
      </section>
      <div className="ux-result-label">Faction removed</div>
      <section className="ux-src-card">
        <header><Lock size={18} className="warn" /><span><strong>Harbour raid</strong><small>Salt Kings</small></span><RosterDataTag kind="faction" /></header>
        <small className="ux-col-desc">Faction removed: the installed data no longer has Salt Kings.</small>
        <button type="button" className="ux-job-btn secondary block">Open roster</button>
      </section>
      <div className="ux-result-label">Unchanged</div>
      <div className="ux-src-group"><DetailRow label="Weekend practice" value="Northern Realms" /></div>
      <div className="ux-result-label">Data changes</div>
      {DATA_CHANGES}
    </>
  );
}

// ---------------------------------------------------------------- collections (plan 2C)

type RowAction = "install" | "installed" | "update" | "queued" | "running";
type CollectionEntry = { name: string; description: string; repo: string; supported?: boolean; archived?: boolean; action: RowAction };

export const DEFAULT_COLLECTION: CollectionEntry[] = [
  { name: EXAMPLE_SYSTEM.name, description: "Skirmish rules with campaign play", repo: EXAMPLE_SYSTEM.repo, supported: true, action: "update" },
  { name: "Example System Two", description: "Mass battles, points-based", repo: "example-org/example-system-two", supported: true, action: "installed" },
  { name: "Example System Three", description: "Small squads, card activation", repo: "example-org/example-system-three", supported: true, action: "install" },
  { name: "Example System Four", description: "Naval engagements", repo: "another-org/example-system-four", action: "queued" },
  { name: "Example System Five", description: "Fantasy regiments", repo: "another-org/example-system-five", action: "install" },
];

function RowActionButton({ action, onInstall }: { action: RowAction; onInstall?: () => void }) {
  if (action === "installed") return <button type="button" className="ux-src-action done" disabled><Check size={13} />Installed</button>;
  if (action === "update") return <button type="button" className="ux-src-action">Update</button>;
  if (action === "queued") return <button type="button" className="ux-src-action quiet"><Clock size={13} />Waiting</button>;
  if (action === "running") return <button type="button" className="ux-src-action quiet"><LoaderCircle size={13} className="ux-spin" />46%</button>;
  return <button type="button" className="ux-src-action primary" onClick={onInstall}><Download size={13} />Install</button>;
}

export function CollectionSourceRow({ entry, onInstall }: { entry: CollectionEntry; onInstall?: () => void }) {
  return (
    <article className={`ux-source-row ux-src-row ux-col-row ${entry.archived ? "dimmed" : ""}`}>
      <span>
        <strong>{entry.name}</strong>
        <small>{entry.description}</small>
        <small>{entry.repo}</small>
        <span className="ux-src-chips">
          {entry.supported ? <Chip tone="valid"><Star size={10} /> Supported</Chip> : null}
          {entry.action === "update" ? <Chip tone="cool"><CircleArrowUp size={10} /> Update available</Chip> : null}
          {entry.archived ? <Chip tone="neutral">Archived</Chip> : null}
        </span>
      </span>
      <RowActionButton action={entry.action} onInstall={onInstall} />
    </article>
  );
}

export function DefaultCollectionCard({ onInstall, onShowAll }: { onInstall?: () => void; onShowAll?: () => void }) {
  return (
    <section className="ux-src-card ux-col-card">
      <header><Library size={18} /><span><strong>Battle Augur sources</strong><small>12 sources · updated 2026-10-14</small></span><Chip tone="neutral">Default</Chip></header>
      <div className="ux-source-list ux-managed-source-list ux-src-list">
        {DEFAULT_COLLECTION.slice(0, 3).map((entry) => <CollectionSourceRow key={entry.repo} entry={entry} onInstall={onInstall} />)}
      </div>
      <button type="button" className="ux-job-link ux-col-more" onClick={onShowAll}>Show all 12<ChevronRight size={13} /></button>
    </section>
  );
}

/** Listings the default collection itself lists (DEC-024): an organisation library and another builder's repositories. Names come from the hosted file (DEC-001). */
export function DefaultListingRows({ onOpen }: { onOpen?: () => void }) {
  return (
    <div className="ux-src-group">
      <button type="button" className="ux-col-nav listing" onClick={onOpen}><Globe size={17} /><span><strong>example-data-org</strong><small>112 repositories · GitHub organisation</small></span><Chip tone="neutral">Default</Chip><ChevronRight size={16} /></button>
      <button type="button" className="ux-col-nav listing" onClick={onOpen}><FolderGit2 size={17} /><span><strong>Another builder's sources</strong><small>31 sources · collection</small></span><Chip tone="neutral">Default</Chip><ChevronRight size={16} /></button>
    </div>
  );
}

export function UserCollectionRows({ onOpen, onAdd, defaultHidden = false, onShowDefault }: { onOpen?: () => void; onAdd?: () => void; defaultHidden?: boolean; onShowDefault?: () => void }) {
  return (
    <div className="ux-src-group">
      <button type="button" className="ux-col-nav" onClick={onOpen}><FolderGit2 size={17} /><span><strong>Club picks</strong><small>6 sources · collection</small></span><ChevronRight size={16} /></button>
      {/* No repository count on a library row: it would cost a GitHub API request per row (plan 2C). */}
      <button type="button" className="ux-col-nav" onClick={onOpen}><Globe size={17} /><span><strong>community-data</strong><small>GitHub organisation or user</small></span><ChevronRight size={16} /></button>
      {defaultHidden ? <ShowDefaultCollectionRow onShow={onShowDefault} /> : null}
      <button type="button" className="ux-col-nav add" onClick={onAdd}><Plus size={17} /><span><strong>Add a collection or library</strong><small>A collection file or a GitHub organisation</small></span><ChevronRight size={16} /></button>
    </div>
  );
}

/** The default collection hidden (DEC-028: hidden, never removed): a quiet row in the user's group shows it again at once. */
export function ShowDefaultCollectionRow({ onShow }: { onShow?: () => void }) {
  return <button type="button" className="ux-col-nav quiet" onClick={onShow}><Library size={17} /><span><strong>Show the default collection</strong><small>You hid it. It lists sources tested with this app.</small></span></button>;
}

type AddSheetState = "idle" | "found" | "library" | "invalid" | "duplicate" | "repository";

export function AddCollectionSheet({ state, inline = false }: { state: AddSheetState; inline?: boolean }) {
  const value = state === "idle" ? "" : state === "repository" ? "github.com/example-org/example-system-six" : state === "invalid" ? "example.com/notes.txt" : state === "library" ? "github.com/club-org" : "github.com/club-org/club-picks/blob/main/collection.json";
  const error = state === "invalid" ? "That link does not lead to a collection file or a GitHub organisation." : state === "duplicate" ? "This collection is already in your list." : undefined;
  const sheet = (
    <section className={`ux-job-sheet ${inline ? "inline" : ""}`} role="dialog" aria-label="Add a collection or library">
      <span className="ux-sheet-grip" aria-hidden />
      <header className="ux-job-head"><span><strong>Add a collection or library</strong><small>Lists of repositories to install from</small></span><button type="button" className="ux-icon-btn" aria-label="Close"><X size={17} /></button></header>
      <label className="ux-col-field">
        <span>Collection or library link</span>
        <div className={`ux-source-url ${error ? "invalid" : ""}`}><input aria-label="Collection or library link" placeholder="https://… or github.com/name" defaultValue={value} key={value} /></div>
        <small className={error ? "ux-source-error" : ""}>{error ?? "A collection file (.json) or a GitHub organisation or user (github.com/name)."}</small>
      </label>
      {/* Find sits under the field as its own button, like Continue on Add game data (built 2C). */}
      <button type="button" className="ux-job-btn secondary block"><Search size={15} />Find</button>
      {state === "found" ? (
        <div className="ux-src-card">
          <header><FolderGit2 size={18} /><span><strong>Club picks</strong><small>Collection · by club-org · 6 sources</small></span></header>
          <small className="ux-col-desc">The systems our club plays, with the repositories we trust.</small>
        </div>
      ) : null}
      {state === "library" ? (
        <div className="ux-src-card">
          <header><Globe size={18} /><span><strong>Club organisation</strong><small>48 repositories · GitHub organisation</small></span></header>
          <small className="ux-col-desc">From the organisation's GitHub profile. A user reads "GitHub user".</small>
        </div>
      ) : null}
      {state === "repository" ? <div className="ux-job-notice info"><Info size={18} /><span><strong>That is a repository, not a collection.</strong><small>Install it directly instead.</small></span><button type="button" className="ux-job-btn primary">Install it</button></div> : null}
      <small className="ux-src-footer">Collections only list repositories. Nothing is downloaded until you install.</small>
      <footer className="ux-job-footer"><button type="button" className="ux-job-btn secondary">Cancel</button><button type="button" className="ux-job-btn primary" disabled={state !== "found" && state !== "library"}>Add collection</button></footer>
    </section>
  );
  return inline ? sheet : <div className="ux-job-scrim">{sheet}</div>;
}

type AddPreview = "collections" | "hidden" | "add" | "library" | "invalid" | "duplicate" | "repository";

export function AddGameDataScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<AddPreview>("collections");
  const install = () => props.onNavigate("install-job");
  const hidden = preview === "hidden";
  const sheet: AddSheetState | undefined = preview === "add" ? "found" : preview === "collections" || preview === "hidden" ? undefined : preview;
  return (
    <>
      <SourceScreenHeader props={props} title="Add game data" subtitle="Collections, a link, or GitHub search" />
      <div className="ux-wb-home-body ux-add-source-body ux-src-body">
        <PreviewState value={preview} options={[["collections", "Collections"], ["hidden", "Default hidden"], ["add", "Add collection"], ["library", "Add library"], ["invalid", "Invalid link"], ["duplicate", "Already added"], ["repository", "Repository link"]]} onChange={setPreview} />
        <div className="ux-result-label">Collections</div>
        {hidden ? null : <DefaultCollectionCard onInstall={install} onShowAll={() => props.onNavigate("collection")} />}
        {hidden ? null : <DefaultListingRows onOpen={() => props.onNavigate("collection")} />}
        <UserCollectionRows onOpen={() => props.onNavigate("collection")} onAdd={() => setPreview("add")} defaultHidden={hidden} onShowDefault={() => setPreview("collections")} />
        <div className="ux-result-label">Repository</div>
        <section className="ux-source-method">
          <div className="ux-source-method-heading"><span className="ux-setting-icon"><FileInput size={18} /></span><span><strong>Have a link?</strong><small>Any GitHub repository with roster data files (.gst and .cat, or their JSON form).</small></span></div>
          <div className="ux-source-url"><input aria-label="Repository" placeholder="owner/name or a GitHub link" /><button type="button" onClick={install}>Continue</button></div>
        </section>
        <div className="ux-src-group"><button type="button" className="ux-col-nav" onClick={() => props.onNavigate("search-github")}><Search size={17} /><span><strong>Search GitHub</strong><small>Any GitHub repository with game data, by name</small></span><ChevronRight size={16} /></button></div>
      </div>
      {sheet ? <AddCollectionSheet state={sheet} /> : null}
    </>
  );
}

/** The ⋯ menu of a Collection page: Hide collection for the default collection only (DEC-028), Remove collection for the user's own. */
export function CollectionMenuDialog({ kind = "user", inline = false }: { kind?: "default" | "user"; inline?: boolean }) {
  return <AppDialog inline={inline} layout="column" title={kind === "default" ? "Battle Augur sources" : "Club picks"} actions={[{ label: "Refresh" }, { label: "Copy link", icon: <Copy size={15} /> }, kind === "default" ? { label: "Hide collection" } : { label: "Remove collection", tone: "destructive", icon: <Trash2 size={15} /> }, { label: "Cancel" }]} />;
}

type CollectionPreview = "collection" | "library" | "offline" | "loading" | "error" | "empty" | "menu-default" | "menu-user" | "remove";

export function CollectionScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<CollectionPreview>("collection");
  const library = preview === "library";
  const user = preview === "menu-user" || preview === "remove" || preview === "error" || preview === "empty";
  const entries: CollectionEntry[] = library
    ? [
        { name: "example-system-six", description: "Community data for a skirmish game", repo: "community-data/example-system-six", action: "install" },
        { name: "example-system-two", description: "Mass battles, points-based", repo: "community-data/example-system-two", action: "installed" },
        { name: "example-system-seven", description: "Older edition, no longer maintained", repo: "community-data/example-system-seven", archived: true, action: "install" },
      ]
    : [...DEFAULT_COLLECTION.slice(0, 4), { ...DEFAULT_COLLECTION[4], action: "running" }];
  const title = library ? "community-data" : user ? "Club picks" : "Battle Augur sources";
  const subtitle = library ? "48 repositories on GitHub" : user ? "Collection · by club-org" : "Collection · by Battle Augur";
  const body = preview === "loading" ? (
    <div className="ux-source-list ux-managed-source-list ux-src-list" aria-busy="true">{[0, 1, 2].map((i) => <article key={i} className="ux-source-row ux-src-row ux-col-row ux-skeleton-row"><span><strong>&nbsp;</strong><small>&nbsp;</small></span></article>)}</div>
  ) : preview === "error" ? (
    <>
      <div className="ux-job-notice error"><OctagonAlert size={18} /><span><strong>This is not a collection</strong><small>The file at this link is not a collection file.</small></span><button type="button" className="ux-job-btn secondary">Try again</button></div>
      <button type="button" className="ux-job-link ux-col-more"><Trash2 size={13} />Remove collection</button>
      <small className="ux-src-footer">Other errors: "This collection is too new" (a newer format), the network copy, "There is no collection file at this link any more", "There is no GitHub organisation or user with this name".</small>
    </>
  ) : preview === "empty" ? (
    <section className="ux-sources-empty"><span><Database size={25} /></span><strong>This collection lists no sources yet</strong></section>
  ) : (
    <>
      <div className="ux-search-field ux-col-search"><Search size={15} /><input aria-label="Search this collection" placeholder={library ? "Search 48 sources" : "Search 12 sources"} /></div>
      <div className="ux-source-list ux-managed-source-list ux-src-list">
        {entries.map((entry) => <CollectionSourceRow key={entry.repo} entry={entry} onInstall={() => props.onNavigate("install-job")} />)}
      </div>
      {library ? <button type="button" className="ux-job-link ux-col-more">Show archived (3)</button> : null}
      {!library ? (
        <>
          <div className="ux-result-label">Listed here</div>
          <DefaultListingRows onOpen={() => props.onNavigate("collection")} />
          <small className="ux-src-footer">A collection opened from another collection lists its libraries only: nested collections are followed one level deep.</small>
        </>
      ) : null}
    </>
  );
  return (
    <>
      <SourceScreenHeader props={props} title={title} subtitle={subtitle} right={<button type="button" className="ux-icon-btn" aria-label="More" onClick={() => setPreview(user ? "menu-user" : "menu-default")}><Ellipsis size={18} /></button>} />
      <div className="ux-wb-home-body ux-add-source-body ux-src-body">
        <PreviewState value={preview} options={[["collection", "Collection"], ["library", "Library"], ["offline", "Offline"], ["loading", "Loading"], ["error", "Error"], ["empty", "Empty"], ["menu-default", "Menu · default"], ["menu-user", "Menu · yours"], ["remove", "Remove"]]} onChange={setPreview} />
        {preview === "offline" ? <div className="ux-job-notice warning"><TriangleAlert size={18} /><span><strong>Showing the copy from 2026-10-14</strong><small>No connection. Installing needs one.</small></span></div> : null}
        <small className="ux-col-desc">{library ? "Repositories of this organisation that hold game data." : "Game systems we test with Battle Augur. Maintained in a public repository; updated without an app release."}</small>
        {library ? <small className="ux-col-desc">github.com/community-data</small> : <small className="ux-col-desc">Updated 2026-10-14</small>}
        {body}
      </div>
      {preview === "menu-default" ? <CollectionMenuDialog kind="default" /> : null}
      {preview === "menu-user" ? <CollectionMenuDialog kind="user" /> : null}
      {preview === "remove" ? <AppDialog title="Remove Club picks?" message="It leaves your list of collections. Installed game data stays." actions={[{ label: "Cancel" }, { label: "Remove", tone: "destructive" }]} /> : null}
    </>
  );
}

type SearchPreview = "results" | "prompt" | "none" | "error";

/** Search GitHub (DS-1, plan 2C): GitHub-wide repository search on its own screen; runs on submit. */
export function SearchGitHubScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<SearchPreview>("results");
  const results: CollectionEntry[] = [
    { name: "example-system-two", description: "Mass battles, points-based", repo: "example-org/example-system-two", action: "installed" },
    { name: "example-system-eight", description: "Fan-made data for a skirmish game", repo: "someone/example-system-eight", action: "install" },
    { name: "example-system-nine", description: "A fork with house rules", repo: "club-org/example-system-nine", action: "running" },
  ];
  return (
    <>
      <SourceScreenHeader props={props} title="Search GitHub" subtitle="Any GitHub repository with game data" />
      <div className="ux-wb-home-body ux-add-source-body ux-src-body">
        <PreviewState value={preview} options={[["results", "Results"], ["prompt", "Before searching"], ["none", "No matches"], ["error", "Rate limited"]]} onChange={setPreview} />
        <div className="ux-search-field ux-col-search"><Search size={15} /><input aria-label="Repository name or topic" placeholder="Repository name or topic" defaultValue={preview === "prompt" ? "" : "example system"} key={preview} /></div>
        <button type="button" className="ux-job-btn secondary block"><Search size={15} />Search GitHub</button>
        {preview === "error" ? <div className="ux-job-notice error"><OctagonAlert size={18} /><span><strong>The search did not finish</strong><small>GitHub is limiting requests from this network. Try again in about 12 min.</small></span><button type="button" className="ux-job-btn secondary">Try again</button></div> : null}
        {preview === "prompt" ? <section className="ux-sources-empty"><span><Search size={25} /></span><strong>Search all of GitHub</strong><small>Type a name and search. Results show repositories that may hold game data; check before you install.</small></section> : null}
        {preview === "none" ? <section className="ux-sources-empty"><span><Search size={25} /></span><strong>No repository matches “example system”</strong><small>Try another name, or enter the repository on Add game data.</small></section> : null}
        {preview === "results" ? (
          <>
            <small className="ux-col-desc">3 repositories</small>
            <div className="ux-source-list ux-managed-source-list ux-src-list">{results.map((entry) => <CollectionSourceRow key={entry.repo} entry={entry} onInstall={() => props.onNavigate("install-job")} />)}</div>
            <button type="button" className="ux-job-link ux-col-more">Show archived (1)</button>
          </>
        ) : null}
      </div>
    </>
  );
}

export function MigrationReportScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<"checked" | "not-checked">("checked");
  return (
    <>
      <SourceScreenHeader props={props} title="Update report" subtitle={`${EXAMPLE_SYSTEM.name} · 1a2b3c4 → a1b2c3d · today`} />
      <div className="ux-wb-home-body ux-sources-body ux-src-body">
        <PreviewState value={preview} options={[["checked", "Rosters checked"], ["not-checked", "Not checked yet"]]} onChange={setPreview} />
        <MigrationReportBody checked={preview === "checked"} />
        <small className="ux-src-footer">What the engine reports per roster is Open (plan 2F). Kept until the next update of this source.</small>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- game data settings (DEC-024)

export function WifiOnlySetting({ on, onToggle }: { on: boolean; onToggle?: () => void }) {
  return (
    <button type="button" className={`ux-setting-row ${on ? "on" : ""}`} role="switch" aria-checked={on} onClick={onToggle}>
      <span className="ux-setting-icon"><Wifi size={17} /></span>
      <span className="ux-setting-text"><strong>Download on Wi-Fi only</strong><small>Wait for Wi-Fi before downloading game data. Update checks still use mobile data.</small></span>
      <span className="ux-switch" aria-hidden />
    </button>
  );
}

/**
 * Settings → Game data → Check for updates automatically (battle-augur UX-008, DEC-027). On by default; shown while the update flag is
 * on. Off stops the automatic checks (start, foreground, hourly) and the check on opening Sources; manual checks stay.
 */
export function AutoUpdateChecksSetting({ on, onToggle }: { on: boolean; onToggle?: () => void }) {
  return (
    <button type="button" className={`ux-setting-row ${on ? "on" : ""}`} role="switch" aria-checked={on} onClick={onToggle}>
      <span className="ux-setting-icon"><RefreshCw size={17} /></span>
      <span className="ux-setting-text"><strong>Check for updates automatically</strong><small>Looks for newer game data while the app is open and shows a badge. Never installs on its own.</small></span>
      <span className="ux-switch" aria-hidden />
    </button>
  );
}

/** The tab header's avatar button; with updates known a dot (info colour, ringed in the header colour) and the count in the label. */
export function UpdateAvatarButton({ updates = 0, onClick }: { updates?: number; onClick?: () => void }) {
  const label = updates > 0 ? `App, settings and sources, ${updates} ${updates === 1 ? "update" : "updates"} available` : "App, settings and sources";
  return (
    <button type="button" className="ux-avatar-btn" aria-label={label} onClick={onClick}>
      AM
      {updates > 0 ? <span className="ux-avatar-badge" aria-hidden /> : null}
    </button>
  );
}

/** App → Sources row; with updates known a chip (icon + words, never colour alone) sits before the chevron. */
export function SourcesNavRow({ updates = 0, onClick }: { updates?: number; onClick?: () => void }) {
  return (
    <button type="button" className="ux-app-nav-row" onClick={onClick} aria-label={updates > 0 ? `Sources, Installed game data and where it comes from, ${updates} ${updates === 1 ? "update" : "updates"}` : undefined}>
      <span className="ux-setting-icon"><Database size={17} /></span>
      <span>
        <strong>Sources</strong>
        <small>Installed game data and where it comes from</small>
      </span>
      <span className="ux-nav-trail">
        {updates > 0 ? <Chip tone="cool"><CircleArrowUp size={11} /> {updates} {updates === 1 ? "update" : "updates"}</Chip> : null}
        <ChevronRight size={17} />
      </span>
    </button>
  );
}

const KEEP_OPTIONS = ["Off", "1", "2", "3"] as const;
export type KeepVersionsValue = (typeof KEEP_OPTIONS)[number];

/**
 * Settings → Game data → Keep previous versions (built in battle-augur plan 2G part 2): a padded block like Theme, with the size of
 * the kept versions (the sum of the kept stores) and a segmented control Off / 1 / 2 / 3 per source.
 */
export function KeepVersionsSetting({ value = "Off", size = "0 B" }: { value?: KeepVersionsValue; size?: string }) {
  const [current, setCurrent] = useState<KeepVersionsValue>(value);
  return (
    <div className="ux-setting-block">
      <div className="ux-setting-block-head"><History size={18} /><strong role="heading" aria-level={3}>Keep previous versions</strong></div>
      <small>Keep older versions of each source so you can switch back. Uses about {size} now.</small>
      <div className="ux-segmented" role="radiogroup" aria-label="Keep previous versions">
        {KEEP_OPTIONS.map((option) => (
          <button key={option} type="button" role="radio" aria-checked={current === option} className={current === option ? "on" : ""} onClick={() => setCurrent(option)}>{option}</button>
        ))}
      </div>
    </div>
  );
}

/** Shown once the notification permission has been asked (in the job sheet). */
export function NotificationsSetting({ on = false }: { on?: boolean }) {
  return (
    <button type="button" className="ux-setting-row ux-setting-value">
      <span className="ux-setting-icon"><Bell size={17} /></span>
      <span className="ux-setting-text"><strong>Job notifications</strong><small>{on ? "Notifications are on" : "Notifications are off · Open system settings"}</small></span>
      <span className="ux-setting-current"><ChevronRight size={14} /></span>
    </button>
  );
}

// ---------------------------------------------------------------- rosters without their data (DEC-024, plan 2G)

export type ReadOnlyKind = "source" | "faction" | "changed";

/** The roster's data tag (Lists rows and the chip row under the roster's navigation bar): words and an icon, not only colour. */
export function RosterDataTag({ kind }: { kind: ReadOnlyKind }) {
  if (kind === "changed") return <Chip tone="cool"><CircleArrowUp size={10} /> Changed by update</Chip>;
  return <Chip tone="neutral"><Archive size={10} /> {kind === "source" ? "Source removed" : "Faction removed"}</Chip>;
}

/**
 * The chip row under the navigation bar (built in battle-augur plan 2G part 1): the Read only chip and the data tag in one wrapping
 * row (either may be absent). The navigation bar keeps only the name; "read only" is in its screen reader label.
 */
export function ReadOnlyChips({ readOnly = true, kind }: { readOnly?: boolean; kind?: ReadOnlyKind }) {
  if (!readOnly && kind === undefined) return null;
  return (
    <div className="ux-ro-chips">
      {readOnly ? <Chip tone="neutral"><Lock size={10} /> Read only</Chip> : null}
      {kind ? <RosterDataTag kind={kind} /> : null}
    </div>
  );
}

const KEPT_COMMIT = "1a2b3c4";

const READ_ONLY_COPY: Record<ReadOnlyKind, { title: string; body: string }> = {
  source: { title: "Read only · the data for this roster was removed", body: `${EXAMPLE_SYSTEM.name} is no longer on this phone. The roster is kept as it was last saved.` },
  faction: { title: "Read only · Salt Kings is no longer in the data", body: "The update to version a1b2c3d removed this faction. The roster is kept as it was last saved." },
  changed: { title: "The data for this roster changed in an update", body: `Version ${KEPT_COMMIT} → a1b2c3d · 3 changes. Read only until you choose.` },
};

/** "Changed by update": the check's lines at summary level (entries no longer in the data, totals before → after, new errors). */
const CHANGE_LINES = ["Removed: Lantern Bearers", "pts: 1,985 → 1,895", "1 new error"];

/**
 * The banner under the chip row while a roster is read-only (built in battle-augur plan 2G parts 1–2): icon, reason, the choices
 * (primary first). "Open with version {commit}" goes last when a kept version holds the roster's data (`kept`).
 */
export function ReadOnlyBanner({ kind, expanded = false, kept = true, onExport, onOpenWithVersion }: { kind: ReadOnlyKind; expanded?: boolean; kept?: boolean; onExport?: () => void; onOpenWithVersion?: () => void }) {
  const [open, setOpen] = useState(expanded);
  const copy = READ_ONLY_COPY[kind];
  const openWithVersion = kind !== "source" && kept ? <button type="button" className="ux-job-btn sm" onClick={onOpenWithVersion}><History size={14} />Open with version {KEPT_COMMIT}</button> : null;
  return (
    <section className={`ux-src-card ux-ro-banner ${kind}`} role="status">
      <header>{kind === "changed" ? <CircleArrowUp size={18} /> : <Lock size={18} />}<span><strong>{copy.title}</strong><small>{copy.body}</small></span></header>
      {kind === "changed" ? (
        <>
          <button type="button" className="ux-job-link ux-ro-show" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? "Hide changes" : `Show changes (${CHANGE_LINES.length})`}{open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</button>
          {open ? <ul className="ux-ro-change-lines">{CHANGE_LINES.map((line) => <li key={line}>{line}</li>)}</ul> : null}
        </>
      ) : null}
      <div className="ux-ro-actions">
        {kind === "changed" ? (
          <>
            <button type="button" className="ux-job-btn sm primary"><FileText size={14} />Edit with the new data</button>
            <button type="button" className="ux-job-btn sm" onClick={onExport}><Upload size={14} />Export as it was</button>
            {openWithVersion}
          </>
        ) : (
          <>
            <button type="button" className="ux-job-btn sm primary" onClick={onExport}><Upload size={14} />Export</button>
            {kind === "source" ? <button type="button" className="ux-job-btn sm"><Download size={14} />Add the data again</button> : openWithVersion}
          </>
        )}
      </div>
    </section>
  );
}

/** Over a roster opened editable on a kept version (plan 2G part 2): no banner, this notice with the way back. */
export function OpenedWithVersionNotice({ onUseNewest }: { onUseNewest?: () => void }) {
  return (
    <div className="ux-job-notice info ux-ro-opened"><History size={18} /><span><strong>Opened with version {KEPT_COMMIT}</strong></span><button type="button" className="ux-job-btn sm" onClick={onUseNewest}>Use the newest data</button></div>
  );
}

type StoredRow =
  | { kind: "force"; title: string; subtitle?: string }
  | { kind: "selection"; title: string; count?: number; detail?: string; cost?: string };

/** Stored rosters are shown from the roster document and its saved snapshot: catalogue as the force title, units with ×count, options, saved cost. */
const STORED: Record<"source" | "faction", StoredRow[]> = {
  source: [
    { kind: "force", title: "Glass Legion", subtitle: "Vanguard" },
    { kind: "selection", title: "Shield Wardens", count: 2, detail: "Banner, Long spears", cost: "240 pts" },
    { kind: "selection", title: "Scout Riders", detail: "Lances", cost: "65 pts" },
    { kind: "selection", title: "Lantern Bearers", count: 3, cost: "90 pts" },
    { kind: "force", title: "Glass Legion", subtitle: "Reserve" },
    { kind: "selection", title: "Iron Sentinels", detail: "Heavy shields", cost: "210 pts" },
  ],
  faction: [
    { kind: "force", title: "Salt Kings", subtitle: "Harbour host" },
    { kind: "selection", title: "Tide Callers", count: 2, detail: "Nets" },
    { kind: "selection", title: "Brine Guard", count: 5, detail: "Hooks, Standard" },
    { kind: "selection", title: "Reef Stalker" },
  ],
};

/** The stored outline (no engine, no session): force rows with an accent edge, selection rows with their saved costs when the snapshot has them. */
export function StoredOutline({ kind }: { kind: "source" | "faction" }) {
  return (
    <div className="ux-ro-outline">
      {STORED[kind].map((row, index) => row.kind === "force" ? (
        <div key={index} className="ux-ro-force-row"><strong>{row.title}</strong>{row.subtitle ? <small>{row.subtitle}</small> : null}</div>
      ) : (
        <div key={index} className="ux-ro-selection">
          <span><strong>{row.title}{row.count ? <small> ×{row.count}</small> : null}</strong>{row.detail ? <small>{row.detail}</small> : null}</span>
          {row.cost ? <b>{row.cost}</b> : null}
        </div>
      ))}
    </div>
  );
}

/** The saved totals and checks above a stored outline ("as last saved", a relative date). */
export function StoredTotals({ kind }: { kind: "source" | "faction" }) {
  return (
    <div className="ux-src-group">
      <div className="ux-src-kv"><span>Total · as last saved {kind === "source" ? "yesterday" : "3 days ago"}</span><b className="ux-ro-total">{kind === "source" ? "1,985 / 2,000 pts" : "1,480 / 1,500 pts"}</b></div>
      <div className="ux-src-kv"><span>Checks · as last saved</span><b>No errors</b></div>
    </div>
  );
}

/** A roster on the new data, read-only (Changed by update), or opened editable on a kept version: the live editor header and rows. */
function LiveEditorHeader({ readOnly, kind }: { readOnly: boolean; kind: ReadOnlyKind }) {
  const kept = !readOnly;
  return (
    <div className="ux-ro-live-head">
      <div className="ux-ro-meter" role="progressbar" aria-label="Budget" aria-valuemin={0} aria-valuemax={2000} aria-valuenow={kept ? 1985 : 1895}><span style={{ width: `${((kept ? 1985 : 1895) / 2000) * 100}%` }} /></div>
      <div className="ux-ro-budget"><strong>{kept ? "1,985" : "1,895"}<small> / 2,000 pts</small></strong><em>{kept ? "15 open" : "105 open"}</em></div>
      <div className={`ux-ro-status ${kept ? "ok" : "err"}`}>{kept ? <CircleCheck size={13} /> : <OctagonAlert size={13} />}{kept ? "No problems" : "1 error"}</div>
      <ReadOnlyChips readOnly={readOnly} kind={kind} />
    </div>
  );
}

function LiveEditorRows({ editable }: { editable: boolean }) {
  const units = editable
    ? [{ name: "Shield Wardens", count: 2, cost: "240" }, { name: "Scout Riders", cost: "65" }, { name: "Lantern Bearers", count: 3, cost: "90" }]
    : [{ name: "Shield Wardens", count: 2, cost: "240" }, { name: "Scout Riders", cost: "65" }, { name: "Lantern Bearers", count: 3, error: true }];
  return (
    <div className="ux-ro-outline">
      <div className="ux-ro-force-row live"><span><strong>Glass Legion</strong><small>Vanguard</small></span><b>{editable ? "395" : "305"}</b></div>
      {units.map((unit) => (
        <div key={unit.name} className={`ux-ro-selection live ${"error" in unit ? "error" : ""}`}>
          <span><strong>{unit.name}{unit.count ? <small> ×{unit.count}</small> : null}</strong></span>
          {"error" in unit ? <OctagonAlert size={15} aria-label="Error" /> : <b>{unit.cost}</b>}
        </div>
      ))}
      {editable ? <button type="button" className="ux-job-link ux-ro-add"><Plus size={13} />Add unit</button> : null}
      <div className="ux-ro-force-row live"><span><strong>Glass Legion</strong><small>Reserve</small></span><b>210</b></div>
      <div className="ux-ro-selection live"><span><strong>Iron Sentinels</strong></span><b>210</b></div>
    </div>
  );
}

/** The export sheet of a stored roster (built in battle-augur plan 2G part 1): the Battle Augur file always; text and New Recruit JSON from the saved snapshot. */
export function ReadOnlyExportSheet({ snapshot = true, inline = false }: { snapshot?: boolean; inline?: boolean }) {
  const formats = [
    { id: "file", title: "Battle Augur roster file", body: "The roster as stored. It opens fully once the data is back.", ok: true },
    { id: "text", title: "Text", body: snapshot ? "As last saved yesterday" : "Needs the game data", ok: snapshot },
    { id: "json", title: "New Recruit JSON", body: snapshot ? "As last saved yesterday" : "Needs the game data", ok: snapshot },
  ];
  const name = snapshot ? "Spring league list" : "Harbour raid";
  const sheet = (
    <section className={`ux-job-sheet ${inline ? "inline" : ""}`} role="dialog" aria-label="Export roster">
      <span className="ux-sheet-grip" aria-hidden />
      <header className="ux-job-head"><span><strong>Export roster</strong><small>{name} · read only</small></span><button type="button" className="ux-icon-btn" aria-label="Close"><X size={17} /></button></header>
      <div className="ux-fp-list ux-ro-formats" role="radiogroup" aria-label="Format">
        {formats.map((f, index) => (
          <button key={f.id} type="button" role="radio" aria-checked={index === 0} disabled={!f.ok} className={`ux-fp-row ${index === 0 ? "selected" : ""} ${f.ok ? "" : "installed"}`}>
            <span className={`ux-ro-radio ${index === 0 ? "on" : ""}`} aria-hidden>{index === 0 ? <CircleCheck size={20} /> : <Circle size={20} />}</span>
            <span><strong>{f.title}</strong><small>{f.body}</small></span>
          </button>
        ))}
      </div>
      <pre className="ux-ro-preview">{`{\n  "format": "battle-augur-roster",\n  "name": "${name}",\n  "forces": [ … ]\n}\n\n… 2,140 more characters`}</pre>
      <footer className="ux-job-footer"><button type="button" className="ux-job-btn"><Copy size={15} />Copy</button><button type="button" className="ux-job-btn primary"><Upload size={15} />Share</button></footer>
    </section>
  );
  return inline ? sheet : <div className="ux-job-scrim">{sheet}</div>;
}

/** Lists rows with data tags and the "Needs attention" filter: name, factions · system, the relative date, points and the tag. */
export function TaggedRosterRows() {
  const rows: Array<{ name: string; faction: string; system: string; when: string; points?: string; kind?: ReadOnlyKind }> = [
    { name: "Spring league list", faction: "Glass Legion", system: EXAMPLE_SYSTEM.name, when: "Opened yesterday", points: "1,895 / 2,000 pts", kind: "changed" },
    { name: "Harbour raid", faction: "Salt Kings", system: EXAMPLE_SYSTEM.name, when: "Changed 3 days ago", points: "1,480 / 1,500 pts", kind: "faction" },
    { name: "Old campaign", faction: "Iron Choir", system: "Example System Six", when: "Opened Sep 12, 2026", points: "980 / 1,000 pts", kind: "source" },
    { name: "Weekend practice", faction: "Northern Realms", system: EXAMPLE_SYSTEM.name, when: "Opened today", points: "1,240 / 1,500 pts" },
  ];
  return (
    <>
      <div className="ux-src-chips"><button type="button" className="ux-src-action"><TriangleAlert size={13} />Needs attention (3)</button></div>
      <div className="ux-source-list ux-managed-source-list ux-src-list">
        {rows.map((r) => (
          <article key={r.name} className="ux-source-row ux-src-row">
            <span><strong>{r.name}</strong><small>{r.faction} · {r.system}</small><small>{r.when}</small></span>
            <span className="ux-ro-list-trailing">{r.points ? <b>{r.points}</b> : null}{r.kind ? <RosterDataTag kind={r.kind} /> : null}</span>
          </article>
        ))}
      </div>
    </>
  );
}

type ReadOnlyPreview = ReadOnlyKind | "kept" | "export" | "export-none";

export function ReadOnlyRosterScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<ReadOnlyPreview>("source");
  const kind: ReadOnlyKind = preview === "export" ? "source" : preview === "export-none" ? "faction" : preview === "kept" ? "changed" : preview;
  const stored = kind === "source" || kind === "faction" ? kind : undefined;
  const live = stored === undefined;
  const faction = kind === "faction" ? "Salt Kings" : "Glass Legion";
  const name = kind === "faction" ? "Harbour raid" : "Spring league list";
  const openExport = () => setPreview(kind === "faction" ? "export-none" : "export");
  return (
    <>
      <SourceScreenHeader props={props} title={name} subtitle={`${faction} · ${EXAMPLE_SYSTEM.name}`} right={<span className="ux-ro-head-actions">{live ? <button type="button" className="ux-icon-btn" aria-label="Search roster"><Search size={17} /></button> : null}<button type="button" className="ux-icon-btn" aria-label="Export" onClick={openExport}><Upload size={17} /></button></span>} />
      <div className="ux-wb-home-body ux-sources-body ux-src-body">
        <PreviewState value={preview} options={[["source", "Source removed"], ["faction", "Faction removed"], ["changed", "Changed by update"], ["kept", "Opened with version"], ["export", "Export (snapshot)"], ["export-none", "Export (no snapshot)"]]} onChange={setPreview} />
        {live ? <LiveEditorHeader readOnly={preview !== "kept"} kind={kind} /> : <ReadOnlyChips kind={kind} />}
        {preview === "kept" ? <OpenedWithVersionNotice onUseNewest={() => setPreview("changed")} /> : <ReadOnlyBanner key={kind} kind={kind} onExport={openExport} onOpenWithVersion={() => setPreview("kept")} />}
        {stored ? <StoredTotals kind={stored} /> : null}
        {stored ? <StoredOutline kind={stored} /> : <LiveEditorRows editable={preview === "kept"} />}
        {stored ? <small className="ux-src-footer">{stored === "source" ? "Costs as last saved. Profiles and rules need the game data." : "No saved costs for this roster. Profiles and rules need the game data."}</small> : null}
      </div>
      {preview === "export" || preview === "export-none" ? <ReadOnlyExportSheet snapshot={preview === "export"} /> : null}
    </>
  );
}
