import { AlertTriangle, ChevronRight, Lock, Plus } from "lucide-react";
import type { RosterUnit } from "../../types";

type Props = {
  unit: RosterUnit;
  selected?: boolean;
  onOpen: (id: string) => void;
  onCountChange?: (id: string, delta: number) => void;
};

export function InlineUnitRow({ unit, selected = false, onOpen, onCountChange }: Props) {
  return (
    <button className={`v2-unit-row ${selected ? "selected" : ""} ${unit.availability}`} type="button" onClick={() => onOpen(unit.id)}>
      <span className="v2-unit-status">
        {unit.availability === "locked" ? <Lock size={16} /> : unit.status === "warning" || unit.status === "error" ? <AlertTriangle size={16} /> : <Plus size={16} />}
      </span>
      <span className="v2-unit-copy">
        <strong>{unit.name}</strong>
        <small>{unit.role} · {unit.slotImpact}</small>
      </span>
      <span className="v2-unit-meta">
        <b>{unit.points}</b>
        <small>{unit.count} models</small>
      </span>
      <span className="v2-row-count" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={() => onCountChange?.(unit.id, -1)}>-</button>
        <b>{unit.count}</b>
        <button type="button" onClick={() => onCountChange?.(unit.id, 1)}>+</button>
      </span>
      <ChevronRight size={17} />
    </button>
  );
}
