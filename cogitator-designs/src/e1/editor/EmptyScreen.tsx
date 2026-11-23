import { ArrowDownLeft, ChevronDown, Code2, FileText, Focus, Layers, Maximize2, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { useRef, useState } from "react";
import { KindIcon } from "../../glyphs";
import { allDiagnostics } from "./data";
import { CodeView } from "./code";
import { BackForward, EditorGrid, Sidebar, Win, type Mode, useWindowKeys } from "./shell";
import { layout } from "../../language/layout";

/**
 * Screen 4: the editor's own empty states. A source with no entries (the list offers New entry with its key, inline),
 * an entry with no statements (the `/` hint is the first block), and a search that finds nothing (the palette says what
 * it searched and offers the next steps).
 */
export type EmptyState = "no-entries" | "no-statements" | "no-results";

const keyOk = (key: string) => /^[a-z][a-z0-9-]*$/.test(key);

export function EmptyScreen({ mode, state = "no-entries", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const s = (["no-entries", "no-statements", "no-results"].includes(state) ? state : "no-entries") as EmptyState;
  const [created, setCreated] = useState(s === "no-statements");
  const [drafting, setDrafting] = useState(s === "no-entries");
  const [key, setKey] = useState("ash-warden");
  const [palette, setPalette] = useState(s === "no-results");
  const [query, setQuery] = useState("ice wyrm");
  const [slash, setSlash] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const claim = useWindowKeys(interactive, (event: KeyboardEvent) => {
      if (event.metaKey && event.key.toLowerCase() === "k") { event.preventDefault(); setPalette(true); }
      if (event.metaKey && event.key.toLowerCase() === "n") { event.preventDefault(); setCreated(false); setDrafting(true); requestAnimationFrame(() => input.current?.focus()); }
      if (event.key === "Escape") { setPalette(false); setSlash(false); }
  });

  const create = () => { if (keyOk(key)) { setCreated(true); setDrafting(false); } };
  const name = key.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const moduleLines = ["catalogue ember-guard", "  revision 1", "  system demo-skirmish 3", "  import iron-wardens", ...(created ? ["", `unit ${key}`] : [])];

  const list = (
    <section className="d-src" aria-label="Ember Guard entries">
      <div className="d-src-in" style={{ width: layout.sourceList }}>
        <header className="d-src-head">
          <KindIcon kind="system" size={15} /><strong>Ember Guard</strong><span className="d-muted">{created ? 1 : 0}</span><span className="d-layer">add-on</span>
          <span className="d-spacer" />
          <button type="button" className="d-icon" aria-label="Focus mode: hide the sidebar" title="Focus mode: hide the sidebar (⌘.)"><Maximize2 size={14} /></button>
          <button type="button" className="d-icon" aria-label="Close Ember Guard" title="Close the source list"><X size={15} /></button>
        </header>
        <div className="d-src-tools">
          <label className="d-filter"><Search size={13} /><input placeholder="Filter Ember Guard" aria-label="Filter Ember Guard" disabled={!created} title={created ? undefined : "Nothing to filter yet"} /></label>
          <button type="button" className="d-icon sm" aria-label="Display options" title="Display options"><SlidersHorizontal size={14} /></button>
        </div>
        <div className="d-rows">
          {created ? (
            <>
              <button type="button" className="d-group" aria-expanded><ChevronDown size={13} />Units<span>1</span></button>
              <button type="button" className="d-row selected" aria-current="true"><KindIcon kind="unit" size={14} /><span className="d-name d-notext">{key}</span><span className="d-changed off" /><span className="d-cost num">–</span><span className="d-diag" /></button>
            </>
          ) : drafting ? (
            <div className="cg-newrow" role="group" aria-label="New entry">
              <p className="cg-newrow-label">New entry in Ember Guard</p>
              <div className="cg-newrow-fields">
                <button type="button" className="cg-kindpick" title="Kind of entry (Tab, then ↑ ↓)"><KindIcon kind="unit" size={14} />Unit<ChevronDown size={12} /></button>
                <label className={`cg-keyfield${keyOk(key) ? "" : " bad"}`}>
                  <span className="mono d-muted">ember-guard:</span>
                  <input ref={input} className="mono" value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") create(); if (e.key === "Escape") { e.stopPropagation(); setDrafting(false); } }} aria-label="Key of the new entry" />
                </label>
              </div>
              <p className={`cg-newrow-help${keyOk(key) ? "" : " bad"}`}>{keyOk(key) ? <>The key is how references name it (<span className="mono">use ash-warden</span>); the name goes in the text pack. </> : <>A key is lower case: letters, digits and hyphens, starting with a letter. </>}</p>
              <p className="cg-newrow-actions">
                <button type="button" className="d-btn sm primary" onClick={create} disabled={!keyOk(key)} title={keyOk(key) ? undefined : "Fix the key first"}>Create unit<kbd>↵</kbd></button>
                <button type="button" className="d-btn sm" onClick={() => setDrafting(false)}>Cancel<kbd>Esc</kbd></button>
              </p>
            </div>
          ) : (
            <div className="cg-listempty">
              <p><strong>No entries yet</strong></p>
              <p className="d-muted">Ember Guard is an empty catalogue. Add a unit, a model or an upgrade; each becomes a page.</p>
              <button type="button" className="d-btn sm primary" onClick={() => { setDrafting(true); requestAnimationFrame(() => input.current?.focus()); }}><Plus size={13} />New entry<kbd>⌘N</kbd></button>
            </div>
          )}
        </div>
        <footer className="d-src-foot"><kbd>⌘N</kbd> new entry <span className="d-spacer" />add-on layer · by kind</footer>
      </div>
    </section>
  );

  const page = created ? (
    <div className="d-scroll helper-collapsed">
      <div className="d-doc">
        <article className="d-page">
          <div className="d-pageicon"><KindIcon kind="unit" size={28} /></div>
          <h1 className="d-notext">{key}<span className="d-tag warn">No en text</span></h1>
          <p className="d-backlinks"><ArrowDownLeft size={14} /><span className="d-muted">No backlinks yet: nothing refers to it</span></p>
          <dl className="d-props">
            <div><dt><KindIcon kind="unit" size={14} />Kind</dt><dd>Unit<span className="d-muted"><span className="mono">ember-guard:{key}</span></span></dd></div>
            <div><dt><FileText size={14} />Name</dt><dd><button type="button" className="cg-addname">Add a name in the en text pack, for example “{name}”</button></dd></div>
            <div><dt><Layers size={14} />Layer</dt><dd>Ember Guard<span className="d-muted">add-on</span></dd></div>
          </dl>
          <div className="d-blocks">
            <div className="d-block i0 typing cg-firstblock">
              <span className="d-tog-space" />
              <button type="button" className="d-slashbtn" aria-expanded={slash} onClick={() => setSlash(!slash)}><span className="d-slash">/</span><span className="d-caret" /><span className="d-placeholder">Type / to insert the first statement, or start with a keyword: <span className="mono">cost</span>, <span className="mono">model</span>, <span className="mono">cat</span>, <span className="mono">use</span></span></button>
            </div>
            {slash ? (
              <div className="d-slashmenu" role="menu" aria-label="Insert a statement">
                <p>Valid in <span className="mono">unit {key}</span></p>
                {[{ k: "model" as const, n: "Model", syn: "model key range" }, { k: "category" as const, n: "Category", syn: "cat key" }, { k: "upgrade" as const, n: "Upgrade", syn: "upgrade key range" }].map((item, i) => (
                  <button type="button" role="menuitem" key={item.n} className={i === 0 ? "sel" : ""} onClick={() => setSlash(false)}><KindIcon kind={item.k} size={15} /><span><strong>{item.n}</strong><small className="mono">{item.syn}</small></span>{i === 0 ? <kbd>↵</kbd> : null}</button>
                ))}
              </div>
            ) : null}
            <p className="cg-emptyhint">No statements yet. A unit usually starts with its cost (<span className="mono">cost pts 20</span>) and a model (<span className="mono">model warden 5..10</span>).</p>
          </div>
        </article>
      </div>
    </div>
  ) : (
    <div className="cg-split" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div className="cg-pageempty">
        <KindIcon kind="system" size={26} />
        <h2>Ember Guard has no entries</h2>
        <p>Its pages appear here once it has entries. The module so far:</p>
        <div className="cg-ib-code"><CodeView lines={moduleLines} label="ember-guard/module.dkl" compact /></div>
        <p className="d-muted">ember-guard/module.dkl · fmt clean · imports Iron Wardens</p>
      </div>
    </div>
  );

  return (
    <Win mode={mode} interactive={interactive} onClaim={claim}>
      <EditorGrid
        side={<Sidebar source="ember-guard" entry={created ? `ember-guard:${key}` : null} updates={allDiagnostics.length} active={palette ? "search" : null} onSearch={() => setPalette(true)} extra={{ id: "ember-guard", name: "Ember Guard", rows: created ? [{ id: `ember-guard:${key}`, name: key }] : [] }} />}
        list={list}>
        <main className="d-main" aria-label="Entry">
          <header className="d-top">
            <BackForward back={created ? "Ember Guard" : undefined} />
            <span className="d-crumbs">Ember Guard{created ? <><span>/</span>{key}</> : null}</span>
            <span className="d-spacer" />
            <span className="d-muted">{created ? "Created just now" : "New catalogue"}</span>
            <button type="button" className="d-ghost" title="Focus mode: hide the sidebar (⌘.)"><Focus size={14} />Focus<kbd>⌘.</kbd></button>
            <button type="button" className="d-ghost" title="Show the DKLPO text beside the page (⌘⌥U)"><Code2 size={14} />Source</button>
          </header>
          {page}
        </main>
      </EditorGrid>
      {palette ? (
        <div className="cg-scrim" onClick={() => setPalette(false)}>
          <div className="cg-palette cg-ed-palette" role="dialog" aria-label="Search" onClick={(e) => e.stopPropagation()}>
            <div className="cg-pal-input"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search entries, commands and text" /><span className="cg-pal-scope">All</span><kbd>Esc</kbd></div>
            <div className="cg-pal-body">
              <p className="cg-pal-empty">Nothing matches “{query}”. Searched 28 entries in 4 sources, the en text pack and the commands; Draft points is off, so its entries weren't searched.</p>
              <div className="cg-pal-group">Next steps</div>
              <button type="button" className="cg-pal-row selected"><Plus size={15} /><strong>Create unit <span className="mono">{query.trim().toLowerCase().replace(/\s+/g, "-")}</span> in Ember Guard…</strong><span className="cg-pal-end"><kbd>↵</kbd></span></button>
              <button type="button" className="cg-pal-row"><Layers size={15} /><strong>Search with Draft points on too</strong></button>
              <button type="button" className="cg-pal-row" onClick={() => setQuery("")}><X size={15} /><strong>Clear the search</strong></button>
            </div>
            <div className="cg-pal-foot"><kbd>↑</kbd><kbd>↓</kbd><span>move</span><kbd>↵</kbd><span>run</span><kbd>Esc</kbd><span>close</span></div>
          </div>
        </div>
      ) : null}
    </Win>
  );
}
