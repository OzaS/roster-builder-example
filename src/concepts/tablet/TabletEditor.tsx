import { useEffect, useRef, useState, type RefObject } from 'react';
import { AlertTriangle, ArrowDownToLine, BookOpen, Check, ChevronDown, ChevronLeft, Copy, Database, Ellipsis, FilePlus2, Flag, LibraryBig, Lock, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Pencil, Plus, Redo2, Search, Trash2, Undo2, Upload, Users, X } from 'lucide-react';
import { PointsLine, RosterSummary, SummaryToggle } from '../workspace/RosterSummary';
import type { Notify } from '../workspace/Toasts';
import { StatusGlyph, TreeUnitMain } from '../ux/uxShared';
import { Count, FoldSection, RadioRow, ToggleRow } from '../ux/MobileUnitOptions';
import { PRIMARY_FORCE_ID, ROLES, forceOf, groupLimit, rosterIssues, unitCost, useRosterHistory, type EditorUnit, type Force, type ExportRoster, type ImportResult, type ReadOnlyInfo, type RosterIssue } from '../desktop/DesktopEditorFlows';
import { rosterLibrary } from '../desktop/desktopData';
import type { RosterUnit } from '../../types';
import type { TabletEnv } from './tabletEnv';
import { HintButton } from './TabletHint';
import { TabletResizer, type PanePresets } from './TabletResizer';
import { keyLabel, useShortcuts } from './tabletKeys';
import { AddForceSheet, ExportSheet, RenameSheet } from './TabletEditorSheets';
import { editorCatalogue, loadRoster, rosterFromImport, unitCategories, unitProfile, unitRules, weaponChoices, weaponProfile, type CatalogueEntry } from './tabletEditorData';
import './tablet-editor.css';

// The tablet roster editor (T1a Expanded, T1b Medium; DEC-039: desktop structure, mobile feel, one roster at a time).
// It covers the rail. Header: Back, the roster name with the recent-rosters switcher, undo/redo, the points button with the
// shared summary popover (validation lives there, with Show) and a More menu. Panes by width:
//   Expanded (>= 840): catalogue · force tree · unit details, side panes resizable with a touch grab handle and hideable.
//   Medium (600-839): force tree · unit details; the catalogue is a slide-over from Add unit.
//   Split view (< 700 wide): the tree alone; a unit's details open over it (like ListDetail on the pages).

export type EditorStart = 'editor' | 'issues' | 'add' | 'forces' | 'add-force' | 'readonly' | 'export';
type Pop = 'switcher' | 'more' | 'summary' | `unit-${number}` | `force-${string}` | null;
type Sheet = { kind: 'add-force' } | { kind: 'rename' } | { kind: 'rename-force'; id: string } | { kind: 'export' } | null;
/** The sample roster each gallery start opens: two forces, a roster whose faction was removed, or the default. */
const startRoster = (start: EditorStart, name: string) => start === 'issues' ? 'Operation First Light' : start === 'forces' || start === 'add-force' || start === 'export' ? 'Harbour defence' : start === 'readonly' ? 'Ember patrol' : name;
type Mode = 'three' | 'two' | 'single';

// Side panes: limits and the three preset widths the touch grab handle cycles through and snaps to (T4).
const PANES: { catalogue: PanePresets; inspector: PanePresets; inspectorMedium: PanePresets } = {
  catalogue: { min: 240, max: 420, narrow: 248, initial: 300, wide: 400 },
  inspector: { min: 320, max: 520, narrow: 340, initial: 400, wide: 500 },
  inspectorMedium: { min: 320, max: 500, narrow: 340, initial: 420, wide: 480 },
};
const pts = (n: number) => n.toLocaleString('en-US');
const memberLabel = (u: EditorUnit) => u.role === 'Command' ? 'Commander' : u.models === 1 ? 'Crew' : 'Unit members';

/** Scrolls a tree row into view inside this editor and flashes it (the desktop's revealInRoster, scoped to one frame). */
function reveal(root: RefObject<HTMLElement | null>, selector: string, focus = false) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const el = root.current?.querySelector<HTMLElement>(selector); if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (focus) (el.matches('button') ? el : el.querySelector<HTMLElement>('button'))?.focus({ preventScroll: true });
    el.classList.remove('tbe-flash'); void el.offsetWidth; el.classList.add('tbe-flash');
  }));
}

export function TabletEditor({ env, notify, light, rosterName, from, start = 'editor', imported, onBack, onAllRosters, onNewRoster, onImport, onFindData }: {
  env: TabletEnv; notify: Notify; light: boolean; rosterName: string; from: string; start?: EditorStart; imported?: ImportResult;
  onBack: () => void; onAllRosters: () => void; onNewRoster: () => void; onImport: () => void; onFindData: () => void;
}) {
  const mode: Mode = env.widthClass === 'expanded' ? 'three' : env.device.width < 700 ? 'single' : 'two';
  const first = useRef(imported ? rosterFromImport(imported) : loadRoster(startRoster(start, rosterName))).current;
  const [roster, setRoster] = useState(first);
  const history = useRosterHistory<EditorUnit>({ units: first.units, forces: first.forces });
  const { units, forces } = history.doc;
  const [limit, setLimit] = useState(first.limit);
  const [selectedId, setSelectedId] = useState(first.selected);
  const [activeForce, setActiveForce] = useState(first.forces[0].id);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [pop, setPop] = useState<Pop>(start === 'issues' ? 'summary' : null);
  const [issuesOpen, setIssuesOpen] = useState(start === 'issues');
  const [showCatalogue, setShowCatalogue] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [catWidth, setCatWidth] = useState(PANES.catalogue.initial);
  const [inspWidth, setInspWidth] = useState(mode === 'three' ? PANES.inspector.initial : PANES.inspectorMedium.initial);
  const [slideOver, setSlideOver] = useState(start === 'add' && mode !== 'three');
  const [detailOpen, setDetailOpen] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(start === 'add-force' ? { kind: 'add-force' } : start === 'export' ? { kind: 'export' } : null);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState(start === 'add' ? 'Core' : 'All');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(100);
  const readOnly = roster.readOnly;

  // Popovers and menus close on Escape and on a tap outside themselves and their trigger (both carry data-pop).
  useEffect(() => {
    if (!pop) return;
    const outside = (e: PointerEvent) => { const t = e.target as HTMLElement | null; if (!t?.closest(`[data-pop="${pop}"]`)) setPop(null); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setPop(null); };
    document.addEventListener('pointerdown', outside, true); window.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', outside, true); window.removeEventListener('keydown', key); };
  }, [pop]);
  useEffect(() => {
    if (!slideOver) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && !pop && !sheet) setSlideOver(false); };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [slideOver, pop, sheet]);

  const total = units.reduce((n, u) => n + unitCost(u), 0);
  const issues = rosterIssues(units, forces, limit, readOnly);
  const unitIssue = (id: number) => issues.find(i => i.target.unitId === id);
  const selected = units.find(u => u.id === selectedId);
  const forceById = (id: string) => forces.find(f => f.id === id) ?? forces[0];
  const target = forceById(activeForce);
  const toggle = (key: string) => setCollapsed(c => c.includes(key) ? c.filter(k => k !== key) : [...c, key]);
  const expand = (...keys: string[]) => setCollapsed(c => c.filter(k => !keys.includes(k)));

  const switchRoster = (name: string) => {
    const next = loadRoster(name);
    history.reset({ units: next.units, forces: next.forces });
    setRoster(next); setLimit(next.limit); setSelectedId(next.selected); setActiveForce(next.forces[0].id); setCollapsed([]); setPop(null); setDetailOpen(false); setIssuesOpen(false);
    notify(`Opened “${next.name}”`);
  };

  /* ---------------------------------------------------------------- edits (one undo step each) */
  const settle = (focus?: number) => { const doc = history.peek(); const keep = doc.units.find(u => u.id === focus) ?? doc.units.find(u => u.id === selectedId) ?? doc.units[0]; setSelectedId(keep?.id ?? 0); return keep; };
  const afterStep = (step: { label: string; focus?: number } | null, undone: boolean) => {
    if (!step) return; const keep = settle(step.focus);
    if (keep && keep.id === step.focus) reveal(rootRef, `[data-tb-unit="${keep.id}"]`);
    notify(`${undone ? 'Undone' : 'Redone'}: ${step.label}`, { action: { label: undone ? 'Redo' : 'Undo', run: undone ? redo : undo } });
  };
  function undo() { if (!readOnly) afterStep(history.undo(), true); }
  function redo() { if (!readOnly) afterStep(history.redo(), false); }
  const withUndo = (step: number) => ({ action: { label: 'Undo', run: () => { history.undoStep(step); settle(); } } });
  const update = (change: Partial<EditorUnit>) => {
    if (readOnly || !selected) return;
    const what = change.notes !== undefined ? 'notes' : change.models !== undefined ? 'unit size' : change.weapon !== undefined ? change.weapon : change.upgrade !== undefined ? `Field standard ${change.upgrade ? 'on' : 'off'}` : 'options';
    history.edit(`${selected.name}: ${what}`, d => ({ ...d, units: d.units.map(u => u.id === selected.id ? { ...u, ...change } : u) }), { focus: selected.id, merge: change.notes !== undefined ? `notes-${selected.id}` : undefined });
  };
  const addUnit = (entry: CatalogueEntry) => {
    if (readOnly) return;
    const id = nextId.current++;
    const step = history.edit(`Add ${entry.name}`, d => ({ ...d, units: [...d.units, { ...entry, id, upgrade: false, forceId: target.id }] }), { focus: id });
    setSelectedId(id); expand(target.id, `${target.id}/${entry.role}`);
    reveal(rootRef, `[data-tb-unit="${id}"]`);
    notify(`${entry.name} added to ${forces.length > 1 ? target.name : 'the roster'}`, withUndo(step));
  };
  const duplicateUnit = (unit: EditorUnit) => {
    if (readOnly) return; setPop(null);
    const id = nextId.current++;
    const step = history.edit(`Duplicate ${unit.name}`, d => ({ ...d, units: [...d.units, { ...unit, id }] }), { focus: id });
    setSelectedId(id); reveal(rootRef, `[data-tb-unit="${id}"]`); notify(`${unit.name} duplicated`, withUndo(step));
  };
  const removeUnit = (unit: EditorUnit) => {
    if (readOnly) return; setPop(null);
    const step = history.edit(`Remove ${unit.name}`, d => ({ ...d, units: d.units.filter(u => u.id !== unit.id) }), { focus: unit.id });
    if (unit.id === selectedId) { setSelectedId(units.find(u => u.id !== unit.id)?.id ?? 0); setDetailOpen(false); }
    notify(`${unit.name} removed`, withUndo(step));
  };

  /* ---------------------------------------------------------------- forces and the roster itself */
  const addForce = (force: Omit<Force, 'id'>) => {
    if (readOnly) return;
    const id = `f${Math.max(0, ...history.peek().forces.map(f => Number(f.id.slice(1)) || 0)) + 1}`;
    const step = history.edit(`Add ${force.name}`, d => ({ ...d, forces: [...d.forces, { ...force, id }] }));
    setSheet(null); setActiveForce(id); expand(id);
    reveal(rootRef, `[data-tb-force="${id}"]`);
    notify(`${force.name} added`, withUndo(step));
  };
  const renameForce = (id: string, name: string) => {
    const old = forceById(id).name; if (readOnly || name === old) return;
    const step = history.edit(`Rename ${old}`, d => ({ ...d, forces: d.forces.map(f => f.id === id ? { ...f, name } : f) }));
    setSheet(null); notify(`${old} renamed to ${name}`, withUndo(step));
  };
  const removeForce = (force: Force) => {
    if (readOnly || forces.length < 2) return; setPop(null);
    const count = units.filter(u => forceOf(u) === force.id).length;
    const step = history.edit(`Remove ${force.name}`, d => ({ units: d.units.filter(u => forceOf(u) !== force.id), forces: d.forces.filter(f => f.id !== force.id) }));
    setActiveForce(forces.find(f => f.id !== force.id)?.id ?? PRIMARY_FORCE_ID);
    if (units.some(u => u.id === selectedId && forceOf(u) === force.id)) setDetailOpen(false);
    settle(); notify(`${force.name} removed${count ? ` with its ${count} ${count === 1 ? 'unit' : 'units'}` : ''}`, withUndo(step));
  };
  const renameRoster = (name: string) => { setRoster(r => ({ ...r, name })); setSheet(null); notify(`Renamed to “${name}”`); };
  /** Duplicate roster: an editable copy opens; for a read-only roster this is how it becomes editable (the original stays as it was). */
  const duplicateRoster = () => {
    setPop(null); const name = `${roster.name} (copy)`;
    history.reset(history.peek()); setRoster(r => ({ ...r, name, readOnly: null }));
    notify(readOnly ? `Opened “${name}”, an editable copy. The original stays read-only.` : `Duplicated as “${name}”. The original is unchanged.`);
  };

  /* ---------------------------------------------------------------- panes */
  const openCatalogue = (group?: string, forceId?: string) => {
    if (readOnly) return;
    if (group) setRole(group);
    if (forceId) setActiveForce(forceId);
    if (mode === 'three') { setShowCatalogue(true); requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true })); }
    else { setDetailOpen(false); setSlideOver(true); }
  };
  // Hardware keyboard (T4): fixed shortcuts; the shell adds ⌘N, ⌘1–5 and the overlay. Undo and redo leave text fields alone.
  useShortcuts(rootRef, {
    'Mod+Z': undo, 'Mod+Shift+Z': redo,
    'Mod+E': () => { setPop(null); setSheet({ kind: 'export' }); },
    'Mod+F': () => { if (readOnly) return; setPop(null); openCatalogue(); requestAnimationFrame(() => requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true }))); },
    Escape: () => { if (!pop && !slideOver && detailOpen) setDetailOpen(false); },
  }, ['Mod+E', 'Mod+F']);
  const keys = (combo: string) => env.input === 'pointer' ? ` (${keyLabel(combo, env.device.system)})` : '';
  const selectUnit = (unit: EditorUnit) => {
    setSelectedId(unit.id); setActiveForce(forceOf(unit)); setShowInspector(true);
    if (mode === 'single') setDetailOpen(true);
  };
  const showIssue = (issue: RosterIssue) => {
    const t = issue.target;
    if (t.summary) { rootRef.current?.querySelector<HTMLElement>('.dt-summary-rows select')?.focus(); return; }
    setPop(null);
    if (t.banner) { reveal(rootRef, '.tbe-readonly'); return; }
    const unit = t.unitId !== undefined ? units.find(u => u.id === t.unitId) : undefined;
    if (unit) { expand(forceOf(unit), `${forceOf(unit)}/${unit.role}`); selectUnit(unit); reveal(rootRef, `[data-tb-unit="${unit.id}"]`, mode !== 'single'); return; }
    if (t.forceId && t.group) { expand(t.forceId, `${t.forceId}/${t.group}`); setActiveForce(t.forceId); setDetailOpen(false); reveal(rootRef, `[data-tb-group="${t.forceId}/${t.group}"]`); openCatalogue(t.group, t.forceId); }
  };
  /** The roster as the export sheet and its file see it (the units as they stand now, per force). */
  const exportable: ExportRoster = {
    name: roster.name, limit, total, system: roster.system, faction: roster.faction,
    forces: forces.map(f => { const own = units.filter(u => forceOf(u) === f.id); return { ...f, units: own, points: own.reduce((n, u) => n + unitCost(u), 0) }; }),
    file: { name: roster.name, system: roster.system, faction: roster.faction, limit, forces, units },
  };

  const cols = mode === 'three'
    ? `${showCatalogue ? `${catWidth}px ` : ''}minmax(300px, 1fr)${showInspector ? ` ${inspWidth}px` : ''}`
    : mode === 'two' ? `minmax(300px, 1fr)${showInspector ? ` ${inspWidth}px` : ''}` : 'minmax(0, 1fr)';
  const catalogue = (variant: 'pane' | 'slide') => <CataloguePanel env={env} variant={variant} query={query} onQuery={setQuery} role={role} onRole={setRole} forces={forces} target={target} onTarget={setActiveForce} searchRef={searchRef} onAdd={addUnit}
    onClose={() => variant === 'pane' ? setShowCatalogue(false) : setSlideOver(false)} faction={roster.faction} system={roster.system} />;
  const inspectorLimits = mode === 'three' ? PANES.inspector : PANES.inspectorMedium;
  const fromLabel = from === 'rosters' ? 'Rosters' : 'Home';

  return <div ref={rootRef} className={`tbe tbe-${mode}`} aria-label={`Roster editor: ${roster.name}`}>
    <header className="tbe-header">
      <HintButton hint={`Back to ${fromLabel}`} input={env.input} side="bottom" wrapClassName="start" aria-label={`Back to ${fromLabel}`} className="tbe-back" onClick={onBack}><ChevronLeft size={24} /><span>{fromLabel}</span></HintButton>
      <div className="tbe-title-wrap" data-pop="switcher">
        <HintButton hint="Switch to another recent roster" input={env.input} side="bottom" className="tbe-title" aria-haspopup="menu" aria-expanded={pop === 'switcher'} onClick={() => setPop(pop === 'switcher' ? null : 'switcher')}>
          <span className="tb-mark" aria-hidden="true">{roster.mark}</span>
          <span className="tbe-title-text"><strong>{readOnly && <Lock size={14} />}{roster.name}</strong><small>{roster.faction} · {roster.force}</small></span>
          <ChevronDown size={18} className="tbe-title-caret" />
        </HintButton>
        {pop === 'switcher' && <RosterSwitcher current={roster.name} onPick={switchRoster} onClose={() => setPop(null)} onAll={onAllRosters} onNew={onNewRoster} onImport={() => { setPop(null); onImport(); }} />}
      </div>
      <span className="tbe-header-spacer" />
      <HintButton hint={readOnly ? 'Read-only roster: nothing to undo' : history.undoLabel ? `Undo “${history.undoLabel}”${keys('Mod+Z')}` : 'Nothing to undo'} input={env.input} side="bottom" aria-label={history.undoLabel ? `Undo ${history.undoLabel}` : 'Undo'} className="tbe-icon" disabled={!history.undoLabel || !!readOnly} onClick={undo}><Undo2 size={20} /></HintButton>
      <HintButton hint={readOnly ? 'Read-only roster: nothing to redo' : history.redoLabel ? `Redo “${history.redoLabel}”${keys('Mod+Shift+Z')}` : 'Nothing to redo'} input={env.input} side="bottom" aria-label={history.redoLabel ? `Redo ${history.redoLabel}` : 'Redo'} className="tbe-icon" disabled={!history.redoLabel || !!readOnly} onClick={redo}><Redo2 size={20} /></HintButton>
      <span className={`dt-app tb-shim ${light ? 'light' : ''}`} data-pop="summary"><SummaryToggle total={total} limit={limit} open={pop === 'summary'} onToggle={() => setPop(pop === 'summary' ? null : 'summary')} /></span>
      <div className="tbe-more-wrap" data-pop="more">
        <HintButton hint="More: export, panes and roster actions" input={env.input} side="bottom" wrapClassName="end" aria-label="More actions" aria-haspopup="menu" aria-expanded={pop === 'more'} className="tbe-icon" onClick={() => setPop(pop === 'more' ? null : 'more')}><Ellipsis size={20} /></HintButton>
        {pop === 'more' && <div className="tbe-menu end" role="menu" aria-label="More actions">
          <button type="button" role="menuitem" onClick={() => { setPop(null); setSheet({ kind: 'export' }); }}><ArrowDownToLine size={18} />Export roster…</button>
          <button type="button" role="menuitem" disabled={!!readOnly} onClick={() => { setPop(null); setSheet({ kind: 'rename' }); }}><Pencil size={18} />Rename roster</button>
          <button type="button" role="menuitem" onClick={duplicateRoster}><Copy size={18} />{readOnly ? 'Make an editable copy' : 'Duplicate roster'}</button>
          <button type="button" role="menuitem" disabled={!!readOnly} onClick={() => { setPop(null); setSheet({ kind: 'add-force' }); }}><Flag size={18} />Add force…</button>
          {mode !== 'single' && <hr />}
          {mode === 'three' && <button type="button" role="menuitem" onClick={() => { setShowCatalogue(v => !v); setPop(null); }}>{showCatalogue ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}{showCatalogue ? 'Hide catalogue' : 'Show catalogue'}</button>}
          {mode !== 'single' && <button type="button" role="menuitem" onClick={() => { setShowInspector(v => !v); setPop(null); }}>{showInspector ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}{showInspector ? 'Hide unit details' : 'Show unit details'}</button>}
        </div>}
      </div>
      {pop !== 'summary' && <PointsLine total={total} limit={limit} />}
    </header>

    {pop === 'summary' && <div className={`dt-app tb-shim ${light ? 'light' : ''}`} data-pop="summary">
      <RosterSummary name={roster.name} faction={roster.faction} force={roster.force} total={total} limit={limit} issueCount={readOnly ? 0 : issues.length} onLimit={setLimit} onShowIssues={() => setIssuesOpen(v => !v)}
        data={{ name: roster.system, version: roster.system === 'Open Field' ? 'v1.4' : 'v3.0.2', onClick: () => notify(`${roster.system} · sample data is ready offline`) }}
        details={issuesOpen ? <IssueList issues={readOnly ? [] : issues} readOnly={!!readOnly} onShow={showIssue} /> : undefined}
        actions={[{ label: 'Export roster…', icon: <ArrowDownToLine size={17} />, onClick: () => { setPop(null); setSheet({ kind: 'export' }); } }, { label: 'New roster', icon: <FilePlus2 size={17} />, onClick: () => { setPop(null); onNewRoster(); } }]} />
    </div>}

    <div className="tbe-body">
      <div className="tbe-panes" style={{ gridTemplateColumns: cols }}>
        {mode === 'three' && showCatalogue && <TabletResizer side="left" width={catWidth} presets={PANES.catalogue} label="Resize catalogue" pane="catalogue" input={env.input} onWidth={setCatWidth} onHide={() => setShowCatalogue(false)} />}
        {mode !== 'single' && showInspector && <TabletResizer side="right" width={inspWidth} presets={inspectorLimits} label="Resize unit details" pane="unit details" input={env.input} onWidth={setInspWidth} onHide={() => setShowInspector(false)} />}
        {mode === 'three' && showCatalogue && (readOnly ? <ReadOnlyCataloguePane env={env} info={readOnly} onFindData={onFindData} onClose={() => setShowCatalogue(false)} /> : catalogue('pane'))}

        <section className="tbe-pane tbe-tree" aria-label="Roster">
          <header className="tbe-pane-head">
            <span><strong>{forces.length > 1 ? 'Your forces' : 'Your force'}</strong><small>{units.length} units{forces.length > 1 ? ` · ${forces.length} forces` : ''} · {pts(total)} pts</small></span>
            {!readOnly && (mode !== 'three' || !showCatalogue) && <HintButton hint={`Add a unit to ${forces.length > 1 ? target.name : 'this roster'} from the catalogue`} input={env.input} side="bottom" className="ux-job-btn primary tbe-add" onClick={() => openCatalogue()}><Plus size={18} />Add unit</HintButton>}
          </header>
          {readOnly && <section className="tbe-readonly" role="region" aria-label="Read-only roster" tabIndex={-1}><Lock size={20} />
            <div><strong>This roster is read-only</strong><p>{readOnly.faction} was removed from the installed {readOnly.system} data, so its units can't be checked or changed. The roster is kept as it was saved.</p>
              <div className="tbe-readonly-actions">
                <button type="button" className="ux-job-btn primary" onClick={duplicateRoster}><Copy size={17} />Make an editable copy</button>
                <button type="button" className="ux-job-btn" onClick={onFindData}><Database size={17} />Find game data</button>
                <button type="button" className="ux-job-btn" onClick={() => setSheet({ kind: 'export' })}><ArrowDownToLine size={17} />Export as it was</button>
              </div></div></section>}
          <div className="ux-wb-tree tbe-tree-scroll">
            <div className="ux-force-list">
              {forces.map(force => {
                const own = units.filter(u => forceOf(u) === force.id);
                const open = !collapsed.includes(force.id);
                const multi = forces.length > 1;
                return <section key={force.id} className={`ux-force-entry ${open ? 'open' : ''} ${forces.length > 1 && force.id === activeForce ? 'selected' : ''}`} data-tb-force={force.id}>
                  <div className="ux-force-summary">
                    <button type="button" className="ux-force-summary-main" aria-expanded={open} onClick={() => { toggle(force.id); setActiveForce(force.id); }}>
                      <ChevronDown size={16} /><span><strong>{force.name}{multi && force.id === activeForce && <span className="tbe-chip">Adding here</span>}</strong><small>{force.type} · {force.faction} · {own.length} {own.length === 1 ? 'unit' : 'units'}</small></span><b>{pts(own.reduce((n, u) => n + unitCost(u), 0))} pts</b>
                    </button>
                    <div className="tbe-force-tools" data-pop={`force-${force.id}`}>
                      <HintButton hint={readOnly ? 'Read-only roster' : `Rename or remove ${force.name}`} input={env.input} side="bottom" wrapClassName="end" aria-label={`Actions for ${force.name}`} aria-haspopup="menu" aria-expanded={pop === `force-${force.id}`} className="tbe-icon" disabled={!!readOnly} onClick={() => setPop(pop === `force-${force.id}` ? null : `force-${force.id}`)}><Ellipsis size={20} /></HintButton>
                      {pop === `force-${force.id}` && <div className="tbe-menu end" role="menu" aria-label={`Actions for ${force.name}`}>
                        <button type="button" role="menuitem" onClick={() => { setPop(null); openCatalogue(undefined, force.id); }}><Plus size={18} />Add unit here</button>
                        <button type="button" role="menuitem" onClick={() => { setPop(null); setSheet({ kind: 'rename-force', id: force.id }); }}><Pencil size={18} />Rename force</button>
                        <button type="button" role="menuitem" className="danger" disabled={!multi} onClick={() => removeForce(force)}><Trash2 size={18} />{multi ? 'Remove force' : 'Remove force (needs two)'}</button>
                      </div>}
                    </div>
                  </div>
                  {open && <div className="ux-force-sections">{ROLES.map(group => {
                    const key = `${force.id}/${group}`;
                    const entries = own.filter(u => u.role === group);
                    const branchOpen = !collapsed.includes(key);
                    return <div key={group} className={`ux-tree-branch ${branchOpen ? 'open' : ''}`} data-tb-group={key}>
                      <button type="button" className="ux-tree-section" aria-expanded={branchOpen} onClick={() => toggle(key)}>
                        <ChevronDown size={16} className="ux-tree-caret" /><strong>{group}</strong><small>{entries.length} {groupLimit(force, group)}</small>
                      </button>
                      {branchOpen && <div className="ux-tree-units">
                        {entries.map(u => <UnitRow key={u.id} unit={u} env={env} active={u.id === selectedId} issue={unitIssue(u.id)} menuOpen={pop === `unit-${u.id}`} readOnly={!!readOnly}
                          onSelect={() => selectUnit(u)} onMenu={() => setPop(pop === `unit-${u.id}` ? null : `unit-${u.id}`)} onDuplicate={() => duplicateUnit(u)} onRemove={() => removeUnit(u)} />)}
                        {!readOnly && <button type="button" className="ux-tree-add" onClick={() => openCatalogue(group, force.id)}><Plus size={16} />Add {group.toLowerCase()} unit</button>}
                      </div>}
                    </div>;
                  })}</div>}
                </section>;
              })}
              <button type="button" className="ux-tree-add tbe-add-force" disabled={!!readOnly} onClick={() => setSheet({ kind: 'add-force' })}><Flag size={16} />Add force</button>
            </div>
          </div>
        </section>

        {mode !== 'single' && showInspector && <aside className="tbe-pane tbe-inspector" aria-label="Unit details">
          <header className="tbe-pane-head"><span><strong>Unit details</strong></span><HintButton hint="Hide unit details (More → Show unit details brings them back)" input={env.input} side="bottom" wrapClassName="end" aria-label="Hide unit details" className="tbe-icon small" onClick={() => setShowInspector(false)}><PanelRightClose size={18} /></HintButton></header>
          {selected ? <UnitDetail key={selected.id} unit={selected} env={env} force={forceById(forceOf(selected))} faction={roster.faction} total={total} issue={unitIssue(selected.id)} readOnly={!!readOnly} onUpdate={update} onDuplicate={() => duplicateUnit(selected)} onRemove={() => removeUnit(selected)} />
            : <EmptyDetail onAdd={readOnly ? undefined : () => openCatalogue()} />}
        </aside>}
      </div>

      {mode === 'single' && detailOpen && selected && <aside className="tbe-over" aria-label="Unit details">
        <header className="tbe-pane-head"><HintButton hint="Back to the roster tree" input={env.input} side="bottom" wrapClassName="start" className="tbe-back inline" onClick={() => setDetailOpen(false)}><ChevronLeft size={22} /><span>Roster</span></HintButton></header>
        <UnitDetail key={selected.id} unit={selected} env={env} force={forceById(forceOf(selected))} faction={roster.faction} total={total} issue={unitIssue(selected.id)} readOnly={!!readOnly} onUpdate={update} onDuplicate={() => duplicateUnit(selected)} onRemove={() => removeUnit(selected)} />
      </aside>}

      {slideOver && mode !== 'three' && <div className="tbe-scrim" onClick={() => setSlideOver(false)}>
        <div className="tbe-slide" role="dialog" aria-modal="true" aria-label="Add units" onClick={e => e.stopPropagation()}>{catalogue('slide')}</div>
      </div>}
    </div>

    {sheet?.kind === 'export' && <ExportSheet roster={exportable} readOnly={!!readOnly} notify={notify} onClose={() => setSheet(null)} />}
    {sheet?.kind === 'add-force' && <AddForceSheet forces={forces} limit={limit} faction={roster.faction} onAdd={addForce} onClose={() => setSheet(null)} />}
    {sheet?.kind === 'rename' && <RenameSheet title="Rename roster" label="Roster name" value={roster.name} onSave={renameRoster} onClose={() => setSheet(null)} />}
    {sheet?.kind === 'rename-force' && <RenameSheet title="Rename force" label="Force name" value={forceById(sheet.id).name} maxLength={40} onSave={name => renameForce(sheet.id, name)} onClose={() => setSheet(null)} />}
  </div>;
}

/* ---------------------------------------------------------------- header pieces */

function RosterSwitcher({ current, onPick, onClose, onAll, onNew, onImport }: { current: string; onPick: (name: string) => void; onClose: () => void; onAll: () => void; onNew: () => void; onImport: () => void }) {
  return <div className="tbe-menu tbe-switcher" role="menu" aria-label="Recent rosters">
    <span className="tbe-menu-label">Recent rosters</span>
    {rosterLibrary.slice(0, 5).map(r => <button type="button" role="menuitemradio" aria-checked={r.name === current} key={r.name} onClick={() => r.name === current ? onClose() : onPick(r.name)}>
      <span className="tb-mark" aria-hidden="true">{r.mark}</span>
      <span className="tbe-switch-main"><strong>{r.name}</strong><small>{r.faction} · {pts(r.used)} / {pts(r.limit)} pts · {r.opened}</small></span>
      {r.name === current && <Check size={18} className="tbe-check" />}
    </button>)}
    <hr />
    <button type="button" role="menuitem" onClick={onAll}><LibraryBig size={18} />All rosters</button>
    <button type="button" role="menuitem" onClick={onNew}><FilePlus2 size={18} />New roster</button>
    <button type="button" role="menuitem" onClick={onImport}><Upload size={18} />Import roster…</button>
  </div>;
}

function IssueList({ issues, readOnly, onShow }: { issues: RosterIssue[]; readOnly: boolean; onShow: (issue: RosterIssue) => void }) {
  if (readOnly) return <div className="tbe-issues"><p className="tbe-issue-ok"><Lock size={16} />Not checked while the roster is read-only.</p></div>;
  if (!issues.length) return <div className="tbe-issues"><p className="tbe-issue-ok"><Check size={16} />All roster requirements met.</p></div>;
  return <ul className="tbe-issues" aria-label="Roster issues">
    {issues.map(issue => <li key={issue.id}><AlertTriangle size={17} /><span><strong>{issue.text}</strong><small>{issue.where}</small></span>
      <button type="button" className="tbe-show" aria-label={`Show: ${issue.where}`} onClick={() => onShow(issue)}>Show</button></li>)}
  </ul>;
}

/* ---------------------------------------------------------------- catalogue (pane or slide-over) */

function CataloguePanel({ env, variant, query, onQuery, role, onRole, forces, target, onTarget, searchRef, onAdd, onClose, faction, system }: {
  env: TabletEnv; variant: 'pane' | 'slide'; query: string; onQuery: (q: string) => void; role: string; onRole: (r: string) => void; forces: Force[]; target: Force; onTarget: (id: string) => void;
  searchRef: RefObject<HTMLInputElement | null>; onAdd: (entry: CatalogueEntry) => void; onClose: () => void; faction: string; system: string;
}) {
  const matches = (e: CatalogueEntry) => e.name.toLowerCase().includes(query.trim().toLowerCase()) && (role === 'All' || e.role === role);
  const any = editorCatalogue.some(matches);
  return <aside className={`tbe-pane tbe-catalogue ${variant}`} aria-label="Unit catalogue">
    <header className="tbe-pane-head">
      <span><strong>Add units</strong><small>to {forces.length > 1 ? target.name : 'this roster'}</small></span>
      <HintButton hint={variant === 'pane' ? 'Hide the catalogue (More → Show catalogue brings it back)' : 'Close the catalogue'} input={env.input} side="bottom" wrapClassName="end" aria-label={variant === 'pane' ? 'Hide catalogue' : 'Close catalogue'} className="tbe-icon small" onClick={onClose}>{variant === 'pane' ? <PanelLeftClose size={18} /> : <X size={20} />}</HintButton>
    </header>
    <div className="tbe-cat-tools">
      <label className="ux-search tb-search"><Search size={17} /><input ref={searchRef} value={query} onChange={e => onQuery(e.target.value)} placeholder="Find a unit…" aria-label="Find a unit" />{query && <button type="button" className="tbe-clear" aria-label="Clear search" onClick={() => onQuery('')}><X size={16} /></button>}</label>
      <div className="tb-filters tbe-roles" role="group" aria-label="Unit role">{['All', ...ROLES].map(r => <button type="button" key={r} className={`tb-filter ${role === r ? 'active' : ''}`} aria-pressed={role === r} onClick={() => onRole(r)}>{r}</button>)}</div>
      {forces.length > 1 && <label className="tbe-target"><span>Adds to</span><select value={target.id} onChange={e => onTarget(e.target.value)} aria-label="Force that new units join">{forces.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>}
    </div>
    <div className="tbe-cat-list">
      {ROLES.map(group => { const entries = editorCatalogue.filter(e => e.role === group && matches(e)); return entries.length ? <section key={group}>
        <h4>{group}<span>{entries.length}</span></h4>
        {entries.map(e => <button type="button" key={e.name} className="tbe-cat-row" aria-label={`Add ${e.name}, ${e.points} points`} onClick={() => onAdd(e)}>
          <span><strong>{e.name}</strong><small>{e.models} {e.models === 1 ? 'model' : 'models'} · {e.weapon}</small></span><b>{e.points}<small> pts</small></b><span className="tbe-cat-plus" aria-hidden="true"><Plus size={18} /></span>
        </button>)}
      </section> : null; })}
      {!any && <p className="tb-empty">No units match. Try another word or role.</p>}
    </div>
    <footer className="tbe-pane-foot"><Database size={15} />{faction}<span>{system} · v1.4</span></footer>
  </aside>;
}

function ReadOnlyCataloguePane({ env, info, onFindData, onClose }: { env: TabletEnv; info: ReadOnlyInfo; onFindData: () => void; onClose: () => void }) {
  return <aside className="tbe-pane tbe-catalogue pane" aria-label="Unit catalogue">
    <header className="tbe-pane-head"><span><strong>Unit catalogue</strong></span>
      <HintButton hint="Hide the catalogue (More → Show catalogue brings it back)" input={env.input} side="bottom" wrapClassName="end" aria-label="Hide catalogue" className="tbe-icon small" onClick={onClose}><PanelLeftClose size={18} /></HintButton></header>
    <div className="tbe-empty"><Lock size={30} /><strong>Nothing to add</strong><small>{info.faction} is not in the installed {info.system} data, so its units can't be added.</small><button type="button" className="ux-job-btn" onClick={onFindData}><Database size={17} />Find game data</button></div>
    <footer className="tbe-pane-foot"><Database size={15} />{info.faction}<span>removed</span></footer>
  </aside>;
}

/* ---------------------------------------------------------------- force tree row */

function UnitRow({ unit, env, active, issue, menuOpen, readOnly, onSelect, onMenu, onDuplicate, onRemove }: {
  unit: EditorUnit; env: TabletEnv; active: boolean; issue?: RosterIssue; menuOpen: boolean; readOnly: boolean;
  onSelect: () => void; onMenu: () => void; onDuplicate: () => void; onRemove: () => void;
}) {
  // Touch: press and hold opens the row menu (the phone's swipe actions are off at this size). Pointer: right-click does.
  const hold = useRef<number>(undefined);
  const held = useRef(false);
  useEffect(() => () => window.clearTimeout(hold.current), []);
  const summary = [unit.weapon, unit.upgrade ? 'Field standard' : ''].filter(Boolean).join(' · ');
  const shown = { count: unit.models, summary } as Partial<RosterUnit> as RosterUnit;
  const status = issue ? 'warning' : 'valid';
  return <div className="tbe-unit" data-pop={`unit-${unit.id}`}>
    <button type="button" data-tb-unit={unit.id} className={`ux-tree-unit ${status} ${active ? 'active' : ''}`} aria-current={active ? 'true' : undefined} aria-haspopup="menu"
      aria-label={`${unit.name}, ${unit.models} ${unit.models === 1 ? 'model' : 'models'}, ${unitCost(unit)} points${issue ? `, needs attention: ${issue.text}` : ''}`}
      title={env.input === 'pointer' ? 'Right-click for unit actions' : undefined}
      onPointerDown={() => { if (env.input !== 'touch' || readOnly) return; held.current = false; window.clearTimeout(hold.current); hold.current = window.setTimeout(() => { held.current = true; onMenu(); }, 500); }}
      onPointerUp={() => window.clearTimeout(hold.current)} onPointerLeave={() => window.clearTimeout(hold.current)} onPointerCancel={() => window.clearTimeout(hold.current)}
      onContextMenu={e => { e.preventDefault(); if (!readOnly && env.input === 'pointer') onMenu(); }}
      onClick={e => { if (held.current) { e.preventDefault(); held.current = false; return; } onSelect(); }}>
      <span className="ux-tree-rail" aria-hidden />
      <TreeUnitMain unit={shown} name={unit.name} />
      {issue ? <StatusGlyph status="warning" size={16} /> : <span />}
      <b>{unitCost(unit)}</b>
    </button>
    {menuOpen && <div className="tbe-menu tbe-unit-menu" role="menu" aria-label={`Actions for ${unit.name}`}>
      <button type="button" role="menuitem" onClick={() => { onMenu(); onSelect(); }}><Users size={18} />Show details</button>
      <button type="button" role="menuitem" onClick={onDuplicate}><Copy size={18} />Duplicate</button>
      <button type="button" role="menuitem" className="danger" onClick={onRemove}><Trash2 size={18} />Remove</button>
    </div>}
  </div>;
}

/* ---------------------------------------------------------------- unit details (the mobile unit detail in a pane) */

function UnitDetail({ unit, env, force, faction, total, issue, readOnly, onUpdate, onDuplicate, onRemove }: {
  unit: EditorUnit; env: TabletEnv; force: Force; faction: string; total: number; issue?: RosterIssue; readOnly: boolean;
  onUpdate: (change: Partial<EditorUnit>) => void; onDuplicate: () => void; onRemove: () => void;
}) {
  const [tab, setTab] = useState<'options' | 'profile'>('options');
  // Open sections are presentation only; the tablet opens the two option sections at first (there is room for them).
  const [opened, setOpened] = useState<string[]>(['weapon', 'upgrades']);
  const [rule, setRule] = useState<string | undefined>();
  const fold = (key: string) => ({ folded: !opened.includes(key), onFold: () => setOpened(k => k.includes(key) ? k.filter(x => x !== key) : [...k, key]) });
  const cost = unitCost(unit);
  const share = total ? Math.round(cost / total * 100) : 0;
  const pinned = unit.role === 'Command';
  const standardIssue = issue?.id.endsWith('-standard');
  const sizeIssue = issue?.id.endsWith('-size');
  const [move, defence, resolve, health] = unitProfile(unit);
  return <section className="ux-mobile-unit-options tbe-detail">
    <div className="tbe-unit-title">
      <span><small>{unit.role} · {force.name}</small><h2>{unit.name}</h2></span>
      <strong>{cost}<small> pts</small></strong>
    </div>
    <div className="tbe-unit-actions">
      <HintButton hint={readOnly ? 'Read-only roster' : 'Add a copy of this unit to the same force'} input={env.input} side="bottom" className="ux-job-btn" disabled={readOnly} onClick={onDuplicate}><Copy size={17} />Duplicate</HintButton>
      <HintButton hint={readOnly ? 'Read-only roster' : 'Remove this unit (Undo brings it back)'} input={env.input} side="bottom" className="ux-job-btn destructive" disabled={readOnly} onClick={onRemove}><Trash2 size={17} />Remove</HintButton>
    </div>
    <div className="ux-5a-budget" aria-hidden="true"><div style={{ width: `${share}%` }} /></div>
    <small>{cost} of {pts(total)} pts in this roster · {share}%</small>
    {issue && <div className="ux-5a-notice tbe-unit-issue" role="status"><AlertTriangle size={18} /><span><strong>{issue.text}</strong><small>{issue.where}</small></span></div>}
    <div className="ux-5b-tabs" role="tablist" aria-label="Unit view">{(['options', 'profile'] as const).map(id => <button type="button" role="tab" key={id} aria-selected={tab === id} onClick={() => setTab(id)}>{id === 'options' ? 'Options' : 'Profile'}</button>)}</div>
    {tab === 'options' ? <div className="tbe-options">
      <h4>Unit size</h4>
      <article className="ux-5a-card">
        <div className="ux-5a-model-title"><span><strong>{memberLabel(unit)} ×{unit.models}</strong><small>{pinned ? 'Always 1 model' : '+12 pts per extra model'}</small></span></div>
        {pinned ? null : <><small className={sizeIssue ? 'ux-5a-invalid' : ''}>{sizeIssue && <AlertTriangle size={13} />}{unit.role === 'Support' ? 'At least 1' : 'At least 3'} · Up to 20 · {sizeIssue ? 'Needs more models' : 'Soft limit'}</small>
          <Count name="Models" value={unit.models} min={1} max={20} over={sizeIssue} disabled={readOnly} onChange={models => onUpdate({ models, points: unit.points + (models - unit.models) * 12 })} /></>}
      </article>
      <div className="ux-5a-card"><FoldSection title="Primary weapon" counter="1/1 selections" summary={unit.weapon} {...fold('weapon')}>
        <div role="radiogroup" aria-label="Primary weapon">{weaponChoices(unit).map(w => <RadioRow key={w} name={w} cost="Included in unit cost" selected={unit.weapon === w} onChange={() => onUpdate({ weapon: w })} />)}</div>
      </FoldSection></div>
      <div className="ux-5a-card"><FoldSection title="Upgrades" counter={`${unit.upgrade ? 1 : 0}/1 selections${standardIssue ? ' · One per force' : ''}`} invalid={standardIssue} summary={unit.upgrade ? 'Field standard' : ''} {...fold('upgrades')}>
        <ToggleRow name="Field standard" cost="+10 pts · carry the detachment's colours" value={unit.upgrade} disabled={readOnly} onChange={() => onUpdate({ upgrade: !unit.upgrade })} />
      </FoldSection></div>
      <h4>Notes</h4>
      <div className="ux-5a-card"><textarea className="tbe-notes" aria-label="Unit notes" readOnly={readOnly} placeholder="A role, a reminder, a plan…" value={unit.notes ?? ''} onChange={e => onUpdate({ notes: e.target.value })} /><small>Private. Not part of exports.</small></div>
    </div> : <>
      <div className="ux-5a-card ux-5b-table-card"><strong>Unit</strong><div className="ux-5b-table"><table><thead><tr><th /><th>Move</th><th>Defence</th><th>Resolve</th><th>Health</th></tr></thead>
        <tbody><tr><th>{unit.name}</th><td>{move}</td><td>{defence}</td><td>{resolve}</td><td>{health}</td></tr></tbody></table></div></div>
      <div className="ux-5a-card ux-5b-table-card"><strong>Weapons</strong><div className="ux-5b-table"><table><thead><tr><th /><th>Range</th><th>Attacks</th><th>Strength</th></tr></thead>
        <tbody><tr><th>{unit.weapon}</th>{weaponProfile(unit.weapon).map((v, i) => <td key={i}>{v}</td>)}</tr></tbody></table></div></div>
      <h4>Rules</h4>
      <div className="ux-5a-card">{unitRules(unit).map(r => <div key={r.name}><button type="button" className="ux-5a-choice" aria-expanded={rule === r.name} onClick={() => setRule(rule === r.name ? undefined : r.name)}><BookOpen size={18} /><span><strong>{r.name}</strong></span><ChevronDown size={18} className={rule === r.name ? 'tbe-rot' : 'tbe-rot closed'} /></button>{rule === r.name && <small className="tbe-rule-text">{r.text}</small>}</div>)}</div>
    </>}
    <h4>Categories</h4>
    <div className="ux-5a-chips">{unitCategories(unit, faction).map(c => <span key={c}>{c}</span>)}</div>
  </section>;
}

function EmptyDetail({ onAdd }: { onAdd?: () => void }) {
  return <div className="tbe-empty"><Users size={30} /><strong>Select a unit</strong><small>Its options and profile show here.</small>{onAdd && <button type="button" className="ux-job-btn" onClick={onAdd}><Plus size={17} />Add unit</button>}</div>;
}
