import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowUpCircle, Check, ChevronRight, ExternalLink, FolderOpen, Github, Layers3, Link2, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { Chip as MobileChip } from '../ux/uxShared'; // the mobile chip; the workspace Chip (dtp-chip) is not used here, see MOBILE-PIECES.md
import { jobPercent } from '../workspace/Jobs';
import type { SourceInfo } from '../desktop/desktopData';
import { AddCollectionDialog, AddDataCollections, CollectionView, GitHubSearchView, LastUpdateCard, LastUpdateStates, UpdateReportView, flowSourceId, isAddFlow, useRosterChecks } from '../desktop/DesktopSourceFlows';
import '../desktop/desktop-pages.css';
import { HintButton } from './TabletHint';
import { Facts, ListDetail, Row, WorkspaceScope, plural, sourceStatus, Progress, type SessionProps } from './TabletPieces';
import { TabletJobsButton } from './tabletSession';
import type { TabletPage } from './TabletRail';

// Sources (T2b): installed game data as list + detail, the progress button and jobs popover in the toolbar, and the add flows.
// The update report, collection pages, GitHub search and the add-collection sheet are the workspace flows of the desktop,
// drawn with touch-size controls (tablet-pages.css); T3 designs the generic sheets. The detail's mode lives in the session
// (`sourceDetail`): a source id, 'add', 'github', 'collection:<id>' or 'report:<id>', so it survives switching pages.

export function TabletSources({ env, notify, session, onPage, onOpenRoster }: SessionProps & { onPage: (page: TabletPage) => void; onOpenRoster: (name: string) => void }) {
  const { jobs, sourceDetail, setSourceDetail, setJobsOpen, light, advancedInstall } = session;
  const { sources, setSources } = jobs;
  const [open, setOpen] = useState(sourceDetail !== undefined);
  const [addingCollection, setAddingCollection] = useState(session.state === 'add-collection');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [link, setLink] = useState('');
  const detail = sourceDetail ?? sources[0]?.id ?? 'add';
  const go = (next: string) => { setSourceDetail(next); setOpen(true); };
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } setOpen(true); }, [sourceDetail]);
  useEffect(() => { setConfirmRemove(false); }, [detail]);
  useRosterChecks(jobs, notify, go);
  const openJobs = () => setJobsOpen(true);
  const update = (ids: string[]) => { jobs.startUpdate(ids); openJobs(); };
  const progress: Record<string, number> = Object.fromEntries(sources.flatMap(s => { const p = jobs.progressOf(s.id); return p ? [[s.id, p.percent]] : []; }));
  const installing = jobs.jobs.filter(j => j.kind === 'install' && (j.status === 'running' || j.status === 'needs-you') && !sources.some(s => s.id === j.sourceId));
  const updates = sources.filter(s => s.next && progress[s.id] === undefined);
  const selected = sources.find(s => s.id === detail);
  const flow = { jobs, notify, go, onOpenJobs: openJobs };
  const openRoster = onOpenRoster;
  const chip = (s: SourceInfo) => progress[s.id] !== undefined ? <MobileChip tone="cool">Updating {progress[s.id]}%</MobileChip> : sourceStatus(s);

  const list = <>
    <div className="tb-list scroll">
      {updates.length > 0 && <div className="tb-banner" role="status"><ArrowUpCircle size={20} /><span><strong>{plural(updates.length, 'update')} available</strong><small>New data for {updates.map(s => s.name).join(', ')}.</small></span><button type="button" className="ux-job-btn primary" onClick={() => update(updates.map(s => s.id))}>Update all</button></div>}
      <span className="ux-result-label tb-list-label">Installed · {sources.length}</span>
      {sources.map(s => <Row key={s.id} selected={flowSourceId(detail) === s.id} title={s.name} sub={s.fromFile ? `${plural(s.factions.length, 'faction')} · from a file` : `${s.version} · ${plural(s.factions.length, 'faction')} · ${s.size}`} end={chip(s)} foot={progress[s.id] !== undefined ? <Progress percent={progress[s.id]} /> : undefined} onClick={() => go(s.id)} />)}
      {installing.map(j => <Row key={j.id} selected={false} title={j.name} sub={j.status === 'needs-you' ? 'Waiting for you to choose factions' : `${plural(j.factions.length, 'faction')} available`} end={j.status === 'needs-you' ? <MobileChip tone="warning"><AlertTriangle size={11} />Needs you</MobileChip> : <MobileChip tone="cool">Installing {jobPercent(j)}%</MobileChip>} foot={<Progress percent={jobPercent(j)} />} onClick={openJobs} />)}
      {!sources.length && !installing.length && <p className="tb-empty">No game data installed yet.</p>}
      <Row selected={isAddFlow(detail)} mark={<Plus size={20} />} title="Add game data" sub="Collections, a repository link, or GitHub search" end={<ChevronRight size={17} />} onClick={() => go('add')} />
    </div>
    <p className="tb-list-foot"><RefreshCcw size={13} />Checked for updates 8 minutes ago<button type="button" className="ux-job-btn ux-src-ghost" onClick={() => notify('Checked for updates. Nothing new.')}>Check now</button></p>
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
      <Row selected={false} mark={<Plus size={20} />} title="Add a collection or library" sub="Lists of sources kept by the community" end={<ChevronRight size={17} />} onClick={() => setAddingCollection(true)} />
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

  return <div className="tb-page">
    <div className="tb-toolbar wrap"><span className="tb-toolbar-note">{plural(sources.length, 'game system')} installed. Everything works offline.</span>
      <TabletJobsButton session={session} />
      <HintButton hint="Install game data from an archive, data files or a folder" input={env.input} side="bottom" className="ux-job-btn" onClick={() => notify('Choose an archive, data files or a folder (prototype)')}><FolderOpen size={16} />Install from a file</HintButton>
      <HintButton hint="Install from a collection, a repository link or GitHub search" input={env.input} side="bottom" className="ux-job-btn primary" onClick={() => go('add')}><Plus size={16} />Add game data</HintButton></div>
    <ListDetail env={env} label="Installed sources" open={open} onClose={() => setOpen(false)} list={list} detail={pane} />
    {addingCollection && <WorkspaceScope light={light}><div className="tb-flow tb-sheet"><AddCollectionDialog {...flow} onClose={() => setAddingCollection(false)} /></div></WorkspaceScope>}
  </div>;
}
