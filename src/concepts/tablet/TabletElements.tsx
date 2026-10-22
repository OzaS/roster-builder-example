import { useMemo, useState } from 'react';
import { BookMarked, Hammer, Layers3, Plus } from 'lucide-react';
import { LibrarySwitch } from '../../gallery/LibrarySwitch';
import { ComingSoonCard } from '../ux/AppExtras';
import { TabletControls } from './TabletControls';
import { TabletDeviceFrame } from './TabletDeviceFrame';
import { TabletRail } from './TabletRail';
import { EmptyState, InstallRow } from './TabletPieces';
import type { Job } from '../workspace/Jobs';
import { defaultBindings, formatCombo } from '../desktop/desktopKeys';
import { TabletWorkbench } from './TabletWorkbench';
import { TabletPrefsContext, makeTabletEnv, TabletEnvContext } from './tabletEnv';
import { defaultDeviceId, defaultInput, tabletDevices, widthClassLabel, widthClassOf, type TabletDeviceId, type TabletInput } from './tabletDevices';
import './tablet.css';

const demoJob = (status: Job['status'], progress: number): Job => ({ id: 'demo', kind: 'install', sourceId: 'demo', name: 'Example System Three', size: '22.4 MB', factions: [], chosen: [], status, steps: [{ label: 'Download', state: status === 'needs-you' ? 'needs-you' : 'active', progress }] });
const noop = () => {};

/** The Elements view of the Tablet library: the rail, the device frames, the input switch and two framed compositions. */
export function TabletElements() {
  const [deviceId, setDeviceId] = useState<TabletDeviceId>(defaultDeviceId);
  const [input, setInput] = useState<TabletInput>(defaultInput);
  const prefs = useMemo(() => ({ deviceId, input, setDeviceId, setInput }), [deviceId, input]);
  const [page, setPage] = useState<'home' | 'rosters' | 'tools'>('rosters');
  const railIn = (mode: TabletInput) => <div className="tb-app ux-screen ux-size-regular dark tb-medium" style={{ height: 'auto', flex: 'none', background: 'var(--ux-bg)', borderRadius: 18, overflow: 'visible', width: 'max-content' }}>
    <TabletEnvContext.Provider value={makeTabletEnv('ipad-portrait', mode)}><div style={{ height: 620, display: 'flex' }}><TabletRail page={page} input={mode} onPage={p => setPage(p as typeof page)} onNewRoster={() => {}} /></div></TabletEnvContext.Provider>
  </div>;
  return <TabletPrefsContext.Provider value={prefs}>
    <div className="tb-elements">
      <h1>Tablet · Elements (Tablet 00)</h1>
      <p>The tablet takes the desktop structure (a rail with pages and panes) and the mobile look (mobile type sizes, targets of 44 px and more, the shared --ux-* tokens and colour schemes). Device, input mode, theme, colour scheme and Ambient are gallery controls.</p>
      <h2>Design library navigation</h2>
      <LibrarySwitch current="tablet" label="Design library examples" />
      <h2>Tablet rail · Touch (press and hold shows the hint) and Pointer (hover shows the title)</h2>
      <div className="tb-el-row">{railIn('touch')}{railIn('pointer')}
        <div className="tb-el-note"><strong>Hint bubble</strong><span className="tb-hint-bubble static">Rosters: find, open and manage your rosters</span><small>Material 3 rail: New roster is an icon-only FAB on top (56 px, tonal, no shadow, aligned with the page content); Home, Rosters, Lookup, Tools, Library; Sources and Settings pinned to the bottom. Pill indicator behind the active icon, aria-current, focus ring, 56 px and larger targets.</small></div>
      </div>
      <h2>Device frames · same scale</h2>
      <div className="tb-el-devices">{tabletDevices.map(d => <figure key={d.id}><i style={{ width: d.width / 8, height: d.height / 8 }} className={d.system} /><figcaption><strong>{d.label}</strong>{d.width} × {d.height} · {widthClassLabel[widthClassOf(d.width)]}</figcaption></figure>)}</div>
      <h2>Device and input mode switches</h2>
      <div className="tb-el-controls"><TabletControls /></div>
      <h2>Coming soon placeholders · Tools and Library</h2>
      <div className="tb-el-row"><div className="tb-app ux-screen dark tb-el-card"><ComingSoonCard icon={Hammer} title="Tools" description="Roster analytics, comparison, a game tracker and a dice simulator." planned="Planned for 1.2+" covers="" /></div><div className="tb-app ux-screen dark tb-el-card"><ComingSoonCard icon={BookMarked} title="Library" description="Units and detachments you saved, ready to reuse." planned="Planned for 1.2+" covers="" /></div></div>
      <h2>Roster editor · Expanded (catalogue, force tree, unit details), Medium (tree and details, catalogue slide-over) and split view</h2>
      <p>Editor header (Back, roster switcher, undo and redo, points button, More), the points line, resizable panes with a touch grab handle, mobile tree cards and unit rows (press and hold or right-click for the row menu), the mobile unit detail as a pane, the summary popover with issues and Show. Screens: Roster editor, Summary with issues, Add unit.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-issues" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-editor-add" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-editor" /></TabletDeviceFrame></div>
      <h2>Empty state card · first run, no rosters, no match</h2>
      <div className="tb-el-row"><div className="tb-app ux-screen dark tb-el-card"><EmptyState icon={Layers3} title="No rosters yet" text="Create a roster, or import one from a file."><button type="button" className="ux-primary tb-primary"><Plus size={17} />New roster</button><button type="button" className="ux-job-btn">Import a roster</button></EmptyState></div></div>
      <h2>Install row · Install, installing, choose factions, update, installed (44 px actions; progress under the text)</h2>
      <div className="tb-el-row"><div className="tb-app ux-screen dark tb-el-card tb-el-stack">
        <InstallRow title="Example System Three" sub="Example game system · 6 factions · 22.4 MB" onInstall={noop} onJobs={noop} />
        <InstallRow title="Example System Three" sub="Example game system · 6 factions · 22.4 MB" live={demoJob('running', 40)} onInstall={noop} onJobs={noop} />
        <InstallRow title="Example System Three" sub="Waiting for you to choose factions" live={demoJob('needs-you', 0)} onInstall={noop} onJobs={noop} />
        <InstallRow title="Open Field" sub="Example game system · 3 factions · 14.2 MB" update onInstall={noop} onUpdate={noop} onJobs={noop} />
        <InstallRow title="Example Skirmish" sub="Example skirmish system · 2 factions · 2.3 MB" installed onInstall={noop} onShow={noop} onJobs={noop} />
      </div></div>
      <h2>Keyboard shortcut rows · read-only (hardware keyboard)</h2>
      <div className="tb-el-row"><div className="tb-app ux-screen dark tb-el-card"><div className="ux-src-group">{(['palette', 'undo', 'exportRoster'] as const).map(id => <div className="ux-src-kv tb-key-row" key={id}><span>{id === 'palette' ? 'Command palette' : id === 'undo' ? 'Undo' : 'Export roster'}</span><kbd className="tb-kbd">{formatCombo(defaultBindings[id])}</kbd></div>)}</div></div></div>
      <h2>Framed compositions · the selected device and input mode</h2>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width"><TabletWorkbench workflowScreen="tablet-rosters" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-lookup" /></TabletDeviceFrame><TabletDeviceFrame fit="width"><TabletWorkbench workflowScreen="tablet-sources-choose-factions" /></TabletDeviceFrame></div>
    </div>
  </TabletPrefsContext.Provider>;
}
