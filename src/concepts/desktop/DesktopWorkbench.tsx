import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowDownToLine, ArrowRight, BookMarked, CheckCheck, ChevronDown, ChevronRight, Command, Copy, Database, Eye, FilePlus2, FileUp, Flag, Home, Layers3, Hammer, LayoutPanelLeft, LibraryBig, ListFilter, Lock, Moon, PanelLeftClose, Plus, Search, Settings2, Shield, Sun, Swords, Trash2, Users, X } from 'lucide-react';
import type { ConceptProps } from '../shared';
import type { ColorScheme } from '../../types';
import { DesktopLookup10 } from './DesktopLookup10';
import { DesktopLookup, DesktopRosters, DesktopSettings, DesktopSources, PageTitle, WelcomeStart } from './DesktopPages';
import { DesktopCreate } from './DesktopCreate';
import { LibrarySwitch } from '../../gallery/LibrarySwitch';
import { ComingSoonCard } from '../ux/AppExtras';
import { DesktopMenuBar } from './DesktopMenuBar';
import { JobsPanel, JobsToggle, ReinstallDialog, useWorkspaceJobs } from '../workspace/Jobs';
import { installedSources, rosterLibrary } from './desktopData';
import { comboFromEvent, defaultBindings, formatCombo as formatComboFor, type DesktopOs, type KeyAction, type KeyBindings } from './desktopKeys';
import { CatalogueRow } from './DesktopCatalogueRow';
import { StarButton, StarredHeadingContent, useStars } from '../workspace/Stars';
import './desktop-stars.css';
import { AddForceDialog, unitName, CatalogueTarget, catalogueState, ExportDialog, ForceHeader, GALLERY_STATES, HistoryButtons, ImportDialog, IssueDetails, PRIMARY_FORCE_ID, ROLES, ReadOnlyBanner, ReadOnlyCatalogue, forceOf, galleryFlow, groupLimit, importResult, isTextEntry, primaryForce, readOnlyReason, revealInRoster, rosterIssues, sampleImport, specialRoster, unitCost, unitIssues, useRosterHistory, type EditorFlowState, type EditorUnit, type Force, type GalleryFlow, type HistoryStep, type ImportResult, type ReadOnlyInfo, type RosterIssue } from './DesktopEditorFlows';
import { IconButton } from '../workspace/Primitives';
import { PanelResizer } from '../workspace/PanelResizer';
import { ModalShell } from '../workspace/Dialog';
import { DesktopDataElements } from './DesktopDataElements';
import { ToastRegion, useToasts } from '../workspace/Toasts';
import { PointsLine, RosterSummary, SummaryToggle } from '../workspace/RosterSummary';
import { DesktopCatalogueStateElements, DesktopLimitElements, DesktopSourceStatusElements } from './DesktopLimitElements';
import { UnitDialog, type UnitDialogLevel } from './DesktopUnitDialog';
import './desktop.css';

type Unit = EditorUnit;
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
const screenView = (screen?: string): View => screen?.startsWith('desktop-links-') ? 'sources' : screen === 'desktop-first-run' || screen === 'desktop-stars-faction' ? 'welcome' : screen === 'desktop-stars-catalogue' || screen === 'desktop-stars-add-force' ? 'editor' : screen?.startsWith('desktop-lookup') ? 'lookup' : screen?.startsWith('desktop-editor') ? 'editor' : screen?.startsWith('desktop-settings') ? 'settings' : screen?.startsWith('desktop-') && screen.slice(8) in hubPages ? screen.slice(8) as View : 'welcome';
/** R0-02 (DEC-055): the unit editor dialog screens open Line Infantry (unit 2); the nested screen opens its squad leader. */
const screenDialog = (screen?: string): { id: number; path: UnitDialogLevel[] } | null => screen?.startsWith('desktop-editor-unit-dialog') || screen === 'desktop-editor-unit-rename' ? { id: 2, path: screen.endsWith('-nested') ? ['leader'] : [] } : null;
/** R0-03 (DEC-054): Lookup lifecycle states by screen ID. */
const lookupState = (screen?: string) => ({ 'desktop-lookup-1-0-loading': 'loading', 'desktop-lookup-1-0-failed': 'failed', 'desktop-lookup-1-0-unavailable': 'unavailable', 'desktop-lookup-1-0-text-200': 'text-200', 'desktop-lookup-1-0-text-150': 'text-150', 'desktop-lookup-1-0-no-data': 'no-data', 'desktop-lookup-1-0-start': 'start', 'desktop-lookup-1-0-narrow': 'narrow', 'desktop-lookup-1-0-narrow-entry': 'narrow' } as const)[screen ?? ''];
/** R0 gaps: static Lookup references by screen ID (the force screen is approved; the others open their group so the row shows). */
const lookupInitial = (screen?: string) => screen?.startsWith('desktop-lookup-1-0-detachment-') ? 'd-grand-muster' : ({ 'desktop-lookup-1-0-force': 'f-line-of-battle', 'desktop-lookup-1-0-detachment': 'd-line-formation', 'desktop-lookup-1-0-upgrade': 'up-line-rifle', 'desktop-lookup-1-0-rule': 'r-hold-line' } as Record<string, string>)[screen ?? ''];
const lookupOpenGroup = (screen?: string) => ['desktop-lookup-1-0-detachment', 'desktop-lookup-1-0-upgrade', 'desktop-lookup-1-0-rule'].includes(screen ?? '') || !!screen?.startsWith('desktop-lookup-1-0-detachment-');
/** F2 sections 2–3 (approved 2026-11-07): the large detachment's Layout states; on the desktop the detail shows on hover. */
const lookupLayout = (screen?: string) => ({ hover: true, keyOpen: screen === 'desktop-lookup-1-0-detachment-key-open', zeroOpen: screen === 'desktop-lookup-1-0-detachment-base-zero', tip: screen === 'desktop-lookup-1-0-detachment-hover' ? 'Transport' : undefined });
const KEYS_STORAGE = 'battle-augur.desktop.key-bindings';
function loadBindings(): KeyBindings {
  // Keys of retired actions (the inspector toggle, DEC-055) stored by an earlier session are dropped.
  try { const saved = JSON.parse(localStorage.getItem(KEYS_STORAGE) ?? '{}'); return { ...defaultBindings, ...Object.fromEntries(Object.entries(saved).filter(([id]) => id in defaultBindings)) }; } catch { return defaultBindings; }
}
const PANEL = { left: { initial: 260, min: 200, max: 440 } };
function Brand({ large = false }: { large?: boolean }) {
  return <span className={`dt-brand ${large ? 'large' : ''}`}><Swords strokeWidth={1.3} /><span className="dt-brand-spark">✦</span></span>;
}
/** First run is a separate instance so its empty state never leaks into the other screens. */
export function DesktopWorkbench(props: Partial<ConceptProps>) {
  // RK-03 (approved 2026-11-03): the Windows window chrome. `desktop-<screen>-windows` (or `&os=windows` on a standalone link) draws the
  // same screen with the Windows title bar row: no traffic lights, no menu bar, the caption buttons at the far right.
  if (props.workflowScreen?.endsWith('-windows')) return <Workbench {...props} workflowScreen={props.workflowScreen.slice(0, -'-windows'.length) as ConceptProps['workflowScreen']} os="windows" />;
  // R2-02 (F4b): the menu bar with Edit open, showing Rename unit… (F2).
  if (props.workflowScreen === 'desktop-menus-rename-unit') return <div className="dtm-preview"><DesktopMenuBar initialOpen="Edit" /><p className="dtm-preview-note">R2-02 · Edit › Rename unit… (F2) opens the selected unit's dialog with its name as the inline field. macOS only (RK-03); on Windows F2 and Ctrl+K reach it.</p><Workbench {...props} workflowScreen="desktop-editor-unit-renamed" /></div>;
  if (props.workflowScreen === 'desktop-menus-star-unit') return <div className="dtm-preview"><DesktopMenuBar initialOpen="Edit" /><p className="dtm-preview-note">R2-03 · Edit › Star unit toggles the star of the focused catalogue row. No default key (⌘D is Duplicate unit); Settings › Key bindings lists Star unit as Not set. macOS only (RK-03); on Windows a key set in Key bindings reaches it.</p><Workbench {...props} workflowScreen="desktop-stars-catalogue" /></div>;
  if (props.workflowScreen === 'desktop-menus') return <div className="dtm-preview"><DesktopMenuBar /><p className="dtm-preview-note">macOS only (RK-03). Windows has no menu bar: shortcuts keep working and Ctrl+K reaches the actions (see Windows · Welcome).</p><Workbench {...props} workflowScreen="desktop-editor" /></div>;
  // R0-03: Lookup at page zoom 200 % (desktop larger text is the page zoom).
  if (props.workflowScreen === 'desktop-lookup-1-0-text-200') return <div className="dtl-zoom-200"><Workbench {...props} /><span className="dtl-zoom-label">Page zoom 200 %</span></div>;
  // R0 gaps (UX-051 / UX-054): a very wide window drawn at 60 %, and Settings at page zoom 150 %.
  if (props.workflowScreen === 'desktop-settings-wide') return <div className="dtz" style={{ '--dtz': 0.6 } as React.CSSProperties}><Workbench {...props} /><span className="dtz-label">Wide window · shown at 60 %</span></div>;
  if (props.workflowScreen === 'desktop-settings-scale') return <div className="dtz" style={{ '--dtz': 1.5 } as React.CSSProperties}><Workbench {...props} /><span className="dtz-label">Page zoom 150 %</span></div>;
  // R0 gaps (LK-10): Lookup at page zoom 150 %, and in a narrow window (720 × 520), as the list and as the opened entry.
  if (props.workflowScreen === 'desktop-lookup-1-0-text-150') return <div className="dtz" style={{ '--dtz': 1.5 } as React.CSSProperties}><Workbench {...props} /><span className="dtz-label">Page zoom 150 %</span></div>;
  if (props.workflowScreen === 'desktop-lookup-1-0-narrow' || props.workflowScreen === 'desktop-lookup-1-0-narrow-entry') return <div className={`dtu-window-preview ${props.themeMode === 'light' ? 'light' : ''}`}><span className="dtu-window-label">Narrow window · 720 × 520</span><Workbench {...props} /></div>;
  // R0 gaps (DEC-055): the unit dialog at page zoom 200 %: the window is laid out at half its size, so the dialog takes the narrow, short rules.
  if (props.workflowScreen === 'desktop-editor-unit-dialog-zoom-200') return <div className="dtz" style={{ '--dtz': 2 } as React.CSSProperties}><Workbench {...props} /><span className="dtz-label">Page zoom 200 %</span></div>;
  // R0-02: a narrow window (720 × 520) on the gallery canvas; the unit dialog fills it minus small margins.
  if (props.workflowScreen === 'desktop-editor-unit-dialog-narrow') return <div className={`dtu-window-preview ${props.themeMode === 'light' ? 'light' : ''}`}><span className="dtu-window-label">Narrow window · 720 × 520</span><Workbench {...props} /></div>;
  // First run and the read-only unit dialog load their own roster, so each gets its own instance.
  return <Workbench key={props.workflowScreen === 'desktop-first-run' ? 'first-run' : props.workflowScreen === 'desktop-editor-unit-dialog-readonly' || props.workflowScreen === 'desktop-editor-unit-dialog-separated' || props.workflowScreen === 'desktop-editor-catalogue-limit' || props.workflowScreen === 'desktop-editor-unit-rename' || props.workflowScreen === 'desktop-editor-unit-renamed' ? props.workflowScreen : 'workspace'} {...props} />;
}
function Workbench({ os: osProp, ...props }: Partial<ConceptProps> & { os?: DesktopOs }) {
  const os: DesktopOs = osProp ?? (new URLSearchParams(location.search).get('os') === 'windows' ? 'windows' : 'mac');
  const formatCombo = (combo: string) => formatComboFor(combo, os);
  const firstRun = props.workflowScreen === 'desktop-first-run';
  const [view, setView] = useState<View>(screenView(props.workflowScreen));
  const [hub, setHub] = useState<Exclude<View, 'editor'>>(view === 'editor' ? 'welcome' : view);
  const [themePref, setThemePref] = useState<'system' | 'light' | 'dark'>(props.themePreference ?? props.themeMode ?? 'dark');
  const [light, setLight] = useState(props.themeMode === 'light');
  const [scheme, setScheme] = useState<ColorScheme>(props.colorScheme ?? 'default');
  const [summary, setSummary] = useState(false);
  // The roster document (units + forces) lives in an undo/redo history; see DesktopEditorFlows.tsx.
  // R2-02 (F4b): the renamed-unit screen shows Line Infantry (unit 2) named "Vanguard squad".
  const history = useRosterHistory<Unit>({ units: props.workflowScreen === 'desktop-editor-unit-dialog-separated' ? initialUnits.map(u => u.id === 2 ? { ...u, groups: [{ models: u.models - 1, weapon: u.weapon }, { models: 1, weapon: u.weapon }] } : u) : props.workflowScreen === 'desktop-editor-unit-renamed' ? initialUnits.map(u => u.id === 2 ? { ...u, customName: 'Vanguard squad' } : u) : initialUnits, forces: [primaryForce()] });
  const { units, forces } = history.doc;
  const [activeForce, setActiveForce] = useState(PRIMARY_FORCE_ID);
  const [flow, setFlow] = useState<EditorFlowState | null>(null);
  const [readOnly, setReadOnly] = useState<ReadOnlyInfo | null>(null);
  const editorKeys = useRef({ undo: () => {}, redo: () => {}, openExport: () => {}, starUnit: () => {} });
  const [selectedId, setSelectedId] = useState(2);
  const [limit, setLimit] = useState(1000);
  const [rosterName, setRosterName] = useState(recent[0].name);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All units');
  const [tab, setTab] = useState('Options');
  const [showLeft, setShowLeft] = useState(true);
  const [leftWidth, setLeftWidth] = useState(PANEL.left.initial);
  // R0-02 / UX-056 (DEC-055): the unit being edited in the dialog and the nested level inside it; null while closed.
  const [unitDialog, setUnitDialog] = useState(() => screenDialog(props.workflowScreen));
  const rosterRef = useRef<HTMLDivElement>(null);
  // DEC-054: Settings › Advanced › Enable Separate all (off by default).
  const [separateAll, setSeparateAll] = useState(props.workflowScreen === 'desktop-editor-unit-dialog-separated');
  const [command, setCommand] = useState(false);
  const [create, setCreate] = useState(props.workflowScreen === 'desktop-stars-faction');
  // R2-03 (F4c, approved 2026-11-08): starred units of the catalogue (the stars screens start with two) and the row drawn hovered.
  const starsScreen = !!props.workflowScreen?.startsWith('desktop-stars') || props.workflowScreen === 'desktop-menus-star-unit';
  const unitStars = useStars(props.workflowScreen === 'desktop-stars-catalogue' ? ['Line Infantry', 'Support Battery'] : []);
  const hoveredStar = props.workflowScreen === 'desktop-stars-catalogue' ? 'Field Marshal' : undefined;
  const [rosterOpen, setRosterOpen] = useState(!firstRun);
  const [hasRosters, setHasRosters] = useState(!firstRun);
  const [rosterMeta, setRosterMeta] = useState({ faction: 'Frontier Coalition', force: 'Expedition force' });
  const [jobsOpen, setJobsOpen] = useState(false);
  // DEC-060: the job whose Reinstall this version waits for confirmation.
  const [reinstalling, setReinstalling] = useState<string | null>(null);
  // R2-06 (F4e): the Collection links screens open Sources › Add game data with the Add collection dialog.
  const linksStart = props.workflowScreen?.startsWith('desktop-links-') ? props.workflowScreen.slice('desktop-links-'.length) : undefined;
  const [sourceSelected, setSourceSelected] = useState(firstRun || linksStart ? 'add' : 'open-field');
  const toasts = useToasts();
  const { notify } = toasts;
  const [bindings, setBindings] = useState<KeyBindings>(loadBindings);
  const [actionSlot, setActionSlot] = useState<HTMLElement | null>(null);
  const keyState = useRef({ bindings, view });
  keyState.current = { bindings, view };
  const viewSource = useCallback((id: string) => { setSourceSelected(id); setView('sources'); setJobsOpen(false); }, []);
  // DEC-022: installs bring every faction unless Advanced installation is on (Settings → Game data; `&install=advanced` on standalone links).
  const [advancedInstall, setAdvancedInstall] = useState(() => new URLSearchParams(location.search).get('install') === 'advanced');
  // DEC-050 (UX-059): Settings › Advanced › Focus search when opening the catalogue (off by default).
  const [focusSearch, setFocusSearch] = useState(false);
  // `&chip=<unit>` on a standalone link shows that catalogue row's state chip with its caption, as on hover (DEC-050).
  // The catalogue limit screen (R0-08) opens Force Commander's limit explanation the same way.
  const [chipShown] = useState(() => props.workflowScreen === 'desktop-editor-catalogue-limit' ? 'Force Commander' : new URLSearchParams(location.search).get('chip'));
  const jobs = useWorkspaceJobs(firstRun ? [] : installedSources, notify, viewSource, advancedInstall);
  const openJobs = () => { setJobsOpen(true); setSummary(false); };
  const saveBindings = (next: KeyBindings) => { setBindings(next); try { localStorage.setItem(KEYS_STORAGE, JSON.stringify(next)); } catch { /* prototype only */ } };
  // DX-01: the issue list is a section of the summary popover's status row; `issueUnit` narrows it to one unit's issues.
  const [checks, setChecks] = useState(false);
  const [issueUnit, setIssueUnit] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(100);
  useEffect(() => { setView(screenView(props.workflowScreen)); setUnitDialog(screenDialog(props.workflowScreen)); }, [props.workflowScreen]);
  useEffect(() => { if (view !== 'editor') setHub(view); }, [view]);
  useEffect(() => { setLight(props.themeMode === 'light'); }, [props.themeMode]);
  useEffect(() => { setScheme(props.colorScheme ?? 'default'); }, [props.colorScheme]);
  useEffect(() => {
    const run: Record<KeyAction, () => void> = {
      palette: () => setCommand(v => !v), newRoster: () => setCreate(true), rosters: () => setView('rosters'), lookup: () => setView('lookup'), settings: () => setView('settings'),
      summary: () => keyState.current.view === 'editor' && setSummary(v => !v), toggleCatalogue: () => keyState.current.view === 'editor' && setShowLeft(v => !v),
      undo: () => keyState.current.view === 'editor' && editorKeys.current.undo(), redo: () => keyState.current.view === 'editor' && editorKeys.current.redo(), exportRoster: () => keyState.current.view === 'editor' && editorKeys.current.openExport(),
      starUnit: () => keyState.current.view === 'editor' && editorKeys.current.starUnit(),
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
  const editing = unitDialog ? units.find(u => u.id === unitDialog.id) : undefined;
  // An undo that takes the edited unit away closes its dialog.
  useEffect(() => { if (unitDialog && !editing) setUnitDialog(null); }, [unitDialog, editing]);
  const openUnit = (id: number) => { setSelectedId(id); setTab('Options'); setUnitDialog({ id, path: [] }); setSummary(false); setJobsOpen(false); };
  // Close returns focus to the unit's row (or the roster heading when the unit is gone).
  const returnFocus = useRef<number | null>(null);
  const closeUnit = (focusId = unitDialog?.id) => { returnFocus.current = focusId ?? 0; setUnitDialog(null); };
  // After the dialog has gone (and the roster is no longer inert), focus goes back to the row that opened it.
  useEffect(() => {
    if (unitDialog || returnFocus.current === null) return;
    const id = returnFocus.current; returnFocus.current = null;
    (rosterRef.current?.querySelector<HTMLElement>(`[data-unit-id="${id}"] .dt-roster-unit`) ?? rosterRef.current?.querySelector<HTMLElement>('.dt-roster-unit'))?.focus({ preventScroll: true });
  }, [unitDialog]);
  const unlimited = limit === 0;
  const cost = unitCost;
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
    const target = editing;
    if (readOnly || !target) return;
    const what = change.notes !== undefined ? 'notes' : change.models !== undefined ? 'unit size' : change.weapon !== undefined ? change.weapon : change.upgrade !== undefined ? `Field standard ${change.upgrade ? 'on' : 'off'}` : change.leaderWeapon !== undefined ? `squad leader ${change.leaderWeapon}` : change.signalKit !== undefined ? `signal kit ${change.signalKit ? 'on' : 'off'}` : change.signal !== undefined ? `signal ${change.signal}` : 'options';
    history.edit(`${target.name}: ${what}`, d => ({ ...d, units: d.units.map(u => u.id === target.id ? { ...u, ...change } : u) }), { focus: target.id, merge: change.notes !== undefined ? `notes-${target.id}` : undefined });
  };
  /** R2-02 (F4b): name the unit in this roster (one undo step); an empty name clears the custom name. */
  const renameUnit = (name: string) => {
    const target = editing; if (readOnly || !target) return;
    history.edit(`Rename ${unitName(target)}`, d => ({ ...d, units: d.units.map(u => u.id === target.id ? { ...u, customName: name || undefined } : u) }), { focus: target.id });
  };
  // DEC-054 / UX-023: Separate 1 gives one model its own options; Separate all (opt-in in Settings › Advanced) does it for every model of the group.
  // The models stay in the same unit (a group of five becomes 4 + 1): no new unit, no new roster entry, totals unchanged.
  const separate = (index: number, all: boolean) => {
    const target = editing; if (readOnly || !target) return;
    const groups = target.groups ?? [{ models: target.models, weapon: target.weapon }];
    const group = groups[index]; if (!group || group.models < 2) return;
    const next = groups.flatMap((g, k) => k !== index ? [g] : all ? Array.from({ length: g.models }, () => ({ ...g, models: 1 })) : [{ ...g, models: g.models - 1 }, { ...g, models: 1 }]);
    const step = history.edit(all ? `Separate all of ${target.name}` : `Separate 1 from ${target.name}`, d => ({ ...d, units: d.units.map(u => u.id === target.id ? { ...u, groups: next } : u) }), { focus: target.id });
    notify(all ? `Every model of ${target.name} has its own options` : `1 model of ${target.name} has its own options`, withUndo(step));
  };
  // After undo/redo: keep a selection that exists, reveal the unit the step was about, offer the opposite step.
  const settle = (focus?: number) => { const doc = history.peek(); const keep = doc.units.find(u => u.id === focus) ?? doc.units.find(u => u.id === selectedId) ?? doc.units[0]; setSelectedId(keep?.id ?? 0); if (!doc.forces.some(f => f.id === activeForce)) setActiveForce(doc.forces[0]?.id ?? PRIMARY_FORCE_ID); return keep; };
  const afterStep = (step: HistoryStep | null, undone: boolean) => { if (!step) return; const keep = settle(step.focus); if (keep && keep.id === step.focus) revealInRoster(`[data-unit-id="${keep.id}"]`, false); notify(`${undone ? 'Undone' : 'Redone'}: ${step.label}`, { action: { label: undone ? 'Redo' : 'Undo', run: undone ? redo : undo } }); };
  const undo = () => { if (!readOnly) afterStep(history.undo(), true); };
  const redo = () => { if (!readOnly) afterStep(history.redo(), false); };
  const undoStep = (id: number) => { history.undoStep(id); settle(); };
  const withUndo = (step: number) => ({ action: { label: 'Undo', run: () => undoStep(step) } });
  const duplicateUnit = (target = selected, keepSelection = false) => { if (!target || readOnly) return; const id = nextId.current++; const step = history.edit(`Duplicate ${target.name}`, d => ({ ...d, units: [...d.units, { ...target, id }] }), { focus: id }); if (!keepSelection) { setSelectedId(id); revealInRoster(`[data-unit-id="${id}"]`, false); } notify(`${target.name} duplicated`, withUndo(step)); };
  const removeUnit = (target = selected) => { if (!target || readOnly) return; const step = history.edit(`Remove ${target.name}`, d => ({ ...d, units: d.units.filter(u => u.id !== target.id) }), { focus: target.id }); if (target.id === selectedId) setSelectedId(units.find(u => u.id !== target.id)?.id ?? 0); notify(`${target.name} removed`, withUndo(step)); };
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
    if (unit) { setCollapsed(c => c.filter(k => k !== `${forceOf(unit)}/${unit.role}`)); setSelectedId(unit.id); setActiveForce(forceOf(unit)); revealInRoster(`[data-unit-id="${unit.id}"]`); return; }
    if (t.forceId && t.group) { const key = `${t.forceId}/${t.group}`; setCollapsed(c => c.filter(k => k !== key)); setActiveForce(t.forceId); setShowLeft(true); setRole(t.group); revealInRoster(`[data-group="${key}"]`); }
  };
  const openIssues = (unitId: number | null = null) => { setIssueUnit(unitId); setChecks(true); setSummary(true); setJobsOpen(false); };
  const issuesShown = summary && checks;
  const openExport = () => { setSummary(false); setFlow({ kind: 'export' }); };
  const findData = () => { setSourceSelected(readOnly?.sourceId ?? 'open-field'); setView('sources'); };
  const duplicateRoster = () => { const name = `${rosterName} (copy)`; setReadOnly(null); history.reset(history.peek()); setHasRosters(true); openRoster(name); notify(`Opened “${name}”, an editable copy. The original stays read-only.`); };
  const openImport = (r: ImportResult) => { loadDoc(r.units as Unit[], r.forces); setLimit(r.limit); setRosterMeta({ faction: r.faction, force: r.forces[0].type }); nextId.current = Math.max(100, ...r.units.map(u => u.id)) + 1; setSelectedId(r.units[0]?.id ?? 0); setHasRosters(true); openRoster(r.name); notify(r.unmatched.length ? `Imported “${r.name}” without ${r.unmatched.length} ${r.unmatched.length === 1 ? 'entry' : 'entries'}` : `Imported “${r.name}”`); };
  const applyFlow = (f: GalleryFlow) => {
    if (f === 'read-only') return loadRecent('Ember patrol');
    if (f === 'export-read-only') { loadRecent('Ember patrol'); setFlow({ kind: 'export' }); return; }
    if (f === 'forces') return loadRecent('Harbour defence');
    if (f === 'issues') { loadRecent('Operation First Light'); openIssues(); return; }
    if (view !== 'editor' || readOnly || !rosterOpen) loadRecent(recent[0].name);
    setFlow(f === 'export' ? { kind: 'export' } : f === 'add-force' ? { kind: 'add-force' } : { kind: 'import', result: sampleImport(f === 'import-partial') });
  };
  editorKeys.current = { undo: () => { if (!flow && !command && !create) undo(); }, redo: () => { if (!flow && !command && !create) redo(); }, openExport: () => { if (rosterOpen && !create) openExport(); },
    // R2-03: Star unit (Edit menu, a user-set key) toggles the focused catalogue row's star.
    starUnit: () => { const name = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('[data-cat-entry]')?.dataset.catEntry; if (name && starsScreen) unitStars.toggle(name); } };
  useEffect(() => {
    // F3 gallery screens: the export dialog at a format, and on the read-only roster.
    if (props.workflowScreen === 'desktop-stars-add-force') { setFlow({ kind: 'add-force' }); return; }
    if (props.workflowScreen === 'desktop-editor-export-pdf' || props.workflowScreen === 'desktop-editor-export-json') { loadRecent(recent[0].name); setFlow({ kind: 'export', format: props.workflowScreen === 'desktop-editor-export-pdf' ? 'pdf' : 'json' }); return; }
    const f = galleryFlow() ?? (props.workflowScreen === 'desktop-editor-unit-dialog-readonly' ? 'read-only' : props.workflowScreen === 'desktop-editor-export-readonly' ? 'export-read-only' : null); if (f) applyFlow(f);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const addUnit = (unit: typeof catalogue[number]) => { if (readOnly) return; const id = nextId.current++; const target = forces.find(f => f.id === activeForce) ?? forces[0]; const step = history.edit(`Add ${unit.name}`, d => ({ ...d, units: [...d.units, { ...unit, id, upgrade: false, forceId: target.id }] }), { focus: id }); setSelectedId(id); setCollapsed(c => c.filter(k => k !== `${target.id}/${unit.role}`)); revealInRoster(`[data-unit-id="${id}"]`, false); notify(`${unit.name} added to ${forces.length > 1 ? target.name : 'roster'}`, withUndo(step)); };
  const forcePoints = (id: string) => units.filter(u => forceOf(u) === id).reduce((n, u) => n + cost(u), 0);
  const exportData = () => ({ name: rosterName, limit, total, system: readOnly?.system ?? 'Open Field', faction: rosterMeta.faction, forces: forces.map(f => ({ ...f, points: forcePoints(f.id), units: units.filter(u => forceOf(u) === f.id) })), file: { name: rosterName, limit, forces, units } });
  return <div className={`dt-app dt-os-${os} dt-view-${view} ${view !== 'editor' ? 'dt-hub' : ''} ux-screen ${light ? 'light' : 'dark'} ux-scheme-${scheme}`}>
    <div className="dt-floating-chrome" inert={!!editing}>
      {os === 'mac' && <div className="dt-traffic" aria-hidden="true"><i /><i /><i /></div>}
      <nav className="dt-workspace-tabs" aria-label="Open workspace tabs"><button className={view !== 'editor' ? 'active' : ''} aria-current={view !== 'editor' ? 'page' : undefined} onClick={() => setView(hub)}>{hubPages[hub].icon} {hubPages[hub].label}</button>{rosterOpen && <button className={view === 'editor' ? 'active' : ''} aria-current={view === 'editor' ? 'page' : undefined} title={readOnly ? 'Read-only roster' : undefined} onClick={() => setView('editor')}>{readOnly ? <Lock size={14} /> : <Layers3 size={14} />} {rosterName}<span className="dt-dot" /></button>}<IconButton label="New roster" onClick={() => setCreate(true)}><Plus size={16} /></IconButton></nav>
      <div className="dt-floating-actions"><JobsToggle jobs={jobs.jobs} open={jobsOpen} onToggle={() => jobsOpen ? setJobsOpen(false) : openJobs()} /><div className="dt-page-actions" ref={setActionSlot} />{view === 'editor' && <SummaryToggle total={total} limit={limit} issueCount={readOnly ? 0 : issues.length} open={summary} onToggle={() => { setSummary(v => !v); setJobsOpen(false); }} />}{view === 'editor' && <IconButton label="Toggle catalogue" active={showLeft} onClick={() => setShowLeft(v => !v)}><LayoutPanelLeft size={17} /></IconButton>}</div>{os === 'windows' && <WindowsCaption />}
    </div>
    {view === 'editor' && !summary && <PointsLine total={total} limit={limit} />}
    {jobsOpen && jobs.jobs.length > 0 && <JobsPanel jobs={jobs.jobs} onChoose={jobs.chooseFactions} onCancel={jobs.cancel} onReinstall={setReinstalling} onHide={() => setJobsOpen(false)} onClear={() => { jobs.clearEnded(); if (!jobs.jobs.some(j => j.status === 'running' || j.status === 'needs-you')) setJobsOpen(false); }} onViewSource={viewSource} />}
    {view === 'editor' && summary && <RosterSummary name={rosterName} faction={rosterMeta.faction} force={rosterMeta.force} total={total} limit={limit} issueCount={issues.length} customLimit onLimit={setLimit} onShowIssues={() => { setChecks(v => !v); setIssueUnit(null); }} paused={!!readOnly}
      issuesOpen={checks} issues={<IssueDetails issues={issueUnit === null ? issueList : unitIssues(issueList, issueUnit)} onShow={showIssue} unit={issueUnit === null ? undefined : units.find(u => u.id === issueUnit)?.name} onAll={() => setIssueUnit(null)} />}
      data={{ name: 'Open Field', version: 'v1.4', onClick: () => notify('Open Field · v1.4 · sample catalogue is ready offline') }}
      actions={[{ label: 'Export roster…', icon: <ArrowDownToLine size={15} />, kbd: bindings.exportRoster ? formatCombo(bindings.exportRoster) : undefined, onClick: openExport }, { label: 'New roster', icon: <FilePlus2 size={15} />, kbd: bindings.newRoster ? formatCombo(bindings.newRoster) : undefined, onClick: () => setCreate(true) }]} />}
    <div className="dt-body" inert={!!editing}>{view !== 'editor' && <nav className="dt-activity" aria-label="Workspace"><Brand /><IconButton label="Welcome" active={view === 'welcome'} onClick={() => setView('welcome')}><Home size={20} /></IconButton><IconButton label="Rosters" active={view === 'rosters'} onClick={() => setView('rosters')}><LibraryBig size={20} /></IconButton><IconButton label="Lookup" active={view === 'lookup'} onClick={() => setView('lookup')}><Search size={20} /></IconButton><IconButton label="Tools (coming soon)" active={view === 'tools'} onClick={() => setView('tools')}><Hammer size={20} /></IconButton><IconButton label="Library (coming soon)" active={view === 'library'} onClick={() => setView('library')}><BookMarked size={20} /></IconButton><span className="dt-activity-rule" /><IconButton label="Sources" active={view === 'sources'} onClick={() => setView('sources')}><Database size={20} /></IconButton><div className="dt-activity-bottom"><IconButton label={light ? 'Switch to dark appearance' : 'Switch to light appearance'} onClick={() => chooseTheme(light ? 'dark' : 'light')}>{light ? <Moon size={19} /> : <Sun size={19} />}</IconButton><IconButton label="Settings" active={view === 'settings'} onClick={() => setView('settings')}><Settings2 size={20} /></IconButton><span className="dt-avatar">O</span></div></nav>}
      {view === 'rosters' ? <DesktopRosters initialRosters={hasRosters ? rosterLibrary : []} onOpen={loadRecent} onCreate={() => setCreate(true)} onImport={() => importRef.current?.click()} notify={notify} /> : view === 'lookup' ? props.workflowScreen !== 'desktop-lookup-legacy' ? <DesktopLookup10 key={props.workflowScreen} layout={lookupLayout(props.workflowScreen)} initial={lookupInitial(props.workflowScreen)} openGroup={!!lookupOpenGroup(props.workflowScreen)} narrowEntry={props.workflowScreen === 'desktop-lookup-1-0-narrow-entry'} state={lookupState(props.workflowScreen)} onAddData={() => { setSourceSelected('add'); setView('sources'); }} /> : <DesktopLookup onOpenRoster={loadRecent} /> : view === 'tools' ? <ComingSoonPage kind="tools" /> : view === 'library' ? <ComingSoonPage kind="library" /> : view === 'sources' ? <DesktopSources initialCollection={linksStart} onOpenRoster={loadRecent} notify={notify} jobs={jobs} selectedId={sourceSelected} onSelect={setSourceSelected} onOpenJobs={openJobs} /> : view === 'settings' ? <DesktopSettings themePref={themePref} onThemePref={chooseTheme} scheme={scheme} onScheme={chooseScheme} bindings={bindings} onBindings={saveBindings} advancedInstall={advancedInstall} onAdvancedInstall={setAdvancedInstall} focusSearch={focusSearch} onFocusSearch={setFocusSearch} separateAll={separateAll} onSeparateAll={setSeparateAll} initialSection={props.workflowScreen === 'desktop-settings-advanced' ? 'advanced' : props.workflowScreen === 'desktop-settings-developer' ? 'developer' : props.workflowScreen === 'desktop-settings-debug' ? 'debug' : new URLSearchParams(location.search).get('section') ?? undefined} initialQuery={props.workflowScreen === 'desktop-settings-search' ? 'data' : props.workflowScreen === 'desktop-settings-search-empty' ? 'hidden' : undefined} initialDeveloper={props.workflowScreen === 'desktop-settings-developer' || props.workflowScreen === 'desktop-settings-debug'} initialDebug={props.workflowScreen === 'desktop-settings-debug'} initialScale={props.workflowScreen === 'desktop-settings-scale' ? 150 : undefined} notify={notify} /> : view === 'welcome' ? <main className="dt-welcome"><div className="dt-welcome-content"><section className="dt-intro"><Brand large /><div className="dt-eyebrow">PLAN WITH PURPOSE.</div><h1>Every great battle<br />starts here.</h1><p>A clear head. A considered roster.<br />Your next force is taking shape.</p><div className="dt-start-actions"><button className="dt-primary" onClick={() => setCreate(true)}><Plus size={16} /> Create a roster {bindings.newRoster && <kbd>{formatCombo(bindings.newRoster)}</kbd>}</button><button onClick={() => importRef.current?.click()}><FileUp size={16} /> Import a roster <ArrowRight size={15} /></button><button onClick={() => setView('sources')}><Database size={16} /> Manage game data <ArrowRight size={15} /></button></div><div className="dt-local"><CheckCheck size={14} /> Your workspace, available offline.</div></section>{!jobs.sources.length || !hasRosters ? <WelcomeStart jobs={jobs} onCreate={() => setCreate(true)} onImport={() => importRef.current?.click()} onAddData={() => { setSourceSelected('add'); setView('sources'); }} onOpenJobs={openJobs} /> : <section className="dt-recents"><header><h2>Pick up where you left off</h2><span>RECENT ROSTERS</span></header>{recent.map((r, i) => <button key={r.name} className="dt-recent-row" onClick={() => loadRecent(r.name)}><span className={`dt-monogram tone-${i}`}>{r.mark}</span><span className="dt-recent-info"><strong>{r.name}</strong><small>{r.faction} <b>·</b> {r.points} pts</small></span><span className="dt-recent-date">{r.date}<ChevronRight size={15} /></span></button>)}<div className="dt-recent-footer"><span>Stored on this device</span><button onClick={() => setView('rosters')}>All rosters <ArrowRight size={14} /></button></div><aside className="dt-tip"><Command size={16} /><p>A little less clicking.<br /><span>Jump to rosters, units and actions with <kbd>{bindings.palette ? formatCombo(bindings.palette) : "the command palette"}</kbd></span></p></aside></section>}</div><footer className="dt-welcome-footer"><span className="dt-welcome-status">{jobs.sources.length ? 'All systems ready' : 'No game data yet'} <i className={`dt-dot ${jobs.sources.length ? '' : 'idle'}`} /></span><span>DESIGNED FOR THE WAY YOU BUILD.</span><span>Battle Augur <b> / </b> Desktop exploration 01</span></footer></main> : <main className="dt-editor"><div className={`dt-panels no-right ${!showLeft ? 'no-left' : ''}`} style={{ gridTemplateColumns: `${showLeft ? `${leftWidth}px ` : ''}minmax(320px, 1fr)` }}>{showLeft && <PanelResizer side="left" width={leftWidth} limits={PANEL.left} label="Resize catalogue" onWidth={setLeftWidth} />}
      {showLeft && readOnly && <ReadOnlyCatalogue info={readOnly} onFindData={findData} onHide={() => setShowLeft(false)} />}
      {showLeft && !readOnly && <aside className="dt-catalogue" aria-label="Unit catalogue"><header className="dt-panel-heading dte-pane-tools"><label className="dt-search"><Search size={14} /><input ref={searchRef} placeholder="Find a unit…" aria-label="Find a unit" value={query} onChange={e => setQuery(e.target.value)} /><kbd>⌕</kbd></label><IconButton label="Hide catalogue" onClick={() => setShowLeft(false)}><PanelLeftClose size={15} /></IconButton></header><div className="dt-catalogue-tools"><div className="dt-filter"><ListFilter size={13} /><select aria-label="Filter unit role" value={role} onChange={e => setRole(e.target.value)}>{['All units', 'Command', 'Core', 'Specialist', 'Support'].map(r => <option key={r}>{r}</option>)}</select><span>{catalogue.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) && (role === 'All units' || role === u.role)).length} units</span></div><CatalogueTarget forces={forces} active={activeForce} onChange={setActiveForce} /></div><div className="dt-catalogue-list">{(() => { const shownUnit = (u: typeof catalogue[number]) => u.name.toLowerCase().includes(query.toLowerCase()) && (role === 'All units' || role === u.role); const starred = starsScreen ? catalogue.filter(u => unitStars.isStarred(u.name) && shownUnit(u)) : []; const catRow = (u: typeof catalogue[number]) => <CatalogueRow key={u.name} entry={u} state={catalogueState(u, units.filter(unit => forceOf(unit) === activeForce), forces.find(f => f.id === activeForce))} onAdd={() => addUnit(u)} hintOpen={chipShown === u.name} star={starsScreen ? { on: unitStars.isStarred(u.name), onToggle: () => unitStars.toggle(u.name) } : undefined} hovered={hoveredStar === u.name} />;
        /* R2-03: the Starred group first (accent heading, star glyph, count); its rows are not repeated and keep their state; the role filter and search apply to it. No stars: no group. */
        return <>{starred.length > 0 && <section aria-label="Starred"><h3 className="ws-starred-head"><StarredHeadingContent count={starred.length} glyph={11} /></h3>{starred.map(catRow)}</section>}{['Command', 'Core', 'Specialist', 'Support'].map(group => { const entries = catalogue.filter(u => u.role === group && shownUnit(u) && !starred.includes(u)); return entries.length ? <section key={group}><h3>{group}<span>{entries.length}</span></h3>{entries.map(catRow)}</section> : null; })}</>; })()}{!catalogue.some(u => u.name.toLowerCase().includes(query.toLowerCase()) && (role === 'All units' || role === u.role)) && <p className="dt-empty">No units match. Try another search.</p>}</div><footer className="dt-panel-foot"><Database size={12} /> Frontier Coalition <span>v1.4</span></footer></aside>}
      <section className="dt-roster"><header className="dt-panel-heading"><span>{forces.length > 1 ? 'Your forces' : 'Your force'} <small>{units.length} units{forces.length > 1 ? ` · ${forces.length} forces` : ''}</small></span><span className="dte-heading-actions"><HistoryButtons undoLabel={history.undoLabel} redoLabel={history.redoLabel} undoKey={bindings.undo} redoKey={bindings.redo} disabledReason={roReason} onUndo={undo} onRedo={redo} /><IconButton label={issues.length && !readOnly ? `Show validation (${issues.length})` : 'Show validation'} active={issuesShown} onClick={() => issuesShown ? setSummary(false) : openIssues()}><span className="dte-shield"><Shield size={15} />{issues.length > 0 && !readOnly && <b className="dte-badge">{issues.length}</b>}</span></IconButton></span></header>{readOnly && <ReadOnlyBanner info={readOnly} onDuplicate={duplicateRoster} onFindData={findData} onExport={openExport} />}<div className="dt-roster-scroll" ref={rosterRef}>{forces.map(force => { const own = units.filter(u => forceOf(u) === force.id); return <div className="dte-force" key={force.id}><ForceHeader force={force} points={forcePoints(force.id)} units={own.length} active={force.id === activeForce} showActive={forces.length > 1} canRemove={forces.length > 1} readOnlyReason={roReason} onSelect={() => setActiveForce(force.id)} onRename={name => renameForce(force.id, name)} onRemove={() => removeForce(force.id)} />{ROLES.map(group => { const key = `${force.id}/${group}`; const entries = own.filter(u => u.role === group); return <section className="dt-roster-group" key={group} data-group={key}><button className="dt-group-heading" aria-expanded={!collapsed.includes(key)} onClick={() => setCollapsed(c => c.includes(key) ? c.filter(g => g !== key) : [...c, key])}>{collapsed.includes(key) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}<span>{group}</span><small>{entries.length} {groupLimit(force, group)}</small><b>{entries.reduce((n, u) => n + cost(u), 0)} pts</b></button>{!collapsed.includes(key) && entries.map(u => { const pick = () => { setActiveForce(force.id); openUnit(u.id); }; const problems = readOnly ? [] : unitIssues(issueList, u.id); return <div key={u.id} data-unit-id={u.id} className={`dte-unit-row ${u.id === selectedId ? 'selected' : ''}`}><button className="dt-roster-unit" aria-haspopup="dialog" onClick={pick}><span className="dt-unit-icon">{u.role === 'Command' ? <Flag size={18} /> : u.role === 'Support' ? <Swords size={18} /> : <Users size={18} />}</span><span className="dt-unit-info"><strong>{unitName(u)} {u.id === 2 && rosterName === 'The Ashen Expedition' && <span className="dt-unit-tag">ALPHA</span>}</strong><small>{u.customName && <>{u.name} <b>·</b> </>}{u.models} {u.models === 1 ? 'model' : 'models'} <b>·</b> {u.weapon}{u.upgrade ? ' · Field standard' : ''}</small></span></button>{!readOnly && <span className="dte-row-actions"><IconButton label={`Duplicate ${u.name}`} onClick={() => duplicateUnit(u)}><Copy size={13} /></IconButton><IconButton label={`Remove ${u.name}`} onClick={() => removeUnit(u)}><Trash2 size={13} /></IconButton></span>}{problems.length > 0 && <button type="button" className="dte-unit-issue" aria-label={`${problems.length} ${problems.length === 1 ? 'issue' : 'issues'}: show the issues of ${u.name}`} title={`Show the issues of ${u.name}`} onClick={() => openIssues(u.id)}><AlertTriangle size={14} /></button>}<span className="dte-unit-end" onClick={pick}><span className="dt-unit-points">{cost(u)}<small>pts</small></span><ChevronRight size={13} /></span></div>; })}{!collapsed.includes(key) && entries.length === 0 && <button className="dt-add-empty" disabled={!!readOnly} title={roReason} onClick={() => { setShowLeft(true); setRole(group); setActiveForce(force.id); if (focusSearch) requestAnimationFrame(() => searchRef.current?.focus()); }}> <Plus size={14} /> Add {group.toLowerCase()} unit</button>}</section>; })}</div>; })}<button className="dt-add-force" disabled={!!readOnly} title={roReason ?? 'Add another force to this roster'} onClick={() => setFlow({ kind: 'add-force' })}><Plus size={14} /> Add detachment</button></div></section>
    </div></main>}</div>
    <input hidden type="file" ref={importRef} accept=".json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const data = JSON.parse(await file.text()); if (typeof data.name !== 'string' || !Array.isArray(data.units) || !data.units.every((u: Unit) => Number.isFinite(u.id) && typeof u.name === 'string' && ['Command', 'Core', 'Specialist', 'Support'].includes(u.role) && Number.isFinite(u.models) && u.models > 0 && Number.isFinite(u.points) && u.points >= 0 && typeof u.weapon === 'string' && typeof u.upgrade === 'boolean') || new Set(data.units.map((u: Unit) => u.id)).size !== data.units.length) throw Error(); setFlow({ kind: 'import', result: importResult(file.name, data, catalogue.map(c => c.name)) }); } catch { notify('Choose a Battle Augur prototype JSON export.'); } e.target.value = ''; }} />
    {command && !create && <ModalShell label="Command palette" onClose={() => { setCommand(false); setCreate(false); }}><header><h2>Where would you like to go?</h2><IconButton label="Close dialog" onClick={() => { setCommand(false); setCreate(false); }}><X size={17} /></IconButton></header><><button onClick={() => { setCommand(false); setCreate(true); }}><FilePlus2 size={16} /> Create a roster {bindings.newRoster && <kbd>{formatCombo(bindings.newRoster)}</kbd>}</button><button onClick={() => { setCommand(false); setView('welcome'); }}><Home size={16} /> Welcome & recent rosters</button>{(['rosters', 'lookup', 'tools', 'library', 'sources', 'settings'] as const).map(page => <button key={page} onClick={() => { setView(page); setCommand(false); }}>{hubPages[page].icon} {hubPages[page].label}{page === 'settings' && bindings.settings && <kbd>{formatCombo(bindings.settings)}</kbd>}</button>)}<button onClick={() => { chooseTheme(light ? 'dark' : 'light'); setCommand(false); }}><Sun size={16} /> Toggle appearance</button><small className="dt-command-label">RECENT ROSTERS</small>{recent.map(r => <button key={r.name} onClick={() => loadRecent(r.name)}><Layers3 size={16} />{r.name}<ArrowRight size={14} /></button>)}<small className="dt-command-label">PROTOTYPE STATES</small>{GALLERY_STATES.map(g => <button key={g.id} onClick={() => { setCommand(false); applyFlow(g.id); }}><Eye size={16} />{g.label}<ArrowRight size={14} /></button>)}</></ModalShell>}{create && <DesktopCreate sources={jobs.sources} stars={props.workflowScreen === 'desktop-stars-faction'} onClose={() => setCreate(false)} onAddData={() => { setCreate(false); setSourceSelected('add'); setView('sources'); }} onCreate={r => { loadDoc([], [primaryForce(r.force, r.faction)]); setLimit(r.limit); setSelectedId(0); setRosterMeta({ faction: r.faction, force: r.force }); setHasRosters(true); setCreate(false); openRoster(r.name); notify(`Created “${r.name}”`); }} />}{flow?.kind === 'export' && <ExportDialog roster={exportData()} readOnly={!!readOnly} initialFormat={flow.format} onClose={() => setFlow(null)} notify={notify} />}{flow?.kind === 'import' && <ImportDialog result={flow.result} version="v1.4" onOpen={() => openImport(flow.result)} onClose={() => setFlow(null)} />}{flow?.kind === 'add-force' && <AddForceDialog forces={forces} limit={limit} faction={rosterMeta.faction} stars={starsScreen} onAdd={addForce} onClose={() => setFlow(null)} />}{view === 'editor' && editing && unitDialog && <UnitDialog unit={editing} forceName={forces.find(f => f.id === forceOf(editing))?.name ?? ''} source={readOnly ? `${readOnly.system} · as last saved` : undefined} path={unitDialog.path} tab={tab} readOnlyReason={roReason} separateAll={separateAll}
      undo={{ undoLabel: history.undoLabel, redoLabel: history.redoLabel, undoKey: bindings.undo, redoKey: bindings.redo, onUndo: undo, onRedo: redo }}
      onRename={renameUnit} initialRename={props.workflowScreen === 'desktop-editor-unit-rename' ? 'Vanguard squad' : undefined}
      onPath={path => setUnitDialog({ id: editing.id, path })} onTab={setTab} onClose={() => closeUnit()} onUpdate={update} onSeparate={separate}
      onDuplicate={() => duplicateUnit(editing, true)} onRemove={() => { const group = units.filter(u => forceOf(u) === forceOf(editing) && u.role === editing.role); const at = group.findIndex(u => u.id === editing.id); const next = group[at + 1] ?? group[at - 1] ?? units.find(u => u.id !== editing.id); removeUnit(editing); closeUnit(next?.id); }} />}<ToastRegion toasts={toasts} />
    {(() => { const job = jobs.jobs.find(j => j.id === reinstalling && j.status === 'needs-you'); return job ? <ReinstallDialog job={job} onClose={() => setReinstalling(null)} onConfirm={() => { setReinstalling(null); jobs.reinstall(job.id); openJobs(); }} /> : null; })()}
  </div>;
}
/** Tools and Library are placeholders until the features arrive (1.2+); the same card as the phone and the tablet. */
/** RK-03: Windows' own minimise / maximise / close (Electron titleBarOverlay), drawn in the chrome colours of the theme. System chrome, so hidden from the app's accessible tree. */
function WindowsCaption() {
  return <div className="dt-win-caption" aria-hidden="true" title="Windows window controls (system)">
    <span className="dt-win-min"><svg viewBox="0 0 10 10"><path d="M0 5.5h10" /></svg></span>
    <span className="dt-win-max"><svg viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" rx="1" /></svg></span>
    <span className="dt-win-close"><svg viewBox="0 0 10 10"><path d="M0.5 0.5l9 9M9.5 0.5l-9 9" /></svg></span>
  </div>;
}
function ComingSoonPage({ kind }: { kind: 'tools' | 'library' }) {
  return <main className="dtp-page dt-soon"><PageTitle>{kind === 'tools' ? 'Tools' : 'Library'}</PageTitle>{kind === 'tools'
    ? <ComingSoonCard icon={Hammer} title="Tools" description="Roster analytics, comparison, a game tracker and a dice simulator, for when the roster is done and the game starts." planned="Planned for a later release" covers="" />
    : <ComingSoonCard icon={BookMarked} title="Library" description="Units and detachments you saved from your rosters, ready to reuse in the next one." planned="Planned for an early update" covers="" />}</main>;
}
export function DesktopElements() {
  return <div className="dt-elements"><h1>Desktop workspace · Elements</h1><p>Floating window controls, curved workspace tabs, rounded card panels and compact controls. Colours come from the shared theme tokens (--ux-*), so light/dark and every colour scheme apply.</p><div className="ux-screen dark" style={{ height: 'auto', background: 'none', color: 'inherit' }}><div className="dt-element-tokens">{['--ux-bg', '--ux-surface', '--ux-surface-2', '--ux-accent', '--ux-muted', '--ux-ok', '--ux-warn'].map(c => <span key={c}><i style={{ background: `var(${c})` }} />{c}</span>)}</div></div><h2>Design library navigation</h2><LibrarySwitch current="desktop" label="Design library examples" /><h2>Floating chrome · welcome · recent rows</h2><DesktopWorkbench workflowScreen="desktop-welcome" /><h2>Windows title bar row (RK-03) · tab row with window controls, no menu bar</h2><p>Approved 2026-11-03. On Windows the tab row is the title bar (drag to move, double-click maximises); there is no menu bar, shortcuts keep working and Ctrl+K reaches the actions. Tabs start 12 px from the edge; Windows' minimise, maximise and close sit at the far right after Jobs, in the theme's chrome colours. macOS is unchanged (above).</p><DesktopWorkbench workflowScreen="desktop-welcome-windows" /><DesktopWorkbench workflowScreen="desktop-editor-windows" /><h2>Curved tabs · catalogue · roster tree · validation</h2><p>R0-02 / UX-056 (DEC-055): no inspector pane; the roster takes the width beside the catalogue. Selecting a unit row (click, or Enter on the focused row) opens the unit editor dialog. The toolbar keeps Toggle catalogue only; Toggle inspector, View › Show inspector and its key binding are retired, and Edit › Edit unit… (↩) opens the selected unit.</p><DesktopWorkbench workflowScreen="desktop-editor" />
      <h2>Unit editor dialog (R0-02 · DEC-055) · normal · nested · narrow window · read-only</h2><p>A modal dialog over the dimmed, inert roster: 680 px wide at most and the window minus 32 px high at most, centred; the header (eyebrow, name, points, force, Duplicate / Remove, Undo / Redo, Close) and the tabs stay, the body scrolls, the footer says changes save as you edit. It edits the roster's live session (autosave, each change an Undo step; no Save / Cancel). Close, Escape or a click on the roster closes it and returns focus to the unit row; Tab and Shift+Tab stay inside. Nested elements (Squad leader, its Signal kit) push a level: Back and a breadcrumb in the header, Escape goes back one level, then closes, and focus returns to the row that opened the level. Windows narrower than 760 px or lower than 560 px: the dialog fills the window minus 8 px. Read-only rosters open it with the reason and disabled controls; nested levels stay viewable. Separate 1 shows for units with several models; Separate all only with Settings › Advanced › Enable Separate all. Separating never makes a unit or a roster entry: the models stay in this unit and only get their own options (a group of five becomes 4 + 1, totals unchanged); after Separate 1 the dialog lists each group with its own count, Separate buttons and Primary weapon (desktop-editor-unit-dialog-separated).</p>{(['desktop-editor-unit-dialog', 'desktop-editor-unit-dialog-separated', 'desktop-editor-unit-dialog-nested', 'desktop-editor-unit-dialog-narrow', 'desktop-editor-unit-dialog-readonly'] as const).map(screen => <DesktopWorkbench key={screen} workflowScreen={screen} />)}
      <h2>Rename a unit (R2-02 · F4b · approved 2026-11-07) · pencil and inline field · Edit › Rename unit… · renamed row</h2><p>The unit dialog's name has a pencil beside it (hidden while read-only; Rename unit (F2) as its hint). It turns the name into a selected inline field, the DD-19 force rename pattern, with “entry name · Enter saves, Esc cancels” under it: Enter or leaving the field saves (one Undo step), Esc cancels and keeps the dialog open, the focus returns to the pencil; up to 60 characters; an empty name clears the custom name. Edit › Rename unit… (F2), enabled when a unit is selected in an editable roster, opens that unit's dialog with the field. The tree row shows the custom name, with the entry name first on its second line.</p><DesktopWorkbench workflowScreen="desktop-editor-unit-rename" /><DesktopWorkbench workflowScreen="desktop-editor-unit-renamed" /><h2>Starred entries (R2-03 · F4c · approved 2026-11-08) · star button · Starred group · New roster · Add force · Edit › Star unit</h2><p>A star before the name on catalogue rows, the New roster faction list and Add force's force types. With a mouse the outline star shows only on the hovered or keyboard-focused row (its slot stays, so names line up); filled stars, in the accent colour (not the Slot full amber), always show. The star is its own Tab stop before the row's Add. Units get a Starred group above the role groups (accent heading, star glyph, count); starred rows are not repeated and keep their state; the role filter and search apply to it. Factions and forces: starred first, a divider, then the rest. Edit › Star unit toggles the focused catalogue row; it has no default key (⌘D is Duplicate unit) and Settings › Key bindings lists it as Not set. Stars are kept per faction (unit and force stars per catalogue, faction stars per game system), on the device: they survive a restart, are not in the roster file and are not an Undo step. No stars: the lists are unchanged; stale stars are ignored silently and kept; read-only rosters have no catalogue. Labels “Star {'{name}'}” / “Unstar {'{name}'}”. Off (hidden) · hover or focus · on:</p><div className="dt-app dark ux-screen" style={{ display: 'flex', gap: 12, padding: 12, alignItems: 'center', borderRadius: 12, height: 'auto', minHeight: 0, width: 'fit-content', background: 'var(--dt-bg)' }}><StarButton pointer name="Field Marshal" on={false} /><StarButton pointer name="Field Marshal" on={false} forceShown /><StarButton pointer name="Line Infantry" on /></div><DesktopWorkbench workflowScreen="desktop-stars-catalogue" /><DesktopWorkbench workflowScreen="desktop-stars-faction" /><DesktopWorkbench workflowScreen="desktop-stars-add-force" />
      <h2>Collection links (R2-06 · F4e · approved 2026-11-09) · repository link · several collections · Search for data · Step-by-step guide</h2><p>The Add collection dialog reads Repository, collection or library link. A pasted repository link is looked up for its collection file: one collection shows the preview with Found in {'{repo}'} · {'{file}'} ({'{branch}'}); several show a radio list (arrow keys) and Preview; game data without a collection offers Install it; nothing usable offers Search for data and Guide. The two text links under the field switch the dialog body to Search for data or the Step-by-step guide; each has ‹ Back, and focus returns to the field.</p><DesktopWorkbench workflowScreen="desktop-links-add" /><DesktopWorkbench workflowScreen="desktop-links-repo-several" /><DesktopWorkbench workflowScreen="desktop-links-search-data" /><DesktopWorkbench workflowScreen="desktop-links-guide" />
      <h2>Export dialog (F3 · approved 2026-11-06) · PDF · roster file · read-only roster</h2><p>Four format cards: Roster file, Text for sharing, Print view (.html) and PDF (.pdf). Include (Rules, Profiles, both on) shows only for Print view and PDF; Paper (A4 | Letter) only for PDF. Print view and PDF preview the paper document (PDF: “name.pdf · n pages”, hint “Opens in any PDF reader and prints as shown.”); the roster file shows a file panel (name · size and one line) instead of its content. Copy is disabled with a tooltip for Print view and PDF. A read-only roster lists Print view and PDF with the lock and “Needs the game data”.</p><DesktopWorkbench workflowScreen="desktop-editor-export-pdf" /><DesktopWorkbench workflowScreen="desktop-editor-export-json" /><DesktopWorkbench workflowScreen="desktop-editor-export-readonly" />
      <h2>Catalogue row states (R0-08 · DEC-054) · dark · light</h2><p>Unavailable rows keep full-contrast name and price (no dimming; text at least 4.5:1 in light and dark). A reached limit shows the quota chip 1 / 1 (read as “1 selected, maximum 1”) and an unavailable Add: a dashed + that stays focusable (aria-disabled); hover, focus or a press explains “Limit reached: 1 of 1 selected. Remove the existing unit before adding another.” Other unavailable reasons and Adds over limit keep the DEC-050 icon-only state chip.</p><div className="dt-element-pair"><DesktopCatalogueStateElements /><DesktopCatalogueStateElements light /></div>
      <h2>Source status icons (R0-08 · DEC-054) · dark · light</h2><p>Installed source rows show their status as one compact icon instead of a text chip, so the name keeps the row's width. Update available is an icon button (download arrow) that updates, named “Update Open Field to v1.5”; updating and installing show a ring with the percentage; Needs you and Failed are buttons too; Review, Up to date and From a file are icons. Shapes differ, never colour alone; the caption shows in the hint bubble on hover or focus and is part of the row's accessible name.</p><div className="dt-element-pair"><DesktopSourceStatusElements /><DesktopSourceStatusElements light /></div>
      <h2>No default collection (DEC-059 · R0-09) · reinstall a kept version (DEC-060) · approved 2026-11-02</h2><p>A build with no default collection fetches nothing: Add game data has no Default collection section and no Show the default collection row; Your collections is always there and, while the user has none, says “No collections yet. Add a collection link or a GitHub organisation to list its sources here.” The repository link and Search GitHub don't change. Welcome's first-run column replaces the hidden-collection note with “Add game data from a GitHub repository or a collection link.” A GitHub version that is already kept on this device with every faction installed no longer reaches an empty faction picker: the job waits on the reinstall offer (Advanced installation on or off); Reinstall this version asks first in the dialog shell, then that version is in use and the one in use before stays kept. A failure shows the error and the previous version stays in use. Live: Sources › Add game data › Preview states, and Welcome first run › Preview states.</p><DesktopDataElements />
      <h2>Settings › Advanced (DEC-054) · plain rows</h2><p>Two opt-in preferences, both off by default, as plain rows with dividers and no enclosing card: Focus search when opening the catalogue, and Enable Separate all.</p><DesktopWorkbench workflowScreen="desktop-settings-advanced" />
      <h2>Settings gaps (R0 · UX-051..054 · approved 2026-11-01) · centred · search · UI scale · Developer options</h2><p>UX-051: the section list and the cards are centred as one block in a wide window. UX-053: Find a setting above the list; results keep the section headings, show only matching rows (still operable) and count matches per section; no match shows an empty card with Clear search; Developer options are searched only while unlocked (the empty example searches “hidden” while locked). UX-054: UI scale under Theme (50–300 %, the View menu's steps) with Zoom out, the value, Zoom in and Reset, the same page zoom as View › Zoom in / Zoom out / Actual size; the example is at page zoom 150 %. UX-052: Show hidden is the first row of Developer options, which appear after seven clicks on Version in About; it is the only way to see hidden entries (the catalogue has no inline Show hidden control). F1b (DEC-063, approved 2026-11-04): the row is Show hidden entries (catalogue, Add force and option lists; Add force has no inline Show hidden either) and the card adds Hide developer options; a Debug section after Developer options, only in debug builds and whatever the unlock, holds Feature flags by area with Reset to defaults, the Engine worker with Restart, Imports at once and Install measurements; Find a setting never lists Debug.</p>{(['desktop-settings-wide', 'desktop-settings-search', 'desktop-settings-search-empty', 'desktop-settings-scale', 'desktop-settings-developer', 'desktop-settings-debug'] as const).map(screen => <DesktopWorkbench key={screen} workflowScreen={screen} />)}
      <h2>Lookup 1.0 states (R0-03 · DEC-054) · loading · failure · reference unavailable · page zoom 200 %</h2><p>Loading keeps the query and filters with progress and skeleton rows (never “nothing found”). Failure: “Search could not finish · Your installed data is still on this device.” with Retry; not zero results. A saved reference whose source is gone: “Reference unavailable · The source for this saved reference is no longer installed.” with Back to results; never a same-name entry from another source or version. At 200 % titles stop at two lines with an ellipsis; the full name is in the tooltip, the accessible name and Full name. The cap applies to titles only.</p>{(['desktop-lookup-1-0-loading', 'desktop-lookup-1-0-failed', 'desktop-lookup-1-0-unavailable', 'desktop-lookup-1-0-text-200'] as const).map(screen => <DesktopWorkbench key={screen} workflowScreen={screen} />)}
      <h2>Lookup 1.0 · detachment Layout (F2 sections 2–3 · approved 2026-11-07) · key folded · key open · Base limit 0 · hover detail</h2><p>The phone's Layout in the entry card: the key starts folded; open, it and the Base limit 0 list use two columns, filled column by column (560 pt or wider). Hovering or focusing a group shows its full name, symbol, letter and base limit, opening toward the side with room, and highlights its key row when the key is open.</p>{(['desktop-lookup-1-0-detachment-large', 'desktop-lookup-1-0-detachment-key-open', 'desktop-lookup-1-0-detachment-base-zero', 'desktop-lookup-1-0-detachment-hover'] as const).map(screen => <DesktopWorkbench key={screen} workflowScreen={screen} />)}
      <h2>Lookup 1.0 gap states (R0 · LK-09 / LK-10 · approved 2026-11-01) · no game data · Recently viewed · references · narrow window · page zoom 150 %</h2><p>No game data: the search is disabled and one card offers Add game data. Recently viewed: the last references opened, before a search is typed. Upgrade, rule and detachment references. Narrow window (page under 700 px wide): results and entry take turns, with a Results back button. Page zoom 150 %: two panes, titles capped at two lines. LK-09 (user decision, 2026-11-01): no earlier-results marker; a refresh shows the plain Loading state. The approved page zoom 200 % screen keeps its two panes.</p>{(['desktop-lookup-1-0-no-data', 'desktop-lookup-1-0-start', 'desktop-lookup-1-0-upgrade', 'desktop-lookup-1-0-rule', 'desktop-lookup-1-0-detachment', 'desktop-lookup-1-0-narrow', 'desktop-lookup-1-0-narrow-entry', 'desktop-lookup-1-0-text-150'] as const).map(screen => <DesktopWorkbench key={screen} workflowScreen={screen} />)}
      <h2>Unit dialog at page zoom 200 % (R0 · DEC-055 sizing · approved 2026-11-01)</h2><p>A 1,500 × 900 window at 200 % is laid out at 750 × 432, so the dialog takes the narrow and short rules and fills the window minus 8 px; header, tabs and footer stay fixed and the body scrolls.</p><DesktopWorkbench workflowScreen="desktop-editor-unit-dialog-zoom-200" />
      <h2>Custom limit · configuration warning</h2><DesktopLimitElements /><h2>Page top rows (DEC-050) · hub pages · rosters · lookup · sources · settings</h2><p>No page title rows: list pages put their search in the top row, filling it, with the page's buttons at its end (Rosters: Import, New roster; Sources: Install from a file, Add game data); Welcome, Settings, Tools and Library have no top row. Each page keeps a visually hidden heading.</p>{(['desktop-rosters', 'desktop-lookup', 'desktop-lookup-1-0', 'desktop-lookup-1-0-force', 'desktop-sources', 'desktop-settings', 'desktop-first-run', 'desktop-menus'] as const).map(screen => <DesktopWorkbench key={screen} workflowScreen={screen} />)}<p>DEC-050 / DEC-054: catalogue rows that are not simply available carry an icon-only state chip (Adds over limit, Unavailable) or, for a reached limit, the quota chip and an unavailable Add; hover or focus shows the explanation in the hint bubble. Settings › Advanced holds Focus search when opening the catalogue and Enable Separate all as plain rows (both off by default).</p><p>States: selected, hover, empty roster, filtered catalogue, collapsed group, hidden catalogue, validation, over budget, unit dialog with profile and rules, light appearance, colour schemes, roster summary popover, points line, create and command dialogs. Use the controls above to explore.</p></div>;
}
