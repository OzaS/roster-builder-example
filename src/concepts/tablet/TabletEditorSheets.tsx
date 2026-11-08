import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowDownToLine, Check, CheckCircle2, ClipboardCopy, FileJson, FileText, FileType, Lock, Printer } from 'lucide-react';
import { FORCE_TYPES, JSON_FILE_LINE, NEEDS_GAME_DATA, PAPERS, PaperPreview, forceTypeBlocked, needsGameData, pdfPages, rosterText, sizeLabel, unitCost, type ExportFormat, type ExportRoster, type Force, type ImportResult, type Paper } from '../desktop/DesktopEditorFlows';
import { TabletSheet } from './TabletSheet';
import { WorkspaceScope } from './TabletPieces';
import { Segmented } from '../workspace/Primitives';
import { StarDivider, StarRow, starredFirst, useStars } from '../workspace/Stars';

// The editor's form sheets (T1c): the desktop dialogs with the mobile controls inside. Synthetic data only (DEC-001).

const FACTIONS = ['Frontier Coalition', 'Free Cities', 'Northern Realms'];

/** Add force: faction and force type (types the roster cannot take say why). A force takes its name from the data (TB-09:
 *  the app has no force name field). */
export function AddForceSheet({ forces, limit, faction, stars = false, onAdd, onClose }: { forces: Force[]; limit: number; faction: string;
  /** R2-03 (F4c, approved 2026-11-08): stars before the force names, starred forces first, then a divider (gallery: two starred). */
  stars?: boolean;
  onAdd: (force: Omit<Force, 'id'>) => void; onClose: () => void }) {
  const available = FORCE_TYPES.filter(t => !forceTypeBlocked(t, forces, limit));
  const forceStars = useStars(stars ? ['Expedition force', 'Garrison'] : []);
  const { starred, rest } = starredFirst(FORCE_TYPES, t => t.name, forceStars.stars);
  const [type, setType] = useState(available[0]?.name ?? '');
  const [chosenFaction, setFaction] = useState(faction);
  const named = `${type || 'New'} ${forces.filter(f => f.type === type).length + 1}`;
  return <TabletSheet title="Add force" sub={`Forces in this roster: ${forces.length}`} onClose={onClose}
    action={{ label: 'Add force', disabled: !type, onClick: () => onAdd({ name: named, type, faction: chosenFaction }) }}>
    <p className="tbs-hint">Each force has its own units and points.</p>
    <label className="tbs-field">Faction<select value={chosenFaction} onChange={e => setFaction(e.target.value)}>{FACTIONS.map(f => <option key={f}>{f}</option>)}</select></label>
    <h3 className="tbs-label" id="tbs-force-type">Force type</h3>
    <div className="tbs-choices" role="radiogroup" aria-labelledby="tbs-force-type">
      {[...starred, ...(starred.length && rest.length ? ['divider' as const] : []), ...rest].map(t => {
        if (t === 'divider') return <StarDivider key="star-divider" />;
        const blocked = forceTypeBlocked(t, forces, limit);
        const choice = <button type="button" role="radio" key={t.name} aria-checked={type === t.name} aria-disabled={!!blocked || undefined} className={`tbs-choice ${type === t.name ? 'active' : ''}`} data-autofocus={type === t.name ? true : undefined}
          onClick={() => { if (!blocked) setType(t.name); }}>
          <span><strong>{t.name}</strong><small>{t.detail}</small>{blocked && <small className="reason"><Lock size={13} />{blocked}</small>}</span>{type === t.name && <Check size={20} />}
        </button>;
        // A starred force keeps its state (a type the roster cannot take still says why).
        return stars ? <StarRow key={t.name} name={t.name} on={forceStars.isStarred(t.name)} onToggle={() => forceStars.toggle(t.name)}>{choice}</StarRow> : choice;
      })}
    </div>
  </TabletSheet>;
}

/** One text field: rename the roster, a force or a unit (R2-02). Enter saves; Save stays off while the name is unchanged, and
 *  while it is empty, except for a unit (`restores`): an empty name gives it its entry name back ("Empty restores “…”."). */
export function RenameSheet({ title, label, value, maxLength = 60, hint, restores, onSave, onClose }: { title: string; label: string; value: string; maxLength?: number; hint?: string; restores?: string; onSave: (name: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(value);
  const name = draft.trim();
  const disabled = restores === undefined ? !name || name === value : (name || restores) === value;
  return <TabletSheet title={title} onClose={onClose} action={{ label: 'Save', disabled, onClick: () => onSave(name) }}>
    <label className="tbs-field">{label}<input data-autofocus maxLength={maxLength} value={draft} onChange={e => setDraft(e.target.value)} onFocus={e => e.currentTarget.select()} onKeyDown={e => { if (e.key === 'Enter' && !disabled) onSave(name); }} /><span className="tbs-count">{draft.length} / {maxLength}</span></label>
    {restores !== undefined && <p className="tbs-hint">Empty restores “{restores}”.</p>}
    {hint && <p className="tbs-hint">{hint}</p>}
  </TabletSheet>;
}

/* ---------------------------------------------------------------- Export */

/** F3 (approved 2026-11-06): four formats; Print view and PDF share the print document. */
const FORMATS: Array<{ id: ExportFormat; label: string; detail: string; ext: string; icon: ReactNode }> = [
  { id: 'text', label: 'Text for sharing', detail: 'Plain text to paste into a message, forum or notes.', ext: 'txt', icon: <FileText size={22} /> },
  { id: 'json', label: 'Roster file', detail: 'The whole roster as a .json file.', ext: 'json', icon: <FileJson size={22} /> },
  { id: 'html', label: 'Print view', detail: 'A formatted page to print or save as PDF (.html).', ext: 'html', icon: <Printer size={22} /> },
  { id: 'pdf', label: 'PDF', detail: 'A document to print or send (.pdf).', ext: 'pdf', icon: <FileType size={22} /> },
];

/** Export: pick the format (Include for Print view and PDF, Paper for PDF), check the preview (the file panel for the roster file),
 *  then Share (header) or Save file… under the preview, with Copy text / Copy JSON beside it for Text and the roster file. Copy closes
 *  the sheet with a toast; Save file… opens the system save picker (iOS Save to Files, Android "save as"). A read-only roster has no
 *  game data, so Print view and PDF are disabled with "Needs the game data". */
export function ExportSheet({ roster, readOnly, light = false, initialFormat = 'text', onClose, notify }: { roster: ExportRoster; readOnly: boolean; light?: boolean; initialFormat?: ExportFormat; onClose: () => void; notify: (text: string) => void }) {
  const [format, setFormat] = useState<ExportFormat>(readOnly && needsGameData(initialFormat) ? 'text' : initialFormat);
  const [rules, setRules] = useState(true);
  const [profiles, setProfiles] = useState(true);
  const [paper, setPaper] = useState<Paper>('A4');
  const meta = FORMATS.find(f => f.id === format)!;
  const fileName = `${roster.name}.${meta.ext}`;
  const printable = needsGameData(format);
  const output = useMemo(() => format === 'json' ? JSON.stringify(roster.file, null, 2) : rosterText(roster, false, false), [format, roster]);
  // The print document is about 18 KB plus 1.5 KB a unit in the gallery (the real one embeds its styles).
  const size = printable ? 18000 + roster.forces.reduce((n, f) => n + f.units.length, 0) * 1500 + (rules ? 2000 : 0) : new Blob([output]).size;
  const done = (text: string) => { notify(text); onClose(); };
  const copy = async () => { try { await navigator.clipboard.writeText(output); done(format === 'json' ? 'Roster file copied as text' : 'Roster text copied'); } catch { notify('Could not copy. Select the preview and copy it instead.'); } };
  // The share sheet and the save picker of the system open here; the prototype falls back to a toast.
  const share = async () => { try { if (navigator.share && !printable) { await navigator.share({ title: roster.name, text: output }); done(`Shared “${roster.name}”`); return; } } catch { return; } done(`Share sheet opens here (${meta.label.toLowerCase()})`); };
  const save = () => notify(`The system save picker opens here for “${fileName}”`);
  return <TabletSheet title="Export roster" wide onClose={onClose} sub={<>{roster.name} · {roster.forces.length} {roster.forces.length === 1 ? 'force' : 'forces'} · {roster.total.toLocaleString()} pts</>}
    action={{ label: 'Share', onClick: share }}>
    {readOnly && <div className="tbs-note"><Lock size={16} />Read-only roster: it is exported as it was saved.</div>}
    <div className="tbs-export">
      <div className="tbs-export-side">
        <h3 className="tbs-label" id="tbs-format">Format</h3>
        <div className="tbs-choices" role="radiogroup" aria-labelledby="tbs-format">{FORMATS.map(f => {
          const blocked = readOnly && needsGameData(f.id);
          return <button type="button" role="radio" key={f.id} aria-checked={format === f.id} aria-disabled={blocked || undefined} className={`tbs-choice ${format === f.id ? 'active' : ''}`} data-autofocus={format === f.id ? true : undefined} onClick={() => { if (!blocked) setFormat(f.id); }}>
            <span className="tbs-choice-icon">{f.icon}</span><span><strong>{f.label}</strong><small>{f.detail}</small>{blocked && <small className="reason"><Lock size={13} />{NEEDS_GAME_DATA}</small>}</span>{format === f.id && <Check size={20} />}</button>;
        })}</div>
        {printable && <>
          <h3 className="tbs-label">Include</h3>
          <div className="tbs-choices">
            <button type="button" role="switch" aria-checked={rules} className="tbs-switch" onClick={() => setRules(!rules)}><span><strong>Rules</strong><small>Rule names on units, their text at the end</small></span><i aria-hidden /></button>
            <button type="button" role="switch" aria-checked={profiles} className="tbs-switch" onClick={() => setProfiles(!profiles)}><span><strong>Profiles</strong><small>Each unit's characteristics</small></span><i aria-hidden /></button>
          </div>
        </>}
        {format === 'pdf' && <div className="tbs-paper"><h3 className="tbs-label" id="tbs-paper">Paper</h3>
          <WorkspaceScope light={light}><Segmented<Paper> label="Paper" value={paper} onChange={setPaper} options={PAPERS.map(p => ({ value: p, label: p }))} /></WorkspaceScope></div>}
      </div>
      <div className="tbs-export-preview">
        {format === 'json' ? <>
          <div className="tbs-preview-head"><h3 className="tbs-label">File</h3></div>
          <div className="tbs-file"><FileJson size={24} /><span><strong>{fileName} · {sizeLabel(size)}</strong><small>{JSON_FILE_LINE}</small></span></div>
        </> : <>
          <div className="tbs-preview-head"><h3 className="tbs-label">Preview</h3><span>{format === 'pdf' ? `${fileName} · ${pdfPages(roster, rules, paper)} pages` : `${fileName} · ${sizeLabel(size)}`}</span></div>
          {printable ? <PaperPreview roster={roster} rules={rules} profiles={profiles} label={format === 'pdf' ? 'PDF preview' : 'Print view preview'} className="tbs-paper-preview" />
            : <pre className="tbs-pre" tabIndex={0} aria-label={`${meta.label} preview`}>{output}</pre>}
        </>}
        <div className="tbs-actions">
          <button type="button" className="tbs-action" onClick={save}><ArrowDownToLine size={18} />Save file…</button>
          {!printable && <button type="button" className="tbs-action" onClick={copy}><ClipboardCopy size={18} />{format === 'json' ? 'Copy JSON' : 'Copy text'}</button>}
        </div>
        <p className="tbs-hint">{format === 'html' ? 'Open the saved page in a browser to print it.' : format === 'pdf' ? 'Opens in any PDF reader and prints as shown.' : format === 'json' ? 'Import this file on another device to keep editing.' : 'Copy and paste it where you share rosters.'}</p>
      </div>
    </div>
  </TabletSheet>;
}

/* ---------------------------------------------------------------- Import result */

/** What an imported file matched in the installed data, and what was left out. The roster is saved before this shows, so
 *  the leading button is Close and the action is always Open roster (TB-09, as the desktop's DD-12). */
export function ImportResultSheet({ result, version, onOpen, onClose }: { result: ImportResult; version: string; onOpen: () => void; onClose: () => void }) {
  const matched = result.units.length; const missing = result.unmatched.length;
  const points = result.units.reduce((n, u) => n + unitCost(u), 0);
  return <TabletSheet title="Import roster" sub={result.fileName} cancelLabel="Close" onClose={onClose} action={{ label: 'Open roster', onClick: onOpen }}>
    <div className="tbs-import-roster"><span className="tb-mark" aria-hidden="true">{result.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span><span><strong>{result.name}</strong><small>{result.system} · {result.faction} · {result.forces.length} {result.forces.length === 1 ? 'force' : 'forces'}</small></span></div>
    {missing ? <div className="tbs-note warn" role="status"><AlertTriangle size={18} /><span><strong>{missing} {missing === 1 ? 'entry was' : 'entries were'} not found in {result.system} {version}</strong><small>The roster is saved without {missing === 1 ? 'it' : 'them'}. Everything else matched; you can add replacements from the catalogue.</small></span></div>
      : <div className="tbs-note ok" role="status"><CheckCircle2 size={18} /><span><strong>Everything matched {result.system} {version}</strong><small>All {matched} entries are in the installed data.</small></span></div>}
    <dl className="tbs-stats"><div><dt>Units</dt><dd>{matched}</dd></div><div><dt>Not found</dt><dd className={missing ? 'warn' : ''}>{missing}</dd></div><div><dt>Points</dt><dd>{points.toLocaleString()}{result.limit ? <small> / {result.limit.toLocaleString()} pts</small> : null}</dd></div></dl>
    {missing > 0 && <>
      <h3 className="tbs-label">Not in the installed data</h3>
      <ul className="tbs-rows">{result.unmatched.map(u => <li key={u.name + u.where}><span><strong>{u.name}</strong><small>{u.where} · {u.points} pts in the file</small></span><em>Not found</em></li>)}</ul>
      <p className="tbs-hint">A newer version of the game data may have them. Check Sources for updates.</p>
    </>}
  </TabletSheet>;
}
