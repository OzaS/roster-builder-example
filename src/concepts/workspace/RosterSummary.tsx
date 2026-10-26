import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, ChevronUp, Database, Flag, Shield, ShieldAlert } from 'lucide-react';
import './workspace.css';

// The points button, the thin points line under the tabs and the roster summary popover. They know nothing about
// the roster document: totals, limits and every action come in as props. A limit of 0 means "no limit".

const over = (total: number, limit: number) => limit !== 0 && total > limit;
const percent = (total: number, limit: number) => limit === 0 ? 0 : Math.min(total / limit * 100, 100);
const limitText = (limit: number) => limit === 0 ? '∞' : limit.toLocaleString();
const configurationWarning = (limit: number, allowance?: number) => allowance !== undefined && limit > allowance ? `The configuration allows ${allowance.toLocaleString()} pts` : undefined;

const issueText = (count: number) => `${count} ${count === 1 ? 'item needs' : 'items need'} attention`;

/**
 * The "860 / 1,000 pts" button in the window chrome; it opens the summary popover. DX-01: `issueCount` (the roster
 * check's problems) shows as a toned count beside the points, after the configuration warning; nothing when it is ready.
 */
export function SummaryToggle({ total, limit, open, onToggle, configurationLimit, issueCount = 0 }: { total: number; limit: number; open: boolean; onToggle: () => void; configurationLimit?: number; issueCount?: number }) {
  const warning = configurationWarning(limit, configurationLimit);
  const title = ['Roster summary', warning, issueCount ? issueText(issueCount) : undefined].filter(Boolean).join('. ');
  return <button type="button" className={`dt-summary-toggle ${open ? 'active' : ''} ${over(total, limit) ? 'over' : ''} ${warning ? 'configuration-warning' : ''}`} aria-expanded={open} aria-controls="dt-roster-summary" title={title} onClick={onToggle}>{warning && <AlertTriangle size={14} />}{issueCount > 0 && <span className="dt-summary-check"><ShieldAlert size={13} />{issueCount}</span>}<b>{total.toLocaleString()}</b> / {limitText(limit)} pts{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>;
}

/** Thin progress line along the bottom edge of the tab row (shown while the popover is closed). */
export function PointsLine({ total, limit, configurationLimit }: { total: number; limit: number; configurationLimit?: number }) {
  const warning = configurationWarning(limit, configurationLimit);
  return <div className={`dt-tab-progress ${over(total, limit) || warning ? 'over' : ''}`} role="progressbar" aria-label="Points used" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={total} aria-valuetext={warning} title={warning}><i style={{ width: `${percent(total, limit)}%` }} /></div>;
}

export type SummaryAction = { label: string; icon: ReactNode; kbd?: string; onClick: () => void };

/**
 * `details`: optional content under the status rows (the tablet lists the issues there with Show). `issues`: the desktop's
 * issue list (DX-01), an expanded section right under the status row, which then opens and closes it (`issuesOpen`).
 * `paused`: the roster is not checked (read only without its data); the status row says so and does not expand.
 */
export function RosterSummary({ name, faction, force, total, limit, issueCount, data, actions, onLimit, onShowIssues, details, issues, issuesOpen = false, paused = false, configurationLimit, customLimit = false }: {
  name: string; faction: string; force: string; total: number; limit: number; issueCount: number;
  details?: ReactNode; issues?: ReactNode; issuesOpen?: boolean; paused?: boolean;
  configurationLimit?: number; customLimit?: boolean;
  data: { name: string; version: string; onClick: () => void };
  actions: SummaryAction[];
  onLimit: (limit: number) => void; onShowIssues: () => void;
}) {
  const isOver = over(total, limit);
  const warning = configurationWarning(limit, configurationLimit);
  const [custom, setCustom] = useState(false);
  const [draft, setDraft] = useState(String(limit));
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => { if (custom) { field.current?.focus(); field.current?.select(); } }, [custom]);
  const choices = Array.from(new Set([0, ...(customLimit ? [1000, 2000, 3000] : [500, 1000, 1500, 2000]), limit, ...(configurationLimit === undefined ? [] : [configurationLimit])])).sort((a, b) => a - b);
  return <section id="dt-roster-summary" className="dt-summary" aria-label="Roster summary">
    <header><h2>{name}</h2><p>{faction} <span>·</span> {force}</p></header>
    {warning && <p className="dt-configuration-warning"><AlertTriangle size={15} />{warning}</p>}
    <div className="dt-summary-budget"><strong className={isOver ? 'dt-warning' : ''}>{total.toLocaleString()} <small>/ {limitText(limit)} pts</small></strong><div className={`dt-progress ${isOver ? 'over' : ''}`}><i style={{ width: `${percent(total, limit)}%` }} /></div><span>{limit === 0 ? 'No points limit' : total <= limit ? `${limit - total} points available` : `${total - limit} points over limit`}</span></div>
    <div className="dt-summary-rows">
      <label><Flag size={15} /><span>Points limit</span><select aria-label="Points limit" value={custom ? 'custom' : limit} onChange={e => { if (e.target.value === 'custom') { setDraft(String(limit)); setCustom(true); } else { setCustom(false); onLimit(Number(e.target.value)); } }}>{choices.map(v => <option key={v} value={v}>{v ? `${v.toLocaleString()} pts` : configurationLimit === undefined ? 'Unlimited' : `Use data limit (${configurationLimit.toLocaleString()} pts)`}</option>)}{customLimit && <option value="custom">Custom…</option>}</select></label>
      {custom && <form className="dt-custom-limit" onSubmit={e => { e.preventDefault(); const value = Number(draft); if (Number.isFinite(value) && value > 0) { onLimit(value); setCustom(false); } }}><input ref={field} aria-label="Custom points limit" type="number" min="0" step="any" required value={draft} onChange={e => setDraft(e.target.value)} /><button type="submit" disabled={!Number.isFinite(Number(draft)) || Number(draft) <= 0}>Apply</button></form>}
      {paused ? <p className="dt-summary-status paused"><Shield size={15} /><span>Validation paused<small>Not checked while read-only</small></span></p>
        : issues === undefined ? <button onClick={onShowIssues}><Shield size={15} /><span>{issueCount ? issueText(issueCount) : 'Your force is ready'}</span><ChevronRight size={14} /></button>
        : <button className={`dt-summary-status ${issueCount ? 'has-issues' : 'ready'}`} aria-expanded={issuesOpen} aria-controls="dte-check-details" title={issuesOpen ? 'Hide the issues' : 'Show the issues'} onClick={onShowIssues}>{issueCount ? <ShieldAlert size={15} /> : <Shield size={15} />}<span>{issueCount ? issueText(issueCount) : 'Your force is ready'}</span>{issuesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>}
      {issuesOpen && !paused && issues}
      <button onClick={data.onClick}><Database size={15} /><span>{data.name}</span><small>{data.version}</small><ChevronRight size={14} /></button>
    </div>
    {details}
    <div className="dt-summary-rows">{actions.map(a => <button key={a.label} onClick={a.onClick}>{a.icon}<span>{a.label}</span>{a.kbd && <kbd>{a.kbd}</kbd>}</button>)}</div>
  </section>;
}
