import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { JobsPanel, useWorkspaceJobs } from '../workspace/Jobs';
import type { Notify } from '../workspace/Toasts';
import { collectionSources, installedSources, rosterLibrary, type RosterSummary } from '../desktop/desktopData';
import { isTabletPage, type TabletPage } from './TabletRail';
import { manyRosters } from './tabletData';

// Prototype-session state the tablet pages share: the roster list, the install and update jobs, the Advanced installation
// setting and where the Sources and Settings pages are pointing. State screens (`tablet-sources-add`, ...) start the
// session in a state; the shell is keyed by the screen, so switching screens starts afresh.

export type TabletRoute = { page: TabletPage; state: string };
/** The appearance import sheet: what is being imported and how far the import is. */
export type AppearanceOutcome = 'idle' | 'importing' | 'scheme' | 'language' | 'error';
export type AppearanceImport = { kind: 'scheme' | 'language'; outcome: AppearanceOutcome };

const stateRoutes: Record<string, TabletRoute> = {
  'tablet-home-first-run': { page: 'home', state: 'first-run' },
  'tablet-home-no-rosters': { page: 'home', state: 'no-rosters' },
  'tablet-rosters-empty': { page: 'rosters', state: 'empty' },
  'tablet-rosters-many': { page: 'rosters', state: 'many' },
  'tablet-rosters-search': { page: 'rosters', state: 'search' },
  'tablet-rosters-system': { page: 'rosters', state: 'system' },
  'tablet-rosters-grouped': { page: 'rosters', state: 'grouped' },
  'tablet-sources-add': { page: 'sources', state: 'add' },
  'tablet-sources-installing': { page: 'sources', state: 'installing' },
  'tablet-sources-choose-factions': { page: 'sources', state: 'choose-factions' },
  'tablet-sources-update-report': { page: 'sources', state: 'update-report' },
  'tablet-sources-collection': { page: 'sources', state: 'collection' },
  'tablet-sources-github': { page: 'sources', state: 'github' },
  'tablet-sources-add-collection': { page: 'sources', state: 'add-collection' },
  'tablet-settings-game-data': { page: 'settings', state: 'game-data' },
  'tablet-settings-shortcuts': { page: 'settings', state: 'keys' },
  'tablet-settings-appearance-import': { page: 'settings', state: 'appearance-import' },
  'tablet-create': { page: 'home', state: 'create' },
  'tablet-create-review': { page: 'home', state: 'create-review' },
  'tablet-confirm-delete': { page: 'rosters', state: 'confirm-delete' },
};

/** Which page (and state) a gallery screen shows; undefined for screens that are not tablet pages. */
export function tabletRoute(screen: string | undefined): TabletRoute | undefined {
  if (screen === undefined) return { page: 'home', state: '' };
  if (stateRoutes[screen]) return stateRoutes[screen];
  const page = screen.startsWith('tablet-') ? screen.slice(7) : '';
  return isTabletPage(page) ? { page, state: '' } : undefined;
}

const sourceDetailOf: Record<string, string> = { add: 'add', installing: 'add', 'choose-factions': 'add', 'update-report': 'report:system-two', collection: 'collection:default', github: 'github', 'add-collection': 'add' };
const settingsSectionOf: Record<string, string> = { 'game-data': 'data', keys: 'keys', 'appearance-import': 'appearance' };
/** The first install of the 'installing' and 'choose-factions' states: a source with six factions. */
const demoInstall = collectionSources[2];

export function useTabletSession({ route, notify, light, onViewSource }: { route: TabletRoute; notify: Notify; light: boolean; onViewSource: () => void }) {
  const { state } = route;
  const [rosters, setRosters] = useState<RosterSummary[]>(() => ['first-run', 'no-rosters', 'empty'].includes(state) ? [] : ['many', 'search', 'system', 'grouped'].includes(state) ? manyRosters : rosterLibrary);
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
  // Sheets that cover the whole window (T3), opened from pages and shown by the shell (TabletSessionSheets).
  // Faction picker: an install paused on "Choose factions" (Advanced installation) opens it once by itself; Choose later closes it
  // and the jobs popover offers it again.
  const [pickerJob, setPickerJob] = useState<string | null>(null);
  const asked = useRef(new Set<string>());
  const waiting = jobs.jobs.find(j => j.status === 'needs-you')?.id;
  useEffect(() => { if (waiting && !asked.current.has(waiting)) { asked.current.add(waiting); setPickerJob(waiting); } }, [waiting]);
  const [addCollectionOpen, setAddCollectionOpen] = useState(state === 'add-collection');
  const [appearanceImport, setAppearanceImport] = useState<AppearanceImport | null>(state === 'appearance-import' ? { kind: 'scheme', outcome: 'scheme' } : null);
  const [language, setLanguage] = useState('en');
  const [deleting, setDeleting] = useState<string | null>(state === 'confirm-delete' ? rosters[0]?.name ?? null : null);
  return { state, light, rosters, setRosters, advancedInstall, setAdvancedInstall, jobs, jobsOpen, setJobsOpen, sourceDetail, setSourceDetail, settingsSection, setSettingsSection, viewSource, hasData,
    pickerJob, setPickerJob, addCollectionOpen, setAddCollectionOpen, appearanceImport, setAppearanceImport, language, setLanguage, deleting, setDeleting };
}
export type TabletSession = ReturnType<typeof useTabletSession>;
export type SetState<T> = Dispatch<SetStateAction<T>>;

/** Job details requested from Home or Sources in-page controls. Faction picking appears only with Advanced installation on. */
export function TabletJobsPanel({ session }: { session: TabletSession }) {
  const { jobs, jobsOpen, setJobsOpen, viewSource, setPickerJob, light } = session;
  if (!jobsOpen || !jobs.jobs.length) return null;
  const live = (status: string) => status === 'running' || status === 'needs-you';
  return <div className={`dt-app tb-shim tb-jobs ${light ? 'light' : ''}`}>
    <JobsPanel jobs={jobs.jobs} onChoose={jobs.chooseFactions} onPick={setPickerJob} onCancel={jobs.cancel} onHide={() => setJobsOpen(false)} onViewSource={viewSource}
      onClear={() => { jobs.clearEnded(); if (!jobs.jobs.some(j => live(j.status))) setJobsOpen(false); }} />
  </div>;
}
