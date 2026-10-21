import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type RefObject } from 'react';
import { AlertTriangle, Archive, ArrowDownToLine, ArrowLeft, ArrowUpCircle, Check, ChevronRight, CloudOff, Copy, Ellipsis, EyeOff, FileText, Github, History, Inbox, Layers3, LibraryBig, Link2, ListChecks, LoaderCircle, OctagonAlert, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import { dataChanges, githubRepositories, rosterChecks, sourceCollections, type CheckState, type CollectionPage, type DataChanges, type LastUpdate, type Listing, type RosterCheck, type SourceInfo } from './desktopData';
import { jobPercent, type DesktopJobs } from './DesktopJobs';
import type { ToastOptions } from './DesktopPages';
import './desktop-sources.css';

// Sources sub-flows for the desktop prototype (revision 05), all inside the Sources page's detail pane:
// the last update card and update report, collection pages, GitHub search and the add-collection dialog.
// The detail pane's mode lives in the page's selected id: a source id, 'add', 'report:<id>',
// 'collection:<id>' or 'github', so it survives switching pages like the selected source does.

type Notify = (message: string, options?: ToastOptions) => void;
type Go = (detail: string) => void;
type Tone = 'neutral' | 'ok' | 'warn' | 'err' | 'accent';

export const flowSourceId = (detail: string) => detail.startsWith('report:') ? detail.slice(7) : detail;
export const isAddFlow = (detail: string) => detail === 'add' || detail === 'github' || detail.startsWith('collection:');

const plural = (n: number, one: string, other = `${one}s`) => `${n} ${n === 1 ? one : other}`;
const titleCase = (slug: string) => slug.split(/[-_.]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

function Chip({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`dtp-chip ${tone}`}>{children}</span>;
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className="dts-back" aria-label={`Back to ${label}`} onClick={onClick}><ArrowLeft size={14} />{label}</button>;
}

/** Gallery-only control for states that normal clicks cannot reach (offline, errors). */
function PreviewStates({ items, note }: { items: Array<{ label: string; active?: boolean; run: () => void }>; note?: string }) {
  return <details className="dts-preview"><summary>Preview states</summary>
    <div className="dts-preview-row">{items.map(item => <button key={item.label} className={item.active ? 'active' : ''} aria-pressed={item.active} onClick={item.run}>{item.label}</button>)}</div>
    {note && <p>{note}</p>}
  </details>;
}

/* ---------------------------- Session store ---------------------------- */
// Saved collections, the hidden default collection and "Show archived" outlive the Sources page, like app preferences.

type Saved = { id: string; name: string; kind: 'collection' | 'library'; link: string };
type FlowStore = { hidden: boolean; showArchived: boolean; saved: Saved[] };
let flowStore: FlowStore = { hidden: false, showArchived: false, saved: [] };
const listeners = new Set<() => void>();
const setFlowStore = (patch: Partial<FlowStore>) => { flowStore = { ...flowStore, ...patch }; listeners.forEach(l => l()); };
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const useFlowStore = () => useSyncExternalStore(subscribe, () => flowStore);

const pageOf = (id: string, store: FlowStore): CollectionPage | undefined => {
  if (sourceCollections[id]) return sourceCollections[id];
  const saved = store.saved.find(s => s.id === id);
  if (!saved) return undefined;
  const base = sourceCollections[saved.kind === 'library' ? 'example-org' : 'community-picks'];
  return { ...base, id, name: saved.name, link: saved.link, parent: undefined, entries: [] };
};
const pageKind = (page: CollectionPage) => page.kind === 'library' ? `${plural(page.listings.length, 'repository', 'repositories')} · ${page.by}` : `${plural(page.listings.length, 'source')} · collection`;

/* ----------------------------- Listing rows ----------------------------- */

const liveJob = (jobs: DesktopJobs, id: string) => jobs.jobs.find(j => j.sourceId === id && (j.status === 'running' || j.status === 'needs-you'));

function ListingAction({ listing, jobs, go, onOpenJobs }: { listing: Listing; jobs: DesktopJobs; go: Go; onOpenJobs: () => void }) {
  const installed = jobs.sources.find(s => s.id === listing.id);
  const live = liveJob(jobs, listing.id);
  if (live) return <button className={`dtp-btn small ${live.status === 'needs-you' ? 'primary' : ''}`} title="Show installs and updates" onClick={onOpenJobs}>{live.status === 'needs-you' ? 'Choose factions' : `${live.kind === 'update' ? 'Updating' : 'Installing'} ${jobPercent(live)}%`}</button>;
  if (installed?.next) return <button className="dtp-btn small" aria-label={`Update ${listing.name}`} onClick={() => { jobs.startUpdate([listing.id]); onOpenJobs(); }}><ArrowUpCircle size={13} />Update</button>;
  if (installed) return <button className="dtp-btn small dts-quiet" aria-label={`${listing.name} is installed. Show it`} title="Show the installed source" onClick={() => go(listing.id)}><Check size={13} />Installed</button>;
  return <button className="dtp-btn small" aria-label={`Install ${listing.name}`} onClick={() => { jobs.startInstall({ id: listing.id, name: listing.name, factions: listing.factions, size: listing.size }); onOpenJobs(); }}><ArrowDownToLine size={13} />Install</button>;
}

function ListingRow({ listing, jobs, go, onOpenJobs, compact = false }: { listing: Listing; jobs: DesktopJobs; go: Go; onOpenJobs: () => void; compact?: boolean }) {
  const installed = jobs.sources.find(s => s.id === listing.id);
  const live = liveJob(jobs, listing.id);
  const chips = !compact && (listing.supported || installed || listing.archived);
  return <div className={`dtp-collection-row dts-listing ${listing.archived ? 'archived' : ''}`}>
    <span>
      <strong>{listing.name}</strong>
      {compact ? <small>{plural(listing.factions.length, 'faction')} · {listing.size}</small> : <small>{listing.description}</small>}
      {!compact && <small className="dtp-faint">{listing.repo} · updated {listing.updated}</small>}
      {chips && <span className="dts-chips">
        {listing.supported && <Chip tone="accent">Supported</Chip>}
        {installed && <Chip tone="ok"><Check size={11} />Installed</Chip>}
        {installed?.next && <Chip tone="accent"><ArrowUpCircle size={11} />Update</Chip>}
        {listing.archived && <Chip><Archive size={11} />Archived</Chip>}
      </span>}
      {live && <i className="dtp-progress"><em style={{ width: `${jobPercent(live)}%` }} /></i>}
    </span>
    <ListingAction listing={listing} jobs={jobs} go={go} onOpenJobs={onOpenJobs} />
  </div>;
}

function ArchivedToggle({ count }: { count: number }) {
  const store = useFlowStore();
  return <button className="dts-text-btn center" aria-expanded={store.showArchived} onClick={() => setFlowStore({ showArchived: !store.showArchived })}>{store.showArchived ? 'Hide archived' : `Show archived (${count})`}</button>;
}

function EntryRow({ page, onOpen }: { page: CollectionPage; onOpen: () => void }) {
  return <button className="dtp-link-row" onClick={onOpen}>{page.kind === 'library' ? <LibraryBig size={16} /> : <Layers3 size={16} />}<span><strong>{page.name}</strong><small>{pageKind(page)}</small></span><ChevronRight size={15} /></button>;
}

function Skeleton() {
  return <div className="dts-skeleton" role="status" aria-label="Loading">{[0, 1, 2].map(i => <i key={i} />)}</div>;
}

/* ------------------------------ ⋯ menu ------------------------------ */

type MenuItem = { label: string; icon: ReactNode; run: () => void; danger?: boolean };

function MoreMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    wrap.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus();
    const away = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('pointerdown', away);
    return () => window.removeEventListener('pointerdown', away);
  }, [open]);
  const onKey = (e: ReactKeyboardEvent) => {
    const nodes = Array.from(wrap.current?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? []);
    const i = nodes.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setOpen(false); button.current?.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); nodes[(i + 1) % nodes.length]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); nodes[(i - 1 + nodes.length) % nodes.length]?.focus(); }
    else if (e.key === 'Tab') setOpen(false);
  };
  return <div className="dts-menu-wrap" ref={wrap} onKeyDown={open ? onKey : undefined}>
    <button ref={button} className="dtp-icon dts-more" aria-label={label} title={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(v => !v)}><Ellipsis size={17} /></button>
    {open && <div className="dts-menu" role="menu" aria-label={label}>{items.map(item => <button key={item.label} role="menuitem" className={item.danger ? 'danger' : ''} onClick={() => { setOpen(false); item.run(); }}>{item.icon}{item.label}</button>)}</div>}
  </div>;
}

/* ---------------------- Last update + roster check ---------------------- */

const unchangedCheck: RosterCheck = { status: 'unchanged', lines: [] };
type CheckPhase = CheckState | 'none';
const phaseOf = (s: SourceInfo): CheckPhase => !s.rosters.length ? 'none' : s.lastUpdate?.check ?? 'none';
/** The rosters checked so far, with what the check found. */
const checkResults = (s: SourceInfo) => {
  const u = s.lastUpdate;
  if (!u || u.check === 'not-checked') return [];
  const count = u.check === 'done' ? s.rosters.length : u.done;
  return s.rosters.slice(0, count).map(name => ({ name, ...(u.nothingChanged ? unchangedCheck : rosterChecks[name] ?? unchangedCheck) }));
};
const patchUpdate = (jobs: DesktopJobs, id: string, patch: Partial<LastUpdate>) => jobs.setSources(list => list.map(s => s.id === id && s.lastUpdate ? { ...s, lastUpdate: { ...s.lastUpdate, ...patch } } : s));
const startCheck = (jobs: DesktopJobs, id: string) => patchUpdate(jobs, id, { check: 'checking', done: 0 });
const cancelCheck = (jobs: DesktopJobs, s: SourceInfo, notify: Notify) => { patchUpdate(jobs, s.id, { check: 'cancelled' }); notify(`Roster check of ${s.name} cancelled`); };

/** Runs the simulated roster checks while the Sources page is open; a finished check raises a notification. */
export function useRosterChecks(jobs: DesktopJobs, notify: Notify, go: Go) {
  const { sources, setSources } = jobs;
  const checking = sources.some(s => s.lastUpdate?.check === 'checking');
  useEffect(() => {
    if (!checking) return;
    const timer = setInterval(() => setSources(list => list.map(s => {
      const u = s.lastUpdate;
      if (u?.check !== 'checking') return s;
      const done = Math.min(s.rosters.length, u.done + 1);
      return { ...s, lastUpdate: { ...u, done, check: done >= s.rosters.length ? 'done' : 'checking' } };
    })), 700);
    return () => clearInterval(timer);
  }, [checking, setSources]);
  const previous = useRef<Record<string, CheckState | undefined>>({});
  useEffect(() => {
    sources.forEach(s => {
      if (previous.current[s.id] !== 'checking' || s.lastUpdate?.check !== 'done') return;
      const changed = checkResults(s).filter(r => r.status !== 'unchanged').length;
      notify(`${s.name}: ${plural(s.rosters.length, 'roster')} checked, ${changed} changed`, { kind: 'notification', action: { label: 'View report', run: () => go(`report:${s.id}`) } });
    });
    previous.current = Object.fromEntries(sources.map(s => [s.id, s.lastUpdate?.check]));
  }, [sources, notify, go]);
}

/** Source detail: when the last update finished and where its roster check stands. */
export function LastUpdateCard({ source, jobs, notify, go }: { source: SourceInfo; jobs: DesktopJobs; notify: Notify; go: Go }) {
  const u = source.lastUpdate;
  if (!u) return null;
  const total = source.rosters.length;
  const phase = phaseOf(source);
  const changed = checkResults(source).filter(r => r.status !== 'unchanged').length;
  const line = phase === 'none' ? 'No roster uses this data.'
    : phase === 'checking' ? `Checking rosters · ${u.done} of ${total}`
      : phase === 'done' ? `${plural(total, 'roster')} checked: ${total - changed} unchanged, ${changed} changed`
        : `${plural(phase === 'cancelled' ? total - u.done : total, 'roster')} not checked yet`;
  return <div className={`dts-last-update ${phase}`}>
    <div className="dts-last-head">
      <span className="dts-tile"><History size={17} /></span>
      <span><strong>Updated {u.when} from {u.from} to {u.to}</strong><small aria-live={phase === 'checking' ? 'polite' : undefined}>{line}</small>{phase === 'failed' && <small className="dts-error">The roster check stopped: a roster file could not be read.</small>}</span>
      {phase === 'done' && changed > 0 && <Chip tone="warn"><AlertTriangle size={11} />{changed} changed</Chip>}
      {phase === 'done' && changed === 0 && <Chip tone="ok"><Check size={11} />No rosters changed</Chip>}
    </div>
    {phase === 'checking' && <i className="dtp-progress" role="progressbar" aria-label="Roster check" aria-valuemin={0} aria-valuemax={total} aria-valuenow={u.done}><em style={{ width: `${total ? u.done / total * 100 : 0}%` }} /></i>}
    <div className="dts-last-actions">
      {(phase === 'not-checked' || phase === 'failed' || phase === 'cancelled') && <button className="dtp-btn primary small" onClick={() => startCheck(jobs, source.id)}><ListChecks size={14} />Check rosters</button>}
      {phase === 'checking' && <button className="dtp-btn small" onClick={() => cancelCheck(jobs, source, notify)}>Cancel</button>}
      <button className="dtp-btn small" onClick={() => go(`report:${source.id}`)}>View report<ChevronRight size={13} /></button>
    </div>
  </div>;
}

/** Preview control for the last update states of a source (source detail and report). */
export function LastUpdateStates({ source, jobs }: { source: SourceInfo; jobs: DesktopJobs }) {
  if (source.fromFile) return null;
  const u = source.lastUpdate;
  const total = source.rosters.length;
  const base: LastUpdate = { from: u?.from ?? source.kept?.[0] ?? 'v1.3', to: u?.to ?? source.version, when: u?.when ?? 'Oct 18', check: 'done', done: total };
  const set = (next: LastUpdate | undefined) => jobs.setSources(list => list.map(s => s.id === source.id ? { ...s, lastUpdate: next } : s));
  const current = !u ? 'none' : u.check === 'done' ? (u.nothingChanged ? 'nothing' : 'done') : u.check;
  const states: Array<[string, string, LastUpdate | undefined]> = [
    ['none', 'No last update', undefined],
    ['not-checked', 'Not checked', { ...base, check: 'not-checked', done: 0 }],
    ['checking', 'Checking', { ...base, check: 'checking', done: Math.min(1, total) }],
    ['cancelled', 'Cancelled part-way', { ...base, check: 'cancelled', done: Math.min(2, total) }],
    ['failed', 'Check failed', { ...base, check: 'failed', done: 0 }],
    ['done', 'Checked, changes', { ...base, check: 'done', done: total }],
    ['nothing', 'Nothing changed', { ...base, check: 'done', done: total, nothingChanged: true }],
  ];
  return <PreviewStates items={states.map(([id, label, next]) => ({ label, active: current === id, run: () => set(next) }))} note={total ? undefined : 'No roster uses this source, so the card shows no roster check.'} />;
}

function DataChangesView({ changes }: { changes: DataChanges }) {
  const [all, setAll] = useState(false);
  const groups: Array<{ label: string; sign: string; tone: Tone; items: string[] }> = [
    { label: 'Added', sign: '+', tone: 'ok', items: changes.added },
    { label: 'Changed', sign: '~', tone: 'accent', items: changes.changed },
    { label: 'Removed', sign: '−', tone: 'err', items: changes.removed },
  ];
  const count = groups.reduce((n, g) => n + g.items.length, 0);
  const hidden = groups.reduce((n, g) => n + Math.max(0, g.items.length - 2), 0);
  if (!count) return <p className="dtp-muted">No data files changed.</p>;
  return <div className="dts-data-changes">
    <div className="dts-counts">{groups.map(g => <div key={g.label} className={`dts-count ${g.tone}`}><b>{g.sign}{g.items.length}</b><span>{g.label}</span></div>)}</div>
    {groups.filter(g => g.items.length).map(g => <div key={g.label} className="dts-change-group"><h4>{g.label}</h4><ul>{(all ? g.items : g.items.slice(0, 2)).map(item => <li key={item}>{item}</li>)}</ul></div>)}
    {hidden > 0 && <button className="dts-text-btn" aria-expanded={all} onClick={() => setAll(v => !v)}>{all ? 'Show fewer' : `Show all ${count}`}</button>}
  </div>;
}

/** Update report in the detail pane: roster check results and the data changes of the last update. */
export function UpdateReportView({ sourceId, jobs, notify, go, onOpenRoster }: { sourceId: string; jobs: DesktopJobs; notify: Notify; go: Go; onOpenRoster?: (name: string) => void }) {
  const source = jobs.sources.find(s => s.id === sourceId);
  if (!source?.lastUpdate) return <section className="dtp-card dtp-detail dts-flow" aria-label="Update report">
    <BackButton label={source?.name ?? 'Add game data'} onClick={() => go(source?.id ?? 'add')} />
    <div className="dtp-empty"><FileText size={22} /><strong>This update report is no longer available</strong><p>Reports are kept for the last update of each source.</p></div>
    {source && <LastUpdateStates source={source} jobs={jobs} />}
  </section>;
  const u = source.lastUpdate;
  const total = source.rosters.length;
  const phase = phaseOf(source);
  const results = checkResults(source);
  const changed = results.filter(r => r.status !== 'unchanged');
  const unchanged = results.filter(r => r.status === 'unchanged');
  const removed = results.filter(r => r.status === 'faction-removed').length;
  const open = (name: string) => onOpenRoster ? onOpenRoster(name) : notify(`Opens “${name}” in a tab`);
  return <section className="dtp-card dtp-detail dts-flow dts-report" aria-label={`Update report for ${source.name}`}>
    <BackButton label={source.name} onClick={() => go(source.id)} />
    <span className="dtp-eyebrow">Update report</span>
    <div className="dtp-entry-title"><h2>{source.name} <span className="dts-versions">{u.from} → {u.to}</span></h2></div>
    <p className="dtp-muted">Updated {u.when} · {source.repo}</p>
    {phase === 'none' && <div className="dtp-notice accent"><Layers3 size={16} /><span><strong>No roster uses this data</strong><small>There is nothing to check. The data changes are below.</small></span></div>}
    {phase === 'checking' && <div className="dts-check-progress" aria-live="polite"><span><LoaderCircle size={15} className="dt-spin" />Checking rosters · {u.done} of {total}</span><i className="dtp-progress"><em style={{ width: `${total ? u.done / total * 100 : 0}%` }} /></i><button className="dtp-btn small" onClick={() => cancelCheck(jobs, source, notify)}>Cancel</button></div>}
    {(phase === 'not-checked' || phase === 'cancelled' || phase === 'failed') && <div className="dtp-notice accent"><ListChecks size={16} /><span><strong>The rosters have not been checked against the new data yet</strong><small>{phase === 'cancelled' ? `Stopped after ${u.done} of ${total}. ` : ''}The check finds removed entries, changed totals and new errors in {plural(total, 'roster')}.</small></span><button className="dtp-btn primary small" onClick={() => startCheck(jobs, source.id)}>Check rosters</button></div>}
    {phase === 'failed' && <div className="dtp-notice err" role="alert"><OctagonAlert size={16} /><span><strong>The roster check stopped</strong><small>A roster file could not be read. Check again; the rosters stay as they are.</small></span></div>}
    {results.length > 0 && <div className="dts-chips report">
      <Chip>{plural(results.length, 'roster')}</Chip>
      <Chip tone="ok">{unchanged.length} unchanged</Chip>
      <Chip tone="warn">{changed.length - removed} changed</Chip>
      {removed > 0 && <Chip tone="err">{removed} faction removed</Chip>}
    </div>}
    {phase === 'done' && !changed.length && <div className="dtp-notice ok"><Check size={16} /><span><strong>No rosters changed</strong><small>Every roster has the same entries, totals and errors with the new data.</small></span></div>}
    <div className="dts-report-grid">
      {results.length > 0 && <div>
        {changed.length > 0 && <><h3>Changed rosters</h3><div className="dts-changed">{changed.map(r => <article key={r.name} className={`dts-changed-card ${r.status === 'faction-removed' ? 'err' : 'warn'}`}>
          <header>{r.status === 'faction-removed' ? <OctagonAlert size={15} /> : <AlertTriangle size={15} />}<strong>{r.name}</strong><Chip tone={r.status === 'faction-removed' ? 'err' : 'warn'}>{r.status === 'faction-removed' ? 'Faction removed' : 'Changed by update'}</Chip><button className="dtp-btn small" aria-label={`Open ${r.name}`} onClick={() => open(r.name)}>Open</button></header>
          {r.lines.length > 0 && <ul>{r.lines.map(line => <li key={line}>{line}</li>)}</ul>}
        </article>)}</div></>}
        {unchanged.length > 0 && <><h3>Unchanged rosters</h3><div className="dtp-links">{unchanged.map(r => <button key={r.name} aria-label={`Open ${r.name}`} onClick={() => open(r.name)}><Layers3 size={14} />{r.name}<ChevronRight size={14} /></button>)}</div></>}
      </div>}
      <div><h3>Data changes</h3><DataChangesView changes={dataChanges[source.id] ?? { added: [], changed: [], removed: [] }} /></div>
    </div>
    <LastUpdateStates source={source} jobs={jobs} />
  </section>;
}

/* ---------------------- Add game data: collections ---------------------- */

/** The collections part of Add game data: the default collection's supported sources and saved collections. */
export function AddDataCollections({ jobs, go, onOpenJobs }: { jobs: DesktopJobs; go: Go; onOpenJobs: () => void }) {
  const store = useFlowStore();
  const def = sourceCollections.default;
  const saved = store.saved.map(s => pageOf(s.id, store)).filter((p): p is CollectionPage => !!p);
  return <>
    {!store.hidden && <>
      <div className="dts-section-head"><h3>Default collection</h3><button className="dts-text-btn" onClick={() => go('collection:default')}>Show all {def.listings.filter(l => !l.archived).length}<ChevronRight size={13} /></button></div>
      <div className="dtp-rows">{def.listings.filter(l => l.supported).map(l => <ListingRow key={l.id} listing={l} jobs={jobs} go={go} onOpenJobs={onOpenJobs} compact />)}</div>
    </>}
    {saved.length > 0 && <><h3>Your collections</h3>{saved.map(p => <EntryRow key={p.id} page={p} onOpen={() => go(`collection:${p.id}`)} />)}</>}
    {store.hidden && <button className="dtp-link-row" onClick={() => setFlowStore({ hidden: false })}><Layers3 size={16} /><span><strong>Show the default collection</strong><small>You hid it. It lists sources tested with this app.</small></span><ChevronRight size={15} /></button>}
  </>;
}

type PageState = 'live' | 'loading' | 'cached' | 'failed' | 'empty';

/** A collection or library page: search, source rows with their actions, archived toggle, nested entries and the ⋯ menu. */
export function CollectionView({ pageId, jobs, notify, go, onOpenJobs }: { pageId: string; jobs: DesktopJobs; notify: Notify; go: Go; onOpenJobs: () => void }) {
  const store = useFlowStore();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<PageState>('live');
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const page = pageOf(pageId, store);
  if (!page) return <section className="dtp-card dtp-detail dts-flow" aria-label="Collection"><BackButton label="Add game data" onClick={() => go('add')} /><div className="dtp-empty"><Inbox size={22} /><strong>This collection is no longer in your list</strong><p>Add it again from Add game data.</p></div></section>;
  const saved = store.saved.some(s => s.id === page.id);
  const parent = page.parent ? sourceCollections[page.parent] : undefined;
  const library = page.kind === 'library';
  const listings = state === 'empty' || state === 'loading' ? [] : page.listings;
  const archived = listings.filter(l => l.archived).length;
  const q = query.trim().toLowerCase();
  const rows = listings.filter(l => (store.showArchived || !l.archived) && (!q || `${l.name} ${l.repo} ${l.description}`.toLowerCase().includes(q)));
  const refresh = () => { setRefreshing(true); clearTimeout(timer.current); timer.current = window.setTimeout(() => { setRefreshing(false); setState('live'); notify(`${page.name} refreshed`); }, 900); };
  const menu: MenuItem[] = [
    { label: 'Refresh', icon: <RefreshCcw size={14} />, run: refresh },
    { label: 'Copy link', icon: <Copy size={14} />, run: () => { navigator.clipboard?.writeText(page.link).catch(() => undefined); notify('Link copied'); } },
    ...(page.id === 'default' ? [{ label: 'Hide collection', icon: <EyeOff size={14} />, run: () => { setFlowStore({ hidden: true }); go('add'); notify('The default collection is hidden. Show it again from Add game data.', { action: { label: 'Undo', run: () => setFlowStore({ hidden: false }) } }); } }] : []),
    ...(saved ? [{ label: 'Remove collection', icon: <Trash2 size={14} />, danger: true, run: () => { const before = flowStore.saved; setFlowStore({ saved: before.filter(s => s.id !== page.id) }); go('add'); notify(`Removed ${page.name}. Installed game data stays.`, { action: { label: 'Undo', run: () => setFlowStore({ saved: before }) } }); } }] : []),
  ];
  return <section className="dtp-card dtp-detail dts-flow" aria-label={page.name}>
    <BackButton label={parent?.name ?? 'Add game data'} onClick={() => go(parent ? `collection:${parent.id}` : 'add')} />
    <div className="dts-title">
      <span className="dts-tile">{library ? <LibraryBig size={18} /> : <Layers3 size={18} />}</span>
      <div><span className="dtp-eyebrow">{library ? page.by : `Collection · by ${page.by}`}</span><h2>{page.name}</h2></div>
      <MoreMenu label={`More actions for ${page.name}`} items={menu} />
    </div>
    <p className="dtp-body-text">{page.description}</p>
    <p className="dts-meta"><Link2 size={12} /><span className="dtp-mono">{page.link}</span><span aria-hidden="true">·</span>{refreshing ? <span role="status"><LoaderCircle size={12} className="dt-spin" />Refreshing…</span> : <span>{state === 'cached' || state === 'failed' ? `Kept copy from ${page.updated}` : `Updated ${page.updated}`}</span>}</p>
    {state === 'cached' && <div className="dtp-notice warn"><CloudOff size={16} /><span><strong>Showing the copy from {page.updated}</strong><small>No connection. Installing needs one.</small></span></div>}
    {state === 'failed' && <div className="dtp-notice err" role="alert"><AlertTriangle size={16} /><span><strong>The {library ? 'repositories' : 'collection'} could not be refreshed</strong><small>GitHub did not answer. The copy from {page.updated} is shown.</small></span><button className="dtp-btn small" onClick={refresh} disabled={refreshing}>{refreshing ? 'Retrying…' : 'Retry'}</button></div>}
    {state === 'loading' && <Skeleton />}
    {state === 'empty' && <div className="dtp-empty"><Inbox size={22} /><strong>{library ? 'No repositories here yet' : 'This collection lists no sources yet'}</strong><p>Refresh later, or add game data another way.</p></div>}
    {listings.length > 0 && <>
      {listings.length > 5 && <div className="dts-list-tools"><label className="dtp-search"><Search size={15} /><input placeholder={`Search ${plural(listings.length, library ? 'repository' : 'source', library ? 'repositories' : 'sources')}`} aria-label={`Search ${page.name}`} value={query} onChange={e => setQuery(e.target.value)} />{query && <button aria-label="Clear search" title="Clear search" onClick={() => setQuery('')}><X size={13} /></button>}</label><span className="dtp-muted">{plural(rows.length, library ? 'repository' : 'source', library ? 'repositories' : 'sources')}</span></div>}
      {rows.length > 0 ? <div className="dtp-rows">{rows.map(l => <ListingRow key={l.id} listing={l} jobs={jobs} go={go} onOpenJobs={onOpenJobs} />)}</div>
        : q ? <div className="dtp-empty"><Search size={22} /><strong>No repository matches “{query.trim()}”</strong><p>Enter its address on Add game data if you know it.</p><button className="dtp-btn" onClick={() => setQuery('')}>Clear search</button></div> : null}
      {archived > 0 && <ArchivedToggle count={archived} />}
    </>}
    {page.entries.length > 0 && state !== 'empty' && state !== 'loading' && <><h3>Listed here</h3>{page.entries.map(id => <EntryRow key={id} page={sourceCollections[id]} onOpen={() => go(`collection:${id}`)} />)}</>}
    <p className="dts-note">Collections only list repositories. Nothing is downloaded until you install.</p>
    <PreviewStates items={([['live', 'Loaded'], ['loading', 'Loading'], ['cached', 'Offline · kept copy'], ['failed', 'Refresh failed'], ['empty', 'Empty']] as Array<[PageState, string]>).map(([id, label]) => ({ label, active: state === id, run: () => setState(id) }))} />
  </section>;
}

/* ------------------------------ GitHub search ------------------------------ */

type SearchResult = { query: string; listings: Listing[]; error?: boolean };

/** GitHub-wide repository search: runs on submit; archived results sit behind a toggle. */
export function GitHubSearchView({ jobs, go, onOpenJobs }: { jobs: DesktopJobs; go: Go; onOpenJobs: () => void }) {
  const store = useFlowStore();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | undefined>();
  const [searching, setSearching] = useState(false);
  const timer = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus({ preventScroll: true }); return () => clearTimeout(timer.current); }, []);
  const search = (q = query.trim(), fail = false) => {
    if (!q) return;
    clearTimeout(timer.current);
    setSearching(true);
    timer.current = window.setTimeout(() => {
      const words = q.toLowerCase().split(/\s+/);
      setResult(fail ? { query: q, listings: [], error: true } : { query: q, listings: githubRepositories.filter(r => words.every(w => `${r.name} ${r.repo} ${r.description}`.toLowerCase().includes(w))) });
      setSearching(false);
    }, 700);
  };
  const run = (q: string, fail = false) => { setQuery(q); search(q, fail); };
  const archived = result?.listings.filter(l => l.archived).length ?? 0;
  const rows = result?.listings.filter(l => store.showArchived || !l.archived) ?? [];
  return <section className="dtp-card dtp-detail dts-flow" aria-label="Search GitHub">
    <BackButton label="Add game data" onClick={() => go('add')} />
    <div className="dts-title"><span className="dts-tile"><Github size={18} /></span><div><span className="dtp-eyebrow">Add game data</span><h2>Search GitHub</h2></div></div>
    <form className="dtp-inline-form dts-search-form" role="search" onSubmit={e => { e.preventDefault(); search(); }}>
      <label className="dtp-search"><Search size={15} /><input ref={input} placeholder="Repository name or topic" aria-label="Search GitHub repositories" value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="Clear search" title="Clear search" onClick={() => { setQuery(''); input.current?.focus(); }}><X size={13} /></button>}</label>
      <button className="dtp-btn primary" type="submit" disabled={!query.trim() || searching}>{searching ? <><LoaderCircle size={14} className="dt-spin" />Searching…</> : 'Search'}</button>
    </form>
    <p className="dts-help">Press Enter to search. Results are repositories that may hold game data; check them before you install.</p>
    {result?.error && <div className="dtp-notice err" role="alert"><AlertTriangle size={16} /><span><strong>The search did not finish</strong><small>GitHub did not answer the search.</small></span><button className="dtp-btn small" disabled={searching} onClick={() => search(result.query)}>{searching ? 'Retrying…' : 'Retry'}</button></div>}
    {searching && !result ? <Skeleton />
      : !result ? <div className="dtp-empty"><Github size={22} /><strong>Search all of GitHub</strong><p>Type a name and press Enter. Try “field” or “example”.</p></div>
        : !result.error && !result.listings.length ? <div className="dtp-empty"><Search size={22} /><strong>No repository matches “{result.query}”</strong><p>Try another name, or enter the repository on Add game data.</p><button className="dtp-btn" onClick={() => go('add')}>Enter a repository link</button></div>
          : rows.length > 0 ? <><p className="dts-count-line" aria-live="polite">{plural(rows.length, 'repository', 'repositories')} for “{result.query}”{searching ? ' · searching…' : ''}</p><div className="dtp-rows">{rows.map(l => <ListingRow key={l.id} listing={l} jobs={jobs} go={go} onOpenJobs={onOpenJobs} />)}</div></> : null}
    {archived > 0 && <ArchivedToggle count={archived} />}
    <PreviewStates items={[
      { label: 'Prompt', active: !result && !searching, run: () => { clearTimeout(timer.current); setSearching(false); setResult(undefined); setQuery(''); } },
      { label: 'Results', active: !!result && !result.error && result.listings.length > 0, run: () => run('field') },
      { label: 'No results', active: !!result && !result.error && !result.listings.length, run: () => run('lighthouse') },
      { label: 'Error', active: !!result?.error, run: () => run(query.trim() || 'field', true) },
    ]} />
  </section>;
}

/* ------------------------- Add a collection dialog ------------------------- */

type AddPhase = { kind: 'idle' } | { kind: 'finding' } | { kind: 'found'; saved: Saved; page: CollectionPage } | { kind: 'error'; text: string } | { kind: 'repository'; repo: string };

/** What a pasted link is: a collection file, a GitHub organisation or user, a repository, or nothing usable. */
function readLink(raw: string): AddPhase {
  const path = raw.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
  const known = (link: string) => link === sourceCollections.default.link || flowStore.saved.some(s => s.link === link);
  if (/\.json$/i.test(path)) {
    const link = `https://${path}`;
    if (known(link)) return { kind: 'error', text: 'This collection is already in your list.' };
    const file = path.split('/').pop()!.replace(/\.json$/i, '');
    return { kind: 'found', saved: { id: `saved-${file.toLowerCase()}`, name: titleCase(file), kind: 'collection', link }, page: sourceCollections['community-picks'] };
  }
  const github = path.match(/^github\.com\/([\w.-]+)(?:\/([\w.-]+))?/i);
  if (github?.[2]) return { kind: 'repository', repo: `${github[1]}/${github[2]}` };
  if (github) {
    const link = `https://github.com/${github[1]}`;
    if (known(link)) return { kind: 'error', text: 'This library is already in your list.' };
    return { kind: 'found', saved: { id: `saved-${github[1].toLowerCase()}`, name: github[1] === 'example' ? 'Example Data Org' : github[1], kind: 'library', link }, page: sourceCollections['example-org'] };
  }
  if (/^[\w-]+\/[\w.-]+$/.test(path)) return { kind: 'repository', repo: path };
  return { kind: 'error', text: 'That link does not lead to a collection file or a GitHub organisation.' };
}

/** Focus moves into the dialog, Tab stays inside, Escape closes, focus returns to the opener. */
function useDialogFocus(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLInputElement>('input')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const nodes = Array.from(ref.current.querySelectorAll<HTMLElement>('button, input, summary')).filter(el => !el.hasAttribute('disabled') && el.getClientRects().length > 0 && !el.closest('details:not([open]) > :not(summary)'));
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [ref]);
}

export function AddCollectionDialog({ jobs, notify, go, onOpenJobs, onClose }: { jobs: DesktopJobs; notify: Notify; go: Go; onOpenJobs: () => void; onClose: () => void }) {
  const [value, setValue] = useState('');
  const [phase, setPhase] = useState<AddPhase>({ kind: 'idle' });
  const dialog = useRef<HTMLElement>(null);
  const timer = useRef(0);
  useDialogFocus(dialog, onClose);
  useEffect(() => () => clearTimeout(timer.current), []);
  const find = (link = value, offline = false) => {
    clearTimeout(timer.current);
    if (!link.trim()) return;
    const next = readLink(link);
    if (next.kind !== 'found' && !offline) return setPhase(next);
    setPhase({ kind: 'finding' });
    timer.current = window.setTimeout(() => setPhase(offline ? { kind: 'error', text: 'GitHub did not answer. Check the connection and try again.' } : next), 650);
  };
  const preview = (link: string, offline = false) => { setValue(link); find(link, offline); };
  const add = () => {
    if (phase.kind !== 'found') return;
    setFlowStore({ saved: [...flowStore.saved, phase.saved] });
    onClose();
    go(`collection:${phase.saved.id}`);
    notify(`Added ${phase.saved.name}`);
  };
  const installIt = () => {
    if (phase.kind !== 'repository') return;
    const known = githubRepositories.find(r => r.repo === phase.repo);
    const id = known?.id ?? phase.repo.split('/')[1].toLowerCase();
    const name = known?.name ?? titleCase(phase.repo.split('/')[1]);
    onClose();
    if (jobs.sources.some(s => s.id === id)) { go(id); notify(`${name} is already installed`); return; }
    jobs.startInstall({ id, name, factions: known?.factions ?? ['Wardens', 'Wayfarers'], size: known?.size ?? '3.4 MB' });
    onOpenJobs();
  };
  const error = phase.kind === 'error' ? phase.text : '';
  return <div className="dt-modal-scrim" onClick={onClose}>
    <section ref={dialog} className="dt-modal dts-dialog" role="dialog" aria-modal="true" aria-labelledby="dts-add-title" onClick={e => e.stopPropagation()}>
      <header><div><h2 id="dts-add-title">Add a collection or library</h2><p>Lists of repositories to install from</p></div><button className="dtp-icon" aria-label="Close dialog" title="Close" onClick={onClose}><X size={16} /></button></header>
      <form onSubmit={e => { e.preventDefault(); find(); }}>
        <label className="dts-field-label" htmlFor="dts-add-link">Collection or library link</label>
        <div className="dtp-inline-form">
          <span className={`dtp-search ${error ? 'invalid' : ''}`}><Link2 size={15} /><input id="dts-add-link" placeholder="https://… or github.com/name" value={value} aria-invalid={!!error} aria-describedby="dts-add-help" autoComplete="off" spellCheck={false} onChange={e => { setValue(e.target.value); clearTimeout(timer.current); setPhase({ kind: 'idle' }); }} /></span>
          <button className="dtp-btn" type="submit" disabled={!value.trim() || phase.kind === 'finding'}>{phase.kind === 'finding' ? <><LoaderCircle size={14} className="dt-spin" />Finding…</> : <><Search size={14} />Find</>}</button>
        </div>
        <small id="dts-add-help" className={error ? 'dts-error' : 'dts-help'} role={error ? 'alert' : undefined}>{error || 'A collection file (.json) or a GitHub organisation or user (github.com/name).'}</small>
      </form>
      {phase.kind === 'found' && <div className="dts-found">
        <span className="dts-tile">{phase.saved.kind === 'library' ? <LibraryBig size={18} /> : <Layers3 size={18} />}</span>
        <span><strong>{phase.saved.name}</strong><small>{phase.saved.kind === 'library' ? `GitHub organisation · ${plural(phase.page.listings.length, 'repository', 'repositories')}` : `Collection · by ${phase.page.by} · ${plural(phase.page.listings.length, 'source')}`}</small><p>{phase.page.description}</p></span>
      </div>}
      {phase.kind === 'repository' && <div className="dtp-notice accent"><Github size={16} /><span><strong>That is a repository, not a collection</strong><small>{phase.repo} · Install it directly instead.</small></span><button className="dtp-btn primary small" onClick={installIt}><ArrowDownToLine size={13} />Install it</button></div>}
      <p className="dts-note">Collections only list repositories. Nothing is downloaded until you install.</p>
      <footer><button className="dtp-btn" onClick={onClose}>Cancel</button><button className="dtp-btn primary" disabled={phase.kind !== 'found'} onClick={add}>Add collection</button></footer>
      <PreviewStates items={[
        { label: 'Collection link', run: () => preview('https://example.org/community-picks.json') },
        { label: 'Library', run: () => preview('github.com/example') },
        { label: 'Repository', run: () => preview('github.com/example-user/field-notes') },
        { label: 'Already added', run: () => preview(sourceCollections.default.link) },
        { label: 'Not a collection', run: () => preview('example.org/readme') },
        { label: 'No connection', run: () => preview(value.trim() || 'github.com/example', true) },
      ]} />
    </section>
  </div>;
}
