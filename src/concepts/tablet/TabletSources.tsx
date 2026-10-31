import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowUpCircle, Check, CheckSquare, ChevronRight, ExternalLink, FolderOpen, Github, Layers3, Link2, Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import { Chip as MobileChip } from '../ux/uxShared'; // the mobile chip; the workspace Chip (dtp-chip) is not used here, see MOBILE-PIECES.md
import { jobPercent } from '../workspace/Jobs';
import type { SourceInfo } from '../desktop/desktopData';
import { AddDataCollections, CollectionView, GitHubSearchView, LastUpdateCard, LastUpdateStates, UpdateReportView, flowSourceId, isAddFlow, useRosterChecks } from '../desktop/DesktopSourceFlows';
import '../desktop/desktop-pages.css';
import { HintButton } from './TabletHint';
import { EmptyState, Facts, ListDetail, Row, WorkspaceScope, plural, sourceStatus, Progress, type SessionProps } from './TabletPieces';
import { TabletToolbar, type ToolbarAction } from './TabletToolbar';
import type { TabletPage } from './TabletRail';

// Sources (T2b): installed game data as list + detail, in-page progress controls and requested jobs details, and the add flows.
// The update report, collection pages and GitHub search are the workspace flows of the desktop, drawn with touch-size
// controls (tablet-pages.css). The add-collection and faction picker sheets (T3) cover the whole window: TabletSessionSheets. The detail's mode lives in the session
// (`sourceDetail`): a source id, 'add', 'github', 'collection:<id>' or 'report:<id>', so it survives switching pages.

export function TabletSources({ env, notify, session, onPage, onOpenRoster }: SessionProps & { onPage: (page: TabletPage) => void; onOpenRoster: (name: string) => void }) {
  const { jobs, sourceDetail, setSourceDetail, setJobsOpen, light, advancedInstall } = session;
  const { sources, setSources } = jobs;
  const [open, setOpen] = useState(sourceDetail !== undefined);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [link, setLink] = useState('');
  const [query, setQuery] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const detail = sourceDetail ?? sources[0]?.id ?? 'add';
  const go = (next: string) => { setSourceDetail(next); setOpen(true); };
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } setOpen(true); }, [sourceDetail]);
  useEffect(() => { setConfirmRemove(false); }, [detail]);
  useRosterChecks(jobs, notify, go);
  const openJobs = () => setJobsOpen(true);
  const update = (ids: string[]) => { jobs.startUpdate(ids); };
  const progress: Record<string, number> = Object.fromEntries(sources.flatMap(s => { const p = jobs.progressOf(s.id); return p ? [[s.id, p.percent]] : []; }));
  const installing = jobs.jobs.filter(j => j.kind === 'install' && (j.status === 'running' || j.status === 'needs-you') && !sources.some(s => s.id === j.sourceId));
  const updates = sources.filter(s => s.next && progress[s.id] === undefined);
  const selected = sources.find(s => s.id === detail);
  const flow = { jobs, notify, go, onOpenJobs: openJobs };
  const openRoster = onOpenRoster;
  const chip = (s: SourceInfo) => progress[s.id] !== undefined ? <MobileChip tone="cool">Updating {progress[s.id]}%</MobileChip> : sourceStatus(s);
  const q = query.trim().toLowerCase();
  const shown = sources.filter(s => (s.name + s.repo + s.factions.join(' ')).toLowerCase().includes(q));
  const shownInstalls = installing.filter(j => j.name.toLowerCase().includes(q));
  const mark = (name: string) => name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const pick = (id: string) => setPicked(list => list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  const endSelect = () => { setSelecting(false); setPicked([]); };
  const pickedUpdates = picked.filter(id => sources.find(s => s.id === id)?.next && progress[id] === undefined);

  // DEC-050: the top row is the search (filters the installed game data), then Select, Install from a file and Add game
  // data (prominent) as platform icon buttons. Install from a file moves into More before Add game data does.
  const actions: ToolbarAction[] = [
    { id: 'select', label: selecting ? 'Done selecting' : 'Select game data', caption: selecting ? 'Done' : 'Select', icon: CheckSquare, pressed: selecting, priority: 2, hint: selecting ? 'Leave selection' : 'Select several game systems to update or remove them together', onClick: () => selecting ? endSelect() : setSelecting(true) },
    { id: 'file', label: 'Install from a file', caption: 'From a file', icon: FolderOpen, priority: 1, hint: 'Install game data from an archive, data files or a folder', onClick: () => notify('Choose an archive, data files or a folder (prototype)') },
    { id: 'add', label: 'Add game data', caption: 'Add game data', icon: Plus, prominent: true, hint: 'Install from a collection, a repository link or GitHub search', onClick: () => go('add') },
  ];
  const search = <label className="ux-search tb-search">
    <Search size={18} aria-hidden="true" />
    <input type="search" value={query} aria-label="Find installed game data" placeholder="Find game data…" onChange={e => setQuery(e.target.value)}
      onKeyDown={e => { if (e.key === 'Escape' && query) { e.preventDefault(); e.stopPropagation(); setQuery(''); } }} />
    {query && <button type="button" className="tb-search-clear" aria-label="Clear search" title="Clear search (Esc)" onClick={() => setQuery('')}><X size={16} aria-hidden="true" /></button>}
  </label>;

  // DEC-050 / C-07: the shared pane row. Second line: repository · version · size; the status chip trails; no third line
  // (progress shows in the chip and in the detail).
  const sourceRow = (s: SourceInfo) => {
    const on = picked.includes(s.id);
    return <Row key={s.id} selected={!selecting && flowSourceId(detail) === s.id} pressed={selecting ? on : undefined}
      mark={selecting ? <span className={`tb-pick ${on ? 'on' : ''}`}>{on ? <Check size={20} strokeWidth={2.6} /> : null}</span> : mark(s.name)}
      title={s.name} sub={`${s.fromFile ? 'From a file' : s.repo} · ${s.version === 'local' ? 'local' : s.version} · ${s.size}`} end={chip(s)}
      onClick={() => selecting ? pick(s.id) : go(s.id)} />;
  };
  const foot = selecting
    ? <p className="tb-list-foot tb-select-foot" aria-live="polite"><span>{picked.length ? `${picked.length} selected` : 'Choose game systems'}</span>
      <button type="button" className="ux-job-btn ux-src-ghost" disabled={!pickedUpdates.length} onClick={() => { update(pickedUpdates); endSelect(); }}><RefreshCcw size={15} />Update</button>
      <button type="button" className="ux-job-btn ux-src-ghost destructive" disabled={!picked.length} onClick={() => { notify(`${plural(picked.length, 'game system')} removed (prototype)`); endSelect(); }}><Trash2 size={15} />Remove</button></p>
    : <div className="tb-list-foot tb-list-foot-stack" aria-live="polite">
      <span>{q ? `${shown.length} of ${plural(sources.length, 'game system')}` : `${plural(sources.length, 'game system')} installed`} · Everything works offline</span>
      <span><RefreshCcw size={13} />Checked for updates 8 minutes ago<button type="button" className="ux-job-btn ux-src-ghost" onClick={() => notify('Checked for updates. Nothing new.')}>Check now</button></span>
    </div>;
  const list = <>
    <div className="tb-list scroll">
      {updates.length > 0 && !q && !selecting && <div className="tb-banner" role="status"><ArrowUpCircle size={20} /><span><strong>{plural(updates.length, 'update')} available</strong><small>New data for {updates.map(s => s.name).join(', ')}.</small></span><button type="button" className="ux-job-btn primary" onClick={() => update(updates.map(s => s.id))}>Update all</button></div>}
      {shown.map(sourceRow)}
      {!selecting && shownInstalls.map(j => <Row key={j.id} selected={false} mark={mark(j.name)} title={j.name} sub={j.status === 'needs-you' ? 'Waiting for you to choose factions' : `${plural(j.factions.length, 'faction')} available`} end={j.status === 'needs-you' ? <MobileChip tone="warning"><AlertTriangle size={11} />Needs you</MobileChip> : <MobileChip tone="cool">Installing {jobPercent(j)}%</MobileChip>} onClick={openJobs} />)}
      {!sources.length && !installing.length && <p className="tb-empty">No game data installed yet.</p>}
      {q && !shown.length && !shownInstalls.length && sources.length > 0 && <EmptyState icon={Search} title={`No game data matches “${query.trim()}”`} text="Try another name, repository or faction."><button type="button" className="ux-job-btn" onClick={() => setQuery('')}>Clear search</button></EmptyState>}
      {!q && !selecting && <Row selected={isAddFlow(detail)} mark={<Plus size={20} />} title="Add game data" sub="Collections, a repository link, or GitHub search" end={<ChevronRight size={17} />} onClick={() => go('add')} />}
    </div>
    {foot}
  </>;

  const addPane = <>
    <div className="tb-detail-title"><span><h2>Add game data</h2><small>Install from a collection, a repository link, or GitHub search</small></span></div>
    <p className="tb-note"><Layers3 size={15} /><span>{advancedInstall ? <>Advanced installation is on. Each install pauses on <b>Choose factions</b>, so you install only the factions you play.</> : <>Each install brings every faction. To choose factions, turn on <b>Advanced installation</b> in Settings.</>}{' '}<button type="button" className="tb-text-link" onClick={() => { session.setSettingsSection('data'); onPage('settings'); }}>Open Game data settings</button></span></p>
    <WorkspaceScope light={light}><div className="tb-flow"><AddDataCollections jobs={jobs} go={go} onOpenJobs={openJobs} /></div></WorkspaceScope>
    <form className="tb-link-form" onSubmit={e => { e.preventDefault(); notify(link ? 'Looking up the repository…' : 'Paste a repository link first'); }}>
      <label className="ux-search tb-search"><Link2 size={16} /><input value={link} onChange={e => setLink(e.target.value)} placeholder="https://github.com/owner/repository" aria-label="Repository link" inputMode="url" autoCapitalize="off" /></label>
      <button type="submit" className="ux-job-btn">Continue</button>
    </form>
    <div className="tb-list">
      <Row selected={false} mark={<Github size={20} />} title="Search GitHub" sub="Find data repositories by name" end={<ChevronRight size={17} />} onClick={() => go('github')} />
      <Row selected={false} mark={<Plus size={20} />} title="Add a collection or library" sub="Lists of sources kept by the community" end={<ChevronRight size={17} />} onClick={() => session.setAddCollectionOpen(true)} />
      <Row selected={false} mark={<FolderOpen size={20} />} title="Install from a file" sub="An archive, data files or a folder" end={<ChevronRight size={17} />} onClick={() => notify('Choose an archive, data files or a folder (prototype)')} />
    </div>
  </>;

  const sourcePane = (s: SourceInfo) => {
    const pct = progress[s.id];
    return <>
      <div className="tb-detail-title"><span><h2>{s.name}</h2><small>{s.fromFile ? 'Installed from a file' : s.repo}</small></span>{chip(s)}</div>
      <p className="tb-muted">{plural(s.factions.length, 'faction')} · {plural(s.documents, 'data file')} · {s.size}</p>
      {s.next && pct === undefined && <section className="tb-card tb-update" aria-label="Update available">
        <div className="tb-update-head"><ArrowUpCircle size={22} /><span><strong>Update available · {s.version} → {s.next}</strong><small>Changed upstream {s.upstream}</small></span></div>
        <ul className="tb-counts"><li><b>+2</b>units added</li><li><b>~5</b>costs changed</li><li><b>−1</b>rule removed</li></ul>
        <div className="tb-actions"><button type="button" className="ux-job-btn primary" onClick={() => update([s.id])}><RefreshCcw size={16} />Update</button><button type="button" className="ux-job-btn" onClick={() => notify('Opens the repository in your browser')}><ExternalLink size={16} />View on GitHub</button></div>
      </section>}
      {pct !== undefined && <section className="tb-card tb-update" aria-label="Updating"><div className="tb-update-head"><RefreshCcw size={22} /><span><strong>Updating to {s.next}</strong><small>Downloading and checking data · {pct}%</small></span></div><Progress percent={pct} /></section>}
      <WorkspaceScope light={light}><div className="tb-flow"><LastUpdateCard source={s} {...flow} /></div></WorkspaceScope>
      {s.status === 'review' && <p className="tb-note warn"><AlertTriangle size={15} /><span><strong>3 import warnings</strong>Some entries reference missing data. Rosters still open; affected entries are marked.</span></p>}
      {!s.next && s.status === 'ready' && pct === undefined && <p className="tb-note ok"><Check size={15} /><span><strong>{s.fromFile ? 'Installed from a file' : 'Up to date'}</strong>{s.fromFile ? 'Files are not checked for updates. Import a newer file to replace it.' : `Last checked ${s.checked}.`}</span></p>}
      <Facts rows={[['Version', s.version], ['Installed', s.installed], ['Changed upstream', s.upstream], ['Last checked', s.checked]]} />
      {s.kept?.length ? <section className="tb-section"><span className="ux-result-label">Versions</span>
        <div className="tb-install-row"><span className="tb-row-main"><strong>{s.version}</strong><small>Current</small></span><MobileChip tone="valid">In use</MobileChip></div>
        {s.kept.map(v => <div className="tb-install-row" key={v}><span className="tb-row-main"><strong>{v}</strong><small>Kept · 12.8 MB</small></span><button type="button" className="ux-job-btn" onClick={() => notify(`Switched to ${v}`)}>Switch</button><HintButton hint={`Delete ${v}`} aria-label={`Delete ${v}`} input={env.input} side="top" className="tb-icon-btn" onClick={() => notify(`${v} deleted`)}><Trash2 size={17} /></HintButton></div>)}
      </section> : null}
      <section className="tb-section"><span className="ux-result-label">Factions</span>
        <div className="tb-chips">{s.factions.map(f => <MobileChip key={f} tone="neutral">{f}</MobileChip>)}<button type="button" className="tb-chip-add" onClick={() => notify('Choose more factions to install')}><Plus size={13} />Install more</button></div></section>
      <section className="tb-section"><span className="ux-result-label">Rosters using it</span>
        {s.rosters.length ? <div className="tb-list">{s.rosters.map(r => <Row key={r} selected={false} title={r} sub="Opens the roster" end={<ChevronRight size={17} />} onClick={() => openRoster(r)} />)}</div> : <p className="tb-muted">No rosters use this source yet.</p>}</section>
      <div className="tb-danger"><span><strong>Remove {s.name}</strong><small>{s.rosters.length ? `${plural(s.rosters.length, 'roster')} will open read-only.` : 'No rosters are affected.'} Frees {s.size}.</small></span>
        <button type="button" className={`ux-job-btn ${confirmRemove ? 'tb-confirm' : 'destructive'}`} onClick={() => { if (!confirmRemove) return setConfirmRemove(true); setSources(l => l.filter(x => x.id !== s.id)); go(sources.find(x => x.id !== s.id)?.id ?? 'add'); notify(`${s.name} removed`); }}><Trash2 size={16} />{confirmRemove ? 'Remove for good?' : 'Remove'}</button></div>
      <WorkspaceScope light={light}><div className="tb-flow"><LastUpdateStates source={s} jobs={jobs} /></div></WorkspaceScope>
    </>;
  };

  const flowPane = (node: ReactNode) => <WorkspaceScope light={light}><div className="tb-flow">{node}</div></WorkspaceScope>;
  const pane = detail === 'add' ? addPane
    : detail === 'github' ? flowPane(<GitHubSearchView jobs={jobs} go={go} onOpenJobs={openJobs} />)
      : detail.startsWith('collection:') ? flowPane(<CollectionView key={detail} pageId={detail.slice(11)} {...flow} />)
        : detail.startsWith('report:') ? flowPane(<UpdateReportView key={detail} sourceId={flowSourceId(detail)} onOpenRoster={openRoster} {...flow} />)
          : selected ? sourcePane(selected) : addPane;

  // DEC-050: no title row, toolbar note or "Installed" heading; the count and "Everything works offline" sit in the list
  // foot (as Rosters'). TFB-008: both panes start right under the top row, so their tops align.
  return <div className="tb-page">
    <TabletToolbar title="Sources" search={search} actions={actions} input={env.input} />
    {jobs.jobs.length > 0 && <div className="tb-actions"><button type="button" className="ux-job-btn" onClick={openJobs}>Show progress · All jobs</button></div>}
    <ListDetail env={env} label="Installed sources" open={open} onClose={() => setOpen(false)} list={list} detail={pane} />
  </div>;
}
