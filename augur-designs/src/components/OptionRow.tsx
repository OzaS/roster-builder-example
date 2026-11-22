import { Check, Plus } from "lucide-react";
import type { RosterOption } from "../types";

type Props = {
  option: RosterOption;
  onToggle: (id: string) => void;
  compact?: boolean;
};

export function OptionRow({ option, onToggle, compact = false }: Props) {
  return (
    <button
      className={`option-row ${option.selected ? "selected" : ""} ${compact ? "compact" : ""}`}
      disabled={option.disabled}
      onClick={() => onToggle(option.id)}
      type="button"
    >
      <span className="option-mark">{option.selected ? <Check size={15} /> : <Plus size={15} />}</span>
      <span className="option-copy">
        <strong>{option.name}</strong>
        <small>{option.group}</small>
      </span>
      <span className="option-points">{option.points > 0 ? `+${option.points}` : "free"}</span>
    </button>
  );
}
