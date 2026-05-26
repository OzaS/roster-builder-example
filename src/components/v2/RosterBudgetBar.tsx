import type { Roster } from "../../types";

type Props = {
  roster: Roster;
  label?: string;
  compact?: boolean;
};

export function RosterBudgetBar({ roster, label = "Points budget", compact = false }: Props) {
  const percent = Math.min(100, Math.round((roster.pointsUsed / roster.pointsLimit) * 100));

  return (
    <div className={`v2-budget ${compact ? "compact" : ""}`}>
      <div>
        <span>{label}</span>
        <strong>{roster.pointsUsed} / {roster.pointsLimit}</strong>
      </div>
      <div className="v2-budget-track">
        <span style={{ width: `${percent}%` }} />
      </div>
      <small>{roster.pointsLimit - roster.pointsUsed} points open</small>
    </div>
  );
}
