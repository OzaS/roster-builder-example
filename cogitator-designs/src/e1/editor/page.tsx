import { ArrowDownLeft, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { KindIcon } from "../../glyphs";
import { lookupRow, M, pageFor } from "../../directions/direction-d-content";
import type { DiagKind } from "../../sample";
import { blockEnd, type ModuleText, type Placed } from "./data";

/**
 * An entry page drawn from its DKLPO text, in Direction D's page classes (`.d-page`, `.d-props`, `.d-block`), so every
 * block knows its line: selecting a block selects its lines in the text, and a line selects its block.
 */

const title = (key: string) => key.split(/[-/]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const indentOf = (s: string) => s.length - s.trimStart().length;

/** The full id of a referenced key, from inside `module`: qualified keys as written, else this module, else the system. */
export function resolve(module: string, key: string) {
  const bare = key.replace(/\*$/, "");
  if (bare.includes(":")) return lookupRow(bare) ? bare : undefined;
  for (const id of [`${module}:${bare}`, `demo-skirmish:${bare}`, `iron-wardens:${bare}`]) if (lookupRow(id)) return id;
  return undefined;
}

/** The top-level declaration line (1-based) that holds `line`, or 0 for the module header and blank lines. */
export function declOf(lines: string[], line: number) {
  for (let i = line - 1; i >= 0; i -= 1) {
    if (indentOf(lines[i]) === 0 && lines[i].trim() && !lines[i].startsWith("#")) {
      const kw = lines[i].split(" ")[0];
      return ["unit", "upgrade", "model", "rule"].includes(kw) && i + 1 <= line ? i + 1 : 0;
    }
  }
  return 0;
}

/** Entry id of the declaration at `line`. */
export const entryAt = (module: ModuleText, line: number) => {
  const decl = declOf(module.lines, line);
  return decl ? `${module.id}:${module.lines[decl - 1].split(" ")[1]}` : undefined;
};

export type PageSel = { line: number | null; onSelect: (line: number) => void };

/** Follow a reference: click or F12 goes to the definition, ⌥-click or ⌥F12 peeks it. `id` is missing when it resolves to nothing. */
export type Follow = (target: { id?: string; key: string; peek: boolean; line: number; el: HTMLElement }) => void;

function Mention({ module, keyText, broken, onFollow, line }: { module: string; keyText: string; broken?: boolean; onFollow?: Follow; line: number }) {
  const resolved = resolve(module, keyText);
  const id = broken ? undefined : resolved;
  const go = (el: HTMLElement, peek: boolean) => onFollow?.({ id, key: keyText, peek, line, el });
  const keys = (event: ReactKeyboardEvent<HTMLButtonElement>) => { if (event.key === "F12") { event.preventDefault(); event.stopPropagation(); go(event.currentTarget, event.altKey); } };
  if (!id) {
    return <span className="d-mwrap"><button type="button" className="d-mention broken" data-ref={keyText} aria-label={`Unknown reference ${keyText}`} title="Unknown reference: F12 offers the fix"
      onClick={onFollow ? (event) => { event.stopPropagation(); go(event.currentTarget, false); } : undefined} onKeyDown={onFollow ? keys : undefined}>{keyText.split(":").pop()}</button></span>;
  }
  const name = lookupRow(id)?.row.name ?? title(keyText);
  return onFollow
    ? <span className="d-mwrap"><button type="button" className="d-mention" data-ref={id} title={`Go to ${name} (F12, ⌘-click) · peek (⌥F12, ⌥-click)`} onClick={(event) => { event.stopPropagation(); go(event.currentTarget, event.altKey); }} onKeyDown={keys}>{name}</button></span>
    : <M to={id}>{name}</M>;
}

const profileHeads: Record<string, string[]> = { fighter: ["Profile", "Type", "Move", "Attack", "Wounds"], weapon: ["Profile", "Type", "Reach", "Strength"] };

/** One statement line drawn as a block value. */
function Value({ module, text, follow, broken, line }: { module: string; text: string; follow?: Follow; broken?: boolean; line: number }) {
  const [kw, ...rest] = text.trim().split(" ");
  const args = rest.join(" ");
  const mention = (key: string) => <Mention module={module} keyText={key} onFollow={follow} broken={broken} line={line} />;
  if (kw === "model") {
    const [key, range] = rest;
    const [lo, hi] = (range ?? "1").split("..");
    return <><strong>{title(key)}</strong><span className="d-muted">{hi ? `${lo} to ${hi} models` : `${lo} model${lo === "1" ? "" : "s"}`}</span></>;
  }
  if (kw === "cost") return <span className="num">{rest[1]} {rest[0]}</span>;
  if (kw === "upgrade") return <><strong>{title(rest[0])}</strong>{rest[1] ? <span className="d-muted">up to {rest[1].replace("..", "")}</span> : null}</>;
  if (kw === "group") {
    const [key, n, , def] = rest;
    return <><strong>{title(key)}</strong><span className="d-muted">choose {n}, default</span>{mention(def)}</>;
  }
  if (kw === "use") return <>{mention(rest[0])}{(() => { const id = resolve(module, rest[0]); const cost = id ? lookupRow(id)?.row.cost : undefined; return cost !== undefined && !broken ? <span className="d-muted">{cost} pts</span> : broken ? <span className="d-muted">no cost: unresolved</span> : null; })()}</>;
  if (kw === "hide") {
    const target = args.match(/no\(([\w-]+)/)?.[1] ?? "";
    return <><span className="mono">no(</span>{mention(target)}<span className="mono">in force, deep)</span></>;
  }
  if (kw === "association") {
    const [key, range, , target] = rest;
    return <><strong>{key}</strong><span className="d-muted">{range.replace("..", " to ")}</span>{mention(target)}</>;
  }
  if (kw === "label") return <><span className="mono">{args}</span><span className="d-muted">the default label</span></>;
  if (kw.endsWith(":")) return <span className="mono">{text.trim()}</span>;
  return <span className="mono">{args}</span>;
}

function ProfileTable({ text }: { text: string }) {
  const [head, ...cells] = text.trim().replace(/^profile /, "").split("|").map((c) => c.trim());
  const [key, type] = head.split(":").map((c) => c.trim());
  return (
    <table>
      <thead><tr>{(profileHeads[type] ?? ["Profile", "Type"]).map((cell) => <th key={cell}>{cell}</th>)}</tr></thead>
      <tbody><tr><td>{title(key)}</td><td><M to={`demo-skirmish:${type}`}>{type}</M></td>{cells.map((cell, i) => <td key={i} className="num">{cell}</td>)}</tr></tbody>
    </table>
  );
}

/** Statement lines of one entry as page blocks (props lines are drawn in the properties block instead). */
export function Blocks({ module, decl, sel, flags, follow, folded: initialFolded = [], after, brokenLines = [] }: {
  module: ModuleText; decl: number; sel?: PageSel; flags?: Record<number, DiagKind>; follow?: Follow;
  folded?: number[]; after?: Record<number, ReactNode>; brokenLines?: number[];
}) {
  const [folded, setFolded] = useState<ReadonlySet<number>>(new Set(initialFolded));
  const lines = module.lines;
  const end = blockEnd(lines, decl);
  const range = sel?.line ? [sel.line, blockEnd(lines, sel.line)] : null;
  const out: ReactNode[] = [];
  let heading = "";
  let hiddenBelow = Infinity;
  for (let n = decl + 1; n <= end; n += 1) {
    const raw = lines[n - 1];
    const text = raw.trim();
    const depth = indentOf(raw) / 2 - 1;
    if (depth >= hiddenBelow) continue;
    hiddenBelow = Infinity;
    if (!text || text.startsWith("#")) continue;
    const kw = text.split(" ")[0];
    if (depth === 0 && ["cat", "cost"].includes(kw)) continue;
    if (depth === 0 && kw === "use" && resolve(module.id, text.split(" ")[1])?.startsWith("demo-skirmish:")) continue;
    const head = depth === 0 ? (kw === "model" ? "Models" : kw === "association" ? "Associations" : kw === "profile" ? "Profile" : "") : "";
    if (head && head !== heading) { heading = head; out.push(<h2 key={`h${n}`} className="d-h">{head}</h2>); }
    const hasKids = blockEnd(lines, n) > n;
    const isFolded = folded.has(n);
    if (hasKids && isFolded) hiddenBelow = depth + 1;
    const linked = range && n >= range[0] && n <= range[1];
    const flag = flags?.[n];
    const kwLabel = kw.endsWith(":") ? "source key" : kw === "hide" ? "hide when" : kw;
    out.push(
      <div key={n} className={`d-block i${Math.min(Math.max(depth, 0), 3)}${kw === "profile" ? " d-tableblock" : ""}${flag ? ` flagged ${flag}` : ""}${linked ? " cg-linked" : ""}${linked && n === range?.[0] ? " cg-linked-head" : ""}`}
        data-line={n} onClick={sel ? () => sel.onSelect(n) : undefined}>
        {hasKids ? (
          <button type="button" className="d-tog" aria-label={isFolded ? `Unfold ${kwLabel}` : `Fold ${kwLabel}`} aria-expanded={!isFolded} title={isFolded ? "Unfold" : "Fold"}
            onClick={(event) => { event.stopPropagation(); setFolded((current) => { const next = new Set(current); if (next.has(n)) next.delete(n); else next.add(n); return next; }); }}>
            {isFolded ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
        ) : <span className="d-tog-space" />}
        {kw === "profile" ? <ProfileTable text={text} /> : <><span className="d-kw">{kwLabel}</span><Value module={module.id} text={text} follow={follow} broken={brokenLines.includes(n)} line={n} /></>}
        {sel ? <span className="cg-lineno" aria-label={`Line ${n}`}>{n}</span> : null}
      </div>,
    );
    if (after?.[n]) out.push(<div key={`a${n}`} className="cg-after">{after[n]}</div>);
  }
  return <>{out}</>;
}

/** Which property row stands for which line: Kind is the declaration, Categories the first `cat`, Cost the entry's `cost`, Rules the rule `use`. */
export function propLines(module: ModuleText, decl: number) {
  const end = blockEnd(module.lines, decl);
  const find = (test: (text: string) => boolean) => {
    for (let n = decl + 1; n <= end; n += 1) if (indentOf(module.lines[n - 1]) === 2 && test(module.lines[n - 1].trim())) return n;
    return undefined;
  };
  return {
    Kind: decl,
    Categories: find((t) => t.startsWith("cat ")),
    Cost: find((t) => t.startsWith("cost ")),
    Rules: find((t) => t.startsWith("use ") && Boolean(resolve(module.id, t.split(" ")[1])?.startsWith("demo-skirmish:"))),
  } as Record<string, number | undefined>;
}

/** The page: D's title, backlinks and properties for the entry, then its statements as linked blocks. */
export function LinkedPage({ id, module, sel, flags, follow, folded, after, onBacklinks, brokenLines, noTail, propEdit, propValue, titleEdit }: {
  id: string; module: ModuleText; sel?: PageSel; flags?: Record<number, DiagKind>; follow?: Follow; folded?: number[];
  after?: Record<number, ReactNode>; onBacklinks?: () => void; brokenLines?: number[]; noTail?: boolean;
  /** A property row's value drawn as a field in place (the `cg-editing` cell), by its label (E1-3 page edits). */
  propEdit?: Record<string, ReactNode>;
  /** A property row's value replaced (a value after an edit), by its label. */
  propValue?: Record<string, ReactNode>;
  /** The title drawn as a field in place, in the h1's own type (E1-3 page edits). */
  titleEdit?: ReactNode;
}) {
  const page = pageFor(id);
  const key = id.split(":")[1];
  const decl = module.lines.findIndex((line) => indentOf(line) === 0 && line.split(" ")[1] === key && !line.startsWith("root")) + 1;
  const props = propLines(module, decl);
  const range = sel?.line ? [sel.line, blockEnd(module.lines, sel.line)] : null;
  return (
    <article className="d-page cg-linked-page">
      <div className="d-pageicon"><KindIcon kind={page.kind} size={28} /></div>
      {titleEdit ? <h1 className="cg-editing-title">{titleEdit}</h1> : <h1 className={page.noText ? "d-notext" : ""}>{page.name}{page.noText ? <span className="d-tag warn">No en text</span> : null}</h1>}
      <p className="d-backlinks">
        <ArrowDownLeft size={14} />
        {onBacklinks ? <button type="button" className="cg-backlinks-btn" onClick={onBacklinks} title="List every place that refers to this entry (⇧F12)">{page.backlinks.length} backlink{page.backlinks.length === 1 ? "" : "s"}<kbd>⇧F12</kbd></button> : <span className="d-muted">{page.backlinks.length} backlink{page.backlinks.length === 1 ? "" : "s"}</span>}
        {page.backlinks.map((link) => <M key={link.label} to={link.to} hint="Root entry of this source">{link.label}</M>)}
      </p>
      <dl className="d-props">
        {page.props.map((prop) => {
          const line = props[prop.label];
          const linked = Boolean(line && range && line >= range[0] && line <= range[1]);
          return (
            <div key={prop.label} className={linked ? "cg-linked-prop" : undefined} onClick={line && sel ? () => sel.onSelect(line) : undefined}>
              <dt>{prop.icon}{prop.label}</dt><dd className={propEdit?.[prop.label] ? "cg-editing" : undefined}>{propEdit?.[prop.label] ?? propValue?.[prop.label] ?? prop.value}{line && sel ? <span className="cg-lineno" aria-label={`Line ${line}`}>{line}</span> : null}</dd>
            </div>
          );
        })}
        <div className="d-more"><dt><button type="button"><Plus size={14} />{page.more.length} more {page.more.length === 1 ? "property" : "properties"}</button></dt><dd /></div>
      </dl>
      <div className="d-blocks">
        {decl ? <Blocks module={module} decl={decl} sel={sel} flags={flags} follow={follow} folded={folded} after={after} brokenLines={brokenLines} /> : null}
        {noTail ? null : <div className="d-block i0 typing"><span className="d-tog-space" /><span className="d-slashbtn"><span className="d-slash">/</span><span className="d-placeholder">Type / to insert a statement</span></span></div>}
      </div>
    </article>
  );
}

/** Flags for the page blocks from placed diagnostics: the most severe kind per line. */
export function flagsFrom(placed: Placed[], resolved: ReadonlySet<string> = new Set()) {
  const rank: Record<DiagKind, number> = { error: 0, preservation: 1, suggestion: 2 };
  const flags: Record<number, DiagKind> = {};
  for (const d of placed) {
    if (resolved.has(d.id)) continue;
    const line = d.kind === "preservation" ? d.line + 1 : d.line;
    if (!flags[line] || rank[d.kind] < rank[flags[line]]) flags[line] = d.kind;
  }
  return flags;
}
