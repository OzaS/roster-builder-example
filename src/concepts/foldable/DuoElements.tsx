import { useLayoutEffect, useMemo } from 'react';
import { ArrowDownToLine, ChevronLeft, Copy, FileUp, Flag, Pencil, Plus, Redo2, Undo2 } from 'lucide-react';
import { LibrarySwitch } from '../../gallery/LibrarySwitch';
import { BarRegistry, type BarLayer } from './duoBarItems';
import { DuoBottomTabs, DuoSideBar, type DuoPage } from './DuoBars';
import { DuoDeviceFrame } from './DuoFrame';
import { DuoWorkbench } from './DuoWorkbench';
import { BAR_WIDTH, duoPoses, poseById, type DuoPoseId } from './duoPoses';
import '../tablet/tablet.css';
import './duo.css';

const noop = () => {};
const rostersLayer: BarLayer = { items: [
  { id: 'new', label: 'New roster', icon: Plus, group: 'primary', prominent: true, onClick: noop },
  { id: 'import', label: 'Import roster', icon: FileUp, group: 'secondary', onClick: noop },
] };
const editorLayer: BarLayer = { items: [
  { id: 'back', label: 'Back to Rosters', icon: ChevronLeft, group: 'nav', onClick: noop },
  { id: 'add', label: 'Add unit', icon: Plus, group: 'primary', prominent: true, onClick: noop },
  { id: 'undo', label: 'Undo', icon: Undo2, group: 'secondary', onClick: noop },
  { id: 'redo', label: 'Redo', icon: Redo2, group: 'secondary', disabled: true, onClick: noop },
], menu: [
  { id: 'export', label: 'Export roster…', icon: ArrowDownToLine, onClick: noop },
  { id: 'rename', label: 'Rename roster', icon: Pencil, onClick: noop },
  { id: 'duplicate', label: 'Duplicate roster', icon: Copy, onClick: noop },
  { id: 'force', label: 'Add force…', icon: Flag, onClick: noop },
] };

/** The side bar alone, at the height of a pose, with a given set of declared items. */
function BarDemo({ pose, layer, page = 'rosters', minimized = false, light = false, caption }: { pose: DuoPoseId; layer: BarLayer; page?: DuoPage; minimized?: boolean; light?: boolean; caption: string }) {
  const registry = useMemo(() => new BarRegistry(), []);
  useLayoutEffect(() => { registry.set('demo', layer); }, [registry, layer]);
  const spec = poseById(pose);
  return <figure className="duo-el-bar">
    <div className={`tb-app duo-app ux-screen ${light ? 'light' : 'dark'} duo-v duo-${spec.display}`} style={{ width: BAR_WIDTH + 40, height: spec.height }}>
      <div className="duo-el-content" /><DuoSideBar pose={spec} registry={registry} page={page} minimized={minimized} onPick={noop} />
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

/** Foldable · Elements: the vertical bars, their compression, the horizontal bars of the open display in portrait and the
 *  poses. Screens sit in the workflows; this page shows the pieces. */
export function DuoElements() {
  return <div className="tb-elements duo-elements">
    <h1>Foldable · Elements (passport foldable)</h1>
    <p>After Apple's iPhone Duo (HIG “Designing for iPhone Duo”, September 2026). The outer display is passport-shaped, wider and shorter than other iPhones; the inner display opens like a book. Closed, and open in landscape, the status, toolbar and tab bar sit on the trailing edge: screens declare toolbar items and the bar lays them out. Content keeps the shared mobile and tablet pieces: compact width on the outer display, the tablet's panes on the inner display.</p>
    <h2>Design library navigation</h2>
    <LibrarySwitch current="foldable" label="Design library examples" />

    <h2>Side bar · HIG order top to bottom: Dynamic Island, status, toolbar, tab bar</h2>
    <p>Back or Close on top, then the prominent action (accent fill), then the other items in a capsule; More (ellipsis) is the system overflow menu and also holds what does not fit. Tabs are icon-only in a capsule (labels in the hint and accessible name); Lookup has the search role and sits apart below them. Liquid Glass with a solid fallback for Reduce transparency.</p>
    <div className="duo-el-row">
      <BarDemo pose="closed" layer={rostersLayer} caption="Closed · Rosters: New roster, Import, five tabs" />
      <BarDemo pose="closed" layer={editorLayer} minimized caption="Closed · roster editor: tab bar minimized" />
      <BarDemo pose="closed" layer={editorLayer} minimized light caption="Light" />
      <BarDemo pose="closed-landscape" layer={{ items: [...rostersLayer.items, { id: 'select', label: 'Select rosters', icon: Copy, group: 'secondary', onClick: noop }] }} caption="Closed, landscape · navigation: toolbar items move into More, tab bar kept" />
      <BarDemo pose="closed-landscape" layer={editorLayer} minimized caption="Closed, landscape · task: tab bar minimized, toolbar kept" />
      <BarDemo pose="open" layer={{ items: editorLayer.items.filter(i => i.id !== 'add'), menu: editorLayer.menu }} minimized caption="Open · editor: no camera, status on top; Add unit stays above the roster pane" />
    </div>

    <h2>Horizontal bars · open display in portrait</h2>
    <p>The inner display in portrait has the height for standard bars: page toolbars stay on top of their panes; the tab bar floats at the bottom with labels, the search tab beside it, and New roster at the trailing corner on Rosters.</p>
    <div className="duo-el-row"><div className="tb-app duo-app ux-screen dark duo-h duo-el-hbar"><DuoBottomTabs page="rosters" onPick={noop} /></div></div>

    <h2>Fold · reserved region when partially folded</h2>
    <p>Fully open, panes keep their regular proportions (list narrower than detail). Partially folded, the panes divide at the fold with the folding region between them, and the page's search and filters stay with the leading pane. No control sits in the fold.</p>
    <div className="tb-el-frames"><DuoDeviceFrame fit="width" pose="open"><DuoWorkbench workflowScreen="duo-open-rosters" /></DuoDeviceFrame><DuoDeviceFrame fit="width" pose="open-folded"><DuoWorkbench workflowScreen="duo-folded-rosters" /></DuoDeviceFrame></div>

    <h2>Poses · same scale</h2>
    <div className="tb-el-devices">{duoPoses.map(p => <figure key={p.id}><i style={{ width: p.width / 6, height: p.height / 6 }} className={`duo-el-pose ${p.id}`} /><figcaption><strong>{p.label}</strong>{p.width} × {p.height} pt · {p.bars === 'vertical' ? 'bars on the trailing edge' : 'horizontal bars'}</figcaption></figure>)}</div>
  </div>;
}
