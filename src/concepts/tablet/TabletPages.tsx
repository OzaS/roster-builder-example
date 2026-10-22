import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Copy, FileUp, Hammer, Info, Pencil, Plus, RefreshCcw, Search, BookMarked } from 'lucide-react';
import { Chip as MobileChip } from '../ux/uxShared'; // the mobile chip; the workspace Chip (dtp-chip) is not used here, see MOBILE-PIECES.md
import { ComingSoonCard } from '../ux/AppExtras';
import { Segmented, Switch } from '../workspace/Primitives';
import type { Notify } from '../workspace/Toasts';
import { colourSchemes, installedSources, lookupEntries, rosterLibrary, type LookupEntry, type RosterSummary, type SourceInfo } from '../desktop/desktopData';
import type { ColorScheme } from '../../types';
import type { TabletEnv } from './tabletEnv';
import { HintButton } from './TabletHint';

// Minimal pages of the tablet (T0b): the layout skeleton per width class with synthetic rows. T1/T2 design the real pages.

export type PageProps = { env: TabletEnv; notify: Notify };
type ThemePref = 'system' | 'light' | 'dark';

/** Workspace controls (Segmented, Switch) style their buttons under a `.dt-app` ancestor; this wrapper adds it without a box. */
const WorkspaceScope = ({ light, children }: { light: boolean; children: ReactNode }) => <div className={`dt-app tb-shim ${light ? 'light' : ''}`}>{children}</div>;

const pts = (n: number) => n.toLocaleString('en-US');
const meter = (used: number, limit: number) => ({ '--fill': `${Math.min(100, used / limit * 100)}%` }) as CSSProperties;
const Meter = ({ used, limit }: { used: number; limit: number }) => <div className={`ux-meter ${used > limit ? 'over' : ''}`}>
  <div className="ux-meter-readout"><strong>{pts(used)}</strong><span>/ {pts(limit)} pts</span></div>
  <div className="ux-meter-track"><span style={meter(used, limit)} /></div>
</div>;

const rosterStatus = (r: RosterSummary) => r.status === 'issues' ? <MobileChip tone="warning">{r.issues} {r.issues === 1 ? 'issue' : 'issues'}</MobileChip>
  : r.status === 'data-changed' ? <MobileChip tone="cool">Data changed</MobileChip>
    : r.status === 'faction-removed' ? <MobileChip tone="error">Faction removed</MobileChip>
      : <MobileChip tone="valid"><Check size={11} />Ready</MobileChip>;
const sourceStatus = (s: SourceInfo) => s.status === 'update' ? <MobileChip tone="cool">Update {s.next}</MobileChip> : s.status === 'review' ? <MobileChip tone="warning">Review</MobileChip> : <MobileChip tone="valid"><Check size={11} />Up to date</MobileChip>;

/* ------------------------- shared skeleton pieces ------------------------- */

const narrow = (env: TabletEnv) => env.device.width < 700;

/** List and detail panes. Where the width is too small for both (split view), the list stays and the detail opens over it. */
function ListDetail({ env, label, list, detail, open, onClose }: { env: TabletEnv; label: string; list: ReactNode; detail: ReactNode; open: boolean; onClose: () => void }) {
  if (!narrow(env)) return <div className="tb-panes"><section className="tb-pane" aria-label={label}>{list}</section><section className="tb-pane tb-detail" aria-label={`${label} details`}>{detail}</section></div>;
  return <div className="tb-panes single">
    <section className="tb-pane" aria-label={label}>{list}<p className="tb-split-note"><Info size={15} />At this width the detail opens over the list.</p></section>
    {open && <section className="tb-pane tb-detail over" aria-label={`${label} details`}><button type="button" className="ux-job-btn tb-back" onClick={onClose}><ArrowLeft size={16} />Back to the list</button>{detail}</section>}
  </div>;
}

const SearchField = ({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder: string }) =>
  <label className="ux-search tb-search"><Search size={16} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={label} /></label>;

const Row = ({ selected, onClick, mark, title, sub, end }: { selected: boolean; onClick: () => void; mark?: string; title: string; sub: string; end?: ReactNode }) =>
  <button type="button" className={`ux-list-card tb-row ${selected ? 'selected' : ''}`} aria-current={selected ? 'true' : undefined} onClick={onClick}>
    {mark && <span className="tb-mark" aria-hidden="true">{mark}</span>}
    <span className="tb-row-main"><strong>{title}</strong><small>{sub}</small></span>
    {end && <span className="tb-row-end">{end}</span>}
  </button>;

const Facts = ({ rows }: { rows: Array<[string, ReactNode]> }) => <div className="ux-src-group">{rows.map(([k, v]) => <div className="ux-src-kv" key={k}><span>{k}</span><b>{v}</b></div>)}</div>;

/* --------------------------------- Home --------------------------------- */

export function TabletHome({ env, notify, onPage, onNewRoster }: PageProps & { onPage: (page: 'rosters' | 'sources') => void; onNewRoster: () => void }) {
  const recent = rosterLibrary.slice(0, 4);
  const current = rosterLibrary[0];
  const update = installedSources[0];
  return <div className="tb-page tb-home">
    <div className="tb-home-main">
      <section className="tb-card tb-continue" aria-label="Continue roster">
        <span className="ux-result-label">Continue</span>
        <div className="tb-continue-head"><span className="tb-mark large" aria-hidden="true">{current.mark}</span><span><strong>{current.name}</strong><small>{current.faction} · {current.system} · opened {current.opened}</small></span></div>
        <Meter used={current.used} limit={current.limit} />
        <div className="tb-actions">
          <HintButton hint="Open the roster you were editing" input={env.input} side="top" className="ux-primary tb-primary" onClick={() => notify(`Opening “${current.name}” (prototype)`)}>Continue roster<ArrowRight size={17} /></HintButton>
          <HintButton hint="Create a roster" input={env.input} side="top" className="ux-job-btn" onClick={onNewRoster}><Plus size={17} />New roster</HintButton>
        </div>
      </section>
      <section className="tb-section" aria-label="Recent rosters">
        <div className="tb-section-head"><span className="ux-result-label">Recent rosters</span><button type="button" className="ux-job-btn ux-src-ghost" onClick={() => onPage('rosters')}>All rosters<ChevronRight size={15} /></button></div>
        <div className="tb-list">{recent.map((r, i) => <Row key={r.name} selected={false} mark={r.mark} title={r.name} sub={`${r.faction} · ${r.opened}`} end={<><b>{pts(r.used)} / {pts(r.limit)}</b>{i === 2 ? rosterStatus(r) : null}</>} onClick={() => notify(`Opening “${r.name}” (prototype)`)} />)}</div>
      </section>
    </div>
    <aside className="tb-home-side" aria-label="Data status">
      <section className="tb-card">
        <span className="ux-result-label">Game data</span>
        <div className="tb-data-row"><span><strong>{update.name}</strong><small>{update.version} · checked {update.checked}</small></span>{sourceStatus(update)}</div>
        <p className="tb-note">Version {update.next} is available. Your rosters stay on {update.version} until you update.</p>
        <div className="tb-actions"><HintButton hint="Download the new version and check your rosters" input={env.input} side="top" className="ux-job-btn primary" onClick={() => notify(`Updating ${update.name} to ${update.next} (prototype)`)}><RefreshCcw size={16} />Update</HintButton><button type="button" className="ux-job-btn" onClick={() => onPage('sources')}>Sources</button></div>
      </section>
      <section className="tb-card">
        <span className="ux-result-label">On this device</span>
        <Facts rows={[['Rosters', rosterLibrary.length], ['Game systems', installedSources.length], ['Needs attention', rosterLibrary.filter(r => r.status !== 'ready').length]]} />
      </section>
    </aside>
  </div>;
}

/* -------------------------------- Rosters -------------------------------- */

export function TabletRosters({ env, notify, onNewRoster }: PageProps & { onNewRoster: () => void }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(rosterLibrary[0].name);
  const [open, setOpen] = useState(false);
  const visible = useMemo(() => rosterLibrary.filter(r => (r.name + r.faction).toLowerCase().includes(query.toLowerCase())), [query]);
  const current = rosterLibrary.find(r => r.name === selected) ?? rosterLibrary[0];
  return <div className="tb-page">
    <div className="tb-toolbar"><SearchField value={query} onChange={setQuery} label="Find a roster" placeholder="Find a roster or faction…" />
      <HintButton hint="Import a roster from a file" input={env.input} side="bottom" className="ux-job-btn" onClick={() => notify('Import a roster file (prototype)')}><FileUp size={16} />Import</HintButton>
      <HintButton hint="Create a roster" input={env.input} side="bottom" className="ux-job-btn primary" onClick={onNewRoster}><Plus size={16} />New roster</HintButton></div>
    <ListDetail env={env} label="Rosters" open={open} onClose={() => setOpen(false)}
      list={<div className="tb-list scroll">{visible.map(r => <Row key={r.name} selected={r.name === selected} mark={r.mark} title={r.name} sub={`${r.faction} · ${r.system}`} end={<><b>{pts(r.used)} / {pts(r.limit)}</b>{rosterStatus(r)}</>} onClick={() => { setSelected(r.name); setOpen(true); }} />)}{!visible.length && <p className="tb-empty">No rosters match “{query}”.</p>}</div>}
      detail={<>
        <div className="tb-detail-title"><span className="tb-mark large" aria-hidden="true">{current.mark}</span><span><h2>{current.name}</h2><small>{current.faction} · {current.system}</small></span></div>
        <Meter used={current.used} limit={current.limit} />
        <Facts rows={[['Status', rosterStatus(current)], ['Forces', current.forces], ['Units', current.units], ['Last opened', current.opened]]} />
        <div className="tb-actions"><button type="button" className="ux-primary tb-primary" onClick={() => notify(`Opening “${current.name}” (prototype)`)}>Open roster<ArrowRight size={17} /></button><HintButton hint="Rename this roster" input={env.input} side="top" className="ux-job-btn" onClick={() => notify('Rename (prototype)')}><Pencil size={16} />Rename</HintButton><HintButton hint="Make an editable copy" input={env.input} side="top" className="ux-job-btn" onClick={() => notify(`Duplicated “${current.name}” (prototype)`)}><Copy size={16} />Duplicate</HintButton></div>
      </>} />
  </div>;
}

/* --------------------------------- Lookup --------------------------------- */

const scopes = ['All', 'Unit', 'Rule', 'Equipment'] as const;
export function TabletLookup({ env }: PageProps) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<typeof scopes[number]>('All');
  const [selected, setSelected] = useState(lookupEntries[0].id);
  const [open, setOpen] = useState(false);
  const visible = useMemo(() => lookupEntries.filter(e => (scope === 'All' || e.kind === scope) && (e.name + e.owner).toLowerCase().includes(query.toLowerCase())), [query, scope]);
  const current: LookupEntry = lookupEntries.find(e => e.id === selected) ?? lookupEntries[0];
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

/* --------------------------------- Sources --------------------------------- */

export function TabletSources({ env, notify }: PageProps) {
  const [selected, setSelected] = useState(installedSources[0].id);
  const [open, setOpen] = useState(false);
  const current = installedSources.find(s => s.id === selected) ?? installedSources[0];
  return <div className="tb-page">
    <div className="tb-toolbar"><span className="tb-toolbar-note">{installedSources.length} game systems installed. Everything works offline.</span>
      <HintButton hint="Add game data from a collection, a link or a file" input={env.input} side="bottom" className="ux-job-btn" onClick={() => notify('Add game data (prototype)')}><Plus size={16} />Add game data</HintButton></div>
    <ListDetail env={env} label="Installed sources" open={open} onClose={() => setOpen(false)}
      list={<div className="tb-list scroll">{installedSources.map(s => <Row key={s.id} selected={s.id === selected} title={s.name} sub={`${s.version} · ${s.factions.length} factions · ${s.size}`} end={sourceStatus(s)} onClick={() => { setSelected(s.id); setOpen(true); }} />)}</div>}
      detail={<>
        <div className="tb-detail-title"><span><h2>{current.name}</h2><small>{current.repo}</small></span>{sourceStatus(current)}</div>
        <Facts rows={[['Version', current.version], ['Installed', current.installed], ['Checked', current.checked], ['Size', current.size], ['Data files', current.documents], ['Rosters using it', current.rosters.length]]} />
        <div className="tb-actions">{current.status === 'update' && <button type="button" className="ux-job-btn primary" onClick={() => notify(`Updating ${current.name} to ${current.next} (prototype)`)}><RefreshCcw size={16} />Update to {current.next}</button>}<button type="button" className="ux-job-btn" onClick={() => notify('Checked for updates (prototype)')}>Check for updates</button></div>
      </>} />
  </div>;
}

/* --------------------------------- Settings --------------------------------- */

const settingSections = [
  { id: 'appearance', label: 'Appearance', sub: 'Theme and colour scheme' },
  { id: 'language', label: 'Language', sub: 'English' },
  { id: 'rosters', label: 'Rosters', sub: 'Defaults for new rosters' },
  { id: 'data', label: 'Game data', sub: 'Updates and installation' },
  { id: 'storage', label: 'Storage', sub: '53.2 MB used' },
  { id: 'about', label: 'About', sub: 'Version and licences' },
];
export function TabletSettings({ env, themePref, light, scheme, onTheme, onScheme }: PageProps & { themePref: ThemePref; light: boolean; scheme: ColorScheme; onTheme: (t: ThemePref) => void; onScheme: (s: ColorScheme) => void }) {
  const [section, setSection] = useState('appearance');
  const [open, setOpen] = useState(false);
  const [checks, setChecks] = useState(true);
  const [advanced, setAdvanced] = useState(false);
  const current = settingSections.find(s => s.id === section) ?? settingSections[0];
  return <div className="tb-page">
    <ListDetail env={env} label="Settings" open={open} onClose={() => setOpen(false)}
      list={<div className="tb-list scroll">{settingSections.map(s => <Row key={s.id} selected={s.id === section} title={s.label} sub={s.sub} end={<ChevronRight size={17} />} onClick={() => { setSection(s.id); setOpen(true); }} />)}</div>}
      detail={<>
        <div className="tb-detail-title"><span><h2>{current.label}</h2><small>{current.sub}</small></span></div>
        {section === 'appearance' ? <>
          <WorkspaceScope light={light}><div className="tb-setting"><strong>Theme</strong><Segmented<ThemePref> label="Theme" value={themePref} onChange={onTheme} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /></div></WorkspaceScope>
          <div className="tb-schemes" role="radiogroup" aria-label="Colour scheme">{colourSchemes.map(c => <button type="button" key={c.id} role="radio" aria-checked={scheme === c.id} className={`ux-start-row tb-scheme ${scheme === c.id ? 'on' : ''}`} onClick={() => onScheme(c.id)}><i style={{ background: c.accent }} /><span><strong>{c.name}</strong></span>{scheme === c.id && <Check size={18} />}</button>)}</div>
        </> : section === 'data' ? <WorkspaceScope light={light}><div className="ux-src-group tb-switches"><Switch label="Check for updates automatically" detail="When the app is open and online." checked={checks} onChange={setChecks} /><Switch label="Advanced installation" detail="Choose which factions to install. Off: everything is installed." checked={advanced} onChange={setAdvanced} /></div></WorkspaceScope>
          : <Facts rows={[['Setting', 'Placeholder'], ['Designed in', 'T2 · Pages']]} />}
      </>} />
  </div>;
}

/* ------------------------------ Placeholders ------------------------------ */

export const TabletTools = () => <div className="tb-page tb-soon"><ComingSoonCard icon={Hammer} title="Tools" description="Roster analytics, comparison, a game tracker and a dice simulator, for when the roster is done and the game starts." planned="Planned for 1.2+" covers="" /></div>;
export const TabletLibrary = () => <div className="tb-page tb-soon"><ComingSoonCard icon={BookMarked} title="Library" description="Units and detachments you saved from your rosters, ready to reuse in the next one." planned="Planned for 1.2+" covers="" /></div>;
