import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { BookOpen, Check, ChevronLeft, ChevronRight, Copy, Lock, Megaphone, Minus, Plus, Scissors, Trash2, UserRound, Users, X } from 'lucide-react';
import { HistoryButtons, unitCost, type EditorUnit } from './DesktopEditorFlows';
import './desktop-unit-dialog.css';

/**
 * R0-02 / UX-056 (DEC-055): desktop unit editing in an in-app modal dialog over the roster, replacing the inspector pane.
 * It edits the roster's live session: every change autosaves and is an Undo step; there is no Save/Cancel draft.
 * Close (×), Escape on the top level and a click on the dimmed roster close it and return focus to the unit row.
 * Nested elements (the squad leader, its signal kit) push a level inside the dialog: Back and a breadcrumb in the
 * header; Escape goes back one level, then closes. Focus stays inside the dialog (Tab and Shift+Tab wrap).
 */

export type UnitDialogLevel = 'leader' | 'signal';
export const LEADER_WEAPONS = ['Sidearm', 'Officer blade', 'Signal pistol'];
export const SIGNALS = ['Flares', 'Horn', 'Banner'];
const levelTitle: Record<UnitDialogLevel, string> = { leader: 'Squad leader', signal: 'Signal kit' };
/** A unit with several models (not a commander) has a squad leader with options of its own. */
export const hasLeader = (u: EditorUnit) => u.models > 1 && u.role !== 'Command';

export function UnitDialog({ unit, forceName, source = 'Open Field · Catalogue v1.4', path, tab, readOnlyReason, separateAll, undo, onPath, onTab, onClose, onUpdate, onDuplicate, onRemove, onSeparate }: {
  unit: EditorUnit; forceName: string; source?: string; path: UnitDialogLevel[]; tab: string; readOnlyReason?: string; separateAll: boolean;
  undo: { undoLabel?: string; redoLabel?: string; undoKey?: string; redoKey?: string; onUndo: () => void; onRedo: () => void };
  onPath: (path: UnitDialogLevel[]) => void; onTab: (tab: string) => void; onClose: () => void; onUpdate: (change: Partial<EditorUnit>) => void;
  onDuplicate: () => void; onRemove: () => void; onSeparate: (all: boolean) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const opener = useRef<UnitDialogLevel | null>(null);
  const level = path[path.length - 1];
  const titleId = `dtu-title-${unit.id}`;
  // Focus: Close on opening, Back after pushing a level, the row that opened a level after going back.
  useEffect(() => {
    const box = ref.current; if (!box) return;
    const back = opener.current ? box.querySelector<HTMLElement>(`[data-drill="${opener.current}"]`) : null;
    (back ?? box.querySelector<HTMLElement>(level ? '.dtu-back' : '.dtu-close'))?.focus({ preventScroll: true });
    opener.current = null;
  }, [level]);
  const push = (next: UnitDialogLevel) => onPath([...path, next]);
  const pop = () => { opener.current = level ?? null; onPath(path.slice(0, -1)); };
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (level) pop(); else onClose(); return; }
    if (e.key !== 'Tab') return;
    const nodes = Array.from(ref.current?.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []).filter(el => !el.matches(':disabled') && el.offsetParent !== null);
    const first = nodes[0]; const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  };
  const ro = !!readOnlyReason;
  const leaderWeapon = unit.leaderWeapon ?? LEADER_WEAPONS[0];
  const signalLine = unit.signalKit ? `Taken · ${unit.signal ?? SIGNALS[0]}` : 'Not taken';
  const crumbs: Array<{ label: string; to: UnitDialogLevel[] }> = [{ label: unit.name, to: [] }, ...path.map((p, i) => ({ label: levelTitle[p], to: path.slice(0, i + 1) }))];
  const eyebrow = level === 'leader' ? <>Member <span> / </span> 1 model</> : level === 'signal' ? <>Upgrade <span> / </span> Squad leader</> : <>{unit.role} <span> / </span> {unit.models} {unit.models === 1 ? 'model' : 'models'}</>;
  const points = level === 'leader' ? (unit.signalKit ? '+5' : 'Included') : level === 'signal' ? '+5' : String(unitCost(unit));
  return <div className="dtu-scrim" onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section ref={ref} className="dt-inspector dtu-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={ro ? `${titleId}-ro` : undefined} onKeyDown={onKeyDown}>
      <header className="dt-inspector-title dtu-head">
        {level && <nav className="dtu-crumbs" aria-label="Where you are in this unit">
          <button type="button" className="dt-icon dtu-back" aria-label={`Back to ${crumbs[crumbs.length - 2].label}`} title="Back (Esc)" onClick={pop}><ChevronLeft size={16} /></button>
          <ol>{crumbs.map((c, i) => <li key={c.label}>{i < crumbs.length - 1 ? <><button type="button" onClick={() => { opener.current = path[i] ?? null; onPath(c.to); }}>{c.label}</button><ChevronRight size={12} aria-hidden="true" /></> : <span aria-current="location">{c.label}</span>}</li>)}</ol>
        </nav>}
        <div className="dte-inspector-head">
          <span className="dt-eyebrow">{eyebrow}</span>
          <span className="dtu-head-tools"><HistoryButtons {...undo} disabledReason={readOnlyReason} /><span className="dtu-rule" aria-hidden="true" /><button type="button" className="dt-icon dtu-close" aria-label={`Close ${unit.name}`} title="Close (Esc)" onClick={onClose}><X size={16} /></button></span>
        </div>
        <div className="dte-inspector-name"><h2 id={titleId}>{level ? levelTitle[level] : unit.name}</h2><strong>{points}{points.startsWith('+') || /^\d/.test(points) ? <small> pts</small> : null}</strong></div>
        <p>{level ? `In ${unit.name} · ${forceName}` : forceName}</p>
        {!level && <div className="dt-unit-actions"><button disabled={ro} title={readOnlyReason ?? 'Duplicate this unit'} onClick={onDuplicate}><Copy size={13} /> Duplicate</button><button disabled={ro} title={readOnlyReason ?? 'Remove this unit'} onClick={onRemove}><Trash2 size={13} /> Remove</button></div>}
      </header>
      {!level && <div className="dt-inspector-tabs" role="tablist" aria-label="Unit details">{['Options', 'Profile', 'Rules'].map(t => <button role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} key={t} onClick={() => onTab(t)}>{t}</button>)}</div>}
      <div className="dtu-body">
        {ro && <p className="dtu-readonly" id={`${titleId}-ro`}><Lock size={14} />{readOnlyReason}</p>}
        <div className={`dt-inspector-content dtu-content ${ro ? 'ro' : ''}`} title={readOnlyReason}>
          {level === 'leader' ? <>
            <div className="dt-option-heading"><h3>Weapon</h3><span>Choose one</span></div>
            <label className="dt-field-label">Squad leader weapon<select disabled={ro} value={leaderWeapon} onChange={e => onUpdate({ leaderWeapon: e.target.value })}>{LEADER_WEAPONS.map(w => <option key={w}>{w}</option>)}</select></label>
            <p className="dt-option-note">Included in unit cost</p>
            <div className="dt-option-heading"><h3>Equipment</h3><span>Has its own options</span></div>
            <button type="button" className="dtu-drill" data-drill="signal" onClick={() => push('signal')}><Megaphone size={16} /><span><strong>Signal kit</strong><small>{signalLine}</small></span><b>{unit.signalKit ? '+5' : ''}</b><ChevronRight size={15} /></button>
          </> : level === 'signal' ? <>
            <div className="dt-option-heading"><h3>Signal kit</h3><span>Optional</span></div>
            <label className={`dt-checkbox-row ${unit.signalKit ? 'checked' : ''}`}><input type="checkbox" disabled={ro} checked={!!unit.signalKit} onChange={e => onUpdate({ signalKit: e.target.checked })} /><span><strong>Carry a signal kit</strong><small>The squad leader can pass orders along the line.</small></span><b>+5</b></label>
            <div className="dt-option-heading"><h3>Signal</h3><span>{unit.signalKit ? 'Choose one' : 'Take the kit first'}</span></div>
            <div className="dtu-radios" role="radiogroup" aria-label="Signal">{SIGNALS.map(s => { const on = (unit.signal ?? SIGNALS[0]) === s; return <label key={s} className={`dt-checkbox-row ${on && unit.signalKit ? 'checked' : ''}`}><input type="radio" name={`signal-${unit.id}`} checked={on} disabled={ro || !unit.signalKit} onChange={() => onUpdate({ signal: s })} /><span><strong>{s}</strong></span>{on && unit.signalKit ? <Check size={14} /> : null}</label>; })}</div>
          </> : tab === 'Options' ? <>
            <div className="dt-option-heading"><h3>Unit size</h3><span>{unit.models === 1 ? '1 model' : '1–20 models'}</span></div>
            <div className="dt-model-count"><div><Users size={16} /><span>{unit.models === 1 ? 'Commander' : 'Unit members'}</span></div><div className="dt-stepper"><button aria-label="Remove model" disabled={ro || unit.models <= 1} onClick={() => onUpdate({ models: unit.models - 1, points: unit.points - 12 })}><Minus size={12} /></button><b>{unit.models}</b><button aria-label="Add model" disabled={ro || unit.role === 'Command' || unit.models >= 20} onClick={() => onUpdate({ models: unit.models + 1, points: unit.points + 12 })}><Plus size={12} /></button></div></div>
            {/* DEC-054: Separate 1 always; Separate all only with Settings › Advanced › Enable Separate all. */}
            {unit.models > 1 && !ro && <div className="dtu-separate"><button type="button" className="dtp-btn small" disabled={ro} title="Make one model a unit of its own" onClick={() => onSeparate(false)}><Scissors size={13} />Separate 1</button>{separateAll && <button type="button" className="dtp-btn small" disabled={ro} title={`Split into ${unit.models} single-model units`} onClick={() => onSeparate(true)}><Scissors size={13} />Separate all</button>}</div>}
            {hasLeader(unit) && <><div className="dt-option-heading"><h3>Members</h3><span>Have their own options</span></div>
              <button type="button" className="dtu-drill" data-drill="leader" onClick={() => push('leader')}><UserRound size={16} /><span><strong>Squad leader</strong><small>1 of {unit.models} models · {leaderWeapon}{unit.signalKit ? ' · Signal kit' : ''}</small></span><b>{unit.signalKit ? '+5' : ''}</b><ChevronRight size={15} /></button></>}
            <div className="dt-option-heading"><h3>Equipment</h3><span>Choose one</span></div>
            <label className="dt-field-label">Primary weapon<select disabled={ro} value={unit.weapon} onChange={e => onUpdate({ weapon: e.target.value })}>{Array.from(new Set([unit.weapon, 'Service rifle', 'Scout carbine', 'Heavy carbine'])).map(w => <option key={w}>{w}</option>)}</select></label>
            <p className="dt-option-note">Included in unit cost</p>
            <div className="dt-option-heading"><h3>Upgrades</h3><span>Optional</span></div>
            <label className={`dt-checkbox-row ${unit.upgrade ? 'checked' : ''}`}><input type="checkbox" disabled={ro} checked={unit.upgrade} onChange={e => onUpdate({ upgrade: e.target.checked })} /><span><strong>Field standard</strong><small>Carry the detachment's colours.</small></span><b>+10</b></label>
            <div className="dt-option-heading"><h3>Unit notes</h3><span>Private</span></div>
            <textarea disabled={ro} aria-label="Unit notes" placeholder="A role, a reminder, a plan…" value={unit.notes ?? ''} onChange={e => onUpdate({ notes: e.target.value })} />
          </> : tab === 'Profile' ? <>
            <h3>Unit profile</h3><table className="dt-profile"><thead><tr>{['Move', 'Defence', 'Resolve', 'Health'].map(v => <th key={v}>{v}</th>)}</tr></thead><tbody><tr>{['6', '4+', '7', '1'].map((v, i) => <td key={i}>{v}</td>)}</tr></tbody></table>
            <h3>Equipment</h3><p>{unit.weapon}</p><p className="dt-option-note">Illustrative profile for the Open Field sample system.</p>
          </> : <>
            <h3>Steady advance</h3><p className="dt-rules">This unit may make a normal move and retain its formation bonus while within range of its commander.</p>
            <h3>Field standard</h3><p className="dt-rules">A unit carrying a field standard may re-roll one failed resolve test per round.</p>
          </>}
        </div>
      </div>
      <footer className="dt-inspector-foot dtu-foot"><span className="dtu-saved">{ro ? <><Lock size={12} />Not editable</> : <><Check size={12} />Changes save as you edit</>}</span><span className="dtu-source"><BookOpen size={13} /> {source}</span></footer>
    </section>
  </div>;
}
