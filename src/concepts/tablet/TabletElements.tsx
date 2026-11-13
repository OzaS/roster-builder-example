import { useMemo, useState } from 'react';
import { BookMarked, Check, CheckSquare, ChevronRight, FileUp, FolderOpen, Hammer, Info, Layers3, Plus, Search } from 'lucide-react';
import { FIRST_RUN_NO_PRESET, NoPresetCollections } from '../desktop/DesktopSourceFlows';
import { LibrarySwitch } from '../../gallery/LibrarySwitch';
import { ComingSoonCard } from '../ux/AppExtras';
import { TabletControls } from './TabletControls';
import { RosterToolbar } from './RosterToolbar';
import { TabletToolbar, type ToolbarAction } from './TabletToolbar';
import { TabletExperienceControls } from './tabletExperience';
import { TabletDeviceFrame } from './TabletDeviceFrame';
import { TabletRail } from './TabletRail';
import { TabletResizer, type PanePresets } from './TabletResizer';
import { EmptyState, InstallRow, Row, WorkspaceScope } from './TabletPieces';
import { Chip as MobileChip } from '../ux/uxShared';
import { FactsGrid, GroupHeader, GroupToggle, RosterFilterBar, StatusTile } from './TabletPages';
import type { Job } from '../workspace/Jobs';
import { editorShortcuts, keyLabel } from './tabletKeys';
import { TabletWorkbench } from './TabletWorkbench';
import { StateChip } from '../workspace/StateChip';
import { StarButton, StarredHeadingContent } from '../workspace/Stars';
import './tablet-editor.css';
import './tablet-stars.css';
import { LimitAddButton, QuotaChip } from '../workspace/CatalogueLimit';
import { SourceStatusAction } from '../ux/SourceJobs';
import { TabletPrefsContext, makeTabletEnv, TabletEnvContext } from './tabletEnv';
import { NextChoice } from './TabletEditor';
import { useNextLook } from '../../look';
import { defaultDeviceId, defaultInput, defaultTextScale, tabletDevices, widthClassLabel, widthClassOf, type TabletDeviceId, type TabletInput, type TextScale } from './tabletDevices';
import './tablet.css';

const demoJob = (status: Job['status'], progress: number): Job => ({ id: 'demo', kind: 'install', sourceId: 'demo', name: 'Example System Three', size: '22.4 MB', factions: [], chosen: [], status, steps: [{ label: 'Download', state: status === 'needs-you' ? 'needs-you' : 'active', progress }] });
const noop = () => {};

/** DEC-059 (R0-09, approved 2026-11-02): a build with no default collection. Home's first-run card and the collections part
 *  of Add game data, as static samples; live: the Preview states of Home (first run) and Sources › Add game data. */
function NoPresetDemo() {
  return <div className="tb-el-frames">
    <div className="tb-app ux-screen dark tb-el-card"><section className="tb-card" aria-label="Start with game data, no default collection">
      <span className="ux-result-label">Get started</span>
      <div className="tb-card-head"><h2 className="tb-card-title">Start with game data</h2><p className="tb-body tb-muted">Rosters are built from a game system's data. Install one; it stays available offline.</p></div>
      <p className="tb-note"><Info size={15} />{FIRST_RUN_NO_PRESET}</p>
      <Row selected={false} mark={<FolderOpen size={20} />} title="Install from a file or a link" sub="An archive, data files, a repository link or GitHub search" end={<ChevronRight size={17} />} onClick={noop} />
    </section></div>
    <div className="tb-app ux-screen dark tb-el-card"><div className="tb-detail-title"><span><h2>Add game data</h2><small>Install from a collection, a repository link, or GitHub search</small></span></div>
      <WorkspaceScope light={false}><div className="tb-flow"><NoPresetCollections /></div></WorkspaceScope></div>
  </div>;
}
const demoPane: PanePresets = { min: 240, max: 420, narrow: 248, initial: 300, wide: 400 };

/** The pane resizer between two sample panes; the touch one shows its press-and-hold menu. */
function ResizerDemo({ input, menu }: { input: TabletInput; menu?: boolean }) {
  const [width, setWidth] = useState(demoPane.initial);
  return <div className={`tb-app ux-screen dark tb-${input} tb-el-resizer`}><div className="tbe"><div className="tbe-panes" style={{ gridTemplateColumns: `${width}px minmax(0, 1fr)` }}>
    <TabletResizer side="left" width={width} presets={demoPane} label="Resize catalogue" pane="catalogue" input={input} onWidth={setWidth} onHide={noop} defaultMenu={menu} />
    <section className="tbe-pane tbe-catalogue pane"><header className="tbe-pane-head"><span><strong>Add units</strong><small>{width} px</small></span></header></section>
    <section className="tbe-pane"><header className="tbe-pane-head"><span><strong>Your force</strong><small>{input === 'touch' ? 'Tap the handle, drag it, or press and hold' : 'Drag, double-click, or focus it and use the arrows'}</small></span></header></section>
  </div></div></div>;
}

/** The compact validation control replaces the existing full-width validation banner; inspect every tone. */
function ValidationHeaderDemo({ tone, title, body }: { tone: string; title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return <div className="tb-app ux-screen dark tb-el-card tb-el-fill"><div className="tb-roster-detail-header">
    <div className="tb-roster-heading"><h2>The Ashen Expedition</h2><small>Frontier Coalition · Open Field</small></div>
    <strong className="tb-roster-total">770 <small>pts</small></strong>
    <div className="tb-validation-anchor"><StatusTile tone={tone} label={`${title}. ${body}`} expanded={open} onToggle={() => setOpen(!open)} />
      {open && <section className={`tb-validation-popover tb-note ${tone}`} aria-label="Roster validation details"><strong>{title}</strong><span>{body}</span></section>}
    </div>
  </div></div>;
}

function RosterSearchDemo({ open = false }: { open?: boolean }) {
  const [query, setQuery] = useState(open ? 'Patrol' : '');
  return <div className="tb-app ux-screen dark tb-el-card tb-el-fill" data-system="ios"><RosterToolbar query={query} onQueryChange={setQuery} input="pointer"
    actions={[{ id: 'import', label: 'Import roster', caption: 'Import', icon: FileUp, hint: 'Import a roster from a file', onClick: noop }]} /></div>;
}

/** DEC-050 toolbar actions: Sources' row at a given width; narrow rows move the lower-priority actions into More. */
function ToolbarActionsDemo({ width, system, input = 'touch', text }: { width: number; system: 'ios' | 'android'; input?: TabletInput; text?: 200 }) {
  const [selecting, setSelecting] = useState(false);
  const actions: ToolbarAction[] = [
    { id: 'select', label: selecting ? 'Done selecting' : 'Select game data', caption: selecting ? 'Done' : 'Select', icon: CheckSquare, pressed: selecting, priority: 2, hint: 'Select several game systems to update or remove them together', onClick: () => setSelecting(!selecting) },
    { id: 'file', label: 'Install from a file', caption: 'From a file', icon: FolderOpen, priority: 1, hint: 'Install game data from an archive, data files or a folder', onClick: noop },
    { id: 'add', label: 'Add game data', caption: 'Add game data', icon: Plus, prominent: true, hint: 'Install from a collection, a repository link or GitHub search', onClick: noop },
  ];
  return <div className={`tb-app ux-screen dark tb-el-card tb-${input}`} data-system={system} data-text={text} style={{ width, boxSizing: 'border-box', ...(text ? { zoom: 2 } : {}) }}>
    <div style={{ width: '100%', minWidth: 0 }}><TabletToolbar title="Sources" input={input} actions={actions} search={<label className="ux-search tb-search"><Search size={18} aria-hidden="true" /><input type="search" aria-label="Find installed game data" placeholder="Find game data…" /></label>} /></div>
  </div>;
}

/** The Elements view of the Tablet library: the rail, the device frames, the input switch and two framed compositions. */
export function TabletElements() {
  const [deviceId, setDeviceId] = useState<TabletDeviceId>(defaultDeviceId);
  const [input, setInput] = useState<TabletInput>(defaultInput);
  const [textScale, setTextScale] = useState<TextScale>(defaultTextScale);
  const prefs = useMemo(() => ({ deviceId, input, textScale, setDeviceId, setInput, setTextScale }), [deviceId, input, textScale]);
  // The proposed look (src/look.ts): its new pieces show here only while it is on, so the approved Elements view stays as it was.
  const next = useNextLook();
  const [page, setPage] = useState<'home' | 'rosters' | 'tools'>('rosters');
  const railIn = (mode: TabletInput, device: 'ipad-portrait' | 'android') => <div className={`tb-app ux-screen ux-size-regular dark ${device === 'android' ? 'tb-expanded' : 'tb-medium'}`} data-system={device === 'android' ? 'android' : 'ios'} style={{ height: 'auto', flex: 'none', background: 'var(--ux-bg)', borderRadius: 18, overflow: 'visible', width: 'max-content' }}>
    <TabletEnvContext.Provider value={makeTabletEnv(device, mode)}><div style={{ height: 620, display: 'flex' }}><TabletRail page={page} input={mode} system={device === 'android' ? 'android' : 'ios'} onPage={p => setPage(p as typeof page)} onNewRoster={() => {}} /></div></TabletEnvContext.Provider>
  </div>;
  return <TabletPrefsContext.Provider value={prefs}>
    <div className="tb-elements">
      <h1>Tablet · Elements (Tablet 00)</h1>
      <p>The tablet takes the desktop structure (a rail with pages and panes) and the mobile look (mobile type sizes, targets of 44 px and more, the shared --ux-* tokens and colour schemes). Device, input mode, theme, colour scheme and Ambient are gallery controls.</p>
      <h2>Design library navigation</h2>
      <LibrarySwitch current="tablet" label="Design library examples" />
      <h2>Tablet rail · icon-only, 68 px · iPad Touch and Pointer, Android Touch (press and hold shows the hint naming the destination; with a pointer, hover shows the title)</h2>
      <div className="tb-el-row">{railIn('touch', 'ipad-portrait')}{railIn('pointer', 'ipad-portrait')}{railIn('touch', 'android')}
        <div className="tb-el-note"><strong>Hint bubble</strong><span className="tb-hint-bubble static">Rosters: find, open and manage your rosters</span><small>DEC-050: New roster is the top rail item on iPad and Android, an icon button with an accent fill (it replaces the iPad toolbar control and the Android FAB). Then Home, Rosters, Lookup, Tools, Library; Sources and Settings pinned to the bottom. 2026-11-01: the rail is icon-only on iPad and Android at every width and text size (68 px, as on desktop); there are no captions, and each destination's name is its accessible name and its hint. ⌘N / Ctrl+N remains available.</small></div>
      </div>
      <h2>Home without a title row (DEC-050) · iPad and Android, New roster on the rail</h2>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-home" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-home" /></TabletDeviceFrame></div>
      <h2>Home widgets (TFB-001, TFB-002) · four most used game systems with More, fixed widgets that scroll inside · iPad landscape and portrait, Android</h2>
      <p>Game data lists at most four game systems, most used first (most rosters, then the latest roster activity, then name); More (N) opens Sources with the rest. The widgets keep their places: Game data and Recent rosters take the spare height and scroll their own content, summary cards keep their height. Below 520 px of page, and in compact windows, the page scrolls as a whole.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-home-many-systems" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-home-many-systems" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-home-many-systems" /></TabletDeviceFrame></div>
      <h2>Sources top row and panes (DEC-050, TFB-008) · search, then Select, Install from a file and Add game data; shared pane rows with the compact status action (DEC-054); count and offline note in the list foot; pane tops aligned</h2>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-sources" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-sources" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-sources" /></TabletDeviceFrame></div>
      <h2>Compact source status (DEC-054, R0-08) · icon action instead of the text chip, visible at every pane width</h2>
      <p>Sources rows trail a 44 px icon action: download arrow (Update available; pressing it updates, accessible name "Update Open Field to v1.5"), progress ring with the percent (updating, installing), hand (choose factions), warning triangle (needs review), octagon (failed). Up to date shows nothing. Press and hold (touch) or hover and focus (pointer) shows the caption in the hint bubble; the sub-line names the new version (v1.4 → v1.5). The rule that hid row status in panes under 300 px is gone: in a pane of 300 px or less a row's trailing text (Rosters' points and status chips) moves to its own line under the title.</p>
      <div className="tb-el-row"><div className="tb-app ux-screen dark tb-el-card tb-touch"><div className="ux-src-status-demo">
        <span><SourceStatusAction status="update" name="Open Field" next="v1.5" captionShown /><small>Update · caption shown</small></span>
        <span><SourceStatusAction status="updating" name="Open Field" percent={46} /><small>Updating</small></span>
        <span><SourceStatusAction status="needs-you" name="Example System Three" /><small>Choose factions</small></span>
        <span><SourceStatusAction status="review" name="Example System Two" /><small>Needs review</small></span>
        <span><SourceStatusAction status="failed" name="Example System Five" /><small>Failed</small></span>
      </div></div></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="split" textScale={150}><TabletWorkbench workflowScreen="tablet-sources" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android" textScale={150}><TabletWorkbench workflowScreen="tablet-rosters" /></TabletDeviceFrame></div>
      <h2>Narrow pane (300 px or less) · Sources and Rosters rows keep their status (DEC-054, R0-08)</h2>
      <p>The same shared pane rows in a 280 px pane, touch and pointer: Sources keeps the compact status action at the row end (outside the row button); Rosters' status chip moves to its own line under the title instead of being hidden. A row's bold points figure is kept as well (see the next group).</p>
      <div className="tb-el-row">{(['dark', 'light'] as const).map(theme => <div key={theme} className={`tb-app ux-screen ${theme} tb-el-card ${theme === 'dark' ? 'tb-touch' : 'tb-pointer'}`} style={{ width: 280 }}><div className="tb-pane" style={{ width: '100%' }}><div className="tb-list">
        <Row selected mark="OF" title="Open Field" sub="example/open-field · v1.4 → v1.5 · 14.2 MB" action={<SourceStatusAction status="update" name="Open Field" next="v1.5" />} onClick={noop} />
        <Row selected={false} mark="ES" title="Example System Two" sub="example/system-two · v3.0.2 · 38.6 MB" action={<SourceStatusAction status="review" name="Example System Two" />} onClick={noop} />
        <Row selected={false} mark="AE" title="The Ashen Expedition" sub="Frontier Coalition · Example System One" end={<><b>770 pts</b><MobileChip tone="error">2 errors</MobileChip></>} onClick={noop} />
      </div></div></div>)}</div>
      <h2>Narrow pane rows (400 px or less) · points on their own line (approved 2026-11-01, R0 observation O3)</h2>
      <p>Approved by the user on 2026-11-01. A row's bold points figure is no longer omitted in panes of 400 px or less: the points and the status chip share one line under the title, left-aligned with the title as the rows already do at 300 px or less, so nothing a user needs is hidden (400 px, centre column 360 px, right column 280 px). Wide panes are unchanged. The earlier rule that hid the figure at 400 px or less is gone (tablet.css).</p>
      <div className="tb-el-row">{([['400 px', 400], ['360 px', 360], ['280 px', 280]] as const).map(([label, width]) => <div key={label}><small>{label}</small><div className="tb-app ux-screen light tb-el-card tb-touch" style={{ width }}><div className="tb-pane" style={{ width: '100%' }}><div className="tb-list">
        <Row selected mark="AE" title="The Ashen Expedition" sub="Frontier Coalition · Example System One" end={<><b>770 pts</b><MobileChip tone="error">2 errors</MobileChip></>} onClick={noop} />
        <Row selected={false} mark="NW" title="Northern Watch" sub="Frontier Coalition · Open Field" end={<b>1,500 pts</b>} onClick={noop} />
        <Row selected={false} mark="OF" title="Operation First Light with a very long roster name" sub="Free Cities · Open Field" end={<><b>985 pts</b><MobileChip tone="warning">1 warning</MobileChip></>} onClick={noop} />
      </div></div></div></div>)}</div>
      <h2>Toolbar Actions · iOS Liquid Glass and Android icon buttons</h2>
      <p>Rosters and Sources share 48 px icon buttons with full accessible names and hover or long-press hints. iOS uses Liquid Glass, with a solid fallback for Reduce transparency; Android uses plain icon buttons. Add game data uses an accent fill and Select has a pressed state. No captions below action icons. Search fills the remaining row; lower-priority actions move into More when space is short. New roster stays at the top of the rail as an icon button; navigation destinations keep their labels.</p>
      <div className="tb-el-stack"><ToolbarActionsDemo width={860} system="ios" /><ToolbarActionsDemo width={860} system="android" input="pointer" /><ToolbarActionsDemo width={500} system="ios" /><ToolbarActionsDemo width={380} system="android" /><ToolbarActionsDemo width={300} system="ios" text={200} /></div>
      <h2>Contextual roster actions and platform materials · Liquid Glass and M3 Expressive</h2>
      <p>Continue and Open stay with their roster. Rename, Duplicate, Export and Delete form a contextual toolbar for the selected roster. Reading surfaces remain solid.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-rosters" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-rosters" /></TabletDeviceFrame></div>
      <h2>Motion and materials · accessibility variants</h2>
      <p>Toolbar press feedback, Android shape changes and sheet springs respond to interaction. These switches apply to all tablet previews, including standalone pages; device accessibility settings also apply.</p>
      <TabletExperienceControls />
      <h2>Device frames · same scale</h2>
      <div className="tb-el-devices">{tabletDevices.map(d => <figure key={d.id}><i style={{ width: d.width / 8, height: d.height / 8 }} className={d.system} /><figcaption><strong>{d.label}</strong>{d.width} × {d.height} · {widthClassLabel[widthClassOf(d.width)]}</figcaption></figure>)}</div>
      <h2>Device, input mode and text size switches</h2>
      <div className="tb-el-controls"><TabletControls /></div>
      <h2>Coming soon placeholders · Tools and Library</h2>
      <div className="tb-el-row"><div className="tb-app ux-screen dark tb-el-card"><ComingSoonCard icon={Hammer} title="Tools" description="Roster analytics, comparison, a game tracker and a dice simulator." planned="Planned for a later release" covers="" /></div><div className="tb-app ux-screen dark tb-el-card"><ComingSoonCard icon={BookMarked} title="Library" description="Units and detachments you saved, ready to reuse." planned="Planned for an early update" covers="" /></div></div>
      <h2>Roster editor · Expanded (catalogue, force tree, unit details), Medium (tree and details, catalogue slide-over) and split view</h2>
      <p>Editor header (Back, roster switcher, undo and redo, points button, More), the points line, resizable panes with a touch grab handle, mobile tree cards and unit rows (press and hold or right-click for the row menu), the mobile unit detail as a pane, the summary popover with issues and Show. Screens: Roster editor, Summary with issues, Add unit.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-issues" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-editor-add" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-editor" /></TabletDeviceFrame></div>
      <h2>Unit catalogue (DEC-050) · role pills in one scrolling row, icon-only state chips, focus on opening (Settings › Advanced)</h2>
      <p>Role pills never wrap: one row that scrolls sideways, bleeding to the pane edges, with an edge fade on the side that has more pills; the active pill scrolls into view (a role opened from a section's Add unit row). A row that is not simply available carries an icon chip in its tone instead of a text chip: Adds over limit (warning triangle, warning tone; the reason line, e.g. Slot full, in the warning tone too) or Unavailable (no-entry sign, error tone; the row cannot add, the chip still answers; DEC-054: never dimmed, and a reached limit uses the quota chip below). Pressing the chip (touch) shows its caption in the hint bubble for a few seconds, a second press hides it; with a pointer hovering or focusing it shows the caption; the chip's accessible name is the caption and the row's Add button names the state and reason. At 150 % in the Android tablet's 300 px pane the chip keeps its size (the text chip truncated there, TB-12). Add unit opens the catalogue for browsing; with Settings › Advanced › Focus search when opening the catalogue on, it opens with the search focused (⌘F / Ctrl + F always focuses it).</p>
      <div className="tb-el-row"><div className="tb-app ux-screen dark tb-el-card tb-touch tb-el-chips"><strong>Touch · pressed</strong><span className="tb-el-chip-line"><StateChip tone="warn" caption="Adds over limit" input="touch" open /></span><span className="tb-el-chip-line"><StateChip tone="err" caption="Unavailable" input="touch" /></span></div>
        <div className="tb-app ux-screen light tb-el-card tb-pointer tb-el-chips"><strong>Pointer · hover or focus</strong><span className="tb-el-chip-line"><StateChip tone="warn" caption="Adds over limit" input="pointer" /></span><span className="tb-el-chip-line"><StateChip tone="err" caption="Unavailable" input="pointer" open /></span></div></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-add-roles" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-editor-add-roles" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-chip-caption" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android" textScale={150}><TabletWorkbench workflowScreen="tablet-editor-chips-text-150" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-add-focus" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-settings-advanced" /></TabletDeviceFrame></div>
      <h2>Limit reached (DEC-054, R0-08) · quota chip 1 / 1 and an unavailable Add; name and price stay fully readable</h2>
      <p>Unavailable catalogue entries are no longer dimmed: name and price keep full contrast (4.5:1 or more in light and dark). A reached limit shows a quota chip (selected / maximum, accessible "1 selected, maximum 1") on the line under the name, so the name keeps the row's width, and an unavailable Add button: a dashed outline with a muted plus, aria-disabled but still focusable and pressable. Pressing it, or the row, shows "Limit reached: 1 of 1 selected. Remove the existing unit before adding another." in the hint bubble under the button for a few seconds; with a pointer, hover and focus show it. Other reasons keep the icon state chip above, also without dimming.</p>
      <div className="tb-el-row">{(['dark', 'light'] as const).map(theme => <div key={theme} className={`tb-app ux-screen ${theme} tb-el-card tb-touch tb-el-chips`} style={{ paddingBottom: 96 }}>
        <strong>{theme === 'dark' ? 'Touch · pressed, reason shown' : 'Pointer · rest'}</strong>
        <span className="tb-el-chip-line"><QuotaChip selected={1} max={1} /><LimitAddButton name="Force Commander" points={90} selected={1} max={1} input={theme === 'dark' ? 'touch' : 'pointer'} open={theme === 'dark'} /></span>
      </div>)}</div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-limit-caption" /></TabletDeviceFrame></div>
      {next && <>
        <h2>Proposed look (not approved) · open option rows, the section’s round Add, the catalogue’s reason line</h2>
        <p>No pill or tile on a catalogue entry: a reached limit reads "1 / 1 · Limit reached" and a full slot "Slot full · adds over limit" under the name, in the warning tone, with a muted Add (a press still explains). The unit pane's options are rows without a box: the control, the name and one line under it, the cost on the right; the selected one in the accent. Each roster section heading carries a round tonal Add.</p>
        <div className="tb-el-row">{(['dark', 'light'] as const).map(theme => <div key={theme} className={`tb-app ux-screen ${theme} tb-el-card ${theme === 'dark' ? 'tb-touch' : 'tb-pointer'}`}><div className="tbe" style={{ background: 'transparent' }}><div className="tbe-nx-detail" role="radiogroup" aria-label="Primary weapon (sample)">
          <NextChoice role="radio" name="Service rifle" cost="Included" on onChange={noop} />
          <NextChoice role="radio" name="Scout carbine" cost="Included" on={false} onChange={noop} />
          <NextChoice role="checkbox" name="Field standard" sub="Carry the detachment's colours" cost="+10 pts" on onChange={noop} />
          <div className="tbe-sec-head"><span className="ux-tree-section"><span /><strong>Core</strong><small>3 / 2+</small></span><button type="button" className="tbe-sec-add" aria-label="Add core unit (sample)"><Plus size={18} /></button></div>
          <div className="tbe-cat-row tbe-nx-cat-row warn"><span className="tbe-cat-add"><span><strong>Support Battery</strong><small className="reason">Slot full · adds over limit</small></span></span><b>180<small> pts</small></b><span className="tbe-cat-plus muted" aria-hidden="true"><Plus size={18} /></span></div>
        </div></div></div>)}</div>
      </>}
      <h2>Settings › Rosters · Reopen roster on launch (DEC-056) · iPad and Android</h2>
      <p>One switch directly above Remember option sections, off by default: "Reopen roster on launch", "The roster open when you quit opens again." It replaces the earlier row that defaulted to on. A new launch never restores a deep Settings, Account or Sources page. The phone shows the same row; the desktop counterpart is Reopen tabs on launch.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-settings-rosters" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-settings-rosters" /></TabletDeviceFrame></div>
      <h2>Settings › Advanced · plain rows (DEC-054) · Focus search when opening the catalogue, Enable Separate all</h2>
      <p>Both preferences are off by default and sit as plain rows in the detail pane: no enclosing card (the other sections keep their boxed groups), a hairline between rows, the shared switch. Enable Separate all is a user opt-in: on, a unit with several models also offers Separate all, which gives every model its own options in one step (the models stay in the same unit); off, only Separate 1.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-settings-advanced" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-settings-advanced" /></TabletDeviceFrame></div>
      <h2>Settings › About › Developer options and Debug (F1b · DEC-063 · approved 2026-11-04) · iPad and Android</h2>
      <p>About lists Developer options after the 7-tap unlock on Version and, in debug builds only, Debug below it (no tag: the row exists only in debug builds); each opens in the detail pane with Back to About. Developer options hold Show hidden entries (off by default) and Hide developer options; Debug holds the internal tools that were on the Developer page: Performance overlay with the per-screen table, Feature flags with Reset to defaults, Imports at once and Install measurements, Component gallery, Engine bench and the engine worker. Settings search finds Show hidden entries only while Developer options are unlocked and never lists Debug rows.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-settings-developer" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-settings-debug" /></TabletDeviceFrame></div>
      <h2>Pane resizer · grab handle with preset widths (Narrow, Default, Wide)</h2>
      <p>Touch: tap the handle to cycle the presets, drag and it snaps to the nearest one, press and hold for the menu (presets and Hide). Pointer: free drag with the presets pulling within 12 px, double-click resets, hover shows the grip and a title. Keyboard: arrows (Shift for 48 px), Home and End, Enter cycles. The width and preset show while it moves.</p>
      <div className="tb-el-row"><ResizerDemo input="touch" menu /><ResizerDemo input="pointer" /></div>
      <h2>Larger text and display zoom (UX-025) · Text size 100%, 150%, 200%</h2>
      <p>The Text size switch (gallery, and <code>text=</code> on a standalone link) scales the tablet type and controls. The layout gets the smaller logical width (device width ÷ scale) and collapses by width class instead of clipping: Expanded → Medium (two panes) → single pane; the rail is icon-only at every width (names stay as accessible names and hints) and scrolls when taller than the window; under 440 the editor header keeps Back, the roster mark, the points and More (undo and redo move into More). Screens: Roster editor · Text 200%, Rosters · Text 200%.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-text-200" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-rosters-text-200" /></TabletDeviceFrame></div>
      <h2>Roster top row (DEC-050, supersedes TFB-011's search toggle) · search always shown, then Import</h2>
      <p>No title row: the search is always there and fills the row, Import trails it as an icon button; New roster lives on the rail. The query filters by roster name, faction and game system; Escape or the clear button empties it. System and grouping choices stay. The page heading is visually hidden.</p>
      <div className="tb-el-stack"><RosterSearchDemo /><RosterSearchDemo open /></div>
      <h2>Roster filters (TB-03) · game system chips, Group by game system toggle and the list section header</h2>
      <p>TFB-005: Group by game system is an icon-only toggle (layers icon, 44 px like the chips, accent fill while on, aria-pressed, the name as its accessible label and press-and-hold hint) fixed at the trailing end of the same row, after a small gap and outside the scroller: collapsed <code>[All][More] … [group]</code>, expanded <code>[All][scrolling middle][Less] [group]</code>. Grouping is not a filter, so collapsed More does not name it. The phone Lists screen uses the same row.</p>
      <p>TFB-003/004: search spans both panes. All stays fixed at the left, More / Less stays fixed at the right, and only the middle system and attention choices scroll. Less preserves the query; collapsed More names active filters. Both platforms follow the user's opened/closed references: compact adjacent All / More when collapsed, and connected shapes with rounded outer ends, softly squared middle choices and pill-shaped selections when expanded. There is no enclosing capsule or empty spacer. Counts, full accessible names and 44 px targets stay. Scroll the sample's middle section; All and Less do not move.</p>
      <div className="tb-el-row">{(['ios', 'android'] as const).map(platform => <div key={platform} className="tb-app ux-screen dark tb-el-card tb-el-stack">
        <strong>{platform === 'ios' ? 'iPad' : 'Android'} · fixed ends</strong>
        <RosterFilterBar platform={platform} all={<button type="button" className="tb-filter tb-filter-start" aria-pressed={false}>All 26</button>}
          controls={<><button type="button" className="tb-filter tb-filter-system active" aria-pressed={true}><Check size={16} /><span>Open Field</span>17</button><button type="button" className="tb-filter tb-filter-system" aria-pressed={false}><span>Example System With A Long Name</span>9</button><button type="button" className="tb-filter">Needs attention 4</button></>}
          disclosure={<button type="button" className="tb-filter tb-filter-end" aria-expanded={true}>Less</button>} group={<GroupToggle on={false} onChange={noop} />} />
        <RosterFilterBar platform={platform} all={<button type="button" className="tb-filter tb-filter-start active" aria-pressed={true}>All 26</button>}
          disclosure={<button type="button" className="tb-filter tb-filter-end" aria-expanded={false}>More</button>} group={<GroupToggle on={true} onChange={noop} />} />
        <div className="tb-list"><GroupHeader name="Open Field" count={17} /><GroupHeader name="Example System With A Long Name That Runs On" count={9} /></div>
      </div>)}</div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-rosters-system" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-rosters-grouped" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-rosters-grouped" /></TabletDeviceFrame></div>
      <h2>Roster structure (TFB-010) · approved for 1.0</h2>
      <p>User approved 2026-10-28; app implementation is the 1.0 CT-14 task. Filters and grouping remain a separate design question (D13). The 48 px indicator replaces the existing large validation banner. It represents the same Ready, roster errors and data-warning information, with only the appropriate status icon and tone. No count, text or chevron appears inside the control; issue counts and explanations remain in the accessible name and the popover. It is not a separate success tick. Tap it to read the existing validation title and explanation in a compact popover; no full-width validation row is reserved. The name, points and indicator stay together above two-column metadata. Row selection previews the roster; its separate trailing chevron enters the roster. Rename, Duplicate, Export and Delete form one action strip below the metadata.</p>
      <div className="tb-el-stack">
        <ValidationHeaderDemo tone="ok" title="Ready" body="All roster requirements met." />
        <ValidationHeaderDemo tone="err" title="2 items need attention" body="Roster requirements not met." />
        <ValidationHeaderDemo tone="warn" title="Game data changed" body="Some entries changed in the last update. Open to review them." />
      </div>
      <div className="tb-el-row" style={{ marginTop: 24 }}>{([420, 320] as const).map(width => <div key={width} className="tb-app ux-screen dark tb-el-card" style={{ width }}><div className="tb-el-stack tb-el-fill"><strong>{width === 420 ? 'Two columns' : 'Narrow card · one column'}</strong>
        <FactsGrid rows={[[ 'Game system', 'Example System With A Long Name That Wraps'], ['Units', 6], ['Last opened', '12 minutes ago'], ['Changed', 'Yesterday'], ['Created', '5 days ago']]} /></div></div>)}</div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-rosters-validation-error" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-rosters-validation-warning" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-rosters-status" /></TabletDeviceFrame></div>
      <h2>Lookup 1.0 · grouped results and detail pane (design session 2026-10-31)</h2>
      <p>The earlier Lookup page with the phone's grouping: system chips (All n, one per system with its count), four foldable sections with counts (Units open on top, folded sections below the open ones), and the phone's reference content in the detail pane, where links push onto the pane's own stack.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width"><TabletWorkbench workflowScreen="tablet-lookup-1-0" /></TabletDeviceFrame><TabletDeviceFrame fit="width"><TabletWorkbench workflowScreen="tablet-lookup-1-0-force" /></TabletDeviceFrame></div>
      <h2>Lookup 1.0 · detachment Layout (F2 sections 2–3, approved 2026-11-07) · key folded, key open in two columns, Base limit 0, tap detail</h2>
      <p>The phone's Layout in the detail pane: the key starts folded; open, it and the Base limit 0 list use two columns, filled column by column, once the pane is 560 pt or wider. Tapping a group shows its full name, symbol, letter and base limit, as on the phone.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-lookup-1-0-detachment-large" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-lookup-1-0-detachment-key-open" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-lookup-1-0-detachment-base-zero" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-lookup-1-0-detachment-tap" /></TabletDeviceFrame></div>
      <h2>Lookup 1.0 · lifecycle states (DEC-054, R0-03) · loading, failure and retry, reference unavailable, text 200 %</h2>
      <p>Loading and failure replace the result list while the search row and system chips stay (no counts until a search finishes); loading never reads as "no results", failure offers Retry. A saved reference whose source is no longer installed shows Reference unavailable in the detail pane, with no result selected, and never opens a same-name entry instead. At 200 % text the titles stop at two lines and Full name shows the whole name.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-lookup-1-0-loading" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-lookup-1-0-failed" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-lookup-1-0-unavailable" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-lookup-1-0-long-text-200" /></TabletDeviceFrame></div>
      <h2>Empty state card · first run, no rosters, no match</h2>
      <div className="tb-el-row"><div className="tb-app ux-screen dark tb-el-card"><EmptyState icon={Layers3} title="No rosters yet" text="Create a roster, or import one from a file."><button type="button" className="ux-primary tb-primary"><Plus size={17} />New roster</button><button type="button" className="ux-job-btn">Import a roster</button></EmptyState></div></div>
      <h2>Home and Sources progress · in-page controls, no global toolbar jobs button</h2>
      <p>Each installed source has its version, Update and Show progress. All jobs stays reachable in the data card after the first install, including completed jobs, failures, cancel and retry. Installs and updates run inline; requested details and Advanced installation faction choice use the existing job details and picker.</p>
      <h2>Install row · Install, installing, choose factions, update, installed (44 px actions; progress under the text)</h2>
      <div className="tb-el-row"><div className="tb-app ux-screen dark tb-el-card tb-el-stack">
        <InstallRow title="Example System Three" sub="Example game system · 6 factions · 22.4 MB" onInstall={noop} onJobs={noop} />
        <InstallRow title="Example System Three" sub="Example game system · 6 factions · 22.4 MB" live={demoJob('running', 40)} onInstall={noop} onJobs={noop} />
        <InstallRow title="Example System Three" sub="Waiting for you to choose factions" live={demoJob('needs-you', 0)} onInstall={noop} onJobs={noop} />
        <InstallRow title="Open Field" sub="Example game system · 3 factions · 14.2 MB" update onInstall={noop} onUpdate={noop} onJobs={noop} />
        <InstallRow title="Example Skirmish" sub="Example skirmish system · 2 factions · 2.3 MB" installed onInstall={noop} onShow={noop} onJobs={noop} />
      </div></div>
      <h2>Keyboard shortcut rows · read-only (hardware keyboard), iPad and Android notation</h2>
      <div className="tb-el-row">{(['ios', 'android'] as const).map(system => <div key={system} className="tb-app ux-screen dark tb-el-card"><div className="ux-src-group">{editorShortcuts.items.slice(0, 4).map(a => <div className="ux-src-kv tb-key-row" key={a.combo}><span>{a.label}</span><kbd className="tb-kbd">{keyLabel(a.combo, system)}</kbd></div>)}</div></div>)}</div>
      <h2>Shortcut overlay · iPad (hold ⌘) and Android (Ctrl + /)</h2>
      <p>Fixed shortcuts: ⌘N new roster, ⌘F find, ⌘1–5 the rail pages, ⌘, Settings, Esc closes a sheet, menu or popover; in the roster editor ⌘Z and ⇧⌘Z undo and redo, ⌘F finds a unit to add, ⌘E exports. On iPad the system overlay lists them while ⌘ is held; on Android Ctrl + / opens the same list. With a pointer, the hints of the rail, New roster, Undo and Redo name their shortcut. Screen: Roster editor · Keyboard shortcuts.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-shortcuts" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-editor-shortcuts" /></TabletDeviceFrame></div>
      <h2>Roster editor flows · several forces, read-only roster, export and import result (form sheets), add force at two widths</h2>
      <p>The form sheet is the tablet dialog: a centred sheet with Cancel, title and the primary action in its header and the mobile controls inside; in split view it fills the window. Several forces add a menu to each force card (add unit here, rename, remove), the Adding here chip and an Add force row. A read-only roster explains why, offers an editable copy and keeps edits off.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-forces" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-readonly" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-export" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-editor-import-result" /></TabletDeviceFrame></div>
      <h2>Export form sheet (F3 · approved 2026-11-06) · PDF · roster file · read-only roster</h2>
      <p>Four format rows: Text for sharing, Roster file, Print view (.html) and PDF (.pdf). Include (Rules, Profiles switches, both on) for Print view and PDF; Paper A4 | Letter for PDF. Print view and PDF show the paper preview, Text the monospace preview, the roster file a file panel (name · size and one line). Save file… sits under the preview for every format, with Copy text or Copy JSON beside it for Text and the roster file; Share stays in the header. A read-only roster lists Print view and PDF with the lock and “Needs the game data”.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-export-pdf" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-export-json" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-export-readonly" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-editor-export-pdf" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-editor-add-force" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-editor-add-force" /></TabletDeviceFrame></div>
      <h2>Rename a unit (R2-02 · F4b · approved 2026-11-07) · Rename pane action · Rename sheet · renamed row</h2>
      <p>The unit pane's actions are Rename, Duplicate and Remove; Rename (and Rename unit in the tree row's menu) opens the one-field Rename sheet, now for a roster, force or unit name. For a unit the field is prefilled with its name and selected, the count goes to 60 and the hint says “Empty restores “entry name”.”; Save stays off while the name is unchanged and Enter saves. An empty name clears the custom name. One Undo step; off while read-only. A renamed unit shows its own name in the pane and the tree row, with the entry name as a muted line under it (as renamed forces do).</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-renamed-unit" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-rename-unit" /></TabletDeviceFrame></div>
      <h2>Starred entries (R2-03 · F4c · approved 2026-11-08) · star button · Starred group · starred faction and forces</h2>
      <p>A star before the name on every catalogue row (pane and slide-over), on the New roster faction step and on Add force's force types. Outline (muted) = not starred; filled in the accent colour = starred, never the warning amber that means Slot full. Always visible: a 20 px icon in a 44 pt target; the star only stars, the rest of the row adds or chooses. Units get a Starred group above the role groups (accent heading, star glyph, count); starred rows are not repeated and keep their state. A role chip filters Starred too (Core chosen: only starred Core units); search keeps Starred first. Factions and forces: starred first, a divider, then the rest. Stars are kept per faction (unit and force stars per catalogue, faction stars per game system), on the device: they survive a restart, are not in the roster file and are not an Undo step. No stars: the lists are unchanged (no empty group, no hint); stale stars are ignored silently and kept; read-only rosters have no catalogue. Labels “Star {"{name}"}” / “Unstar {"{name}"}”.</p>
      <div className="tb-el-row"><div className="tb-app ux-screen dark tb-el-card tb-el-stack">
        <div className="tbe tbe-catalogue" style={{ display: 'grid', gap: 4 }}><div className="tbe-cat-list">
          <section><h4 className="ws-starred-head"><StarredHeadingContent count={2} /></h4>
            <div className="tbe-cat-row with-star"><StarButton name="Line Infantry" on /><button type="button" className="tbe-cat-add"><span><strong>Line Infantry</strong><small>10 models · Service rifle</small></span></button><span aria-hidden="true" /><b aria-hidden="true">120<small> pts</small></b><span className="tbe-cat-plus" aria-hidden="true"><Plus size={18} /></span></div>
            <div className="tbe-cat-row with-star"><StarButton name="Field Marshal" on={false} /><button type="button" className="tbe-cat-add"><span><strong>Field Marshal</strong><small>1 model · Service rifle</small></span></button><span aria-hidden="true" /><b aria-hidden="true">115<small> pts</small></b><span className="tbe-cat-plus" aria-hidden="true"><Plus size={18} /></span></div>
          </section>
        </div></div>
      </div></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-stars-catalogue" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-stars-catalogue-role" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-stars-add-force" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-stars-faction" /></TabletDeviceFrame></div>
      <h2>Collection links (R2-06 · F4e · approved 2026-11-09) · Need a link? · repository results · Search for data · Step-by-step guide</h2>
      <p>The Add collection form sheet: a repository link is looked up for its collection file (one, several, game data, nothing found). Need a link? pushes Search for data or the guide inside the sheet; the header's Cancel becomes ‹ Back, and the field keeps its text.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-links-add-idle" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-links-guide" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-links-search-data" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-links-repo-found" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-links-repo-several" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-links-data-repo" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-links-nothing-found" /></TabletDeviceFrame></div>
      <h2>Dialogs and sheets · guided creation, faction picker, add collection, appearance import, move unit, confirm</h2>
      <p>Every dialog is a form sheet that covers the whole window, rail included. Guided creation has a step list beside the content (a row of step marks in a narrower window); the faction picker appears only with Advanced installation on and opens by itself when an install pauses; add collection, appearance imports, move unit and the confirm sheet use the same header (Cancel, title, one primary action) and the mobile controls inside. In split view every sheet fills the window, and a focused field scrolls above the keyboard.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-create" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-create-review" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-create" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-sources-choose-factions" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-sources-add-collection" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-sources-add-collection" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-settings-appearance-import" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-move-unit" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-confirm-delete" /></TabletDeviceFrame></div>
      <h2>No default collection (DEC-059 · R0-09) · reinstall a kept version (DEC-060) · approved 2026-11-02</h2>
      <p>A build with no default collection fetches nothing. Home's first-run card replaces the hidden-collection note with “{FIRST_RUN_NO_PRESET}” (its way forward doesn't change). Add game data has no default collection and no Show the default collection row; Your collections is always there and, while the user has none, starts with the note. The repository link and Search GitHub don't change. Live: Preview states on Home (first run) and Sources › Add game data.</p>
      <NoPresetDemo />
      <p>A GitHub version already kept on this device with every faction installed pauses the install on the reinstall offer (Advanced installation on or off) instead of an empty faction picker: a form sheet with Cancel (cancels the install), “{'{name}'} · {'{version}'}” and Reinstall this version. It asks first in the app dialog; confirmed, that version is in use and the one in use before stays kept (the jobs popover shows the done state); a failure shows the error and the previous version stays in use. Screen: Sources · Reinstall a kept version; Sources › Add game data › Preview states › Kept version · reinstall fails.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-sources-reinstall" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-sources-reinstall" /></TabletDeviceFrame></div>
      <h2>Framed compositions · the selected device and input mode</h2>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width"><TabletWorkbench workflowScreen="tablet-rosters" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-lookup" /></TabletDeviceFrame><TabletDeviceFrame fit="width"><TabletWorkbench workflowScreen="tablet-sources-choose-factions" /></TabletDeviceFrame></div>
    </div>
  </TabletPrefsContext.Provider>;
}
