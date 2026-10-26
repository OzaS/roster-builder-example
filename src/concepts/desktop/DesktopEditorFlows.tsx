import { useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowDownToLine, Check, CheckCircle2, ClipboardCopy, Copy, Database, FileJson, FileText, Flag, Lock, Pencil, Printer, Redo2, Search, Trash2, Undo2, X } from 'lucide-react';
import { formatCombo } from './desktopKeys';
import { Dialog, DialogHeader } from '../workspace/Dialog';
import './desktop-editor.css';

// Roster editor flows for the desktop prototype (revision 05): undo/redo history, several forces, export,
// import result, read-only rosters and validation details. Synthetic, game-neutral data only (DEC-001).

export type Role = 'Command' | 'Core' | 'Specialist' | 'Support';
export const ROLES: Role[] = ['Command', 'Core', 'Specialist', 'Support'];
export type EditorUnit = { id: number; name: string; role: string; models: number; points: number; weapon: string; upgrade: boolean; notes?: string; forceId?: string };
export type Force = { id: string; name: string; type: string; faction: string };
export type RosterDoc<U extends EditorUnit> = { units: U[]; forces: Force[] };
export type ReadOnlyInfo = { faction: string; system: string; sourceId: string };
export type ImportResult<U extends EditorUnit = EditorUnit> = { fileName: string; name: string; system: string; faction: string; limit: number; units: U[]; forces: Force[]; unmatched: Array<{ name: string; where: string; points: number }> };

export const PRIMARY_FORCE_ID = 'f1';
export const primaryForce = (type = 'Expedition force', faction = 'Frontier Coalition'): Force => ({ id: PRIMARY_FORCE_ID, name: type === 'Expedition force' ? 'Expedition detachment' : type, type, faction });
export type EditorFlowState = { kind: 'export' } | { kind: 'add-force' } | { kind: 'import'; result: ImportResult };
export const forceOf = (u: EditorUnit) => u.forceId ?? PRIMARY_FORCE_ID;
export const unitCost = (u: EditorUnit) => u.points + (u.upgrade ? 10 : 0);

/* ---------------------------------------------------------------- Force types */

export type ForceType = { name: string; detail: string; command: number; core: number; noSupport?: boolean; max?: number; minLimit?: number; needsAllies?: boolean };
export const FORCE_TYPES: ForceType[] = [
  { name: 'Expedition force', detail: 'Standard organisation · 1+ Command, 2+ Core', command: 1, core: 2, max: 1 },
  { name: 'Patrol', detail: 'Small and fast · 1+ Command, 1+ Core, no Support', command: 1, core: 1, noSupport: true },
  { name: 'Garrison', detail: 'Defensive · 2+ Core, extra Support, no Command needed', command: 0, core: 2 },
  { name: 'Vanguard', detail: 'Elite spearhead · 1+ Command, 1+ Specialist', command: 1, core: 0, minLimit: 1500 },
  { name: 'Allied detachment', detail: 'A force from an allied faction · 1+ Core', command: 0, core: 1, needsAllies: true },
];
const typeOf = (force: Force) => FORCE_TYPES.find(t => t.name === force.type) ?? FORCE_TYPES[0];
/** The requirement shown next to a group heading, e.g. "/ 2+". */
export const groupLimit = (force: Force, group: string) => { const t = typeOf(force); return group === 'Command' && t.command ? `/ ${t.command}+` : group === 'Core' && t.core ? `/ ${t.core}+` : group === 'Support' && t.noSupport ? '/ none' : ''; };
/** Why a force type cannot be added right now, or null. */
export function forceTypeBlocked(t: ForceType, forces: Force[], limit: number) {
  if (t.max && forces.filter(f => f.type === t.name).length >= t.max) return `Only ${t.max === 1 ? 'one' : t.max} ${t.name} per roster, and this roster has one.`;
  if (t.minLimit && limit > 0 && limit < t.minLimit) return `Needs a points limit of ${t.minLimit.toLocaleString()} or more (this roster has ${limit.toLocaleString()}).`;
  if (t.needsAllies) return 'Turn on “Allied detachment” in the roster configuration first.';
  return null;
}

/* ---------------------------------------------------------------- Undo / redo */

type Entry<U extends EditorUnit> = { id: number; doc: RosterDoc<U>; label: string; focus?: number; merge?: string };
export type HistoryStep = { label: string; focus?: number };
/** The roster document with an undo/redo history. Every edit names itself ("Add Line Infantry") for titles and toasts. */
export function useRosterHistory<U extends EditorUnit>(initial: RosterDoc<U>) {
  const state = useRef({ past: [] as Entry<U>[], present: initial, future: [] as Entry<U>[] });
  const nextId = useRef(1);
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const s = state.current;
  const undo = (): HistoryStep | null => {
    const { past, present, future } = state.current; const entry = past[past.length - 1]; if (!entry) return null;
    state.current = { past: past.slice(0, -1), present: entry.doc, future: [...future, { ...entry, doc: present }] }; rerender(); return entry;
  };
  const redo = (): HistoryStep | null => {
    const { past, present, future } = state.current; const entry = future[future.length - 1]; if (!entry) return null;
    state.current = { past: [...past, { ...entry, doc: present }], present: entry.doc, future: future.slice(0, -1) }; rerender(); return entry;
  };
  return {
    doc: s.present,
    /** The document right now, also straight after an edit/undo in the same event. */
    peek: () => state.current.present,
    undoLabel: s.past[s.past.length - 1]?.label,
    redoLabel: s.future[s.future.length - 1]?.label,
    /** Applies a change as one undo step; edits with the same `merge` key in a row (typing notes) stay one step. */
    edit(label: string, change: (doc: RosterDoc<U>) => RosterDoc<U>, options: { focus?: number; merge?: string } = {}) {
      const { past, present } = state.current;
      const top = past[past.length - 1];
      const merging = !!options.merge && top?.merge === options.merge;
      const id = merging ? top.id : nextId.current++;
      state.current = { past: merging ? past : [...past, { id, doc: present, label, ...options }], present: change(present), future: [] };
      rerender(); return id;
    },
    reset(doc: RosterDoc<U>) { state.current = { past: [], present: doc, future: [] }; rerender(); },
    undo, redo,
    /** Undo back to (and including) one step, e.g. from a toast's Undo after later edits. Later steps move to Redo. */
    undoStep(id: number) { let guard = 0; while (state.current.past.some(e => e.id === id) && guard++ < 200) undo(); },
    /** Whether a step can still be undone (a toast's Undo hides once it can't). */
    has(id: number) { return state.current.past.some(e => e.id === id); },
  };
}

export function HistoryButtons({ undoLabel, redoLabel, undoKey, redoKey, disabledReason, onUndo, onRedo }: { undoLabel?: string; redoLabel?: string; undoKey?: string; redoKey?: string; disabledReason?: string; onUndo: () => void; onRedo: () => void }) {
  const title = (verb: string, label: string | undefined, key?: string) => disabledReason ?? (label ? `${verb} “${label}”${key ? ` (${formatCombo(key)})` : ''}` : `Nothing to ${verb.toLowerCase()}`);
  return <span className="dte-history">
    <button type="button" className="dt-icon" aria-label={undoLabel ? `Undo ${undoLabel}` : 'Undo'} title={title('Undo', undoLabel, undoKey)} disabled={!undoLabel || !!disabledReason} onClick={onUndo}><Undo2 size={15} /></button>
    <button type="button" className="dt-icon" aria-label={redoLabel ? `Redo ${redoLabel}` : 'Redo'} title={title('Redo', redoLabel, redoKey)} disabled={!redoLabel || !!disabledReason} onClick={onRedo}><Redo2 size={15} /></button>
  </span>;
}

/** True while typing in a text field: ⌘Z there is the field's own text undo. */
export const isTextEntry = (el: EventTarget | null) => el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && !['checkbox', 'radio', 'button', 'range'].includes(el.type)) || (el instanceof HTMLElement && el.isContentEditable);

/* ---------------------------------------------------------------- Validation */

export type IssueTarget = { unitId?: number; forceId?: string; group?: string; summary?: boolean; banner?: boolean };
export type RosterIssue = { id: string; text: string; where: string; target: IssueTarget };
export function rosterIssues(units: EditorUnit[], forces: Force[], limit: number, readOnly: ReadOnlyInfo | null): RosterIssue[] {
  if (readOnly) return [{ id: 'read-only', text: `Not checked: ${readOnly.faction} is not in the installed data.`, where: 'Roster', target: { banner: true } }];
  const issues: RosterIssue[] = [];
  for (const force of forces) {
    const t = typeOf(force); const own = units.filter(u => forceOf(u) === force.id);
    const count = (role: string) => own.filter(u => u.role === role).length;
    if (count('Command') < t.command) issues.push({ id: `${force.id}-command`, text: `Add at least ${t.command === 1 ? 'one' : t.command} Command unit.`, where: `${force.name} › Command`, target: { forceId: force.id, group: 'Command' } });
    if (count('Core') < t.core) issues.push({ id: `${force.id}-core`, text: `Add at least ${t.core === 1 ? 'one' : 'two'} Core unit${t.core === 1 ? '' : 's'}.`, where: `${force.name} › Core`, target: { forceId: force.id, group: 'Core' } });
    if (t.minLimit && count('Specialist') < 1) issues.push({ id: `${force.id}-specialist`, text: 'Add at least one Specialist unit.', where: `${force.name} › Specialist`, target: { forceId: force.id, group: 'Specialist' } });
    if (t.noSupport) own.filter(u => u.role === 'Support').forEach(u => issues.push({ id: `${u.id}-support`, text: `${t.name} forces cannot take Support units.`, where: `${force.name} › Support › ${u.name}`, target: { unitId: u.id } }));
    own.filter(u => u.upgrade).slice(1).forEach(u => issues.push({ id: `${u.id}-standard`, text: 'Only one unit per force may carry a Field standard.', where: `${force.name} › ${u.role} › ${u.name}`, target: { unitId: u.id } }));
    own.filter(u => (u.role === 'Core' || u.role === 'Specialist') && u.models < 3).forEach(u => issues.push({ id: `${u.id}-size`, text: `Needs at least 3 models (has ${u.models}).`, where: `${force.name} › ${u.role} › ${u.name}`, target: { unitId: u.id } }));
  }
  const total = units.reduce((n, u) => n + unitCost(u), 0);
  if (limit > 0 && total > limit) issues.push({ id: 'limit', text: `Remove ${total - limit} points to meet the limit.`, where: 'Roster › Points limit', target: { summary: true } });
  return issues;
}

/** Issues about one unit (its row's issue icon narrows the popover's list to them). */
export const unitIssues = (issues: RosterIssue[], unitId: number) => issues.filter(issue => issue.target.unitId === unitId);

/**
 * DX-01: the issue list is an expanded section of the summary popover's status row (no strip under the tree). `unit`: the
 * list narrowed to one unit's issues (its row's issue icon), with All issues to widen it again.
 */
export function IssueDetails({ issues, onShow, unit, onAll }: { issues: RosterIssue[]; onShow: (issue: RosterIssue) => void; unit?: string; onAll?: () => void }) {
  if (unit) return <div className="dte-issue-section" id="dte-check-details">
    <p className="dte-issue-filter"><span>Issues of <strong>{unit}</strong></span><button type="button" className="dtp-btn small" title="Show every issue in the roster" onClick={onAll}>All issues</button></p>
    <IssueList issues={issues} onShow={onShow} />
  </div>;
  return <div className="dte-issue-section" id="dte-check-details"><IssueList issues={issues} onShow={onShow} /></div>;
}

function IssueList({ issues, onShow }: { issues: RosterIssue[]; onShow: (issue: RosterIssue) => void }) {
  if (!issues.length) return <div className="dt-check-details dte-checks"><p><Check size={13} /> Command requirement met</p><p><Check size={13} /> Minimum Core units met</p><p><Check size={13} /> Unit sizes and upgrades are allowed</p><p><Check size={13} /> Within points limit</p></div>;
  return <ul className="dt-check-details dte-checks" aria-label="Roster issues">
    {issues.map(issue => <li key={issue.id}><AlertTriangle size={14} /><span><strong>{issue.text}</strong><small>{issue.where}</small></span><button type="button" className="dtp-btn small" onClick={() => onShow(issue)} aria-label={`Show: ${issue.where}`}>Show</button></li>)}
  </ul>;
}

/** Scrolls to and briefly highlights a roster row or group after React has rendered it. */
export function revealInRoster(selector: string, focus = true) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>(selector); if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (focus) (el.matches('button') ? el : el.querySelector<HTMLElement>('button'))?.focus({ preventScroll: true });
    el.classList.remove('dte-flash'); void el.offsetWidth; el.classList.add('dte-flash');
  }));
}

/* ---------------------------------------------------------------- Forces in the roster centre */

export function ForceHeader({ force, points, units, active, showActive, canRemove, readOnlyReason, onSelect, onRename, onRemove }: { force: Force; points: number; units: number; active: boolean; showActive: boolean; canRemove: boolean; readOnlyReason?: string; onSelect: () => void; onRename: (name: string) => void; onRemove: () => void }) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(force.name);
  const finish = (save: boolean) => { const name = draft.trim(); if (save && name && name !== force.name) onRename(name); setRenaming(false); };
  return <div className={`dt-force-heading dte-force-heading ${active && showActive ? 'active' : ''}`} data-force={force.id}>
    <span className="dt-force-icon"><Flag size={18} /></span>
    {renaming ? <input className="dte-rename" autoFocus aria-label="Force name" maxLength={40} value={draft} onChange={e => setDraft(e.target.value)} onBlur={() => finish(true)} onKeyDown={e => { if (e.key === 'Enter') finish(true); if (e.key === 'Escape') { e.stopPropagation(); finish(false); } }} />
      : <button type="button" className="dte-force-name" onClick={onSelect} aria-pressed={showActive ? active : undefined} title={showActive ? (active ? 'The catalogue adds units to this force' : 'Add units from the catalogue to this force') : undefined}>
        <strong>{force.name}{active && showActive && <span className="dtp-chip accent">Adding here</span>}</strong><small>{force.type} · {force.faction} · {units} {units === 1 ? 'unit' : 'units'}</small>
      </button>}
    <span className="dte-force-tools">
      <button type="button" className="dt-icon" aria-label={`Rename ${force.name}`} title={readOnlyReason ?? 'Rename force'} disabled={!!readOnlyReason} onClick={() => { setDraft(force.name); setRenaming(true); }}><Pencil size={13} /></button>
      <button type="button" className="dt-icon" aria-label={`Remove ${force.name}`} title={readOnlyReason ?? (canRemove ? 'Remove force and its units' : 'A roster needs at least one force')} disabled={!!readOnlyReason || !canRemove} onClick={onRemove}><Trash2 size={13} /></button>
    </span>
    <span className="dte-force-points">{points} <small>pts</small></span>
  </div>;
}

export function CatalogueTarget({ forces, active, onChange }: { forces: Force[]; active: string; onChange: (id: string) => void }) {
  if (forces.length < 2) return null;
  return <label className="dte-target"><span>Add to</span><select aria-label="Add catalogue units to force" value={active} onChange={e => onChange(e.target.value)}>{forces.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>;
}

/* ---------------------------------------------------------------- Export */

export type ExportRoster = { name: string; limit: number; total: number; system: string; faction: string; forces: Array<Force & { points: number; units: EditorUnit[] }>; file: unknown };
type ExportFormat = 'json' | 'text' | 'html';
const FORMATS: Array<{ id: ExportFormat; label: string; detail: string; ext: string; icon: ReactNode }> = [
  { id: 'json', label: 'Roster file', detail: 'The whole roster as a .json file. Opens in Battle Augur on any device.', ext: 'json', icon: <FileJson size={17} /> },
  { id: 'text', label: 'Text for sharing', detail: 'Plain text to paste into a message, forum or notes.', ext: 'txt', icon: <FileText size={17} /> },
  { id: 'html', label: 'Print view', detail: 'A formatted page to print or save as PDF (.html).', ext: 'html', icon: <Printer size={17} /> },
];
const PROFILE = ['M 6', 'D 4+', 'R 7', 'H 1'];
const RULES: Record<string, string> = { 'Steady advance': 'This unit may make a normal move and keep its formation bonus while within range of its commander.', 'Field standard': 'A unit carrying a field standard may re-roll one failed resolve test per round.' };

export function rosterText(r: ExportRoster, rules: boolean, profiles: boolean) {
  const lines = [`${r.name} · ${r.total.toLocaleString()} / ${r.limit ? r.limit.toLocaleString() : '∞'} pts`, `${r.system} · ${r.faction}`, ''];
  for (const f of r.forces) {
    lines.push(`== ${f.name} (${f.type}) · ${f.points} pts ==`);
    for (const role of ROLES) {
      const own = f.units.filter(u => u.role === role); if (!own.length) continue;
      lines.push('', role);
      for (const u of own) {
        lines.push(`• ${u.name} [${unitCost(u)} pts]: ${u.models} ${u.models === 1 ? 'model' : 'models'}, ${u.weapon}${u.upgrade ? ', Field standard' : ''}`);
        if (profiles) lines.push(`    ${PROFILE.join(' · ')}`);
        if (rules) lines.push(`    Rules: Steady advance${u.upgrade ? ', Field standard' : ''}`);
        if (u.notes) lines.push(`    Note: ${u.notes}`);
      }
    }
    lines.push('');
  }
  if (rules) { lines.push('== Rules =='); for (const [name, text] of Object.entries(RULES)) lines.push(`${name}: ${text}`); lines.push(''); }
  lines.push('Made with Battle Augur');
  return lines.join('\n');
}
function rosterHtml(r: ExportRoster, rules: boolean, profiles: boolean) {
  const esc = (v: string) => v.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] ?? c));
  const body = r.forces.map(f => `<h2>${esc(f.name)} <small>${esc(f.type)} · ${f.points} pts</small></h2>` + f.units.map(u => `<p><b>${esc(u.name)}</b> ${unitCost(u)} pts<br>${u.models} models, ${esc(u.weapon)}${u.upgrade ? ', Field standard' : ''}${profiles ? `<br><small>${PROFILE.join(' · ')}</small>` : ''}</p>`).join('')).join('');
  const rulesBlock = rules ? `<h2>Rules</h2>${Object.entries(RULES).map(([n, t]) => `<p><b>${esc(n)}</b> ${esc(t)}</p>`).join('')}` : '';
  return `<!doctype html><meta charset="utf-8"><title>${esc(r.name)}</title><h1>${esc(r.name)}</h1><p>${esc(r.system)} · ${esc(r.faction)} · ${r.total} / ${r.limit || '∞'} pts</p>${body}${rulesBlock}`;
}
export function downloadFile(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

export function ExportDialog({ roster, readOnly, storedMode = false, formats, onClose, notify }: { roster: ExportRoster; readOnly: boolean; storedMode?: boolean; formats?: readonly ExportFormat[]; onClose: () => void; notify: (text: string) => void }) {
  const [format, setFormat] = useState<ExportFormat>('text');
  const [rules, setRules] = useState(false);
  const [profiles, setProfiles] = useState(true);
  const meta = FORMATS.find(f => f.id === format)!;
  const fileName = `${roster.name}.${meta.ext}`;
  const output = useMemo(() => format === 'json' ? JSON.stringify(roster.file, null, 2) : format === 'text' ? rosterText(roster, rules, profiles) : rosterHtml(roster, rules, profiles), [format, roster, rules, profiles]);
  const size = new Blob([output]).size;
  const save = () => { downloadFile(fileName, output, format === 'json' ? 'application/json' : format === 'html' ? 'text/html' : 'text/plain'); notify(`Saved “${fileName}”`); onClose(); };
  const copy = async () => { try { await navigator.clipboard.writeText(output); notify(format === 'json' ? 'Roster file copied as text' : 'Roster text copied'); onClose(); } catch { notify('Could not copy. Select the preview and copy it instead.'); } };
  const optionsReason = format === 'json' ? 'The roster file always contains everything.' : undefined;
  return <Dialog label="Export roster" wide onClose={onClose}>
    <DialogHeader title="Export roster" sub={<>{roster.name} · {roster.forces.length} {roster.forces.length === 1 ? 'force' : 'forces'} · {roster.total.toLocaleString()} pts{readOnly && <> · <Lock size={11} /> {storedMode ? 'as last saved' : 'read-only, exported as it was saved'}</>}</>} onClose={onClose} />
    <div className="dte-export">
      <div className="dte-export-side">
        <h3 className="dte-label" id="dte-format">Format</h3>
        <div className="dt-choice-list compact" role="radiogroup" aria-labelledby="dte-format">{FORMATS.filter(f => formats === undefined || formats.includes(f.id)).map(f => <button type="button" role="radio" aria-checked={format === f.id} key={f.id} className={format === f.id ? 'active' : ''} data-autofocus={format === f.id ? true : undefined} onClick={() => setFormat(f.id)}><span className="dte-choice-icon">{f.icon}</span><span><strong>{formats ? f.id === 'json' ? 'New Recruit JSON' : 'Text' : f.label}{storedMode ? ' · as last saved' : ''}</strong><small>{storedMode ? 'Uses the stored roster without installed game data.' : f.detail}</small></span>{format === f.id && <Check size={15} />}</button>)}</div>
        <h3 className="dte-label">Include</h3>
        <div className="dte-options" title={optionsReason}>
          <label className={optionsReason ? 'disabled' : ''}><input type="checkbox" checked={format === 'json' || rules} disabled={!!optionsReason} onChange={e => setRules(e.target.checked)} /><span><strong>Rules</strong><small>Rule names on units and their text at the end</small></span></label>
          <label className={optionsReason ? 'disabled' : ''}><input type="checkbox" checked={format === 'json' || profiles} disabled={!!optionsReason} onChange={e => setProfiles(e.target.checked)} /><span><strong>Profiles</strong><small>Each unit's characteristics</small></span></label>
          {optionsReason && <p className="dte-hint">{optionsReason}</p>}
        </div>
      </div>
      <div className="dte-export-preview">
        <div className="dte-preview-head"><span className="dte-label">Preview</span><span>{fileName} · {size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`}</span></div>
        {format === 'html' ? <div className="dte-paper" aria-label="Print view preview" tabIndex={0}><h4>{roster.name}</h4><p className="dte-paper-meta">{roster.system} · {roster.faction} · {roster.total} / {roster.limit || '∞'} pts</p>{roster.forces.map(f => <section key={f.id}><h5>{f.name}<span>{f.type} · {f.points} pts</span></h5>{f.units.map(u => <div key={u.id} className="dte-paper-unit"><b>{u.name}</b><span>{unitCost(u)} pts</span><small>{u.models} {u.models === 1 ? 'model' : 'models'}, {u.weapon}{u.upgrade ? ', Field standard' : ''}</small>{profiles && <em>{PROFILE.join(' · ')}</em>}</div>)}</section>)}{rules && <section><h5>Rules</h5>{Object.entries(RULES).map(([n, t]) => <p key={n}><b>{n}</b> {t}</p>)}</section>}</div>
          : <pre className="dte-pre" tabIndex={0} aria-label={`${meta.label} preview`}>{output}</pre>}
      </div>
    </div>
    <footer className="dte-foot"><span className="dte-hint">{format === 'html' ? 'Open the saved page in a browser to print it.' : format === 'json' ? 'Import this file on another device to keep editing.' : 'Copy and paste it where you share rosters.'}</span>
      <button type="button" className="dtp-btn" onClick={onClose}>Cancel</button>
      <button type="button" className="dtp-btn" disabled={format === 'html'} title={format === 'html' ? 'A print view is saved as a file' : undefined} onClick={copy}><ClipboardCopy size={14} />{format === 'json' ? 'Copy JSON' : 'Copy text'}</button>
      <button type="button" className="dtp-btn primary" onClick={save}><ArrowDownToLine size={14} />Save file…</button>
    </footer>
  </Dialog>;
}

/* ---------------------------------------------------------------- Import result */

/** Matches an imported prototype roster against the installed catalogue: names it does not know are left out. */
export function importResult<U extends EditorUnit>(fileName: string, data: { name: string; limit?: number; units: U[]; forces?: unknown }, known: string[]): ImportResult<U> {
  const forces = Array.isArray(data.forces) && data.forces.length && data.forces.every((f: Force) => typeof f?.id === 'string' && typeof f.name === 'string' && typeof f.type === 'string') ? (data.forces as Force[]).map(f => ({ ...f, faction: typeof f.faction === 'string' ? f.faction : 'Frontier Coalition' })) : [primaryForce()];
  const fid = (u: U) => forces.some(f => f.id === u.forceId) ? u.forceId! : forces[0].id;
  const nameOf = (id: string) => forces.find(f => f.id === id)?.name ?? '';
  const units = data.units.map(u => ({ ...u, forceId: fid(u) }));
  return {
    fileName, name: data.name, system: 'Open Field', faction: forces[0].faction, limit: Number.isFinite(data.limit) && (data.limit ?? 0) > 0 ? data.limit! : 1000, forces,
    units: units.filter(u => known.includes(u.name)),
    unmatched: units.filter(u => !known.includes(u.name)).map(u => ({ name: u.name, where: `${nameOf(u.forceId)} › ${u.role}`, points: unitCost(u) })),
  };
}
/** Gallery sample: a file from a newer data version with two entries the installed data does not have. */
export function sampleImport(partial: boolean): ImportResult {
  const forces = [primaryForce()];
  const units: EditorUnit[] = [
    { id: 1, name: 'Force Commander', role: 'Command', models: 1, points: 90, weapon: 'Command blade', upgrade: false, forceId: 'f1' },
    { id: 2, name: 'Line Infantry', role: 'Core', models: 10, points: 120, weapon: 'Service rifle', upgrade: true, forceId: 'f1' },
    { id: 3, name: 'Line Infantry', role: 'Core', models: 10, points: 120, weapon: 'Service rifle', upgrade: false, forceId: 'f1' },
    { id: 4, name: 'Recon Team', role: 'Core', models: 5, points: 85, weapon: 'Scout carbine', upgrade: false, forceId: 'f1' },
    { id: 5, name: 'Patrol Walker', role: 'Support', models: 1, points: 145, weapon: 'Twin autocannon', upgrade: false, forceId: 'f1' },
  ];
  return { fileName: 'harbour-raid.json', name: 'Harbour raid', system: 'Open Field', faction: 'Frontier Coalition', limit: 1000, forces, units,
    unmatched: partial ? [{ name: 'Siege Mortar', where: 'Expedition detachment › Support', points: 140 }, { name: 'Pathfinder Squad', where: 'Expedition detachment › Core', points: 95 }] : [] };
}

export function ImportDialog({ result, version, onOpen, onClose }: { result: ImportResult; version: string; onOpen: () => void; onClose: () => void }) {
  const matched = result.units.length; const missing = result.unmatched.length;
  const points = result.units.reduce((n, u) => n + unitCost(u), 0);
  const filePoints = points + result.unmatched.reduce((n, u) => n + u.points, 0);
  return <Dialog label="Import roster" onClose={onClose}>
    <DialogHeader title="Import roster" sub={result.fileName} onClose={onClose} />
    <div className="dte-import">
      <div className="dte-import-roster"><span className="dt-monogram">{result.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span><span><strong>{result.name}</strong><small>{result.system} · {result.faction} · {result.forces.length} {result.forces.length === 1 ? 'force' : 'forces'}</small></span></div>
      {missing ? <div className="dtp-notice warn" role="status"><AlertTriangle size={16} /><span><strong>{missing} {missing === 1 ? 'entry was' : 'entries were'} not found in {result.system} {version}</strong><small>The roster opens without {missing === 1 ? 'it' : 'them'}. Everything else matched; you can add replacements from the catalogue.</small></span></div>
        : <div className="dtp-notice ok" role="status"><CheckCircle2 size={16} /><span><strong>Everything matched {result.system} {version}</strong><small>All {matched} entries are in the installed data.</small></span></div>}
      <dl className="dte-import-stats"><div><dt>Matched</dt><dd>{matched}</dd></div><div><dt>Not found</dt><dd className={missing ? 'warn' : ''}>{missing}</dd></div><div><dt>Points</dt><dd>{points.toLocaleString()}{missing ? <small> of {filePoints.toLocaleString()}</small> : null}</dd></div></dl>
      {missing > 0 && <><h3 className="dte-label">Not in the installed data</h3><div className="dtp-rows">{result.unmatched.map(u => <div className="dtp-collection-row" key={u.name + u.where}><span><strong>{u.name}</strong><small>{u.where} · {u.points} pts in the file</small></span><span className="dtp-chip warn">Not found</span></div>)}</div><p className="dte-hint">A newer version of the game data may have them. Check Sources for updates.</p></>}
    </div>
    <footer className="dte-foot"><span />
      <button type="button" className="dtp-btn" onClick={onClose}>Cancel</button>
      <button type="button" className="dtp-btn primary" data-autofocus onClick={onOpen}>{missing ? `Open without ${missing === 1 ? 'it' : 'them'}` : 'Open roster'}</button>
    </footer>
  </Dialog>;
}

/* ---------------------------------------------------------------- Add force */

const FACTIONS = ['Frontier Coalition', 'Free Cities', 'Northern Realms'];
export function AddForceDialog({ forces, limit, faction, onAdd, onClose }: { forces: Force[]; limit: number; faction: string; onAdd: (force: Omit<Force, 'id'>) => void; onClose: () => void }) {
  const available = FORCE_TYPES.filter(t => !forceTypeBlocked(t, forces, limit));
  const [type, setType] = useState(available[0]?.name ?? '');
  const [chosenFaction, setFaction] = useState(faction);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const suggested = `${type || 'New'} ${forces.filter(f => f.type === type).length + 1}`;
  const shown = FORCE_TYPES.filter(t => `${t.name} ${t.detail}`.toLowerCase().includes(query.toLowerCase()));
  const add = () => { if (type) onAdd({ name: name.trim() || suggested, type, faction: chosenFaction }); };
  return <Dialog label="Add force" onClose={onClose}>
    <DialogHeader title="Add force" sub={`Forces in this roster: ${forces.length}. Each has its own units and points.`} onClose={onClose} />
    <form className="dte-form" onSubmit={e => { e.preventDefault(); add(); }}>
      <div className="dte-addforce">
      <div className="dte-row2">
        <label className="dt-field-label dte-field">Faction<select value={chosenFaction} onChange={e => setFaction(e.target.value)}>{FACTIONS.map(f => <option key={f}>{f}</option>)}</select></label>
        <label className="dt-field-label dte-field">Name<input maxLength={40} placeholder={suggested} value={name} onChange={e => setName(e.target.value)} /></label>
      </div>
      <div className="dte-type-head"><h3 className="dte-label" id="dte-force-type">Force type</h3><label className="dtp-search dte-search"><Search size={13} /><input placeholder="Filter…" aria-label="Filter force types" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
      <div className="dt-choice-list compact" role="radiogroup" aria-labelledby="dte-force-type">
        {shown.map(t => { const blocked = forceTypeBlocked(t, forces, limit); return <button type="button" role="radio" key={t.name} aria-checked={type === t.name} aria-disabled={!!blocked || undefined} className={`${type === t.name ? 'active' : ''} ${blocked ? 'blocked' : ''}`} data-autofocus={type === t.name ? true : undefined} title={blocked ?? undefined} onClick={() => !blocked && setType(t.name)}>
          <span><strong>{t.name}</strong><small>{t.detail}</small>{blocked && <small className="dte-reason"><Lock size={11} />{blocked}</small>}</span>{type === t.name && <Check size={15} />}
        </button>; })}
        {!shown.length && <p className="dte-hint">No force types match.</p>}
      </div>
      </div>
      <footer className="dte-foot"><span className="dte-hint">Leave the name empty to use “{suggested}”.</span><button type="button" className="dtp-btn" onClick={onClose}>Cancel</button><button type="submit" className="dtp-btn primary" disabled={!type}>Add force</button></footer>
    </form>
  </Dialog>;
}

/* ---------------------------------------------------------------- Read-only */

export const readOnlyReason = (info: ReadOnlyInfo) => `Read-only: ${info.faction} is not in the installed ${info.system} data`;
export function ReadOnlyBanner({ info, onDuplicate, onFindData, onExport }: { info: ReadOnlyInfo; onDuplicate: () => void; onFindData: () => void; onExport: () => void }) {
  return <section className="dte-readonly" id="dte-readonly" tabIndex={-1} role="region" aria-label="Read-only roster">
    <Lock size={17} />
    <div><strong>This roster is read-only</strong><p>{info.faction} was removed from the installed {info.system} data, so its units can't be checked or changed. The roster is kept as it was saved.</p>
      <div className="dte-readonly-actions"><button type="button" className="dtp-btn small primary" onClick={onDuplicate}><Copy size={13} />Duplicate to edit</button><button type="button" className="dtp-btn small" onClick={onFindData}><Database size={13} />Find game data</button><button type="button" className="dtp-btn small" onClick={onExport}><ArrowDownToLine size={13} />Export as it was</button></div>
    </div>
  </section>;
}
export function ReadOnlyCatalogue({ info, onFindData, onHide }: { info: ReadOnlyInfo; onFindData: () => void; onHide: () => void }) {
  return <aside className="dt-catalogue" aria-label="Unit catalogue"><header className="dt-panel-heading dte-pane-tools"><button type="button" className="dt-icon" aria-label="Hide catalogue" title="Hide catalogue" onClick={onHide}><X size={15} /></button></header>
    <div className="dte-catalogue-empty"><Lock size={22} /><h3>Nothing to add</h3><p>{info.faction} is not in the installed {info.system} data, so its units can't be added.</p><button type="button" className="dtp-btn small" onClick={onFindData}><Database size={13} />Find game data</button></div>
    <footer className="dt-panel-foot"><Database size={12} /> {info.faction} <span>removed</span></footer></aside>;
}

/* ---------------------------------------------------------------- Sample rosters and gallery states */

/** Fixed sample snapshots that need more than one force or open read-only. */
export function specialRoster(name: string): { units: EditorUnit[]; forces: Force[]; limit: number; faction: string; force: string; readOnly: ReadOnlyInfo | null } | null {
  if (name === 'Ember patrol') return { limit: 500, faction: 'Ember Covenant', force: 'Patrol', readOnly: { faction: 'Ember Covenant', system: 'Example System Two', sourceId: 'system-two' },
    forces: [{ id: 'f1', name: 'Ember patrol', type: 'Patrol', faction: 'Ember Covenant' }],
    units: [
      { id: 1, name: 'Covenant Herald', role: 'Command', models: 1, points: 95, weapon: 'Ember staff', upgrade: false, forceId: 'f1' },
      { id: 2, name: 'Cinder Guard', role: 'Core', models: 6, points: 130, weapon: 'Brand spear', upgrade: false, forceId: 'f1' },
      { id: 3, name: 'Ash Runners', role: 'Core', models: 5, points: 115, weapon: 'Short bow', upgrade: false, forceId: 'f1' },
    ] };
  if (name === 'Harbour defence' || name === 'Two forces') return { limit: 1000, faction: 'Free Cities', force: 'Garrison', readOnly: null,
    forces: [{ id: 'f1', name: 'Harbour garrison', type: 'Garrison', faction: 'Free Cities' }, { id: 'f2', name: 'Shore patrol', type: 'Patrol', faction: 'Free Cities' }],
    units: [
      { id: 1, name: 'Line Infantry', role: 'Core', models: 10, points: 120, weapon: 'Service rifle', upgrade: true, forceId: 'f1' },
      { id: 2, name: 'Line Infantry', role: 'Core', models: 10, points: 120, weapon: 'Service rifle', upgrade: false, forceId: 'f1' },
      { id: 3, name: 'Support Battery', role: 'Support', models: 3, points: 180, weapon: 'Field cannon', upgrade: false, forceId: 'f1' },
      { id: 4, name: 'Support Battery', role: 'Support', models: 3, points: 180, weapon: 'Field cannon', upgrade: false, forceId: 'f1' },
      { id: 5, name: 'Field Marshal', role: 'Command', models: 1, points: 115, weapon: 'Service rifle', upgrade: false, forceId: 'f2' },
      { id: 6, name: 'Recon Team', role: 'Core', models: 5, points: 85, weapon: 'Scout carbine', upgrade: false, forceId: 'f2' },
      { id: 7, name: 'Patrol Walker', role: 'Support', models: 1, points: 145, weapon: 'Twin autocannon', upgrade: false, forceId: 'f2' },
      { id: 8, name: 'Recon Team', role: 'Core', models: 5, points: 85, weapon: 'Scout carbine', upgrade: false, forceId: 'f2' },
    ] };
  return null;
}

export type GalleryFlow = 'export' | 'import' | 'import-partial' | 'add-force' | 'forces' | 'read-only' | 'issues';
/** `?desktop=editor&flow=…` opens a flow directly on the standalone link. */
export function galleryFlow(): GalleryFlow | null {
  const params = new URLSearchParams(location.search);
  const flow = params.has('desktop') ? params.get('flow') : null;
  return flow && ['export', 'import', 'import-partial', 'add-force', 'forces', 'read-only', 'issues'].includes(flow) ? flow as GalleryFlow : null;
}
export const GALLERY_STATES: Array<{ id: GalleryFlow; label: string }> = [
  { id: 'export', label: 'Export dialog' },
  { id: 'import', label: 'Import result: everything matched' },
  { id: 'import-partial', label: 'Import result: parts did not match' },
  { id: 'forces', label: 'Roster with two forces' },
  { id: 'add-force', label: 'Add force dialog' },
  { id: 'read-only', label: 'Read-only roster (faction removed)' },
  { id: 'issues', label: 'Issue list in the roster summary' },
];
