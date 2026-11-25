import { ArrowDownLeft, ArrowRight, Check, ChevronDown, CircleAlert, CircleSlash, Code2, Copy, CornerDownLeft, Delete, FileCode2, Focus, FolderOpen, GitMerge, GripVertical, Hash, Info, Layers, MoreHorizontal, Play, Plus, Power, RefreshCw, Trash2, X } from "lucide-react";
import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { DiagIcon, KindIcon } from "../../glyphs";
import { M } from "../../directions/direction-d-content";
import { allDiagnostics } from "../editor/data";
import { CodeView, SynText } from "../editor/code";
import { Pill } from "../editor/parts";
import { BackForward, EditorGrid, Sidebar, Win, type Mode, useWindowKeys } from "../editor/shell";
import { Sheet } from "../tools/common";
import { BASE_VERSION, BUILT_AT, kindLabel, stackFor, type LayerDef, type LayerState } from "./data";
import "./layers.css";

/**
 * Screen 1: the layer stack. The sidebar's Layers opens it as a full view in place of the list and the page (as Updates
 * opens the inbox). Left: the base and its layers in their order (later wins), each with its kind, version, `requires:`
 * result and status; right: the selected layer's manifest, patch report, the values it changes (with the conflicts where
 * a later layer sets the same value) and, for an add-on, the display-only check. "Show on page" switches the page to the
 * layer overlay: changed values marked with the layer that set them, the effective value beside the base one.
 */

const initialSel: Record<LayerState, string> = { stack: "demo-skirmish-house", refused: "demo-skirmish-frost", conflict: "demo-skirmish-draft", "addon-rules": "demo-skirmish-names", overlay: "demo-skirmish-house" };
const draftKey = "demo-skirmish-draft";
const houseKey = "demo-skirmish-house";
const frostKey = "demo-skirmish-frost";

/**
 * E1-6 as built (the grooming readings, approved by the user 2026-11-25). G5 (a design change, drawn as the review
 * page's mockup): a layer row's context menu, by right-click or the row's ⋯ (shown on hover, selection and focus; the
 * base row has none): Turn off / on (Space), Open its manifest, Show in Finder, then Remove from this stack… in the
 * destructive colour; it and Delete on a selected row open the confirmation. Removing drops the folder from the base's
 * stack only, never touching it on disk. G3: Check layers reads the folders again and rebuilds, the header reading
 * "Checking the stack…". G11: Declare it a variant… and Remove … from the pack stay drawn disabled ("… is in no slice
 * yet"). G1: Add layer… refuses a folder that is no layer, above the list, with Dismiss.
 */
type AsBuilt = "menu" | "remove" | "checking" | "addon-fixes" | "add-refused";
const AS_BUILT: AsBuilt[] = ["menu", "remove", "checking", "addon-fixes", "add-refused"];
const asBuiltBase: Record<AsBuilt, LayerState> = { menu: "stack", remove: "stack", checking: "stack", "addon-fixes": "addon-rules", "add-refused": "stack" };
const asBuiltSel: Record<AsBuilt, string> = { menu: frostKey, remove: frostKey, checking: houseKey, "addon-fixes": "demo-skirmish-names", "add-refused": houseKey };
const DECLARE_LATER = "Declare it a variant… is in no slice yet";
const REMOVE_KEY_LATER = "Remove rally from the pack is in no slice yet";

export function LayerStackScreen({ mode, state = "stack", interactive }: { mode: Mode; state?: string; interactive: boolean }) {
  const built = (AS_BUILT as string[]).includes(state) ? (state as AsBuilt) : null;
  const s = (built ? asBuiltBase[built] : ["stack", "refused", "conflict", "addon-rules", "overlay"].includes(state) ? state : "stack") as LayerState;
  const [view, setView] = useState<"stack" | "overlay">(s === "overlay" ? "overlay" : "stack");
  const [stack, setStack] = useState<LayerDef[]>(() => stackFor(s === "overlay" ? "stack" : s));
  const [sel, setSel] = useState(built ? asBuiltSel[built] : initialSel[s]);
  const [order, setOrder] = useState<"derived" | "explicit">("derived");
  const [checking, setChecking] = useState(built === "checking");
  const [menuFor, setMenuFor] = useState<string | null>(built === "menu" ? frostKey : null);
  const [removing, setRemoving] = useState<string | null>(built === "remove" ? frostKey : null);
  const [addRefusal, setAddRefusal] = useState(built === "add-refused");
  const [copied, setCopied] = useState(false);
  const dragKey = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const applied = stack.filter((l) => l.status !== "off");
  const off = stack.filter((l) => l.status === "off");
  const layersOn = stack.filter((l) => l.kind !== "dataset" && l.status !== "off").length;
  const refused = stack.filter((l) => l.status === "refused").length;
  const draftIndex = stack.findIndex((l) => l.key === draftKey);
  const houseIndex = stack.findIndex((l) => l.key === houseKey);
  const orderError = order === "explicit" && stack[draftIndex]?.status !== "off" && draftIndex >= 0 && draftIndex < houseIndex
    ? "`demo-skirmish-draft` comes before `demo-skirmish-house`, but its patch `trial` comes `after house`, which `demo-skirmish-house` holds. Nothing is applied until the order is fixed."
    : null;
  const selected = stack.find((l) => l.key === sel) ?? stack[1];

  const toggle = (key: string) => {
    const layer = stack.find((l) => l.key === key);
    if (!layer || layer.kind === "dataset") return;
    if (key === draftKey) { const next = stackFor(layer.status === "off" ? "conflict" : "stack"); setStack(order === "explicit" ? reorderLike(next, stack) : next); return; }
    setStack((cur) => cur.map((l) => (l.key === key ? { ...l, status: l.status === "off" ? "applied" : "off" } : l)));
  };
  const move = (key: string, step: number) => {
    if (order !== "explicit") return;
    setStack((cur) => {
      const i = cur.findIndex((l) => l.key === key);
      const j = i + step;
      if (i < 1 || j < 1 || j >= cur.length || cur[j].status === "off" || cur[i].status === "off") return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const dropOn = (target: string) => {
    const from = dragKey.current;
    dragKey.current = null;
    if (!from || from === target || order !== "explicit") return;
    setStack((cur) => {
      const moving = cur.find((l) => l.key === from);
      if (!moving || moving.kind === "dataset") return cur;
      const rest = cur.filter((l) => l.key !== from);
      const at = Math.max(1, rest.findIndex((l) => l.key === target));
      return [...rest.slice(0, at), moving, ...rest.slice(at)];
    });
  };
  const runCheck = () => { if (checking) return; setChecking(true); window.setTimeout(() => setChecking(false), 900); };
  const remove = (key: string) => { setStack((cur) => cur.filter((l) => l.key !== key)); setSel((cur) => (cur === key ? stack[0].key : cur)); setRemoving(null); setMenuFor(null); };
  const removingLayer = removing ? stack.find((l) => l.key === removing) : undefined;

  const keys = useRef({ toggle, move, sel, ask: (_key: string) => undefined as void, esc: () => undefined as void });
  keys.current = { toggle, move, sel, ask: (key) => { if (built && key !== stack[0].key) setRemoving(key); }, esc: () => { setMenuFor(null); setRemoving(null); } };
  const claim = useWindowKeys(interactive, (event: KeyboardEvent) => {
    if (view !== "stack" || (event.target as HTMLElement).tagName === "INPUT") return;
    if (event.key === "Escape") { keys.current.esc(); return; }
    if ((event.key === "Delete" || event.key === "Backspace") && (event.target as HTMLElement).closest?.(".cg-ly-row")) { event.preventDefault(); keys.current.ask(keys.current.sel); return; }
    const list = applied.concat(off);
    const i = list.findIndex((l) => l.key === keys.current.sel);
    if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) { event.preventDefault(); keys.current.move(keys.current.sel, event.key === "ArrowUp" ? -1 : 1); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = list[Math.max(0, Math.min(list.length - 1, i + (event.key === "ArrowDown" ? 1 : -1)))];
      if (next) { setSel(next.key); requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-key="${next.key}"]`)?.focus()); }
    }
    if (event.key === " " && (event.target as HTMLElement).closest?.(".cg-ly-row")) { event.preventDefault(); keys.current.toggle(keys.current.sel); }
  });

  if (view === "overlay") return <OverlayPage mode={mode} interactive={interactive} cardOpen={s === "overlay"} onBack={() => setView("stack")} />;

  const status = orderError ? <span className="cg-ly-status err"><CircleAlert size={13} />Layer order error · nothing applied</span>
    : refused ? <span className="cg-ly-status err"><CircleAlert size={13} />Built {BUILT_AT} · incomplete: {refused} layer refused</span>
    : <span className="cg-ly-status"><span className="d-dot" />Built {BUILT_AT} · complete</span>;

  return (
    <Win mode={mode} interactive={interactive} onClaim={claim}>
      <EditorGrid side={<Sidebar active="layers" updates={allDiagnostics.length} entry={null} source={null} layers={refused ? <span className="cg-ly-sidecount"><CircleAlert size={12} />{refused} refused</span> : `${layersOn} of 4`} />}>
        <main className="d-main" aria-label="Layers">
          <header className="d-top">
            <BackForward back="Warden Squad" />
            <span className="d-crumbs">Demo Skirmish<span>/</span>Layers</span>
            <span className="d-spacer" />
            {checking ? <span className="cg-ly-status"><RefreshCw size={13} className="cg-spin" />Checking the stack…</span> : status}
            <button type="button" className="d-btn" onClick={runCheck} disabled={checking} title="Resolve, apply and check every layer over the base (augur dklpo layer check)">{checking ? <RefreshCw size={14} className="cg-spin" /> : <Play size={14} />}Check layers</button>
            <button type="button" className="d-ghost" onClick={built ? () => setAddRefusal(true) : undefined} title="Add an add-on, a variant or a dataset layer from a folder"><Plus size={14} />Add layer…</button>
          </header>
          <div className="cg-ib-filters cg-ly-tools" role="toolbar" aria-label="Order">
            <span className="cg-ly-label">Order</span>
            <span className="cg-seg" role="radiogroup" aria-label="Layer order">
              <button type="button" role="radio" aria-checked={order === "derived"} className={order === "derived" ? "active" : ""} onClick={() => setOrder("derived")} title="From requires: and each patch's after / target, ties by key">Derived</button>
              <button type="button" role="radio" aria-checked={order === "explicit"} className={order === "explicit" ? "active" : ""} onClick={() => setOrder("explicit")} title="Your own order, like --layers: drag the rows or ⌥↑ ⌥↓">Explicit</button>
            </span>
            <span className="d-muted">{order === "derived" ? "From requires: and each patch's after, ties by key. Later layers win." : "Your order, saved for this base (like --layers). Drag a row or ⌥↑ ⌥↓."}</span>
            <span className="d-spacer" />
            <button type="button" className="d-ghost sm" onClick={() => { setCopied(true); window.setTimeout(() => setCopied(false), 1400); }} title="Copy this order as a --layers argument for the command line">
              {copied ? <Check size={13} className="d-ok" /> : <Copy size={13} />}{copied ? "Copied" : "Copy as --layers"}
            </button>
          </div>
          <div className="cg-ly">
            <div className="cg-ly-list" ref={listRef} role="listbox" aria-label="Layer stack">
              {addRefusal ? <p className="cg-ly-callout err" role="alert"><CircleAlert size={14} /><span><strong>Not added.</strong> That folder is the dataset itself: a layer is another dataset. <button type="button" className="cg-linkbtn" onClick={() => setAddRefusal(false)}>Dismiss</button></span></p> : null}
              {orderError ? <p className="cg-ly-callout err" role="alert"><CircleAlert size={14} /><span><strong>dklpo/layer-order.</strong> {code(orderError)} <button type="button" className="cg-linkbtn" onClick={() => setOrder("derived")}>Use the derived order</button></span></p> : null}
              <section className="cg-ly-group" aria-label="Applied in this order">
                <h3>Applied in this order<span className="d-muted">{applied.length}</span><span className="d-spacer" /><span className="cg-ly-wins">later wins <ArrowRight size={11} /></span></h3>
                {applied.map((l, i) => (
                  <LayerRow key={l.key} layer={l} n={i + 1} selected={sel === l.key} explicit={order === "explicit"} conflict={conflictOf(l, stack)} onSel={() => setSel(l.key)} onToggle={() => toggle(l.key)}
                    onDragStart={() => { dragKey.current = l.key; }} onDrop={() => dropOn(l.key)}
                    {...(built ? { onMore: () => { setSel(l.key); setMenuFor(menuFor === l.key ? null : l.key); }, menu: menuFor === l.key ? <RowMenu layer={l} onToggle={() => { toggle(l.key); setMenuFor(null); }} onRemove={() => { setMenuFor(null); setRemoving(l.key); }} /> : undefined } : {})} />
                ))}
              </section>
              {off.length ? (
                <section className="cg-ly-group" aria-label="Off">
                  <h3>Off<span className="d-muted">{off.length}</span></h3>
                  {off.map((l) => <LayerRow key={l.key} layer={l} selected={sel === l.key} explicit={false} onSel={() => setSel(l.key)} onToggle={() => toggle(l.key)}
                    {...(built ? { onMore: () => { setSel(l.key); setMenuFor(menuFor === l.key ? null : l.key); }, menu: menuFor === l.key ? <RowMenu layer={l} onToggle={() => { toggle(l.key); setMenuFor(null); }} onRemove={() => { setMenuFor(null); setRemoving(l.key); }} /> : undefined } : {})} />)}
                </section>
              ) : null}
            </div>
            <Detail layer={selected} stack={stack} n={applied.findIndex((l) => l.key === selected.key) + 1} explicit={order === "explicit"} onToggle={() => toggle(selected.key)} onShow={() => setView("overlay")} onCheck={runCheck} fixesDisabled={Boolean(built)} />
          </div>
          <footer className="cg-ib-keys"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>⌥↑</kbd><kbd>⌥↓</kbd> reorder (explicit) <kbd>Space</kbd> on / off <span className="d-spacer" /><span>The order and the on / off set are kept for this base; rosters record them</span></footer>
        </main>
      </EditorGrid>
      {removingLayer ? (
        <div className="cg-scrim" onClick={() => setRemoving(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Sheet label="Remove a layer" tone="warn" icon={<Trash2 size={18} />} width={460}
              title={<>Remove {removingLayer.title} from Demo Skirmish’s stack?</>} target={`~/Datasets/${removingLayer.folder.replace(/\/$/, "")}`}
              actions={[
                { label: "Cancel", cancel: true, onClick: () => setRemoving(null) },
                { label: "Remove", kind: "primary", onClick: () => remove(removingLayer.key), title: "Take it out of this base's stack; its folder stays on disk" },
              ]}>
              <p>Its folder stays on disk (<code>{removingLayer.folder}</code>); Add layer… brings it back. Rosters that used it open with the data-changed review.</p>
            </Sheet>
          </div>
        </div>
      ) : null}
    </Win>
  );
}

/** G5 (as built): a layer row's context menu. The base row has none. */
function RowMenu({ layer: l, onToggle, onRemove }: { layer: LayerDef; onToggle: () => void; onRemove: () => void }) {
  return (
    <div className="cg-menu cg-ly-menu" role="menu" aria-label={`${l.title}`} onClick={(e) => e.stopPropagation()}>
      <button type="button" role="menuitem" className="cg-menu-item sel" onClick={onToggle}><Power size={14} />{l.status === "off" ? "Turn on" : "Turn off"}<span className="cg-menu-key">Space</span></button>
      <button type="button" role="menuitem" className="cg-menu-item" title="Open the layer's dataset.dkl"><Code2 size={14} />Open its manifest</button>
      <button type="button" role="menuitem" className="cg-menu-item" title={`Show ${l.folder} in Finder`}><FolderOpen size={14} />Show in Finder</button>
      <div className="cg-menu-sep" role="separator" />
      <button type="button" role="menuitem" className="cg-menu-item danger" onClick={onRemove}><Trash2 size={14} />Remove from this stack…<span className="cg-menu-key"><Delete size={13} /></span></button>
    </div>
  );
}

/** Keep the user's explicit order when the draft layer's data swaps (on / off). */
function reorderLike(next: LayerDef[], current: LayerDef[]) {
  const pos = new Map(current.map((l, i) => [l.key, i]));
  return [...next].sort((a, b) => (pos.get(a.key) ?? 99) - (pos.get(b.key) ?? 99));
}

const code = (text: string) => text.split("`").map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part));

/** Which other layer this one overrides or is overridden by (patch-conflict, info). */
function conflictOf(layer: LayerDef, stack: LayerDef[]) {
  const ops = layer.patches?.flatMap((p) => p.ops) ?? [];
  if (ops.some((o) => o.outcome === "overrides")) return { text: "overrides House rules on 1 value", by: false };
  if (ops.some((o) => o.outcome === "overridden") && stack.some((l) => l.key === draftKey && l.status === "applied")) return { text: "1 value set again by Draft points", by: true };
  return undefined;
}

function summary(l: LayerDef) {
  if (l.kind === "dataset") return `${l.modules?.length ?? 0} modules · ${l.text?.keys ?? 0} text keys`;
  if (l.status === "off") return l.purpose.includes("test") ? "Off · test variants are never on by default" : "Off";
  const parts: string[] = [];
  if (l.modules?.length) parts.push(`${l.modules.length} new module`);
  if (l.patches?.length) { const ops = l.patches.flatMap((p) => p.ops); parts.push(`${l.patches.length} patch, ${ops.filter((o) => o.outcome !== "failed").length} of ${ops.length} applied`); }
  if (l.kind === "addon" && l.text) parts.push(`${l.text.keys} text keys`);
  return parts.join(" · ");
}

/** One layer: grip (explicit order), position, kind glyph, title and chips, then its key, version, requires result and status. */
export function LayerRow({ layer: l, n, selected, explicit, conflict, onSel, onToggle, onDragStart, onDrop, cls = "", onMore, menu }: {
  layer: LayerDef; n?: number; selected: boolean; explicit: boolean; conflict?: { text: string; by: boolean }; onSel?: () => void; onToggle?: () => void; onDragStart?: () => void; onDrop?: () => void; cls?: string;
  /** E1-6 as built (G5): the row's ⋯ and its context menu; the row grid gains a 24 px column before the switch. */
  onMore?: () => void; menu?: ReactNode;
}) {
  const isBase = l.kind === "dataset";
  const edge = l.status === "refused" ? " edge-error" : conflict ? " edge-suggestion" : "";
  const drag = explicit && !isBase && l.status !== "off";
  return (
    <div data-key={l.key} role="option" aria-selected={selected} tabIndex={selected ? 0 : -1} className={`cg-ly-row${selected ? " selected" : ""}${l.status === "off" ? " off" : ""}${edge}${onMore ? " with-more" : ""} ${cls}`}
      onClick={onSel} onContextMenu={onMore && !isBase ? (e) => { e.preventDefault(); onMore(); } : undefined} draggable={drag} onDragStart={drag ? (e: DragEvent) => { e.dataTransfer.effectAllowed = "move"; onDragStart?.(); } : undefined}
      onDragOver={explicit ? (e: DragEvent) => e.preventDefault() : undefined} onDrop={explicit ? (e: DragEvent) => { e.preventDefault(); onDrop?.(); } : undefined}>
      <span className={`cg-ly-grip${drag ? "" : " off"}`} aria-hidden title={drag ? "Drag to reorder" : undefined}><GripVertical size={14} /></span>
      <span className="cg-ly-n num">{n ?? "–"}</span>
      <span className="cg-ly-icon">{isBase ? <KindIcon kind="system" size={15} /> : l.kind === "addon" ? <FileCode2 size={15} /> : <Layers size={15} />}</span>
      <span className="cg-ly-main">
        <span className="cg-ly-line1">
          <strong>{l.title}</strong>
          <span className="cg-ly-kind">{isBase ? "base dataset" : kindLabel(l).toLowerCase()}</span>
          {l.purpose.includes("test") ? <span className="cg-ly-test">Test</span> : null}
        </span>
        <span className="cg-ly-line2">
          <span className="mono">{l.key} {l.version}</span>
          {l.requires ? <span className={l.requires.ok ? "" : "cg-ly-bad"}>requires ^{l.requires.range.replace("^", "")} {l.requires.ok ? <Check size={12} className="d-ok" /> : <X size={12} />}</span> : <span>always first</span>}
          {l.status === "refused" ? <span className="cg-ly-bad"><CircleAlert size={12} />Refused: {code(l.refused?.message ?? "")}</span>
            : conflict ? <span className="cg-ly-info"><GitMerge size={12} />{conflict.text}</span>
            : <span className="cg-ly-sum">{summary(l)}</span>}
        </span>
      </span>
      {onMore ? (isBase ? <span aria-hidden /> : <button type="button" className={`d-icon sm cg-ly-more${menu ? " open" : ""}`} aria-haspopup="menu" aria-expanded={Boolean(menu)} aria-label={`More for ${l.title}`} title="More: turn off, open its manifest, show in Finder, remove" onClick={(e) => { e.stopPropagation(); onMore(); }}><MoreHorizontal size={15} /></button>) : null}
      {menu}
      {isBase ? <span className="cg-ly-fixed" aria-hidden /> : (
        <button type="button" role="switch" aria-checked={l.status !== "off"} className="cg-ly-switch" onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
          aria-label={`${l.status === "off" ? "Turn on" : "Turn off"} ${l.title}`} title={l.status === "off" ? `Turn ${l.title} on` : `Turn ${l.title} off`}><i /></button>
      )}
    </div>
  );
}

const outcomeIcon = (o: string) => (o === "failed" ? <CircleAlert size={13} className="cg-ly-bad" /> : o === "overridden" || o === "overrides" ? <GitMerge size={13} className="cg-ly-info" /> : <Check size={13} className="d-ok" />);
const outcomeLabel: Record<string, string> = { applied: "applied", failed: "failed", moved: "moved", overridden: "set again later", overrides: "overrides" };

function Detail({ layer: l, stack, n, explicit, onToggle, onShow, onCheck, fixesDisabled }: { layer: LayerDef; stack: LayerDef[]; n: number; explicit: boolean; onToggle: () => void; onShow: () => void; onCheck: () => void; fixesDisabled?: boolean }) {
  const isBase = l.kind === "dataset";
  const before = n > 1 ? stack.filter((x) => x.status !== "off")[n - 2] : undefined;
  const house = stack.find((x) => x.key === houseKey);
  const draftOn = stack.some((x) => x.key === draftKey && x.status === "applied");
  return (
    <section className="cg-ib-detail cg-ly-detail" aria-label="Layer detail">
      <p className="cg-ib-kicker">{isBase ? <KindIcon kind="system" size={14} /> : l.kind === "addon" ? <FileCode2 size={14} /> : <Layers size={14} />}{kindLabel(l)}<span className="mono">{l.key}</span></p>
      <h2>{l.title}{l.purpose.includes("test") ? <span className="cg-ly-test lg">Test</span> : null}</h2>
      {l.status === "refused" && l.refused?.code === "requires-conflict" ? (
        <div className="cg-ly-callout err" role="status">
          <CircleAlert size={14} />
          <div>
            <p><strong>Not applied.</strong> Frost Wardens {l.version} {code(l.refused.message)} (<span className="mono">dklpo/requires-conflict</span>). It was turned off with this notice, not removed.</p>
            <p className="d-muted">Not in the build: its module <code>frost-wardens</code> (Ice Guard, frost-seer, Rime Blade) and its patch <code>frost-slots</code>. Short names' 3 keys for it wait. Rosters that use Frost Wardens open with the data-changed review.</p>
            <p className="cg-ib-actions">
              <button type="button" className="d-btn primary"><Code2 size={13} />Open its manifest</button>
              <button type="button" className="d-btn" onClick={onToggle}><CircleSlash size={13} />Turn it off</button>
              <button type="button" className="d-btn" onClick={onCheck}><RefreshCw size={13} />Check again</button>
            </p>
          </div>
        </div>
      ) : null}
      {l.status === "off" ? <p className="cg-ly-callout"><Info size={14} /><span>{l.purpose.includes("test") ? "A test variant is never on by default. Turned on, it is marked Test wherever it shows, and rosters built with it carry the mark." : "Off: not in the build."} <button type="button" className="cg-linkbtn" onClick={onToggle}>Turn it on</button></span></p> : null}
      <dl className="cg-ib-facts">
        <div><dt>Version</dt><dd>{l.version}{isBase ? <span className="d-muted">the base · {l.licence}</span> : null}</dd></div>
        {l.requires ? <div><dt>Requires</dt><dd><span className="mono">demo-skirmish {l.requires.range}</span>{l.requires.ok ? <span className="cg-ly-ok"><Check size={13} />base {BASE_VERSION} is in range</span> : <span className="cg-ly-bad"><X size={13} />base is {BASE_VERSION}</span>}</dd></div> : null}
        <div><dt>Order</dt><dd>{isBase ? "Always first" : l.status === "off" ? "Off" : <>{ordinal(n)}{before ? <span className="d-muted">after {before.title}{explicit ? ", your order" : l.key === draftKey ? ": its patch says after house" : l.kind === "addon" ? ": add-ons by key" : ": requires the base, ties by key"}</span> : null}</>}</dd></div>
        <div><dt>Folder</dt><dd className="mono">{l.folder}</dd></div>
        {l.licence && !isBase ? <div><dt>Licence</dt><dd>{l.licence}</dd></div> : null}
      </dl>

      {l.displayOnly ? (
        <>
          <h3 className="cg-ib-h">Display-only check<span className="d-muted">add-ons may change only text</span></h3>
          {l.displayOnly.ok ? (
            <p className="cg-ly-check ok"><Check size={14} />Passed: lowered with and without {l.title}, the logic hash is the same (<span className="mono">{l.displayOnly.hash}</span>).</p>
          ) : (
            <div className="cg-ly-callout err" role="status">
              <CircleAlert size={14} />
              <div>
                <p><strong>Refused: the add-on changes rules</strong> (<span className="mono">dklpo/addon-changes-rules</span>). Lowered with and without it, the logic hash changes: <span className="mono">{l.displayOnly.hash}</span> → <span className="mono">{l.displayOnly.with}</span>.</p>
                <p className="d-muted">{l.displayOnly.detail}. The base's <code>attack += $rally</code> reads the text key <code>rally</code>, which this pack fills in.</p>
                <div className="cg-ib-code cg-ly-code"><CodeView lines={["## Short names (invented content only)", "warden-squad.short: Squad", "warden-captain.short: Captain", "rally: 1"]} start={1} end={4} marks={[{ id: "rally", line: 4, from: 0, to: 8, kind: "error" }]} selected={[4, 4]} label="short-names/iron-wardens/text/en.dkl" compact /></div>
                <p className="cg-ib-actions">
                  <button type="button" className="d-btn primary" disabled={fixesDisabled} title={fixesDisabled ? DECLARE_LATER : undefined}><Code2 size={13} />Declare it a variant…</button>
                  <button type="button" className="d-btn" disabled={fixesDisabled} title={fixesDisabled ? REMOVE_KEY_LATER : undefined}>Remove <code>rally</code> from the pack</button>
                  <button type="button" className="d-btn"><FolderOpen size={13} />Open en.dkl:4</button>
                </p>
              </div>
            </div>
          )}
        </>
      ) : null}

      {l.patches?.length ? (
        <>
          <h3 className="cg-ib-h">Patch report<span className="d-muted">{l.patches.length} patch</span></h3>
          {l.patches.map((p) => (
            <div key={p.key} className="cg-ly-patch">
              <p className="cg-ly-patch-head"><span className="mono">patch {p.key}</span><span>“{p.title}”</span><ArrowRight size={12} /><span className="mono">{p.target}</span>{p.after ? <span className="d-muted">after {p.after}</span> : null}<span className="d-spacer" /><span className={`cg-ly-pstatus ${p.status}`}>{p.status === "skipped" ? "not applied (off)" : `${p.status} · ${p.ops.length} of ${p.ops.length}`}</span></p>
              {p.ops.map((o) => (
                <div key={o.line} className={`cg-ly-op ${o.outcome}`}>
                  {outcomeIcon(o.outcome)}
                  <span className="cg-ly-optext"><SynText text={o.text} />{o.note ? <span className="cg-ly-opnote">{o.note}</span> : null}</span>
                  <span className="cg-ly-opout">{outcomeLabel[o.outcome]}</span>
                  <span className="mono cg-ly-opline">{p.file.split("/")[0]}:{o.line}</span>
                </div>
              ))}
            </div>
          ))}
        </>
      ) : null}

      {l.key === draftKey && draftOn ? (
        <>
          <h3 className="cg-ib-h">Conflict<span className="d-muted">two patches set one value: the later one wins (info)</span></h3>
          <ValueChain />
        </>
      ) : l.key === houseKey && draftOn && house ? (
        <>
          <h3 className="cg-ib-h">Conflict<span className="d-muted">a later layer sets one of these values again</span></h3>
          <ValueChain />
        </>
      ) : null}

      {l.changes.length ? (
        <>
          <h3 className="cg-ib-h">{l.status === "refused" && l.kind === "variant" ? "What it would change" : "Values it changes"}<span className="d-muted">{l.changes.length}</span></h3>
          <div className="cg-ly-changes">
            {l.changes.map((c) => (
              <div key={`${c.entry}-${c.what}-${c.name}`} className="cg-ly-change">
                <KindIcon kind={c.kind} size={14} />
                <span className="cg-ly-cname">{c.name}</span>
                <span className="cg-ly-what">{c.what.includes("$") ? <code>{c.what}</code> : c.what}</span>
                <span className="cg-ly-val">{c.base !== "–" ? <s>{c.base}</s> : null}<ArrowRight size={11} /><strong className={c.overriddenBy ? "cg-ly-struck" : ""}>{c.value}</strong>{c.overriddenBy ? <span className="d-layer">then {c.overriddenBy}</span> : null}</span>
                {c.entry === "iron-wardens:warden-squad" && l.status !== "refused" ? <button type="button" className="d-btn sm" onClick={onShow} title="Open Warden Squad with the layer changes marked on its page">Show on page</button> : <span />}
              </div>
            ))}
          </div>
        </>
      ) : null}

      {l.text && !isBase ? (
        <>
          <h3 className="cg-ib-h">Text<span className="d-muted">{l.text.keys} keys{l.text.overrides ? ` · ${l.text.overrides} override` : ""}{l.text.unknown ? ` · ${l.text.unknown} unknown` : ""}</span></h3>
          <p className={`cg-ly-check${l.text.unknown ? " warn" : ""}`}>{l.text.unknown ? <DiagIcon kind="preservation" size={13} /> : <Check size={13} className="d-ok" />}{code(l.text.note)}</p>
        </>
      ) : null}
    </section>
  );
}

const ordinal = (n: number) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} of the stack`;

/** One value through the stack: the base value, then each layer that sets it, the last one effective. */
export function ValueChain() {
  return (
    <div className="cg-ly-chain" role="group" aria-label="warden-squad.cost.pts through the stack">
      <p className="mono cg-ly-chain-path">warden-squad.cost.pts</p>
      <ol>
        <li><span className="cg-ly-chain-who">Base</span><s className="num">20</s></li>
        <li><ArrowRight size={12} /><span className="cg-ly-chain-who">House rules</span><s className="num">18</s></li>
        <li className="wins"><ArrowRight size={12} /><span className="cg-ly-chain-who">Draft points</span><strong className="num">16</strong><span className="cg-ly-test">Test</span><span className="cg-ly-wins-tag">wins: later</span></li>
      </ol>
      <p className="cg-ly-chain-note">Draft points' <code>set warden-squad.cost.pts 18 -&gt; 16</code> expects House rules' value, so it holds only after it (<code>after house</code>). Turn Draft points off to get 18 back.</p>
    </div>
  );
}

/* =====================================================================================================================
 * The entry page with the layer overlay
 * ===================================================================================================================== */

/** A value a layer changed: the effective value, the base value struck, the layer as a chip; the row gets an accent edge. */
export function Changed({ base, layer, onOpen, open, children }: { base: string; layer: string; onOpen?: () => void; open?: boolean; children?: ReactNode }) {
  return (
    <span className="cg-lchg">
      <s>{base}</s>
      <button type="button" className={`d-layer cg-lchg-chip${open ? " open" : ""}`} onClick={(e) => { e.stopPropagation(); onOpen?.(); }} aria-expanded={open} title={`Changed by ${layer}: show how`}>
        <Layers size={11} />{layer}
      </button>
      {children}
    </span>
  );
}

/** What changed one value: the layer, the operation and its line, the base value, the layer that would set it next. Floats. */
export function ChangeCard({ onClose, onLayers }: { onClose?: () => void; onLayers?: () => void }) {
  return (
    <div className="cg-ly-card" role="dialog" aria-label="Changed by House rules">
      <p className="cg-hc-head"><Layers size={13} /><strong>Changed by House rules</strong><span className="mono">variant · rules 1.0.0</span></p>
      <p className="cg-ly-card-val"><span className="d-muted">cost pts</span><s className="num">20</s><span className="d-muted">in Base</span><ArrowRight size={11} /><strong className="num">18</strong></p>
      <p className="cg-ly-card-op"><SynText text="set warden-squad.cost.pts 20 -> 18" /><span className="mono">house-rules/house/patch.dkl:6</span></p>
      <p className="cg-ly-card-note">Draft points (off) would set it to 16.</p>
      <p className="cg-hc-actions">
        <button type="button" className="d-btn sm primary"><CornerDownLeft size={12} />Open the patch</button>
        <button type="button" className="d-btn sm" onClick={onLayers}><Layers size={12} />Show in Layers</button>
        <span className="d-spacer" />
        <button type="button" className="d-icon sm" onClick={onClose} aria-label="Close" title="Close (Esc)"><X size={13} /></button>
      </p>
    </div>
  );
}

function OverlayPage({ mode, interactive, cardOpen, onBack }: { mode: Mode; interactive: boolean; cardOpen: boolean; onBack: () => void }) {
  const [on, setOn] = useState(true);
  const [view, setView] = useState<"effective" | "base">("effective");
  const [card, setCard] = useState(cardOpen);
  const [banner, setBanner] = useState(true);
  const claim = useWindowKeys(interactive, (event: KeyboardEvent) => {
    if (event.key === "Escape") setCard(false);
    if (event.metaKey && event.altKey && event.code === "KeyL") { event.preventDefault(); setOn((v) => !v); }
  });
  const eff = on && view === "effective";
  const value = (effective: string, baseValue: string) => (on ? (view === "effective" ? effective : baseValue) : effective);
  return (
    <Win mode={mode} interactive={interactive} onClaim={claim}>
      <EditorGrid side={<Sidebar entry="iron-wardens:warden-squad" source={null} updates={allDiagnostics.length} onLayers={onBack} />}>
        <main className="d-main" aria-label="Entry">
          <header className="d-top">
            <BackForward back="Layers" onBack={onBack} />
            <span className="d-crumbs">Iron Wardens<span>/</span>Warden Squad</span>
            <span className="d-spacer" />
            <span className="d-muted">Edited just now</span>
            <button type="button" className={`d-ghost${on ? " on" : ""}`} aria-pressed={on} onClick={() => setOn(!on)} title="Mark the values that layers change on this page (⌘⌥L)"><Layers size={14} />Layer changes<kbd>⌘⌥L</kbd></button>
            <button type="button" className="d-ghost" title="Focus mode: hide the sidebar (⌘.)"><Focus size={14} />Focus<kbd>⌘.</kbd></button>
            <button type="button" className="d-ghost" title="Show the DKLPO text beside the page (⌘⌥U)"><Code2 size={14} />Source</button>
          </header>
          <div className="d-scroll helper-collapsed">
            <div className="d-doc">
              {on ? (
                <div className="cg-ly-bar" role="group" aria-label="Layer overlay">
                  <Layers size={14} />
                  <span><strong>{view === "effective" ? "Effective values" : "Base values"}</strong> · Base + House rules + Frost Wardens + Short names</span>
                  <span className="d-spacer" />
                  <span className="cg-seg" role="radiogroup" aria-label="Values">
                    <button type="button" role="radio" aria-checked={view === "effective"} className={view === "effective" ? "active" : ""} onClick={() => setView("effective")}>Effective</button>
                    <button type="button" role="radio" aria-checked={view === "base"} className={view === "base" ? "active" : ""} onClick={() => setView("base")}>Base only</button>
                  </span>
                </div>
              ) : null}
              {on && banner ? <p className="cg-ly-barnote">4 values on this page come from layers: 3 from House rules, 1 from Short names. <button type="button" className="cg-linkbtn" onClick={onBack}>Open Layers</button><button type="button" className="d-icon sm" aria-label="Hide this note" title="Hide this note" onClick={() => setBanner(false)}><X size={12} /></button></p> : null}
              <article className="d-page">
                <div className="d-pageicon"><KindIcon kind="unit" size={28} /></div>
                <h1>Warden Squad</h1>
                <p className="d-backlinks"><ArrowDownLeft size={14} /><span className="d-muted">3 backlinks</span><M>Iron Wardens</M><M to="iron-wardens:warden-captain">Warden Captain</M><M>House rules · patch</M></p>
                <dl className="d-props">
                  <div><dt><KindIcon kind="unit" size={14} />Kind</dt><dd>Unit<span className="d-muted"><span className="mono">iron-wardens:warden-squad</span></span></dd></div>
                  <div><dt><ChevronDown size={14} />Categories</dt><dd><span className="d-tag t1">infantry</span><span className="d-tag t2">line</span><span className="d-muted">root, as line*</span></dd></div>
                  <div className={on ? "cg-lchg-row" : undefined}><dt><span className="d-hash">#</span>Cost</dt><dd className="cg-lchg-dd">
                    <strong className="num">{value("18", "20")} pts</strong>
                    {on ? (eff ? <Changed base="20" layer="House rules" open={card} onOpen={() => setCard(!card)}>{card ? <ChangeCard onClose={() => setCard(false)} onLayers={onBack} /> : null}</Changed> : <span className="cg-lchg-would"><Layers size={11} />House rules sets 18</span>) : <span className="d-muted">20 in Base · lowered by House rules</span>}
                  </dd></div>
                  <div className={on ? "cg-lchg-row" : undefined}><dt><Hash size={14} />Short name</dt><dd>{value("Squad", "absent")}{on && eff ? <span className="cg-lchg"><span className="d-layer cg-lchg-chip"><FileCode2 size={11} />Short names</span><span className="d-muted">add-on · text</span></span> : null}</dd></div>
                  <div><dt><KindIcon kind="rule" size={14} />Rules</dt><dd><M to="demo-skirmish:shield-wall">Shield Wall</M>{on ? <span className="cg-lchg-would"><Layers size={11} />text changed by House rules</span> : null}</dd></div>
                  <div><dt><Layers size={14} />Layer</dt><dd>Base<span className="d-muted">changed by 2 layers</span></dd></div>
                </dl>
                <div className="d-blocks">
                  <div className="d-block i0 flagged"><span className="d-tog-space" /><span className="d-kw">source key</span><span className="mono">x-bs.exampleReviewState: draft</span></div>
                  <h2 className="d-h">Models</h2>
                  <div className="d-block i0"><span className="d-tog"><ChevronDown size={14} /></span><span className="d-kw">model</span><strong>Warden</strong><span className="d-muted">5 to 10 models</span></div>
                  <div className="d-block i1"><span className="d-tog-space" /><span className="d-kw">cost</span><span className="num">8 pts</span></div>
                  <div className="d-block i1 d-tableblock"><span className="d-tog-space" /><table><thead><tr>{["Profile", "Type", "Move", "Attack", "Wounds"].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody><tr><td>Warden</td><td><M to="demo-skirmish:fighter">fighter</M></td><td className="num">5"</td><td className="num">3</td><td className="num">1</td></tr></tbody></table></div>
                  <div className="d-block i1"><span className="d-tog"><ChevronDown size={14} /></span><span className="d-kw">upgrade</span><strong>Banner</strong><span className="d-muted">up to 1 · hidden when no Warden Captain in force</span></div>
                  <div className={`d-block i2${on ? " cg-lchg-row" : ""}`}><span className="d-tog-space" /><span className="d-kw">cost</span><span className="num">{value("5", "10")} pts</span>{on ? (eff ? <Changed base="10" layer="House rules" /> : <span className="cg-lchg-would"><Layers size={11} />House rules sets 5</span>) : null}</div>
                  <div className="d-block i1"><span className="d-tog"><ChevronDown size={14} /></span><span className="d-kw">group</span><strong>Weapon</strong><span className="d-muted">choose 1, default</span><M to="iron-wardens:spear">Spear</M></div>
                  <div className="d-block i2"><span className="d-tog-space" /><span className="d-kw">use</span><M to="iron-wardens:spear">Spear</M><span className="d-muted">0 pts</span></div>
                  <div className="d-block i2"><span className="d-tog-space" /><span className="d-kw">use</span><M to="iron-wardens:halberd">Halberd</M><span className="d-muted">2 pts</span></div>
                  <div className="d-block i0 typing"><span className="d-tog-space" /><span className="d-slashbtn"><span className="d-slash">/</span><span className="d-placeholder">Type / to insert a statement</span></span></div>
                </div>
              </article>
            </div>
          </div>
          <Pill issues={allDiagnostics.filter((d) => d.where.startsWith("iron-wardens:warden-squad"))} />
        </main>
      </EditorGrid>
    </Win>
  );
}
