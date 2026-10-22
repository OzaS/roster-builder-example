import { useEffect, useRef, useState } from 'react';
import type { ConceptProps } from '../shared';
import type { ColorScheme } from '../../types';
import { CodexWorkbench } from '../ux/CodexWorkbench';
import { ToastRegion, useToasts } from '../workspace/Toasts';
import { TabletRail, isTabletPage, type TabletPage } from './TabletRail';
import { TabletHome, TabletLibrary, TabletLookup, TabletRosters, TabletSettings, TabletSources, TabletTools } from './TabletPages';
import { TabletEditor, type EditorStart } from './TabletEditor';
import { rosterLibrary } from '../desktop/desktopData';
import { useTabletEnv } from './tabletEnv';
import './tablet.css';

type ThemePref = 'system' | 'light' | 'dark';

/**
 * The tablet prototype: the desktop structure (a rail with pages and panes) built from the mobile content pieces.
 * Screens `tablet-<page>` open that page; `tablet-editor*` open the roster editor (from Home); `tablet-archive-sketch` (and any
 * phone screen the sketch navigates to) shows the earlier three-pane sketch, unchanged.
 */
const editorScreens: Record<string, EditorStart> = { editor: 'editor', 'editor-issues': 'issues', 'editor-add': 'add' };

export function TabletWorkbench(props: Partial<ConceptProps>) {
  const screen: string | undefined = props.workflowScreen;
  const page = screen === undefined ? 'home' : screen.startsWith('tablet-') ? screen.slice(7) : '';
  if (page in editorScreens) return <TabletShell {...props} initialPage="home" initialEditor={editorScreens[page]} />;
  if (isTabletPage(page)) return <TabletShell {...props} initialPage={page} />;
  const sketch = props as ConceptProps;
  return <CodexWorkbench {...sketch} screen={screen === 'tablet-archive-sketch' ? 'overview' : sketch.screen} workflowScreen={screen === 'tablet-archive-sketch' ? 'overview' : sketch.workflowScreen} />;
}

type OpenEditor = { name: string; from: TabletPage; start: EditorStart; key: number };
const editorAt = (start: EditorStart | undefined, key = 0): OpenEditor | null => start ? { name: rosterLibrary[0].name, from: 'home', start, key } : null;

function TabletShell({ initialPage, initialEditor, ...props }: Partial<ConceptProps> & { initialPage: TabletPage; initialEditor?: EditorStart }) {
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
  const shared = { env, notify };
  const openRoster = (name: string) => setEditor(current => ({ name, from: page, start: 'editor', key: (current?.key ?? 0) + 1 }));
  return <div className={`tb-app ux-screen ux-size-regular ${light ? 'light' : 'dark'} ux-scheme-${scheme} tb-${env.widthClass} tb-${env.input} ${editor ? 'tb-editing' : ''}`} data-device={env.device.id}>
    {editor ? <TabletEditor key={editor.key} env={env} notify={notify} light={light} rosterName={editor.name} from={editor.from} start={editor.start}
      onBack={() => setEditor(null)} onAllRosters={() => { setEditor(null); setPage('rosters'); }} onNewRoster={newRoster} /> : <>
    <TabletRail page={page} input={env.input} onPage={setPage} onNewRoster={newRoster} />
    <main className="tb-main" aria-label={page}>
      {page === 'home' ? <TabletHome {...shared} onPage={setPage} onNewRoster={newRoster} onOpenRoster={openRoster} />
        : page === 'rosters' ? <TabletRosters {...shared} onNewRoster={newRoster} onOpenRoster={openRoster} />
          : page === 'lookup' ? <TabletLookup {...shared} />
            : page === 'tools' ? <TabletTools />
              : page === 'library' ? <TabletLibrary />
                : page === 'sources' ? <TabletSources {...shared} />
                  : <TabletSettings {...shared} themePref={themePref} light={light} scheme={scheme} onTheme={chooseTheme} onScheme={chooseScheme} />}
    </main></>}
    <div className={`dt-app tb-shim ${light ? 'light' : ''}`}><ToastRegion toasts={toasts} /></div>
  </div>;
}
