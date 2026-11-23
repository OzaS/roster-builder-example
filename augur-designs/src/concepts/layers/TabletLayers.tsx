import { useState } from 'react';
import { ArrowUpCircle, CheckSquare, ChevronRight, FlaskConical, FolderOpen, Languages, Plus, Search, Type, Wrench } from 'lucide-react';
import { ADD_DATA_SUB } from '../workspace/CollectionLinks';
import type { Notify } from '../workspace/Toasts';
import { ListDetail, Row, type SessionProps } from '../tablet/TabletPieces';
import { TabletSheet } from '../tablet/TabletSheet';
import { TabletToolbar, type ToolbarAction } from '../tablet/TabletToolbar';
import { ADDONS, BASE, PROBLEM_ADDONS, PROBLEM_VARIANTS, REVIEW_ROSTER, UPDATED_VARIANTS, VARIANTS, type Layer } from './layersData';
import { InstallCheck, InstallSource, LayerGroups, OrderEditor, REVIEW_TITLE, RosterLayers, RosterReview, StackProblems, TestMark, UpdateImpact, checkAction } from './LayersParts';
import type { LayerState } from './layerScreens';

// A3 on the tablet (Next track, Proposal): Sources list and detail. The list shows each base's layers under it; the detail
// manages them (groups, switches, Edit order). Installing, the requirement check, the base update and the roster open review
// are tablet form sheets (Cancel · title · primary action).

const glyph = (l: Layer) => l.purpose === 'locale' ? <Languages size={14} /> : l.kind === 'addon' ? <Type size={14} /> : l.test ? <FlaskConical size={14} /> : <Wrench size={14} />;

export function TabletLayers({ env, notify, state }: SessionProps & { state: LayerState }) {
  const [view, setView] = useState<LayerState>(state);
  const [open, setOpen] = useState(true);
  const toBase = () => setView('base');
  const problems = view === 'problems';
  const after = view === 'after-update';
  const variants = problems ? PROBLEM_VARIANTS : after ? UPDATED_VARIANTS : VARIANTS;
  const addons = problems ? PROBLEM_ADDONS : ADDONS;
  const actions: ToolbarAction[] = [
    { id: 'select', label: 'Select game data', caption: 'Select', icon: CheckSquare, priority: 2, hint: 'Select several game systems to update or remove them together', onClick: () => notify('Select mode (prototype)') },
    { id: 'file', label: 'Install from a file', caption: 'From a file', icon: FolderOpen, priority: 1, hint: 'Game data, an add-on or a variant: the app reads what it is', onClick: () => setView('install') },
    { id: 'add', label: 'Add game data', caption: 'Add game data', icon: Plus, prominent: true, hint: ADD_DATA_SUB, onClick: () => notify('Opens Add game data') },
  ];
  const search = <label className="ux-search tb-search"><Search size={18} aria-hidden="true" /><input type="search" aria-label="Find installed game data" placeholder="Find game data…" /></label>;
  const shownVariants = after ? UPDATED_VARIANTS : problems ? PROBLEM_VARIANTS : VARIANTS;
  const child = (l: Layer) => <button key={l.id} type="button" className="lyr-child" data-tone={l.enabled ? 'ok' : 'off'} onClick={toBase}>
    <span className="lyr-child-glyph" aria-hidden>{glyph(l)}</span><span className="lyr-child-title">{l.title}</span>{l.test ? <TestMark /> : null}
    <span className="lyr-child-state">{l.problem && l.problem.code !== 'moved' ? 'Needs attention' : l.enabled ? (l.kind === 'addon' ? 'Add-on' : 'Variant') : 'Off'}</span>
  </button>;
  const list = <>
    <div className="tb-list scroll">
      <Row selected mark="OF" title={BASE.title} sub={`${BASE.repo} · ${after ? BASE.next : `${BASE.version} → ${BASE.next}`} · 14.2 MB`} onClick={() => { toBase(); setOpen(true); }} />
      <div className="lyr lyr-tablet lyr-tablet-children" aria-label={`Add-ons and variants of ${BASE.title}`}><div className="lyr-children">{[...shownVariants, ...addons].map(child)}</div></div>
      <Row selected={false} mark="ES" title="Example System Two" sub="example/system-two · v3.0.2 · 38.6 MB" onClick={() => notify('Opens Example System Two')} />
      <Row selected={false} mark="SR" title="Skirmish Rules" sub="From a file · local · 1.1 MB" onClick={() => notify('Opens Skirmish Rules')} />
      <div className="lyr lyr-tablet lyr-tablet-children"><div className="lyr-children"><span className="lyr-child static" data-tone="ok"><span className="lyr-child-glyph" aria-hidden><Plus size={14} /></span><span className="lyr-child-title">Frontier Rangers</span><span className="lyr-child-state">Needs this data</span></span></div></div>
      <Row selected={false} mark={<Plus size={20} />} title="Add game data" sub={ADD_DATA_SUB} end={<ChevronRight size={17} />} onClick={() => notify('Opens Add game data')} />
    </div>
    <div className="tb-list-foot tb-list-foot-stack"><span>3 game systems installed · Everything works offline</span></div>
  </>;

  const ordering = view === 'order' || view === 'order-conflict';
  const detail = <>
    <div className="tb-detail-title"><span><h2>{ordering ? 'Variant order' : BASE.title}</h2><small>{ordering ? `${BASE.title} · ${VARIANTS.length} variants` : `${BASE.repo} · version ${after ? BASE.next : BASE.version} · ${BASE.rosters} rosters`}</small></span></div>
    {ordering ? <OrderEditor platform="tablet" layers={VARIANTS} initial={view === 'order-conflict' ? ['house', 'errata', 'playtest'] : undefined} onDone={() => { toBase(); notify('Variant order saved'); }} onCancel={toBase} /> : <>
      {!after && !problems ? <button type="button" className="lyr-update-line" onClick={() => setView('base-update')}><ArrowUpCircle size={18} aria-hidden /><span><strong>Update available · {BASE.version} → {BASE.next}</strong><small>Changes 2 of your add-ons and variants</small></span><ChevronRight size={16} aria-hidden /></button> : null}
      {after ? <div className="lyr lyr-tablet"><div className="lyr-verdict ok" role="status"><ArrowUpCircle size={18} aria-hidden /><span><strong>Updated to {BASE.next}</strong><small>1 variant was turned off; 1 follows moved entries. Details are on each row.</small></span></div></div> : null}
      {problems ? <StackProblems platform="tablet" count={3} /> : null}
      <LayerGroups platform="tablet" addons={addons} variants={variants} notify={notify} onEditOrder={() => setView('order')} onAdd={() => setView('install')} />
      <section className="tb-section"><span className="ux-result-label">Version, factions and rosters</span><p className="tb-muted">Versions, kept versions, factions and the rosters using it follow here, as on Sources today.</p></section>
    </>}
  </>;

  const check = view === 'check-fits' ? 'fits' : view === 'check-needs' ? 'needs' : view === 'check-rules' ? 'changes-rules' : null;
  const checkLabel = check ? checkAction(check) : undefined;
  return <div className="tb-page lyr-tablet-page">
    <TabletToolbar title="Sources" search={search} actions={actions} input={env.input} />
    <ListDetail env={env} label="Installed sources" open={open} onClose={() => setOpen(false)} list={list} detail={detail} />
    {view === 'install' ? <TabletSheet title={`Add to ${BASE.title}`} sub="An add-on or a variant" onClose={toBase}>
      <InstallSource platform="tablet" onFile={() => setView('check-fits')} onLink={() => setView('check-needs')} />
    </TabletSheet> : null}
    {check ? <TabletSheet title={check === 'changes-rules' ? 'Can’t add this file' : `Add to ${BASE.title}?`} sub={check === 'changes-rules' ? undefined : 'Requirement check'} cancelLabel={check === 'changes-rules' ? 'Close' : 'Cancel'} onClose={toBase}
      action={checkLabel ? { label: checkLabel, onClick: () => { toBase(); notify(check === 'fits' ? 'House rules: Skirmish added and on' : `Updating ${BASE.title}…`); } } : undefined}>
      <InstallCheck platform="tablet" state={check} hideActions />
    </TabletSheet> : null}
    {view === 'base-update' ? <TabletSheet title={`Update ${BASE.title} to ${BASE.next}?`} sub="Changed upstream Oct 19" cancelLabel="Not now" onClose={toBase} action={{ label: 'Update', onClick: () => setView('after-update') }}>
      <UpdateImpact platform="tablet" />
    </TabletSheet> : null}
  </div>;
}

/** Over the Rosters page: the roster open review (opening a roster saved with other data) and Roster info. */
export function TabletLayerOverlay({ state, notify }: { state: LayerState; notify: Notify }) {
  const [shown, setShown] = useState(true);
  if (!shown) return null;
  const close = () => setShown(false);
  if (state === 'roster-info') return <TabletSheet title="Roster info" sub={REVIEW_ROSTER.name} cancelLabel="Close" onClose={close}>
    <div className="lyr lyr-tablet"><div className="lyr-text lyr-info-head"><strong>{REVIEW_ROSTER.name}<TestMark /></strong><small>{REVIEW_ROSTER.faction} · 1,985 / 2,000 pts · saved {REVIEW_ROSTER.saved}</small></div></div>
    <span className="lyr-section">Data it was saved with</span>
    <RosterLayers platform="tablet" test />
  </TabletSheet>;
  const missing = state === 'review-missing';
  return <TabletSheet wide title={missing ? 'A variant this roster needs is missing' : REVIEW_TITLE} sub={REVIEW_ROSTER.name} onClose={close}>
    <RosterReview platform="tablet" variant={missing ? 'missing' : 'full'} notify={notify} onOpen={() => { close(); notify(`Opened “${REVIEW_ROSTER.name}”`); }} onKeep={() => { close(); notify('Opened read-only, as saved'); }} />
  </TabletSheet>;
}

export const tabletLayerOverlayState = (state: string): LayerState | null => state === 'layers-review' || state === 'layers-review-missing' || state === 'layers-roster-info' ? state.slice(7) as LayerState : null;
export const tabletLayerPageState = (state: string): LayerState | null => state.startsWith('layers-') && !tabletLayerOverlayState(state) ? state.slice(7) as LayerState : null;

