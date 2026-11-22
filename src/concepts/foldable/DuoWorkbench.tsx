import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, Database, Plus } from 'lucide-react';
import type { ConceptProps } from '../shared';
import type { ColorScheme } from '../../types';
import { ToastRegion, useToasts } from '../workspace/Toasts';
import { TabletLibrary, TabletRosters, TabletTools } from '../tablet/TabletPages';
import { TabletLookup10 } from '../tablet/TabletLookup10';
import { TabletSources } from '../tablet/TabletSources';
import { TabletSettings } from '../tablet/TabletSettings';
import { TabletEditor, type EditorStart } from '../tablet/TabletEditor';
import { ImportResultSheet } from '../tablet/TabletEditorSheets';
import { CreateRosterSheet, newRosterDocument, type NewRoster } from '../tablet/TabletCreateSheet';
import { TabletSessionSheets } from '../tablet/TabletSheets';
import { sampleImport, type ImportResult } from '../desktop/DesktopEditorFlows';
import { rosterLibrary } from '../desktop/desktopData';
import { useTabletSession, TabletJobsPanel } from '../tablet/tabletSession';
import { TabletEnvContext, type TabletEnv } from '../tablet/tabletEnv';
import { widthClassOf } from '../tablet/tabletDevices';
import { IconHints } from '../tablet/TabletHint';
import { useTabletExperience } from '../tablet/tabletExperience';
import { PinLook } from '../../look';
import { BarRegistry, BarRegistryContext, type BarLayer } from './duoBarItems';
import { DuoBottomTabs, DuoSideBar, type DuoPage } from './DuoBars';
import { contentWidth, FOLD_GAP, poseById, STATUS_HEIGHT } from './duoPoses';
import { duoScreenOf, type DuoScreen } from './duoScreens';
import '../tablet/tablet.css';
import '../tablet/tablet-platform.css';
import './duo.css';

type ThemePref = 'system' | 'light' | 'dark';


/**
 * The passport foldable (HIG "Designing for iPhone Duo"): the tablet's pages and roster editor, shared with the phone and
 * tablet, inside the foldable's controls. Closed, and open in landscape, the status, toolbar and tab bar sit on the trailing
 * edge and screens declare their toolbar items (useBarItems); open in portrait the bars are horizontal. Content layouts follow
 * size classes: compact on the outer display (one pane at a time, as on the phone), regular on the inner display (panes).
 */
function DuoWorkbenchBody(props: Partial<ConceptProps>) {
  const screen = props.workflowScreen as string | undefined;
  return <DuoShell key={screen} {...props} spec={duoScreenOf(screen)} />;
}

type OpenEditor = { name: string; start: EditorStart; key: number; imported?: ImportResult };

function DuoShell({ spec, ...props }: Partial<ConceptProps> & { spec: DuoScreen }) {
  const pose = poseById(spec.pose);
  const vertical = pose.bars === 'vertical';
  const width = contentWidth(pose);
  // The app sees the content area (the side bar is outside it) and, on the inner display in landscape, the fold.
  const env: TabletEnv = useMemo(() => ({
    device: { id: 'duo', label: 'iPhone Duo', short: 'Duo', width, height: vertical ? pose.height : pose.height - STATUS_HEIGHT, system: 'ios' },
    input: 'touch', textScale: 100, width, widthClass: widthClassOf(width),
    bars: vertical ? 'vertical' : undefined,
    fold: pose.display === 'inner' && pose.hinge === 'center-x' ? { x: pose.width / 2, gap: FOLD_GAP, active: pose.folded } : undefined,
  }), [pose, vertical, width]);
  const registry = useMemo(() => new BarRegistry(), []);
  const { experience } = useTabletExperience();
  const [page, setPage] = useState<DuoPage>(spec.page);
  const [editor, setEditor] = useState<OpenEditor | null>(spec.editor ? { name: rosterLibrary[0].name, start: spec.editor, key: 0 } : null);
  const [importing, setImporting] = useState<ImportResult | null>(null);
  const [themePref, setThemePref] = useState<ThemePref>(props.themePreference ?? props.themeMode ?? 'dark');
  const [light, setLight] = useState(props.themeMode === 'light');
  const [scheme, setScheme] = useState<ColorScheme>(props.colorScheme ?? 'default');
  const [focusSearch, setFocusSearch] = useState(false);
  const [creating, setCreating] = useState(false);
  const toasts = useToasts();
  const appRef = useRef<HTMLDivElement>(null);
  const { notify } = toasts;
  const chooseTheme = (pref: ThemePref) => { setThemePref(pref); setLight(pref === 'light' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches)); props.onThemePreferenceChange?.(pref); };
  const chooseScheme = (next: ColorScheme) => { setScheme(next); props.onColorSchemeChange?.(next); };
  const goSources = useCallback(() => setPage('sources'), []);
  const session = useTabletSession({ route: { page: spec.page, state: spec.state ?? '' }, notify, light, onViewSource: goSources });
  const shared = { env, notify, session };
  const newRoster = () => setCreating(true);
  const addData = () => { session.setSourceDetail('add'); setPage('sources'); };
  const openRoster = (name: string) => setEditor(current => ({ name, start: 'editor', key: (current?.key ?? 0) + 1 }));
  const createRoster = (draft: NewRoster) => {
    const { summary, result } = newRosterDocument(draft); setCreating(false);
    session.setRosters(list => [summary, ...list]);
    setEditor(current => ({ name: draft.name, start: 'editor', key: (current?.key ?? 0) + 1, imported: result }));
    notify(`Created “${draft.name}”`);
  };
  const pick = (next: DuoPage) => { setEditor(null); setPage(next); };
  // The shell's own items: Back from Sources to Settings, then New roster, the prominent action of the pages (the phone's
  // centre button, the tablet's rail) except Sources, whose own prominent Add game data takes the place (one prominent
  // item per toolbar); Settings adds Sources. The editor declares its own items instead.
  const shellLayer: BarLayer | null = !vertical || editor ? null : { items: [
    ...(page === 'sources' ? [{ id: 'shell-back', label: 'Back to Settings', hint: 'Back to Settings', icon: ChevronLeft, group: 'nav' as const, onClick: () => setPage('settings') }] : []),
    ...(page === 'sources' ? [] : [{ id: 'shell-new', label: 'New roster', hint: 'Create a roster', icon: Plus, group: 'primary' as const, prominent: true, onClick: newRoster }]),
    ...(page === 'settings' ? [{ id: 'shell-sources', label: 'Sources', hint: 'Sources: installed game data and updates', icon: Database, group: 'secondary' as const, onClick: goSources }] : []),
  ] };
  useLayoutEffect(() => { registry.set('shell', shellLayer); });

  const content = editor
    ? <TabletEditor key={editor.key} env={env} notify={notify} light={light} rosterName={editor.name} from="rosters" start={editor.start}
      onBack={() => setEditor(null)} onAllRosters={() => pick('rosters')} onNewRoster={newRoster} onFindData={() => pick('sources')} onImport={() => setImporting(sampleImport(true))} imported={editor.imported} focusSearch={focusSearch} />
    : <main className="tb-main" aria-label={page}>
      {page === 'rosters' ? <TabletRosters {...shared} onNewRoster={newRoster} onOpenRoster={openRoster} />
        : page === 'lookup' ? <TabletLookup10 {...shared} onAddData={addData} />
          : page === 'tools' ? <TabletTools />
            : page === 'library' ? <TabletLibrary />
              : page === 'sources' ? <TabletSources {...shared} onPage={p => setPage(p === 'home' ? 'rosters' : p)} onOpenRoster={openRoster} />
                : <TabletSettings {...shared} themePref={themePref} scheme={scheme} onTheme={chooseTheme} onScheme={chooseScheme} focusSearch={focusSearch} onFocusSearch={setFocusSearch} />}
      <TabletJobsPanel session={session} />
    </main>;

  return <BarRegistryContext.Provider value={registry}><TabletEnvContext.Provider value={env}>
    <div ref={appRef} className={`tb-app duo-app ux-screen ux-size-regular ${light ? 'light' : 'dark'} ux-scheme-${scheme} tb-${env.widthClass} tb-touch ${editor ? 'tb-editing' : ''} ${vertical ? 'duo-v' : 'duo-h'} ${pose.folded ? 'duo-folded' : ''} duo-${pose.display}`}
      data-device="duo" data-pose={pose.id} data-text={100} data-system="ios" data-motion={experience.reducedMotion ? 'reduce' : 'standard'} data-transparency={experience.reducedTransparency ? 'reduce' : 'standard'}
      style={{ '--duo-fold-x': `${pose.width / 2}px`, '--duo-fold-gap': `${FOLD_GAP}px` } as CSSProperties}>
      {content}
      {vertical ? <DuoSideBar pose={pose} registry={registry} page={page} minimized={!!editor} onPick={pick} />
        : !editor && <DuoBottomTabs page={page} onPick={pick} />}
      {!vertical && !editor && page === 'rosters' && <button type="button" className="duo-btn prominent duo-new-h" aria-label="New roster" onClick={newRoster}><Plus size={22} strokeWidth={2.4} /></button>}
      {importing && <ImportResultSheet result={importing} version="v1.4" onClose={() => setImporting(null)} onOpen={() => {
        const result = importing; setImporting(null);
        setEditor(current => ({ name: result.name, start: 'editor', key: (current?.key ?? 0) + 1, imported: result }));
        notify(`Opened “${result.name}”`);
      }} />}
      <TabletSessionSheets session={session} notify={notify} />
      {creating && <CreateRosterSheet sources={session.jobs.sources} onClose={() => setCreating(false)} onCreate={createRoster} onAddData={() => { setCreating(false); setEditor(null); addData(); }} />}
      <div className={`dt-app tb-shim ${light ? 'light' : ''}`}><ToastRegion toasts={toasts} /></div>
      <IconHints root={appRef} input="touch" />
    </div>
  </TabletEnvContext.Provider></BarRegistryContext.Provider>;
}

/** The foldable library stays on the approved look in this pass: the proposed look (src/look.ts) does not style it yet. */
export function DuoWorkbench(props: Partial<ConceptProps>) {
  return <PinLook look="current"><DuoWorkbenchBody {...props} /></PinLook>;
}
