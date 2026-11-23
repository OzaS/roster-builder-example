import { Check, ChevronDown, ChevronRight, CornerDownLeft, FilePlus2, Layers, PenLine, Replace, Search, Undo2, X } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { KindIcon } from "../../glyphs";
import type { Kind } from "../../sample";
import { lookupRow, pageFor } from "../../directions/direction-d-content";
import { allDiagnostics } from "../editor/data";
import { CodeView } from "../editor/code";
import { BackForward, EditorGrid, Sidebar, Win, type Mode, useWindowKeys } from "../editor/shell";
import { buildIndex, offLayerDocs, type SearchDoc, type SearchField } from "./data";
import "./layers.css";
import "./search.css";

/**
 * Screen 2: dataset search (⌘⇧F). The ⌘K palette jumps to one entry or command; this view finds every place a word
 * occurs across the sources and layers: in entries (names, keys), text (rule text, notes), references and other
 * statements. Results are grouped by source (with the layer that holds it), each match with its field, line and the
 * match highlighted; filters narrow by kind, source and layer; ⌥⌘F opens Replace for text, previewed per match. Keys
 * are not replaced as text: renaming a key changes its references and writes a move record, so it goes to Rename… (F2).
 */
export type SearchState = "results" | "no-results" | "filters" | "replace";

const entryName = (id: string) => lookupRow(id)?.row.name ?? pageFor(id).name;
const entryKind = (id: string): Kind => lookupRow(id)?.row.kind ?? pageFor(id).kind;
const index = buildIndex(entryName, entryKind);

type Scope = "entries" | "text" | "references" | "statements";
const scopeOf: Record<SearchField, Scope> = { name: "entries", key: "entries", text: "text", reference: "references", statement: "statements" };
const scopeLabel: Record<Scope, string> = { entries: "Entries", text: "Text", references: "References", statements: "Statements" };
const fieldLabel: Record<SearchField, string> = { name: "name", key: "key", text: "text", reference: "reference", statement: "statement" };
const kindName: Partial<Record<Kind, string>> = { unit: "Unit", upgrade: "Upgrade", rule: "Rule", force: "Force", model: "Model", catalogue: "Catalogue" };
const sourceOrder = ["Demo Skirmish", "Iron Wardens", "Frost Wardens", "House rules", "Short names", "Draft points"];

const preset: Record<SearchState, { q: string; filters: Filters; replace?: string; sel?: string }> = {
  results: { q: "shield", filters: {}, sel: "iron-wardens/text/en.dkl:4" },
  "no-results": { q: "pikeman", filters: {} },
  filters: { q: "ward", filters: { kind: "unit", layer: "Base" }, sel: "iron-wardens:13" },
  replace: { q: "Shield Wall", filters: {}, replace: "Shield Line", sel: "demo-skirmish/text/en.dkl:1" },
};
type Filters = { kind?: string; source?: string; layer?: string };

function matcher(q: string, caseSensitive: boolean, word: boolean) {
  if (!q.trim()) return null;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  try { return new RegExp(word ? `\\b${escaped}\\b` : escaped, caseSensitive ? "g" : "gi"); } catch { return null; }
}

/** The text with every match marked; in replace mode the match is struck and the replacement inserted after it. */
function marked(text: string, re: RegExp | null, replacement?: string, done?: boolean): ReactNode {
  if (!re) return text;
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    out.push(text.slice(last, i));
    if (done) out.push(<mark key={i} className="cg-sr-ins">{replacement}</mark>);
    else if (replacement !== undefined) out.push(<span key={i} className="cg-sr-diff"><del>{m[0]}</del><ins>{replacement}</ins></span>);
    else out.push(<mark key={i} className="cg-sr-mark">{m[0]}</mark>);
    last = i + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

export function SearchScreen({ mode, state = "results", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (["results", "no-results", "filters", "replace"].includes(state) ? state : "results") as SearchState;
  const p = preset[s];
  const [q, setQ] = useState(p.q);
  const [caseSensitive, setCase] = useState(false);
  const [word, setWord] = useState(false);
  const [scopes, setScopes] = useState<ReadonlySet<Scope>>(new Set<Scope>(["entries", "text", "references", "statements"]));
  const [filters, setFilters] = useState<Filters>(p.filters);
  const [menu, setMenu] = useState<keyof Filters | null>(null);
  const [replaceOpen, setReplaceOpen] = useState(p.replace !== undefined);
  const [replacement, setReplacement] = useState(p.replace ?? "");
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set());
  const [replaced, setReplaced] = useState<ReadonlySet<string> | null>(null);
  const [withOff, setWithOff] = useState(false);
  const [selId, setSelId] = useState<string | undefined>(p.sel);
  const [opened, setOpened] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const re = matcher(q, caseSensitive, word);
  const docs = withOff ? [...index, ...offLayerDocs] : index;
  const all = useMemo(() => (re ? docs.filter((d) => { re.lastIndex = 0; return re.test(d.text); }) : []), [q, caseSensitive, word, withOff]);
  const inScope = all.filter((d) => scopes.has(scopeOf[d.field]));
  const hits = inScope.filter((d) => (!filters.kind || d.kind === filters.kind) && (!filters.source || d.source === filters.source) && (!filters.layer || d.layer === filters.layer));
  const hidden = inScope.length - hits.length;
  const replaceable = (d: SearchDoc) => d.field === "name" || d.field === "text";
  const sel = hits.find((d) => d.id === selId) ?? hits[0];
  const entriesHit = new Set(hits.map((d) => d.entry ?? d.file)).size;
  const toReplace = hits.filter((d) => replaceable(d) && !skipped.has(d.id));
  const files = new Set(toReplace.map((d) => d.file)).size;
  const keyHits = replaceOpen ? hits.filter((d) => !replaceable(d)) : [];

  const move = (step: number) => {
    const i = hits.findIndex((d) => d.id === sel?.id);
    const next = hits[Math.max(0, Math.min(hits.length - 1, i + step))];
    if (next) { setSelId(next.id); requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(next.id)}"]`)?.focus()); }
  };
  const keys = useRef({ move, open: () => undefined as void });
  keys.current = { move, open: () => { if (sel) setOpened(sel.entry ? entryName(sel.entry) : sel.file); } };
  const claim = useWindowKeys(interactive, (event: KeyboardEvent) => {
    if ((event.target as HTMLElement).tagName === "INPUT") return;
    if (event.key === "ArrowDown") { event.preventDefault(); keys.current.move(1); }
    if (event.key === "ArrowUp") { event.preventDefault(); keys.current.move(-1); }
    if (event.key === "Enter") keys.current.open();
    if (event.key === "Escape") { setMenu(null); setOpened(null); }
    if (event.metaKey && event.altKey && event.code === "KeyF") { event.preventDefault(); setReplaceOpen((v) => !v); }
  });

  const options: Record<keyof Filters, { value: string; label: string }[]> = {
    kind: [...new Set(inScope.map((d) => d.kind))].map((k) => ({ value: k, label: kindName[k] ?? k })),
    source: [...new Set(inScope.map((d) => d.source))].map((v) => ({ value: v, label: v })),
    layer: [...new Set(inScope.map((d) => d.layer))].map((v) => ({ value: v, label: v })),
  };
  const filterLabel = (key: keyof Filters, value?: string) => (key === "kind" && value ? kindName[value as Kind] ?? value : value);
  const chip = (key: keyof Filters, label: string) => (
    <span className="cg-chipwrap" key={key}>
      <button type="button" className={`cg-chip${filters[key] ? " on" : ""}`} aria-haspopup="menu" aria-expanded={menu === key} onClick={() => setMenu(menu === key ? null : key)} title={`Show only one ${label.toLowerCase()}`}>
        {label}<strong>{filters[key] ? filterLabel(key, filters[key]) : "All"}</strong><ChevronDown size={12} />
      </button>
      {filters[key] ? <button type="button" className="cg-chip-x" aria-label={`Clear the ${label.toLowerCase()} filter`} title="Clear this filter" onClick={() => setFilters({ ...filters, [key]: undefined })}><X size={12} /></button> : null}
      {menu === key ? (
        <div className="cg-menu cg-chipmenu" role="menu">
          <button type="button" role="menuitemradio" aria-checked={!filters[key]} className={`cg-menu-item${!filters[key] ? " sel" : ""}`} onClick={() => { setFilters({ ...filters, [key]: undefined }); setMenu(null); }}>All<span className="cg-menu-key">{inScope.length}</span></button>
          <div className="cg-menu-sep" />
          {options[key].map((o) => (
            <button type="button" role="menuitemradio" aria-checked={filters[key] === o.value} key={o.value} className={`cg-menu-item${filters[key] === o.value ? " sel" : ""}`} onClick={() => { setFilters({ ...filters, [key]: o.value }); setMenu(null); }}>
              {o.label}<span className="cg-menu-key">{inScope.filter((d) => (key === "kind" ? d.kind : key === "source" ? d.source : d.layer) === o.value).length}</span>
            </button>
          ))}
        </div>
      ) : null}
    </span>
  );

  /* Results grouped by source, then by entry (or file for module-level lines). */
  const groups = sourceOrder.map((source) => ({ source, docs: hits.filter((d) => d.source === source) })).filter((g) => g.docs.length);
  const toggleSkip = (id: string) => setSkipped((cur) => { const next = new Set(cur); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  return (
    <Win mode={mode} interactive={interactive} onClaim={claim}>
      <EditorGrid side={<Sidebar active="search" updates={allDiagnostics.length} entry={null} source={null} />}>
        <main className="d-main" aria-label="Search">
          <header className="d-top">
            <BackForward back="Warden Squad" />
            <span className="d-crumbs">Demo Skirmish<span>/</span>Search</span>
            <span className="d-spacer" />
            <span className="d-muted">{withOff ? "3 sources, 3 layers" : "3 sources, 2 layers on"} · en · 4 ms</span>
          </header>
          <div className="cg-sr-head">
            <div className="cg-sr-row">
              <button type="button" className="d-icon sm" onClick={() => setReplaceOpen(!replaceOpen)} aria-expanded={replaceOpen} aria-label={replaceOpen ? "Hide replace" : "Show replace"} title={`${replaceOpen ? "Hide" : "Show"} replace (⌥⌘F)`}>{replaceOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button>
              <label className="cg-sr-field">
                <Search size={14} />
                <input value={q} onChange={(e) => { setQ(e.target.value); setReplaced(null); }} placeholder="Search the dataset" aria-label="Search the dataset" />
                <span className="cg-sr-toggles">
                  <button type="button" aria-pressed={caseSensitive} className={caseSensitive ? "on" : ""} onClick={() => setCase(!caseSensitive)} title="Match case (⌥⌘C)">Aa</button>
                  <button type="button" aria-pressed={word} className={word ? "on" : ""} onClick={() => setWord(!word)} title="Whole word (⌥⌘W)"><span className="cg-sr-word">ab</span></button>
                </span>
              </label>
              <span className="cg-sr-scopes" role="group" aria-label="Search in">
                {(Object.keys(scopeLabel) as Scope[]).map((sc) => (
                  <button key={sc} type="button" aria-pressed={scopes.has(sc)} className={`cg-sr-scope${scopes.has(sc) ? " on" : ""}`} onClick={() => setScopes((cur) => { const next = new Set(cur); if (next.has(sc)) next.delete(sc); else next.add(sc); return next; })}
                    title={sc === "entries" ? "Entry names and keys" : sc === "text" ? "Rule text, notes and other text" : sc === "references" ? "References to other entries" : "Other statements in the module text"}>
                    {scopes.has(sc) ? <Check size={12} /> : null}{scopeLabel[sc]}<span>{all.filter((d) => scopeOf[d.field] === sc).length}</span>
                  </button>
                ))}
              </span>
            </div>
            {replaceOpen ? (
              <div className="cg-sr-row">
                <span className="cg-sr-indent" />
                <label className="cg-sr-field">
                  <Replace size={14} />
                  <input value={replacement} onChange={(e) => { setReplacement(e.target.value); setReplaced(null); }} placeholder="Replace in names and text" aria-label="Replace with" />
                </label>
                {replaced ? (
                  <span className="cg-sr-done" role="status"><Check size={14} className="d-ok" />Replaced {replaced.size} in {files} {files === 1 ? "file" : "files"}<button type="button" className="d-btn sm" onClick={() => setReplaced(null)}><Undo2 size={12} />Undo<kbd>⌘Z</kbd></button></span>
                ) : (
                  <button type="button" className="d-btn primary" disabled={!toReplace.length || !replacement} onClick={() => setReplaced(new Set(toReplace.map((d) => d.id)))} title={toReplace.length ? `Replace the ${toReplace.length} checked matches (⇧⌘↵)` : "No text match to replace"}>
                    <Replace size={13} />Replace {toReplace.length} in {files} {files === 1 ? "file" : "files"}<kbd>⇧⌘↵</kbd>
                  </button>
                )}
                <span className="d-muted">Names and text only; each checked match below shows its change</span>
              </div>
            ) : null}
          </div>
          <div className="cg-ib-filters cg-sr-filters" role="toolbar" aria-label="Filters">
            {chip("kind", "Kind")}{chip("source", "Source")}{chip("layer", "Layer")}
            <span className="d-spacer" />
            <span className="d-muted">{hits.length ? `${hits.length} ${hits.length === 1 ? "match" : "matches"} in ${entriesHit} ${entriesHit === 1 ? "place" : "places"}` : "No matches"}{hidden ? <> · {hidden} hidden by filters <button type="button" className="cg-linkbtn" onClick={() => setFilters({})}>Clear</button></> : null}</span>
          </div>

          {hits.length === 0 ? (
            <div className="cg-sr-emptywrap"><NoResults q={q} withOff={withOff} hidden={hidden} onOff={() => setWithOff(true)} onClear={() => setFilters({})} /></div>
          ) : (
            <div className="cg-sr">
              <div className="cg-sr-list" ref={listRef} role="listbox" aria-label="Matches">
                {groups.map((g) => {
                  const entries = [...new Set(g.docs.map((d) => d.entry ?? `file:${d.file}`))];
                  const layer = g.docs[0].layer;
                  return (
                    <section key={g.source} className="cg-sr-group" aria-label={g.source}>
                      <h3>{layer === g.source ? <Layers size={13} /> : <KindIcon kind={g.source === "Demo Skirmish" ? "system" : "catalogue"} size={13} />}{g.source}{layer !== "Base" ? <span className="d-layer">{layer === g.source ? (layer === "Short names" ? "add-on" : layer === "Draft points" ? "variant · test" : "variant") : layer}</span> : null}<span className="d-muted">{g.docs.length}</span></h3>
                      {entries.map((key) => {
                        const list = g.docs.filter((d) => (d.entry ?? `file:${d.file}`) === key);
                        const first = list[0];
                        return (
                          <div key={key} className="cg-sr-entry" role="group" aria-label={first.entryName}>
                            <p className="cg-sr-ehead"><KindIcon kind={first.entry ? first.kind : "catalogue"} size={14} /><strong>{first.entry ? first.entryName : first.file}</strong>{first.entry ? <span className="mono">{first.entry}</span> : null}<span className="d-spacer" /><span className="d-muted">{list.length}</span></p>
                            {list.map((d) => {
                              const can = replaceable(d);
                              const done = replaced?.has(d.id);
                              const repl = replaceOpen && can && !skipped.has(d.id) ? replacement : undefined;
                              return (
                                <div key={d.id} data-id={d.id} role="option" aria-selected={sel?.id === d.id} tabIndex={sel?.id === d.id ? 0 : -1}
                                  className={`cg-sr-hit${sel?.id === d.id ? " selected" : ""}${replaceOpen && !can ? " locked" : ""}`} onClick={() => setSelId(d.id)} onDoubleClick={() => setOpened(d.entry ? entryName(d.entry) : d.file)}>
                                  {replaceOpen ? (can ? (
                                    <button type="button" role="checkbox" aria-checked={!skipped.has(d.id)} className="cg-check cg-sr-check" onClick={(e) => { e.stopPropagation(); toggleSkip(d.id); }} aria-label={`Replace this match in ${d.file}:${d.line}`}><i>{!skipped.has(d.id) ? <Check size={10} strokeWidth={3} /> : null}</i></button>
                                  ) : <span className="cg-sr-lock" title="A key or a reference: renamed with Rename…, not as text">key</span>) : <span className={`cg-sr-field-tag ${d.field}`}>{fieldLabel[d.field]}</span>}
                                  <span className={`cg-sr-text${d.prefix ? "" : " mono"}`}>{d.prefix ? <span className="cg-sr-prefix">{d.prefix}</span> : null}{marked(d.text, re && new RegExp(re.source, re.flags), repl, done)}</span>
                                  <span className="mono cg-sr-line">{done ? <Check size={12} className="d-ok" /> : null}{d.file.split("/").pop()}:{d.line}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </section>
                  );
                })}
              </div>
              <Preview doc={sel} re={re} keyHits={keyHits.length} replaceOpen={replaceOpen} onOpen={() => sel && setOpened(sel.entry ? entryName(sel.entry) : sel.file)} />
            </div>
          )}
          <footer className="cg-ib-keys"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> open the entry <kbd>⌘↵</kbd> open at the line <kbd>⌥⌘F</kbd> replace <span className="d-spacer" />{opened ? <span className="cg-ib-opened">Opens {opened} at the match · <kbd>⌘[</kbd> back to these results</span> : <span><kbd>⌘K</kbd> jumps to one entry; <kbd>⇧⌘F</kbd> searches everything</span>}</footer>
        </main>
      </EditorGrid>
    </Win>
  );
}

function Preview({ doc, re, keyHits, replaceOpen, onOpen }: { doc?: SearchDoc; re: RegExp | null; keyHits: number; replaceOpen: boolean; onOpen: () => void }) {
  if (!doc) return <section className="cg-sr-preview" aria-label="Preview" />;
  const lines = doc.lines ?? [doc.text];
  const from = Math.max(1, doc.line - 4);
  const to = Math.min(lines.length, doc.line + 4);
  const line = lines[doc.line - 1] ?? "";
  const m = re ? new RegExp(re.source, re.flags.replace("g", "")).exec(line) : null;
  const isKey = doc.field === "key" || doc.field === "reference";
  return (
    <section className="cg-sr-preview" aria-label="Preview">
      <p className="cg-ib-kicker"><KindIcon kind={doc.entry ? doc.kind : "catalogue"} size={14} />{doc.entry ? entryName(doc.entry) : doc.source}<span className="mono">{doc.file}:{doc.line}</span></p>
      <div className="cg-ib-code cg-sr-code">
        <CodeView lines={lines} start={from} end={to} selected={[doc.line, doc.line]} caret={m ? { line: doc.line, col: m.index + m[0].length } : undefined} label={`${doc.file}, lines ${from} to ${to}`} compact />
      </div>
      <dl className="cg-ib-facts cg-sr-facts">
        <div><dt>Field</dt><dd>{fieldLabel[doc.field]}{doc.field === "text" ? <span className="d-muted">{doc.prefix?.replace(": ", "")}</span> : null}</dd></div>
        <div><dt>Source</dt><dd>{doc.source}{doc.layer !== "Base" ? <span className="d-layer">{doc.layer}</span> : <span className="d-muted">Base</span>}</dd></div>
      </dl>
      <p className="cg-ib-actions">
        <button type="button" className="d-btn primary" onClick={onOpen}><CornerDownLeft size={13} />{doc.entry ? `Open ${entryName(doc.entry)}` : "Open the file"}<kbd>↵</kbd></button>
        <button type="button" className="d-btn" onClick={onOpen}>Open at line {doc.line}<kbd>⌘↵</kbd></button>
        {isKey ? <button type="button" className="d-btn" title="Rename the key everywhere it is used and write a move record (the rename preview)"><PenLine size={13} />Rename key…<kbd>F2</kbd></button> : null}
      </p>
      {replaceOpen ? (
        <p className="cg-ly-callout"><PenLine size={14} /><span>{keyHits ? <><strong>{keyHits} {keyHits === 1 ? "match is a key or a reference" : "matches are keys or references"}</strong>: they aren't replaced as text. </> : null}Renaming a key changes every reference to it and writes a move record, so rosters and patches follow it: use <strong>Rename…</strong> (F2) on the key. The key <code>shield-wall</code> has 3 references.</span></p>
      ) : null}
    </section>
  );
}

function NoResults({ q, withOff, hidden, onOff, onClear }: { q: string; withOff: boolean; hidden: number; onOff: () => void; onClear: () => void }) {
  return (
    <div className="cg-ib-clear cg-sr-none" role="status">
      <span className="cg-sr-none-mark"><Search size={20} /></span>
      <h2>No match for “{q}”</h2>
      <p>Searched entries, text, references and statements in Demo Skirmish, Iron Wardens and Frost Wardens, with {withOff ? "every layer, Draft points included" : "the layers that are on (House rules, Short names)"}, in the en text.</p>
      <dl className="cg-ib-facts cg-ib-checked">
        <div><dt>Not searched</dt><dd>{withOff ? <span className="d-muted">nothing: every layer was searched</span> : <>Draft points<span className="d-muted">off (a test variant)</span></>}</dd></div>
        <div><dt>Filters</dt><dd>{hidden ? <>{hidden} matches hidden<button type="button" className="cg-linkbtn" onClick={onClear}>Clear filters</button></> : <span className="d-muted">none set</span>}</dd></div>
        <div><dt>Closest</dt><dd><span className="d-mwrap"><span className="d-mention">Spear</span></span><span className="d-mwrap"><span className="d-mention">Shield Bearers</span></span><span className="d-muted">by name</span></dd></div>
      </dl>
      <p className="cg-ib-actions">
        {withOff ? null : <button type="button" className="d-btn" onClick={onOff}><Layers size={13} />Search with Draft points on</button>}
        <button type="button" className="d-btn"><FilePlus2 size={13} />New entry “{q}”…<kbd>⌘N</kbd></button>
      </p>
    </div>
  );
}
