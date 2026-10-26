import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowRight, BookMarked, BookOpen, CheckCheck, ChevronDown, ChevronRight, Command, Copy, Database, Eye, FilePlus2, FileUp, Flag, Home, Layers3, Hammer, LayoutPanelLeft, LibraryBig, ListFilter, Lock, Minus, Moon, PanelLeftClose, PanelRightClose, Plus, Search, Settings2, Shield, Sun, Swords, Trash2, Users, X } from 'lucide-react';
import type { ConceptProps } from '../shared';
import type { ColorScheme } from '../../types';
import { DesktopLookup, DesktopRosters, DesktopSettings, DesktopSources, WelcomeStart } from './DesktopPages';
import { DesktopCreate } from './DesktopCreate';
import { LibrarySwitch } from '../../gallery/LibrarySwitch';
import { ComingSoonCard } from '../ux/AppExtras';
import { DesktopMenuBar } from './DesktopMenuBar';
import { JobsPanel, JobsToggle, useWorkspaceJobs } from '../workspace/Jobs';
import { installedSources, rosterLibrary } from './desktopData';
import { comboFromEvent, defaultBindings, formatCombo, type KeyAction, type KeyBindings } from './desktopKeys';
import { AddForceDialog, CatalogueTarget, ExportDialog, ForceHeader, GALLERY_STATES, HistoryButtons, ImportDialog, IssueDetails, PRIMARY_FORCE_ID, ROLES, ReadOnlyBanner, ReadOnlyCatalogue, forceOf, galleryFlow, groupLimit, importResult, isTextEntry, primaryForce, readOnlyReason, revealInRoster, rosterIssues, sampleImport, specialRoster, useRosterHistory, type EditorFlowState, type Force, type GalleryFlow, type HistoryStep, type ImportResult, type ReadOnlyInfo, type RosterIssue } from './DesktopEditorFlows';
import { IconButton } from '../workspace/Primitives';
import { PanelResizer } from '../workspace/PanelResizer';
import { ModalShell } from '../workspace/Dialog';
import { ToastRegion, useToasts } from '../workspace/Toasts';
import { PointsLine, RosterSummary, SummaryToggle } from '../workspace/RosterSummary';
import { DesktopLimitElements } from './DesktopLimitElements';
import './desktop.css';

type Unit = { notes?: string; forceId?: string; id: number; name: string; role: string; models: number; points: number; weapon: string; upgrade: boolean };
const catalogue = [
  { name: 'Force Commander', role: 'Command', models: 1, points: 90, weapon: 'Command blade' },
  { name: 'Field Marshal', role: 'Command', models: 1, points: 115, weapon: 'Service rifle' },
  { name: 'Line Infantry', role: 'Core', models: 10, points: 120, weapon: 'Service rifle' },
  { name: 'Recon Team', role: 'Core', models: 5, points: 85, weapon: 'Scout carbine' },
  { name: 'Veteran Guard', role: 'Specialist', models: 5, points: 165, weapon: 'Heavy carbine' },
  { name: 'Support Battery', role: 'Support', models: 3, points: 180, weapon: 'Field cannon' },
  { name: 'Patrol Walker', role: 'Support', models: 1, points: 145, weapon: 'Twin autocannon' },
];
const initialUnits: Unit[] = [
  { ...catalogue[0], id: 1, upgrade: false },
  { ...catalogue[2], id: 2, upgrade: true },
  { ...catalogue[2], id: 3, upgrade: false },
  { ...catalogue[3], id: 4, upgrade: false },
  { ...catalogue[4], id: 5, upgrade: false },
  { ...catalogue[5], id: 6, upgrade: false },
];
const recent = [
  { name: 'The Ashen Expedition', faction: 'Frontier Coalition', points: '770 / 1,000', date: '12 minutes ago', mark: 'AE' },
  { name: 'Northern Watch', faction: 'Frontier Coalition', points: '1,500 / 1,500', date: 'Yesterday', mark: 'NW' },
  { name: 'Operation First Light', faction: 'Free Cities', points: '985 / 1,000', date: 'Monday', mark: 'FL' },
  { name: 'Weekend skirmish', faction: 'Frontier Coalition', points: '495 / 500', date: 'Oct 16', mark: 'WS' },
];
type View = 'welcome' | 'rosters' | 'lookup' | 'tools' | 'library' | 'sources' | 'settings' | 'editor';
const hubPages: Record<Exclude<View, 'editor'>, { label: string; icon: ReactNode }> = { welcome: { label: 'Welcome', icon: <Home size={14} /> }, rosters: { label: 'Rosters', icon: <LibraryBig size={14} /> }, lookup: { label: 'Lookup', icon: <Search size={14} /> }, tools: { label: 'Tools', icon: <Hammer size={14} /> }, library: { label: 'Library', icon: <BookMarked size={14} /> }, sources: { label: 'Sources', icon: <Database size={14} /> }, settings: { label: 'Settings', icon: <Settings2 size={14} /> } };
const screenView = (screen?: string): View => screen === 'desktop-first-run' ? 'welcome' : screen?.startsWith('desktop-') && screen.slice(8) in { ...hubPages, editor: 1 } ? screen.slice(8) as View : 'welcome';
const KEYS_STORAGE = 'battle-augur.desktop.key-bindings';
function loadBindings(): KeyBindings {
  try { return { ...defaultBindings, ...JSON.parse(localStorage.getItem(KEYS_STORAGE) ?? '{}') }; } catch { return defaultBindings; }
}
const PANEL = { left: { initial: 260, min: 200, max: 440 }, right: { initial: 320, min: 260, max: 520 } };
function Brand({ large = false }: { large?: boolean }) {
  return <span className={`dt-brand ${large ? 'large' : ''}`}><Swords strokeWidth={1.3} /><span className="dt-brand-spark">✦</span></span>;
}
/** First run is a separate instance so its empty state never leaks into the other screens. */
export function DesktopWorkbench(props: Partial<ConceptProps>) {
  if (props.workflowScreen === 'desktop-menus') return <div className="dtm-preview"><DesktopMenuBar /><Workbench {...props} workflowScreen="desktop-editor" /></div>;
  return <Workbench key={props.workflowScreen === 'desktop-first-run' ? 'first-run' : 'workspace'} {...props} />;
}
function Workbench(props: Partial<ConceptProps>) {
  const firstRun = props.workflowScreen === 'desktop-first-run';
  const [view, setView] = useState<View>(screenView(props.workflowScreen));
  const [hub, setHub] = useState<Exclude<View, 'editor'>>(view === 'editor' ? 'welcome' : view);
  const [themePref, setThemePref] = useState<'system' | 'light' | 'dark'>(props.themePreference ?? props.themeMode ?? 'dark');
  const [light, setLight] = useState(props.themeMode === 'light');
  const [scheme, setScheme] = useState<ColorScheme>(props.colorScheme ?? 'default');
  const [summary, setSummary] = useState(false);
  // The roster document (units + forces) lives in an undo/redo history; see DesktopEditorFlows.tsx.
  const history = useRosterHistory<Unit>({ units: initialUnits, forces: [primaryForce()] });
  const { units, forces } = history.doc;
  const [activeForce, setActiveForce] = useState(PRIMARY_FORCE_ID);
  const [flow, setFlow] = useState<EditorFlowState | null>(null);
  const [readOnly, setReadOnly] = useState<ReadOnlyInfo | null>(null);
  const editorKeys = useRef({ undo: () => {}, redo: () => {}, openExport: () => {} });
  const [selectedId, setSelectedId] = useState(2);
  const [limit, setLimit] = useState(1000);
  const [rosterName, setRosterName] = useState(recent[0].name);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All units');
  const [tab, setTab] = useState('Options');
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const [leftWidth, setLeftWidth] = useState(PANEL.left.initial);
  const [rightWidth, setRightWidth] = useState(PANEL.right.initial);
  const [command, setCommand] = useState(false);
  const [create, setCreate] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(!firstRun);
  const [hasRosters, setHasRosters] = useState(!firstRun);
  const [rosterMeta, setRosterMeta] = useState({ faction: 'Frontier Coalition', force: 'Expedition force' });
  const [jobsOpen, setJobsOpen] = useState(false);
  const [sourceSelected, setSourceSelected] = useState(firstRun ? 'add' : 'open-field');
  const toasts = useToasts();
  const { notify } = toasts;
  const [bindings, setBindings] = useState<KeyBindings>(loadBindings);
  const [actionSlot, setActionSlot] = useState<HTMLElement | null>(null);
  const keyState = useRef({ bindings, view });
  keyState.current = { bindings, view };
  const viewSource = useCallback((id: string) => { setSourceSelected(id); setView('sources'); setJobsOpen(false); }, []);
  // DEC-022: installs bring every faction unless Advanced installation is on (Settings → Game data; `&install=advanced` on standalone links).
  const [advancedInstall, setAdvancedInstall] = useState(() => new URLSearchParams(location.search).get('install') === 'advanced');
  const jobs = useWorkspaceJobs(firstRun ? [] : installedSources, notify, viewSource, advancedInstall);
  const openJobs = () => { setJobsOpen(true); setSummary(false); };
  const saveBindings = (next: KeyBindings) => { setBindings(next); try { localStorage.setItem(KEYS_STORAGE, JSON.stringify(next)); } catch { /* prototype only */ } };
  const [checks, setChecks] = useState(false);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(100);
  useEffect(() => { setView(screenView(props.workflowScreen)); }, [props.workflowScreen]);
  useEffect(() => { if (view !== 'editor') setHub(view); }, [view]);
  useEffect(() => { setLight(props.themeMode === 'light'); }, [props.themeMode]);
  useEffect(() => { setScheme(props.colorScheme ?? 'default'); }, [props.colorScheme]);
  useEffect(() => {
    const run: Record<KeyAction, () => void> = {
      palette: () => setCommand(v => !v), newRoster: () => setCreate(true), rosters: () => setView('rosters'), lookup: () => setView('lookup'), settings: () => setView('settings'),
      summary: () => keyState.current.view === 'editor' && setSummary(v => !v), toggleCatalogue: () => keyState.current.view === 'editor' && setShowLeft(v => !v), toggleInspector: () => keyState.current.view === 'editor' && setShowRight(v => !v),
      undo: () => keyState.current.view === 'editor' && editorKeys.current.undo(), redo: () => keyState.current.view === 'editor' && editorKeys.current.redo(), exportRoster: () => keyState.current.view === 'editor' && editorKeys.current.openExport(),
    };
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setCommand(false); setCreate(false); setSummary(false); setJobsOpen(false); return; }
      const combo = comboFromEvent(e);
      const action = combo && (Object.keys(run) as KeyAction[]).find(id => keyState.current.bindings[id] === combo);
      if (action) { if ((action === 'undo' || action === 'redo') && isTextEntry(e.target)) return; e.preventDefault(); run[action](); }
    };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    if (!command && !create) return;
    const previous = document.activeElement as HTMLElement | null;
    const modal = document.querySelector<HTMLElement>('.dt-modal');
    const focusables = () => Array.from(modal?.querySelectorAll<HTMLElement>('button, input, select, textarea') ?? []).filter(el => !el.hasAttribute('disabled'));
    const items = focusables();
    (modal?.querySelector<HTMLInputElement>('input') ?? items[1] ?? items[0])?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const nodes = focusables(); const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', trap);
    return () => { window.removeEventListener('keydown', trap); previous?.focus(); };
  }, [command, create]);
  const selected = units.find(u => u.id === selectedId);
  const unlimited = limit === 0;
  const cost = (u: Unit) => u.points + (u.upgrade ? 10 : 0);
  const total = units.reduce((n, u) => n + cost(u), 0);
  const issueList = rosterIssues(units, forces, limit, readOnly);
  const issues = issueList.map(i => i.text);
  const roReason = readOnly ? readOnlyReason(readOnly) : undefined;
  const openRoster = (name: string) => { setRosterOpen(true); setRosterName(name); setView('editor'); setCommand(false); };
  const loadDoc = (next: Unit[], nextForces: Force[] = [primaryForce()], info: ReadOnlyInfo | null = null) => { history.reset({ units: next, forces: nextForces }); setActiveForce(nextForces[0].id); setReadOnly(info); setCollapsed([]); setFlow(null); };
  const loadRecent = (name: string) => {
    const special = specialRoster(name);
    if (special) { loadDoc(special.units, special.forces, special.readOnly); setLimit(special.limit); setRosterMeta({ faction: special.faction, force: special.force }); setSelectedId(special.units[0].id); openRoster(name); return; }
    setRosterMeta({ faction: recent.find(r => r.name === name)?.faction ?? 'Frontier Coalition', force: 'Expedition force' });
    let snapshot = initialUnits.map(u => ({ ...u }));
    let budget = 1000;
    if (name === 'Northern Watch') { snapshot = [...snapshot, ...Array.from({ length: 4 }, (_, i) => ({ ...catalogue[5], id: 10 + i, upgrade: i === 0 }))]; budget = 1500; }
    if (name === 'Operation First Light') snapshot = [...snapshot.map(u => u.id === 4 ? { ...u, models: 2 } : u), { ...catalogue[1], id: 10, upgrade: true }, { ...catalogue[0], id: 11, upgrade: false }];
    if (name === 'Weekend skirmish') { snapshot = [initialUnits[0], { ...initialUnits[1], upgrade: false }, initialUnits[2], initialUnits[4]]; budget = 500; }
    loadDoc(snapshot, [primaryForce('Expedition force', recent.find(r => r.name === name)?.faction)]); setLimit(budget); setSelectedId(snapshot[1]?.id ?? snapshot[0].id); openRoster(name);
  };
  const chooseTheme = (pref: 'system' | 'light' | 'dark') => { setThemePref(pref); setLight(pref === 'light' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches)); props.onThemePreferenceChange?.(pref); };
  const chooseScheme = (next: ColorScheme) => { setScheme(next); props.onColorSchemeChange?.(next); };
  const update = (change: Partial<Unit>) => {
    if (readOnly || !selected) return;
    const what = change.notes !== undefined ? 'notes' : change.models !== undefined ? 'unit size' : change.weapon !== undefined ? change.weapon : change.upgrade !== undefined ? `Field standard ${change.upgrade ? 'on' : 'off'}` : 'options';
    history.edit(`${selected.name}: ${what}`, d => ({ ...d, units: d.units.map(u => u.id === selectedId ? { ...u, ...change } : u) }), { focus: selectedId, merge: change.notes !== undefined ? `notes-${selectedId}` : undefined });
  };
  // After undo/redo: keep a selection that exists, reveal the unit the step was about, offer the opposite step.
  const settle = (focus?: number) => { const doc = history.peek(); const keep = doc.units.find(u => u.id === focus) ?? doc.units.find(u => u.id === selectedId) ?? doc.units[0]; setSelectedId(keep?.id ?? 0); if (!doc.forces.some(f => f.id === activeForce)) setActiveForce(doc.forces[0]?.id ?? PRIMARY_FORCE_ID); return keep; };
  const afterStep = (step: HistoryStep | null, undone: boolean) => { if (!step) return; const keep = settle(step.focus); if (keep && keep.id === step.focus) revealInRoster(`[data-unit-id="${keep.id}"]`, false); notify(`${undone ? 'Undone' : 'Redone'}: ${step.label}`, { action: { label: undone ? 'Redo' : 'Undo', run: undone ? redo : undo } }); };
  const undo = () => { if (!readOnly) afterStep(history.undo(), true); };
  const redo = () => { if (!readOnly) afterStep(history.redo(), false); };
  const undoStep = (id: number) => { history.undoStep(id); settle(); };
  const withUndo = (step: number) => ({ action: { label: 'Undo', run: () => undoStep(step) } });
  const duplicateUnit = () => { if (!selected || readOnly) return; const id = nextId.current++; const step = history.edit(`Duplicate ${selected.name}`, d => ({ ...d, units: [...d.units, { ...selected, id }] }), { focus: id }); setSelectedId(id); revealInRoster(`[data-unit-id="${id}"]`, false); notify(`${selected.name} duplicated`, withUndo(step)); };
  const removeUnit = () => { if (!selected || readOnly) return; const step = history.edit(`Remove ${selected.name}`, d => ({ ...d, units: d.units.filter(u => u.id !== selected.id) }), { focus: selected.id }); setSelectedId(units.find(u => u.id !== selected.id)?.id ?? 0); notify(`${selected.name} removed`, withUndo(step)); };
  const addForce = (force: Omit<Force, 'id'>) => { const id = `f${nextId.current++}`; const step = history.edit(`Add ${force.name}`, d => ({ ...d, forces: [...d.forces, { ...force, id }] })); setActiveForce(id); setFlow(null); setShowLeft(true); revealInRoster(`[data-force="${id}"]`, false); notify(`${force.name} added. The catalogue now adds to it.`, withUndo(step)); };
  const renameForce = (id: string, name: string) => { const old = forces.find(f => f.id === id)?.name ?? ''; const step = history.edit(`Rename ${old}`, d => ({ ...d, forces: d.forces.map(f => f.id === id ? { ...f, name } : f) })); notify(`Renamed to “${name}”`, withUndo(step)); };
  const removeForce = (id: string) => {
    const force = forces.find(f => f.id === id); if (!force || forces.length < 2) return;
    const count = units.filter(u => forceOf(u) === id).length; const rest = forces.filter(f => f.id !== id);
    const step = history.edit(`Remove ${force.name}`, d => ({ units: d.units.filter(u => forceOf(u) !== id), forces: d.forces.filter(f => f.id !== id) }));
    if (activeForce === id) setActiveForce(rest[0].id);
    if (selected && forceOf(selected) === id) setSelectedId(units.find(u => forceOf(u) !== id)?.id ?? 0);
    notify(`${force.name} removed${count ? ` with ${count} ${count === 1 ? 'unit' : 'units'}` : ''}`, withUndo(step));
  };
  const showIssue = (issue: RosterIssue) => {
    const t = issue.target;
    if (t.summary) { setSummary(true); return; }
    if (t.banner) { document.getElementById('dte-readonly')?.focus(); return; }
    const unit = t.unitId !== undefined ? units.find(u => u.id === t.unitId) : undefined;
    if (unit) { setCollapsed(c => c.filter(k => k !== `${forceOf(unit)}/${unit.role}`)); setSelectedId(unit.id); setActiveForce(forceOf(unit)); setShowRight(true); revealInRoster(`[data-unit-id="${unit.id}"]`); return; }
    if (t.forceId && t.group) { const key = `${t.forceId}/${t.group}`; setCollapsed(c => c.filter(k => k !== key)); setActiveForce(t.forceId); setShowLeft(true); setRole(t.group); revealInRoster(`[data-group="${key}"]`); }
  };
  const openExport = () => { setSummary(false); setFlow({ kind: 'export' }); };
  const findData = () => { setSourceSelected(readOnly?.sourceId ?? 'open-field'); setView('sources'); };
  const duplicateRoster = () => { const name = `${rosterName} (copy)`; setReadOnly(null); history.reset(history.peek()); setHasRosters(true); openRoster(name); notify(`Opened “${name}”, an editable copy. The original stays read-only.`); };
  const openImport = (r: ImportResult) => { loadDoc(r.units as Unit[], r.forces); setLimit(r.limit); setRosterMeta({ faction: r.faction, force: r.forces[0].type }); nextId.current = Math.max(100, ...r.units.map(u => u.id)) + 1; setSelectedId(r.units[0]?.id ?? 0); setHasRosters(true); openRoster(r.name); notify(r.unmatched.length ? `Imported “${r.name}” without ${r.unmatched.length} ${r.unmatched.length === 1 ? 'entry' : 'entries'}` : `Imported “${r.name}”`); };
  const applyFlow = (f: GalleryFlow) => {
    if (f === 'read-only') return loadRecent('Ember patrol');
    if (f === 'forces') return loadRecent('Harbour defence');
    if (f === 'issues') { loadRecent('Operation First Light'); setChecks(true); return; }
    if (view !== 'editor' || readOnly || !rosterOpen) loadRecent(recent[0].name);
    setFlow(f === 'export' ? { kind: 'export' } : f === 'add-force' ? { kind: 'add-force' } : { kind: 'import', result: sampleImport(f === 'import-partial') });
  };
  editorKeys.current = { undo: () => { if (!flow && !command && !create) undo(); }, redo: () => { if (!flow && !command && !create) redo(); }, openExport: () => { if (rosterOpen && !create) openExport(); } };
  useEffect(() => { const f = galleryFlow(); if (f) applyFlow(f); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const addUnit = (unit: typeof catalogue[number]) => { if (readOnly) return; const id = nextId.current++; const target = forces.find(f => f.id === activeForce) ?? forces[0]; const step = history.edit(`Add ${unit.name}`, d => ({ ...d, units: [...d.units, { ...unit, id, upgrade: false, forceId: target.id }] }), { focus: id }); setSelectedId(id); setShowRight(true); setCollapsed(c => c.filter(k => k !== `${target.id}/${unit.role}`)); revealInRoster(`[data-unit-id="${id}"]`, false); notify(`${unit.name} added to ${forces.length > 1 ? target.name : 'roster'}`, withUndo(step)); };
  const forcePoints = (id: string) => units.filter(u => forceOf(u) === id).reduce((n, u) => n + cost(u), 0);
  const exportData = () => ({ name: rosterName, limit, total, system: readOnly?.system ?? 'Open Field', faction: rosterMeta.faction, forces: forces.map(f => ({ ...f, points: forcePoints(f.id), units: units.filter(u => forceOf(u) === f.id) })), file: { name: rosterName, limit, forces, units } });
  return <div className={`dt-app dt-view-${view} ${view !== 'editor' ? 'dt-hub' : ''} ux-screen ${light ? 'light' : 'dark'} ux-scheme-${scheme}`}>
    <div className="dt-floating-chrome">
      <div className="dt-traffic" aria-hidden="true"><i /><i /><i /></div>
      <nav className="dt-workspace-tabs" aria-label="Open workspace tabs"><button className={view !== 'editor' ? 'active' : ''} aria-current={view !== 'editor' ? 'page' : undefined} onClick={() => setView(hub)}>{hubPages[hub].icon} {hubPages[hub].label}</button>{rosterOpen && <button className={view === 'editor' ? 'active' : ''} aria-current={view === 'editor' ? 'page' : undefined} title={readOnly ? 'Read-only roster' : undefined} onClick={() => setView('editor')}>{readOnly ? <Lock size={14} /> : <Layers3 size={14} />} {rosterName}<span className="dt-dot" /></button>}<IconButton label="New roster" onClick={() => setCreate(true)}><Plus size={16} /></IconButton></nav>
      <div className="dt-floating-actions"><JobsToggle jobs={jobs.jobs} open={jobsOpen} onToggle={() => jobsOpen ? setJobsOpen(false) : openJobs()} /><div className="dt-page-actions" ref={setActionSlot} />{view === 'editor' && <SummaryToggle total={total} limit={limit} open={summary} onToggle={() => { setSummary(v => !v); setJobsOpen(false); }} />}{view === 'editor' && <><IconButton label="Toggle catalogue" active={showLeft} onClick={() => setShowLeft(v => !v)}><LayoutPanelLeft size={17} /></IconButton><IconButton label="Toggle inspector" active={showRight} onClick={() => setShowRight(v => !v)}><PanelRightClose size={17} /></IconButton></>}</div>
    </div>
    {view === 'editor' && !summary && <PointsLine total={total} limit={limit} />}
    {jobsOpen && jobs.jobs.length > 0 && <JobsPanel jobs={jobs.jobs} onChoose={jobs.chooseFactions} onCancel={jobs.cancel} onHide={() => setJobsOpen(false)} onClear={() => { jobs.clearEnded(); if (!jobs.jobs.some(j => j.status === 'running' || j.status === 'needs-you')) setJobsOpen(false); }} onViewSource={viewSource} />}
    {view === 'editor' && summary && <RosterSummary name={rosterName} faction={rosterMeta.faction} force={rosterMeta.force} total={total} limit={limit} issueCount={issues.length} customLimit onLimit={setLimit} onShowIssues={() => setChecks(true)}
      data={{ name: 'Open Field', version: 'v1.4', onClick: () => notify('Open Field · v1.4 · sample catalogue is ready offline') }}
      actions={[{ label: 'Export roster…', icon: <ArrowDownToLine size={15} />, kbd: bindings.exportRoster ? formatCombo(bindings.exportRoster) : undefined, onClick: openExport }, { label: 'New roster', icon: <FilePlus2 size={15} />, kbd: bindings.newRoster ? formatCombo(bindings.newRoster) : undefined, onClick: () => setCreate(true) }]} />}
    <div className="dt-body">{view !== 'editor' && <nav className="dt-activity" aria-label="Workspace"><Brand /><IconButton label="Welcome" active={view === 'welcome'} onClick={() => setView('welcome')}><Home size={20} /></IconButton><IconButton label="Rosters" active={view === 'rosters'} onClick={() => setView('rosters')}><LibraryBig size={20} /></IconButton><IconButton label="Lookup" active={view === 'lookup'} onClick={() => setView('lookup')}><Search size={20} /></IconButton><IconButton label="Tools (coming soon)" active={view === 'tools'} onClick={() => setView('tools')}><Hammer size={20} /></IconButton><IconButton label="Library (coming soon)" active={view === 'library'} onClick={() => setView('library')}><BookMarked size={20} /></IconButton><span className="dt-activity-rule" /><IconButton label="Sources" active={view === 'sources'} onClick={() => setView('sources')}><Database size={20} /></IconButton><div className="dt-activity-bottom"><IconButton label={light ? 'Switch to dark appearance' : 'Switch to light appearance'} onClick={() => chooseTheme(light ? 'dark' : 'light')}>{light ? <Moon size={19} /> : <Sun size={19} />}</IconButton><IconButton label="Settings" active={view === 'settings'} onClick={() => setView('settings')}><Settings2 size={20} /></IconButton><span className="dt-avatar">O</span></div></nav>}
      {view === 'rosters' ? <DesktopRosters initialRosters={hasRosters ? rosterLibrary : []} actionSlot={actionSlot} onOpen={loadRecent} onCreate={() => setCreate(true)} onImport={() => importRef.current?.click()} notify={notify} /> : view === 'lookup' ? <DesktopLookup onOpenRoster={loadRecent} /> : view === 'tools' ? <ComingSoonPage kind="tools" /> : view === 'library' ? <ComingSoonPage kind="library" /> : view === 'sources' ? <DesktopSources onOpenRoster={loadRecent} actionSlot={actionSlot} notify={notify} jobs={jobs} selectedId={sourceSelected} onSelect={setSourceSelected} onOpenJobs={openJobs} /> : view === 'settings' ? <DesktopSettings themePref={themePref} onThemePref={chooseTheme} scheme={scheme} onScheme={chooseScheme} bindings={bindings} onBindings={saveBindings} advancedInstall={advancedInstall} onAdvancedInstall={setAdvancedInstall} notify={notify} /> : view === 'welcome' ? <main className="dt-welcome"><div className="dt-welcome-top"><span>YOUR WORKSPACE</span><span>{jobs.sources.length ? 'All systems ready' : 'No game data yet'} <i className={`dt-dot ${jobs.sources.length ? '' : 'idle'}`} /></span></div><div className="dt-welcome-content"><section className="dt-intro"><Brand large /><div className="dt-eyebrow">PLAN WITH PURPOSE.</div><h1>Every great battle<br />starts here.</h1><p>A clear head. A considered roster.<br />Your next force is taking shape.</p><div className="dt-start-actions"><button className="dt-primary" onClick={() => setCreate(true)}><Plus size={16} /> Create a roster {bindings.newRoster && <kbd>{formatCombo(bindings.newRoster)}</kbd>}</button><button onClick={() => importRef.current?.click()}><FileUp size={16} /> Import a roster <ArrowRight size={15} /></button><button onClick={() => setView('sources')}><Database size={16} /> Manage game data <ArrowRight size={15} /></button></div><div className="dt-local"><CheckCheck size={14} /> Your workspace, available offline.</div></section>{!jobs.sources.length || !hasRosters ? <WelcomeStart jobs={jobs} onCreate={() => setCreate(true)} onImport={() => importRef.current?.click()} onAddData={() => { setSourceSelected('add'); setView('sources'); }} onOpenJobs={openJobs} /> : <section className="dt-recents"><header><h2>Pick up where you left off</h2><span>RECENT ROSTERS</span></header>{recent.map((r, i) => <button key={r.name} className="dt-recent-row" onClick={() => loadRecent(r.name)}><span className={`dt-monogram tone-${i}`}>{r.mark}</span><span className="dt-recent-info"><strong>{r.name}</strong><small>{r.faction} <b>·</b> {r.points} pts</small></span><span className="dt-recent-date">{r.date}<ChevronRight size={15} /></span></button>)}<div className="dt-recent-footer"><span>Stored on this device</span><button onClick={() => setView('rosters')}>All rosters <ArrowRight size={14} /></button></div><aside className="dt-tip"><Command size={16} /><p>A little less clicking.<br /><span>Jump to rosters, units and actions with <kbd>{bindings.palette ? formatCombo(bindings.palette) : "the command palette"}</kbd></span></p></aside></section>}</div><footer className="dt-welcome-footer"><span>DESIGNED FOR THE WAY YOU BUILD.</span><span>Battle Augur <b> / </b> Desktop exploration 01</span></footer></main> : <main className="dt-editor"><div className={`dt-panels ${!showLeft ? 'no-left' : ''} ${!showRight ? 'no-right' : ''}`} style={{ gridTemplateColumns: `${showLeft ? `${leftWidth}px ` : ''}minmax(320px, 1fr)${showRight ? ` ${rightWidth}px` : ''}` }}>{showLeft && <PanelResizer side="left" width={leftWidth} limits={PANEL.left} label="Resize catalogue" onWidth={setLeftWidth} />}{showRight && <PanelResizer side="right" width={rightWidth} limits={PANEL.right} label="Resize inspector" onWidth={setRightWidth} />}
      {showLeft && readOnly && <ReadOnlyCatalogue info={readOnly} onFindData={findData} onHide={() => setShowLeft(false)} />}
      {showLeft && !readOnly && <aside className="dt-catalogue"><header className="dt-panel-heading"><span>Unit catalogue</span><IconButton label="Hide catalogue" onClick={() => setShowLeft(false)}><PanelLeftClose size={15} /></IconButton></header><div className="dt-catalogue-tools"><label className="dt-search"><Search size={14} /><input ref={searchRef} placeholder="Find a unit…" aria-label="Find a unit" value={query} onChange={e => setQuery(e.target.value)} /><kbd>⌕</kbd></label><div className="dt-filter"><ListFilter size={13} /><select aria-label="Filter unit role" value={role} onChange={e => setRole(e.target.value)}>{['All units', 'Command', 'Core', 'Specialist', 'Support'].map(r => <option key={r}>{r}</option>)}</select><span>{catalogue.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) && (role === 'All units' || role === u.role)).length} units</span></div><CatalogueTarget forces={forces} active={activeForce} onChange={setActiveForce} /></div><div className="dt-catalogue-list">{['Command', 'Core', 'Specialist', 'Support'].map(group => { const entries = catalogue.filter(u => u.role === group && u.name.toLowerCase().includes(query.toLowerCase()) && (role === 'All units' || role === group)); return entries.length ? <section key={group}><h3>{group}<span>{entries.length}</span></h3>{entries.map(u => <button className="dt-catalogue-unit" key={u.name} onClick={() => addUnit(u)} aria-label={`Add ${u.name}`}><span><strong>{u.name}</strong><small>{u.models} {u.models === 1 ? 'model' : 'models'}<span className="dt-wide-only"> · {u.weapon}</span></small></span><span className="dt-catalogue-price">{u.points}<Plus size={15} /></span></button>)}</section> : null; })}{!catalogue.some(u => u.name.toLowerCase().includes(query.toLowerCase()) && (role === 'All units' || role === u.role)) && <p className="dt-empty">No units match. Try another search.</p>}</div><footer className="dt-panel-foot"><Database size={12} /> Frontier Coalition <span>v1.4</span></footer></aside>}
      <section className="dt-roster"><header className="dt-panel-heading"><span>{forces.length > 1 ? 'Your forces' : 'Your force'} <small>{units.length} units{forces.length > 1 ? ` · ${forces.length} forces` : ''}</small></span><span className="dte-heading-actions"><HistoryButtons undoLabel={history.undoLabel} redoLabel={history.redoLabel} undoKey={bindings.undo} redoKey={bindings.redo} disabledReason={roReason} onUndo={undo} onRedo={redo} /><IconButton label="Show validation" onClick={() => setChecks(v => !v)}><Shield size={15} /></IconButton></span></header>{readOnly && <ReadOnlyBanner info={readOnly} onDuplicate={duplicateRoster} onFindData={findData} onExport={openExport} />}<div className="dt-roster-scroll">{forces.map(force => { const own = units.filter(u => forceOf(u) === force.id); return <div className="dte-force" key={force.id}><ForceHeader force={force} points={forcePoints(force.id)} units={own.length} active={force.id === activeForce} showActive={forces.length > 1} canRemove={forces.length > 1} readOnlyReason={roReason} onSelect={() => setActiveForce(force.id)} onRename={name => renameForce(force.id, name)} onRemove={() => removeForce(force.id)} />{ROLES.map(group => { const key = `${force.id}/${group}`; const entries = own.filter(u => u.role === group); return <section className="dt-roster-group" key={group} data-group={key}><button className="dt-group-heading" aria-expanded={!collapsed.includes(key)} onClick={() => setCollapsed(c => c.includes(key) ? c.filter(g => g !== key) : [...c, key])}>{collapsed.includes(key) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}<span>{group}</span><small>{entries.length} {groupLimit(force, group)}</small><b>{entries.reduce((n, u) => n + cost(u), 0)} pts</b></button>{!collapsed.includes(key) && entries.map(u => <button key={u.id} data-unit-id={u.id} className={`dt-roster-unit ${u.id === selectedId ? 'selected' : ''}`} onClick={() => { setSelectedId(u.id); setActiveForce(force.id); setShowRight(true); }}><span className="dt-unit-icon">{u.role === 'Command' ? <Flag size={18} /> : u.role === 'Support' ? <Swords size={18} /> : <Users size={18} />}</span><span className="dt-unit-info"><strong>{u.name} {u.id === 2 && rosterName === 'The Ashen Expedition' && <span className="dt-unit-tag">ALPHA</span>}</strong><small>{u.models} {u.models === 1 ? 'model' : 'models'} <b>·</b> {u.weapon}{u.upgrade ? ' · Field standard' : ''}</small></span><span className="dt-unit-points">{cost(u)}<small>pts</small></span><ChevronRight size={13} /></button>)}{!collapsed.includes(key) && entries.length === 0 && <button className="dt-add-empty" disabled={!!readOnly} title={roReason} onClick={() => { setShowLeft(true); setRole(group); setActiveForce(force.id); }}> <Plus size={14} /> Add {group.toLowerCase()} unit</button>}</section>; })}</div>; })}<button className="dt-add-force" disabled={!!readOnly} title={roReason ?? 'Add another force to this roster'} onClick={() => setFlow({ kind: 'add-force' })}><Plus size={14} /> Add detachment</button></div><button className={`dt-validation ${readOnly ? 'paused' : issues.length ? 'has-issues' : ''}`} aria-expanded={checks} aria-controls="dte-check-details" onClick={() => setChecks(v => !v)}><Shield size={16} /><span>{readOnly ? 'Validation paused' : issues.length ? `${issues.length} ${issues.length === 1 ? 'item needs' : 'items need'} attention` : 'Your force is ready'}<small>{readOnly ? 'Not checked while read-only' : issues.length ? 'Review roster requirements' : 'All roster requirements met'}</small></span><ChevronDown size={15} /></button>{checks && <IssueDetails issues={issueList} onShow={showIssue} />}</section>
      {showRight && <aside className="dt-inspector"><header className="dt-panel-heading"><span>Unit inspector</span><IconButton label="Hide inspector" onClick={() => setShowRight(false)}><X size={15} /></IconButton></header>{selected ? <><div className="dt-inspector-title"><span className="dt-eyebrow">{selected.role} <span> / </span> {selected.models} MODELS</span><div><h2>{selected.name}</h2><strong>{cost(selected)}<small> pts</small></strong></div><p>{forces.find(f => f.id === forceOf(selected))?.name}</p><div className="dt-unit-actions"><button disabled={!!readOnly} title={roReason ?? 'Duplicate this unit'} onClick={duplicateUnit}><Copy size={13} /> Duplicate</button><button disabled={!!readOnly} title={roReason ?? 'Remove this unit'} onClick={removeUnit}><Trash2 size={13} /> Remove</button></div></div><div className="dt-inspector-tabs">{['Options', 'Profile', 'Rules'].map(t => <button className={tab === t ? 'active' : ''} key={t} onClick={() => setTab(t)}>{t}</button>)}</div><fieldset className="dt-inspector-content dte-fieldset" disabled={!!readOnly} title={roReason}>{tab === 'Options' ? <><div className="dt-option-heading"><h3>Unit size</h3><span>{selected.models === 1 ? '1 model' : '1–20 models'}</span></div><div className="dt-model-count"><div><Users size={16} /><span>{selected.models === 1 ? 'Commander' : 'Unit members'}</span></div><div className="dt-stepper"><button aria-label="Remove model" disabled={selected.models <= 1} onClick={() => update({ models: selected.models - 1, points: selected.points - 12 })}><Minus size={12} /></button><b>{selected.models}</b><button aria-label="Add model" disabled={selected.role === 'Command' || selected.models >= 20} onClick={() => update({ models: selected.models + 1, points: selected.points + 12 })}><Plus size={12} /></button></div></div><div className="dt-option-heading"><h3>Equipment</h3><span>Choose one</span></div><label className="dt-field-label">Primary weapon<select value={selected.weapon} onChange={e => update({ weapon: e.target.value })}>{Array.from(new Set([selected.weapon, 'Service rifle', 'Scout carbine', 'Heavy carbine'])).map(w => <option key={w}>{w}</option>)}</select></label><p className="dt-option-note">Included in unit cost</p><div className="dt-option-heading"><h3>Upgrades</h3><span>Optional</span></div><label className={`dt-checkbox-row ${selected.upgrade ? 'checked' : ''}`}><input type="checkbox" checked={selected.upgrade} onChange={e => update({ upgrade: e.target.checked })} /><span><strong>Field standard</strong><small>Carry the detachment's colours.</small></span><b>+10</b></label><div className="dt-option-heading"><h3>Unit notes</h3><span>Private</span></div><textarea aria-label="Unit notes" placeholder="A role, a reminder, a plan…" value={selected.notes ?? ''} onChange={e => update({ notes: e.target.value })} /></> : tab === 'Profile' ? <><h3>Unit profile</h3><table className="dt-profile"><thead><tr>{['Move', 'Defence', 'Resolve', 'Health'].map(v => <th key={v}>{v}</th>)}</tr></thead><tbody><tr>{['6', '4+', '7', '1'].map((v, i) => <td key={i}>{v}</td>)}</tr></tbody></table><h3>Equipment</h3><p>{selected.weapon}</p><p className="dt-option-note">Illustrative profile for the Open Field sample system.</p></> : <><h3>Steady advance</h3><p className="dt-rules">This unit may make a normal move and retain its formation bonus while within range of its commander.</p><h3>Field standard</h3><p className="dt-rules">A unit carrying a field standard may re-roll one failed resolve test per round.</p></>}</fieldset><footer className="dt-inspector-foot"><BookOpen size={13} /> Open Field · Catalogue v1.4</footer></> : <div className="dt-empty"><Users size={28} /><h3>Select a unit</h3><p>Add a unit from the catalogue to start building.</p></div>}</aside>}
    </div></main>}</div>
    <input hidden type="file" ref={importRef} accept=".json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const data = JSON.parse(await file.text()); if (typeof data.name !== 'string' || !Array.isArray(data.units) || !data.units.every((u: Unit) => Number.isFinite(u.id) && typeof u.name === 'string' && ['Command', 'Core', 'Specialist', 'Support'].includes(u.role) && Number.isFinite(u.models) && u.models > 0 && Number.isFinite(u.points) && u.points >= 0 && typeof u.weapon === 'string' && typeof u.upgrade === 'boolean') || new Set(data.units.map((u: Unit) => u.id)).size !== data.units.length) throw Error(); setFlow({ kind: 'import', result: importResult(file.name, data, catalogue.map(c => c.name)) }); } catch { notify('Choose a Battle Augur prototype JSON export.'); } e.target.value = ''; }} />
    {command && !create && <ModalShell label="Command palette" onClose={() => { setCommand(false); setCreate(false); }}><header><h2>Where would you like to go?</h2><IconButton label="Close dialog" onClick={() => { setCommand(false); setCreate(false); }}><X size={17} /></IconButton></header><><button onClick={() => { setCommand(false); setCreate(true); }}><FilePlus2 size={16} /> Create a roster {bindings.newRoster && <kbd>{formatCombo(bindings.newRoster)}</kbd>}</button><button onClick={() => { setCommand(false); setView('welcome'); }}><Home size={16} /> Welcome & recent rosters</button>{(['rosters', 'lookup', 'tools', 'library', 'sources', 'settings'] as const).map(page => <button key={page} onClick={() => { setView(page); setCommand(false); }}>{hubPages[page].icon} {hubPages[page].label}{page === 'settings' && bindings.settings && <kbd>{formatCombo(bindings.settings)}</kbd>}</button>)}<button onClick={() => { chooseTheme(light ? 'dark' : 'light'); setCommand(false); }}><Sun size={16} /> Toggle appearance</button><small className="dt-command-label">RECENT ROSTERS</small>{recent.map(r => <button key={r.name} onClick={() => loadRecent(r.name)}><Layers3 size={16} />{r.name}<ArrowRight size={14} /></button>)}<small className="dt-command-label">PROTOTYPE STATES</small>{GALLERY_STATES.map(g => <button key={g.id} onClick={() => { setCommand(false); applyFlow(g.id); }}><Eye size={16} />{g.label}<ArrowRight size={14} /></button>)}</></ModalShell>}{create && <DesktopCreate sources={jobs.sources} onClose={() => setCreate(false)} onAddData={() => { setCreate(false); setSourceSelected('add'); setView('sources'); }} onCreate={r => { loadDoc([], [primaryForce(r.force, r.faction)]); setLimit(r.limit); setSelectedId(0); setRosterMeta({ faction: r.faction, force: r.force }); setHasRosters(true); setCreate(false); openRoster(r.name); notify(`Created “${r.name}”`); }} />}{flow?.kind === 'export' && <ExportDialog roster={exportData()} readOnly={!!readOnly} onClose={() => setFlow(null)} notify={notify} />}{flow?.kind === 'import' && <ImportDialog result={flow.result} version="v1.4" onOpen={() => openImport(flow.result)} onClose={() => setFlow(null)} />}{flow?.kind === 'add-force' && <AddForceDialog forces={forces} limit={limit} faction={rosterMeta.faction} onAdd={addForce} onClose={() => setFlow(null)} />}<ToastRegion toasts={toasts} />
  </div>;
}
/** Tools and Library are placeholders until the features arrive (1.2+); the same card as the phone and the tablet. */
function ComingSoonPage({ kind }: { kind: 'tools' | 'library' }) {
  return <main className="dtp-page dt-soon">{kind === 'tools'
    ? <ComingSoonCard icon={Hammer} title="Tools" description="Roster analytics, comparison, a game tracker and a dice simulator, for when the roster is done and the game starts." planned="Planned for 1.2+" covers="" />
    : <ComingSoonCard icon={BookMarked} title="Library" description="Units and detachments you saved from your rosters, ready to reuse in the next one." planned="Planned for 1.2+" covers="" />}</main>;
}
export function DesktopElements() {
  return <div className="dt-elements"><h1>Desktop workspace · Elements</h1><p>Floating window controls, curved workspace tabs, rounded card panels and compact controls. Colours come from the shared theme tokens (--ux-*), so light/dark and every colour scheme apply.</p><div className="ux-screen dark" style={{ height: 'auto', background: 'none', color: 'inherit' }}><div className="dt-element-tokens">{['--ux-bg', '--ux-surface', '--ux-surface-2', '--ux-accent', '--ux-muted', '--ux-ok', '--ux-warn'].map(c => <span key={c}><i style={{ background: `var(${c})` }} />{c}</span>)}</div></div><h2>Design library navigation</h2><LibrarySwitch current="desktop" label="Design library examples" /><h2>Floating chrome · welcome · recent rows</h2><DesktopWorkbench workflowScreen="desktop-welcome" /><h2>Curved tabs · catalogue · roster tree · inspector · validation</h2><DesktopWorkbench workflowScreen="desktop-editor" /><h2>Custom limit · configuration warning</h2><DesktopLimitElements /><h2>Hub pages · rosters · lookup · sources · settings</h2>{(['desktop-rosters', 'desktop-lookup', 'desktop-sources', 'desktop-settings', 'desktop-first-run', 'desktop-menus'] as const).map(screen => <DesktopWorkbench key={screen} workflowScreen={screen} />)}<p>States: selected, hover, empty roster, filtered catalogue, collapsed group, hidden panel, validation, over budget, profile, rules, light appearance, colour schemes, roster summary popover, points line, create and command dialogs. Use the controls above to explore.</p></div>;
}
