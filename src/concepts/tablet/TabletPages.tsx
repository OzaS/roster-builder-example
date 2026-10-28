import { type ReactNode, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, ChevronDown, ChevronRight, Copy, Database, FileUp, FolderOpen, Hammer, Info, Layers3, Pencil, Plus, RefreshCcw, Search, ShieldCheck, Trash2, TriangleAlert, ArrowDownToLine, BookMarked, Check } from 'lucide-react';
import { Chip as MobileChip } from '../ux/uxShared'; // the mobile chip; the workspace Chip (dtp-chip) is not used here, see MOBILE-PIECES.md
import { ComingSoonCard } from '../ux/AppExtras';
import { collectionSources, lookupEntries, type LookupEntry, type RosterSummary } from '../desktop/desktopData';
import { HintButton } from './TabletHint';
import type { TabletInput } from './tabletDevices';
import { EmptyState, Facts, InstallRow, ListDetail, Meter, Progress, Row, SearchField, pts, rosterStatus, sourceStatus, plural, type PageProps, type SessionProps } from './TabletPieces';
import { keyLabel } from './tabletKeys';

// Pages of the tablet: Home, Rosters and Lookup (T2a). Sources and Settings have their own files. Synthetic rows only.

export type { PageProps };

/** New roster at the trailing edge of a page toolbar (Rosters on every tablet; Home on iPad, where the rail has no FAB). */
const NewRosterButton = ({ env, onNewRoster }: Pick<PageProps, 'env'> & { onNewRoster: () => void }) =>
  <HintButton hint={`Create a roster${env.input === 'pointer' ? ` (${keyLabel('Mod+N', env.device.system)})` : ''}`} input={env.input} side="bottom" className="ux-job-btn primary" onClick={onNewRoster}><Plus size={16} />New roster</HintButton>;

/* --------------------------------- Home --------------------------------- */

/** Game systems Home's data card shows (TFB-001); More opens Sources with the rest. */
const HOME_DATA_LIMIT = 4;

const steps = [['Add game data', 'Install a game system from a collection or a file.'], ['Create a roster', 'Choose a faction, a force and a points limit.'], ['Build and check', 'Add units, see the points and the checks as you go.']];

export function TabletHome({ env, notify, session, onPage, onNewRoster, onOpenRoster }: SessionProps & { onPage: (page: 'rosters' | 'sources') => void; onNewRoster: () => void; onOpenRoster: (name: string) => void }) {
  const { rosters, jobs, hasData, setJobsOpen, setSourceDetail } = session;
  const recent = rosters.slice(0, 4);
  const current = rosters[0];
  const addData = () => { setSourceDetail('add'); onPage('sources'); };
  const startInstall = (c: typeof collectionSources[number]) => { jobs.startInstall(c); };
  const attention = rosters.filter(r => r.status !== 'ready').length;

  // Every shown source keeps its own version, update and progress control. TFB-001: the four most used game systems (most
  // rosters, then the latest roster activity, then name; never install order); More opens Sources with the rest.
  const history = jobs.jobs.length > 0 && <button type="button" className="ux-job-btn" onClick={() => setJobsOpen(true)}>Show progress · All jobs</button>;
  const used = [...jobs.sources].sort((a, b) => b.rosters.length - a.rosters.length || a.name.localeCompare(b.name));
  const hidden = Math.max(0, used.length - HOME_DATA_LIMIT);
  // TFB-002: the data card and Recent rosters fill their columns and scroll inside; the page itself stays put.
  const dataCard = <section className="tb-card tb-fill" aria-label="Game data status">
    <span className="ux-result-label">Game data</span>
    {used.slice(0, HOME_DATA_LIMIT).map(source => {
      const progress = jobs.progressOf(source.id);
      return <div key={source.id} className="tb-section">
        <div className="tb-data-row"><span><strong>{source.name}</strong><small>{source.version} · checked {source.checked}</small></span>{sourceStatus(source)}</div>
        {progress ? <><p className="tb-note">Updating · {progress.percent}%. You can keep working.</p><Progress percent={progress.percent} /><button type="button" className="ux-job-btn" onClick={() => setJobsOpen(true)}>Show progress</button></>
          : source.next ? <><p className="tb-note"><Info size={15} />Version {source.next} is available.</p><HintButton hint="Download the new version and check your rosters" input={env.input} side="top" className="ux-job-btn primary" onClick={() => jobs.startUpdate([source.id])}><RefreshCcw size={16} />Update {source.name}</HintButton></>
          : <p className="tb-note ok"><Check size={15} />Up to date</p>}
      </div>;
    })}
    {hidden > 0 && <button type="button" className="ux-job-btn ux-src-ghost tb-more" aria-label={`${hidden} more game systems`} title="Opens Sources, which lists all installed game data" onClick={() => onPage('sources')}>More ({hidden})</button>}
    {history}
    <button type="button" className="ux-job-btn" onClick={() => onPage('sources')}>Sources</button>
  </section>;
  const deviceCard = <section className="tb-card">
    <span className="ux-result-label">On this device</span>
    <Facts rows={[['Rosters', rosters.length], ['Game systems', jobs.sources.length], ['Needs attention', attention]]} />
  </section>;

  // iPad: New roster sits at the trailing edge of the toolbar once there is game data (Android has the rail FAB and keeps
  // New roster in the Continue card); the card then drops its own New roster.
  const create = env.device.system === 'ios' && hasData;
  const toolbar = create && <div className="tb-toolbar tb-toolbar-end"><NewRosterButton env={env} onNewRoster={onNewRoster} /></div>;

  /* First run: no game data on the device. */
  if (!hasData) return <div className="tb-page tb-home-page">
    {toolbar}
    <div className="tb-home">
      <div className="tb-home-main">
        <section className="tb-card tb-fill" aria-label="Start with game data">
          <span className="ux-result-label">Get started</span>
          <div className="tb-card-head"><h2 className="tb-card-title">Start with game data</h2><p className="tb-body tb-muted">Rosters are built from a game system's data. Install one; it stays available offline.</p></div>
          <div className="tb-list">{collectionSources.map(c => <InstallRow key={c.id} title={c.name} sub={`${c.detail} · ${c.size}`} live={jobs.jobs.find(j => j.sourceId === c.id && (j.status === 'running' || j.status === 'needs-you'))} installed={jobs.sources.some(s => s.id === c.id)} onInstall={() => startInstall(c)} onJobs={() => setJobsOpen(true)} />)}</div>
          {history}
          <Row selected={false} mark={<FolderOpen size={20} />} title="Install from a file or a link" sub="An archive, data files, a repository link or GitHub search" end={<ChevronRight size={17} />} onClick={addData} />
          <p className="tb-note"><Info size={15} />Battle Augur includes no game data. Sources come from community repositories you choose.</p>
        </section>
      </div>
      <aside className="tb-home-side" aria-label="How it works">
        <section className="tb-card"><span className="ux-result-label">How it works</span>
          <ol className="tb-steps">{steps.map(([title, text], i) => <li key={title}><span className="tb-step-n" aria-hidden="true">{i + 1}</span><span><strong>{title}</strong><small>{text}</small></span></li>)}</ol>
        </section>
      </aside>
    </div>
  </div>;

  /* Game data, no rosters yet. */
  if (!current) return <div className="tb-page tb-home-page">
    {toolbar}
    <div className="tb-home">
      <div className="tb-home-main">
        <section className="tb-card tb-fill" aria-label="Ready when you are">
          <span className="ux-result-label">Ready when you are</span>
          <EmptyState icon={Layers3} title="No rosters yet" text="Your first roster takes a minute: choose a faction, a force and a points limit.">
            <HintButton hint="Create a roster" input={env.input} side="top" className="ux-primary tb-primary" onClick={onNewRoster}><Plus size={17} />Create your first roster</HintButton>
            <HintButton hint="Import a roster from a file" input={env.input} side="top" className="ux-job-btn" onClick={() => notify('Import a roster file (prototype)')}><FileUp size={16} />Import a roster</HintButton>
          </EmptyState>
        </section>
      </div>
      <aside className="tb-home-side" aria-label="Data status">{dataCard}{deviceCard}</aside>
    </div>
  </div>;

  /* The usual state. */
  return <div className="tb-page tb-home-page">
    {toolbar}
    <div className="tb-home">
      <div className="tb-home-main">
        <section className="tb-card tb-continue" aria-label="Continue roster">
          <span className="ux-result-label">Continue</span>
          <div className="tb-continue-head"><span className="tb-mark large" aria-hidden="true">{current.mark}</span><span><strong>{current.name}</strong><small>{current.faction} · {current.system} · opened {current.opened}</small></span></div>
          <Meter used={current.used} limit={current.limit} />
          <div className="tb-actions">
            <HintButton hint="Open the roster you were editing" input={env.input} side="top" className="ux-primary tb-primary" onClick={() => onOpenRoster(current.name)}>Continue roster<ArrowRight size={17} /></HintButton>
            {!create && <HintButton hint="Create a roster" input={env.input} side="top" className="ux-job-btn" onClick={onNewRoster}><Plus size={17} />New roster</HintButton>}
          </div>
        </section>
        <section className="tb-section tb-recent tb-fill" aria-label="Recent rosters">
          <div className="tb-section-head"><span className="ux-result-label">Recent rosters</span><button type="button" className="ux-job-btn ux-src-ghost" onClick={() => onPage('rosters')}>All rosters<ChevronRight size={15} /></button></div>
          <div className="tb-list">{recent.map((r, i) => <Row key={r.name} selected={false} mark={r.mark} title={r.name} sub={`${r.faction} · ${r.opened}`} end={<><b>{pts(r.used)} / {pts(r.limit)}</b>{i === 2 ? rosterStatus(r) : null}</>} onClick={() => onOpenRoster(r.name)} />)}</div>
        </section>
      </div>
      <aside className="tb-home-side" aria-label="Data status">{dataCard}{deviceCard}</aside>
    </div>
  </div>;
}

/* -------------------------------- Rosters -------------------------------- */

const needsAttention = (r: RosterSummary) => r.status === 'data-changed' || r.status === 'faction-removed';
const rosterNote = (r: RosterSummary) => r.status === 'ready' ? ['ok', 'Ready', 'All roster requirements met.']
  : r.status === 'issues' ? ['warn', `${r.issues} ${r.issues === 1 ? 'item needs' : 'items need'} attention`, r.used > r.limit ? 'Over the points limit.' : 'Roster requirements not met.']
    : r.status === 'data-changed' ? ['warn', 'Game data changed', 'Some entries changed in the last update. Open to review them.']
      : ['err', 'Faction removed', 'The faction is no longer in the installed data. The roster opens read-only.'];

/** The game systems of the stored rosters with their counts, the system of the most recently opened roster first (DEC-040). */
export function rosterSystems(rosters: RosterSummary[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of rosters) counts.set(r.system, (counts.get(r.system) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count }));
}

/** Icon-only toggle fixed at the trailing end of the filter row, outside the scroller (TFB-005): groups the list by game
 * system (TB-03, UX-055). 44 px like the chips, accent fill while on, the name as its accessible label and hold hint. */
export const GroupToggle = ({ on, onChange, input = 'touch' }: { on: boolean; onChange: (on: boolean) => void; input?: TabletInput }) =>
  <HintButton hint="Group by game system: one section per game system" input={input} side="bottom" wrapClassName="tb-group-toggle-wrap" className={`tb-group-toggle ${on ? 'active' : ''}`} aria-pressed={on} aria-label="Group by game system" onClick={() => onChange(!on)}><Layers3 size={19} aria-hidden="true" /></HintButton>;

/** Section header of a grouped list: the game system and how many of the shown rosters it holds. */
export const GroupHeader = ({ name, count }: { name: string; count: number }) =>
  <h3 className="tb-group-head" aria-label={`${name}, ${plural(count, 'roster')}`}><span>{name}</span><span aria-hidden="true">·</span><span>{count}</span></h3>;

/** Fixed end controls surround only the scrolling filter choices; keep selection semantics on each button. The group
 * toggle sits after them on the same row, fixed at its trailing end (TFB-005). */
export function RosterFilterBar({ platform, all, controls, disclosure, group }: { platform: 'ios' | 'android'; all: ReactNode; controls?: ReactNode; disclosure: ReactNode; group?: ReactNode }) {
  return <div className="tb-roster-filter-row">
    <div className="tb-filters tb-roster-filters" data-platform={platform} role="group" aria-label="Filter rosters">
      {all}
      {controls === undefined ? null : <div className="tb-roster-filter-scroll" role="group" aria-label="Additional roster filters">{controls}</div>}
      {disclosure}
    </div>
    {group}
  </div>;
}

const NOTE_ICONS = { ok: ShieldCheck, warn: TriangleAlert, err: TriangleAlert } as const;

/** The status tile beside the roster's name (TFB-006): the avatar's size, tinted by the status, its icon, a count with
 * more than one note and a disclosure chevron. It shows or hides the full note under the header. */
export const StatusTile = ({ tone, label, count = 1, expanded, onToggle }: { tone: string; label: string; count?: number; expanded: boolean; onToggle: () => void }) => {
  const Icon = NOTE_ICONS[tone as keyof typeof NOTE_ICONS] ?? Info;
  return <button type="button" className={`tb-status-tile ${tone}`} aria-expanded={expanded} aria-label={label} title="Shows or hides the status details" onClick={onToggle}>
    <Icon size={20} aria-hidden="true" /><span aria-hidden="true">{count > 1 ? <b>{count}</b> : null}<ChevronDown size={12} className={expanded ? 'flip' : ''} /></span>
  </button>;
};

/** The roster's facts as cells, label above value (TFB-007): two columns, one in a narrow card or at large text. */
export const FactsGrid = ({ rows }: { rows: Array<[string, ReactNode]> }) =>
  <div className="tb-facts-wrap"><dl className="tb-facts-grid">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>;

export function TabletRosters({ env, notify, session, onNewRoster, onOpenRoster }: SessionProps & { onNewRoster: () => void; onOpenRoster: (name: string) => void }) {
  const { rosters, setRosters, hasData } = session;
  const [query, setQuery] = useState(session.state === 'search' ? 'patrol' : '');
  const [attention, setAttention] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  // One game system chip at a time; a system with no rosters left drops back to All (and stays dropped).
  const [chosenSystem, setSystem] = useState<string | null>(session.state === 'system' ? 'Example System Two' : null);
  // Kept on the device across launches, like the system chip.
  const [grouped, setGrouped] = useState(session.state === 'grouped');
  const [selected, setSelected] = useState(rosters[0]?.name ?? '');
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [statusOpen, setStatusOpen] = useState(session.state === 'status');
  const q = query.trim().toLowerCase();
  const systems = useMemo(() => rosterSystems(rosters), [rosters]);
  // The chips (and grouping) show only when the rosters span two or more game systems.
  const bySystem = systems.length >= 2;
  const system = chosenSystem !== null && systems.some(s => s.name === chosenSystem) ? chosenSystem : null;
  const visible = useMemo(() => rosters.filter(r => (r.name + r.faction + r.system).toLowerCase().includes(q) && (!attention || needsAttention(r)) && (system === null || r.system === system)), [rosters, q, attention, system]);
  // Groups follow the chip order; inside a group the list order stays; groups with no shown roster are left out.
  const groups = bySystem && grouped ? systems.map(s => ({ name: s.name, rows: visible.filter(r => r.system === s.name) })).filter(g => g.rows.length > 0) : null;
  const attentionCount = rosters.filter(needsAttention).length;
  // The detail follows the list: a roster the filters hide gives way to the first one shown.
  const current = visible.find(r => r.name === selected) ?? visible[0];
  const choose = (name: string) => { setSelected(name); setOpen(true); setRenaming(false); setStatusOpen(false); };
  const clearFilters = () => { setQuery(''); setAttention(false); setSystem(null); };
  const actions = <>
    <HintButton hint="Import a roster from a file" input={env.input} side="bottom" className="ux-job-btn" onClick={() => notify('Import a roster file (prototype)')}><FileUp size={16} />Import</HintButton>
    <NewRosterButton env={env} onNewRoster={onNewRoster} />
  </>;
  if (!rosters.length) return <div className="tb-page">
    <div className="tb-toolbar tb-toolbar-end">{actions}</div>
    <EmptyState icon={Layers3} title="No rosters yet" text={hasData ? 'Create a roster, or import one from a file.' : 'Rosters are built from game data. Add a game system first, then create a roster.'}>
      <HintButton hint="Create a roster" input={env.input} side="top" className="ux-primary tb-primary" onClick={onNewRoster}><Plus size={17} />New roster</HintButton>
      <HintButton hint="Import a roster from a file" input={env.input} side="top" className="ux-job-btn" onClick={() => notify('Import a roster file (prototype)')}><FileUp size={16} />Import a roster</HintButton>
    </EmptyState>
  </div>;
  const duplicate = (r: RosterSummary) => { const copy = { ...r, name: `Copy of ${r.name}`, opened: 'Just now' }; setRosters(list => [copy, ...list]); choose(copy.name); notify(`Duplicated as “${copy.name}”`); };
  const rename = (r: RosterSummary, name: string) => { if (name && name !== r.name) { setRosters(list => list.map(x => x.name === r.name ? { ...x, name } : x)); setSelected(name); } setRenaming(false); };
  const [noteTone, noteTitle, noteText] = current ? rosterNote(current) : ['', '', ''];
  const row = (r: RosterSummary) => <Row key={r.name} selected={r.name === current?.name} mark={r.mark} title={r.name} sub={`${r.faction} · ${r.system}`} end={<><b>{pts(r.used)} / {pts(r.limit)}</b>{rosterStatus(r)}</>} onClick={() => choose(r.name)} />;
  const filtered = q !== '' || attention || system !== null;
  return <div className="tb-page">
    <div className="tb-toolbar tb-toolbar-end">{actions}</div>
    <div className="tb-roster-search"><SearchField value={query} onChange={setQuery} label="Find a roster" placeholder="Find a roster or faction…" /></div>
    <RosterFilterBar platform={env.device.system}
      all={<button type="button" className={`tb-filter tb-filter-start ${!attention && system === null ? 'active' : ''}`} aria-pressed={!attention && system === null} onClick={() => { setAttention(false); setSystem(null); }}>All {rosters.length}</button>}
      controls={filtersExpanded ? <>
        {bySystem && systems.map(s => <button type="button" key={s.name} className={`tb-filter tb-filter-system ${system === s.name ? 'active' : ''}`} aria-pressed={system === s.name} aria-label={`${s.name}, ${plural(s.count, 'roster')}`} title={s.name} onClick={() => setSystem(system === s.name ? null : s.name)}>{system === s.name && <Check size={16} aria-hidden="true" />}<span>{s.name}</span> {s.count}</button>)}
        {attentionCount > 0 && <button type="button" className={`tb-filter ${attention ? 'active' : ''}`} aria-pressed={attention} onClick={() => setAttention(!attention)}>{attention && <Check size={16} aria-hidden="true" />}Needs attention {attentionCount}</button>}
      </> : undefined}
      group={bySystem ? <GroupToggle on={grouped} onChange={setGrouped} input={env.input} /> : undefined}
      disclosure={filtersExpanded
        ? <button type="button" className="tb-filter tb-filter-end" aria-expanded={true} onClick={() => setFiltersExpanded(false)}>Less</button>
        : <button type="button" className={`tb-filter tb-filter-system tb-filter-end ${system !== null || attention ? 'active' : ''}`} aria-expanded={false} title={[system, attention ? 'Needs attention' : null].filter(Boolean).join(', ')} onClick={() => setFiltersExpanded(true)}><span>{['More', system, attention ? 'Needs attention' : null].filter(Boolean).join(' · ')}</span></button>} />
    <ListDetail env={env} label="Rosters" open={open} onClose={() => setOpen(false)}
      list={<>
        <div className="tb-list scroll">
          {groups ? groups.map(g => <section key={g.name} className="tb-group" aria-label={g.name}><GroupHeader name={g.name} count={g.rows.length} />{g.rows.map(row)}</section>) : visible.map(row)}
          {!visible.length && <EmptyState icon={Search} title={q ? `No rosters match “${query.trim()}”` : 'No rosters match the filters'} text="Try another name, or clear the filters."><button type="button" className="ux-job-btn" onClick={clearFilters}>Clear filters</button></EmptyState>}
        </div>
        <p className="tb-list-foot" aria-live="polite">{!filtered ? `${plural(rosters.length, 'roster')} stored on this device` : `${visible.length} of ${rosters.length} rosters`}{groups ? ` · ${plural(groups.length, 'game system')}` : ''}</p>
      </>}
      detail={current ? <>
        <div className="tb-detail-title"><span className="tb-mark large" aria-hidden="true">{current.mark}</span>
          {renaming ? <form className="tb-rename" onSubmit={e => { e.preventDefault(); rename(current, (new FormData(e.currentTarget).get('name') as string).trim()); }}><input name="name" autoFocus maxLength={60} defaultValue={current.name} aria-label="Roster name" /><button type="submit" className="ux-job-btn primary">Save</button></form>
            : <span><h2>{current.name}</h2><small>{current.faction} · {current.system}</small></span>}
          <StatusTile tone={noteTone} label={`${noteTitle}. ${noteText}`} expanded={statusOpen} onToggle={() => setStatusOpen(!statusOpen)} />
        </div>
        {statusOpen && <p className={`tb-note ${noteTone}`}><Info size={15} /><span><strong>{noteTitle}</strong>{noteText}</span></p>}
        <Meter used={current.used} limit={current.limit} />
        <FactsGrid rows={[['Game system', current.system], ['Units', current.units], ['Forces', current.forces], ['Last opened', current.opened]]} />
        <div className="tb-actions"><button type="button" className="ux-primary tb-primary" onClick={() => onOpenRoster(current.name)}>Open roster<ArrowRight size={17} /></button>
          <HintButton hint="Rename this roster" input={env.input} side="top" className="ux-job-btn" onClick={() => setRenaming(true)}><Pencil size={16} />Rename</HintButton>
          <HintButton hint="Make an editable copy" input={env.input} side="top" className="ux-job-btn" onClick={() => duplicate(current)}><Copy size={16} />Duplicate</HintButton>
          <HintButton hint="Export this roster as a file" input={env.input} side="top" className="ux-job-btn" onClick={() => notify(`“${current.name}” exported`)}><ArrowDownToLine size={16} />Export</HintButton>
          <HintButton hint="Delete this roster (asks first)" input={env.input} side="top" className="ux-job-btn destructive" onClick={() => session.setDeleting(current.name)}><Trash2 size={16} />Delete</HintButton></div>
      </> : null} />
  </div>;
}

/* --------------------------------- Lookup --------------------------------- */

const scopes = ['All', 'Unit', 'Rule', 'Equipment'] as const;
export function TabletLookup({ env, session, onAddData }: SessionProps & { onAddData: () => void }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<typeof scopes[number]>('All');
  const [selected, setSelected] = useState(lookupEntries[0].id);
  const [open, setOpen] = useState(false);
  const visible = useMemo(() => lookupEntries.filter(e => (scope === 'All' || e.kind === scope) && (e.name + e.owner).toLowerCase().includes(query.toLowerCase())), [query, scope]);
  const current: LookupEntry = lookupEntries.find(e => e.id === selected) ?? lookupEntries[0];
  if (!session.hasData) return <div className="tb-page"><EmptyState icon={BookOpen} title="Nothing to look up yet" text="Lookup searches the units, rules and equipment of your installed game data."><button type="button" className="ux-primary tb-primary" onClick={onAddData}><Database size={17} />Add game data</button></EmptyState></div>;
  return <div className="tb-page">
    <div className="tb-toolbar"><SearchField value={query} onChange={setQuery} label="Search the game data" placeholder="Search units, rules and equipment…" /></div>
    <div className="tb-filters" role="group" aria-label="Scope">{scopes.map(s => <button type="button" key={s} className={`tb-filter ${scope === s ? 'active' : ''}`} aria-pressed={scope === s} onClick={() => setScope(s)}>{s === 'All' ? 'All' : s === 'Equipment' ? 'Equipment' : `${s}s`}</button>)}</div>
    <ListDetail env={env} label="Lookup results" open={open} onClose={() => setOpen(false)}
      list={<div className="tb-list scroll">{visible.map(e => <Row key={e.id} selected={e.id === selected} title={e.name} sub={`${e.owner} · ${e.meta}`} end={e.cost ? <b>{e.cost}</b> : e.badge ? <MobileChip tone="neutral">{e.badge}</MobileChip> : null} onClick={() => { setSelected(e.id); setOpen(true); }} />)}{!visible.length && <p className="tb-empty">Nothing matches. Try another word or scope.</p>}</div>}
      detail={<>
        <div className="tb-detail-title"><span><h2>{current.name}</h2><small>{current.owner} · {current.source}</small></span><MobileChip tone="cool">{current.kind}</MobileChip></div>
        <p className="tb-body">{current.text}</p>
        {current.profile && <div className="tb-profile" role="table" aria-label="Profile">{['Move', 'Save', 'Resolve', 'Attacks'].map((h, i) => <span key={h} role="cell"><small>{h}</small><b>{current.profile?.[i]}</b></span>)}</div>}
        {current.conditional && <p className="tb-note"><Info size={15} />{current.conditional}</p>}
        {current.usedIn && <Facts rows={[['Used in', current.usedIn.join(', ')]]} />}
      </>} />
  </div>;
}

/* ------------------------------ Placeholders ------------------------------ */

export const TabletTools = () => <div className="tb-page tb-soon"><ComingSoonCard icon={Hammer} title="Tools" description="Roster analytics, comparison, a game tracker and a dice simulator, for when the roster is done and the game starts." planned="Planned for a later release" covers="" /></div>;
export const TabletLibrary = () => <div className="tb-page tb-soon"><ComingSoonCard icon={BookMarked} title="Library" description="Units and detachments you saved from your rosters, ready to reuse in the next one." planned="Planned for an early update" covers="" /></div>;
