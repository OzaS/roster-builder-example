import { useState } from "react";
import { ArrowLeft, Bug, ChevronRight, Copy, Cpu, Eye, EyeOff, Flag, Gauge, Info, Layers, LayoutGrid, RotateCcw, SquareTerminal, Timer, Trash2 } from "lucide-react";
import type { ConceptProps } from "../shared";

/*
 * F1b (DEC-063, approved 2026-11-04): Developer options and Debug are two pages.
 * Developer options (still behind the 7-tap unlock on About › Version) hold only Show hidden entries and Hide developer options.
 * Debug holds the internal tools that used to be on the Developer page; it exists only in debug builds (dev builds, or release
 * builds made with the debug build switch) and does not depend on the unlock. Debug rows are never found by Settings search.
 * Synthetic names only (DEC-001).
 */

export const DEVELOPER_NOTE = "For checking game data. You do not need these to build rosters.";
export const SHOW_HIDDEN_TITLE = "Show hidden entries";
export const SHOW_HIDDEN_DETAIL = "List the entries and options the game data marks as hidden in Add unit, Add force and in unit options. Off by default.";
export const HIDE_DEVELOPER_DETAIL = "Unlock again with 7 taps on Version in About.";
export const DEBUG_SUBTITLE = "Feature flags, performance, tools";

/** Gallery screens that draw the App screen with Developer options unlocked in a debug build. */
export const APP_DEVELOPER_SCREENS: readonly string[] = ["app-developer-debug", "developer-options", "debug"];

/** App → Developer options (after the unlock). */
export function DeveloperOptionsNavRow({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className="ux-app-nav-row" onClick={onClick}>
      <span className="ux-setting-icon"><Bug size={17} /></span>
      <span><strong>Developer options</strong><small>For checking game data</small></span>
      <ChevronRight size={17} />
    </button>
  );
}

/** App → Debug (debug builds only, whatever the unlock). */
export function DebugNavRow({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className="ux-app-nav-row" onClick={onClick}>
      <span className="ux-setting-icon"><SquareTerminal size={17} /></span>
      <span><strong>Debug</strong><small>{DEBUG_SUBTITLE}</small></span>
      <ChevronRight size={17} />
    </button>
  );
}

function PageHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <header className="ux-wb-top ux-wb-home-top reversed">
      <button type="button" className="ux-icon-btn" aria-label="Back" onClick={onBack}><ArrowLeft size={18} /></button>
      <div className="ux-wb-title"><strong>{title}</strong><small>{subtitle}</small></div>
    </header>
  );
}

/** The two rows of Developer options; shared with the Elements view. */
export function DeveloperOptionsRows({ initialShowHidden = false, onHide }: { initialShowHidden?: boolean; onHide?: () => void }) {
  const [showHidden, setShowHidden] = useState(initialShowHidden);
  return (
    <>
      <p className="ux-hint"><Info size={14} />{DEVELOPER_NOTE}</p>
      <div className="ux-src-group">
        <button type="button" role="switch" aria-checked={showHidden} className={`ux-setting-row ux-dev-row ${showHidden ? "on" : ""}`} onClick={() => setShowHidden((value) => !value)}>
          <span className="ux-setting-icon"><Eye size={17} /></span>
          <span className="ux-setting-text"><strong>{SHOW_HIDDEN_TITLE}</strong><small>{SHOW_HIDDEN_DETAIL}</small></span>
          <span className="ux-switch" aria-hidden />
        </button>
      </div>
      <div className="ux-src-group">
        <button type="button" className="ux-setting-row ux-setting-value ux-dev-row" onClick={onHide}>
          <span className="ux-setting-icon"><EyeOff size={17} /></span>
          <span className="ux-setting-text"><strong>Hide developer options</strong><small>{HIDE_DEVELOPER_DETAIL}</small></span>
          <span className="ux-setting-current" />
        </button>
      </div>
    </>
  );
}

const PERF_ROWS: Array<[string, string]> = [["Lists", "0 drops · 38 ms"], ["Roster editor", "2 drops · 64 ms"], ["Add unit", "1 drop · 51 ms"]];
const FLAGS: Array<{ id: string; name: string; tier: string; on: boolean }> = [
  { id: "lookup", name: "Lookup tab", tier: "1.0 · built", on: true },
  { id: "library", name: "Library tab", tier: "1.x · placeholder", on: false },
  { id: "tools", name: "Tools tab", tier: "1.x · placeholder", on: false },
];
const MEASUREMENTS: Array<[string, string]> = [["3 sources · 2 at once", "14.2 s"], ["3 sources · 1 at once", "19.8 s"], ["1 source · update", "4.1 s"]];

/** The Debug page body: the rows and controls of the former Developer page, moved. */
export function DebugRows() {
  const [overlay, setOverlay] = useState(true);
  const [flags, setFlags] = useState<Record<string, boolean>>(() => Object.fromEntries(FLAGS.map((flag) => [flag.id, flag.on])));
  const [imports, setImports] = useState<1 | 2>(2);
  return (
    <>
      <div className="ux-result-label">Performance</div>
      <div className="ux-src-group">
        <button type="button" role="switch" aria-checked={overlay} className={`ux-setting-row ux-dev-row ${overlay ? "on" : ""}`} onClick={() => setOverlay((value) => !value)}>
          <span className="ux-setting-icon"><Gauge size={17} /></span>
          <span className="ux-setting-text"><strong>Performance overlay</strong><small>UI frame drops and tap → view latency, per screen</small></span>
          <span className="ux-switch" aria-hidden />
        </button>
        {PERF_ROWS.map(([screen, value]) => <div className="ux-src-kv ux-dev-kv" key={screen}><span>{screen}</span><b>{value}</b></div>)}
        <div className="ux-dev-actions"><button type="button" className="ux-job-btn sm"><Copy size={14} />Save report</button><button type="button" className="ux-job-btn sm ux-src-ghost"><RotateCcw size={14} />Reset</button></div>
      </div>
      <div className="ux-result-label">Feature flags</div>
      <div className="ux-src-group">
        {FLAGS.map((flag) => (
          <button key={flag.id} type="button" role="switch" aria-checked={flags[flag.id]} className={`ux-setting-row ux-dev-row ${flags[flag.id] ? "on" : ""}`} onClick={() => setFlags((current) => ({ ...current, [flag.id]: !current[flag.id] }))}>
            <span className="ux-setting-icon"><Flag size={17} /></span>
            <span className="ux-setting-text"><strong>{flag.name}</strong><small>{flag.tier}</small></span>
            <span className="ux-switch" aria-hidden />
          </button>
        ))}
        <div className="ux-dev-actions"><button type="button" className="ux-job-btn sm ux-src-ghost" onClick={() => setFlags(Object.fromEntries(FLAGS.map((flag) => [flag.id, flag.on])))}><RotateCcw size={14} />Reset to defaults</button></div>
      </div>
      <div className="ux-result-label">Installs</div>
      <div className="ux-setting-block">
        <div className="ux-setting-block-head"><Layers size={18} /><strong role="heading" aria-level={3}>Imports at once</strong></div>
        <small>For measuring installs that run together.</small>
        <div className="ux-segmented" role="radiogroup" aria-label="Imports at once">
          {([1, 2] as const).map((value) => <button key={value} type="button" role="radio" aria-checked={imports === value} className={imports === value ? "on" : ""} onClick={() => setImports(value)}>{value}</button>)}
        </div>
      </div>
      <div className="ux-src-group">
        <div className="ux-src-kv"><span><strong>Install measurements</strong></span><b>Last 10</b></div>
        {MEASUREMENTS.map(([what, time]) => <div className="ux-src-kv ux-dev-kv flush" key={what}><span>{what}</span><b>{time}</b></div>)}
        <div className="ux-dev-actions"><button type="button" className="ux-job-btn sm"><Copy size={14} />Copy</button><button type="button" className="ux-job-btn sm ux-src-ghost"><Trash2 size={14} />Clear</button></div>
      </div>
      <div className="ux-result-label">Tools</div>
      <div className="ux-src-group">
        <button type="button" className="ux-col-nav"><LayoutGrid size={17} /><span><strong>Component gallery</strong><small>Every design-system component and state</small></span><ChevronRight size={16} /></button>
        <button type="button" className="ux-col-nav"><Timer size={17} /><span><strong>Engine bench</strong><small>Time engine operations on installed data</small></span><ChevronRight size={16} /></button>
      </div>
      <div className="ux-result-label">Engine worker</div>
      <div className="ux-src-group">
        <div className="ux-src-kv"><span>Cache</span><b>12 documents · 8.4 MB</b></div>
        <div className="ux-src-kv"><span>Sessions</span><b>1 open</b></div>
        <div className="ux-src-kv"><span>Heap</span><b>142 MB</b></div>
        <div className="ux-dev-actions"><button type="button" className="ux-job-btn sm"><Cpu size={14} />Restart</button></div>
      </div>
    </>
  );
}

/** App → Developer options. */
export function DeveloperOptionsScreen({ props }: { props: ConceptProps }) {
  return (
    <>
      <PageHeader title="Developer options" subtitle="For checking game data" onBack={props.onBack} />
      <div className="ux-wb-home-body ux-app-body ux-dev-body">
        <DeveloperOptionsRows onHide={props.onBack} />
      </div>
    </>
  );
}

/** App → Debug (debug builds only). */
export function DebugScreen({ props }: { props: ConceptProps }) {
  return (
    <>
      <PageHeader title="Debug" subtitle="Internal tools" onBack={props.onBack} />
      <div className="ux-wb-home-body ux-app-body ux-dev-body">
        <DebugRows />
      </div>
    </>
  );
}
