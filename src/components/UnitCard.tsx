import { ChevronRight, Minus, Plus } from "lucide-react";
import type { RosterUnit } from "../types";
import { ValidationBadge } from "./ValidationBadge";

type Props = {
  unit: RosterUnit;
  selected: boolean;
  onSelect: (id: string) => void;
  onCountChange?: (id: string, delta: number) => void;
  dense?: boolean;
};

export function UnitCard({ unit, selected, onSelect, onCountChange, dense = false }: Props) {
  return (
    <article className={`unit-card ${selected ? "selected" : ""} ${dense ? "dense" : ""}`}>
      <button className="unit-main" onClick={() => onSelect(unit.id)} type="button">
        <span>
          <strong>{unit.name}</strong>
          <small>{unit.role}</small>
        </span>
        <span className="unit-meta">
          <b>{unit.points} pts</b>
          <ChevronRight size={17} />
        </span>
      </button>
      <div className="unit-footer">
        <ValidationBadge status={unit.status} />
        <div className="count-stepper" aria-label={`${unit.name} model count`}>
          <button type="button" onClick={() => onCountChange?.(unit.id, -1)}>
            <Minus size={13} />
          </button>
          <span>{unit.count}</span>
          <button type="button" onClick={() => onCountChange?.(unit.id, 1)}>
            <Plus size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}
