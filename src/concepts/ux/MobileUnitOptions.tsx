import { AlertTriangle, ArrowLeft, Check, ChevronDown, ChevronRight, Circle, CircleDot, Minus, Plus } from "lucide-react";
import { useState } from "react";

/** Implemented mobile 5A surface. Synthetic names and costs; later detail features stay in the original design. */
export function MobileUnitOptions({ onBack, state = "ready", compact = false }: { onBack?: () => void; state?: "ready" | "loading" | "error" | "gone"; compact?: boolean }) {
  const [models, setModels] = useState(5);
  const [guns, setGuns] = useState(2);
  const [sidearm, setSidearm] = useState("Pistol");
  const [banner, setBanner] = useState(true);
  const [drills, setDrills] = useState(true);
  const [drilled, setDrilled] = useState(false);
  const [drillA, setDrillA] = useState(true);
  const [drillB, setDrillB] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [showHidden, setShowHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(state === "error");
  const change = (apply: () => void) => {
    if (busy) return;
    setBusy(true);
    window.setTimeout(() => { apply(); setBusy(false); }, 180);
  };
  const total = models * (sidearm === "Pistol" ? 14 : sidearm === "Axe" ? 13 : 12) + (banner ? 10 : 0) + (drillA ? 5 : 0) + (drillB ? 5 : 0);
  if (state === "loading") return <section className="ux-mobile-unit-options"><p role="status">Loading options…</p><div className="ux-5a-skeleton" /><div className="ux-5a-skeleton" /><div className="ux-5a-skeleton" /></section>;
  if (state === "gone") return <section className="ux-mobile-unit-options"><div className="ux-5a-notice" role="alert"><AlertTriangle size={18} /><strong>This selection is no longer in the roster</strong></div><button type="button" onClick={onBack}>Back to roster</button></section>;
  return <section className={`ux-mobile-unit-options ${compact ? "compact" : ""}`}>
    {!compact ? <header className="ux-5a-header"><button type="button" onClick={onBack} aria-label="Back to roster"><ArrowLeft size={20} /></button><strong>{drilled ? "Drills" : "Lancers"}</strong></header> : null}
    {drilled ? <nav aria-label="Selection path"><button type="button" disabled={busy} onClick={() => setDrilled(false)}>Lancers</button><ChevronRight size={13} /><span>Drills</span></nav> : null}
    <div className="ux-5a-context"><span>Line</span><strong>{drilled ? (drillA ? 5 : 0) + (drillB ? 5 : 0) : total} Credits</strong></div>
    <div className="ux-5a-budget"><div style={{ width: `${Math.min(100, total / 2)}%` }} /></div>
    <small>{total} / 200 Credits · {200 - total} left</small>
    <div className="ux-5a-chips"><span>Line</span><span>Mounted</span></div>
    {busy ? <p role="status">Updating options…</p> : null}
    {error ? <div className="ux-5a-notice" role="alert"><AlertTriangle size={18} /><span><strong>Could not load options</strong><small>Connection interrupted</small><button type="button" onClick={() => setError(false)}>Try again</button></span></div> : <>
      {models < 3 || models > 10 ? <div className="ux-5a-notice" role="alert"><AlertTriangle size={18} /><span>Selection issues: Lancer count {models}, expected 3–10</span></div> : null}
      {drilled ? <div className="ux-5a-card"><h4>Other options</h4><ToggleRow name="Drill A" cost="+5 Credits" value={drillA} disabled={busy} onChange={() => change(() => setDrillA(!drillA))} /><ToggleRow name="Drill B" cost="+5 Credits" value={drillB} disabled={busy} onChange={() => change(() => setDrillB(!drillB))} /></div> : <>
        <h4>Model loadouts</h4>
        <article className="ux-5a-card">
          <button type="button" className="ux-5a-model-title" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><span><strong>Lancer ×{models}</strong><small>{sidearm === "Pistol" ? 14 : sidearm === "Axe" ? 13 : 12} Credits per model</small></span>{expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>
          <small>At least 3 · Up to 10 · Soft limit · can exceed</small>
          <Count name="Lancer" value={models} min={0} over={models < 3 || models > 10} disabled={busy} onChange={value => change(() => setModels(value))} />
          {models < 3 || models > 10 ? <small className="ux-5a-invalid"><AlertTriangle size={13} />{models < 3 ? "Below minimum" : "Over maximum"}</small> : null}
          {expanded ? <><div className="ux-5a-section-title"><h4>Sidearm</h4><small>{sidearm ? models : 0}/{models} selections</small></div><div role="radiogroup" aria-label="Sidearm">{["", "Pistol", "Axe"].map(name => <button type="button" role="radio" aria-checked={sidearm === name} disabled={busy} className="ux-5a-choice" key={name} onClick={() => change(() => setSidearm(name))}>{sidearm === name ? <CircleDot size={21} /> : <Circle size={21} />}<span><strong>{name || "None"}</strong><small>{name ? `+${name === "Pistol" ? 2 : 1} Credits per model` : "No added cost"}</small>{name && sidearm === name ? <small>1 per model</small> : null}</span></button>)}</div><h4>Other options</h4><div className="ux-5a-choice"><Check size={19} /><span><strong>Lance</strong><small>Included · 1 per model</small></span></div></> : null}
        </article>
        <div className="ux-5a-card"><h4>Other options</h4><ToggleRow name="Banner" cost="+10 Credits" value={banner} disabled={busy} onChange={() => change(() => setBanner(!banner))} /><ToggleRow name="Drills" cost="No added cost" value={drills} disabled={busy} onChange={() => change(() => setDrills(!drills))} />{drills ? <button className="ux-5a-link" type="button" disabled={busy} onClick={() => setDrilled(true)}>Configure Drills <ChevronRight size={15} /></button> : null}</div>
        <div className="ux-5a-card"><div className="ux-5a-section-title"><h4>Guns</h4><small>{guns}/2 selections</small></div><div className="ux-5a-choice"><span><strong>Cannon</strong><small>No added cost</small>{guns === 2 ? <small>Maximum 2 · 2 selected</small> : null}</span></div><small>Up to 2 · Hard limit</small><Count name="Cannon" value={guns} min={0} max={2} disabled={busy} onChange={value => change(() => setGuns(value))} /></div>
        <button className="ux-5a-link" type="button" disabled={busy} onClick={() => setShowHidden(!showHidden)}>{showHidden ? "Hide hidden options" : "Show hidden options (1)"}</button>
        {showHidden ? <div className="ux-5a-card"><strong>Secret option</strong><small>Hidden</small><small>No added cost</small><Count name="Secret option" value={0} min={0} disabled={true} onChange={() => {}} /></div> : null}
      </>}
    </>}
  </section>;
}

function Count({ name, value, min, max, over, disabled, onChange }: { name: string; value: number; min: number; max?: number; over?: boolean; disabled: boolean; onChange: (value: number) => void }) {
  return <div className={`ux-5a-count ${over ? "ux-5a-invalid" : ""}`}>
    <button type="button" disabled={disabled || value <= min} aria-label={`Decrease ${name}`} onClick={() => onChange(value - 1)}><Minus size={18} /></button><strong>{over ? <AlertTriangle size={13} /> : null}{value}</strong><button type="button" disabled={disabled || (max !== undefined && value >= max)} aria-label={`Increase ${name}`} onClick={() => onChange(Math.max(min, value + 1))}><Plus size={18} /></button>
  </div>;
}
function ToggleRow({ name, cost, value, disabled, onChange }: { name: string; cost: string; value: boolean; disabled: boolean; onChange: () => void }) {
  return <div className="ux-5a-choice"><span><strong>{name}</strong><small>{cost}</small></span><button type="button" className={`ux-5a-switch ${value ? "on" : ""}`} role="switch" aria-label={name} aria-checked={value} disabled={disabled} onClick={onChange}><span /></button></div>;
}
