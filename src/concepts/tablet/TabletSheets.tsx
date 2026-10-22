import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowDownToLine, Check, CheckCircle2, Github, Layers3, LibraryBig, LoaderCircle, Lock, Search, Trash2, Upload } from 'lucide-react';
import { FORCE_TYPES, type EditorUnit, type Force } from '../desktop/DesktopEditorFlows';
import { flowStore, readLink, setFlowStore, titleCase, type AddPhase } from '../desktop/DesktopSourceFlows';
import { githubRepositories, sourceCollections } from '../desktop/desktopData';
import type { Job, WorkspaceJobs } from '../workspace/Jobs';
import type { Notify } from '../workspace/Toasts';
import { TabletSheet } from './TabletSheet';
import type { AppearanceImport, AppearanceOutcome, TabletSession } from './tabletSession';
import './tablet-dialogs.css';

// The tablet's other form sheets (T3). They cover the whole window (rail included) and work at both tablet widths and in
// split view (TabletSheet): the install's faction picker, add a collection, appearance imports, move unit and a generic
// confirm sheet. Synthetic data only (DEC-001).

const plural = (n: number, one: string, other = `${one}s`) => `${n} ${n === 1 ? one : other}`;

/* ---------------------------------------------------------------- Confirm */

/** Generic confirmation: say what happens, what it costs, and name the action ("Delete roster", not "OK"). Destructive ones use the error colour. */
export function ConfirmSheet({ title, sub, headline, text, confirmLabel, cancelLabel, destructive = false, children, onConfirm, onClose }: {
  title: string; sub?: ReactNode; headline: string; text: ReactNode; confirmLabel: string; cancelLabel?: string; destructive?: boolean; children?: ReactNode;
  onConfirm: () => void; onClose: () => void;
}) {
  return <TabletSheet title={title} sub={sub} cancelLabel={cancelLabel} onClose={onClose} action={{ label: confirmLabel, destructive, icon: destructive ? <Trash2 size={18} /> : undefined, onClick: onConfirm }}>
    {children}
    <div className={`tbs-note ${destructive ? 'warn' : ''}`} role="alert"><AlertTriangle size={18} /><span><strong>{headline}</strong><small>{text}</small></span></div>
  </TabletSheet>;
}

/* ---------------------------------------------------------------- Faction picker */

/** Advanced installation only (DEC-022): the install pauses and asks which factions to import. Choose later leaves it waiting. */
function FactionPickerSheet({ job, onChoose, onLater, onCancelInstall }: { job: Job; onChoose: (chosen: string[]) => void; onLater: () => void; onCancelInstall: () => void }) {
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<string[]>(job.factions.slice(0, 1));
  const shown = job.factions.filter(f => f.toLowerCase().includes(query.trim().toLowerCase()));
  const all = chosen.length === job.factions.length;
  return <TabletSheet title="Choose factions" sub={`${job.name} · ${job.size}`} cancelLabel="Choose later" onClose={onLater}
    action={{ label: `Install ${plural(chosen.length, 'faction')}`, disabled: !chosen.length, onClick: () => onChoose(chosen) }}>
    <p className="tbs-hint">The install is paused. Install only the factions you play; you can add the others later from the source.</p>
    {job.factions.length > 4 && <label className="tbs-field">Find a faction<input type="search" placeholder="Find a faction…" value={query} onChange={e => setQuery(e.target.value)} /></label>}
    <div className="tbd-tools"><span aria-live="polite">{chosen.length} of {job.factions.length} selected</span><button type="button" className="tbs-action" onClick={() => setChosen(all ? [] : job.factions)}>{all ? 'Select none' : 'Select all'}</button></div>
    <div className="tbs-choices tbd-checks" role="group" aria-label="Factions">
      {shown.map((f, i) => { const on = chosen.includes(f); return <button type="button" role="checkbox" key={f} aria-checked={on} className={`tbs-choice ${on ? 'active' : ''}`} data-autofocus={i === 0 ? true : undefined} onClick={() => setChosen(c => on ? c.filter(x => x !== f) : [...c, f])}>
        <span className="tbs-choice-icon tbd-box" aria-hidden="true">{on && <Check size={15} strokeWidth={3} />}</span><span><strong>{f}</strong></span></button>; })}
      {!shown.length && <p className="tbs-note"><Search size={16} />No factions match “{query.trim()}”.</p>}
    </div>
    <p className="tbs-note"><Layers3 size={16} /><span>Advanced installation is on. Turn it off in Settings to install every faction without asking.</span></p>
    <div className="tbs-actions"><button type="button" className="tbs-action tbd-danger" onClick={onCancelInstall}>Cancel install</button></div>
  </TabletSheet>;
}

/* ---------------------------------------------------------------- Add a collection */

/** Paste a collection file link or a GitHub organisation, check what it is, then add it. A repository link offers to install it instead. */
function AddCollectionSheet({ jobs, notify, go, onOpenJobs, onClose }: { jobs: WorkspaceJobs; notify: Notify; go: (detail: string) => void; onOpenJobs: () => void; onClose: () => void }) {
  const [value, setValue] = useState('');
  const [phase, setPhase] = useState<AddPhase>({ kind: 'idle' });
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const find = (link = value, offline = false) => {
    clearTimeout(timer.current);
    if (!link.trim()) return;
    const next = readLink(link);
    if (next.kind !== 'found' && !offline) return setPhase(next);
    setPhase({ kind: 'finding' });
    timer.current = window.setTimeout(() => setPhase(offline ? { kind: 'error', text: 'GitHub did not answer. Check the connection and try again.' } : next), 650);
  };
  const preview = (link: string, offline = false) => { setValue(link); find(link, offline); };
  const add = () => {
    if (phase.kind !== 'found') return;
    setFlowStore({ saved: [...flowStore.saved, phase.saved] });
    onClose(); go(`collection:${phase.saved.id}`); notify(`Added ${phase.saved.name}`);
  };
  const installIt = () => {
    if (phase.kind !== 'repository') return;
    const known = githubRepositories.find(r => r.repo === phase.repo);
    const id = known?.id ?? phase.repo.split('/')[1].toLowerCase();
    const name = known?.name ?? titleCase(phase.repo.split('/')[1]);
    onClose();
    if (jobs.sources.some(s => s.id === id)) { go(id); notify(`${name} is already installed`); return; }
    jobs.startInstall({ id, name, factions: known?.factions ?? ['Wardens', 'Wayfarers'], size: known?.size ?? '3.4 MB' });
    onOpenJobs();
  };
  const error = phase.kind === 'error' ? phase.text : '';
  const finding = phase.kind === 'finding';
  return <TabletSheet title="Add a collection or library" sub="Lists of repositories to install from" onClose={onClose} action={{ label: 'Add collection', disabled: phase.kind !== 'found', onClick: add }}>
    <div className="tbs-field">
      <label htmlFor="tbd-add-link">Collection or library link</label>
      <div className="tbd-find">
        <input id="tbd-add-link" data-autofocus type="url" inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off" placeholder="https://… or github.com/name" value={value} aria-invalid={!!error} aria-describedby="tbd-add-help"
          onChange={e => { setValue(e.target.value); clearTimeout(timer.current); setPhase({ kind: 'idle' }); }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); find(); } }} />
        <button type="button" className="tbs-action" disabled={!value.trim() || finding} onClick={() => find()}>{finding ? <><LoaderCircle size={16} className="dt-spin" />Finding…</> : <><Search size={16} />Find</>}</button>
      </div>
      <small id="tbd-add-help" className={error ? 'tbc-error' : ''} role={error ? 'alert' : undefined}>{error || 'A collection file (.json) or a GitHub organisation or user (github.com/name).'}</small>
    </div>
    {phase.kind === 'found' && <div className="tbs-note ok" role="status">{phase.saved.kind === 'library' ? <LibraryBig size={20} /> : <Layers3 size={20} />}
      <span><strong>{phase.saved.name}</strong><small>{phase.saved.kind === 'library' ? `GitHub organisation · ${plural(phase.page.listings.length, 'repository', 'repositories')}` : `Collection · by ${phase.page.by} · ${plural(phase.page.listings.length, 'source')}`}</small><small>{phase.page.description}</small></span></div>}
    {phase.kind === 'repository' && <div className="tbs-note" role="status"><Github size={20} />
      <span><strong>That is a repository, not a collection</strong><small>{phase.repo} · Install it directly instead.</small><button type="button" className="tbs-action tbd-inline" onClick={installIt}><ArrowDownToLine size={16} />Install it</button></span></div>}
    <p className="tbs-hint">Collections only list repositories. Nothing is downloaded until you install.</p>
    <details className="tbd-preview"><summary>Preview states · gallery controls</summary>
      <div className="tbd-preview-row">{([
        ['Collection link', () => preview('https://example.org/community-picks.json')], ['Library', () => preview('github.com/example')], ['Repository', () => preview('github.com/example-user/field-notes')],
        ['Already added', () => preview(sourceCollections.default.link)], ['Not a collection', () => preview('example.org/readme')], ['No connection', () => preview(value.trim() || 'github.com/example', true)],
      ] as Array<[string, () => void]>).map(([label, run]) => <button type="button" key={label} className="tbs-action" onClick={run}>{label}</button>)}</div>
    </details>
  </TabletSheet>;
}

/* ---------------------------------------------------------------- Appearance import */

const IMPORTS = {
  scheme: { title: 'Import colour scheme', sub: 'JSON file · up to 16 KiB', pick: 'Choose a colour scheme file…', hint: 'A scheme file sets the colours of both themes. It is checked for contrast before it is saved; up to eight schemes are kept, and importing the same ID again replaces it.', states: [['idle', 'Unchanged'], ['importing', 'Importing'], ['scheme', 'Saved scheme'], ['error', 'Contrast error']] },
  language: { title: 'Upload language pack', sub: 'JSON file · up to 128 KiB', pick: 'Choose a language pack…', hint: 'A language pack translates the app. Missing strings use English; game data is shown as written. Up to eight packs are kept, and importing the same locale again replaces it.', states: [['idle', 'Unchanged'], ['importing', 'Importing'], ['language', 'Language warnings'], ['error', 'Invalid file']] },
} as const;

/** The local import flow of Settings → Appearance (carried from the phone design): choose a file, see the outcome. A bad file keeps the current choice. */
function AppearanceImportSheet({ value, onChange, onImported, onClose }: { value: AppearanceImport; onChange: (next: AppearanceImport) => void; onImported: (kind: AppearanceImport['kind']) => void; onClose: () => void }) {
  const { kind, outcome } = value;
  const copy = IMPORTS[kind];
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const busy = outcome === 'importing';
  const set = (next: AppearanceOutcome) => { clearTimeout(timer.current); onChange({ kind, outcome: next }); };
  const choose = () => { set('importing'); timer.current = window.setTimeout(() => { onChange({ kind, outcome: kind }); onImported(kind); }, 800); };
  const title = busy ? 'Importing…' : outcome === 'error' ? 'Import failed' : 'Imported and selected';
  const text = outcome === 'error' ? (kind === 'scheme' ? 'The scheme does not meet WCAG AA contrast: light: ink on surface (1.00 < 4.5). Your current scheme stays selected.' : 'The file is not a language pack: it has no locale. Your current language stays selected.')
    : outcome === 'language' ? '5 missing strings use English. 2 unknown keys were ignored. The language is saved on this device.'
      : busy ? 'Reading and validating the selected JSON file.' : 'The colour scheme is saved on this device. Choose another scheme at any time.';
  return <TabletSheet title={copy.title} sub={copy.sub} cancelLabel="Close" onClose={onClose} action={{ label: 'Done', disabled: busy, onClick: onClose }}>
    <p className="tbs-hint">{copy.hint}</p>
    <button type="button" className="tbs-action" data-autofocus disabled={busy} onClick={choose}><Upload size={18} />{copy.pick}</button>
    {outcome !== 'idle' && <div className={`tbs-note ${outcome === 'scheme' ? 'ok' : outcome === 'importing' ? '' : 'warn'}`} role="status">
      {busy ? <LoaderCircle size={18} className="dt-spin" /> : outcome === 'scheme' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
      <span><strong>{title}</strong><small>{text}</small>
        {outcome === 'scheme' && <span className="tbd-swatch" aria-label="Slate · imported"><i style={{ background: 'var(--ux-bg)' }} /><i style={{ background: '#7c8cff' }} /><i style={{ background: 'var(--ux-cool)' }} /><b>Slate · imported</b></span>}</span></div>}
    <details className="tbd-preview"><summary>Import states · gallery controls</summary>
      <div className="tbd-preview-row">{copy.states.map(([id, label]) => <button type="button" key={id} className="tbs-action" aria-pressed={outcome === id} onClick={() => set(id)}>{label}</button>)}</div>
      <p className="tbs-hint">The native app opens the system file picker. Errors keep the current choice.</p>
    </details>
  </TabletSheet>;
}

/* ---------------------------------------------------------------- Move unit */

/** Move a unit to another force of the same roster. Forces that cannot take it say why. */
export function MoveUnitSheet({ unit, forces, units, from, onMove, onAddForce, onClose }: { unit: EditorUnit; forces: Force[]; units: EditorUnit[]; from: string; onMove: (forceId: string) => void; onAddForce: () => void; onClose: () => void }) {
  const others = forces.filter(f => f.id !== from);
  const blocked = (f: Force) => FORCE_TYPES.find(t => t.name === f.type)?.noSupport && unit.role === 'Support' ? `A ${f.type} takes no Support units.` : null;
  const [target, setTarget] = useState(others.find(f => !blocked(f))?.id ?? '');
  return <TabletSheet title="Move unit" sub={unit.name} onClose={onClose} action={{ label: 'Move', disabled: !target, onClick: () => onMove(target) }}>
    {others.length ? <>
      <p className="tbs-hint">Choose the force that takes {unit.name}. Its options carry over; the roster is checked against the new force's requirements.</p>
      <h3 className="tbs-label" id="tbd-move">Move to</h3>
      <div className="tbs-choices" role="radiogroup" aria-labelledby="tbd-move">{others.map(f => { const why = blocked(f); const count = units.filter(u => (u.forceId ?? 'f1') === f.id).length;
        return <button type="button" role="radio" key={f.id} aria-checked={target === f.id} aria-disabled={!!why || undefined} className={`tbs-choice ${target === f.id ? 'active' : ''}`} data-autofocus={target === f.id ? true : undefined} onClick={() => { if (!why) setTarget(f.id); }}>
          <span><strong>{f.name}</strong><small>{f.type} · {f.faction} · {plural(count, 'unit')}</small>{why && <small className="reason"><Lock size={13} />{why}</small>}</span>{target === f.id && <Check size={20} />}</button>; })}</div>
    </> : <div className="tbc-empty"><Layers3 size={30} /><strong>No other force</strong><small>A unit moves between the forces of a roster. Add a second force first.</small><button type="button" className="tbs-action" data-autofocus onClick={onAddForce}>Add force…</button></div>}
  </TabletSheet>;
}

/* ---------------------------------------------------------------- Composed in the shell */

/** The session's window-covering sheets, shown by the shell above the rail and the page. */
export function TabletSessionSheets({ session, notify }: { session: TabletSession; notify: Notify }) {
  const { jobs, pickerJob, setPickerJob, setAddCollectionOpen, setSourceDetail, setJobsOpen, appearanceImport, setAppearanceImport, setLanguage, deleting, setDeleting, rosters, setRosters } = session;
  const picking = jobs.jobs.find(j => j.id === pickerJob && j.status === 'needs-you');
  const doomed = deleting ? rosters.find(r => r.name === deleting) : undefined;
  return <>
    {picking && <FactionPickerSheet job={picking} onLater={() => setPickerJob(null)} onCancelInstall={() => { setPickerJob(null); jobs.cancel(picking.id); }} onChoose={chosen => { setPickerJob(null); jobs.chooseFactions(picking.id, chosen); }} />}
    {session.addCollectionOpen && <AddCollectionSheet jobs={jobs} notify={notify} go={setSourceDetail} onOpenJobs={() => setJobsOpen(true)} onClose={() => setAddCollectionOpen(false)} />}
    {appearanceImport && <AppearanceImportSheet value={appearanceImport} onChange={setAppearanceImport} onClose={() => setAppearanceImport(null)}
      onImported={kind => { if (kind === 'language') setLanguage('fr'); notify(kind === 'language' ? 'Language pack imported: Français' : 'Colour scheme imported: Slate'); }} />}
    {doomed && <ConfirmSheet title="Delete roster?" sub={doomed.name} headline="This roster will be deleted" destructive confirmLabel="Delete roster" text="It is removed from this device. You can undo for a few seconds; after that it is gone for good. Game data is not affected."
      onClose={() => setDeleting(null)} onConfirm={() => { const before = rosters; setRosters(list => list.filter(r => r.name !== doomed.name)); setDeleting(null); notify(`Deleted “${doomed.name}”`, { action: { label: 'Undo', run: () => setRosters(before) } }); }}>
      <div className="tbs-import-roster"><span className="tb-mark" aria-hidden="true">{doomed.mark}</span><span><strong>{doomed.name}</strong><small>{doomed.faction} · {doomed.system} · {doomed.units} {doomed.units === 1 ? 'unit' : 'units'} · {doomed.used.toLocaleString('en-US')} / {doomed.limit.toLocaleString('en-US')} pts</small></span></div>
    </ConfirmSheet>}
  </>;
}
