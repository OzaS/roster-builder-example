import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowDownToLine, ArrowRight, ArrowUpCircle, BookOpen, Check, ChevronRight, CircleAlert, Copy, Database, ExternalLink, FileUp, FolderOpen, Github, HardDrive, Info, Keyboard, Languages, Layers3, Link2, ListFilter, Palette, Pencil, Plus, RefreshCcw, Search, Shield, SlidersHorizontal, Trash2, Upload, Users, X } from 'lucide-react';
import type { ColorScheme } from '../../types';
import { collectionSources, colourSchemes, installedSources, lookupEntries, rosterLibrary, type LookupKind, type RosterSummary, type SourceInfo } from './desktopData';
import { comboFromEvent, defaultBindings, formatCombo, hasCommandModifier, keyActions, type KeyAction, type KeyBindings } from './desktopKeys';
import { jobPercent, type WorkspaceJobs } from '../workspace/Jobs';
import { Chip, PageActions, Segmented, Switch } from '../workspace/Primitives';
import type { Notify } from '../workspace/Toasts';
import './desktop-pages.css';
import { AddCollectionDialog, AddDataCollections, CollectionView, GitHubSearchView, LastUpdateCard, LastUpdateStates, UpdateReportView, flowSourceId, isAddFlow, useRosterChecks } from './DesktopSourceFlows';


const statusChip = (r: RosterSummary) => r.status === 'issues' ? <Chip tone="warn"><AlertTriangle size={11} />{r.issues} {r.issues === 1 ? 'issue' : 'issues'}</Chip>
  : r.status === 'data-changed' ? <Chip tone="accent">Data changed</Chip>
    : r.status === 'faction-removed' ? <Chip tone="err">Faction removed</Chip>
      : <Chip tone="ok"><Check size={11} />Ready</Chip>;

/* ------------------------------ Rosters ------------------------------ */

export function DesktopRosters({ initialRosters, onOpen, onCreate, onImport, notify, actionSlot }: { initialRosters: RosterSummary[]; onOpen: (name: string) => void; onCreate: () => void; onImport: () => void; notify: Notify; actionSlot: HTMLElement | null }) {
  const [rosters, setRosters] = useState(initialRosters);
  const [query, setQuery] = useState('');
  const [attention, setAttention] = useState(false);
  const [system, setSystem] = useState('All game systems');
  const [sort, setSort] = useState('Recently opened');
  const [selected, setSelected] = useState(initialRosters[0]?.name ?? '');
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const needsAttention = (r: RosterSummary) => r.status === 'data-changed' || r.status === 'faction-removed';
  const visible = useMemo(() => {
    const list = rosters.filter(r => (r.name + r.faction).toLowerCase().includes(query.toLowerCase()) && (!attention || needsAttention(r)) && (system === 'All game systems' || r.system === system));
    if (sort === 'Name') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'Points') return [...list].sort((a, b) => b.used - a.used);
    return list;
  }, [rosters, query, attention, system, sort]);
  const current = rosters.find(r => r.name === selected);
  useEffect(() => { setRenaming(false); setConfirmDelete(false); }, [selected]);
  const attentionCount = rosters.filter(needsAttention).length;
  const duplicate = (r: RosterSummary) => { const copy = { ...r, name: `Copy of ${r.name}`, opened: 'Just now', mark: r.mark }; setRosters(list => [copy, ...list]); setSelected(copy.name); notify(`Duplicated as “${copy.name}”`); };
  const remove = (r: RosterSummary) => { const before = rosters; setRosters(list => list.filter(x => x.name !== r.name)); setSelected(rosters.find(x => x.name !== r.name)?.name ?? ''); notify(`Deleted “${r.name}”`, { action: { label: 'Undo', run: () => { setRosters(before); setSelected(r.name); } } }); };
  return <main className="dtp-page">
    <PageActions slot={actionSlot}>
      <button className="dtp-btn" onClick={onImport} title="Import a roster from a file"><FileUp size={15} />Import</button>
      <button className="dtp-btn primary" onClick={onCreate} title="Create a roster"><Plus size={15} />New roster</button>
    </PageActions>
    <div className="dtp-toolbar">
      <label className="dtp-search"><Search size={15} /><input placeholder="Find a roster or faction…" aria-label="Find a roster" value={query} onChange={e => setQuery(e.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={13} /></button>}</label>
      <div className="dtp-chips"><button className={!attention ? 'active' : ''} onClick={() => setAttention(false)}>All <b>{rosters.length}</b></button>{attentionCount > 0 && <button className={attention ? 'active' : ''} onClick={() => setAttention(true)}><CircleAlert size={13} />Needs attention <b>{attentionCount}</b></button>}</div>
      <label className="dtp-select"><ListFilter size={14} /><select aria-label="Game system" value={system} onChange={e => setSystem(e.target.value)}>{['All game systems', 'Open Field', 'Example System Two'].map(s => <option key={s}>{s}</option>)}</select></label>
      <label className="dtp-select"><SlidersHorizontal size={14} /><select aria-label="Sort rosters" value={sort} onChange={e => setSort(e.target.value)}>{['Recently opened', 'Name', 'Points'].map(s => <option key={s}>{s}</option>)}</select></label>
    </div>
    <div className="dtp-split">
      <section className="dtp-card dtp-list" aria-label="Rosters">
        <div className="dtp-table-head dtp-roster-grid"><span>Roster</span><span>Points</span><span>Status</span><span>Opened</span></div>
        <div className="dtp-scroll">
          {visible.map((r, i) => <button key={r.name} className={`dtp-row dtp-roster-grid ${r.name === selected ? 'selected' : ''}`} onClick={() => setSelected(r.name)} onDoubleClick={() => onOpen(r.name)}>
            <span className="dtp-name"><span className={`dt-monogram tone-${i % 4}`}>{r.mark}</span><span><strong>{r.name}</strong><small>{r.faction} · {r.system}</small></span></span>
            <span className={`dtp-points ${r.used > r.limit ? 'over' : ''}`}><b>{r.used.toLocaleString()}</b> / {r.limit.toLocaleString()}<i><em style={{ width: `${Math.min(r.used / r.limit * 100, 100)}%` }} /></i></span>
            <span>{statusChip(r)}</span>
            <span className="dtp-muted">{r.opened}</span>
          </button>)}
          {!rosters.length && <div className="dtp-empty"><Layers3 size={22} /><strong>No rosters yet</strong><p>Create a roster, or import one from a file.</p><span className="dtp-row-actions"><button className="dtp-btn primary" onClick={onCreate}><Plus size={15} />New roster</button><button className="dtp-btn" onClick={onImport}><FileUp size={15} />Import</button></span></div>}
          {rosters.length > 0 && !visible.length && <div className="dtp-empty"><Search size={22} /><strong>No rosters match</strong><p>Try another name, or clear the filters.</p><button className="dtp-btn" onClick={() => { setQuery(''); setAttention(false); setSystem('All game systems'); }}>Clear filters</button></div>}
        </div>
        <footer className="dtp-list-foot">{rosters.length} rosters stored on this device · double-click a roster to open it in a tab</footer>
      </section>
      <aside className="dtp-card dtp-detail" aria-label="Roster details">{current ? <>
        <div className="dtp-detail-title">
          <span className="dt-monogram tone-0">{current.mark}</span>
          {renaming ? <form onSubmit={e => { e.preventDefault(); const v = (new FormData(e.currentTarget).get('name') as string).trim(); if (v) { setRosters(list => list.map(r => r.name === current.name ? { ...r, name: v } : r)); setSelected(v); } setRenaming(false); }}><input name="name" autoFocus maxLength={60} defaultValue={current.name} aria-label="Roster name" /><button className="dtp-btn small" type="submit">Save</button></form>
            : <div><h2>{current.name}</h2><p>{current.faction} · {current.system}</p></div>}
          {!renaming && <button className="dtp-icon" aria-label="Rename roster" title="Rename" onClick={() => setRenaming(true)}><Pencil size={14} /></button>}
        </div>
        <div className="dtp-budget"><strong className={current.used > current.limit ? 'over' : ''}>{current.used.toLocaleString()} <small>/ {current.limit.toLocaleString()} pts</small></strong><i><em style={{ width: `${Math.min(current.used / current.limit * 100, 100)}%` }} /></i><span>{current.used > current.limit ? `${current.used - current.limit} points over limit` : `${current.limit - current.used} points available`}</span></div>
        <dl className="dtp-facts"><div><dt>Forces</dt><dd>{current.forces}</dd></div><div><dt>Units</dt><dd>{current.units}</dd></div><div><dt>Game data</dt><dd>{current.system} {current.system === 'Open Field' ? 'v1.4' : 'v3.0.2'}</dd></div><div><dt>Last opened</dt><dd>{current.opened}</dd></div></dl>
        {current.status === 'ready' ? <div className="dtp-notice ok"><Shield size={16} /><span><strong>Ready</strong><small>All roster requirements met.</small></span></div>
          : current.status === 'issues' ? <div className="dtp-notice warn"><AlertTriangle size={16} /><span><strong>{current.issues} {current.issues === 1 ? 'item needs' : 'items need'} attention</strong><small>{current.used > current.limit ? 'Over the points limit.' : 'Roster requirements not met.'}</small></span></div>
            : <div className="dtp-notice err"><CircleAlert size={16} /><span><strong>{current.status === 'data-changed' ? 'Game data changed' : 'Faction removed'}</strong><small>{current.status === 'data-changed' ? 'Some entries changed in the last update. Open to review them.' : 'The faction is no longer in the installed data. The roster opens read-only.'}</small></span></div>}
        <div className="dtp-detail-actions">
          <button className="dtp-btn primary wide" onClick={() => onOpen(current.name)}>Open roster<ArrowRight size={15} /></button>
          <button className="dtp-btn" onClick={() => duplicate(current)}><Copy size={14} />Duplicate</button>
          <button className="dtp-btn" onClick={() => notify(`“${current.name}” exported`)}><ArrowDownToLine size={14} />Export</button>
          <button className={`dtp-btn danger ${confirmDelete ? 'confirm' : ''}`} onClick={() => confirmDelete ? remove(current) : setConfirmDelete(true)}><Trash2 size={14} />{confirmDelete ? 'Delete for good?' : 'Delete'}</button>
        </div>
      </> : <div className="dtp-empty"><Layers3 size={22} /><strong>No roster selected</strong><p>Choose a roster to see its details.</p></div>}</aside>
    </div>
  </main>;
}

/* ------------------------------ Lookup ------------------------------ */

export function DesktopLookup({ onOpenRoster }: { onOpenRoster: (name: string) => void }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('All sources');
  const [selectedId, setSelectedId] = useState(lookupEntries[0].id);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { searchRef.current?.focus({ preventScroll: true }); }, []);
  const scopes = ['All sources', 'Frontier Coalition', 'Free Cities', 'Core rules'];
  const results = lookupEntries.filter(e => (e.name + ' ' + e.text + ' ' + e.meta).toLowerCase().includes(query.toLowerCase()) && (scope === 'All sources' || e.owner.includes(scope) || (scope === 'Frontier Coalition' && e.kind === 'Equipment')));
  const selected = results.find(e => e.id === selectedId) ?? results[0];
  const groups: Array<{ kind: LookupKind; label: string; icon: ReactNode }> = [{ kind: 'Unit', label: 'Units', icon: <Users size={14} /> }, { kind: 'Rule', label: 'Rules', icon: <BookOpen size={14} /> }, { kind: 'Equipment', label: 'Equipment', icon: <Shield size={14} /> }];
  return <main className="dtp-page">
    <div className="dtp-toolbar">
      <label className="dtp-search large"><Search size={17} /><input ref={searchRef} placeholder="Search units, rules and equipment in the installed data…" aria-label="Search game data" value={query} onChange={e => setQuery(e.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}</label>
    </div>
    <div className="dtp-toolbar tight"><span className="dtp-muted">Open Field v1.4</span><div className="dtp-chips">{scopes.map(s => <button key={s} className={scope === s ? 'active' : ''} onClick={() => setScope(s)}>{s}</button>)}</div><span className="dtp-muted dtp-push">{results.length} results</span></div>
    <div className="dtp-split lookup">
      <section className="dtp-card dtp-list" aria-label="Results"><div className="dtp-scroll">
        {groups.map(g => { const items = results.filter(e => e.kind === g.kind); return items.length ? <div className="dtp-group" key={g.kind}><h3>{g.icon}{g.label}<span>{items.length}</span></h3>{items.map(e => <button key={e.id} className={`dtp-row dtp-result ${selected?.id === e.id ? 'selected' : ''}`} onClick={() => setSelectedId(e.id)}><span><strong>{e.name}</strong><small>{e.owner} · {e.meta}</small></span>{e.badge ? <Chip>{e.badge}</Chip> : <b className="dtp-cost">{e.cost}{e.cost && /^\d/.test(e.cost) && <small> pts</small>}</b>}</button>)}</div> : null; })}
        {!results.length && <div className="dtp-empty"><Search size={22} /><strong>Nothing found for “{query}”</strong><p>Check the spelling or search all sources.</p>{scope !== 'All sources' && <button className="dtp-btn" onClick={() => setScope('All sources')}>Search all sources</button>}</div>}
      </div></section>
      <article className="dtp-card dtp-detail lookup-detail" aria-label="Entry details">{selected ? <>
        <span className="dtp-eyebrow">{selected.kind} <span>/</span> {selected.meta}</span>
        <div className="dtp-entry-title"><h2>{selected.name}</h2>{selected.cost && <strong>{selected.cost}{/^\d/.test(selected.cost) && <small> pts</small>}</strong>}</div>
        <p className="dtp-muted">{selected.owner} · {selected.source} v1.4</p>
        {selected.conditional && <div className="dtp-notice accent"><Info size={15} /><span><small>{selected.conditional}</small></span></div>}
        {selected.profile && <><h3>Profile</h3><table className="dt-profile dtp-profile"><thead><tr>{['Move', 'Defence', 'Resolve', 'Health'].map(v => <th key={v}>{v}</th>)}</tr></thead><tbody><tr>{selected.profile.map((v, i) => <td key={i}>{v}</td>)}</tr></tbody></table></>}
        <h3>{selected.kind === 'Unit' ? 'Description' : selected.kind === 'Rule' ? 'Rule text' : 'Characteristics'}</h3>
        <p className="dtp-body-text">{selected.text}</p>
        {selected.kind === 'Unit' && <><h3>Rules</h3><div className="dtp-tags"><Chip>Steady advance</Chip><Chip>Forward deployment</Chip></div></>}
        {selected.usedIn?.length ? <><h3>In your rosters</h3><div className="dtp-links">{selected.usedIn.map(r => <button key={r} onClick={() => onOpenRoster(r)}><Layers3 size={14} />{r}<ChevronRight size={14} /></button>)}</div></> : null}
      </> : <div className="dtp-empty"><BookOpen size={22} /><strong>Select a result</strong></div>}</article>
    </div>
  </main>;
}

/* ------------------------------ Sources ------------------------------ */

export function DesktopSources({ notify, actionSlot, jobs, selectedId, onSelect, onOpenJobs, onOpenRoster }: { notify: Notify; actionSlot: HTMLElement | null; jobs: WorkspaceJobs; selectedId: string; onSelect: (id: string) => void; onOpenJobs: () => void; onOpenRoster?: (name: string) => void }) {
  const { sources, setSources } = jobs;
  const setSelectedId = onSelect;
  const progress: Record<string, number> = Object.fromEntries(sources.flatMap(s => { const p = jobs.progressOf(s.id); return p ? [[s.id, p.percent]] : []; }));
  const [link, setLink] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [addingCollection, setAddingCollection] = useState(false);
  useEffect(() => { setConfirmRemove(false); }, [selectedId]);
  useRosterChecks(jobs, notify, setSelectedId);
  const update = (ids: string[]) => { jobs.startUpdate(ids); onOpenJobs(); };
  const installing = jobs.jobs.filter(j => j.kind === 'install' && (j.status === 'running' || j.status === 'needs-you') && !sources.some(s => s.id === j.sourceId));
  const updates = sources.filter(s => s.next && progress[s.id] === undefined);
  const selected = sources.find(s => s.id === selectedId);
  const flow = { jobs, notify, go: setSelectedId, onOpenJobs };
  const chip = (s: SourceInfo) => progress[s.id] !== undefined ? <Chip tone="accent">Updating {progress[s.id]}%</Chip> : s.status === 'update' ? <Chip tone="accent"><ArrowUpCircle size={11} />Update</Chip> : s.status === 'review' ? <Chip tone="warn"><AlertTriangle size={11} />Review</Chip> : <Chip tone="ok"><Check size={11} />Ready</Chip>;
  return <main className="dtp-page">
    <PageActions slot={actionSlot}>
      <button className="dtp-btn" onClick={() => notify('Choose an archive, data files or a folder')} title="Install game data from an archive, data files or a folder"><FolderOpen size={15} />Install from a file</button>
      <button className="dtp-btn primary" onClick={() => setSelectedId('add')} title="Install from a collection, a repository link or GitHub search"><Plus size={15} />Add game data</button>
    </PageActions>
    {updates.length > 0 && <div className="dtp-banner"><ArrowUpCircle size={17} /><span><strong>{updates.length} {updates.length === 1 ? 'update' : 'updates'} available</strong><small>New data for {updates.map(s => s.name).join(', ')}. Last checked 8 minutes ago.</small></span><button className="dtp-btn primary small" onClick={() => update(updates.map(s => s.id))}>Update all</button></div>}
    <div className="dtp-split sources">
      <section className="dtp-card dtp-list" aria-label="Installed sources"><div className="dtp-scroll">
        <div className="dtp-group"><h3><Database size={14} />Installed<span>{sources.length}</span></h3>
          {sources.map(s => <button key={s.id} className={`dtp-row dtp-source ${flowSourceId(selectedId) === s.id ? 'selected' : ''}`} onClick={() => setSelectedId(s.id)}>
            <span><strong>{s.name}</strong><small>{s.factions.length} factions · {s.factions.slice(0, 2).join(', ')}{s.factions.length > 2 ? '…' : ''}</small><small className="dtp-faint">{s.fromFile ? `From a file · imported ${s.installed}` : `${s.repo}@${s.version} · ${s.installed} · ${s.size}`}</small>{progress[s.id] !== undefined && <i className="dtp-progress"><em style={{ width: `${progress[s.id]}%` }} /></i>}</span>
            {chip(s)}
          </button>)}
          {installing.map(j => <button key={j.id} className="dtp-row dtp-source" onClick={onOpenJobs}><span><strong>{j.name}</strong><small>{j.status === 'needs-you' ? 'Waiting for you to choose factions' : `${j.factions.length} factions available`}</small><i className="dtp-progress"><em style={{ width: `${jobPercent(j)}%` }} /></i></span>{j.status === 'needs-you' ? <Chip tone="warn"><AlertTriangle size={11} />Needs you</Chip> : <Chip tone="accent">Installing {jobPercent(j)}%</Chip>}</button>)}
        </div>
        <button className={`dtp-row dtp-add-row ${isAddFlow(selectedId) ? 'selected' : ''}`} onClick={() => setSelectedId('add')}><span className="dtp-add-icon"><Plus size={16} /></span><span><strong>Add game data</strong><small>Collections, a repository link, or GitHub search</small></span><ChevronRight size={15} /></button>
      </div><footer className="dtp-list-foot"><RefreshCcw size={12} />Checked for updates 8 minutes ago<button onClick={() => notify('Checked for updates. Nothing new.')}>Check now</button></footer></section>
      {selectedId === 'add' ? <section className="dtp-card dtp-detail" aria-label="Add game data">
        <span className="dtp-eyebrow">Add game data</span><h2>Choose a game system</h2><p className="dtp-muted">Install from a collection, paste a repository link, or search GitHub.</p>
        <AddDataCollections jobs={jobs} go={setSelectedId} onOpenJobs={onOpenJobs} />
        <h3>Repository link</h3>
        <form className="dtp-inline-form" onSubmit={e => { e.preventDefault(); notify(link ? 'Looking up the repository…' : 'Paste a repository link first'); }}><label className="dtp-search"><Link2 size={15} /><input placeholder="https://github.com/owner/repository" aria-label="Repository link" value={link} onChange={e => setLink(e.target.value)} /></label><button className="dtp-btn" type="submit">Continue</button></form>
        <button className="dtp-link-row" onClick={() => setSelectedId('github')}><Github size={16} /><span><strong>Search GitHub</strong><small>Find data repositories by name</small></span><ChevronRight size={15} /></button>
        <button className="dtp-link-row" onClick={() => setAddingCollection(true)}><Plus size={16} /><span><strong>Add a collection or library</strong><small>Lists of sources kept by the community</small></span><ChevronRight size={15} /></button>
      </section> : selectedId === 'github' ? <GitHubSearchView {...flow} />
        : selectedId.startsWith('collection:') ? <CollectionView key={selectedId} pageId={selectedId.slice(11)} {...flow} />
          : selectedId.startsWith('report:') ? <UpdateReportView key={selectedId} sourceId={flowSourceId(selectedId)} onOpenRoster={onOpenRoster} {...flow} />
            : selected ? <section className="dtp-card dtp-detail" aria-label={`${selected.name} details`}>
        <span className="dtp-eyebrow">{selected.fromFile ? 'Installed from a file' : selected.repo}</span>
        <div className="dtp-entry-title"><h2>{selected.name}</h2>{chip(selected)}</div>
        <p className="dtp-muted">{selected.factions.length} factions · {selected.documents} documents · {selected.size}</p>
        {selected.next && progress[selected.id] === undefined && <div className="dtp-update-card"><div><ArrowUpCircle size={18} /><span><strong>Update available · {selected.version} → {selected.next}</strong><small>Changed upstream {selected.upstream}</small></span></div><ul><li><b>+2</b> units added</li><li><b>~5</b> costs changed</li><li><b>−1</b> rule removed</li></ul><div className="dtp-update-actions"><button className="dtp-btn primary" onClick={() => update([selected.id])}>Update</button><button className="dtp-btn" onClick={() => notify('Opens the repository in your browser')}><ExternalLink size={14} />View on GitHub</button></div></div>}
        {progress[selected.id] !== undefined && <div className="dtp-update-card"><div><RefreshCcw size={18} /><span><strong>Updating to {selected.next}</strong><small>Downloading and checking data · {progress[selected.id]}%</small></span></div><i className="dtp-progress"><em style={{ width: `${progress[selected.id]}%` }} /></i></div>}
        <LastUpdateCard source={selected} {...flow} />
        {selected.status === 'review' && <div className="dtp-notice warn"><AlertTriangle size={16} /><span><strong>3 import warnings</strong><small>Some entries reference missing data. Rosters still open; affected entries are marked.</small></span></div>}
        {!selected.next && selected.status === 'ready' && progress[selected.id] === undefined && <div className="dtp-notice ok"><Check size={16} /><span><strong>{selected.fromFile ? 'Installed from a file' : 'Up to date'}</strong><small>{selected.fromFile ? 'Files are not checked for updates. Import a newer file to replace it.' : `Last checked ${selected.checked}.`}</small></span></div>}
        <dl className="dtp-facts four"><div><dt>Version</dt><dd>{selected.version}</dd></div><div><dt>Installed</dt><dd>{selected.installed}</dd></div><div><dt>Changed upstream</dt><dd>{selected.upstream}</dd></div><div><dt>Last checked</dt><dd>{selected.checked}</dd></div></dl>
        {selected.kept?.length ? <><h3>Versions</h3><div className="dtp-rows"><div className="dtp-collection-row"><span><strong>{selected.version}</strong><small>Current</small></span><Chip tone="ok">In use</Chip></div>{selected.kept.map(v => <div className="dtp-collection-row" key={v}><span><strong>{v}</strong><small>Kept · 12.8 MB</small></span><span className="dtp-row-actions"><button className="dtp-btn small" onClick={() => notify(`Switched to ${v}`)}>Switch</button><button className="dtp-icon" aria-label={`Delete ${v}`} onClick={() => notify(`${v} deleted`)}><Trash2 size={13} /></button></span></div>)}</div></> : null}
        <h3>Factions</h3><div className="dtp-tags">{selected.factions.map(f => <Chip key={f}>{f}</Chip>)}<button className="dtp-chip add" onClick={() => notify('Choose more factions to install')}><Plus size={11} />Install more</button></div>
        <h3>Rosters using it</h3>{selected.rosters.length ? <div className="dtp-links">{selected.rosters.map(r => <button key={r} onClick={() => onOpenRoster ? onOpenRoster(r) : notify(`Opens “${r}” in a tab`)}><Layers3 size={14} />{r}<ChevronRight size={14} /></button>)}</div> : <p className="dtp-muted">No rosters use this source yet.</p>}
        <div className="dtp-danger-zone"><span><strong>Remove {selected.name}</strong><small>{selected.rosters.length ? `${selected.rosters.length} rosters will open read-only.` : 'No rosters are affected.'} Frees {selected.size}.</small></span><button className={`dtp-btn danger ${confirmRemove ? 'confirm' : ''}`} onClick={() => { if (!confirmRemove) return setConfirmRemove(true); setSources(list => list.filter(s => s.id !== selected.id)); setSelectedId(sources.find(s => s.id !== selected.id)?.id ?? 'add'); notify(`${selected.name} removed`); }}><Trash2 size={14} />{confirmRemove ? 'Remove for good?' : 'Remove'}</button></div>
        <LastUpdateStates source={selected} jobs={jobs} />
      </section> : null}
    </div>
    {addingCollection && <AddCollectionDialog {...flow} onClose={() => setAddingCollection(false)} />}
  </main>;
}

/* ------------------------------ Settings ------------------------------ */

const settingsSections = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Languages },
  { id: 'rosters', label: 'Rosters', icon: Layers3 },
  { id: 'data', label: 'Game data', icon: Database },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'keys', label: 'Key bindings', icon: Keyboard },
  { id: 'about', label: 'About', icon: Info },
] as const;

export function DesktopSettings({ themePref, onThemePref, scheme, onScheme, bindings, onBindings, advancedInstall, onAdvancedInstall, notify }: { themePref: 'system' | 'light' | 'dark'; onThemePref: (v: 'system' | 'light' | 'dark') => void; scheme: ColorScheme; onScheme: (v: ColorScheme) => void; bindings: KeyBindings; onBindings: (next: KeyBindings) => void; advancedInstall: boolean; onAdvancedInstall: (v: boolean) => void; notify: Notify }) {
  const [active, setActive] = useState<string>('appearance');
  const [language, setLanguage] = useState('en');
  const [toggles, setToggles] = useState({ rememberSections: true, restoreTabs: true, autoChecks: true });
  const [keep, setKeep] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const flip = (key: keyof typeof toggles) => (v: boolean) => setToggles(t => ({ ...t, [key]: v }));
  const go = (id: string) => { setActive(id); scrollRef.current?.querySelector(`#dtp-set-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return <main className="dtp-page">
    <div className="dtp-settings">
      <nav className="dtp-settings-nav" aria-label="Settings sections">{settingsSections.map(s => <button key={s.id} className={active === s.id ? 'active' : ''} aria-current={active === s.id ? 'true' : undefined} onClick={() => go(s.id)}><s.icon size={15} />{s.label}</button>)}</nav>
      <div className="dtp-settings-body" ref={scrollRef} onScroll={e => { const top = e.currentTarget.getBoundingClientRect().top + 48; const current = settingsSections.filter(sec => (e.currentTarget.querySelector(`#dtp-set-${sec.id}`)?.getBoundingClientRect().top ?? Infinity) <= top).pop(); if (current) setActive(current.id); }}>
        <section id="dtp-set-appearance" className="dtp-card dtp-settings-card"><h2>Appearance</h2>
          <div className="dtp-setting-line"><span><strong>Theme</strong><small>System follows your desktop setting.</small></span><Segmented label="Theme" value={themePref} onChange={onThemePref} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /></div>
          <div className="dtp-setting-block"><strong>Colour scheme</strong><div className="dtp-scheme-grid" role="radiogroup" aria-label="Colour scheme">{colourSchemes.map(c => <button key={c.id} role="radio" aria-checked={scheme === c.id} className={scheme === c.id ? 'active' : ''} onClick={() => onScheme(c.id)}><span className="dtp-swatch"><i style={{ background: 'var(--ux-bg)' }} /><i style={{ background: c.accent }} /><i style={{ background: 'var(--ux-surface-2)' }} /></span>{c.name}{scheme === c.id && <Check size={14} />}</button>)}<button onClick={() => notify('Choose a colour scheme file (JSON)')}><Upload size={15} />Import scheme</button></div></div>
        </section>
        <section id="dtp-set-language" className="dtp-card dtp-settings-card"><h2>Language</h2>
          <div className="dtp-rows" role="radiogroup" aria-label="Language">{[['en', 'English'], ['fr', 'Français · imported']].map(([id, name]) => <button key={id} role="radio" aria-checked={language === id} className="dtp-setting-row" onClick={() => setLanguage(id)}><span><strong>{name}</strong></span>{language === id && <Check size={16} />}</button>)}</div>
          <div className="dtp-setting-foot"><button className="dtp-btn" onClick={() => notify('Choose a language pack (JSON)')}><Upload size={14} />Import language pack</button><small>Only the app is translated. Game data is shown as written.</small></div>
        </section>
        <section id="dtp-set-rosters" className="dtp-card dtp-settings-card"><h2>Rosters</h2>
          <Switch label="Remember option sections" detail="Folded option sections stay folded the next time you open a unit." checked={toggles.rememberSections} onChange={flip('rememberSections')} />
          <Switch label="Reopen tabs on launch" detail="Rosters open when you quit come back as tabs." checked={toggles.restoreTabs} onChange={flip('restoreTabs')} />
        </section>
        <section id="dtp-set-data" className="dtp-card dtp-settings-card"><h2>Game data</h2>
          <Switch label="Check for updates automatically" detail="When the app starts and every few hours while it is open." checked={toggles.autoChecks} onChange={flip('autoChecks')} />
          <Switch label="Advanced installation" detail="Choose which factions to install when you add game data. Off: everything is installed." checked={advancedInstall} onChange={onAdvancedInstall} />
          <div className="dtp-setting-line"><span><strong>Keep previous versions</strong><small>{keep === 0 ? 'Older versions are deleted after an update.' : `Uses about ${keep * 13} MB per source.`}</small></span><Segmented label="Keep previous versions" value={keep} onChange={setKeep} options={[0, 1, 2, 3].map(v => ({ value: v, label: v === 0 ? 'Off' : String(v) }))} /></div>
        </section>
        <section id="dtp-set-storage" className="dtp-card dtp-settings-card"><h2>Storage</h2>
          <div className="dtp-setting-line"><span><strong>Data folder</strong><small className="dtp-mono">~/Library/Application Support/Battle Augur</small></span><button className="dtp-btn" onClick={() => notify('Opens the folder in Finder')}><FolderOpen size={14} />Show in Finder</button></div>
          <div className="dtp-storage-bar" aria-label="Storage used"><i style={{ width: '62%' }} /><i style={{ width: '8%' }} /><i style={{ width: '4%' }} /></div>
          <div className="dtp-legend"><span><i />Game data 53.9 MB</span><span><i />Kept versions 12.8 MB</span><span><i />Rosters 0.4 MB</span></div>
        </section>
        <section id="dtp-set-keys" className="dtp-card dtp-settings-card"><KeyBindingsEditor bindings={bindings} onBindings={onBindings} /></section>
        <section id="dtp-set-about" className="dtp-card dtp-settings-card"><h2>About</h2>
          <dl className="dtp-facts four"><div><dt>Version</dt><dd>1.0.0 · desktop preview</dd></div><div><dt>Engine</dt><dd>0.9.4</dd></div><div><dt>Protocol</dt><dd>12</dd></div><div><dt>SQLite</dt><dd>3.46</dd></div></dl>
          <p className="dtp-muted">Game data and rosters stay on this device.</p>
        </section>
      </div>
    </div>
  </main>;
}

/* ---------------------------- Key bindings ---------------------------- */

function KeyBindingsEditor({ bindings, onBindings }: { bindings: KeyBindings; onBindings: (next: KeyBindings) => void }) {
  const [recording, setRecording] = useState<KeyAction | null>(null);
  const [message, setMessage] = useState('');
  const [conflict, setConflict] = useState<{ action: KeyAction; combo: string; other: KeyAction } | null>(null);
  const labelOf = (id: KeyAction) => keyActions.find(a => a.id === id)?.label ?? id;
  useEffect(() => {
    if (!recording) return;
    // Capture phase on window, so the app's own shortcuts do not fire while a binding is recorded.
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.key === 'Escape') { setRecording(null); setMessage(''); return; }
      const combo = comboFromEvent(e);
      if (!combo) return;
      if (!hasCommandModifier(combo)) { setMessage('Use ⌘ or ⌥ with a key, so typing is never captured.'); return; }
      const other = keyActions.find(a => a.id !== recording && bindings[a.id] === combo)?.id;
      if (other) setConflict({ action: recording, combo, other });
      else onBindings({ ...bindings, [recording]: combo });
      setRecording(null); setMessage('');
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [recording, bindings, onBindings]);
  const changed = keyActions.some(a => bindings[a.id] !== defaultBindings[a.id]);
  return <>
    <div className="dtp-keys-head"><h2>Key bindings</h2>{changed && <button className="dtp-btn small" onClick={() => { onBindings(defaultBindings); setConflict(null); }}><RefreshCcw size={13} />Reset all</button>}</div>
    <p className="dtp-muted">Select a binding and press the new keys. Esc cancels. Esc also closes dialogs and the roster summary; that key is fixed.</p>
    {conflict && <div className="dtp-notice warn" role="alert"><AlertTriangle size={16} /><span><strong>{formatCombo(conflict.combo)} is already used by {labelOf(conflict.other)}</strong><small>Replace it, and {labelOf(conflict.other)} has no binding until you set one.</small></span><span className="dtp-row-actions"><button className="dtp-btn small" onClick={() => { onBindings({ ...bindings, [conflict.action]: conflict.combo, [conflict.other]: '' }); setConflict(null); }}>Replace</button><button className="dtp-btn small" onClick={() => setConflict(null)}>Cancel</button></span></div>}
    {(['General', 'Roster editor'] as const).map(group => <div key={group} className="dtp-keys-group"><h3>{group}</h3><div className="dtp-rows">{keyActions.filter(a => a.group === group).map(a => <div className="dtp-collection-row" key={a.id}>
      <span><strong>{a.label}</strong>{recording === a.id && message && <small className="dtp-key-error">{message}</small>}</span>
      <span className="dtp-row-actions">
        {bindings[a.id] !== defaultBindings[a.id] && <button className="dtp-icon" aria-label={`Reset ${a.label} to ${formatCombo(defaultBindings[a.id])}`} title={`Reset to ${formatCombo(defaultBindings[a.id])}`} onClick={() => onBindings({ ...bindings, [a.id]: defaultBindings[a.id] })}><RefreshCcw size={13} /></button>}
        <button className={`dtp-key ${recording === a.id ? 'recording' : ''}`} aria-label={`${a.label}: ${bindings[a.id] ? formatCombo(bindings[a.id]) : 'no binding'}. Change binding`} onClick={() => { setRecording(recording === a.id ? null : a.id); setMessage(''); setConflict(null); }}>{recording === a.id ? 'Press keys…' : bindings[a.id] ? <kbd>{formatCombo(bindings[a.id])}</kbd> : <span className="dtp-faint">Not set</span>}</button>
      </span>
    </div>)}</div></div>)}
  </>;
}

/* ------------------------- Welcome: first run ------------------------- */

/** Right side of Welcome while there is no game data, or data but no rosters yet. */
export function WelcomeStart({ jobs, onCreate, onImport, onAddData, onOpenJobs }: { jobs: WorkspaceJobs; onCreate: () => void; onImport: () => void; onAddData: () => void; onOpenJobs: () => void }) {
  if (jobs.sources.length) return <section className="dt-recents dt-start">
    <header><h2>Ready when you are</h2><span>{jobs.sources.map(s => s.name).join(' · ')} installed</span></header>
    <div className="dtp-empty left"><Layers3 size={22} /><strong>No rosters yet</strong><p>Your first roster takes a minute: choose a faction, a force and a points limit.</p><span className="dtp-row-actions"><button className="dtp-btn primary" onClick={onCreate}><Plus size={15} />Create your first roster</button><button className="dtp-btn" onClick={onImport}><FileUp size={15} />Import a roster</button></span></div>
  </section>;
  return <section className="dt-recents dt-start">
    <header><h2>Start with game data</h2><span>Rosters are built from a game system's data. Install one; it stays available offline.</span></header>
    <div className="dtp-rows">{collectionSources.map(c => { const live = jobs.jobs.find(j => j.sourceId === c.id && (j.status === 'running' || j.status === 'needs-you')); return <div className="dtp-collection-row" key={c.id}>
      <span><strong>{c.name}</strong><small>{c.detail} · {c.size}</small>{live && <i className="dtp-progress"><em style={{ width: `${jobPercent(live)}%` }} /></i>}</span>
      {live ? <button className={`dtp-btn small ${live.status === 'needs-you' ? 'primary' : ''}`} onClick={onOpenJobs}>{live.status === 'needs-you' ? 'Choose factions' : `Installing ${jobPercent(live)}%`}</button> : <button className="dtp-btn small" onClick={() => { jobs.startInstall(c); onOpenJobs(); }}>Install</button>}
    </div>; })}</div>
    <button className="dtp-link-row" onClick={onAddData}><FolderOpen size={16} /><span><strong>Install from a file or a link</strong><small>An archive, data files, a repository link or GitHub search</small></span><ChevronRight size={15} /></button>
    <p className="dt-start-note">Battle Augur includes no game data. Sources come from community repositories you choose.</p>
  </section>;
}
