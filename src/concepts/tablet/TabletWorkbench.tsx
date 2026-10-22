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
const editorScreens: Record<string, EditorStart> = { 'tablet-editor': 'editor', 'tablet-editor-issues': 'issues', 'tablet-editor-add': 'add' };

export function TabletWorkbench(props: Partial<ConceptProps>) {
  const screen: string | undefined = props.workflowScreen;
  const editorStart = screen ? editorScreens[screen] : undefined;
  const route = editorStart ? tabletRoute('tablet-home') : tabletRoute(screen); // a rail page, or a state of one (`tablet-home-first-run`, ...)
  if (route) return <TabletShell key={screen} {...props} route={route} initialEditor={editorStart} />;
  const sketch = props as ConceptProps;
  return <CodexWorkbench {...sketch} screen={screen === 'tablet-archive-sketch' ? 'overview' : sketch.screen} workflowScreen={screen === 'tablet-archive-sketch' ? 'overview' : sketch.workflowScreen} />;
}

type OpenEditor = { name: string; from: TabletPage; start: EditorStart; key: number };
const editorAt = (start: EditorStart | undefined, key = 0): OpenEditor | null => start ? { name: rosterLibrary[0].name, from: 'home', start, key } : null;

function TabletShell({ route, initialEditor, ...props }: Partial<ConceptProps> & { route: TabletRoute; initialEditor?: EditorStart }) {
  const initialPage = route.page;
  const env = useTabletEnv();
  const [page, setPage] = useState<TabletPage>(initialPage);
  // One roster at a time (DEC-039): the editor covers the rail; Back returns to the page it was opened from.
  const [editor, setEditor] = useState<OpenEditor | null>(() => editorAt(initialEditor));
  const [themePref, setThemePref] = useState<ThemePref>(props.themePreference ?? props.themeMode ?? 'dark');
  const [light, setLight] = useState(props.themeMode === 'light');
  const [scheme, setScheme] = useState<ColorScheme>(props.colorScheme ?? 'default');
  const toasts = useToasts();
  const { notify } = toasts;
  const shownScreen = useRef(`${initialPage}/${initialEditor}`);
  useEffect(() => {
    if (shownScreen.current === `${initialPage}/${initialEditor}`) return;
    shownScreen.current = `${initialPage}/${initialEditor}`;
    setPage(initialPage); setEditor(current => editorAt(initialEditor, (current?.key ?? 0) + 1));
  }, [initialPage, initialEditor]);
  useEffect(() => { setLight(props.themeMode === 'light'); }, [props.themeMode]);
  useEffect(() => { setScheme(props.colorScheme ?? 'default'); }, [props.colorScheme]);
  const chooseTheme = (pref: ThemePref) => { setThemePref(pref); setLight(pref === 'light' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches)); props.onThemePreferenceChange?.(pref); };
  const chooseScheme = (next: ColorScheme) => { setScheme(next); props.onColorSchemeChange?.(next); };
  const newRoster = () => notify('New roster: guided creation opens here (designed in T3)');
  const goSources = useCallback(() => setPage('sources'), []);
  const session = useTabletSession({ route, notify, light, onViewSource: goSources });
  const shared = { env, notify, session };
  const addData = () => { session.setSourceDetail('add'); setPage('sources'); };
  const openRoster = (name: string) => setEditor(current => ({ name, from: page, start: 'editor', key: (current?.key ?? 0) + 1 }));
  return <div className={`tb-app ux-screen ux-size-regular ${light ? 'light' : 'dark'} ux-scheme-${scheme} tb-${env.widthClass} tb-${env.input} ${editor ? 'tb-editing' : ''}`} data-device={env.device.id}>
    {editor ? <TabletEditor key={editor.key} env={env} notify={notify} light={light} rosterName={editor.name} from={editor.from} start={editor.start}
      onBack={() => setEditor(null)} onAllRosters={() => { setEditor(null); setPage('rosters'); }} onNewRoster={newRoster} /> : <>
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
    <div className={`dt-app tb-shim ${light ? 'light' : ''}`}><ToastRegion toasts={toasts} /></div>
  </div>;
}
