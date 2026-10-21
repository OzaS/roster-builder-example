import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Database, Minus, Plus, Search, X } from 'lucide-react';
import type { SourceInfo } from './desktopData';

// Guided roster creation for desktop: the mobile steps (game system → points limit → faction and force →
// configuration → name) as one dialog with a step list on the left. Earlier steps stay editable.

export type NewRoster = { name: string; limit: number; system: string; faction: string; force: string };
type StepId = 'system' | 'limit' | 'faction' | 'config' | 'name';
const STEPS: Array<{ id: StepId; label: string }> = [
  { id: 'system', label: 'Game system' }, { id: 'limit', label: 'Points limit' }, { id: 'faction', label: 'Faction and force' }, { id: 'config', label: 'Configuration' }, { id: 'name', label: 'Name' },
];
const FORCES = [
  { name: 'Expedition force', detail: 'Standard organisation · 1 Command, 2+ Core' },
  { name: 'Patrol', detail: 'Small games · 1 Command, 1+ Core, no Support' },
  { name: 'Garrison', detail: 'Defensive · 2+ Core, extra Support' },
];
const PRESETS = [500, 1000, 1500, 2000];
const MAX_LIMIT = 10000;

export function DesktopCreate({ sources, onCreate, onClose, onAddData }: { sources: SourceInfo[]; onCreate: (roster: NewRoster) => void; onClose: () => void; onAddData: () => void }) {
  const [step, setStep] = useState<StepId>('system');
  const [system, setSystem] = useState(sources[0]?.id ?? '');
  const [limit, setLimit] = useState<number | 'custom' | 'unlimited'>(1000);
  const [custom, setCustom] = useState('750');
  const [faction, setFaction] = useState('');
  const [factionQuery, setFactionQuery] = useState('');
  const [force, setForce] = useState(FORCES[0].name);
  const [size, setSize] = useState('Standard');
  const [allies, setAllies] = useState(false);
  const [commandPoints, setCommandPoints] = useState(1);
  const [name, setName] = useState('');
  const [reached, setReached] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const source = sources.find(s => s.id === system);
  const index = STEPS.findIndex(s => s.id === step);
  const customValue = Number(custom);
  const customError = limit === 'custom' && (!Number.isInteger(customValue) || customValue < 1 || customValue > MAX_LIMIT) ? `Enter a whole number from 1 to ${MAX_LIMIT.toLocaleString()}.` : '';
  const points = limit === 'unlimited' ? 0 : limit === 'custom' ? customValue : limit;
  const suggested = useMemo(() => `${faction || 'New'} ${force === 'Patrol' ? 'patrol' : force === 'Garrison' ? 'garrison' : 'expedition'}`, [faction, force]);
  const valid: Record<StepId, boolean> = { system: !!source, limit: !customError, faction: !!faction && !!force, config: true, name: true };
  const summary: Record<StepId, string> = {
    system: source?.name ?? '', limit: limit === 'unlimited' ? 'Unlimited' : points ? `${points.toLocaleString()} pts` : '',
    faction: faction ? `${faction} · ${force}` : '', config: `${size}${allies ? ' · allies' : ''} · ${commandPoints} CP`, name: name.trim() || suggested,
  };
  useEffect(() => { setFaction(''); setFactionQuery(''); }, [system]);
  useEffect(() => { bodyRef.current?.querySelector<HTMLElement>('input, button[aria-checked=true], [role=radio]')?.focus(); }, [step]);
  const go = (to: number) => { const id = STEPS[to]?.id; if (!id) return; setStep(id); setReached(r => Math.max(r, to)); };
  const create = () => onCreate({ name: name.trim() || suggested, limit: points, system: source?.name ?? '', faction: faction || source?.factions[0] || '', force });
  const next = () => { if (!valid[step]) return; if (index === STEPS.length - 1) create(); else go(index + 1); };
  const skip = () => onCreate({ name: 'Untitled roster', limit: 1000, system: source?.name ?? '', faction: source?.factions[0] ?? '', force: FORCES[0].name });

  if (!sources.length) return <Dialog onClose={onClose} label="Create roster"><div className="dt-wizard-empty"><Database size={26} /><h2>Install game data first</h2><p>Rosters are built from a game system's data. Install one, then create your roster.</p><button className="dtp-btn primary" onClick={onAddData}>Add game data<ArrowRight size={15} /></button></div></Dialog>;

  return <Dialog onClose={onClose} label="Create roster">
    <form className="dt-wizard" onSubmit={e => { e.preventDefault(); next(); }}>
      <nav className="dt-wizard-steps" aria-label="Steps">
        <h2>New roster</h2>
        <ol>{STEPS.map((s, i) => <li key={s.id}><button type="button" className={`${s.id === step ? 'current' : ''} ${i < index || (i <= reached && i !== index) ? 'done' : ''}`} aria-current={s.id === step ? 'step' : undefined} disabled={i > reached} onClick={() => go(i)}>
          <span className="dt-step-mark">{i < index ? <Check size={12} /> : i + 1}</span><span><b>{s.label}</b>{i <= reached && summary[s.id] && <small>{summary[s.id]}</small>}</span>
        </button></li>)}</ol>
        <button type="button" className="dt-wizard-skip" onClick={skip} title="Create with default choices; change them later in the roster">Skip guided setup</button>
      </nav>
      <div className="dt-wizard-body" ref={bodyRef}>
        <header><span className="dtp-eyebrow">Step {index + 1} of {STEPS.length}</span><h3>{STEPS[index].label}</h3><button type="button" className="dt-icon" aria-label="Close" title="Close (Esc)" onClick={onClose}><X size={16} /></button></header>
        <div className="dt-wizard-content">
          {step === 'system' && <div className="dt-choice-list" role="radiogroup" aria-label="Game system">{sources.map(s => <button type="button" role="radio" aria-checked={system === s.id} key={s.id} className={system === s.id ? 'active' : ''} onClick={() => setSystem(s.id)}><span><strong>{s.name}</strong><small>{s.factions.length} factions · {s.fromFile ? 'from a file' : s.version}</small></span>{system === s.id && <Check size={16} />}</button>)}<button type="button" className="dt-choice-add" onClick={onAddData}><Plus size={15} />Add another game system</button></div>}
          {step === 'limit' && <>
            <div className="dt-chip-row" role="radiogroup" aria-label="Points limit">{PRESETS.map(v => <button type="button" role="radio" aria-checked={limit === v} key={v} className={limit === v ? 'active' : ''} onClick={() => setLimit(v)}>{v.toLocaleString()}</button>)}<button type="button" role="radio" aria-checked={limit === 'custom'} className={limit === 'custom' ? 'active' : ''} onClick={() => setLimit('custom')}>Custom</button><button type="button" role="radio" aria-checked={limit === 'unlimited'} className={limit === 'unlimited' ? 'active' : ''} onClick={() => setLimit('unlimited')}>Unlimited</button></div>
            {limit === 'custom' && <label className="dt-field-label dt-wizard-field">Custom limit<input inputMode="numeric" value={custom} aria-invalid={!!customError} onChange={e => setCustom(e.target.value.replace(/[^0-9]/g, ''))} /></label>}
            <p className={`dt-wizard-hint ${customError ? 'error' : ''}`}>{customError || (limit === 'unlimited' ? 'No points limit. Validation still checks the other roster requirements.' : `Up to ${MAX_LIMIT.toLocaleString()} points. You can change the limit later from the roster summary.`)}</p>
          </>}
          {step === 'faction' && <div className="dt-wizard-columns">
            <section><h4>Faction</h4><label className="dtp-search"><Search size={14} /><input placeholder="Find a faction…" aria-label="Find a faction" value={factionQuery} onChange={e => setFactionQuery(e.target.value)} /></label>
              <div className="dt-choice-list compact" role="radiogroup" aria-label="Faction">{source?.factions.filter(f => f.toLowerCase().includes(factionQuery.toLowerCase())).map(f => <button type="button" role="radio" aria-checked={faction === f} key={f} className={faction === f ? 'active' : ''} onClick={() => setFaction(f)}><span><strong>{f}</strong></span>{faction === f && <Check size={15} />}</button>)}</div></section>
            <section><h4>Force</h4><div className="dt-choice-list compact" role="radiogroup" aria-label="Force">{FORCES.map(f => <button type="button" role="radio" aria-checked={force === f.name} key={f.name} className={force === f.name ? 'active' : ''} onClick={() => setForce(f.name)}><span><strong>{f.name}</strong><small>{f.detail}</small></span>{force === f.name && <Check size={15} />}</button>)}</div></section>
          </div>}
          {step === 'config' && <div className="dt-config">
            <div className="dt-config-row"><span><strong>Battle size</strong><small>Sets the slot limits for {force.toLowerCase()}.</small></span><div className="dtp-segmented" role="radiogroup" aria-label="Battle size">{['Skirmish', 'Standard', 'Grand'].map(v => <button type="button" role="radio" aria-checked={size === v} key={v} className={size === v ? 'active' : ''} onClick={() => setSize(v)}>{v}</button>)}</div></div>
            <label className="dt-config-row"><span><strong>Allied detachment</strong><small>Allow one detachment from an allied faction.</small></span><input type="checkbox" checked={allies} onChange={e => setAllies(e.target.checked)} /></label>
            <div className="dt-config-row"><span><strong>Command points</strong><small>0–3 at the start of the game.</small></span><div className="dt-stepper"><button type="button" aria-label="Fewer command points" disabled={commandPoints <= 0} onClick={() => setCommandPoints(v => v - 1)}><Minus size={12} /></button><b>{commandPoints}</b><button type="button" aria-label="More command points" disabled={commandPoints >= 3} onClick={() => setCommandPoints(v => v + 1)}><Plus size={12} /></button></div></div>
            <p className="dt-wizard-hint">These choices come from the game data, so other systems ask different questions.</p>
          </div>}
          {step === 'name' && <>
            <label className="dt-field-label dt-wizard-field">Roster name<input maxLength={60} placeholder={suggested} value={name} onChange={e => setName(e.target.value)} /></label>
            <p className="dt-wizard-hint">Leave it empty to use “{suggested}”. {60 - name.length} characters left.</p>
            <dl className="dt-wizard-summary">{STEPS.slice(0, 4).map(s => <div key={s.id}><dt>{s.label}</dt><dd>{summary[s.id]}</dd></div>)}</dl>
          </>}
        </div>
        <footer><button type="button" className="dtp-btn" disabled={index === 0} onClick={() => go(index - 1)}><ArrowLeft size={14} />Back</button><span className="dt-wizard-keys">Enter to continue</span><button type="submit" className="dtp-btn primary" disabled={!valid[step]}>{index === STEPS.length - 1 ? 'Create roster' : 'Continue'}<ArrowRight size={14} /></button></footer>
      </div>
    </form>
  </Dialog>;
}

function Dialog({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="dt-modal-scrim" onClick={onClose}><section className="dt-modal dt-wizard-modal" role="dialog" aria-modal="true" aria-label={label} onClick={e => e.stopPropagation()}>{children}</section></div>;
}
