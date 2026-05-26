import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Roster } from "../../types";

type Props = {
  roster: Roster;
  onOpenUnit: (id: string) => void;
};

export function ValidationRail({ roster, onOpenUnit }: Props) {
  const units = roster.sections.flatMap((section) => section.units.map((unit) => ({ ...unit, sectionName: section.name })));
  const checks = units.filter((unit) => unit.status !== "valid");

  return (
    <aside className="v2-validation-rail">
      <header>
        <strong>Roster checks</strong>
        <small>{checks.length} items</small>
      </header>
      {checks.length === 0 ? (
        <div className="v2-check-row ok">
          <CheckCircle2 size={17} />
          <span>Roster is valid.</span>
        </div>
      ) : (
        checks.map((unit) => (
          <button className="v2-check-row" key={unit.id} type="button" onClick={() => onOpenUnit(unit.id)}>
            <AlertTriangle size={17} />
            <span>
              <strong>{unit.name}</strong>
              <small>{unit.note ?? unit.sectionName}</small>
            </span>
          </button>
        ))
      )}
    </aside>
  );
}
