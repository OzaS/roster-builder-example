import { useState, type ReactNode } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight, Circle, CircleArrowUp, CircleCheck, Database, Download, Ellipsis, FileInput, FolderGit2, Globe, Hand, History, Info, Library, ListChecks, LoaderCircle, Minus, OctagonAlert, Plus, Search, Star, TriangleAlert, X } from "lucide-react";
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

/** The hideable job sheet (native form sheet, large detent). Swipe down or Hide keeps the job running. */
export function JobModal({
  title,
  subtitle,
  percent,
  stepLabel,
  steps,
  queue = [],
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
  queue?: string[];
  outcome?: JobOutcome;
  notice?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  inline?: boolean;
}) {
  const sheet = (
    <section className={`ux-job-sheet ${inline ? "inline" : ""}`} role="dialog" aria-label={title}>
      <span className="ux-sheet-grip" aria-hidden />
      <header className="ux-job-head">
        <span><strong>{title}</strong><small>{subtitle}</small></span>
        {outcome ? <button type="button" className="ux-icon-btn" aria-label="Close"><X size={17} /></button> : <button type="button" className="ux-job-hide" aria-label="Hide. The work continues."><ChevronDown size={16} />Hide</button>}
      </header>
      {percent !== undefined && !outcome ? (
        <div className="ux-job-overall">
          <JobProgressBar value={percent / 100} />
          <small>{percent}% · {stepLabel}</small>
        </div>
      ) : null}
      {notice}
      {children ?? <JobSteps steps={steps} />}
      {queue.length ? (
        <div className="ux-job-queue">
          <div className="ux-result-label">Up next</div>
          {queue.map((item) => <div key={item} className="ux-job-queue-row"><Database size={15} /><span>{item}</span><button type="button" aria-label={`Remove ${item} from queue`}><X size={14} /></button></div>)}
        </div>
      ) : null}
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
export function JobPill({ label, percent, count = 1, needsYou = false, inline = false }: { label: string; percent?: number; count?: number; needsYou?: boolean; inline?: boolean }) {
  const ring = percent === undefined ? undefined : { background: `conic-gradient(var(--ux-accent) ${percent * 3.6}deg, var(--ux-surface-3) 0)` };
  return (
    <button type="button" className={`ux-job-pill ${needsYou ? "needs" : ""} ${inline ? "inline" : ""}`} aria-label={`${label}${percent === undefined ? "" : `, ${percent} percent`}. Opens the progress.`}>
      {needsYou ? <Hand size={15} /> : <span className="ux-job-ring" style={ring}><span /></span>}
      {count > 1 ? <b>{count} jobs</b> : null}
      <span>{label}{percent === undefined ? "" : ` · ${percent}%`}</span>
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

type InstallPreview = "running" | "hidden" | "queued" | "choose" | "choose-hidden" | "done" | "failed" | "cancelled" | "toasts";

const INSTALL_PREVIEWS: Array<[InstallPreview, string]> = [
  ["running", "Running"],
  ["hidden", "Hidden"],
  ["queued", "2 jobs"],
  ["choose", "Choose factions"],
  ["choose-hidden", "Needs you"],
  ["done", "Done"],
  ["failed", "Failed"],
  ["cancelled", "Cancelled"],
  ["toasts", "Toasts"],
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
  if (preview === "hidden" || preview === "toasts") {
    return (
      <>
        <SourcesBackdrop props={props}>{control}</SourcesBackdrop>
        <div className="ux-job-float">
          {preview === "toasts" ? (
            <>
              <JobToast tone="err" message={`Could not install ${EXAMPLE_SYSTEM.name}`} action="Details" />
              <JobToast tone="ok" message={`Installed ${EXAMPLE_SYSTEM.name}`} action="View" />
            </>
          ) : <JobPill label={`Installing ${EXAMPLE_SYSTEM.name}`} percent={46} />}
        </div>
      </>
    );
  }
  let modal: ReactNode;
  if (preview === "running" || preview === "queued") {
    modal = <JobModal title={title} subtitle={subtitle} percent={46} stepLabel="Step 3 of 4" steps={installSteps("import")} queue={preview === "queued" ? ["Updating Example System Two"] : []} />;
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
        notice={<JobOutcomeNotice outcome="cancelled" title="Install stopped" body="7 of 23 factions were installed. Install the rest from the source." />}
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

type SourcesPreview = "installed" | "updates" | "selecting" | "updating" | "failed" | "empty";

export function SourcesManageScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<SourcesPreview>("updates");
  const [selected, setSelected] = useState<string[]>([EXAMPLE_SYSTEM.name]);
  const selecting = preview === "selecting";
  const sources = EXAMPLE_SOURCES.map((s) => {
    if (preview === "installed") return { ...s, status: (s.status === "update" ? "ready" : s.status) as SourceStatus };
    if (preview === "updating" && s.name === EXAMPLE_SYSTEM.name) return { ...s, status: "updating" as SourceStatus };
    return s;
  });
  const toggle = (name: string) => setSelected((cur) => (cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]));
  return (
    <>
      <SourceScreenHeader props={props} title={selecting ? `${selected.length} selected` : "Sources"} subtitle={selecting ? "Choose sources to update" : "Installed game data"} right={selecting ? <button type="button" className="ux-job-hide" onClick={() => setPreview("updates")}>Cancel</button> : undefined} />
      <div className="ux-wb-home-body ux-sources-body ux-src-body">
        <PreviewState value={preview} options={[["installed", "Installed"], ["updates", "Updates"], ["selecting", "Selecting"], ["updating", "Updating"], ["failed", "Install failed"], ["empty", "Empty"]]} onChange={setPreview} />
        {!selecting ? (
          <button type="button" className="ux-add-source-primary" onClick={() => props.onNavigate("add-source")}>
            <Plus size={18} /><span><strong>Add game data</strong><small>Collections, a repository link, or GitHub search</small></span><ChevronRight size={17} />
          </button>
        ) : null}
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
    </>
  );
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
      <div className="ux-job-notice warning"><TriangleAlert size={18} /><span><strong>2 rosters use Salt Kings, which this update removes.</strong><small>They will not open after the update. (Open: the handling of removed factions.)</small></span></div>
      <div className="ux-job-footer"><button type="button" className="ux-job-btn ux-src-ghost">View on GitHub</button><button type="button" className="ux-job-btn primary">Update</button></div>
    </section>
  );
}

export function LastUpdateCard({ onReport }: { onReport?: () => void }) {
  return (
    <section className="ux-src-card">
      <header><History size={18} /><span><strong>Updated today from 1a2b3c4 to a1b2c3d</strong><small>3 rosters moved: 2 unchanged, 1 with changes</small></span></header>
      <button type="button" className="ux-job-btn secondary block" onClick={onReport}>View report</button>
    </section>
  );
}

type DetailPreview = "update" | "current" | "updating" | "updated" | "failed";

function DetailRow({ label, value, action }: { label: string; value: string; action?: string }) {
  return <div className="ux-src-kv"><span>{label}</span><b>{value}</b>{action ? <button type="button" className="ux-job-link">{action}</button> : null}</div>;
}

export function SourceDetailScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<DetailPreview>("update");
  return (
    <>
      <SourceScreenHeader props={props} title={EXAMPLE_SYSTEM.name} subtitle={EXAMPLE_SYSTEM.repo} />
      <div className="ux-wb-home-body ux-sources-body ux-src-body">
        <PreviewState value={preview} options={[["update", "Update available"], ["current", "Up to date"], ["updating", "Updating"], ["updated", "Updated"], ["failed", "Update failed"]]} onChange={setPreview} />
        {preview === "update" ? <SourceUpdateCard /> : null}
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
        <div className="ux-src-group">
          <DetailRow label="Repository" value={EXAMPLE_SYSTEM.repo} />
          <DetailRow label="Version" value={preview === "updated" ? "a1b2c3d" : "1a2b3c4"} />
          <DetailRow label="Changed upstream" value="2026-09-30" />
          <DetailRow label="Installed" value="12 days ago" />
          <DetailRow label="Last checked" value={preview === "failed" ? "1 h ago" : "5 min ago"} action="Check now" />
          <DetailRow label="Size on this phone" value="41 MB" />
        </div>
        <div className="ux-result-label">Installed factions</div>
        <div className="ux-src-group">{EXAMPLE_FACTIONS.slice(0, 4).map((f) => <DetailRow key={f} label={f} value="r14" />)}<DetailRow label="…and 19 more" value="" /></div>
        <button type="button" className="ux-job-btn destructive block ux-src-remove" disabled={preview === "updating"}>Remove this data</button>
        {preview === "updating" ? <small className="ux-src-footer">This data is being updated. Try again when it finishes.</small> : null}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- migration report

export function MigrationReportBody() {
  return (
    <>
      <div className="ux-src-chips"><Chip tone="neutral">3 rosters</Chip><Chip tone="valid">2 unchanged</Chip><Chip tone="warning">1 changed</Chip><Chip tone="neutral">0 not moved</Chip></div>
      <div className="ux-result-label">Changed</div>
      <section className="ux-src-card">
        <header><TriangleAlert size={18} className="warn" /><span><strong>Spring league list</strong><small>Glass Legion</small></span></header>
        <ul className="ux-src-changes">
          <li><b>Removed</b>Lantern Bearers (no longer in the data)</li>
          <li><b>Cost</b>Shield Wardens: 120 → 135</li>
          <li><b>Renamed</b>Scout Riders → Outriders</li>
          <li><b>Errors</b>1 new error</li>
        </ul>
        <button type="button" className="ux-job-btn secondary block">Open roster</button>
      </section>
      <div className="ux-result-label">Unchanged</div>
      <div className="ux-src-group"><DetailRow label="Weekend practice" value="Northern Realms" /><DetailRow label="Club night" value="Tidewardens" /></div>
      <div className="ux-result-label">Data changes</div>
      <div className="ux-src-group"><DetailRow label="Glass Legion" value="r12 → r14" /><DetailRow label="Northern Realms" value="r30 → r31" /><DetailRow label="Hollow Crown" value="New" /><DetailRow label="Salt Kings" value="Removed" /></div>
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
  if (action === "queued") return <button type="button" className="ux-src-action quiet">Queued</button>;
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

export function UserCollectionRows({ onOpen }: { onOpen?: () => void }) {
  return (
    <div className="ux-src-group">
      <button type="button" className="ux-col-nav" onClick={onOpen}><FolderGit2 size={17} /><span><strong>Club picks</strong><small>6 sources · collection</small></span><ChevronRight size={16} /></button>
      <button type="button" className="ux-col-nav" onClick={onOpen}><Globe size={17} /><span><strong>community-data</strong><small>48 repositories · GitHub organisation</small></span><ChevronRight size={16} /></button>
      <button type="button" className="ux-col-nav add"><Plus size={17} /><span><strong>Add a collection or library</strong><small>A collection file or a GitHub organisation</small></span><ChevronRight size={16} /></button>
    </div>
  );
}

type AddSheetState = "idle" | "found" | "invalid" | "repository";

export function AddCollectionSheet({ state, inline = false }: { state: AddSheetState; inline?: boolean }) {
  const value = state === "idle" ? "" : state === "repository" ? "github.com/example-org/example-system-six" : state === "invalid" ? "example.com/notes.txt" : "github.com/club-org/club-picks";
  const sheet = (
    <section className={`ux-job-sheet ${inline ? "inline" : ""}`} role="dialog" aria-label="Add a collection or library">
      <span className="ux-sheet-grip" aria-hidden />
      <header className="ux-job-head"><span><strong>Add a collection or library</strong><small>Lists of repositories to install from</small></span><button type="button" className="ux-icon-btn" aria-label="Close"><X size={17} /></button></header>
      <label className="ux-col-field">
        <span>Collection or library link</span>
        <div className={`ux-source-url ${state === "invalid" ? "invalid" : ""}`}><input aria-label="Collection or library link" placeholder="https://… or github.com/name" defaultValue={value} key={value} /><button type="button">Find</button></div>
        <small className={state === "invalid" ? "ux-source-error" : ""}>{state === "invalid" ? "That link does not lead to a collection file or a GitHub organisation." : "A collection file (.json) or a GitHub organisation or user (github.com/name)."}</small>
      </label>
      {state === "found" ? (
        <div className="ux-src-card">
          <header><FolderGit2 size={18} /><span><strong>Club picks</strong><small>Collection · by club-org · 6 sources</small></span></header>
          <small className="ux-col-desc">The systems our club plays, with the repositories we trust.</small>
        </div>
      ) : null}
      {state === "repository" ? <div className="ux-job-notice info"><Info size={18} /><span><strong>That is a repository, not a collection.</strong><small>Install it directly instead.</small></span><button type="button" className="ux-job-btn primary">Install it</button></div> : null}
      <small className="ux-src-footer">Collections only list repositories. Nothing is downloaded until you install.</small>
      <footer className="ux-job-footer"><button type="button" className="ux-job-btn secondary">Cancel</button><button type="button" className="ux-job-btn primary" disabled={state !== "found"}>Add collection</button></footer>
    </section>
  );
  return inline ? sheet : <div className="ux-job-scrim">{sheet}</div>;
}

type AddPreview = "collections" | "add" | "invalid" | "repository";

export function AddGameDataScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<AddPreview>("collections");
  const install = () => props.onNavigate("install-job");
  return (
    <>
      <SourceScreenHeader props={props} title="Add game data" subtitle="Collections, a link, or GitHub search" />
      <div className="ux-wb-home-body ux-add-source-body ux-src-body">
        <PreviewState value={preview} options={[["collections", "Collections"], ["add", "Add collection"], ["invalid", "Invalid link"], ["repository", "Repository link"]]} onChange={setPreview} />
        <div className="ux-result-label">Collections</div>
        <DefaultCollectionCard onInstall={install} onShowAll={() => props.onNavigate("collection")} />
        <UserCollectionRows onOpen={() => props.onNavigate("collection")} />
        <div className="ux-result-label">Repository</div>
        <section className="ux-source-method">
          <div className="ux-source-method-heading"><span className="ux-setting-icon"><FileInput size={18} /></span><span><strong>Have a link?</strong><small>Any GitHub repository with roster data files (.gst and .cat, or their JSON form).</small></span></div>
          <div className="ux-source-url"><input aria-label="Repository" placeholder="owner/name or a GitHub link" /><button type="button" onClick={install}>Continue</button></div>
        </section>
        <div className="ux-src-group"><button type="button" className="ux-col-nav"><Search size={17} /><span><strong>Search GitHub</strong><small>Repositories with game data, by name or organisation</small></span><ChevronRight size={16} /></button></div>
      </div>
      {preview !== "collections" ? <AddCollectionSheet state={preview === "add" ? "found" : preview} /> : null}
    </>
  );
}

type CollectionPreview = "collection" | "library" | "offline";

export function CollectionScreen({ props }: { props: ConceptProps }) {
  const [preview, setPreview] = useState<CollectionPreview>("collection");
  const library = preview === "library";
  const entries: CollectionEntry[] = library
    ? [
        { name: "example-system-six", description: "Community data for a skirmish game", repo: "community-data/example-system-six", action: "install" },
        { name: "example-system-two", description: "Mass battles, points-based", repo: "community-data/example-system-two", action: "installed" },
        { name: "example-system-seven", description: "Older edition, no longer maintained", repo: "community-data/example-system-seven", archived: true, action: "install" },
      ]
    : [...DEFAULT_COLLECTION.slice(0, 4), { ...DEFAULT_COLLECTION[4], action: "running" }];
  return (
    <>
      <SourceScreenHeader props={props} title={library ? "community-data" : "Battle Augur sources"} subtitle={library ? "GitHub organisation · 48 repositories" : "Collection · Default"} right={<button type="button" className="ux-icon-btn" aria-label="More"><Ellipsis size={18} /></button>} />
      <div className="ux-wb-home-body ux-add-source-body ux-src-body">
        <PreviewState value={preview} options={[["collection", "Collection"], ["library", "Library"], ["offline", "Offline"]]} onChange={setPreview} />
        {preview === "offline" ? <div className="ux-job-notice warning"><TriangleAlert size={18} /><span><strong>Showing the copy from 2026-10-14</strong><small>No connection. Installing needs one.</small></span></div> : null}
        <small className="ux-col-desc">{library ? "Repositories of this organisation that hold game data." : "Game systems we test with Battle Augur. Maintained in a public repository; updated without an app release."}</small>
        <div className="ux-search-field ux-col-search"><Search size={15} /><input aria-label="Search this collection" placeholder={library ? "Search 48 repositories" : "Search 12 sources"} /></div>
        <div className="ux-source-list ux-managed-source-list ux-src-list">
          {entries.map((entry) => <CollectionSourceRow key={entry.repo} entry={entry} onInstall={() => props.onNavigate("install-job")} />)}
        </div>
        {library ? <button type="button" className="ux-job-link ux-col-more">Show archived (3)</button> : null}
      </div>
    </>
  );
}

export function MigrationReportScreen({ props }: { props: ConceptProps }) {
  return (
    <>
      <SourceScreenHeader props={props} title="Update report" subtitle={`${EXAMPLE_SYSTEM.name} · 1a2b3c4 → a1b2c3d · today`} />
      <div className="ux-wb-home-body ux-sources-body ux-src-body">
        <MigrationReportBody />
        <small className="ux-src-footer">What the engine reports per roster is Open (plan 2F). Kept until the next update of this source.</small>
      </div>
    </>
  );
}
