import type { PrototypeScreen } from "../../types";

type Props = {
  active: PrototypeScreen;
  items?: Array<{ id: PrototypeScreen; label: string }>;
  onNavigate: (screen: PrototypeScreen) => void;
};

export function SegmentedNav({ active, onNavigate, items = defaultItems }: Props) {
  return (
    <nav className="v2-segmented" aria-label="Roster flow">
      {items.map((item) => (
        <button className={active === item.id ? "active" : ""} key={item.id} type="button" onClick={() => onNavigate(item.id)}>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

const defaultItems: Array<{ id: PrototypeScreen; label: string }> = [
  { id: "overview", label: "Roster" },
  { id: "add-unit", label: "Add" },
  { id: "validation", label: "Checks" },
];
