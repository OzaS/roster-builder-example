import type { ReactNode } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Database, Flag, Shield } from 'lucide-react';
import './workspace.css';

// The points button, the thin points line under the tabs and the roster summary popover. They know nothing about
// the roster document: totals, limits and every action come in as props. A limit of 0 means "no limit".

const over = (total: number, limit: number) => limit !== 0 && total > limit;
const percent = (total: number, limit: number) => limit === 0 ? 0 : Math.min(total / limit * 100, 100);
const limitText = (limit: number) => limit === 0 ? '∞' : limit.toLocaleString();

/** The "860 / 1,000 pts" button in the window chrome; it opens the summary popover. */
export function SummaryToggle({ total, limit, open, onToggle }: { total: number; limit: number; open: boolean; onToggle: () => void }) {
  return <button type="button" className={`dt-summary-toggle ${open ? 'active' : ''} ${over(total, limit) ? 'over' : ''}`} aria-expanded={open} aria-controls="dt-roster-summary" title="Roster summary" onClick={onToggle}><b>{total.toLocaleString()}</b> / {limitText(limit)} pts{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>;
}

/** Thin progress line along the bottom edge of the tab row (shown while the popover is closed). */
export function PointsLine({ total, limit }: { total: number; limit: number }) {
  return <div className={`dt-tab-progress ${over(total, limit) ? 'over' : ''}`} role="progressbar" aria-label="Points used" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={total}><i style={{ width: `${percent(total, limit)}%` }} /></div>;
}

export type SummaryAction = { label: string; icon: ReactNode; kbd?: string; onClick: () => void };

export function RosterSummary({ name, faction, force, total, limit, issueCount, data, actions, onLimit, onShowIssues }: {
  name: string; faction: string; force: string; total: number; limit: number; issueCount: number;
  data: { name: string; version: string; onClick: () => void };
  actions: SummaryAction[];
  onLimit: (limit: number) => void; onShowIssues: () => void;
}) {
  const isOver = over(total, limit);
  return <section id="dt-roster-summary" className="dt-summary" aria-label="Roster summary">
    <header><h2>{name}</h2><p>{faction} <span>·</span> {force}</p></header>
    <div className="dt-summary-budget"><strong className={isOver ? 'dt-warning' : ''}>{total.toLocaleString()} <small>/ {limitText(limit)} pts</small></strong><div className={`dt-progress ${isOver ? 'over' : ''}`}><i style={{ width: `${percent(total, limit)}%` }} /></div><span>{limit === 0 ? 'No points limit' : total <= limit ? `${limit - total} points available` : `${total - limit} points over limit`}</span></div>
    <div className="dt-summary-rows">
      <label><Flag size={15} /><span>Points limit</span><select aria-label="Points limit" value={limit} onChange={e => onLimit(Number(e.target.value))}>{Array.from(new Set([500, 1000, 1500, 2000, limit])).sort((a, b) => a - b).map(v => <option key={v} value={v}>{v ? `${v.toLocaleString()} pts` : 'No limit'}</option>)}</select></label>
      <button onClick={onShowIssues}><Shield size={15} /><span>{issueCount ? `${issueCount} ${issueCount === 1 ? 'item needs' : 'items need'} attention` : 'Your force is ready'}</span><ChevronRight size={14} /></button>
      <button onClick={data.onClick}><Database size={15} /><span>{data.name}</span><small>{data.version}</small><ChevronRight size={14} /></button>
    </div>
    <div className="dt-summary-rows">{actions.map(a => <button key={a.label} onClick={a.onClick}>{a.icon}<span>{a.label}</span>{a.kbd && <kbd>{a.kbd}</kbd>}</button>)}</div>
  </section>;
}
