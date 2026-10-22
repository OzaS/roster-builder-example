import { useMemo, useState } from 'react';
import { BookMarked, Hammer } from 'lucide-react';
import { LibrarySwitch } from '../../gallery/LibrarySwitch';
import { ComingSoonCard } from '../ux/AppExtras';
import { TabletControls } from './TabletControls';
import { TabletDeviceFrame } from './TabletDeviceFrame';
import { TabletRail } from './TabletRail';
import { TabletWorkbench } from './TabletWorkbench';
import { TabletPrefsContext, makeTabletEnv, TabletEnvContext } from './tabletEnv';
import { defaultDeviceId, defaultInput, tabletDevices, widthClassLabel, widthClassOf, type TabletDeviceId, type TabletInput } from './tabletDevices';
import './tablet.css';

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
      <h2>Roster editor flows · several forces, add force (form sheet), read-only roster</h2>
      <p>The form sheet is the tablet dialog: a centred sheet with Cancel, title and the primary action in its header and the mobile controls inside; in split view it fills the window. Several forces add a menu to each force card (add unit here, rename, remove), the Adding here chip and an Add force row. A read-only roster explains why, offers an editable copy and keeps edits off.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-forces" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-readonly" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-editor-add-force" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-editor-add-force" /></TabletDeviceFrame></div>
      <h2>Framed compositions · the selected device and input mode</h2>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width"><TabletWorkbench workflowScreen="tablet-rosters" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-lookup" /></TabletDeviceFrame></div>
    </div>
  </TabletPrefsContext.Provider>;
}
