import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { JobsPanel, JobsToggle, useWorkspaceJobs } from '../workspace/Jobs';
import type { Notify } from '../workspace/Toasts';
import { collectionSources, installedSources, rosterLibrary, type RosterSummary } from '../desktop/desktopData';
import { isTabletPage, type TabletPage } from './TabletRail';
import { manyRosters } from './tabletData';

// Prototype-session state the tablet pages share: the roster list, the install and update jobs, the Advanced installation
// setting and where the Sources and Settings pages are pointing. State screens (`tablet-sources-add`, ...) start the
// session in a state; the shell is keyed by the screen, so switching screens starts afresh.

export type TabletRoute = { page: TabletPage; state: string };

const stateRoutes: Record<string, TabletRoute> = {
  'tablet-home-first-run': { page: 'home', state: 'first-run' },
  'tablet-home-no-rosters': { page: 'home', state: 'no-rosters' },
  'tablet-rosters-empty': { page: 'rosters', state: 'empty' },
  'tablet-rosters-many': { page: 'rosters', state: 'many' },
  'tablet-rosters-search': { page: 'rosters', state: 'search' },
  'tablet-sources-add': { page: 'sources', state: 'add' },
  'tablet-sources-installing': { page: 'sources', state: 'installing' },
  'tablet-sources-choose-factions': { page: 'sources', state: 'choose-factions' },
  'tablet-sources-update-report': { page: 'sources', state: 'update-report' },
  'tablet-sources-collection': { page: 'sources', state: 'collection' },
  'tablet-sources-github': { page: 'sources', state: 'github' },
  'tablet-sources-add-collection': { page: 'sources', state: 'add-collection' },
  'tablet-settings-game-data': { page: 'settings', state: 'game-data' },
  'tablet-settings-shortcuts': { page: 'settings', state: 'keys' },
};

/** Which page (and state) a gallery screen shows; undefined for screens that are not tablet pages. */
export function tabletRoute(screen: string | undefined): TabletRoute | undefined {
  if (screen === undefined) return { page: 'home', state: '' };
  if (stateRoutes[screen]) return stateRoutes[screen];
  const page = screen.startsWith('tablet-') ? screen.slice(7) : '';
  return isTabletPage(page) ? { page, state: '' } : undefined;
}

const sourceDetailOf: Record<string, string> = { add: 'add', installing: 'add', 'choose-factions': 'add', 'update-report': 'report:system-two', collection: 'collection:default', github: 'github', 'add-collection': 'add' };
const settingsSectionOf: Record<string, string> = { 'game-data': 'data', keys: 'keys' };
/** The first install of the 'installing' and 'choose-factions' states: a source with six factions. */
const demoInstall = collectionSources[2];

export function useTabletSession({ route, notify, light, onViewSource }: { route: TabletRoute; notify: Notify; light: boolean; onViewSource: () => void }) {
  const { state } = route;
  const [rosters, setRosters] = useState<RosterSummary[]>(() => ['first-run', 'no-rosters', 'empty'].includes(state) ? [] : state === 'many' || state === 'search' ? manyRosters : rosterLibrary);
  const [advancedInstall, setAdvancedInstall] = useState(state === 'choose-factions');
  const [jobsOpen, setJobsOpen] = useState(false);
  /** Sources page: a source id, 'add', 'github', 'collection:<id>' or 'report:<id>'; undefined = nothing opened yet. */
  const [sourceDetail, setSourceDetail] = useState<string | undefined>(route.page === 'sources' ? sourceDetailOf[state] : undefined);
  const [settingsSection, setSettingsSection] = useState<string | undefined>(route.page === 'settings' ? settingsSectionOf[state] : undefined);
  const viewSource = useCallback((id: string) => { setSourceDetail(id); setJobsOpen(false); onViewSource(); }, [onViewSource]);
  const jobs = useWorkspaceJobs(state === 'first-run' ? [] : installedSources, notify, viewSource, advancedInstall);
  useEffect(() => {
    if (state !== 'installing' && state !== 'choose-factions') return;
    jobs.startInstall(demoInstall);
    setJobsOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, when the state screen opens
  }, []);
  const hasData = jobs.sources.length > 0;
  return { state, light, rosters, setRosters, advancedInstall, setAdvancedInstall, jobs, jobsOpen, setJobsOpen, sourceDetail, setSourceDetail, settingsSection, setSettingsSection, viewSource, hasData };
}
export type TabletSession = ReturnType<typeof useTabletSession>;
export type SetState<T> = Dispatch<SetStateAction<T>>;

/** Progress button for a toolbar row: live progress of the jobs, opens the jobs popover (workspace Jobs). */
export function TabletJobsButton({ session }: { session: TabletSession }) {
  const { jobs, jobsOpen, setJobsOpen, light } = session;
  return <div className={`dt-app tb-shim tb-jobs-btn ${light ? 'light' : ''}`}><JobsToggle jobs={jobs.jobs} open={jobsOpen} onToggle={() => setJobsOpen(!jobsOpen)} /></div>;
}

/** The jobs popover under the toolbar row, over the page. Faction picking appears only with Advanced installation on. */
export function TabletJobsPanel({ session }: { session: TabletSession }) {
  const { jobs, jobsOpen, setJobsOpen, viewSource, light } = session;
  if (!jobsOpen || !jobs.jobs.length) return null;
  const live = (status: string) => status === 'running' || status === 'needs-you';
  return <div className={`dt-app tb-shim tb-jobs ${light ? 'light' : ''}`}>
    <JobsPanel jobs={jobs.jobs} onChoose={jobs.chooseFactions} onCancel={jobs.cancel} onHide={() => setJobsOpen(false)} onViewSource={viewSource}
      onClear={() => { jobs.clearEnded(); if (!jobs.jobs.some(j => live(j.status))) setJobsOpen(false); }} />
  </div>;
}
