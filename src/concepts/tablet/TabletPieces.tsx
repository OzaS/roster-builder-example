import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowUpCircle, Check, Info, Search } from 'lucide-react';
import { Chip as MobileChip } from '../ux/uxShared'; // the mobile chip; the workspace Chip (dtp-chip) is not used here, see MOBILE-PIECES.md
import { JobProgressBar } from '../ux/SourceJobs';
import { jobPercent, type Job } from '../workspace/Jobs';
import type { Notify } from '../workspace/Toasts';
import type { RosterSummary, SourceInfo } from '../desktop/desktopData';
import type { TabletEnv } from './tabletEnv';
import type { TabletSession } from './tabletSession';
import './tablet-pages.css';

// Pieces the tablet pages share: list and detail panes, rows, facts, the empty state, the install row and status chips.

export type PageProps = { env: TabletEnv; notify: Notify };
export type SessionProps = PageProps & { session: TabletSession };

/** Workspace controls (Segmented, Switch, Jobs) style their buttons under a `.dt-app` ancestor; this wrapper adds it without a box. */
export const WorkspaceScope = ({ light, children }: { light: boolean; children: ReactNode }) => <div className={`dt-app tb-shim ${light ? 'light' : ''}`}>{children}</div>;

export const pts = (n: number) => n.toLocaleString('en-US');
export const plural = (n: number, one: string, other = `${one}s`) => `${n} ${n === 1 ? one : other}`;
const meter = (used: number, limit: number) => ({ '--fill': `${Math.min(100, used / limit * 100)}%` }) as CSSProperties;
export const Meter = ({ used, limit }: { used: number; limit: number }) => <div className={`ux-meter ${used > limit ? 'over' : ''}`}>
  <div className="ux-meter-readout"><strong>{pts(used)}</strong><span>/ {pts(limit)} pts</span></div>
  <div className="ux-meter-track"><span style={meter(used, limit)} /></div>
</div>;

export const rosterStatus = (r: RosterSummary) => r.status === 'issues' ? <MobileChip tone="warning">{r.issues} {r.issues === 1 ? 'issue' : 'issues'}</MobileChip>
  : r.status === 'data-changed' ? <MobileChip tone="cool">Data changed</MobileChip>
    : r.status === 'faction-removed' ? <MobileChip tone="error">Faction removed</MobileChip>
      : <MobileChip tone="valid"><Check size={11} />Ready</MobileChip>;
export const sourceStatus = (s: SourceInfo) => s.status === 'update' ? <MobileChip tone="cool">Update {s.next}</MobileChip> : s.status === 'review' ? <MobileChip tone="warning">Review</MobileChip> : <MobileChip tone="valid"><Check size={11} />Up to date</MobileChip>;

export const narrow = (env: TabletEnv) => env.width < 700;

/** List and detail panes. Where the width is too small for both (split view), the list stays and the detail opens over it. */
export function ListDetail({ env, label, list, detail, open, onClose }: { env: TabletEnv; label: string; list: ReactNode; detail: ReactNode; open: boolean; onClose: () => void }) {
  if (!narrow(env)) return <div className="tb-panes"><section className="tb-pane" aria-label={label}>{list}</section><section className="tb-pane tb-detail" aria-label={`${label} details`}>{detail}</section></div>;
  return <div className="tb-panes single">
    <section className="tb-pane" aria-label={label}>{list}<p className="tb-split-note"><Info size={15} />At this width the detail opens over the list.</p></section>
    {open && <section className="tb-pane tb-detail over" aria-label={`${label} details`}><button type="button" className="ux-job-btn tb-back" onClick={onClose}><ArrowLeft size={16} />Back to the list</button>{detail}</section>}
  </div>;
}

export const SearchField = ({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder: string }) =>
  <label className="ux-search tb-search"><Search size={16} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={label} /></label>;

/** The shared tablet pane row (C-07, DEC-050) of Sources, Rosters and Settings: a 40 px mark or tile, a one-line bold title
 *  with an ellipsis, one secondary line, the trailing end (chip, points, chevron); 72 px tall on touch, 64 with a pointer;
 *  selected: accent border and tint. `pressed` makes it a toggle (Sources' Select mode) instead of a navigation row. */
export const Row = ({ selected, onClick, mark, title, sub, end, foot, pressed, label }: { selected: boolean; onClick: () => void; mark?: ReactNode; title: string; sub: string; end?: ReactNode; foot?: ReactNode; pressed?: boolean; label?: string }) =>
  <button type="button" className={`ux-list-card tb-row ${selected || pressed ? 'selected' : ''}`} aria-current={selected && pressed === undefined ? 'true' : undefined} aria-pressed={pressed} aria-label={label} onClick={onClick}>
    {mark && <span className="tb-mark" aria-hidden="true">{mark}</span>}
    <span className="tb-row-main"><strong>{title}</strong><small>{sub}</small>{foot}</span>
    {end && <span className="tb-row-end">{end}</span>}
  </button>;

export const Facts = ({ rows }: { rows: Array<[string, ReactNode]> }) => <div className="ux-src-group">{rows.map(([k, v]) => <div className="ux-src-kv" key={k}><span>{k}</span><b>{v}</b></div>)}</div>;

/** A page with nothing to list: icon, title, a line of text and the way forward. */
export const EmptyState = ({ icon: Icon, title, text, children }: { icon: ComponentType<{ size?: number }>; title: string; text: string; children?: ReactNode }) =>
  <div className="tb-empty-card" role="status"><span className="tb-empty-icon" aria-hidden="true"><Icon size={26} /></span><strong>{title}</strong><p>{text}</p>{children && <div className="tb-actions">{children}</div>}</div>;

export const Progress = ({ percent }: { percent: number }) => <JobProgressBar value={percent / 100} />;

/** A repository or game system you can install, with the state of its install: Install, live progress, Update or Installed. */
export function InstallRow({ title, sub, chips, live, installed, update, archived, onInstall, onUpdate, onShow, onJobs }: {
  title: string; sub: string; chips?: ReactNode; live?: Job; installed?: boolean; update?: boolean; archived?: boolean;
  onInstall: () => void; onUpdate?: () => void; onShow?: () => void; onJobs: () => void;
}) {
  const action = live ? <button type="button" className={`ux-job-btn ${live.status === 'needs-you' ? 'primary' : ''}`} onClick={onJobs}>{live.status === 'needs-you' ? 'Choose factions' : `${live.kind === 'update' ? 'Updating' : 'Installing'} ${jobPercent(live)}%`}</button>
    : update ? <button type="button" className="ux-job-btn" aria-label={`Update ${title}`} onClick={onUpdate}><ArrowUpCircle size={16} />Update</button>
      : installed ? <button type="button" className="ux-job-btn ux-src-ghost" aria-label={`${title} is installed. Show it`} onClick={onShow}><Check size={16} />Installed</button>
        : <button type="button" className="ux-job-btn" aria-label={`Install ${title}`} onClick={onInstall}><ArrowDownToLine size={16} />Install</button>;
  return <div className={`tb-install-row ${archived ? 'archived' : ''}`}>
    <span className="tb-row-main"><strong>{title}</strong><small>{sub}</small>{chips && <span className="tb-chips">{chips}</span>}{live && <Progress percent={jobPercent(live)} />}</span>
    {action}
  </div>;
}
