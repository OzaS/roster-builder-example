import { useEffect, useState } from 'react';
import type { ConceptProps } from '../shared';
import type { ColorScheme } from '../../types';
import { CodexWorkbench } from '../ux/CodexWorkbench';
import { ToastRegion, useToasts } from '../workspace/Toasts';
import { TabletRail, isTabletPage, type TabletPage } from './TabletRail';
import { TabletHome, TabletLibrary, TabletLookup, TabletRosters, TabletSettings, TabletSources, TabletTools } from './TabletPages';
import { useTabletEnv } from './tabletEnv';
import './tablet.css';

type ThemePref = 'system' | 'light' | 'dark';

/**
 * The tablet prototype: the desktop structure (a rail with pages and panes) built from the mobile content pieces.
 * Screens `tablet-<page>` open that page; `tablet-archive-sketch` (and any phone screen the sketch navigates to) shows the
 * earlier three-pane sketch, unchanged.
 */
export function TabletWorkbench(props: Partial<ConceptProps>) {
  const screen: string | undefined = props.workflowScreen;
  const page = screen === undefined ? 'home' : screen.startsWith('tablet-') ? screen.slice(7) : '';
  if (isTabletPage(page)) return <TabletShell {...props} initialPage={page} />;
  const sketch = props as ConceptProps;
  return <CodexWorkbench {...sketch} screen={screen === 'tablet-archive-sketch' ? 'overview' : sketch.screen} workflowScreen={screen === 'tablet-archive-sketch' ? 'overview' : sketch.workflowScreen} />;
}

function TabletShell({ initialPage, ...props }: Partial<ConceptProps> & { initialPage: TabletPage }) {
  const env = useTabletEnv();
  const [page, setPage] = useState<TabletPage>(initialPage);
  const [themePref, setThemePref] = useState<ThemePref>(props.themePreference ?? props.themeMode ?? 'dark');
  const [light, setLight] = useState(props.themeMode === 'light');
  const [scheme, setScheme] = useState<ColorScheme>(props.colorScheme ?? 'default');
  const toasts = useToasts();
  const { notify } = toasts;
  useEffect(() => { setPage(initialPage); }, [initialPage]);
  useEffect(() => { setLight(props.themeMode === 'light'); }, [props.themeMode]);
  useEffect(() => { setScheme(props.colorScheme ?? 'default'); }, [props.colorScheme]);
  const chooseTheme = (pref: ThemePref) => { setThemePref(pref); setLight(pref === 'light' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches)); props.onThemePreferenceChange?.(pref); };
  const chooseScheme = (next: ColorScheme) => { setScheme(next); props.onColorSchemeChange?.(next); };
  const newRoster = () => notify('New roster: guided creation opens here (designed in T3)');
  const shared = { env, notify };
  return <div className={`tb-app ux-screen ux-size-regular ${light ? 'light' : 'dark'} ux-scheme-${scheme} tb-${env.widthClass} tb-${env.input}`} data-device={env.device.id}>
    <TabletRail page={page} input={env.input} onPage={setPage} onNewRoster={newRoster} />
    <main className="tb-main" aria-label={page}>
      {page === 'home' ? <TabletHome {...shared} onPage={setPage} onNewRoster={newRoster} />
        : page === 'rosters' ? <TabletRosters {...shared} />
          : page === 'lookup' ? <TabletLookup {...shared} />
            : page === 'tools' ? <TabletTools />
              : page === 'library' ? <TabletLibrary />
                : page === 'sources' ? <TabletSources {...shared} />
                  : <TabletSettings {...shared} themePref={themePref} light={light} scheme={scheme} onTheme={chooseTheme} onScheme={chooseScheme} />}
    </main>
    <div className={`dt-app tb-shim ${light ? 'light' : ''}`}><ToastRegion toasts={toasts} /></div>
  </div>;
}
