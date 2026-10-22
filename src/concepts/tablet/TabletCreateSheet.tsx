import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, Database, Plus, Search } from 'lucide-react';
import { FORCE_TYPES, primaryForce, type ImportResult } from '../desktop/DesktopEditorFlows';
import type { RosterSummary, SourceInfo } from '../desktop/desktopData';
import { TabletSheet } from './TabletSheet';
import './tablet-dialogs.css';

// Guided roster creation (T3) as a form sheet: the phone's steps (game system, faction, force, points limit and name, review)
// with the desktop's step list beside them. Earlier steps stay editable from the list. Every New roster entry opens it;
// Create roster hands the new roster to the editor. Synthetic data only (DEC-001).

export type NewRoster = { name: string; system: string; faction: string; forceType: string; limit: number };
type StepId = 'system' | 'faction' | 'force' | 'setup' | 'review';
const STEPS: Array<{ id: StepId; label: string }> = [
  { id: 'system', label: 'Game system' }, { id: 'faction', label: 'Faction' }, { id: 'force', label: 'Force' }, { id: 'setup', label: 'Points and name' }, { id: 'review', label: 'Review' },
];
/** An allied detachment cannot start a roster. */
const FORCES = FORCE_TYPES.filter(t => !t.needsAllies);
const PRESETS = [500, 1000, 1500, 2000];
const MAX_LIMIT = 10000;
const pts = (n: number) => n.toLocaleString('en-US');

/** The roster the editor opens and the row the Rosters list gets for a finished creation. */
export function newRosterDocument(draft: NewRoster): { summary: RosterSummary; result: ImportResult } {
  const type = FORCES.find(t => t.name === draft.forceType) ?? FORCES[0];
  const mark = draft.name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const issues = (type.command ? 1 : 0) + (type.core ? 1 : 0);
  return {
    summary: { name: draft.name, faction: draft.faction, system: draft.system, used: 0, limit: draft.limit, opened: 'Just now', forces: 1, units: 0, status: issues ? 'issues' : 'ready', issues: issues || undefined, mark },
    result: { fileName: '', name: draft.name, system: draft.system, faction: draft.faction, limit: draft.limit, units: [], forces: [primaryForce(type.name, draft.faction)], unmatched: [] },
  };
}

export function CreateRosterSheet({ sources, defaultLimit = 1000, review = false, onCreate, onAddData, onClose }: {
  sources: SourceInfo[]; defaultLimit?: number;
  /** Gallery start: every choice made, on the review step. */
  review?: boolean;
  onCreate: (roster: NewRoster) => void; onAddData: () => void; onClose: () => void;
}) {
  const [step, setStep] = useState<StepId>(review ? 'review' : 'system');
  const [reached, setReached] = useState(review ? STEPS.length - 1 : 0);
  const [system, setSystem] = useState(sources[0]?.id ?? '');
  const [faction, setFaction] = useState(review ? sources[0]?.factions[0] ?? '' : '');
  const [factionQuery, setFactionQuery] = useState('');
  const [forceType, setForceType] = useState(FORCES[0].name);
  const [limit, setLimit] = useState<number | 'custom' | 'unlimited'>(PRESETS.includes(defaultLimit) ? defaultLimit : 1000);
  const [custom, setCustom] = useState('750');
  const [name, setName] = useState('');
  const mainRef = useRef<HTMLDivElement>(null);
  const source = sources.find(s => s.id === system);
  const index = STEPS.findIndex(s => s.id === step);
  const type = FORCES.find(t => t.name === forceType) ?? FORCES[0];
  const customValue = Number(custom);
  const customError = limit === 'custom' && (!Number.isInteger(customValue) || customValue < 1 || customValue > MAX_LIMIT) ? `Enter a whole number from 1 to ${pts(MAX_LIMIT)}.` : '';
  const points = limit === 'unlimited' ? 0 : limit === 'custom' ? customValue : limit;
  const forceBlock = type.minLimit && points > 0 && points < type.minLimit ? `${type.name} needs a points limit of ${pts(type.minLimit)} or more. Choose a higher limit, or another force.` : '';
  const suggested = useMemo(() => `${faction || 'New'} ${forceType.split(' ')[0].toLowerCase()}`, [faction, forceType]);
  const valid: Record<StepId, boolean> = { system: !!source, faction: !!faction, force: !!forceType, setup: !customError && !forceBlock, review: true };
  const limitText = limit === 'unlimited' ? 'Unlimited' : points ? `${pts(points)} pts` : '';
  const summary: Record<StepId, string> = { system: source?.name ?? '', faction, force: forceType, setup: [limitText, name.trim() || suggested].filter(Boolean).join(' · '), review: '' };
  const finalName = name.trim() || suggested;

  // A step change moves focus to the choice that matters (the chosen option, or the first), never to a text field: no keyboard pops up on touch.
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } mainRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true }); }, [step]);

  if (!sources.length) return <TabletSheet title="New roster" onClose={onClose} action={{ label: 'Add game data', icon: <Plus size={18} />, onClick: onAddData }}>
    <div className="tbc-empty"><Database size={30} /><strong>Install game data first</strong><small>Rosters are built from a game system's data. Install one, then create your roster.</small></div>
  </TabletSheet>;

  const go = (to: number) => { const id = STEPS[to]?.id; if (!id) return; setStep(id); setReached(r => Math.max(r, to)); };
  const create = () => onCreate({ name: finalName, system: source?.name ?? '', faction: faction || source?.factions[0] || '', forceType, limit: points });
  const next = () => { if (!valid[step]) return; if (index === STEPS.length - 1) create(); else go(index + 1); };
  const skip = () => onCreate({ name: 'Untitled roster', system: source?.name ?? '', faction: source?.factions[0] ?? '', forceType: FORCES[0].name, limit: 1000 });
  const chooseSystem = (id: string) => { if (id !== system) { setSystem(id); setFaction(''); setFactionQuery(''); } };
  const factions = (source?.factions ?? []).filter(f => f.toLowerCase().includes(factionQuery.trim().toLowerCase()));
  const choice = (checked: boolean, label: string, detail: string | undefined, onClick: () => void, key = label, autofocus = checked) =>
    <button type="button" role="radio" key={key} aria-checked={checked} className={`tbs-choice ${checked ? 'active' : ''}`} data-autofocus={autofocus ? true : undefined} onClick={onClick}>
      <span><strong>{label}</strong>{detail && <small>{detail}</small>}</span>{checked && <Check size={20} />}</button>;

  return <TabletSheet title="New roster" sub={`Step ${index + 1} of ${STEPS.length} · ${STEPS[index].label}`} wide onClose={onClose}
    action={{ label: index === STEPS.length - 1 ? 'Create roster' : 'Continue', disabled: !valid[step], onClick: next }}>
    <div className="tbc">
      <nav className="tbc-steps" aria-label="Steps">
        <ol>{STEPS.map((s, i) => <li key={s.id}><button type="button" className={`tbc-step ${s.id === step ? 'current' : ''} ${i < index || (i <= reached && i !== index) ? 'done' : ''}`} aria-current={s.id === step ? 'step' : undefined} disabled={i > reached} onClick={() => go(i)}>
          <span className="tbc-mark" aria-hidden="true">{i < index || (i <= reached && i !== index) ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
          <span><b>{s.label}</b>{i <= reached && summary[s.id] && <small>{summary[s.id]}</small>}</span>
        </button></li>)}</ol>
      </nav>
      <div className="tbc-main" ref={mainRef}>
        {step === 'system' && <>
          <h3 className="tbs-label" id="tbc-system">Game system</h3>
          <div className="tbs-choices" role="radiogroup" aria-labelledby="tbc-system">
            {sources.map(s => choice(system === s.id, s.name, `${s.factions.length} factions · ${s.fromFile ? 'from a file' : s.version}`, () => chooseSystem(s.id), s.id))}
            <button type="button" className="tbs-choice tbc-add" onClick={onAddData}><Plus size={20} /><span><strong>Add another game system</strong><small>Install more game data from Sources</small></span></button>
          </div>
        </>}
        {step === 'faction' && <>
          <h3 className="tbs-label" id="tbc-faction">Faction · {source?.name}</h3>
          {(source?.factions.length ?? 0) > 4 && <label className="tbs-field">Find a faction<input type="search" placeholder="Find a faction…" value={factionQuery} onChange={e => setFactionQuery(e.target.value)} /></label>}
          <div className="tbs-choices" role="radiogroup" aria-labelledby="tbc-faction">
            {factions.map((f, i) => choice(faction === f, f, undefined, () => setFaction(f), f, faction ? faction === f : i === 0))}
            {!factions.length && <p className="tbs-note"><Search size={16} />No faction matches “{factionQuery.trim()}”.</p>}
          </div>
          <p className="tbs-hint">Only factions installed with {source?.name} are listed.</p>
        </>}
        {step === 'force' && <>
          <h3 className="tbs-label" id="tbc-force">Force</h3>
          <div className="tbs-choices" role="radiogroup" aria-labelledby="tbc-force">
            {FORCES.map(t => choice(forceType === t.name, t.name, t.minLimit ? `${t.detail} · from ${pts(t.minLimit)} pts` : t.detail, () => setForceType(t.name)))}
          </div>
          <p className="tbs-hint">The force sets the requirements the roster is checked against. You can add more forces later.</p>
        </>}
        {step === 'setup' && <>
          <h3 className="tbs-label" id="tbc-limit">Points limit</h3>
          <div className="tbc-chips" role="radiogroup" aria-labelledby="tbc-limit">
            {PRESETS.map(v => <button type="button" role="radio" key={v} aria-checked={limit === v} className={`tbc-chip ${limit === v ? 'active' : ''}`} data-autofocus={limit === v ? true : undefined} onClick={() => setLimit(v)}>{pts(v)}</button>)}
            <button type="button" role="radio" aria-checked={limit === 'custom'} className={`tbc-chip ${limit === 'custom' ? 'active' : ''}`} data-autofocus={limit === 'custom' ? true : undefined} onClick={() => setLimit('custom')}>Custom</button>
            <button type="button" role="radio" aria-checked={limit === 'unlimited'} className={`tbc-chip ${limit === 'unlimited' ? 'active' : ''}`} data-autofocus={limit === 'unlimited' ? true : undefined} onClick={() => setLimit('unlimited')}>Unlimited</button>
          </div>
          {limit === 'custom' && <label className="tbs-field">Custom limit<input inputMode="numeric" value={custom} aria-invalid={!!customError} onChange={e => setCustom(e.target.value.replace(/[^0-9]/g, ''))} onFocus={e => e.currentTarget.select()} /></label>}
          <p className={`tbs-hint ${customError ? 'tbc-error' : ''}`} role={customError ? 'alert' : undefined}>{customError || (limit === 'unlimited' ? 'No points limit. The roster is still checked against the other requirements.' : `Up to ${pts(MAX_LIMIT)} points. You can change the limit later from the roster summary.`)}</p>
          {forceBlock && <div className="tbs-note warn" role="alert"><AlertTriangle size={18} /><span><strong>{type.name} is not available at this limit</strong><small>{forceBlock}</small></span></div>}
          <label className="tbs-field">Roster name<input maxLength={60} placeholder={suggested} value={name} onChange={e => setName(e.target.value)} /><span className="tbs-count">{name.length} / 60</span></label>
          <p className="tbs-hint">Leave the name empty to use “{suggested}”.</p>
        </>}
        {step === 'review' && <>
          <h3 className="tbs-label">Your roster</h3>
          <ul className="tbs-rows tbc-review">{([['Game system', source?.name ?? '', 0], ['Faction', faction || '—', 1], ['Force', forceType, 2], ['Points limit', limit === 'unlimited' ? 'Unlimited' : `${pts(points)} pts`, 3], ['Name', finalName, 3]] as Array<[string, string, number]>).map(([label, value, to]) =>
            <li key={label}><span><strong>{value}</strong><small>{label}</small></span><button type="button" className="tbs-action" aria-label={`Change ${label.toLowerCase()}`} onClick={() => go(to)}>Change</button></li>)}</ul>
          <div className="tbs-note ok"><Check size={18} /><span><strong>Ready to build</strong><small>The roster opens empty in the editor. Add units from the catalogue; everything here can change later.</small></span></div>
        </>}
        <div className="tbc-foot">
          <button type="button" className="tbs-action" disabled={index === 0} onClick={() => go(index - 1)}>Back</button>
          {step !== 'review' && <button type="button" className="tbc-skip" title="Create with default choices; change them later in the roster" onClick={skip}>Skip guided setup</button>}
        </div>
      </div>
    </div>
  </TabletSheet>;
}
