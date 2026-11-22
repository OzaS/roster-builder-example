import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowUpCircle, ChevronRight, FileArchive, FlaskConical, Languages, Plus, Type, Wrench } from 'lucide-react';
import type { ConceptProps } from '../shared';
import { JobToast } from '../ux/SourceJobs';
import { ADD_DATA_SUB } from '../workspace/CollectionLinks';
import { ADDONS, BASE, PROBLEM_ADDONS, PROBLEM_VARIANTS, REVIEW_ROSTER, UPDATED_VARIANTS, VARIANTS, type Layer } from './layersData';
import { InstallCheck, InstallSource, LayerGroups, OrderEditor, REVIEW_TITLE, RosterLayers, RosterReview, StackProblems, TestMark, UpdateImpact, btnClass } from './LayersParts';
import { layerState, type LayerState } from './layerScreens';

// A3 on the phone (Next track, Proposal). Sources lists each base's layers under it; the base's page manages them;
// installing and the requirement check are bottom sheets; the roster open review is a page before the roster.

type View = LayerState | 'sources';

function Header({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return <header className="ux-wb-top ux-wb-home-top reversed">
    <button type="button" className="ux-icon-btn" aria-label="Back" onClick={onBack}><ArrowLeft size={18} /></button>
    <div className="ux-wb-title"><strong>{title}</strong><small /></div>
    {right}
  </header>;
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="ux-job-scrim" onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="ux-job-sheet lyr-phone-sheet" role="dialog" aria-label={title}>
      <span className="ux-sheet-grip" aria-hidden />
      <header className="ux-job-head"><span><strong>{title}</strong></span></header>
      {children}
    </section>
  </div>;
}

const glyph = (l: Layer) => l.purpose === 'locale' ? <Languages size={14} /> : l.kind === 'addon' ? <Type size={14} /> : l.test ? <FlaskConical size={14} /> : <Wrench size={14} />;

/** Sources: each base row carries its layers as indented child rows (variants first, then add-ons), so the stack shows at a glance. */
function SourcesList({ onBase, onAdd }: { onBase: () => void; onAdd: () => void }) {
  const child = (l: Layer) => <button key={l.id} type="button" className="lyr-child" data-tone={l.enabled ? 'ok' : 'off'} onClick={onBase}>
    <span className="lyr-child-glyph" aria-hidden>{glyph(l)}</span>
    <span className="lyr-child-title">{l.title}</span>
    {l.test ? <TestMark /> : null}
    <span className="lyr-child-state">{l.enabled ? (l.kind === 'addon' ? 'Add-on' : 'Variant') : 'Off'}</span>
  </button>;
  return <div className="lyr lyr-phone lyr-sources">
    <button type="button" className="lyr-add-row" onClick={onAdd}><span className="lyr-add-icon" aria-hidden><Plus size={18} /></span><span className="lyr-text"><strong>Add game data</strong><small>{ADD_DATA_SUB}</small></span><ChevronRight size={16} aria-hidden /></button>
    <button type="button" className="lyr-add-row" onClick={onAdd}><span className="lyr-add-icon" aria-hidden><FileArchive size={18} /></span><span className="lyr-text"><strong>Install from a file on this device</strong><small>Game data, an add-on or a variant: the app reads what it is</small></span><ChevronRight size={16} aria-hidden /></button>
    <span className="lyr-section">Installed</span>
    <div className="lyr-base" data-tone="info">
      <span className="lyr-edge" aria-hidden />
      <button type="button" className="lyr-base-main" onClick={onBase}>
        <span className="lyr-text"><strong>{BASE.title}</strong><small>{BASE.factions}</small><small>Version {BASE.version} · {BASE.next} available · 14.2 MB</small></span>
        <ArrowUpCircle size={20} className="lyr-base-status" aria-label={`Update available, ${BASE.next}`} />
      </button>
      <div className="lyr-children" aria-label={`Add-ons and variants of ${BASE.title}`}>{[...VARIANTS, ...ADDONS].map(child)}</div>
    </div>
    <div className="lyr-base" data-tone="ok">
      <span className="lyr-edge" aria-hidden />
      <button type="button" className="lyr-base-main"><span className="lyr-text"><strong>Example System Two</strong><small>4 factions · Glass Legion, Ember Covenant…</small><small>Version 3.0.2 · 38.6 MB · no add-ons</small></span></button>
    </div>
    <div className="lyr-base" data-tone="ok">
      <span className="lyr-edge" aria-hidden />
      <button type="button" className="lyr-base-main"><span className="lyr-text"><strong>Skirmish Rules</strong><small>2 factions · Wardens, Outcasts</small><small>From a file · 1.1 MB</small></span></button>
      <div className="lyr-children"><span className="lyr-child static" data-tone="ok"><span className="lyr-child-glyph" aria-hidden><Plus size={14} /></span><span className="lyr-child-title">Frontier Rangers</span><span className="lyr-child-state">Needs this data</span></span></div>
    </div>
  </div>;
}

export function PhoneLayersScreen({ props }: { props: ConceptProps }) {
  const initial = (layerState(props.workflowScreen) ?? 'sources') as View;
  const [view, setView] = useState<View>(initial);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(null), 2600); return () => window.clearTimeout(t); }, [toast]);
  const notify = (m: string) => setToast(m);
  const toBase = () => setView('base');
  const sheetOver = ['install', 'check-fits', 'check-needs', 'check-rules', 'base-update'].includes(view);
  const page: View = sheetOver ? (view === 'base-update' ? 'base-update' : 'base') : view;

  let body: ReactNode;
  if (page === 'sources') {
    body = <><Header title="Sources" onBack={props.onBack} /><div className="ux-wb-home-body ux-sources-body ux-src-body lyr-phone-body"><SourcesList onBase={toBase} onAdd={() => notify('Opens Add game data')} /></div></>;
  } else if (page === 'order' || page === 'order-conflict') {
    body = <><Header title="Variant order" onBack={toBase} /><div className="ux-wb-home-body ux-src-body lyr-phone-body">
      <OrderEditor platform="phone" layers={VARIANTS} initial={page === 'order-conflict' ? ['house', 'errata', 'playtest'] : undefined} onDone={() => { toBase(); notify('Variant order saved'); }} onCancel={toBase} />
    </div></>;
  } else if (page === 'review' || page === 'review-missing') {
    body = <><Header title={REVIEW_ROSTER.name} onBack={props.onBack} /><div className="ux-wb-home-body ux-src-body lyr-phone-body">
      <h2 className="lyr-page-title">{page === 'review' ? REVIEW_TITLE : 'A variant this roster needs is missing'}</h2>
      <RosterReview platform="phone" variant={page === 'review' ? 'full' : 'missing'} notify={notify} onOpen={() => notify('Opens the roster')} onKeep={() => notify('Opens read-only, as saved')} />
    </div></>;
  } else if (page === 'roster-info') {
    body = <><Header title="Roster info" onBack={props.onBack} /><div className="ux-wb-home-body ux-src-body lyr-phone-body">
      <div className="lyr lyr-phone"><div className="lyr-text lyr-info-head"><strong>{REVIEW_ROSTER.name}<TestMark /></strong><small>{REVIEW_ROSTER.faction} · 1,985 / 2,000 pts · saved {REVIEW_ROSTER.saved}</small></div></div>
      <span className="lyr-section">Data it was saved with</span>
      <RosterLayers platform="phone" test />
    </div></>;
  } else {
    // base, problems, after-update, base-update (sheet over the base page)
    const problems = page === 'problems';
    const after = page === 'after-update';
    const variants = problems ? PROBLEM_VARIANTS : after ? UPDATED_VARIANTS : VARIANTS;
    const addons = problems ? PROBLEM_ADDONS : ADDONS;
    const version = after ? BASE.next : BASE.version;
    body = <><Header title={BASE.title} onBack={() => setView('sources')} /><div className="ux-wb-home-body ux-src-body lyr-phone-body">
      <p className="lyr-base-line">Version {version} · {BASE.repo} · {BASE.rosters} rosters</p>
      {!after && !problems ? <button type="button" className="lyr-update-line" onClick={() => setView('base-update')}><ArrowUpCircle size={18} aria-hidden /><span><strong>Update available · {BASE.version} → {BASE.next}</strong><small>Changes 2 of your add-ons and variants</small></span><ChevronRight size={16} aria-hidden /></button> : null}
      {after ? <div className="lyr lyr-phone"><div className="lyr-verdict ok" role="status"><ArrowUpCircle size={18} aria-hidden /><span><strong>Updated to {BASE.next}</strong><small>1 variant was turned off; 1 follows moved entries. Details are on each row.</small></span></div></div> : null}
      {problems ? <StackProblems platform="phone" count={3} /> : null}
      <LayerGroups platform="phone" addons={addons} variants={variants} notify={notify} onEditOrder={() => setView('order')} onAdd={() => setView('install')} />
      <button type="button" className={`${btnClass('phone', 'ghost')} lyr-more`}>Version, factions and rosters<ChevronRight size={16} /></button>
    </div></>;
  }

  return <>
    {body}
    {view === 'install' ? <Sheet title={`Add to ${BASE.title}`} onClose={toBase}><InstallSource platform="phone" onFile={() => setView('check-fits')} onLink={() => setView('check-needs')} /></Sheet> : null}
    {view === 'check-fits' || view === 'check-needs' || view === 'check-rules' ? <Sheet title={view === 'check-rules' ? 'Can’t add this file' : `Add to ${BASE.title}?`} onClose={toBase}>
      <InstallCheck platform="phone" state={view === 'check-fits' ? 'fits' : view === 'check-needs' ? 'needs' : 'changes-rules'} onCancel={toBase} onAdd={() => { toBase(); notify(view === 'check-fits' ? 'House rules: Skirmish added and on' : `Updating ${BASE.title}…`); }} />
    </Sheet> : null}
    {view === 'base-update' ? <Sheet title={`Update ${BASE.title} to ${BASE.next}?`} onClose={toBase}>
      <UpdateImpact platform="phone" />
      <div className="lyr lyr-phone"><div className="lyr-actions"><button type="button" className={btnClass('phone')} onClick={toBase}>Not now</button><button type="button" className={btnClass('phone', 'primary')} onClick={() => setView('after-update')}>Update</button></div></div>
    </Sheet> : null}
    {toast ? <div className="ux-job-float"><JobToast tone="neutral" message={toast} /></div> : null}
  </>;
}
