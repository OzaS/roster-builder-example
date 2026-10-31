import { useMemo, useState } from 'react';
import { BookMarked, Check, CheckSquare, FileUp, FolderOpen, Hammer, Layers3, Plus, Search } from 'lucide-react';
import { LibrarySwitch } from '../../gallery/LibrarySwitch';
import { ComingSoonCard } from '../ux/AppExtras';
import { TabletControls } from './TabletControls';
import { RosterToolbar } from './RosterToolbar';
import { TabletToolbar, type ToolbarAction } from './TabletToolbar';
import { TabletExperienceControls } from './tabletExperience';
import { TabletDeviceFrame } from './TabletDeviceFrame';
import { TabletRail } from './TabletRail';
import { TabletResizer, type PanePresets } from './TabletResizer';
import { EmptyState, InstallRow } from './TabletPieces';
import { FactsGrid, GroupHeader, GroupToggle, RosterFilterBar, StatusTile } from './TabletPages';
import type { Job } from '../workspace/Jobs';
import { editorShortcuts, keyLabel } from './tabletKeys';
import { TabletWorkbench } from './TabletWorkbench';
import { StateChip } from '../workspace/StateChip';
import { TabletPrefsContext, makeTabletEnv, TabletEnvContext } from './tabletEnv';
import { defaultDeviceId, defaultInput, defaultTextScale, tabletDevices, widthClassLabel, widthClassOf, type TabletDeviceId, type TabletInput, type TextScale } from './tabletDevices';
import './tablet.css';

const demoJob = (status: Job['status'], progress: number): Job => ({ id: 'demo', kind: 'install', sourceId: 'demo', name: 'Example System Three', size: '22.4 MB', factions: [], chosen: [], status, steps: [{ label: 'Download', state: status === 'needs-you' ? 'needs-you' : 'active', progress }] });
const noop = () => {};
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
      <h2>Tablet rail · iPad Touch and Pointer, Android Touch (press and hold shows the hint; with a pointer, hover shows the title)</h2>
      <div className="tb-el-row">{railIn('touch', 'ipad-portrait')}{railIn('pointer', 'ipad-portrait')}{railIn('touch', 'android')}
        <div className="tb-el-note"><strong>Hint bubble</strong><span className="tb-hint-bubble static">Rosters: find, open and manage your rosters</span><small>DEC-050: New roster is the top rail item on iPad and Android, icon over caption with a filled accent pill (it replaces the iPad toolbar control and the Android FAB). Then Home, Rosters, Lookup, Tools, Library; Sources and Settings pinned to the bottom. ⌘N / Ctrl+N remains available.</small></div>
      </div>
      <h2>Home without a title row (DEC-050) · iPad and Android, New roster on the rail</h2>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-home" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-home" /></TabletDeviceFrame></div>
      <h2>Home widgets (TFB-001, TFB-002) · four most used game systems with More, fixed widgets that scroll inside · iPad landscape and portrait, Android</h2>
      <p>Game data lists at most four game systems, most used first (most rosters, then the latest roster activity, then name); More (N) opens Sources with the rest. The widgets keep their places: Game data and Recent rosters take the spare height and scroll their own content, summary cards keep their height. Below 520 px of page, and in compact windows, the page scrolls as a whole.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-home-many-systems" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-home-many-systems" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-home-many-systems" /></TabletDeviceFrame></div>
      <h2>Sources top row and panes (DEC-050, TFB-008) · search, then Select, Install from a file and Add game data; shared pane rows; count and offline note in the list foot; pane tops aligned</h2>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-sources" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android"><TabletWorkbench workflowScreen="tablet-sources" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-sources" /></TabletDeviceFrame></div>
      <h2>Toolbar actions (DEC-050) · icon over caption, as the rail items · iPad and Android</h2>
      <p>One component for the top-row actions of Rosters and Sources: an icon inside a 56 × 32 pill with a short caption under it, 64 px tall on touch (56 with a pointer), at least 64 px wide; the accessible name is the full label and every action has a hint. Prominent: filled accent pill (Add game data). Toggles (Select) show the rail's active indicator. The same on iPad and Android; on iPad the resting pill takes the glass material, solid with Reduce transparency. When the row cannot fit, the search shrinks to 200 px first; then lower-priority actions move into More (⋯), whose menu lists them with their full names. At larger text the captions stay, their scale capped at 150 % like the rail labels.</p>
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
      <p>Role pills never wrap: one row that scrolls sideways, bleeding to the pane edges, with an edge fade on the side that has more pills; the active pill scrolls into view (a role opened from a section's Add unit row). A row that is not simply available carries an icon chip in its tone instead of a text chip: Adds over limit (warning triangle, warning tone; the reason line, e.g. Slot full, in the warning tone too) or Unavailable (no-entry sign, error tone; the row cannot add, the chip still answers). Pressing the chip (touch) shows its caption in the hint bubble for a few seconds, a second press hides it; with a pointer hovering or focusing it shows the caption; the chip's accessible name is the caption and the row's Add button names the state and reason. At 150 % in the Android tablet's 300 px pane the chip keeps its size (the text chip truncated there, TB-12). Add unit opens the catalogue for browsing; with Settings › Advanced › Focus search when opening the catalogue on, it opens with the search focused (⌘F / Ctrl + F always focuses it).</p>
      <div className="tb-el-row"><div className="tb-app ux-screen dark tb-el-card tb-touch tb-el-chips"><strong>Touch · pressed</strong><span className="tb-el-chip-line"><StateChip tone="warn" caption="Adds over limit" input="touch" open /></span><span className="tb-el-chip-line"><StateChip tone="err" caption="Unavailable" input="touch" /></span></div>
        <div className="tb-app ux-screen light tb-el-card tb-pointer tb-el-chips"><strong>Pointer · hover or focus</strong><span className="tb-el-chip-line"><StateChip tone="warn" caption="Adds over limit" input="pointer" /></span><span className="tb-el-chip-line"><StateChip tone="err" caption="Unavailable" input="pointer" open /></span></div></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-add-roles" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-editor-add-roles" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-chip-caption" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="android" textScale={150}><TabletWorkbench workflowScreen="tablet-editor-chips-text-150" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-add-focus" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-settings-advanced" /></TabletDeviceFrame></div>
      <h2>Pane resizer · grab handle with preset widths (Narrow, Default, Wide)</h2>
      <p>Touch: tap the handle to cycle the presets, drag and it snaps to the nearest one, press and hold for the menu (presets and Hide). Pointer: free drag with the presets pulling within 12 px, double-click resets, hover shows the grip and a title. Keyboard: arrows (Shift for 48 px), Home and End, Enter cycles. The width and preset show while it moves.</p>
      <div className="tb-el-row"><ResizerDemo input="touch" menu /><ResizerDemo input="pointer" /></div>
      <h2>Larger text and display zoom (UX-025) · Text size 100%, 150%, 200%</h2>
      <p>The Text size switch (gallery, and <code>text=</code> on a standalone link) scales the tablet type and controls. The layout gets the smaller logical width (device width ÷ scale) and collapses by width class instead of clipping: Expanded → Medium (two panes) → single pane; under 600 the rail drops its labels (they stay the accessible names and hints) and scrolls when taller than the window; under 440 the editor header keeps Back, the roster mark, the points and More (undo and redo move into More). Screens: Roster editor · Text 200%, Rosters · Text 200%.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-text-200" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-rosters-text-200" /></TabletDeviceFrame></div>
      <h2>Roster top row (DEC-050, supersedes TFB-011's search toggle) · search always shown, then Import</h2>
      <p>No title row: the search is always there and fills the row, Import trails it as an icon-over-caption action; New roster lives on the rail. The query filters by roster name, faction and game system; Escape or the clear button empties it. System and grouping choices stay. The page heading is visually hidden.</p>
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
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-editor-add-force" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-editor-add-force" /></TabletDeviceFrame></div>
      <h2>Dialogs and sheets · guided creation, faction picker, add collection, appearance import, move unit, confirm</h2>
      <p>Every dialog is a form sheet that covers the whole window, rail included. Guided creation has a step list beside the content (a row of step marks in a narrower window); the faction picker appears only with Advanced installation on and opens by itself when an install pauses; add collection, appearance imports, move unit and the confirm sheet use the same header (Cancel, title, one primary action) and the mobile controls inside. In split view every sheet fills the window, and a focused field scrolls above the keyboard.</p>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-create" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-create-review" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-create" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-sources-choose-factions" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-sources-add-collection" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-sources-add-collection" /></TabletDeviceFrame></div>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width" device="ipad-portrait"><TabletWorkbench workflowScreen="tablet-settings-appearance-import" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="ipad-landscape"><TabletWorkbench workflowScreen="tablet-editor-move-unit" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-confirm-delete" /></TabletDeviceFrame></div>
      <h2>Framed compositions · the selected device and input mode</h2>
      <div className="tb-el-frames"><TabletDeviceFrame fit="width"><TabletWorkbench workflowScreen="tablet-rosters" /></TabletDeviceFrame><TabletDeviceFrame fit="width" device="split"><TabletWorkbench workflowScreen="tablet-lookup" /></TabletDeviceFrame><TabletDeviceFrame fit="width"><TabletWorkbench workflowScreen="tablet-sources-choose-factions" /></TabletDeviceFrame></div>
    </div>
  </TabletPrefsContext.Provider>;
}
