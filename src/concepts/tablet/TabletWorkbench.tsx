import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConceptProps } from '../shared';
import type { ColorScheme } from '../../types';
import { CodexWorkbench } from '../ux/CodexWorkbench';
import { ToastRegion, useToasts } from '../workspace/Toasts';
import { TabletRail, type TabletPage } from './TabletRail';
import { TabletHome, TabletLibrary, TabletLookup, TabletRosters, TabletTools } from './TabletPages';
import { TabletSources } from './TabletSources';
import { TabletSettings } from './TabletSettings';
import { TabletEditor, type EditorStart } from './TabletEditor';
import { ImportResultSheet } from './TabletEditorSheets';
import { CreateRosterSheet, newRosterDocument, type NewRoster } from './TabletCreateSheet';
import { TabletSessionSheets } from './TabletSheets';
import { sampleImport, type ImportResult } from '../desktop/DesktopEditorFlows';
import { rosterLibrary } from '../desktop/desktopData';
import { tabletRoute, useTabletSession, TabletJobsPanel, type TabletRoute } from './tabletSession';
import { useTabletEnv } from './tabletEnv';
import './tablet.css';

type ThemePref = 'system' | 'light' | 'dark';

/**
 * The tablet prototype: the desktop structure (a rail with pages and panes) built from the mobile content pieces.
 * Screens `tablet-<page>` open that page (or a state of one, see `tabletRoute`); `tablet-editor*` open the roster editor
 * (from Home); `tablet-archive-sketch` (and any phone screen the sketch navigates to) shows the earlier three-pane sketch, unchanged.
 */
const editorScreens: Record<string, EditorStart> = { 'tablet-editor': 'editor', 'tablet-editor-issues': 'issues', 'tablet-editor-add': 'add', 'tablet-editor-forces': 'forces', 'tablet-editor-add-force': 'add-force', 'tablet-editor-readonly': 'readonly', 'tablet-editor-export': 'export' };

export function TabletWorkbench(props: Partial<ConceptProps>) {
  const screen: string | undefined = props.workflowScreen;
  if (screen === 'tablet-editor-import-result') return <TabletShell key={screen} {...props} route={{ page: 'rosters', state: '' }} initialImport />;
  const editorStart = screen ? editorScreens[screen] : undefined;
  const route = editorStart ? tabletRoute('tablet-home') : tabletRoute(screen); // a rail page, or a state of one (`tablet-home-first-run`, ...)
  if (route) return <TabletShell key={screen} {...props} route={route} initialEditor={editorStart} />;
  const sketch = props as ConceptProps;
  return <CodexWorkbench {...sketch} screen={screen === 'tablet-archive-sketch' ? 'overview' : sketch.screen} workflowScreen={screen === 'tablet-archive-sketch' ? 'overview' : sketch.workflowScreen} />;
}

type OpenEditor = { name: string; from: TabletPage; start: EditorStart; key: number; imported?: ImportResult };
const editorAt = (start: EditorStart | undefined, key = 0): OpenEditor | null => start ? { name: rosterLibrary[0].name, from: 'home', start, key } : null;

function TabletShell({ route, initialEditor, initialImport = false, ...props }: Partial<ConceptProps> & { route: TabletRoute; initialEditor?: EditorStart; initialImport?: boolean }) {
  const initialPage = route.page;
  const env = useTabletEnv();
  const [page, setPage] = useState<TabletPage>(initialPage);
  // One roster at a time (DEC-039): the editor covers the rail; Back returns to the page it was opened from.
  const [editor, setEditor] = useState<OpenEditor | null>(() => editorAt(initialEditor));
  // The import result sheet (a file was chosen and matched against the installed data) sits over whatever is open.
  const [importing, setImporting] = useState<ImportResult | null>(() => initialImport ? sampleImport(true) : null);
  const [themePref, setThemePref] = useState<ThemePref>(props.themePreference ?? props.themeMode ?? 'dark');
  const [light, setLight] = useState(props.themeMode === 'light');
  const [scheme, setScheme] = useState<ColorScheme>(props.colorScheme ?? 'default');
  const toasts = useToasts();
  const { notify } = toasts;
  const shownScreen = useRef(`${initialPage}/${initialEditor}/${initialImport}`);
  useEffect(() => {
    if (shownScreen.current === `${initialPage}/${initialEditor}/${initialImport}`) return;
    shownScreen.current = `${initialPage}/${initialEditor}/${initialImport}`;
    setPage(initialPage); setEditor(current => editorAt(initialEditor, (current?.key ?? 0) + 1)); setImporting(initialImport ? sampleImport(true) : null);
  }, [initialPage, initialEditor, initialImport]);
  useEffect(() => { setLight(props.themeMode === 'light'); }, [props.themeMode]);
  useEffect(() => { setScheme(props.colorScheme ?? 'default'); }, [props.colorScheme]);
  const chooseTheme = (pref: ThemePref) => { setThemePref(pref); setLight(pref === 'light' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches)); props.onThemePreferenceChange?.(pref); };
  const chooseScheme = (next: ColorScheme) => { setScheme(next); props.onColorSchemeChange?.(next); };
  // Guided creation (T3): every New roster entry opens the sheet over whatever is open; Create roster opens the editor on the new roster.
  const [creating, setCreating] = useState<'start' | 'review' | null>(route.state === 'create' ? 'start' : route.state === 'create-review' ? 'review' : null);
  const newRoster = () => setCreating('start');
  const goSources = useCallback(() => setPage('sources'), []);
  const session = useTabletSession({ route, notify, light, onViewSource: goSources });
  const shared = { env, notify, session };
  const { jobs } = session;
  const addData = () => { session.setSourceDetail('add'); setPage('sources'); };
  const createRoster = (draft: NewRoster) => {
    const { summary, result } = newRosterDocument(draft); setCreating(null);
    session.setRosters(list => [summary, ...list]);
    setEditor(current => ({ name: draft.name, from: current?.from ?? page, start: 'editor', key: (current?.key ?? 0) + 1, imported: result }));
    notify(`Created “${draft.name}”`);
  };
  const openRoster = (name: string) => setEditor(current => ({ name, from: page, start: 'editor', key: (current?.key ?? 0) + 1 }));
  return <div className={`tb-app ux-screen ux-size-regular ${light ? 'light' : 'dark'} ux-scheme-${scheme} tb-${env.widthClass} tb-${env.input} ${editor ? 'tb-editing' : ''}`} data-device={env.device.id}>
    {editor ? <TabletEditor key={editor.key} env={env} notify={notify} light={light} rosterName={editor.name} from={editor.from} start={editor.start}
      onBack={() => setEditor(null)} onAllRosters={() => { setEditor(null); setPage('rosters'); }} onNewRoster={newRoster} onFindData={() => { setEditor(null); setPage('sources'); }} onImport={() => setImporting(sampleImport(true))} imported={editor.imported} /> : <>
    <TabletRail page={page} input={env.input} onPage={setPage} onNewRoster={newRoster} />
    <main className="tb-main" aria-label={page}>
      {page === 'home' ? <TabletHome {...shared} onPage={setPage} onNewRoster={newRoster} onOpenRoster={openRoster} />
        : page === 'rosters' ? <TabletRosters {...shared} onNewRoster={newRoster} onOpenRoster={openRoster} />
          : page === 'lookup' ? <TabletLookup {...shared} onAddData={addData} />
            : page === 'tools' ? <TabletTools />
              : page === 'library' ? <TabletLibrary />
                : page === 'sources' ? <TabletSources {...shared} onPage={setPage} onOpenRoster={openRoster} />
                  : <TabletSettings {...shared} themePref={themePref} scheme={scheme} onTheme={chooseTheme} onScheme={chooseScheme} />}
      <TabletJobsPanel session={session} />
    </main></>}
    {importing && <ImportResultSheet result={importing} version="v1.4" onClose={() => setImporting(null)} onOpen={() => {
      const result = importing; setImporting(null);
      setEditor(current => ({ name: result.name, from: current?.from ?? page, start: 'editor', key: (current?.key ?? 0) + 1, imported: result }));
      const left = result.unmatched.length; notify(left ? `Opened “${result.name}” without ${left === 1 ? '1 entry' : `${left} entries`}` : `Opened “${result.name}”`);
    }} />}
    <TabletSessionSheets session={session} notify={notify} />
    {creating && <CreateRosterSheet sources={jobs.sources} review={creating === 'review'} onClose={() => setCreating(null)} onCreate={createRoster} onAddData={() => { setCreating(null); setEditor(null); addData(); }} />}
    <div className={`dt-app tb-shim ${light ? 'light' : ''}`}><ToastRegion toasts={toasts} /></div>
  </div>;
}
