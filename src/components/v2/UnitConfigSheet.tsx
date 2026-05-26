import { AlertTriangle, Check, Plus } from "lucide-react";
import type { RosterUnit } from "../../types";

type Props = {
  unit: RosterUnit;
  onToggleOption: (id: string) => void;
  onValidate: () => void;
};

export function UnitConfigSheet({ unit, onToggleOption, onValidate }: Props) {
  return (
    <section className="v2-config-sheet">
      <header>
        <span>
          <small>Configure unit</small>
          <strong>{unit.name}</strong>
        </span>
        <b>{unit.points} pts</b>
      </header>
      <div className="v2-keywords">
        {unit.keywords.map((keyword) => (
          <span key={keyword}>{keyword}</span>
        ))}
      </div>
      <div className="v2-option-list">
        {unit.options.map((option) => (
          <button className={option.selected ? "selected" : ""} key={option.id} type="button" onClick={() => onToggleOption(option.id)}>
            <span>{option.selected ? <Check size={16} /> : <Plus size={16} />}</span>
            <strong>{option.name}</strong>
            <small>{option.points > 0 ? `+${option.points}` : "free"}</small>
          </button>
        ))}
      </div>
      <button className="v2-sheet-action" type="button" onClick={onValidate}>
        <AlertTriangle size={17} />
        Review roster checks
      </button>
    </section>
  );
}
