import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowDownToLine, Check, CheckCircle2, ClipboardCopy, FileJson, FileText, Lock, Share } from 'lucide-react';
import { FORCE_TYPES, downloadFile, forceTypeBlocked, rosterText, unitCost, type ExportRoster, type Force, type ImportResult } from '../desktop/DesktopEditorFlows';
import { TabletSheet } from './TabletSheet';

// The editor's form sheets (T1c): the desktop dialogs with the mobile controls inside. Synthetic data only (DEC-001).

const FACTIONS = ['Frontier Coalition', 'Free Cities', 'Northern Realms'];

/** Add force: faction, name and force type (types the roster cannot take say why). */
export function AddForceSheet({ forces, limit, faction, onAdd, onClose }: { forces: Force[]; limit: number; faction: string; onAdd: (force: Omit<Force, 'id'>) => void; onClose: () => void }) {
  const available = FORCE_TYPES.filter(t => !forceTypeBlocked(t, forces, limit));
  const [type, setType] = useState(available[0]?.name ?? '');
  const [chosenFaction, setFaction] = useState(faction);
  const [name, setName] = useState('');
  const suggested = `${type || 'New'} ${forces.filter(f => f.type === type).length + 1}`;
  return <TabletSheet title="Add force" sub={`Forces in this roster: ${forces.length}`} onClose={onClose}
    action={{ label: 'Add force', disabled: !type, onClick: () => onAdd({ name: name.trim() || suggested, type, faction: chosenFaction }) }}>
    <p className="tbs-hint">Each force has its own units and points.</p>
    <div className="tbs-field-row">
      <label className="tbs-field">Faction<select value={chosenFaction} onChange={e => setFaction(e.target.value)}>{FACTIONS.map(f => <option key={f}>{f}</option>)}</select></label>
      <label className="tbs-field">Name<input maxLength={40} placeholder={suggested} value={name} onChange={e => setName(e.target.value)} /></label>
    </div>
    <h3 className="tbs-label" id="tbs-force-type">Force type</h3>
    <div className="tbs-choices" role="radiogroup" aria-labelledby="tbs-force-type">
      {FORCE_TYPES.map(t => {
        const blocked = forceTypeBlocked(t, forces, limit);
        return <button type="button" role="radio" key={t.name} aria-checked={type === t.name} aria-disabled={!!blocked || undefined} className={`tbs-choice ${type === t.name ? 'active' : ''}`} data-autofocus={type === t.name ? true : undefined}
          onClick={() => { if (!blocked) setType(t.name); }}>
          <span><strong>{t.name}</strong><small>{t.detail}</small>{blocked && <small className="reason"><Lock size={13} />{blocked}</small>}</span>{type === t.name && <Check size={20} />}
        </button>;
      })}
    </div>
    <p className="tbs-hint">Leave the name empty to use “{suggested}”.</p>
  </TabletSheet>;
}

/** One text field: rename the roster or a force. Enter saves; Save stays off while the name is empty or unchanged. */
export function RenameSheet({ title, label, value, maxLength = 60, hint, onSave, onClose }: { title: string; label: string; value: string; maxLength?: number; hint?: string; onSave: (name: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(value);
  const name = draft.trim();
  return <TabletSheet title={title} onClose={onClose} action={{ label: 'Save', disabled: !name || name === value, onClick: () => onSave(name) }}>
    <label className="tbs-field">{label}<input data-autofocus maxLength={maxLength} value={draft} onChange={e => setDraft(e.target.value)} onFocus={e => e.currentTarget.select()} /><span className="tbs-count">{draft.length} / {maxLength}</span></label>
    {hint && <p className="tbs-hint">{hint}</p>}
  </TabletSheet>;
}

/* ---------------------------------------------------------------- Export */

type Format = 'json' | 'text';
const FORMATS: Array<{ id: Format; label: string; detail: string; ext: string; icon: ReactNode }> = [
  { id: 'text', label: 'Text for sharing', detail: 'Plain text to paste into a message, forum or notes.', ext: 'txt', icon: <FileText size={22} /> },
  { id: 'json', label: 'Roster file', detail: 'The whole roster as a .json file. Opens in Battle Augur on any device.', ext: 'json', icon: <FileJson size={22} /> },
];

/** Export: pick the format, choose what text includes, check the preview, then Share (header), Copy or Save a file. */
export function ExportSheet({ roster, readOnly, onClose, notify }: { roster: ExportRoster; readOnly: boolean; onClose: () => void; notify: (text: string) => void }) {
  const [format, setFormat] = useState<Format>('text');
  const [rules, setRules] = useState(false);
  const [profiles, setProfiles] = useState(true);
  const meta = FORMATS.find(f => f.id === format)!;
  const fileName = `${roster.name}.${meta.ext}`;
  const output = useMemo(() => format === 'json' ? JSON.stringify(roster.file, null, 2) : rosterText(roster, rules, profiles), [format, roster, rules, profiles]);
  const size = new Blob([output]).size;
  const fixed = format === 'json';
  const done = (text: string) => { notify(text); onClose(); };
  const save = () => { downloadFile(fileName, output, format === 'json' ? 'application/json' : 'text/plain'); done(`Saved “${fileName}”`); };
  const copy = async () => { try { await navigator.clipboard.writeText(output); done(format === 'json' ? 'Roster file copied as text' : 'Roster text copied'); } catch { notify('Could not copy. Select the preview and copy it instead.'); } };
  // The share sheet of the system opens here; the prototype falls back to a toast.
  const share = async () => { try { if (navigator.share) { await navigator.share({ title: roster.name, text: output }); done(`Shared “${roster.name}”`); return; } } catch { return; } done(`Share sheet opens here (${meta.label.toLowerCase()})`); };
  return <TabletSheet title="Export roster" wide onClose={onClose} sub={<>{roster.name} · {roster.forces.length} {roster.forces.length === 1 ? 'force' : 'forces'} · {roster.total.toLocaleString()} pts</>}
    action={{ label: 'Share', icon: <Share size={18} />, onClick: share }}>
    {readOnly && <div className="tbs-note"><Lock size={16} />Read-only roster: it is exported as it was saved.</div>}
    <div className="tbs-export">
      <div className="tbs-export-side">
        <h3 className="tbs-label" id="tbs-format">Format</h3>
        <div className="tbs-choices" role="radiogroup" aria-labelledby="tbs-format">{FORMATS.map(f => <button type="button" role="radio" key={f.id} aria-checked={format === f.id} className={`tbs-choice ${format === f.id ? 'active' : ''}`} data-autofocus={format === f.id ? true : undefined} onClick={() => setFormat(f.id)}>
          <span className="tbs-choice-icon">{f.icon}</span><span><strong>{f.label}</strong><small>{f.detail}</small></span>{format === f.id && <Check size={20} />}</button>)}</div>
        <h3 className="tbs-label">Include</h3>
        <div className="tbs-options" role="group" aria-label="Include in the text">
          <Switch name="Rules" detail="Rule names on units and their text at the end" on={fixed || rules} disabled={fixed} onChange={() => setRules(v => !v)} />
          <Switch name="Profiles" detail="Each unit's characteristics" on={fixed || profiles} disabled={fixed} onChange={() => setProfiles(v => !v)} />
          {fixed && <p className="tbs-hint">The roster file always contains everything.</p>}
        </div>
      </div>
      <div className="tbs-export-preview">
        <div className="tbs-preview-head"><h3 className="tbs-label">Preview</h3><span>{fileName} · {size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`}</span></div>
        <pre className="tbs-pre" tabIndex={0} aria-label={`${meta.label} preview`}>{output}</pre>
        <div className="tbs-actions">
          <button type="button" className="tbs-action" onClick={copy}><ClipboardCopy size={18} />{format === 'json' ? 'Copy JSON' : 'Copy text'}</button>
          <button type="button" className="tbs-action" onClick={save}><ArrowDownToLine size={18} />Save file…</button>
        </div>
        <p className="tbs-hint">{format === 'json' ? 'Import this file on another device to keep editing.' : 'Copy and paste it where you share rosters.'}</p>
      </div>
    </div>
  </TabletSheet>;
}

/** A labelled on/off row (44 px+). */
function Switch({ name, detail, on, disabled, onChange }: { name: string; detail: string; on: boolean; disabled?: boolean; onChange: () => void }) {
  return <button type="button" role="switch" aria-checked={on} disabled={disabled} className="tbs-switch" onClick={onChange}><span><strong>{name}</strong><small>{detail}</small></span><i aria-hidden="true" /></button>;
}

/* ---------------------------------------------------------------- Import result */

/** What an imported file matched in the installed data, and what was left out. Open continues with what matched. */
export function ImportResultSheet({ result, version, onOpen, onClose }: { result: ImportResult; version: string; onOpen: () => void; onClose: () => void }) {
  const matched = result.units.length; const missing = result.unmatched.length;
  const points = result.units.reduce((n, u) => n + unitCost(u), 0);
  const filePoints = points + result.unmatched.reduce((n, u) => n + u.points, 0);
  return <TabletSheet title="Import roster" sub={result.fileName} onClose={onClose} action={{ label: missing ? `Open without ${missing === 1 ? 'it' : 'them'}` : 'Open roster', onClick: onOpen }}>
    <div className="tbs-import-roster"><span className="tb-mark" aria-hidden="true">{result.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span><span><strong>{result.name}</strong><small>{result.system} · {result.faction} · {result.forces.length} {result.forces.length === 1 ? 'force' : 'forces'}</small></span></div>
    {missing ? <div className="tbs-note warn" role="status"><AlertTriangle size={18} /><span><strong>{missing} {missing === 1 ? 'entry was' : 'entries were'} not found in {result.system} {version}</strong><small>The roster opens without {missing === 1 ? 'it' : 'them'}. Everything else matched; you can add replacements from the catalogue.</small></span></div>
      : <div className="tbs-note ok" role="status"><CheckCircle2 size={18} /><span><strong>Everything matched {result.system} {version}</strong><small>All {matched} entries are in the installed data.</small></span></div>}
    <dl className="tbs-stats"><div><dt>Matched</dt><dd>{matched}</dd></div><div><dt>Not found</dt><dd className={missing ? 'warn' : ''}>{missing}</dd></div><div><dt>Points</dt><dd>{points.toLocaleString()}{missing ? <small> of {filePoints.toLocaleString()}</small> : null}</dd></div></dl>
    {missing > 0 && <>
      <h3 className="tbs-label">Not in the installed data</h3>
      <ul className="tbs-rows">{result.unmatched.map(u => <li key={u.name + u.where}><span><strong>{u.name}</strong><small>{u.where} · {u.points} pts in the file</small></span><em>Not found</em></li>)}</ul>
      <p className="tbs-hint">A newer version of the game data may have them. Check Sources for updates.</p>
    </>}
  </TabletSheet>;
}
