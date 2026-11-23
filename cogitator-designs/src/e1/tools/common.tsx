import { Check, CircleDashed, Code2, Copy, Focus, Minus, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { DiagIcon } from "../../glyphs";
import { diagOne, type DiagKind } from "../../sample";
import { sourceById } from "../../directions/direction-d-content";
import { layout } from "../../language/layout";
import { ironWardens } from "../editor/data";
import { LinkedPage } from "../editor/page";
import { BackForward, EditorGrid, Sidebar, SourceList, Win, type Mode } from "../editor/shell";
import type { Edit } from "./data";
import "./tools.css";

/**
 * Shared parts of the E1 tool screens (part 2, worker A). The editor window is composed from the part B shell
 * (`../editor/shell`: Win, Sidebar, SourceList, EditorGrid) and page (`LinkedPage`), never forked; this file only adds
 * the tool pieces: a contract / result row, fact lists, a diff hunk, a sheet frame and a copyable command.
 */

export const kindPlural: Record<DiagKind, string> = { error: "Errors", preservation: "Preservation failures", suggestion: "Authoring suggestions" };

/** The editor behind a sheet or a popover: sidebar, Iron Wardens in the list, an entry page. `overlay` floats over it. */
export function EditorBehind({ mode, interactive, onClaim, entry = "iron-wardens:warden-squad", top, overlay, popover, foot, updates = 10, modal }: {
  mode: Mode; interactive: boolean; onClaim?: () => void; entry?: string; top?: ReactNode; overlay?: ReactNode; popover?: ReactNode; foot?: ReactNode; updates?: number; modal?: boolean;
}) {
  const list = sourceById("iron-wardens");
  const name = entry.split(":")[1].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return (
    <Win mode={mode} interactive={interactive} onClaim={onClaim}>
      <div className="cg-tl-contents" inert={modal ? true : undefined}>
        <EditorGrid side={<Sidebar source="iron-wardens" entry={entry} updates={updates} foot={foot} />} list={list ? <SourceList source={list} entry={entry} /> : undefined}>
          <main className="d-main" aria-label="Entry">
            <header className="d-top">
              <BackForward />
              <span className="d-crumbs">Iron Wardens<span>/</span>{name}</span>
              <span className="d-spacer" />
              {top ?? (
                <>
                  <span className="d-muted">Edited just now</span>
                  <button type="button" className="d-ghost" title="Focus mode: hide the sidebar (⌘.)"><Focus size={14} />Focus<kbd>⌘.</kbd></button>
                  <button type="button" className="d-ghost" title="Show the DKLPO text beside the page (⌘⌥U)"><Code2 size={14} />Source</button>
                </>
              )}
            </header>
            <div className="d-scroll helper-collapsed"><div className="d-doc"><LinkedPage id={entry} module={ironWardens} noTail /></div></div>
            {popover}
          </main>
        </EditorGrid>
      </div>
      {overlay}
    </Win>
  );
}

/** A result mark: equal / different / not run / refused, as an icon and a word (shape as well as colour). */
export type Verdict = "equal" | "different" | "not-run" | "refused" | "running";
export function VerdictMark({ v, children }: { v: Verdict; children?: ReactNode }) {
  const icon = v === "equal" ? <Check size={13} /> : v === "different" ? <DiagIcon kind="preservation" size={13} /> : v === "refused" ? <X size={13} /> : v === "running" ? <CircleDashed size={13} /> : <Minus size={13} />;
  const word = v === "equal" ? "Equal" : v === "different" ? "Different" : v === "refused" ? "Refused" : v === "running" ? "Running" : "Not run";
  return <span className={`cg-tl-verdict ${v}`}>{icon}{children ?? word}</span>;
}

/**
 * A contract row: C1 / C2 / C3 (or a step of the reverse route) with what it compares, its verdict and a detail line.
 * An open row with a status edge, not a box.
 */
export function ContractRow({ tag, title, what, v, detail, selected, onClick }: { tag: string; title: string; what: ReactNode; v: Verdict; detail?: ReactNode; selected?: boolean; onClick?: () => void }) {
  const edge = v === "different" ? "edge-preservation" : v === "refused" ? "edge-error" : v === "equal" ? "edge-ok" : "";
  const body = (
    <>
      <span className="cg-tl-ctag">{tag}</span>
      <span className="cg-tl-cmain"><strong>{title}</strong><span className="d-muted">{what}</span>{detail ? <span className="cg-tl-cdetail">{detail}</span> : null}</span>
      <VerdictMark v={v} />
    </>
  );
  return onClick
    ? <button type="button" className={`cg-tl-contract ${edge}${selected ? " selected" : ""}`} aria-pressed={selected} onClick={onClick}>{body}</button>
    : <div className={`cg-tl-contract ${edge}`}>{body}</div>;
}

/** Counts of one diagnostic class with its codes: a row that leads to the inbox filtered by that class. */
export function ClassRow({ kind, n, codes, muted, onOpen }: { kind: DiagKind; n: number; codes: { code: string; n: number }[]; muted?: boolean; onOpen?: () => void }) {
  return (
    <button type="button" className={`cg-tl-class${n ? "" : " zero"}${muted ? " muted" : ""}`} onClick={onOpen} title={n ? `Open the inbox with the ${kindPlural[kind].toLowerCase()} (⌘⇧U)` : `No ${kindPlural[kind].toLowerCase()}`} disabled={!n}>
      <DiagIcon kind={kind} size={14} />
      <span className="cg-tl-class-n num">{n}</span>
      <span>{kindPlural[kind]}</span>
      <span className="cg-tl-codes">{codes.map((c) => <span key={c.code} className="mono">{c.code}{c.n > 1 ? ` ×${c.n}` : ""}</span>)}</span>
    </button>
  );
}

/** Label / value facts (dt / dd), as in the inbox detail. */
export function Facts({ rows, className = "" }: { rows: { label: string; value: ReactNode }[]; className?: string }) {
  return <dl className={`cg-ib-facts cg-tl-facts ${className}`}>{rows.map((r) => <div key={r.label}><dt>{r.label}</dt><dd>{r.value}</dd></div>)}</dl>;
}

/** A diff hunk: removed / added / kept lines with the old line number, the inbox's `.cg-diff` block. */
export function Hunk({ title, note, edits }: { title: ReactNode; note?: ReactNode; edits: Edit[] }) {
  return (
    <div className="cg-diff cg-tl-hunk">
      <p className="cg-diff-head">{title}<span className="d-spacer" />{note}</p>
      {edits.flatMap((e, i) => {
        const out: ReactNode[] = [];
        if (e.before !== undefined) out.push(<p key={`${i}b`} className="cg-diff-line del cg-tl-numbered"><span className="cg-tl-ln">{e.line}</span><span className="cg-diff-sign" aria-label="removed">-</span><span>{e.before}</span></p>);
        if (e.after !== undefined) out.push(<p key={`${i}a`} className="cg-diff-line add cg-tl-numbered"><span className="cg-tl-ln">{e.before !== undefined ? "" : e.line}</span><span className="cg-diff-sign" aria-label="added">+</span><span>{e.after}</span></p>);
        return out;
      })}
    </div>
  );
}

/** The command the same run is on the command line, with Copy (the editor is a thin UI over the same APIs). */
export function CommandLine({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <p className="cg-tl-cmd">
      <code>{command}</code>
      <button type="button" className="d-btn sm" onClick={() => setCopied(true)} title="Copy the command to the clipboard"><Copy size={12} />{copied ? "Copied" : "Copy"}</button>
    </p>
  );
}

/** Sheet widths: a form sheet (export) and a preview sheet (rename), the page column at its widest. */
export const sheetWidth = 600;
export const previewWidth = layout.pageMax;

/** A sheet action: like the dialog primitive's, plus disabled-with-a-reason (the reason is its tooltip and shown in the sheet). */
export type SheetAction = { label: ReactNode; kind?: "primary" | "danger"; cancel?: boolean; left?: boolean; disabled?: boolean; title?: string; onClick?: () => void; key?: string };

/**
 * A sheet (macOS) in the dialog primitive's classes (`.cg-dialog.sheet`, icon, title, target, body, actions), for the
 * tool sheets that need more than the alert dialog: wider bodies, actions that can be unavailable, a note beside them.
 */
export function Sheet({ tone = "info", icon, title, target, children, actions, width, note, label }: {
  tone?: "error" | "warn" | "info"; icon: ReactNode; title: ReactNode; target?: ReactNode; children?: ReactNode; actions: SheetAction[]; width: number; note?: ReactNode; label: string;
}) {
  return (
    <div className="cg-dialog sheet cg-tl-sheet" role="dialog" aria-modal="true" aria-label={label} style={{ width }}>
      <div className="cg-dialog-main">
        <span className={`cg-dialog-icon ${tone}`} aria-hidden>{icon}</span>
        <div>
          <h2>{title}</h2>
          {target ? <p className="cg-dialog-target">{target}</p> : null}
          {children ? <div className="cg-dialog-body cg-tl-sheet-body">{children}</div> : null}
        </div>
      </div>
      <footer className="cg-dialog-actions">
        {note ? <span className="cg-tl-sheet-note">{note}</span> : null}
        {actions.map((a, i) => (
          <button key={i} type="button" title={a.title} onClick={a.onClick} disabled={a.disabled}
            className={`d-btn${a.kind === "primary" ? " primary" : a.kind === "danger" ? " danger" : ""}${a.left ? " cg-dialog-left" : ""}`}>
            {a.label}{a.key ? <kbd>{a.key}</kbd> : a.kind === "primary" ? <kbd>↵</kbd> : a.cancel ? <kbd>Esc</kbd> : null}
          </button>
        ))}
      </footer>
    </div>
  );
}

/** A section heading inside a tool view or a sheet (13/18, 600, sentence case, with a muted note). */
export function Head({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return <h3 className="cg-tl-h">{children}{note ? <span className="d-muted">{note}</span> : null}</h3>;
}

export const diagName = (kind: DiagKind, n: number) => `${n} ${diagOne[kind].toLowerCase()}${n === 1 ? "" : "s"}`;
