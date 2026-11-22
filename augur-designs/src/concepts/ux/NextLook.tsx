import { useState } from "react";
import { AlertTriangle, ChevronDown, CircleAlert, CircleCheck } from "lucide-react";
import type { Roster } from "../../types";
import { budget, rosterChecks } from "./uxShared";

/**
 * Pieces drawn only by the proposed look ("next", see src/look.ts). Nothing here is approved (DEC-051).
 */

const n = (value: number) => value.toLocaleString("en-US");

/**
 * The roster budget as one strip: used / limit · open on the left, the issue counts on the right, the progress bar
 * as the strip's bottom edge. With other limited costs the left part expands them, as the approved budget does.
 */
export function NextBudgetStrip({ roster, onIssues }: { roster: Roster; onIssues?: () => void }) {
  const [open, setOpen] = useState(false);
  const b = budget(roster);
  const limits = (roster.limits ?? []).filter((limit) => limit.limit !== 0 || limit.used !== 0);
  const checks = rosterChecks(roster);
  const errors = checks.filter((unit) => unit.status === "error").length;
  const warnings = checks.length - errors;
  const readout = <><strong>{n(b.used)}</strong><span>/ {n(b.limit)} pts · {b.over ? `${n(b.used - b.limit)} over` : `${n(b.open)} open`}</span></>;
  return (
    <div className={`ux-nx-budget ${b.over ? "over" : ""} ${open ? "open" : ""}`}>
      {limits.length ? (
        <button type="button" className="ux-nx-budget-main" aria-expanded={open} aria-label={`${n(b.used)} of ${n(b.limit)} points. ${open ? "Hide other limits" : `Show ${limits.length} other limits`}`} onClick={() => setOpen((value) => !value)}>
          {readout}<ChevronDown size={14} className="ux-nx-budget-caret" aria-hidden />
        </button>
      ) : <div className="ux-nx-budget-main">{readout}</div>}
      {checks.length ? (
        <button type="button" className="ux-nx-budget-issues" aria-label={`Show issues: ${warnings} warnings, ${errors} errors`} onClick={onIssues}>
          {warnings ? <span className="warn"><AlertTriangle size={14} aria-hidden />{warnings}</span> : null}
          {errors ? <span className="err"><CircleAlert size={14} aria-hidden />{errors}</span> : null}
        </button>
      ) : <span className="ux-nx-budget-ok"><CircleCheck size={14} aria-hidden />No issues</span>}
      {open ? (
        <ul className="ux-nx-budget-limits">
          {limits.map((limit) => <li key={limit.id} className={limit.used > limit.limit ? "over" : ""}><b>{limit.used}</b> / {limit.limit} {limit.label}</li>)}
        </ul>
      ) : null}
      <span className="ux-nx-budget-bar" role="progressbar" aria-label="Roster points used" aria-valuemin={0} aria-valuemax={b.limit} aria-valuenow={b.used}><i style={{ width: `${b.percent}%` }} /></span>
    </div>
  );
}
