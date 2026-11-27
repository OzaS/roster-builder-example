import { ArrowDownLeft, Check, ChevronDown, ChevronRight, CircleAlert, Copy, CornerDownLeft, FileCode2, Hash, Play, RefreshCw, Search, Undo2, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { KindIcon } from "../../glyphs";
import type { Kind } from "../../sample";
import { BackForward, EditorGrid, Sidebar, SourceList, Win, useWindowKeys, type Mode } from "../editor/shell";
import { CommandLine, Facts } from "../tools/common";
import {
  afterShieldLine, bigGroup, bigModulesList, bigRows, bigTotals, moduleName, refusal, shieldLineChange, shieldLineText, x0Density, x0Groups, x0Sources, x0SourcesWithPatch, x0Tables, X0_DIR,
  type BigRow, type CopyKind, type FileChange, type Group, type Subject,
} from "./data";
import "../tools/tools.css";
import "./redundancy.css";

/**
 * X1's Cogitator part (Proposal, 2026-11-27): the Redundancy tool view, in place of the list and the page like Updates
 * and Roundtrip. It is `augur dklpo clones` (the list) and `augur dklpo extract` (the preview and Apply) on the open
 * dataset: groups by kind (entries, groups, rules, profiles), the most repeated work first ((copies − 1) × statements
 * shared; round 2, RV6 changed: no byte counter), groups with nothing to share folded at the end of their kind, similar
 * groups listed last without Apply, groups an author marked “not a copy” folded at the end. The selected group shows
 * its members, its differences and the change `extract --dry-run` plans with the gate's verdict; Apply writes it as one
 * undo step. Data: the X0 synthetic dataset (Lantern Marches) as the commands report it.
 */

export type RedundancyState = "list" | "preview" | "checking" | "applied" | "refused" | "similar" | "empty" | "no-compile" | "large" | "narrow" | "large-text" | "marking" | "marked";
export const redundancyStates: RedundancyState[] = ["list", "preview", "checking", "applied", "refused", "similar", "empty", "no-compile", "large", "narrow", "large-text", "marking", "marked"];

const SCANNED = "14:20";
const subjectTitle: Record<Subject, string> = { entry: "Entries", group: "Groups", rule: "Rules", profile: "Profiles" };
const subjectOrder: Subject[] = ["entry", "group", "rule", "profile"];
const kindWord: Record<CopyKind, string> = { identical: "Identical", "value-only": "Value-only", similar: "Similar" };
const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (a: number, b: number) => `${((a / b) * 100).toFixed(1)} %`;
const iconKind = (k: Kind | "profile"): Kind => (k === "profile" ? "profile-type" : k);
const names = (mods: string[], shown = 3) => {
  const list = mods.slice(0, shown).map((k) => moduleName[k] ?? k.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
  return mods.length > shown ? `${list.join(", ")} +${mods.length - shown}` : list.join(", ");
};

/** A copy-kind mark: a word with its own shape (filled for identical, outlined for value-only, dashed for similar). */
export function CopyMark({ kind, diffs }: { kind: CopyKind; diffs?: number }) {
  return <span className={`cg-rd-kind ${kind}`}>{kindWord[kind]}{kind === "value-only" && diffs ? <span>· {diffs} {diffs === 1 ? "difference" : "differences"}</span> : null}</span>;
}

/** A group row: name and key, what the members share at the right; under it the copy kind, the members' modules and the base module. */
export function GroupRow({ name, keyText, kind, entryKind, members, modules, shared, diffs, base, selected, done, marked, onClick }: {
  name: string; keyText: string; kind: CopyKind; entryKind: Kind | "profile"; members: number; modules: string[]; shared: number; diffs?: number; base?: string; selected?: boolean; done?: boolean; marked?: boolean; onClick?: () => void;
}) {
  const edge = done || marked ? "" : kind === "similar" ? " similar" : shared > 0 ? " edge-suggestion" : "";
  return (
    <button type="button" role="option" aria-selected={selected} className={`cg-rd-row${edge}${selected ? " selected" : ""}${done || marked ? " done" : ""}`} onClick={onClick}>
      <span className="cg-rd-line1">
        <KindIcon kind={iconKind(entryKind)} size={14} />
        <strong>{name}</strong>
        <span className="mono">{keyText}</span>
        <span className="d-spacer" />
        {done ? <span className="cg-rd-done"><Check size={13} />Extracted</span>
          : marked ? <span className="cg-rd-save none" title="Marked not a copy: augur dklpo clones skips it">not a copy</span>
          : kind === "similar" ? <span className="cg-rd-save none" title="Similar groups are listed, not extracted">listed only</span>
            : <span className={`cg-rd-save${shared ? "" : " none"}`} title={shared ? `${shared} ${shared === 1 ? "statement" : "statements"} written once instead of ${fmt(members)} times` : "Nothing to share: every member would keep its whole content"}>{shared ? `${shared} shared` : "nothing to share"}</span>}
      </span>
      <span className="cg-rd-line2">
        {marked ? <span className="cg-rd-kind notcopy">Not a copy</span> : <CopyMark kind={kind} diffs={diffs} />}
        <span className="cg-rd-mods">{fmt(members)} in {modules.length === members ? names(modules) : `${modules.length} modules: ${names(modules)}`}</span>
        {base ? <span className="cg-rd-into">→ {moduleName[base.split(":")[0]] ?? base.split(":")[0]}</span> : null}
      </span>
    </button>
  );
}

const fromGroup = (g: Group, extra: Partial<Parameters<typeof GroupRow>[0]> = {}) => (
  <GroupRow key={g.id} name={g.name} keyText={g.id} kind={g.kind} entryKind={g.entryKind} members={g.total ?? g.members.length} modules={[...new Set(g.members.map((m) => m.module))]} shared={g.shared} diffs={g.differences.length} base={g.base} {...extra} />
);

/** A section of the list: a kind heading with its counts, the rows that save, then a fold for the ones that don't. */
function Section({ title, note, children, folded, onFold, foldLabel, foldRows }: { title: string; note: ReactNode; children?: ReactNode; folded?: boolean; onFold?: () => void; foldLabel?: string; foldRows?: ReactNode }) {
  return (
    <div className="cg-rd-sec" role="group" aria-label={title}>
      <h3>{title}<span className="d-muted">{note}</span></h3>
      {children}
      {foldLabel ? (
        <>
          <button type="button" className="cg-rd-fold" aria-expanded={!folded} onClick={onFold}>{folded ? <ChevronRight size={13} /> : <ChevronDown size={13} />}{foldLabel}</button>
          {folded ? null : foldRows}
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ the change: files planned by extract --dry-run */

export function FileHunk({ file, open, onToggle }: { file: FileChange; open: boolean; onToggle: () => void }) {
  const added = file.edits.filter((e) => e.after !== undefined && e.after !== "").length;
  const removed = file.edits.filter((e) => e.before !== undefined).length;
  return (
    <div className="cg-diff cg-rd-hunk">
      <button type="button" className="cg-diff-head cg-rd-hunkhead" aria-expanded={open} onClick={onToggle}>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}<span className="mono">{file.path}</span><span>{file.note}</span><span className="d-spacer" /><span className="cg-rd-pm"><b className="add">+{added}</b><b className="del">−{removed}</b></span>
      </button>
      {open ? file.edits.flatMap((e, i) => {
        const out: ReactNode[] = [];
        if (e.keep !== undefined) out.push(<p key={`${i}k`} className="cg-diff-line cg-tl-numbered"><span className="cg-tl-ln">{e.line}</span><span className="cg-diff-sign" /><span>{e.keep}</span></p>);
        if (e.before !== undefined) out.push(<p key={`${i}b`} className="cg-diff-line del cg-tl-numbered"><span className="cg-tl-ln">{e.line}</span><span className="cg-diff-sign" aria-label="removed">-</span><span>{e.before}</span></p>);
        if (e.after !== undefined) out.push(<p key={`${i}a`} className="cg-diff-line add cg-tl-numbered"><span className="cg-tl-ln">{e.before !== undefined ? "" : e.line}</span><span className="cg-diff-sign" aria-label="added">+</span><span>{e.after}</span></p>);
        return out;
      }) : null}
    </div>
  );
}

type Phase = "checking" | "ready" | "refused" | "applied";

export function Gate({ phase, seconds = "0.9 s" }: { phase: Phase; seconds?: string }) {
  if (phase === "checking") return (
    <div className="cg-rd-gate pending" role="status">
      <RefreshCw size={14} className="cg-spin" />
      <span><strong>Checking the change</strong> · compile <Check size={12} /> · fmt <Check size={12} /> · same data with <span className="mono">bsdata</span> ids <span className="cg-rd-running">running</span> · with <span className="mono">paths</span> ids</span>
    </div>
  );
  if (phase === "refused") return null;
  return (
    <div className="cg-rd-gate ok">
      <Check size={14} />
      <span><strong>Checked in {seconds}</strong> · compiles with no new error · fmt clean · the same data with <span className="mono">bsdata</span> and <span className="mono">paths</span> ids, so exports and rosters stay as they are</span>
    </div>
  );
}

/** The change as files. Shield Line has its lines; other groups list their files with what happens in each. */
function Change({ g, phase, large }: { g: Group; phase: Phase; large?: boolean }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set(["common-kit/module.dkl", "moss-covenant/entries.dkl"]));
  const [textOpen, setTextOpen] = useState(false);
  const toggle = (path: string) => setOpen((cur) => { const next = new Set(cur); if (next.has(path)) next.delete(path); else next.add(path); return next; });
  const plan = g.plan!;
  const files = plan.files;
  const head = (
    <h3 className="cg-tl-h">The change<span className="d-muted">{files} files · {plan.overlays ? `${plan.overlays} values kept in the members` : "the members keep nothing"} · {plan.moved} {plan.moved === 1 ? "name moves" : "names move"} to the base’s text pack</span></h3>
  );
  if (g.key === "shield-line") return (
    <>
      {head}
      <div className={phase === "checking" ? "cg-rd-dim" : undefined}>
        {shieldLineChange.map((f) => <FileHunk key={f.path} file={f} open={open.has(f.path)} onToggle={() => toggle(f.path)} />)}
        <div className="cg-diff cg-rd-hunk">
          <button type="button" className="cg-diff-head cg-rd-hunkhead" aria-expanded={textOpen} onClick={() => setTextOpen(!textOpen)}>
            {textOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}<span>4 text packs</span><span>the 2 names move to <span className="mono">{shieldLineText.added.path}</span>, out of the members’ packs</span><span className="d-spacer" /><span className="cg-rd-pm"><b className="add">+2</b><b className="del">−6</b></span>
          </button>
          {textOpen ? (
            <>
              {shieldLineText.added.lines.map((l) => <p key={l} className="cg-diff-line add"><span className="cg-diff-sign">+</span><span>{l}</span></p>)}
              {shieldLineText.removed.map((p) => <p key={p} className="cg-diff-line del"><span className="cg-diff-sign">-</span><span>{p}: shield-line, shield-line/shieldbearer</span></p>)}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
  /* Other groups (and the large one): the files with what each gets. */
  const baseModule = g.base!.split(":")[0];
  const memberFiles = [...new Set(g.members.map((m) => m.file))];
  return (
    <>
      {head}
      <ul className="cg-rd-files">
        <li><FileCode2 size={13} /><span className="mono">{baseModule}/{large ? "entries.dkl" : "module.dkl"}</span><span>the abstract base <span className="mono">{g.base}</span></span></li>
        {(large ? bigModulesList.slice(0, 5).map((m) => `${m.key}/entries.dkl`) : memberFiles).map((f) => {
          const mem = g.members.find((m) => m.file === f);
          const n = large ? bigModulesList.find((m) => f.startsWith(m.key))?.n : 1;
          return <li key={f}><FileCode2 size={13} /><span className="mono">{f}</span><span>{large ? `${n} members become ` : ""}<span className="mono">extends {g.base}</span>{!large && mem?.keeps?.length ? `, keeps ${mem.keeps.length} ${mem.keeps.length === 1 ? "value" : "values"}` : large ? "" : ", no block"}</span></li>;
        })}
        {large ? <li className="cg-rd-more"><span /><span>14 more module files, and the text packs: 1 name moves, 804 entries leave the members’ packs</span></li>
          : <li><FileCode2 size={13} /><span className="mono">{files - memberFiles.length - 1} text packs</span><span>{plan.moved} {plan.moved === 1 ? "name moves" : "names move"} to <span className="mono">{baseModule}/text/en.dkl</span>, {plan.removed} entries leave the members’ packs</span></li>}
      </ul>
    </>
  );
}

/* ------------------------------------------------------------------ detail */

function Members({ g, large, onOpen }: { g: Group; large?: boolean; onOpen: (path: string) => void }) {
  const [all, setAll] = useState(false);
  const total = g.total ?? g.members.length;
  return (
    <>
      <h3 className="cg-tl-h">Members<span className="d-muted">{large ? `${fmt(total)} in ${g.modules} modules · ↵ opens one` : `${total} · ↵ opens one`}</span></h3>
      {large ? (
        <p className="cg-rd-modsum">{bigModulesList.slice(0, all ? 19 : 8).map((m) => <span key={m.key}>{m.name}<b className="num">{m.n}</b></span>)}{all ? null : <span className="d-muted">+11 modules</span>}</p>
      ) : null}
      <div className="cg-rd-members" role="list">
        {g.members.map((m) => (
          <button type="button" role="listitem" key={m.path} className="cg-rd-member" onClick={() => onOpen(m.path)} title={`Open ${m.path}`}>
            <KindIcon kind={iconKind(m.kind)} size={14} />
            <span>{moduleName[m.module] ?? m.module}</span>
            <span className="mono">{m.file}:{m.line}</span>
            <span className="num d-muted">{m.bytes} B</span>
            <span className="cg-rd-keeps">{m.keeps === undefined ? null : m.keeps.length ? <>keeps {m.keeps.map((k, i) => <span key={k}>{i ? "· " : ""}<code>{k}</code></span>)}</> : <span className="d-muted">keeps nothing: every value is the base’s</span>}</span>
          </button>
        ))}
      </div>
      {large ? (
        <div className="cg-rd-showall">
          <button type="button" className="d-btn sm" onClick={() => setAll(!all)}>{all ? "Show the first 8" : `Show all ${fmt(total)} members`}</button>
          <label className="d-filter"><Search size={13} /><input placeholder="Filter members by module or path" aria-label="Filter members" /></label>
        </div>
      ) : null}
    </>
  );
}

function Differences({ g }: { g: Group }) {
  if (g.kind === "identical") return (
    <>
      <h3 className="cg-tl-h">Differences<span className="d-muted">none</span></h3>
      <p className="cg-tl-note">The copies are the same apart from their module: names, texts, values and what every reference resolves to. The members become <code>extends {g.base}</code> with no block.</p>
    </>
  );
  return (
    <>
      <h3 className="cg-tl-h">Differences<span className="d-muted">{g.differences.length} {g.differences.length === 1 ? "place" : "places"} · the base takes the most common value (a tie: the first member’s); a member keeps a value only where it differs</span></h3>
      {g.differences.map((d) => (
        <div key={d.place} className="cg-rd-diff">
          <p className="cg-rd-place"><Hash size={12} /><span className="mono">{d.place}</span></p>
          {d.values.map((v, i) => (
            <p key={g.members[i].path} className={`cg-rd-val${i === d.base ? " base" : ""}`}>
              <span>{moduleName[g.members[i].module]}</span><code>{v}</code>{i === d.base ? <span className="cg-rd-basechip">base</span> : <span className="d-muted cg-rd-kept">kept in the member</span>}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}

/** “Not a copy…”: a popover over the action bar. The mark is kept in the dataset, so `augur dklpo clones` skips the group too. */
function MarkPopover({ g, onMark, onCancel }: { g: Group; onMark: () => void; onCancel: () => void }) {
  return (
    <div className="cg-rd-markpop" role="dialog" aria-label={`Mark ${g.name} as not a copy`}>
      <p className="cg-rd-markhead"><strong>Mark {g.name} as not a copy</strong></p>
      <p className="cg-tl-help">The {g.members.length} declarations stay as they are and leave the list, here and in <code>augur dklpo clones</code>. The mark is kept in the dataset (<code>copies.dkl</code>), so other authors see it too. A member added or removed brings the group back.</p>
      <label className="cg-rd-note"><span>Why (optional, kept with the mark)</span><span className="cg-tl-field focus"><input defaultValue="Each faction’s Rally will change on its own" aria-label="Why" /></span></label>
      <p className="cg-rd-markacts"><button type="button" className="d-btn" onClick={onCancel}>Cancel<kbd>Esc</kbd></button><button type="button" className="d-btn primary" onClick={onMark}>Mark as not a copy<kbd>↵</kbd></button></p>
    </div>
  );
}

function MarkedDetail({ g, onUnmark, onOpen }: { g: Group; onUnmark: () => void; onOpen: (path: string) => void }) {
  return (
    <section className="cg-rd-detail" aria-label="Group">
      <div className="cg-rd-body">
        <p className="cg-tl-kicker"><KindIcon kind={iconKind(g.entryKind)} size={14} />Marked not a copy · {g.entryKind} · {g.members.length} modules</p>
        <h2 className="cg-tl-dh">{g.name} is written in {g.members.length} modules on purpose</h2>
        <Facts rows={[
          { label: "Why", value: <>Each faction’s Rally will change on its own</> },
          { label: "Marked", value: <>14:24<span className="d-muted">in <span className="mono">copies.dkl</span>, with its {g.members.length} members’ paths</span></> },
          { label: "Comes back", value: <>when a member is added or removed<span className="d-muted">changing a member’s text or numbers keeps the mark</span></> },
        ]} />
        <Members g={g} onOpen={onOpen} />
        <CommandLine command={`augur dklpo clones ${X0_DIR} --marked`} />
      </div>
      <footer className="cg-rd-bar">
        <button type="button" className="d-btn" onClick={onUnmark}><Undo2 size={13} />Unmark: list it again</button>
        <span className="cg-rd-why">⌘Z undoes the mark too</span>
      </footer>
    </section>
  );
}

function Detail({ g, phase, large, onApply, onUndo, onOpen, marking, onMarking, onMark }: { g: Group; phase: Phase; large?: boolean; onApply: () => void; onUndo: () => void; onOpen: (path: string) => void; marking?: boolean; onMarking?: (open: boolean) => void; onMark?: () => void }) {
  const total = g.total ?? g.members.length;
  const mods = g.modules ?? new Set(g.members.map((m) => m.module)).size;
  const plan = g.plan;
  const kicker = <p className="cg-tl-kicker"><KindIcon kind={iconKind(g.entryKind)} size={14} />{kindWord[g.kind]} copies · {g.entryKind === "profile" ? "profile" : g.entryKind} · {mods} modules</p>;

  if (g.kind === "similar") {
    const ex = g.extra![0];
    const exMember = g.members.find((m) => m.path === ex.member)!;
    return (
      <section className="cg-rd-detail" aria-label="Group">
        <div className="cg-rd-body">
          {kicker}
          <h2 className="cg-tl-dh">{g.name}: copies with one extra statement</h2>
          <Facts rows={[
            { label: "Members", value: <>{total}<span className="d-muted">{names(g.members.map((m) => m.module))}</span></> },
            { label: "In common", value: <>all of Ember Guild’s copy<span className="d-muted">299 B, numbers compared as for value-only copies</span></> },
            { label: "Only in some", value: <><span className="mono">{ex.at}</span><span className="d-muted">in {moduleName[exMember.module]}: {ex.bytes} of {exMember.bytes} B ({Math.round((ex.bytes / exMember.bytes) * 100)} %)</span></> },
          ]} />
          <div className="cg-rd-listonly"><CircleAlert size={14} /><p><strong>Listed, not extracted.</strong> A shared base for copies whose statements differ isn’t offered yet: make the copies the same by hand (then they’re listed for Apply), or leave them. A group is called similar while the statements only some members have are at most half of each member.</p></div>
          <h3 className="cg-tl-h">Only in {moduleName[exMember.module]}<span className="d-muted"><span className="mono">{exMember.file}:75</span></span></h3>
          <div className="cg-diff cg-rd-hunk">
            {ex.lines.map((l, i) => <p key={l} className="cg-diff-line add cg-tl-numbered"><span className="cg-tl-ln">{75 + i}</span><span className="cg-diff-sign">+</span><span>{l}</span></p>)}
          </div>
          <Members g={g} onOpen={onOpen} />
        </div>
        <footer className="cg-rd-bar">
          <button type="button" className="d-btn" onClick={() => onOpen(g.members[0].path)}><CornerDownLeft size={13} />Open {moduleName[g.members[0].module]}’s<kbd>↵</kbd></button>
          <button type="button" className="d-btn" onClick={() => onOpen(exMember.path)}>Open {moduleName[exMember.module]}’s</button>
          <span className="cg-rd-why">No Apply: similar copies are listed only</span>
        </footer>
      </section>
    );
  }

  if (phase === "applied") return (
    <section className="cg-rd-detail" aria-label="Group">
      <div className="cg-rd-body">
        <p className="cg-tl-kicker cg-rd-okkick"><Check size={14} />Extracted · one undo step</p>
        <h2 className="cg-tl-dh">{g.name} now extends <span className="mono">{g.base}</span></h2>
        <Facts rows={[
          { label: "Written", value: <>{plan!.files} files<span className="d-muted">the base in common-kit/module.dkl, 3 members, 4 text packs</span></> },
          { label: "Written once", value: <>{g.shared} statements, in the base<span className="d-muted">the members keep {plan!.overlays} values of their own</span></> },
          { label: "Text", value: <>{plan!.moved} names moved to Common Kit’s pack<span className="d-muted">{plan!.removed} entries left the members’ packs</span></> },
          { label: "Rescan", value: <>8 → 7 groups to extract<span className="d-muted">no group is new; copies {pct(afterShieldLine.cloneBytes, afterShieldLine.logicBytes)} of the logic</span></> },
        ]} />
        <p className="cg-tl-note">The members keep their paths, so rosters and the XML export stay as they were. Undo (⌘Z) puts every file back as one step, here or on any page.</p>
      </div>
      <footer className="cg-rd-bar">
        <button type="button" className="d-btn primary" onClick={() => onOpen(g.base!)}><CornerDownLeft size={13} />Open the base<kbd>↵</kbd></button>
        <button type="button" className="d-btn" onClick={onUndo}><Undo2 size={13} />Undo<kbd>⌘Z</kbd></button>
        <span className="d-spacer" />
        <span className="cg-rd-why">Next group: ↓</span>
      </footer>
    </section>
  );

  const zero = g.shared === 0;
  const keeps = Math.max(0, ...g.members.map((m) => m.keeps?.length ?? 0));
  const canApply = phase === "ready";
  const why = phase === "checking" ? "Apply waits for the check" : phase === "refused" ? "Refused by the check: nothing to apply" : undefined;
  return (
    <section className="cg-rd-detail" aria-label="Group">
      <div className="cg-rd-body">
        {kicker}
        <h2 className="cg-tl-dh">{g.name} is written in {mods} modules{large ? ` (${fmt(total)} copies)` : ""}</h2>
        <Facts rows={[
          { label: "Base", value: <><span className="mono">{g.base}</span><span className="d-muted">abstract, new · in the deepest module every member imports</span><button type="button" className="cg-linkbtn" title="Choose the base module and key (extract --into, --key)">Change…</button></> },
          { label: "Shared", value: zero
            ? <>nothing<span className="d-muted">every member would keep its whole content; only the names move to one pack</span></>
            : <>{g.shared} {g.shared === 1 ? "statement" : "statements"} written once instead of {fmt(total)} times<span className="d-muted">{g.kind === "identical" ? "the members keep nothing of their own" : `each member keeps at most ${keeps || g.differences.length} of its own`}</span></> },
        ]} />
        {phase === "refused" ? (
          <div className="cg-tl-errline cg-rd-refused" role="alert">
            <p><CircleAlert size={14} /><strong>Can’t extract: the result would have new errors</strong><span className="mono d-muted">{refusal.code}</span></p>
            <ul>{refusal.errors.map((e) => <li key={e.code}><span className="mono">{e.at}</span><span className="mono d-muted">{e.code}</span><span>{e.text}</span></li>)}</ul>
            <p>Tide Compact’s Shield Line is changed by this dataset’s patch <span className="mono">tide-errata</span> (its cost, 45 → 40). The extraction rewrites the text as written, so the patch would no longer find the value it expects. Nothing was written.</p>
            <p className="cg-tl-actions"><button type="button" className="d-btn sm primary" onClick={() => onOpen("tide-errata")}>Open tide-errata</button><button type="button" className="d-btn sm" onClick={() => onOpen("tide-compact:shield-line")}>Open Tide Compact’s Shield Line</button></p>
          </div>
        ) : <Gate phase={phase} seconds={large ? "5.4 s" : g.key === "shield-line" ? "0.9 s" : "0.8 s"} />}
        <Differences g={g} />
        <Members g={g} large={large} onOpen={onOpen} />
        {phase === "refused" ? null : <Change g={g} phase={phase} large={large} />}
        <CommandLine command={`augur dklpo extract ${X0_DIR} ${g.id}`} />
      </div>
      <footer className="cg-rd-bar">
        <button type="button" className={`d-btn${zero ? "" : " primary"}`} disabled={!canApply} onClick={onApply} title={why ?? `Write the base and rewrite the ${total} members: one undo step (⌘Z)`}>
          {phase === "checking" ? <RefreshCw size={13} className="cg-spin" /> : <Play size={13} />}Apply: extract into {g.base!.split(":")[0]}<kbd>⌘↵</kbd>
        </button>
        <span className="cg-rd-why">{why ?? (zero ? "Nothing to share; still allowed" : `One undo step · ${plan!.files} files`)}</span>
        <span className="d-spacer" />
        {large ? null : <button type="button" className="d-btn" aria-expanded={marking} onClick={() => onMarking?.(!marking)} title="These copies are on purpose: take the group off the list (kept in the dataset)">Not a copy…</button>}
        {marking ? <MarkPopover g={g} onMark={() => onMark?.()} onCancel={() => onMarking?.(false)} /> : null}
      </footer>
    </section>
  );
}

/** Nothing selected: what was scanned, the density MQ-10 asks for, the counts by kind. */
function Overview({ cloneBytes, logicBytes, counts, none }: { cloneBytes: number; logicBytes: number; counts: { k: string; g: number; m: number }[]; none?: boolean }) {
  return (
    <section className="cg-rd-detail" aria-label="Summary">
      <div className="cg-rd-body">
        <p className="cg-tl-kicker">Scanned {SCANNED} · 6 modules · 0.4 s</p>
        <h2 className="cg-tl-dh">{none ? "Nothing left to extract" : `${fmt(cloneBytes)} B of the logic is copies`}</h2>
        <div className="cg-rd-density" aria-label={`Copies are ${pct(cloneBytes, logicBytes)} of the logic`}>
          <span className="cg-rd-meter"><i style={{ width: `${Math.max((cloneBytes / logicBytes) * 100, 0)}%` }} /></span>
          <strong className="num">{pct(cloneBytes, logicBytes)}</strong><span className="d-muted">of {fmt(logicBytes)} B of logic in this dataset’s modules: every member beyond one, in identical and value-only groups</span>
        </div>
        <Facts rows={counts.map((c) => ({ label: c.k, value: <>{c.g} {c.g === 1 ? "group" : "groups"}<span className="d-muted">{c.m} members</span></> }))} />
        <p className="cg-tl-note">Looked for: entries, groups, rules and profiles written in two or more modules (identical, or differing only in numbers), and similar copies with a few statements of their own. Copies inside one module aren’t looked for. Select a group (↓) to see its members, its differences and the change before Apply.</p>
        <CommandLine command={`augur dklpo clones ${X0_DIR}`} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ the screen */

export function RedundancyScreen({ mode, state = "list", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (redundancyStates.includes(state as RedundancyState) ? state : "list") as RedundancyState;
  const large = s === "large";
  const shield = x0Groups[1];
  const initialSel = s === "list" || s === "empty" || s === "no-compile" ? null : s === "similar" ? "ember-guild:standard-guard" : s === "marking" || s === "marked" ? "ember-guild:rally" : large ? bigGroup.id : shield.id;
  const [sel, setSel] = useState<string | null>(initialSel);
  const [applied, setApplied] = useState<ReadonlySet<string>>(new Set(s === "applied" ? [shield.id] : s === "empty" ? x0Groups.filter((g) => g.kind !== "similar").map((g) => g.id) : []));
  const [toast, setToast] = useState(s === "applied");
  const [folds, setFolds] = useState<ReadonlySet<string>>(new Set(["entry", "group", "rule", "profile", ...(s === "marked" ? [] : ["marked"])]));
  const [marks, setMarks] = useState<ReadonlySet<string>>(new Set(s === "marked" ? ["ember-guild:rally"] : []));
  const [marking, setMarking] = useState(s === "marking");
  const [phase, setPhase] = useState<Phase>(s === "checking" ? "checking" : s === "refused" ? "refused" : "ready");
  const keys = useRef({ apply: () => undefined as void, down: () => undefined as void, up: () => undefined as void, undo: () => undefined as void });
  const claim = useWindowKeys(interactive, (event) => {
    if (event.metaKey && event.key === "Enter") { event.preventDefault(); keys.current.apply(); }
    else if (event.metaKey && event.key.toLowerCase() === "z") { event.preventDefault(); keys.current.undo(); }
    else if (event.key === "ArrowDown") { event.preventDefault(); keys.current.down(); }
    else if (event.key === "ArrowUp") { event.preventDefault(); keys.current.up(); }
  });
  const toggleFold = (k: string) => setFolds((cur) => { const next = new Set(cur); if (next.has(k)) next.delete(k); else next.add(k); return next; });

  const visible = x0Groups.filter((g) => !marks.has(g.id) && (g.kind === "similar" || g.shared > 0 || !folds.has(g.subject)));
  const select = (id: string) => { setSel(id); setMarking(false); if (s !== "refused") setPhase(id === shield.id && s === "checking" ? "checking" : "ready"); };
  const apply = () => { if (!sel || phase !== "ready") return; const g = x0Groups.find((x) => x.id === sel); if (!g || g.kind === "similar") return; setApplied((cur) => new Set([...cur, sel])); setToast(true); };
  const undo = () => { if (!sel) return; setApplied((cur) => { const next = new Set(cur); next.delete(sel); return next; }); setToast(false); };
  keys.current = {
    apply, undo,
    down: () => { const i = visible.findIndex((g) => g.id === sel); const next = visible[Math.min(i + 1, visible.length - 1)]; if (next) select(next.id); },
    up: () => { const i = visible.findIndex((g) => g.id === sel); const prev = visible[Math.max(i - 1, 0)]; if (prev) select(prev.id); },
  };

  const remaining = x0Groups.filter((g) => g.kind !== "similar" && !applied.has(g.id) && !marks.has(g.id));
  const density = s === "empty" ? { cloneBytes: 0, logicBytes: 12402 } : applied.has(shield.id) && applied.size === 1 ? afterShieldLine : x0Density;
  const selected = large ? bigGroup : x0Groups.find((g) => g.id === sel) ?? null;

  /* ---------- the list ---------- */
  let list: ReactNode;
  if (large) {
    list = (
      <>
        {bigRows.map((sec) => (
          <Section key={sec.subject} title={sec.title} note={`${sec.groups} groups · most repeated first`} folded={folds.has(sec.subject)} onFold={() => toggleFold(sec.subject)} foldLabel={`${sec.zero} with nothing to share`}
            foldRows={<p className="cg-rd-foldnote d-muted">{sec.zero} groups whose members would keep their whole content (most are one-line profiles: the row is all they hold)</p>}>
            {sec.rows.map((r: BigRow, i) => <GroupRow key={r.key} name={r.name} keyText={r.key} kind={r.kind} entryKind={r.entryKind} members={r.members} modules={r.modules} shared={r.shared} diffs={r.diffs} base={`common-kit:${r.key}`} selected={sec.subject === "group" && i === 0} />)}
            <p className="cg-rd-foldnote d-muted">{sec.groups - sec.zero - sec.rows.length} more · scroll</p>
          </Section>
        ))}
        <Section title="Similar" note={`${bigTotals.similar} groups, ${bigTotals.similarMembers} members · listed only`} foldLabel={`${bigTotals.similar} similar groups`} folded onFold={() => undefined} />
      </>
    );
  } else {
    const bySubject = subjectOrder.map((subject) => ({ subject, groups: x0Groups.filter((g) => g.subject === subject && g.kind !== "similar") })).filter((x) => x.groups.length);
    const similar = x0Groups.filter((g) => g.kind === "similar");
    list = (
      <>
        {s === "applied" ? (
          <div className="cg-rd-banner ok" role="status"><Check size={14} /><p><strong>Scanned again after Apply.</strong> Shield Line is gone; no group is new.</p></div>
        ) : null}
        {s === "empty" ? (
          <div className="cg-rd-empty">
            <Check size={18} />
            <p><strong>Nothing left to extract.</strong> No entry, group, rule or profile is written in two modules, identically or with other numbers. 8 groups were extracted in this session (⌘Z undoes the last).</p>
          </div>
        ) : bySubject.map(({ subject, groups: all }) => {
          const groups = all.filter((g) => !marks.has(g.id));
          if (!groups.length) return null;
          const saving = groups.filter((g) => g.shared > 0);
          const zero = groups.filter((g) => g.shared === 0);
          const left = groups.filter((g) => !applied.has(g.id)).length;
          return (
            <Section key={subject} title={subjectTitle[subject]} note={`${left} ${left === 1 ? "group" : "groups"}${saving.length > 1 ? " · most repeated first" : ""}`}
              folded={folds.has(subject)} onFold={() => toggleFold(subject)} foldLabel={zero.length ? `${zero.length} with nothing to share` : undefined}
              foldRows={zero.map((g) => fromGroup(g, { selected: sel === g.id, done: applied.has(g.id), onClick: () => select(g.id) }))}>
              {saving.map((g) => fromGroup(g, { selected: sel === g.id, done: applied.has(g.id), onClick: () => select(g.id) }))}
            </Section>
          );
        })}
        <Section title="Similar" note="listed only, no Apply">
          {similar.map((g) => fromGroup(g, { selected: sel === g.id, onClick: () => select(g.id) }))}
        </Section>
        {marks.size ? (
          <Section title="Marked not copies" note={`${marks.size} · kept in copies.dkl`} folded={folds.has("marked")} onFold={() => toggleFold("marked")} foldLabel={folds.has("marked") ? `Show ${marks.size === 1 ? "it" : `the ${marks.size}`}` : "Hide"}
            foldRows={x0Groups.filter((g) => marks.has(g.id)).map((g) => fromGroup(g, { marked: true, selected: sel === g.id, onClick: () => select(g.id) }))} />
        ) : null}
      </>
    );
  }

  const counts = s === "marked"
    ? [{ k: "Identical", g: 4, m: 11 }, { k: "Value-only", g: 3, m: 9 }, { k: "Similar", g: 1, m: 2 }, { k: "Marked not copies", g: 1, m: 3 }]
    : s === "empty"
    ? [{ k: "Identical", g: 0, m: 0 }, { k: "Value-only", g: 0, m: 0 }, { k: "Similar", g: 1, m: 2 }]
    : [{ k: "Identical", g: 5, m: 14 }, { k: "Value-only", g: applied.has(shield.id) ? 2 : 3, m: applied.has(shield.id) ? 6 : 9 }, { k: "Similar", g: 1, m: 2 }];

  let detail: ReactNode;
  if (!selected) detail = <Overview cloneBytes={density.cloneBytes} logicBytes={density.logicBytes} counts={counts} none={s === "empty"} />;
  else if (marks.has(selected.id)) detail = <MarkedDetail g={selected} onUnmark={() => setMarks((cur) => { const next = new Set(cur); next.delete(selected.id); return next; })} onOpen={() => undefined} />;
  else detail = <Detail key={selected.id} g={selected} phase={applied.has(selected.id) ? "applied" : phase} large={large} onApply={apply} onUndo={undo} onOpen={() => undefined}
    marking={marking} onMarking={setMarking} onMark={() => { setMarks((cur) => new Set([...cur, selected.id])); setMarking(false); setFolds((cur) => { const next = new Set(cur); next.delete("marked"); return next; }); }} />;

  const totals = large
    ? <>{bigTotals.toExtract} to extract · {bigTotals.similar} similar · copies {pct(bigTotals.cloneBytes, bigTotals.logicBytes)} of the logic</>
    : s === "no-compile" ? <>Not scanned</>
      : s === "narrow" ? <>{remaining.length} to extract · 1 similar · {pct(density.cloneBytes, density.logicBytes)}</>
        : <>{remaining.length} to extract · 1 similar · copies {pct(density.cloneBytes, density.logicBytes)} of the logic</>;

  const narrow = s === "narrow";
  const sources = s === "refused" ? x0SourcesWithPatch : x0Sources;
  const sideCount = s === "no-compile" ? "–" : large ? String(bigTotals.toExtract) : String(remaining.length);
  return (
    <Win mode={mode} interactive={interactive} onClaim={claim} width={narrow ? 960 : undefined} large={s === "large-text"}>
      <EditorGrid side={<Sidebar dataset={{ name: large ? "Large sample" : "Lantern Marches", mark: "L", sources, tables: x0Tables }} redundancy={{ count: sideCount, active: true }} updates={s === "no-compile" ? 6 : 0} entry={null} source={null}
        foot={s === "no-compile" ? <><span className="d-dot cg-dot-err" />Doesn’t compile · 6 errors</> : s === "applied" ? <><span className="d-dot" />Saved · 8 files · fmt clean</> : undefined} />}>
        <main className="d-main" aria-label="Redundancy">
          <header className="d-top">
            <BackForward back="Shield Line" />
            <span className="d-crumbs">{large ? "Large sample" : "Lantern Marches"}<span>/</span>Redundancy</span>
            <span className="d-spacer" />
            <span className="d-muted">{s === "no-compile" ? "Waits for a dataset that compiles" : large ? `Scanned ${SCANNED} · ${bigTotals.modules} modules · 1.1 s` : `Scanned ${SCANNED}${s === "applied" ? " and after Apply" : ""} · 6 modules · 0.4 s`}</span>
            <button type="button" className="d-btn" disabled={s === "no-compile"} title={s === "no-compile" ? "The dataset doesn’t compile: copies are compared on a dataset that compiles" : "Look for copies again (the view scans again after every save while it is open)"}><RefreshCw size={14} />Scan again</button>
          </header>
          {s === "no-compile" ? (
            <div className="cg-rd-blocked">
              <CircleAlert size={22} />
              <h2>Can’t look for copies: Lantern Marches has 6 compile errors</h2>
              <p>Copies are compared on a dataset that compiles. The list comes back on its own once it does.</p>
              <p className="cg-tl-actions"><button type="button" className="d-btn primary"><ArrowDownLeft size={13} />Open Updates<kbd>⇧⌘U</kbd></button><button type="button" className="d-btn">Go to the first error<kbd>F8</kbd></button></p>
              <p className="cg-tl-note"><span className="mono">ember-guild/entries.dkl:32</span> <code>spear</code> resolves to nothing (did you mean <code>common-kit:spear</code>?), and 5 more.</p>
            </div>
          ) : (
            <>
              <div className="cg-ib-filters" role="toolbar" aria-label="Filters">
                <label className="d-filter cg-ib-search"><Search size={13} /><input placeholder="Filter names, keys and modules" aria-label="Filter names, keys and modules" readOnly={!interactive} /></label>
                <button type="button" className="cg-chip">Kind<strong>All</strong><ChevronDown size={12} /></button>
                <button type="button" className="cg-chip">Copies<strong>All</strong><ChevronDown size={12} /></button>
                <button type="button" className="cg-chip">Module<strong>Any</strong><ChevronDown size={12} /></button>
                <span className="d-spacer" />
                <span className="d-muted cg-ib-total">{totals}</span>
              </div>
              <div className={`cg-rd${narrow ? " narrow" : ""}`}>
                <div className="cg-rd-list" role="listbox" aria-label="Copy groups">{list}</div>
                {detail}
              </div>
              <footer className="cg-ib-keys"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> open the first member <kbd>⌘↵</kbd> apply <kbd>⌘Z</kbd> undo <span className="d-spacer" /><span>⇧⌘D back to the page</span></footer>
            </>
          )}
          {toast ? <div className="e1s-toast cg-tl-toast cg-rd-toast" role="status"><span>Extracted Shield Line into Common Kit: 8 files</span><button type="button" onClick={undo}>Undo</button><button type="button" aria-label="Dismiss" onClick={() => setToast(false)}><X size={13} /></button></div> : null}
        </main>
      </EditorGrid>
    </Win>
  );
}

/* ------------------------------------------------------------------ where it opens from */

export type OpensState = "opens-palette" | "opens-menu";

/** The X0 editor behind the entry points: the sidebar, Ember Guild in the list, Shield Line's page with its copies line. */
export function X0Editor({ mode, interactive, onClaim, overlay, menu, page, entry = "ember-guild:shield-line", crumbs, back = "Levy Band" }: { mode: Mode; interactive: boolean; onClaim?: () => void; overlay?: ReactNode; menu?: ReactNode; page?: ReactNode; entry?: string; crumbs?: ReactNode; back?: string }) {
  const list = x0Sources.find((x) => entry.startsWith(`${x.id}:`)) ?? x0Sources[2];
  return (
    <Win mode={mode} interactive={interactive} onClaim={onClaim}>
      <div className="cg-tl-contents" inert={overlay ? true : undefined}>
        <EditorGrid side={<Sidebar dataset={{ name: "Lantern Marches", mark: "L", sources: x0Sources, tables: x0Tables }} redundancy={{ count: "8" }} source={list.id} entry={entry} updates={0} />}
          list={<SourceList source={list} entry={entry} />}>
          <main className="d-main" aria-label="Entry">
            <header className="d-top">
              <BackForward back={back} />
              <span className="d-crumbs">{crumbs ?? <>Ember Guild<span>/</span>Shield Line</>}</span>
              <span className="d-spacer" />
              <span className="d-muted">Edited just now</span>
            </header>
            {page ?? (
            <div className="d-scroll helper-collapsed">
              <div className="d-doc">
                <article className="d-page">
                  <div className="d-pageicon"><KindIcon kind="unit" size={28} /></div>
                  <h1>Shield Line</h1>
                  <p className="d-backlinks"><ArrowDownLeft size={14} /><span className="d-muted">1 backlink</span><span className="d-mention">Ember Guild</span></p>
                  <p className="cg-rd-pageline" title="Proposal: shown on a page whose entry is a member of a copy group">
                    <Copy size={14} /><span>Also written in <strong>Moss Covenant</strong> and <strong>Tide Compact</strong>, with other numbers</span><button type="button" className="cg-linkbtn">Show in Redundancy</button>
                  </p>
                  <dl className="d-props">
                    <div><dt><KindIcon kind="unit" size={14} />Kind</dt><dd>Unit<span className="d-muted"><span className="mono">ember-guild:shield-line</span></span></dd></div>
                    <div><dt><ChevronDown size={14} />Categories</dt><dd><span className="d-tag t1">infantry</span></dd></div>
                    <div><dt><Hash size={14} />Cost</dt><dd><strong className="num">40 pts</strong></dd></div>
                    <div><dt><Hash size={14} />Limit</dt><dd>up to 2 in a roster</dd></div>
                  </dl>
                  <div className="d-blocks">
                    <h2 className="d-h">Models</h2>
                    <div className="d-block i0"><span className="d-tog-space" /><span className="d-kw">model</span><strong>Shieldbearer</strong><span className="d-muted">5 to 10 models · 7 pts</span></div>
                    <div className="d-block i1"><span className="d-tog-space" /><span className="d-kw">use</span><span className="d-mention">Spear</span><span className="d-muted">1</span></div>
                    <div className="d-block i1"><span className="d-tog-space" /><span className="d-kw">use</span><span className="d-mention">Wargear</span></div>
                  </div>
                </article>
              </div>
            </div>
            )}
            {menu}
          </main>
        </EditorGrid>
      </div>
      {overlay}
    </Win>
  );
}

export function OpensScreen({ mode, state = "opens-palette", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const claim = useWindowKeys(interactive, () => undefined);
  if (state === "opens-menu") {
    return (
      <X0Editor mode={mode} interactive={interactive} onClaim={claim} menu={(
        <div className="cg-menu cg-rd-appmenu" role="menu" aria-label="Tools menu">
          <p className="cg-menu-label">Tools (the menu bar’s menu, drawn here)</p>
          <button type="button" role="menuitem" className="cg-menu-item">Roundtrip</button>
          <button type="button" role="menuitem" className="cg-menu-item sel cg-rd-new">Redundancy<span className="cg-menu-key">⇧⌘D</span></button>
          <button type="button" role="menuitem" className="cg-menu-item">Run Checks<span className="cg-menu-key">⇧⌘C</span></button>
          <div className="cg-menu-sep" role="separator" />
          <button type="button" role="menuitem" className="cg-menu-item">Run<span className="cg-menu-key">⌘R</span></button>
          <button type="button" role="menuitem" className="cg-menu-item">Reload Now<span className="cg-menu-key">⇧⌘R</span></button>
          <button type="button" role="menuitem" className="cg-menu-item">Pause Live Reload<span className="cg-menu-key">⌥⌘P</span></button>
          <button type="button" role="menuitem" className="cg-menu-item">Show in Runner<span className="cg-menu-key">⌥⌘R</span></button>
        </div>
      )} />
    );
  }
  const palette = (
    <div className="cg-palette cg-ed-palette" role="dialog" aria-label="Go to an entry or run a command">
      <div className="cg-pal-input"><Search size={16} /><input defaultValue="copies" aria-label="Entries and commands" readOnly={!interactive} /><span className="cg-pal-scope">All</span><kbd>Esc</kbd></div>
      <div className="cg-pal-body" role="listbox" aria-label="Results">
        <div className="cg-pal-group">Commands</div>
        <button type="button" role="option" aria-selected className="cg-pal-row selected"><Copy size={15} /><strong>Redundancy</strong><span className="mono">find <mark>copies</mark> across modules</span><span className="cg-pal-end"><kbd>⇧⌘D</kbd></span></button>
        <div className="cg-pal-group">Search</div>
        <button type="button" role="option" aria-selected={false} className="cg-pal-row"><Search size={15} /><strong>Search the dataset for “copies”</strong><span className="cg-pal-end"><kbd>⇧⌘F</kbd></span></button>
      </div>
      <div className="cg-pal-foot"><kbd>↑</kbd><kbd>↓</kbd><span>move</span><kbd>↵</kbd><span>open or run</span><kbd>Esc</kbd><span>close</span></div>
    </div>
  );
  return <X0Editor mode={mode} interactive={interactive} onClaim={claim} overlay={<div className="cg-scrim">{palette}</div>} />;
}
