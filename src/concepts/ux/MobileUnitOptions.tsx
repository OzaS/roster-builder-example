import { AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronDown, ChevronRight, Circle, CircleDot, Minus, Plus } from "lucide-react";
import { type ReactNode, useState } from "react";

/** Implemented mobile unit detail: 5A options, 5B Profile tab and chips, and links (associations). Synthetic names and costs; later detail features stay in the original design. */
export function MobileUnitOptions({ onBack, state = "ready", compact = false, initialTab = "options" }: { onBack?: () => void; state?: "ready" | "loading" | "error" | "gone"; compact?: boolean; initialTab?: "options" | "profile" }) {
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
  const [tab, setTab] = useState(initialTab);
  const [marked, setMarked] = useState<string | undefined>();
  const [escort, setEscort] = useState<string | undefined>("Squad A");
  const [scope, setScope] = useState(false);
  const [belt, setBelt] = useState(true);
  // Folds are presentation only and keyed per section (selection + group path); everything starts expanded and a parent keeps its descendants' folds.
  const [folded, setFolded] = useState<string[]>([]);
  const fold = (key: string) => setFolded(keys => keys.includes(key) ? keys.filter(k => k !== key) : [...keys, key]);
  const section = (key: string) => ({ folded: folded.includes(key), onFold: () => fold(key) });
  const change = (apply: () => void) => {
    if (busy) return;
    setBusy(true);
    window.setTimeout(() => { apply(); setBusy(false); }, 180);
  };
  const total = models * (sidearm === "Pistol" ? 14 : sidearm === "Axe" ? 13 : 12) + (scope ? models : 0) + (banner ? 10 : 0) + (drillA ? 5 : 0) + (drillB ? 5 : 0);
  if (state === "loading") return <section className="ux-mobile-unit-options"><p role="status">Loading options…</p><div className="ux-5a-skeleton" /><div className="ux-5a-skeleton" /><div className="ux-5a-skeleton" /></section>;
  if (state === "gone") return <section className="ux-mobile-unit-options"><div className="ux-5a-notice" role="alert"><AlertTriangle size={18} /><strong>This selection is no longer in the roster</strong></div><button type="button" onClick={onBack}>Back to roster</button></section>;
  return <section className={`ux-mobile-unit-options ${compact ? "compact" : ""}`}>
    {!compact ? <header className="ux-5a-header"><button type="button" onClick={onBack} aria-label="Back to roster"><ArrowLeft size={20} /></button><strong>{drilled ? "Drills" : "Lancers"}</strong></header> : null}
    {drilled ? <nav aria-label="Selection path"><button type="button" disabled={busy} onClick={() => setDrilled(false)}>Lancers</button><ChevronRight size={13} /><span>Drills</span></nav> : null}
    <div className="ux-5a-context"><span>Line</span><strong>{drilled ? (drillA ? 5 : 0) + (drillB ? 5 : 0) : total} Credits</strong></div>
    <div className="ux-5a-budget"><div style={{ width: `${Math.min(100, total / 2)}%` }} /></div>
    <small>{total} / 200 Credits · {200 - total} left</small>
    <div className="ux-5a-chips">{["Line", "Mounted"].map(name => tab === "options" ? <button type="button" key={name} aria-label={name} title="Shows this category on the Profile tab" onClick={() => { setMarked(name); setTab("profile"); }}>{name}</button> : <span key={name}>{name}</span>)}</div>
    <div className="ux-5b-tabs" role="tablist" aria-label="Unit view">{(["options", "profile"] as const).map(id => <button type="button" role="tab" key={id} aria-selected={tab === id} onClick={() => setTab(id)}>{id === "options" ? "Options" : "Profile"}</button>)}</div>
    {busy ? <p role="status">Updating options…</p> : null}
    {error ? <div className="ux-5a-notice" role="alert"><AlertTriangle size={18} /><span><strong>Could not load options</strong><small>Connection interrupted</small><button type="button" onClick={() => setError(false)}>Try again</button></span></div> : tab === "profile" ? <MobileUnitProfile marked={marked} /> : <>
      {models < 3 || models > 10 ? <div className="ux-5a-notice" role="alert"><AlertTriangle size={18} /><span>Selection issues: Lancer count {models}, expected 3–10</span></div> : null}
      {drilled ? <div className="ux-5a-card"><h4>Other options</h4><ToggleRow name="Drill A" cost="+5 Credits" value={drillA} disabled={busy} onChange={() => change(() => setDrillA(!drillA))} /><ToggleRow name="Drill B" cost="+5 Credits" value={drillB} disabled={busy} onChange={() => change(() => setDrillB(!drillB))} /></div> : <>
        <h4>Model loadouts</h4>
        <article className="ux-5a-card">
          <button type="button" className="ux-5a-model-title" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><span><strong>Lancer ×{models}</strong><small>{sidearm === "Pistol" ? 14 : sidearm === "Axe" ? 13 : 12} Credits per model</small></span>{expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>
          <small>At least 3 · Up to 10 · Soft limit · can exceed</small>
          <Count name="Lancer" value={models} min={0} over={models < 3 || models > 10} disabled={busy} onChange={value => change(() => setModels(value))} />
          {models < 3 || models > 10 ? <small className="ux-5a-invalid"><AlertTriangle size={13} />{models < 3 ? "Below minimum" : "Over maximum"}</small> : null}
          {expanded ? <>
            <FoldSection title="Sidearm" counter={`${sidearm ? models : 0}/${models} selections`} {...section("lancer/sidearm")}>
              <div role="radiogroup" aria-label="Sidearm">{["", "Pistol", "Axe"].map(name => <button type="button" role="radio" aria-checked={sidearm === name} disabled={busy} className="ux-5a-choice" key={name} onClick={() => change(() => setSidearm(name))}>{sidearm === name ? <CircleDot size={21} /> : <Circle size={21} />}<span><strong>{name || "None"}</strong><small>{name ? `+${name === "Pistol" ? 2 : 1} Credits per model` : "No added cost"}</small>{name && sidearm === name ? <small>1 per model</small> : null}</span></button>)}</div>
              <div className="ux-fold-nested"><FoldSection title="Exchange its scope" counter={`${scope ? models : 0}/${models} selections`} {...section("lancer/sidearm/scope")}><ToggleRow name="Long scope" cost="+1 Credits per model" value={scope} disabled={busy} onChange={() => change(() => setScope(!scope))} /></FoldSection></div>
            </FoldSection>
            <FoldSection title="Other options" {...section("lancer/other")}><div className="ux-5a-choice"><Check size={19} /><span><strong>Lance</strong><small>Included · 1 per model</small></span></div></FoldSection>
          </> : null}
        </article>
        <div className="ux-5a-card"><FoldSection title="Other options" {...section("unit/other")}><ToggleRow name="Banner" cost="+10 Credits" value={banner} disabled={busy} onChange={() => change(() => setBanner(!banner))} /><ToggleRow name="Drills" cost="No added cost" value={drills} disabled={busy} onChange={() => change(() => setDrills(!drills))} />{drills ? <button className="ux-5a-link" type="button" disabled={busy} onClick={() => setDrilled(true)}>Configure Drills <ChevronRight size={15} /></button> : null}</FoldSection></div>
        <div className="ux-5a-card"><FoldSection title="Guns" counter={`${guns}/2 selections`} inner={!belt} {...section("unit/guns")}>
          <div className="ux-5a-choice"><span><strong>Cannon</strong><small>No added cost</small>{guns === 2 ? <small>Maximum 2 · 2 selected</small> : null}</span></div><small>Up to 2 · Hard limit</small><Count name="Cannon" value={guns} min={0} max={2} disabled={busy} onChange={value => change(() => setGuns(value))} />
          <div className="ux-fold-nested"><FoldSection title="Ammunition" counter={`${belt ? 1 : 0}/1 selections · At least 1`} invalid={!belt} {...section("unit/guns/ammo")}><ToggleRow name="Belt feed" cost="No added cost" value={belt} disabled={busy} onChange={() => change(() => setBelt(!belt))} /></FoldSection></div>
        </FoldSection></div>
        <h4>Links</h4>
        <div className="ux-5a-card"><h4>Escorting</h4><small className={escort ? "" : "ux-5a-invalid"}>{escort ? "1/1 linked" : <><AlertTriangle size={13} />0/1 linked · Needs 1 more link</>}</small><div role="radiogroup" aria-label="Escorting">{["Squad A", "Squad B"].map(name => <button type="button" role="radio" aria-checked={escort === name} disabled={busy} className="ux-5a-choice" key={name} onClick={() => change(() => setEscort(escort === name ? undefined : name))}>{escort === name ? <CheckCircle2 size={21} /> : <Circle size={21} />}<span><strong>{name}</strong></span></button>)}<div className="ux-5a-choice"><Circle size={21} /><span><strong>Squad C</strong><small className="ux-5b-warn">No longer eligible</small></span></div></div></div>
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

/** 5B Profile tab: one table per profile type (horizontal scroll, text columns left-aligned and widest), rules that open, categories. */
function MobileUnitProfile({ marked }: { marked?: string }) {
  const [open, setOpen] = useState<string | undefined>();
  const rules = [{ name: "Charge", text: "Each time this unit charges, add 1 to its move." }, { name: "Steady" }];
  return <>
    <div className="ux-5a-card ux-5b-table-card"><strong>Unit</strong><div className="ux-5b-table"><table><thead><tr><th /><th>Mv</th><th>Gr</th><th>Wd</th><th>Ld</th><th>Sv</th><th>Arm</th></tr></thead><tbody><tr aria-label="Lancer, Mv: 8, Gr: 3+, Wd: 2, Ld: 7, Sv: 4+, Arm: 1"><th>Lancer</th><td>8"</td><td>3+</td><td>2</td><td>7</td><td>4+</td><td>1</td></tr></tbody></table></div></div>
    <div className="ux-5a-card ux-5b-table-card"><strong>Abilities</strong><div className="ux-5b-table"><table><thead><tr><th /><th className="text">Description</th></tr></thead><tbody><tr><th>Escort</th><td className="text">This unit can be linked to one squad. While linked, both move together and share their cover.</td></tr></tbody></table></div></div>
    <h4>Rules</h4>
    <div className="ux-5a-card">{rules.map(rule => rule.text ? <div key={rule.name}><button type="button" className="ux-5a-choice" aria-expanded={open === rule.name} onClick={() => setOpen(open === rule.name ? undefined : rule.name)}><span><strong>{rule.name}</strong></span>{open === rule.name ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>{open === rule.name ? <small>{rule.text}</small> : null}</div> : <div className="ux-5a-choice" key={rule.name}><span><strong>{rule.name}</strong></span></div>)}</div>
    <h4>Categories</h4>
    <div className="ux-5a-chips">{["Line", "Mounted"].map(name => <span key={name} className={marked === name ? "marked" : ""}>{marked === name ? <Check size={11} /> : null}{name}</span>)}</div>
  </>;
}

/** Option sections fold independently at every level: the header (name, counter, limits, errors) is a 44 px button and stays when the body folds; a folded header says when an error is inside. */
function FoldSection({ title, counter, invalid, inner, folded, onFold, children }: { title: string; counter?: string; invalid?: boolean; inner?: boolean; folded?: boolean; onFold?: () => void; children?: ReactNode }) {
  const buried = folded && inner;
  return <div className="ux-fold">
    <button type="button" className="ux-fold-head" aria-expanded={!folded} aria-label={[title, counter, buried ? "Issues inside" : ""].filter(Boolean).join(", ")} title={`${folded ? "Shows" : "Hides"} the options of ${title}`} onClick={onFold}>
      <span><strong>{title}</strong>{counter || buried ? <small className={invalid || buried ? "ux-5a-invalid" : ""}>{invalid || buried ? <AlertTriangle size={13} /> : null}{counter}{buried ? <>{counter ? " · " : ""}Issues inside</> : null}</small> : null}</span>
      {folded ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
    </button>
    {folded ? null : children}
  </div>;
}

/** Elements sample: the three header states of a foldable section (expanded, folded, folded with an error inside). */
export function OptionFoldSamples() {
  const [open, setOpen] = useState<Record<string, boolean>>({ expanded: true });
  const toggle = (key: string) => setOpen(value => ({ ...value, [key]: !value[key] }));
  return <section className="ux-mobile-unit-options compact" style={{ maxHeight: "none" }}>
    <div className="ux-5a-card">
      <FoldSection title="Every model may exchange its sidearm" counter="2/5 selections" folded={!open.expanded} onFold={() => toggle("expanded")}><ToggleRow name="Axe" cost="+1 Credits per model" value disabled={false} onChange={() => {}} /></FoldSection>
      <FoldSection title="Heavy weapons" counter="0/1 selections" folded={!open.folded} onFold={() => toggle("folded")} />
      <FoldSection title="Guns" counter="1/2 selections" inner folded={!open.inner} onFold={() => toggle("inner")}><div className="ux-5a-choice"><span><strong>Cannon</strong><small>No added cost</small></span></div></FoldSection>
    </div>
  </section>;
}
