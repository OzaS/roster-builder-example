import { useState, type ReactNode } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Circle, CircleCheck, Database, Hand, LoaderCircle, OctagonAlert, Plus, X } from "lucide-react";
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

// ---------------------------------------------------------------- gallery screen: install job

type InstallPreview = "running" | "hidden" | "queued" | "done" | "failed" | "cancelled" | "toasts";

const INSTALL_PREVIEWS: Array<[InstallPreview, string]> = [
  ["running", "Running"],
  ["hidden", "Hidden"],
  ["queued", "2 jobs"],
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
      <div className="ux-wb-home-body ux-sources-body ux-job-backdrop">
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
        notice={<JobOutcomeNotice outcome="cancelled" title="Install cancelled" body="Nothing was installed. (Open: or “7 of 23 factions were installed”, decided in plan 2A.)" />}
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
