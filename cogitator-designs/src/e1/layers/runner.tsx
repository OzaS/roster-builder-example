import {
  AlertTriangle, Check, ChevronDown, ChevronRight, CircleAlert, Copy, CornerDownLeft, ExternalLink, FileText, Flag, FlaskConical, FolderOpen, Layers, Minus, MoveRight,
  Pause, PictureInPicture2, Play, Plus, RefreshCw, RotateCcw, Save, Search, Trash2, X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { DiagIcon, KindIcon } from "../../glyphs";
import { SynText } from "../editor/code";
import { runCatalogue, runCategories, startRoster, type RunOption, type RunSel, type RunUnit } from "./data";

/**
 * The dataset runner: a basic roster builder over the dataset being edited, rebuilt on every save (or while typing)
 * and swapped in keeping the roster (reopened through the roster-open rules). A developer tool: plain lists and tables,
 * no export sheets, stars, grouped units or appearance. Drawn docked (a right-hand pane), detached (its own window) and
 * full (the 960 px window). Every value from the tokens; the new classes are `cg-rn-*` in `layers.css`.
 */

export type RunnerState = "empty" | "progress" | "reloaded" | "error" | "review" | "save-test" | "detached" | "narrow";
export type RunnerVariant = "docked" | "detached" | "full";
type Live = "live" | "paused" | "error" | "building";

/** Build 1 is the dataset before the save; build 2 after it: two costs changed, Halberd's key renamed, Banner moved (structural). */
function catalogueFor(build: 1 | 2): RunUnit[] {
  if (build === 1) return runCatalogue;
  return runCatalogue.map((u) => {
    if (u.id === "iron-wardens:warden-captain") return { ...u, cost: 48 };
    if (u.id === "iron-wardens:warden-archers") return { ...u, options: u.options.map((o) => ({ ...o, cost: 14, note: "9 pts and a Longbow, 5 pts" })) };
    if (u.id === "iron-wardens:warden-squad") return { ...u, options: [...u.options.filter((o) => o.id !== "banner"), { id: "command-banner", name: "Command › Banner", kind: "toggle" as const, min: 0, max: 1, cost: 10, note: "moved here in 3.2.1" }] };
    return u;
  });
}

const reloadedRoster = (): RunSel[] => startRoster().map((s) => {
  if (s.uid === "s1") return { ...s, mark: { kind: "changed", text: "cost 45 → 48 · Halberd matched by name", option: "weapon" } };
  if (s.uid === "s2") return { ...s, values: { ...s.values, banner: 0 }, mark: { kind: "kept", text: "Banner kept for review" } };
  if (s.uid === "s4") return { ...s, mark: { kind: "changed", text: "Longbow 4 → 5 pts" } };
  return s;
});

const optionCost = (o: RunOption, v: number | string | undefined, models: number) => {
  if (o.kind === "count") return (typeof v === "number" ? v : 0) * o.cost;
  if (o.kind === "toggle") return (v === 1 ? o.cost : 0);
  const choice = o.choices?.find((c) => c.id === v);
  return (choice?.cost ?? 0) * (o.per === "model" ? models : 1);
};
const modelsOf = (u: RunUnit, sel: RunSel) => { const c = u.options.find((o) => o.kind === "count"); return c ? Number(sel.values[c.id] ?? c.min) : 1; };
const costOf = (u: RunUnit, sel: RunSel) => u.cost + u.options.reduce((sum, o) => sum + optionCost(o, sel.values[o.id], modelsOf(u, sel)), 0);
const summaryOf = (u: RunUnit, sel: RunSel) => u.options.map((o) => {
  const v = sel.values[o.id];
  if (o.kind === "count") return o.max > 1 ? `${v} ${o.name}${v === 1 ? "" : "s"}` : "";
  if (o.kind === "toggle") return v === 1 ? o.name.split(" › ").pop() : "";
  return o.choices?.find((c) => c.id === v)?.name ?? "";
}).filter(Boolean).join(" · ");

type Issue = { uid?: string; text: string; kind: "error" | "preservation" };
function validate(cat: RunUnit[], roster: RunSel[]): Issue[] {
  const issues: Issue[] = [];
  const label = (s: RunSel) => { const u = cat.find((x) => x.id === s.unit); const same = roster.filter((r) => r.unit === s.unit); return same.length > 1 ? `${u?.name} (${same.indexOf(s) + 1})` : u?.name ?? s.unit; };
  for (const s of roster) {
    const u = cat.find((x) => x.id === s.unit);
    if (!u) continue;
    for (const o of u.options) if (o.kind === "count" && Number(s.values[o.id]) < o.min) issues.push({ uid: s.uid, kind: "error", text: `${label(s)} › ${o.name}: ${s.values[o.id]} models, needs ${o.min} to ${o.max}` });
  }
  for (const c of runCategories) {
    const n = roster.filter((s) => cat.find((u) => u.id === s.unit)?.category === c.name).length;
    if (n < c.min) issues.push({ kind: "error", text: `Warband: ${c.name} ${n} of ${c.slot}: add ${c.min - n} more` });
    if (n > c.max) issues.push({ kind: "error", text: `Warband: ${c.name} ${n} of ${c.slot}: ${n - c.max} too many` });
  }
  return issues;
}

const BUILD_1 = { at: "12:04:31", ms: 180 };
const BUILD_2 = { at: "12:06:02", ms: 164 };

export function RunnerPane({ state, variant, interactive, onOpenEntry, reveal, onDock, onDetach, onClose, onGoToError }: {
  state: RunnerState; variant: RunnerVariant; interactive: boolean; onOpenEntry?: (id: string) => void; reveal?: { id: string; n: number };
  onDock?: () => void; onDetach?: () => void; onClose?: () => void; onGoToError?: () => void;
}) {
  const reloadedStart = state === "reloaded" || state === "review";
  const [build, setBuild] = useState<1 | 2>(reloadedStart ? 2 : 1);
  const [buildAt, setBuildAt] = useState(reloadedStart ? BUILD_2 : BUILD_1);
  const [live, setLive] = useState<Live>(state === "error" ? "error" : "live");
  const [roster, setRoster] = useState<RunSel[]>(state === "empty" ? [] : reloadedStart ? reloadedRoster() : startRoster());
  const [started, setStarted] = useState(state !== "empty");
  const [sel, setSel] = useState<string>(state === "review" ? "s2:kept" : state === "reloaded" ? "s1" : "s2");
  const [summary, setSummary] = useState<ReactNode | null>(reloadedStart ? "reload" : null);
  const [kept, setKept] = useState<ReadonlySet<string>>(new Set(reloadedStart ? ["s2"] : []));
  const [menu, setMenu] = useState<"live" | "runs" | "roster" | null>(state === "detached" ? "live" : null);
  const [mode, setMode] = useState<"save" | "typing">(state === "error" ? "typing" : "save");
  const [withLayers, setWithLayers] = useState(true);
  const [draft, setDraft] = useState(false);
  const [limit, setLimit] = useState(500);
  const [saveTest, setSaveTest] = useState(state === "save-test");
  const [savedTest, setSavedTest] = useState<string | null>(null);
  const [addFilter, setAddFilter] = useState("");
  const [folded, setFolded] = useState<ReadonlySet<string>>(new Set());
  const [waiting, setWaiting] = useState(0);

  useEffect(() => {
    if (!reveal) return;
    const hit = roster.find((s) => s.unit === reveal.id);
    if (hit) setSel(hit.uid);
  }, [reveal]); // eslint-disable-line react-hooks/exhaustive-deps

  const cat = catalogueFor(build);
  const issues = validate(cat, roster);
  const total = roster.reduce((sum, s) => { const u = cat.find((x) => x.id === s.unit); return sum + (u ? costOf(u, s) : 0); }, 0);
  const layersLabel = withLayers ? `Dataset + ${draft ? 4 : 3} layers` : "Dataset alone";

  const reloadNow = (changes = false) => {
    if (live === "building") return;
    const prev = live;
    setLive("building");
    window.setTimeout(() => {
      setLive(prev === "error" ? "error" : prev === "paused" ? "paused" : "live");
      if (changes && build === 1) {
        setBuild(2); setBuildAt(BUILD_2); setRoster((cur) => cur.map((s) => reloadedRoster().find((r) => r.uid === s.uid && s.unit === r.unit) ?? s)); setKept(new Set(["s2"])); setSummary("reload");
      } else {
        setBuildAt({ at: build === 1 ? "12:06:15" : "12:06:20", ms: 171 }); setSummary("same"); setWaiting(0);
      }
    }, 650);
  };

  const add = (unit: RunUnit) => {
    const values: Record<string, number | string> = {};
    for (const o of unit.options) values[o.id] = o.kind === "count" ? o.min : o.kind === "toggle" ? 0 : o.def ?? o.choices?.[0]?.id ?? "";
    const uid = `n${Date.now() % 100000}`;
    setRoster((cur) => [...cur, { uid, unit: unit.id, values }]);
    setSel(uid);
  };
  const setValue = (uid: string, id: string, v: number | string) => setRoster((cur) => cur.map((s) => (s.uid === uid ? { ...s, values: { ...s.values, [id]: v } } : s)));
  const remove = (uid: string) => { setRoster((cur) => cur.filter((s) => s.uid !== uid)); setSel(""); };
  const resolveKept = (uid: string, addAgain: boolean) => {
    setKept((cur) => { const next = new Set(cur); next.delete(uid); return next; });
    setRoster((cur) => cur.map((s) => (s.uid === uid ? { ...s, values: addAgain ? { ...s.values, "command-banner": 1 } : s.values, mark: undefined } : s)));
    setSel(uid);
  };
  const reset = () => { setRoster([]); setStarted(false); setSummary(null); setKept(new Set()); setMenu(null); };

  const labelOf = (s: RunSel) => { const u = cat.find((x) => x.id === s.unit); const same = roster.filter((r) => r.unit === s.unit); return same.length > 1 ? `${u?.name} (${same.indexOf(s) + 1})` : u?.name ?? s.unit; };
  const selected = roster.find((s) => s.uid === sel.replace(":kept", ""));
  const selectedUnit = selected ? cat.find((u) => u.id === selected.unit) : undefined;

  /* ---------- Header: what runs, its live state, reload and window controls ---------- */
  const status = live === "building" ? <><RefreshCw size={13} className="cg-spin" />Building…</>
    : live === "error" ? <><span className="cg-rn-dot err" />Last good build {buildAt.at}<span className="cg-rn-sub">new build failed</span></>
    : live === "paused" ? <><span className="cg-rn-dot warn" />Paused · built {buildAt.at}<span className="cg-rn-sub">{waiting ? `${waiting} save${waiting === 1 ? "" : "s"} waiting` : "no saves since"}</span></>
    : <><span className="cg-rn-dot" />Live · built {buildAt.at} · {buildAt.ms} ms</>;

  const head = (
    <header className="cg-rn-head">
      <Play size={14} className="cg-rn-mark" />
      <strong>Runner</strong>
      {draft ? <span className="cg-ly-test">Test</span> : null}
      <span className="cg-rn-statuswrap">
        <button type="button" className={`cg-rn-status ${live}`} aria-haspopup="menu" aria-expanded={menu === "live"} onClick={() => setMenu(menu === "live" ? null : "live")} title="Live reload: when to rebuild, pause, reload now">{status}<ChevronDown size={12} /></button>
        {menu === "live" ? (
          <div className="cg-menu cg-rn-menu" role="menu" aria-label="Live reload">
            <p className="cg-menu-label">Reload</p>
            <button type="button" role="menuitemradio" aria-checked={mode === "save"} className={`cg-menu-item two${mode === "save" ? " sel" : ""}`} onClick={() => { setMode("save"); setMenu(null); }}><span className="cg-rn-radio" data-on={mode === "save"} /><span><span>On save</span><small>Every save of a dataset file (default)</small></span></button>
            <button type="button" role="menuitemradio" aria-checked={mode === "typing"} className={`cg-menu-item two${mode === "typing" ? " sel" : ""}`} onClick={() => { setMode("typing"); setMenu(null); }}><span className="cg-rn-radio" data-on={mode === "typing"} /><span><span>While typing</span><small>After a 400 ms pause, unsaved text included</small></span></button>
            <div className="cg-menu-sep" />
            <button type="button" role="menuitem" className="cg-menu-item" onClick={() => { setLive(live === "paused" ? "live" : "paused"); setWaiting(live === "paused" ? 0 : 1); setMenu(null); }}>{live === "paused" ? <Play size={14} /> : <Pause size={14} />}{live === "paused" ? "Resume live reload" : "Pause live reload"}<span className="cg-menu-key">⌥⌘P</span></button>
            <button type="button" role="menuitem" className="cg-menu-item" onClick={() => { setMenu(null); reloadNow(build === 1); }}><RefreshCw size={14} />Reload now<span className="cg-menu-key">⇧⌘R</span></button>
            <button type="button" role="menuitem" className="cg-menu-item"><FileText size={14} />Show the build log</button>
          </div>
        ) : null}
      </span>
      <span className="d-spacer" />
      <button type="button" className="d-ghost sm" onClick={() => { setLive(live === "paused" ? "live" : "paused"); setWaiting(live === "paused" ? 0 : 1); }} disabled={live === "error" || live === "building"} title={live === "paused" ? "Resume live reload (⌥⌘P)" : "Pause live reload: saves no longer rebuild (⌥⌘P)"}>{live === "paused" ? <Play size={13} /> : <Pause size={13} />}{live === "paused" ? "Resume" : "Pause"}</button>
      <button type="button" className="d-ghost sm" onClick={() => reloadNow(build === 1)} disabled={live === "building"} title="Rebuild the dataset now and reopen the roster on it (⇧⌘R)"><RefreshCw size={13} />Reload<kbd>⇧⌘R</kbd></button>
      {variant === "docked" ? <button type="button" className="d-icon sm" onClick={onDetach} aria-label="Open the runner in its own window" title="Open the runner in its own window"><ExternalLink size={14} /></button> : null}
      {variant === "detached" ? <button type="button" className="d-ghost sm" onClick={onDock} title="Dock the runner beside the editor again (⌘R)"><PictureInPicture2 size={13} />Dock</button> : null}
      {variant === "docked" ? <button type="button" className="d-icon sm" onClick={onClose} aria-label="Close the runner" title="Close the runner (⌘R); the roster is kept"><X size={15} /></button> : null}
    </header>
  );

  /* ---------- Config: which configuration runs (like augur dklpo test --with), the force and its limit, the total ---------- */
  const config = (
    <div className="cg-rn-config" role="toolbar" aria-label="What runs">
      <span className="cg-rn-k">Runs</span>
      <span className="cg-chipwrap">
        <button type="button" className="cg-rn-pick" aria-haspopup="menu" aria-expanded={menu === "runs"} onClick={() => setMenu(menu === "runs" ? null : "runs")} title="Which configuration runs: the dataset alone or with its layers, the variants, the locale"><Layers size={13} />{layersLabel}<span className="d-muted">· en</span><ChevronDown size={12} /></button>
        {menu === "runs" ? (
          <div className="cg-menu wide cg-rn-menu left" role="menu" aria-label="Configuration">
            <p className="cg-menu-label section">Configuration<span className="mono"> like dklpo test --with</span></p>
            <button type="button" role="menuitemradio" aria-checked={!withLayers} className={`cg-menu-item two${!withLayers ? " sel" : ""}`} onClick={() => { setWithLayers(false); setDraft(false); }}><span className="cg-rn-radio" data-on={!withLayers} /><span><span>Dataset alone</span><small>Demo Skirmish 3.2.0</small></span></button>
            <button type="button" role="menuitemradio" aria-checked={withLayers} className={`cg-menu-item two${withLayers ? " sel" : ""}`} onClick={() => setWithLayers(true)}><span className="cg-rn-radio" data-on={withLayers} /><span><span>Dataset + its layers</span><small>The stack as in Layers, in its order</small></span></button>
            <p className="cg-menu-label section">Layers</p>
            {[{ t: "House rules", k: "variant · rules", on: true }, { t: "Frost Wardens", k: "variant · content", on: true }, { t: "Short names", k: "add-on · text", on: true }].map((l) => (
              <button key={l.t} type="button" role="menuitemcheckbox" aria-checked={withLayers && l.on} disabled={!withLayers} className="cg-menu-item"><span className="cg-check" aria-hidden aria-checked={withLayers}><i>{withLayers ? <Check size={10} strokeWidth={3} /> : null}</i></span>{l.t}<span className="cg-menu-key">{l.k}</span></button>
            ))}
            <button type="button" role="menuitemcheckbox" aria-checked={draft} disabled={!withLayers} className="cg-menu-item" onClick={() => setDraft(!draft)}><span className="cg-check" aria-hidden aria-checked={draft}><i>{draft ? <Check size={10} strokeWidth={3} /> : null}</i></span>Draft points<span className="cg-ly-test">Test</span><span className="cg-menu-key">variant · test</span></button>
            <p className="cg-menu-label section">Locale</p>
            <button type="button" role="menuitemradio" aria-checked className="cg-menu-item sel"><span className="cg-rn-radio" data-on />en<span className="cg-menu-key">base</span></button>
            <button type="button" role="menuitemradio" aria-checked={false} className="cg-menu-item" disabled title="No de text pack is installed"><span className="cg-rn-radio" />de<span className="cg-menu-key">no text installed</span></button>
          </div>
        ) : null}
      </span>
      <span className="cg-rn-sep" aria-hidden />
      <span className="cg-rn-k">Force</span>
      <button type="button" className="cg-rn-pick" disabled={!started} title={started ? "Warband from Iron Wardens: changing it starts a new roster" : "Pick a force below"}><Flag size={13} />{started ? "Warband · Iron Wardens" : "None yet"}</button>
      <label className="cg-rn-limit"><span className="cg-rn-k">Limit</span><input value={limit} onChange={(e) => setLimit(Number(e.target.value.replace(/\D/g, "")) || 0)} inputMode="numeric" aria-label="Points limit" /><span className="d-muted">pts</span></label>
      <span className="d-spacer" />
      {started ? <span className={`cg-rn-total${total > limit ? " over" : ""}`} title={total > limit ? "Over the limit (a soft limit: the roster can still be saved)" : undefined}><strong className="num">{total}</strong><span className="d-muted">/ {limit} pts</span><i aria-hidden><b style={{ width: `${Math.min(100, (total / Math.max(limit, 1)) * 100)}%` }} /></i></span> : null}
    </div>
  );

  /* ---------- Banner: after a reload, a failed build, a pause ---------- */
  let banner: ReactNode = null;
  if (live === "error") {
    banner = (
      <div className="cg-ly-callout err cg-rn-banner" role="alert">
        <CircleAlert size={14} />
        <span><strong>New build failed:</strong> <span className="mono">iron-wardens/module.dkl:20</span> doesn't parse (<span className="mono">dklpo/indent</span>). Still running the last good build from {buildAt.at}; the roster is unchanged.</span>
        <span className="cg-rn-banner-actions"><button type="button" className="d-btn sm primary" onClick={onGoToError}><CornerDownLeft size={12} />Go to the error<kbd>F8</kbd></button><button type="button" className="d-btn sm"><FileText size={12} />Build log</button></span>
      </div>
    );
  } else if (summary === "reload") {
    banner = (
      <div className="cg-ly-callout accent cg-rn-banner" role="status">
        <RefreshCw size={14} />
        <span><strong>Reloaded {BUILD_2.at}:</strong> 2 entries changed · roster kept · 1 matched by name · {kept.size ? `${kept.size} kept for review` : "review done"}</span>
        <span className="cg-rn-banner-actions">{kept.size ? <button type="button" className="d-btn sm" onClick={() => setSel("s2:kept")}>Review<span className="cg-rn-count">{kept.size}</span></button> : null}<button type="button" className="d-icon sm" aria-label="Hide this summary" title="Hide this summary" onClick={() => setSummary(null)}><X size={13} /></button></span>
      </div>
    );
  } else if (summary === "same") {
    banner = <div className="cg-ly-callout cg-rn-banner" role="status"><Check size={14} /><span>Reloaded {buildAt.at}: nothing in this roster changed · roster kept</span><span className="cg-rn-banner-actions"><button type="button" className="d-icon sm" aria-label="Hide" onClick={() => setSummary(null)}><X size={13} /></button></span></div>;
  } else if (live === "paused") {
    banner = <div className="cg-ly-callout warn cg-rn-banner" role="status"><Pause size={14} /><span>Live reload is paused: saves don't rebuild until you resume.</span><span className="cg-rn-banner-actions"><button type="button" className="d-btn sm" onClick={() => { setLive("live"); setWaiting(0); }}><Play size={12} />Resume</button><button type="button" className="d-btn sm" onClick={() => reloadNow(build === 1)}><RefreshCw size={12} />Reload now</button></span></div>;
  }

  /* ---------- Body ---------- */
  const body = !started ? <StartForm onStart={() => { setStarted(true); }} /> : (
    <div className="cg-rn-body">
      <section className="cg-rn-add" aria-label="Add to Warband">
        <p className="cg-rn-h">Add<span className="d-muted">to Warband</span></p>
        <label className="d-filter cg-rn-filter"><Search size={13} /><input value={addFilter} onChange={(e) => setAddFilter(e.target.value)} placeholder="Filter entries" aria-label="Filter entries to add" /></label>
        <div className="cg-rn-addlist">
          {runCategories.map((c) => {
            const units = cat.filter((u) => u.category === c.name && u.name.toLowerCase().includes(addFilter.toLowerCase()));
            const n = roster.filter((s) => cat.find((u) => u.id === s.unit)?.category === c.name).length;
            if (!units.length) return null;
            return (
              <div key={c.name} role="group" aria-label={c.name}>
                <p className="cg-rn-cat">{c.name}{c.slot ? <span className={n > c.max || n < c.min ? "cg-ly-bad" : ""}>{n} of {c.slot}</span> : null}</p>
                {units.map((u) => (
                  <button key={u.id} type="button" className="cg-rn-addrow" onClick={() => add(u)} title={`Add ${u.name} (${u.cost} pts)${n >= c.max ? `: ${c.name} is full (${c.slot}), adding goes over` : ""}`}>
                    <KindIcon kind="unit" size={14} /><span className="cg-rn-name">{u.name}</span><span className="num cg-rn-cost">{u.cost}</span><Plus size={13} className="cg-rn-plus" />
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </section>
      <section className="cg-rn-main" aria-label="Roster">
        <div className="cg-rn-tree" role="tree" aria-label="Roster tree">
          <div className="cg-rn-node force" role="treeitem" aria-expanded aria-selected={false}>
            <ChevronDown size={13} /><Flag size={14} /><span className="cg-rn-name"><strong>Warband</strong><span className="mono">iron-wardens</span></span><span className="num cg-rn-cost">{total}</span><span />
          </div>
          {runCategories.map((c) => {
            const list = roster.filter((s) => cat.find((u) => u.id === s.unit)?.category === c.name);
            if (!list.length && !c.min) return null;
            const isFolded = folded.has(c.name);
            return (
              <div key={c.name} role="group" aria-label={c.name}>
                <button type="button" className="cg-rn-node cat" aria-expanded={!isFolded} onClick={() => setFolded((cur) => { const next = new Set(cur); if (next.has(c.name)) next.delete(c.name); else next.add(c.name); return next; })}>
                  {isFolded ? <ChevronRight size={13} /> : <ChevronDown size={13} />}<span className="cg-rn-name">{c.name}</span><span className={`cg-rn-slot${list.length > c.max || list.length < c.min ? " bad" : ""}`}>{c.slot ? `${list.length} of ${c.slot}` : list.length}</span><span />
                </button>
                {isFolded ? null : list.length ? list.map((s) => {
                  const u = cat.find((x) => x.id === s.unit);
                  if (!u) return null;
                  const err = issues.some((i) => i.uid === s.uid);
                  const edge = err ? " edge-error" : s.mark?.kind === "changed" ? " edge-changed" : s.mark?.kind === "kept" && kept.has(s.uid) ? " edge-preservation" : "";
                  return (
                    <div key={s.uid}>
                      <button type="button" role="treeitem" aria-selected={sel === s.uid} className={`cg-rn-node sel${sel === s.uid ? " selected" : ""}${edge}`} onClick={() => setSel(s.uid)} onDoubleClick={() => onOpenEntry?.(u.id)}>
                        <span className="cg-rn-tog" /><KindIcon kind="unit" size={14} />
                        <span className="cg-rn-name"><span className="cg-rn-nm">{labelOf(s)}</span><span className="cg-rn-sum">{summaryOf(u, s)}</span>{s.mark && (s.mark.kind !== "kept" || kept.has(s.uid)) ? <span className={`cg-rn-markchip ${s.mark.kind}`}>{s.mark.text}</span> : null}</span>
                        <span className="num cg-rn-cost">{costOf(u, s)}</span>
                        <span className="cg-rn-diag">{err ? <DiagIcon kind="error" size={13} /> : null}</span>
                      </button>
                      {kept.has(s.uid) ? (
                        <button type="button" role="treeitem" aria-selected={sel === `${s.uid}:kept`} className={`cg-rn-node kept${sel === `${s.uid}:kept` ? " selected" : ""} edge-preservation`} onClick={() => setSel(`${s.uid}:kept`)}>
                          <span className="cg-rn-tog" /><span className="cg-rn-tog" /><KindIcon kind="upgrade" size={14} />
                          <span className="cg-rn-name"><span className="cg-rn-nm">Banner</span><span className="cg-rn-markchip kept">kept for review · moved</span></span>
                          <span className="num cg-rn-cost">–</span><span className="cg-rn-diag"><AlertTriangle size={13} className="cg-rn-warn" /></span>
                        </button>
                      ) : null}
                    </div>
                  );
                }) : <p className="cg-rn-none">None yet: add one from the list</p>}
              </div>
            );
          })}
        </div>
        <div className="cg-rn-detail" aria-label="Selected">
          {sel.endsWith(":kept") && selected ? (
            <KeptReview onAddAgain={() => resolveKept(selected.uid, true)} onRemove={() => resolveKept(selected.uid, false)} />
          ) : selected && selectedUnit ? (
            <SelDetail unit={selectedUnit} sel={selected} label={labelOf(selected)} captain={roster.some((s) => s.unit === "iron-wardens:warden-captain")} issues={issues.filter((i) => i.uid === selected.uid)}
              onValue={(id, v) => setValue(selected.uid, id, v)} onOpen={() => onOpenEntry?.(selectedUnit.id)} onRemove={() => remove(selected.uid)} onDuplicate={() => add(selectedUnit)} />
          ) : <p className="cg-rn-empty">Select a roster item to see its options, profile and rules.</p>}
        </div>
      </section>
    </div>
  );

  const foot = started ? (
    <footer className="cg-rn-foot">
      <div className="cg-rn-issues" role="list" aria-label="Validation">
        {issues.length ? issues.map((i, n) => (
          <button key={n} type="button" role="listitem" className="cg-rn-issue" onClick={() => i.uid && setSel(i.uid)} title={i.uid ? "Select the roster item" : undefined}><DiagIcon kind={i.kind} size={13} /><span>{i.text}</span>{i.uid ? <span className="cg-rn-go">Select</span> : null}</button>
        )) : <p className="cg-rn-ok"><Check size={13} />No errors from the engine{kept.size ? ` · ${kept.size} kept for review` : ""}</p>}
      </div>
      <span className="cg-rn-footactions">
        <span className="cg-chipwrap">
          <button type="button" className="d-ghost sm" aria-haspopup="menu" aria-expanded={menu === "roster"} onClick={() => setMenu(menu === "roster" ? null : "roster")}>Roster<ChevronDown size={12} /></button>
          {menu === "roster" ? (
            <div className="cg-menu cg-rn-menu up" role="menu" aria-label="Roster">
              <button type="button" role="menuitem" className="cg-menu-item" onClick={() => { reset(); }}><Plus size={14} />New roster</button>
              <button type="button" role="menuitem" className="cg-menu-item"><FolderOpen size={14} />Open saved roster…<span className="cg-menu-key">⌥⌘O</span></button>
              <button type="button" role="menuitem" className="cg-menu-item"><Save size={14} />Save roster as…</button>
              <button type="button" role="menuitem" className="cg-menu-item" onClick={() => { setMenu(null); setSaveTest(true); }}><FlaskConical size={14} />Save as test scenario…</button>
              <div className="cg-menu-sep" />
              <button type="button" role="menuitem" className="cg-menu-item danger" onClick={reset}><RotateCcw size={14} />Reset roster</button>
            </div>
          ) : null}
        </span>
        <button type="button" className="d-btn sm" onClick={() => setSaveTest(true)} title="Write this roster with its expected results as test/*.yaml for augur dklpo test"><FlaskConical size={12} />Save as test…</button>
      </span>
    </footer>
  ) : null;

  return (
    <div className={`cg-rn ${variant}`} aria-label="Dataset runner">
      {head}
      {config}
      {banner}
      {savedTest ? <div className="cg-ly-callout accent cg-rn-banner" role="status"><Check size={14} /><span>Saved <span className="mono">{savedTest}</span> · <code>augur dklpo test</code> runs it in each configuration</span><span className="cg-rn-banner-actions"><button type="button" className="d-icon sm" aria-label="Hide" onClick={() => setSavedTest(null)}><X size={13} /></button></span></div> : null}
      {body}
      {foot}
      {saveTest ? <SaveTest total={total} errors={issues.length} onCancel={() => setSaveTest(false)} onSave={(file) => { setSaveTest(false); setSavedTest(file); }} /> : null}
    </div>
  );
}

/* ---------- The selected item: options, profile, rules, cost ---------- */
function SelDetail({ unit, sel, label, captain, issues, onValue, onOpen, onRemove, onDuplicate }: {
  unit: RunUnit; sel: RunSel; label: string; captain: boolean; issues: Issue[]; onValue: (id: string, v: number | string) => void; onOpen: () => void; onRemove: () => void; onDuplicate: () => void;
}) {
  const models = modelsOf(unit, sel);
  return (
    <div className="cg-rn-sel">
      <p className="cg-rn-selhead">
        <KindIcon kind="unit" size={16} /><strong>{label}</strong><span className="num cg-rn-selcost">{costOf(unit, sel)} pts</span>
        <span className="d-spacer" />
        <button type="button" className="d-ghost sm" onClick={onOpen} title={`Open ${unit.name}'s entry page in the editor (F12)`}><CornerDownLeft size={13} />Go to entry<kbd>F12</kbd></button>
        <button type="button" className="d-icon sm" onClick={onDuplicate} aria-label={`Add another ${unit.name}`} title="Add another"><Copy size={13} /></button>
        <button type="button" className="d-icon sm" onClick={onRemove} aria-label={`Remove ${label}`} title="Remove from the roster (⌫)"><Trash2 size={13} /></button>
      </p>
      {sel.mark && sel.mark.kind !== "kept" ? <p className={`cg-rn-selmark ${sel.mark.kind}`}><RefreshCw size={12} />{sel.mark.text}<span className="d-muted">· last reload</span></p> : null}
      <p className="cg-rn-h2">Options</p>
      <div className="cg-rn-opts" role="table" aria-label="Options">
        {unit.options.map((o) => {
          const v = sel.values[o.id];
          const bad = o.kind === "count" && Number(v) < o.min;
          const hidden = o.id === "banner" && !captain;
          return (
            <div key={o.id} role="row" className={`cg-rn-opt${bad ? " bad" : ""}${sel.mark?.option === o.id ? " marked" : ""}`}>
              <span role="cell" className="cg-rn-oname">{o.name}{o.note ? <small>{o.note}</small> : null}</span>
              <span role="cell" className="cg-rn-octl">
                {o.kind === "count" ? (
                  o.max === 1 ? <span className="d-muted">1, fixed</span> : (
                    <span className="cg-rn-step">
                      <button type="button" aria-label={`Fewer ${o.name}s`} disabled={Number(v) <= 0} onClick={() => onValue(o.id, Math.max(0, Number(v) - 1))}><Minus size={12} /></button>
                      <span className="num" aria-live="polite">{v}</span>
                      <button type="button" aria-label={`More ${o.name}s`} disabled={Number(v) >= o.max} title={Number(v) >= o.max ? `At most ${o.max}` : undefined} onClick={() => onValue(o.id, Math.min(o.max, Number(v) + 1))}><Plus size={12} /></button>
                    </span>
                  )
                ) : o.kind === "toggle" ? (
                  <button type="button" role="checkbox" aria-checked={v === 1} disabled={hidden} className="cg-check" onClick={() => onValue(o.id, v === 1 ? 0 : 1)} title={hidden ? "Hidden: no Warden Captain in force" : undefined}><i>{v === 1 ? <Check size={10} strokeWidth={3} /> : null}</i>{hidden ? "hidden" : v === 1 ? "taken" : "not taken"}</button>
                ) : (
                  <span className="cg-seg" role="radiogroup" aria-label={o.name}>
                    {o.choices?.map((c) => <button key={c.id} type="button" role="radio" aria-checked={v === c.id} className={v === c.id ? "active" : ""} onClick={() => onValue(o.id, c.id)}>{c.name}{c.cost ? <span className="d-muted">+{c.cost}</span> : null}</button>)}
                  </span>
                )}
              </span>
              <span role="cell" className="cg-rn-orange">{o.kind === "count" ? (o.max === 1 ? "" : `${o.min} to ${o.max}`) : o.kind === "toggle" ? `up to ${o.max}` : `choose ${o.max}${o.per === "model" ? " each" : ""}`}</span>
              <span role="cell" className="num cg-rn-ocost">{optionCost(o, v, models) || "–"}</span>
            </div>
          );
        })}
      </div>
      {issues.map((i) => <p key={i.text} className="cg-rn-optissue"><DiagIcon kind="error" size={13} />{i.text.split(" › ").pop()}</p>)}
      <p className="cg-rn-h2">Profile</p>
      <table className="cg-rn-table">
        <thead><tr>{unit.profile.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{unit.profile.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i > 1 ? "num" : undefined}>{c}</td>)}</tr>)}</tbody>
      </table>
      {unit.rules.length ? (
        <>
          <p className="cg-rn-h2">Rules</p>
          {unit.rules.map((r) => <p key={r.name} className="cg-rn-rule"><strong>{r.name}</strong>{r.text}</p>)}
        </>
      ) : null}
      <p className="cg-rn-break">{unit.cost} unit{unit.options.map((o) => { const c = optionCost(o, sel.values[o.id], models); return c ? ` + ${c} ${o.name.split(" › ").pop()?.toLowerCase()}` : ""; }).join("")} = <strong>{costOf(unit, sel)} pts</strong></p>
    </div>
  );
}

/* ---------- A selection a structural move took away: kept as stored for review ---------- */
function KeptReview({ onAddAgain, onRemove }: { onAddAgain: () => void; onRemove: () => void }) {
  return (
    <div className="cg-rn-sel">
      <p className="cg-rn-selhead"><KindIcon kind="upgrade" size={16} /><strong>Banner</strong><span className="cg-rn-markchip kept">kept for review</span><span className="d-spacer" /><span className="mono cg-rn-code">roster/moved-structural</span></p>
      <div className="cg-ly-callout warn">
        <MoveRight size={14} />
        <div>
          <p><strong>Moved to another parent.</strong> The Banner of Warden Squad (1) was stored at <code>warden-squad/warden/banner</code>; the new build moves it to <code>warden-squad/command/banner</code> (move record 3.2.1, structural).</p>
          <p className="d-muted">A structural move is never followed or matched by name: the selection is kept as stored, costs nothing and isn't checked until you choose.</p>
          <p className="cg-ib-actions">
            <button type="button" className="d-btn primary" onClick={onAddAgain}><Plus size={13} />Add it again under Command</button>
            <button type="button" className="d-btn" onClick={onRemove}><Trash2 size={13} />Remove it</button>
            <button type="button" className="d-btn"><FileText size={13} />Open the move record</button>
          </p>
        </div>
      </div>
      <p className="cg-rn-h2">How the reload reopened the roster</p>
      <div className="cg-rn-moves">
        <p><Check size={13} className="d-ok" /><span className="cg-rn-mv">Warden Captain, Warden Archers</span><span className="d-muted">same paths: costs from the new build</span></p>
        <p><Check size={13} className="d-ok" /><span className="cg-rn-mv">Halberd (Warden Captain)</span><span className="d-muted">no move record: matched by name to <code>pole-halberd</code></span></p>
        <p><AlertTriangle size={13} className="cg-rn-warn" /><span className="cg-rn-mv">Banner (Warden Squad 1)</span><span className="d-muted">structural move: kept for review</span></p>
      </div>
      <p className="cg-rn-line"><SynText text="warden-squad/warden/banner -> warden-squad/command/banner" /><span className="mono">moves.dkl:4</span></p>
    </div>
  );
}

/* ---------- Empty: pick a force ---------- */
function StartForm({ onStart }: { onStart: () => void }) {
  const [catalogue, setCatalogue] = useState("iron-wardens");
  return (
    <div className="cg-rn-start">
      <h2>Start a roster</h2>
      <p className="d-muted">Build a roster against this dataset to try it as a user would. It reloads with every save.</p>
      <div className="cg-set-group cg-rn-form">
        <div className="cg-set-row"><span className="cg-set-label">Game system</span><span className="cg-set-control">Demo Skirmish<span className="d-muted mono">demo-skirmish 3.2.0</span></span></div>
        <div className="cg-set-row top"><span className="cg-set-label">Catalogue</span><span className="cg-set-control"><span className="cg-radios">
          <button type="button" role="radio" aria-checked={catalogue === "iron-wardens"} className="cg-radio" onClick={() => setCatalogue("iron-wardens")}><i />Iron Wardens<small>Base · 4 units</small></button>
          <button type="button" role="radio" aria-checked={catalogue === "frost-wardens"} className="cg-radio" onClick={() => setCatalogue("frost-wardens")}><i />Frost Wardens<small>from the Frost Wardens variant · 2 units</small></button>
        </span></span></div>
        <div className="cg-set-row top"><span className="cg-set-label">Force</span><span className="cg-set-control"><span className="cg-radios">
          <button type="button" role="radio" aria-checked className="cg-radio"><i />Warband<small>Leader 1 · Line 1 to 4</small></button>
        </span></span></div>
        <div className="cg-set-row"><span className="cg-set-label">Points limit</span><span className="cg-set-control"><label className="cg-rn-limit"><input defaultValue={500} aria-label="Points limit" /><span className="d-muted">pts</span></label></span></div>
        <div className="cg-set-row"><span className="cg-set-label" /><span className="cg-set-control"><button type="button" className="d-btn primary" onClick={onStart}><Play size={13} />Start roster<kbd>↵</kbd></button></span></div>
      </div>
      <p className="cg-rn-h2">Or open</p>
      <div className="cg-rn-recent">
        <button type="button" className="cg-rn-addrow"><FolderOpen size={14} /><span className="cg-rn-name">Open saved roster…</span><kbd>⌥⌘O</kbd></button>
        <button type="button" className="cg-rn-addrow"><FileText size={14} /><span className="cg-rn-name">warband-252.json<small>Iron Wardens · 252 pts · today 11:40</small></span></button>
        <button type="button" className="cg-rn-addrow"><FlaskConical size={14} /><span className="cg-rn-name">test/squad-points.yaml<small>a test scenario: opens its roster</small></span></button>
      </div>
    </div>
  );
}

/* ---------- Save the roster as a test scenario (test/*.yaml for augur dklpo test): a sheet over the runner ---------- */
function SaveTest({ total, errors, onCancel, onSave }: { total: number; errors: number; onCancel: () => void; onSave: (file: string) => void }) {
  const [name, setName] = useState(`warband-${total}`);
  const [owner, setOwner] = useState<"dataset" | "draft">("dataset");
  const [expect, setExpect] = useState({ total: true, each: true, diagnostics: true, counts: false });
  const file = `${owner === "dataset" ? "" : "draft-points/"}test/${name}.yaml`;
  const yaml = [
    "# Saved from the runner (invented content). Runs on the dataset under test: no data:.",
    `id: ${name}`,
    "roster: { faction: Iron Wardens, force: Warband }",
    "steps:",
    "  - add: Warden Captain",
    "  - add: Warden Squad",
    "  - set: { selection: Warden Squad/Warden, option: Banner, value: 1 }",
    "  - …",
    "  - expect:",
    ...(expect.total ? [`      points: { total: ${total} }`] : []),
    ...(expect.each ? ["      costs: { Warden Captain: { pts: 47 }, … }"] : []),
    ...(expect.diagnostics ? [`      diagnostics: [${errors ? "roster/min-count" : ""}]`] : []),
  ];
  const tick = (k: keyof typeof expect, label: ReactNode) => (
    <button type="button" role="checkbox" aria-checked={expect[k]} className="cg-check" onClick={() => setExpect({ ...expect, [k]: !expect[k] })}><i>{expect[k] ? <Check size={10} strokeWidth={3} /> : null}</i>{label}</button>
  );
  return (
    <div className="cg-scrim cg-rn-scrim">
      <div className="cg-dialog sheet cg-rn-save" role="dialog" aria-label="Save as test scenario">
        <div className="cg-dialog-main">
          <span className="cg-dialog-icon info"><FlaskConical size={16} /></span>
          <div>
            <h2>Save the roster as a test scenario</h2>
            <p className="cg-dialog-target">{file}</p>
            <div className="cg-dialog-body">
              <label className="cg-rn-namefield"><span className="d-muted">test/</span><input value={name} onChange={(e) => setName(e.target.value.replace(/[^a-z0-9-]/g, ""))} aria-label="Scenario file name" /><span className="d-muted">.yaml</span></label>
              <span className="cg-radios">
                <button type="button" role="radio" aria-checked={owner === "dataset"} className="cg-radio" onClick={() => setOwner("dataset")}><i />In the dataset<small>runs on the dataset alone and with its layers</small></button>
                <button type="button" role="radio" aria-checked={owner === "draft"} className="cg-radio" onClick={() => setOwner("draft")}><i />In the Draft points variant<small>judged with that layer applied</small></button>
              </span>
              <p className="cg-rn-k">Expect what the engine says now</p>
              <span className="cg-rn-ticks">
                {tick("total", <>Total <span className="num">{total}</span> pts</>)}
                {tick("each", "Cost of each selection")}
                {tick("diagnostics", <>Diagnostics ({errors} error{errors === 1 ? "" : "s"})</>)}
                {tick("counts", "Model counts")}
              </span>
              <pre className="cg-rn-yaml" aria-label="Scenario preview">{yaml.join("\n")}</pre>
            </div>
          </div>
        </div>
        <div className="cg-dialog-actions">
          <button type="button" className="d-btn" onClick={onCancel}>Cancel<kbd>Esc</kbd></button>
          <button type="button" className="d-btn primary" onClick={() => onSave(file)} disabled={!name}><Save size={13} />Save scenario<kbd>↵</kbd></button>
        </div>
      </div>
    </div>
  );
}
