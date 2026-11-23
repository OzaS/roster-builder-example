import { Check, ChevronDown, ChevronsUpDown, Circle, FileArchive, Folder, FolderX, LoaderCircle, BookOpen, X } from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";
import { DiagIcon } from "../../glyphs";
import { diagOne, type DiagKind } from "../../sample";
import type { E1Mode, E1Platform } from "../types";
import { worstOf, type Recent } from "./data";
import "../../language/tokens.css";
import "../../language/primitives.css";
import "./start.css";

/**
 * Part A's building blocks: the window shell (macOS and Windows), the recent-dataset row, the dialog / sheet, the progress
 * row, the drop target, settings rows and their controls. The Elements view draws the same components.
 */

/** A key as the platform writes it: macOS glyphs, Windows names. */
export const keyFor = (platform: E1Platform, mac: string, win: string) => (platform === "mac" ? mac : win);

/**
 * A Field Cogitator window that isn't Direction D's editor: the start window, the settings window. Token scope (`.fc-cg`,
 * theme, platform layer, large text) plus D's primitive scope (`.fc-d`) and the shared window resets (`.fc-window`).
 */
export function E1Window({ mode, platform, width = 1440, height = 900, large, className = "", style, children, label }: {
  mode: E1Mode; platform: E1Platform; width?: number; height?: number | "auto"; large?: boolean; className?: string; style?: CSSProperties; children: ReactNode; label?: string;
}) {
  return (
    <div
      className={`fc-window fc-d fc-cg e1s-win ${mode} ${className}`}
      data-platform={platform === "windows" ? "windows" : undefined}
      data-text={large ? "large" : undefined}
      style={{ width, height: height === "auto" ? undefined : height, ...style }}
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  );
}

/* ---------- Recent-dataset row ---------- */

export function RecentHeads() {
  return <div className="cg-recent-heads" aria-hidden><span>Name</span><span>Folder</span><span className="num">DKLPO</span><span className="num">Layers</span><span>Last opened</span></div>;
}

const formIcon = (r: Recent) => (r.missing ? <FolderX size={15} /> : r.form === "archive" ? <FileArchive size={15} /> : r.form === "sample" ? <BookOpen size={15} /> : <Folder size={15} />);

/** Counts of the last check, by kind, with their icons; "No issues" in OK green when the check was clean. */
export function CheckCounts({ counts, when }: { counts: Partial<Record<DiagKind, number>>; when?: string }) {
  const kinds = (["error", "preservation", "suggestion"] as DiagKind[]).filter((k) => counts[k]);
  return (
    <span className="cg-recent-check">
      <span>Last check{when ? ` ${when}` : ""}:</span>
      {kinds.length ? kinds.map((k) => <span key={k}><DiagIcon kind={k} size={13} />{counts[k]} {diagOne[k].toLowerCase()}{counts[k] === 1 ? "" : "s"}</span>) : <span><Check size={13} className="d-ok" />No issues</span>}
    </span>
  );
}

/**
 * One recent dataset: icon, title (with a tag for an archive or the sample), folder, DKLPO version, layers on / total, last
 * opened; the status edge shows the last check's worst kind. Selected, it opens a second line with the last check and the
 * actions (or, for a missing dataset, what happened and Locate… / Remove from the list).
 */
export function RecentRow({ r, platform, selected, onSelect, onOpen, more, rowRef }: {
  r: Recent; platform: E1Platform; selected?: boolean; onSelect?: () => void; onOpen?: () => void; more?: ReactNode; rowRef?: (el: HTMLDivElement | null) => void;
}) {
  const edge = r.missing ? undefined : worstOf(r.lastCheck?.counts);
  return (
    <div
      ref={rowRef}
      role="option"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      data-id={r.id}
      className={`cg-recent${selected ? " selected" : ""}${r.missing ? " missing" : ""}${edge ? ` edge-${edge}` : ""}`}
      onClick={onSelect}
      onDoubleClick={onOpen}
      title={edge ? `Last check: ${diagOne[edge].toLowerCase()}s` : undefined}
    >
      <div className="cg-recent-line">
        {formIcon(r)}
        <span className="cg-recent-name">
          <span>{r.title}</span>
          {r.form === "archive" ? <span className="cg-tag" title="A dataset archive; opens read-only">Archive</span> : r.form === "sample" ? <span className="cg-tag" title="Ships with the app; opens read-only">Sample</span> : null}
        </span>
        {r.missing ? <span className="cg-missing"><X size={13} />Not found on disk</span> : <span className="cg-recent-path" title={r.path[platform]}><bdi dir="ltr">{r.path[platform]}</bdi></span>}
        <span className="cg-recent-cell num">{r.dklpo}</span>
        <span className="cg-recent-cell num">{r.layers[0]} of {r.layers[1]}</span>
        <span className="cg-recent-cell">{r.lastOpened}</span>
      </div>
      {selected && more ? <div className="cg-recent-more">{more}</div> : null}
    </div>
  );
}

/* ---------- Progress row ---------- */

export type StepStatus = "done" | "running" | "waiting" | "failed";
export function ProgressRow({ status, label, count, value }: { status: StepStatus; label: ReactNode; count?: ReactNode; value?: number }) {
  const icon = status === "done" ? <Check size={15} /> : status === "running" ? <LoaderCircle size={15} /> : status === "failed" ? <X size={15} /> : <Circle size={15} />;
  return (
    <div className={`cg-progress ${status}`}>
      {icon}
      <span>{label}</span>
      <span className="cg-progress-count">{count}</span>
      {status === "running" && value !== undefined ? (
        <span className="cg-progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-label={typeof label === "string" ? label : undefined}><i style={{ width: `${Math.round(value * 100)}%` }} /></span>
      ) : null}
    </div>
  );
}

/* ---------- Dialog / sheet ---------- */

export type DlgAction = {
  label: string;
  kind?: "primary" | "danger";
  /** The safe choice: Esc does it. */
  cancel?: boolean;
  /** macOS puts it at the far left (Don't save, Choose another folder…). */
  left?: boolean;
  title?: string;
  onClick?: () => void;
};

/**
 * A modal dialog: a sheet below the title row on macOS, a centred dialog with a footer band on Windows. What happened in
 * one sentence (the title), the file or folder, a few lines, the choices as verbs. The primary takes Return / Enter, the
 * safe choice Esc (the window that shows it handles the keys); Windows orders primary, other choices, then the safe one (ContentDialog).
 */
export function Dialog({ platform, tone = "warn", icon, title, target, children, actions, width }: {
  platform: E1Platform; tone?: "error" | "warn" | "info"; icon: ReactNode; title: ReactNode; target?: ReactNode; children?: ReactNode; actions: DlgAction[]; width?: number;
}) {
  const ordered = platform === "mac"
    ? [...actions.filter((a) => a.left), ...actions.filter((a) => !a.left)]
    : [...actions.filter((a) => a.kind === "primary"), ...actions.filter((a) => a.kind !== "primary" && !a.cancel), ...actions.filter((a) => a.cancel && a.kind !== "primary")];
  return (
    <div className={`cg-dialog${platform === "mac" ? " sheet" : ""}`} role="alertdialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined} style={width ? { width } : undefined}>
      <div className="cg-dialog-main">
        <span className={`cg-dialog-icon ${tone}`} aria-hidden>{icon}</span>
        <div>
          <h2>{title}</h2>
          {target ? <p className="cg-dialog-target">{target}</p> : null}
          {children ? <div className="cg-dialog-body">{children}</div> : null}
        </div>
      </div>
      <footer className="cg-dialog-actions">
        {ordered.map((a) => (
          <button key={a.label} type="button" title={a.title} onClick={a.onClick}
            className={`d-btn${a.kind === "primary" ? " primary" : a.kind === "danger" ? " danger" : ""}${a.left && platform === "mac" ? " cg-dialog-left" : ""}`}>
            {a.label}
            {a.kind === "primary" ? <kbd>{keyFor(platform, "↵", "Enter")}</kbd> : a.cancel ? <kbd>Esc</kbd> : null}
          </button>
        ))}
      </footer>
    </div>
  );
}

/* ---------- Settings rows and controls ---------- */

export function SetRow({ label, help, children, top, stack }: { label: ReactNode; help?: ReactNode; children: ReactNode; top?: boolean; stack?: boolean }) {
  return (
    <div className={`cg-set-row${top ? " top" : ""}${stack ? " stack" : ""}`}>
      <span className="cg-set-label">{label}</span>
      <span className="cg-set-control">{children}</span>
      {help ? <p className="cg-set-help">{help}</p> : null}
    </div>
  );
}

/** An on/off setting: a checkbox with its text on macOS; a switch with On / Off on Windows (the row label carries the text). */
export function Toggle({ platform, on, text, onChange, disabled }: { platform: E1Platform; on: boolean; text: string; onChange?: (on: boolean) => void; disabled?: boolean }) {
  if (platform === "windows") {
    return <button type="button" role="switch" aria-checked={on} aria-label={text} className="cg-switch" disabled={disabled} onClick={() => onChange?.(!on)}>{on ? "On" : "Off"}<i /></button>;
  }
  return <button type="button" role="checkbox" aria-checked={on} className="cg-check" disabled={disabled} onClick={() => onChange?.(!on)}><i>{on ? <Check size={11} strokeWidth={3} /> : null}</i>{text}</button>;
}

/** A row for an on/off setting: macOS puts the group label at the left and the text by the checkbox; Windows names the row with the text. */
export function ToggleRow({ platform, group, text, help, on, onChange }: { platform: E1Platform; group?: string; text: string; help?: ReactNode; on: boolean; onChange?: (on: boolean) => void }) {
  return (
    <SetRow label={platform === "mac" ? (group ?? "") : text} help={help}>
      <Toggle platform={platform} on={on} text={text} onChange={onChange} />
    </SetRow>
  );
}

export function Radios<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: ReactNode; note?: ReactNode }[]; onChange?: (id: T) => void; label: string }) {
  return (
    <span className="cg-radios" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className="cg-radio" onClick={() => onChange?.(o.id)}>
          <i /><span>{o.label}</span>{o.note ? <small>{o.note}</small> : null}
        </button>
      ))}
    </span>
  );
}

/** Pop-up button (macOS) / drop-down (Windows): opens the context-menu primitive with the options, the current one ticked. */
export function Select({ platform, value, options, onChange, label }: { platform: E1Platform; value: string; options: string[]; onChange?: (value: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="cg-select-wrap">
      <button type="button" className="cg-select" aria-haspopup="listbox" aria-expanded={open} aria-label={`${label}: ${value}`} onClick={() => setOpen(!open)}
        onKeyDown={(event) => { if (event.key === "Escape" && open) { event.stopPropagation(); setOpen(false); } }}>
        {value}{platform === "mac" ? <ChevronsUpDown size={13} /> : <ChevronDown size={15} />}
      </button>
      {open ? (
        <span className="cg-menu" role="listbox" aria-label={label}>
          {options.map((o) => (
            <button key={o} type="button" role="option" aria-selected={o === value} className="cg-menu-item" onClick={() => { onChange?.(o); setOpen(false); }}>
              {o === value ? <Check size={14} /> : <span style={{ width: 14 }} />}{o}
            </button>
          ))}
        </span>
      ) : null}
    </span>
  );
}
