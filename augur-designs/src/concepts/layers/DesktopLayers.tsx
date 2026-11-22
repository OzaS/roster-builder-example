import { useState } from 'react';
import { ArrowUpCircle, ChevronRight, Database, FlaskConical, FolderOpen, Languages, Plus, RefreshCcw, Search, Type, Wrench } from 'lucide-react';
import { ADD_DATA_SUB } from '../workspace/CollectionLinks';
import { Dialog, DialogHeader } from '../workspace/Dialog';
import type { Notify } from '../workspace/Toasts';
import { ADDONS, BASE, PROBLEM_ADDONS, PROBLEM_VARIANTS, REVIEW_ROSTER, UPDATED_VARIANTS, VARIANTS, type Layer } from './layersData';
import { InstallCheck, InstallSource, LayerGroups, OrderEditor, REVIEW_ACTIONS, REVIEW_TITLE, RosterLayers, RosterReview, StackProblems, TestMark, UpdateImpact, checkAction } from './LayersParts';
import { layerState, type LayerState } from './layerScreens';

// A3 on the desktop (Next track, Proposal): Sources list and detail. Layers sit under their base in the list; the detail
// manages them; reordering is drag by the handle or Alt+↑/↓ on a focused row. Installing, the requirement check, the base
// update and the roster open review are dialogs.

const glyph = (l: Layer) => l.purpose === 'locale' ? <Languages size={13} /> : l.kind === 'addon' ? <Type size={13} /> : l.test ? <FlaskConical size={13} /> : <Wrench size={13} />;

export function DesktopLayers({ screen, notify }: { screen: string; notify: Notify }) {
  const [view, setView] = useState<LayerState>((layerState(screen) ?? 'base') as LayerState);
  const toBase = () => setView('base');
  const problems = view === 'problems';
  const after = view === 'after-update';
  const variants = problems ? PROBLEM_VARIANTS : after ? UPDATED_VARIANTS : VARIANTS;
  const addons = problems ? PROBLEM_ADDONS : ADDONS;
  const ordering = view === 'order' || view === 'order-conflict';
  const check = view === 'check-fits' ? 'fits' : view === 'check-needs' ? 'needs' : view === 'check-rules' ? 'changes-rules' : null;
  const child = (l: Layer) => <button key={l.id} type="button" className="lyr-child" data-tone={l.enabled ? 'ok' : 'off'} onClick={toBase}>
    <span className="lyr-child-glyph" aria-hidden>{glyph(l)}</span><span className="lyr-child-title">{l.title}</span>{l.test ? <TestMark /> : null}
    <span className="lyr-child-state">{l.problem && l.problem.code !== 'moved' ? 'Needs attention' : l.enabled ? (l.kind === 'addon' ? 'Add-on' : 'Variant') : 'Off'}</span>
  </button>;
  return <main className="dtp-page lyr-dt-page">
    <div className="dtp-toolbar dtp-top-row">
      <label className="dtp-search"><Search size={15} /><input placeholder="Find installed game data…" aria-label="Find installed game data" /></label>
      <button className="dtp-btn" onClick={() => setView('install')} title="Game data, an add-on or a variant: the app reads what it is"><FolderOpen size={15} />Install from a file</button>
      <button className="dtp-btn primary" onClick={() => notify('Opens Add game data')} title={ADD_DATA_SUB}><Plus size={15} />Add game data</button>
    </div>
    <div className="dtp-split sources">
      <section className="dtp-card dtp-list" aria-label="Installed sources"><div className="dtp-scroll">
        <div className="dtp-group"><h3><Database size={14} />Installed<span>3</span></h3>
          <div className="dts-source-row selected"><button className="dtp-row dtp-source" aria-current="true" onClick={toBase}><span><strong>{BASE.title}</strong><small>{BASE.factions}</small><small className="dtp-faint">{BASE.repo}@v{after ? BASE.next : BASE.version} · Oct 2 · 14.2 MB</small></span></button></div>
          <div className="lyr lyr-desktop lyr-dt-children" aria-label={`Add-ons and variants of ${BASE.title}`}><div className="lyr-children">{[...variants, ...addons].map(child)}</div></div>
          <div className="dts-source-row"><button className="dtp-row dtp-source" onClick={() => notify('Opens Example System Two')}><span><strong>Example System Two</strong><small>4 factions · Glass Legion, Ember Covenant…</small><small className="dtp-faint">example/system-two@v3.0.2 · Sep 30 · 38.6 MB</small></span></button></div>
          <div className="dts-source-row"><button className="dtp-row dtp-source" onClick={() => notify('Opens Skirmish Rules')}><span><strong>Skirmish Rules</strong><small>2 factions · Wardens, Outcasts</small><small className="dtp-faint">From a file · imported Oct 14</small></span></button></div>
          <div className="lyr lyr-desktop lyr-dt-children"><div className="lyr-children"><span className="lyr-child static" data-tone="ok"><span className="lyr-child-glyph" aria-hidden><Plus size={13} /></span><span className="lyr-child-title">Frontier Rangers</span><span className="lyr-child-state">Needs this data</span></span></div></div>
        </div>
        <button className="dtp-row dtp-add-row" onClick={() => notify('Opens Add game data')}><span className="dtp-add-icon"><Plus size={16} /></span><span><strong>Add game data</strong><small>{ADD_DATA_SUB}</small></span><ChevronRight size={15} /></button>
      </div><footer className="dtp-list-foot"><RefreshCcw size={12} />Checked for updates 8 minutes ago<button onClick={() => notify('Checked for updates. Nothing new.')}>Check now</button></footer></section>
      <section className="dtp-card dtp-detail lyr-dt-detail" aria-label={`${BASE.title} details`}>
        <span className="dtp-eyebrow">{BASE.repo}</span>
        <div className="dtp-entry-title"><h2>{ordering ? `${BASE.title} · variant order` : BASE.title}</h2></div>
        <p className="dtp-muted">Version {after ? BASE.next : BASE.version} · 3 factions · {BASE.rosters} rosters use it</p>
        {ordering ? <OrderEditor platform="desktop" layers={VARIANTS} initial={view === 'order-conflict' ? ['house', 'errata', 'playtest'] : undefined} dragging={view === 'order' ? 'playtest' : undefined} onDone={() => { toBase(); notify('Variant order saved'); }} onCancel={toBase} /> : <>
          {!after && !problems ? <button type="button" className="lyr-update-line lyr-dt-update" onClick={() => setView('base-update')}><ArrowUpCircle size={16} aria-hidden /><span><strong>Update available · {BASE.version} → {BASE.next}</strong><small>Changes 2 of your add-ons and variants</small></span><ChevronRight size={15} aria-hidden /></button> : null}
          {after ? <div className="lyr lyr-desktop"><div className="lyr-verdict ok" role="status"><ArrowUpCircle size={16} aria-hidden /><span><strong>Updated to {BASE.next}</strong><small>1 variant was turned off; 1 follows moved entries. Details are on each row.</small></span></div></div> : null}
          {problems ? <StackProblems platform="desktop" count={3} /> : null}
          <LayerGroups platform="desktop" addons={addons} variants={variants} notify={notify} onEditOrder={() => setView('order')} onAdd={() => setView('install')} />
          <h3>Versions, factions and rosters</h3><p className="dtp-muted">As on Sources today, below the add-ons and variants.</p>
        </>}
      </section>
    </div>
    {view === 'install' ? <Dialog label={`Add to ${BASE.title}`} onClose={toBase}><DialogHeader title={`Add to ${BASE.title}`} sub="An add-on or a variant" onClose={toBase} />
      <div className="lyr-dt-body"><InstallSource platform="desktop" onFile={() => setView('check-fits')} onLink={() => setView('check-needs')} /></div>
    </Dialog> : null}
    {check ? <Dialog label="Requirement check" onClose={toBase}><DialogHeader title={check === 'changes-rules' ? 'Can’t add this file' : `Add to ${BASE.title}?`} sub={check === 'changes-rules' ? undefined : 'Requirement check'} onClose={toBase} />
      <div className="lyr-dt-body"><InstallCheck platform="desktop" state={check} hideActions /></div>
      <footer className="dte-foot"><span />{check === 'changes-rules' ? <button type="button" className="dtp-btn primary" onClick={toBase}>Close</button> : <><button type="button" className="dtp-btn" onClick={toBase}>Cancel</button><button type="button" className="dtp-btn primary" onClick={() => { toBase(); notify(check === 'fits' ? 'House rules: Skirmish added and on' : `Updating ${BASE.title}…`); }}>{checkAction(check)}</button></>}</footer>
    </Dialog> : null}
    {view === 'base-update' ? <Dialog label={`Update ${BASE.title}`} onClose={toBase}><DialogHeader title={`Update ${BASE.title} to ${BASE.next}?`} sub="Changed upstream Oct 19 · +2 units added · ~5 costs changed · −1 rule removed" onClose={toBase} />
      <div className="lyr-dt-body"><UpdateImpact platform="desktop" /></div>
      <footer className="dte-foot"><span /><button type="button" className="dtp-btn" onClick={toBase}>Not now</button><button type="button" className="dtp-btn primary" onClick={() => setView('after-update')}>Update</button></footer>
    </Dialog> : null}
  </main>;
}

/** Over the Rosters page: the roster open review and Roster info, as dialogs. */
export function DesktopLayerOverlay({ screen, notify }: { screen: string; notify: Notify }) {
  const [shown, setShown] = useState(true);
  if (!shown) return null;
  const close = () => setShown(false);
  const state = layerState(screen);
  if (state === 'roster-info') return <Dialog label="Roster info" onClose={close}><DialogHeader title="Roster info" sub={REVIEW_ROSTER.name} onClose={close} />
    <div className="lyr-dt-body"><div className="lyr lyr-desktop"><div className="lyr-text lyr-info-head"><strong>{REVIEW_ROSTER.name}<TestMark /></strong><small>{REVIEW_ROSTER.faction} · 1,985 / 2,000 pts · saved {REVIEW_ROSTER.saved}</small></div></div>
      <span className="lyr-section">Data it was saved with</span><RosterLayers platform="desktop" test /></div>
  </Dialog>;
  const missing = state === 'review-missing';
  return <Dialog wide label={REVIEW_TITLE} onClose={close}><DialogHeader title={missing ? 'A variant this roster needs is missing' : REVIEW_TITLE} sub={REVIEW_ROSTER.name} onClose={close} />
    <div className="lyr-dt-body"><RosterReview platform="desktop" variant={missing ? 'missing' : 'full'} notify={notify} hideActions /></div>
    <footer className="dte-foot"><span className="dte-hint">Nothing changes until you choose.</span><button type="button" className="dtp-btn" onClick={() => { close(); notify('Opened read-only, as saved'); }}>{REVIEW_ACTIONS.keep}</button><button type="button" className="dtp-btn primary" data-autofocus onClick={() => { close(); notify(`Opened “${REVIEW_ROSTER.name}”`); }}>{REVIEW_ACTIONS.open}</button></footer>
  </Dialog>;
}

export const desktopLayerOverlay = (screen?: string) => !!screen && /^desktop-layers-(review|review-missing|roster-info)$/.test(screen);
export const desktopLayerPage = (screen?: string) => !!screen?.startsWith('desktop-layers-') && !desktopLayerOverlay(screen);
