import { CheckCircle2, Download, Home, Plus, Search } from "lucide-react";
import type { PrototypeScreen } from "../../types";

type Props = {
  active: PrototypeScreen;
  onNavigate: (screen: PrototypeScreen) => void;
};

export function BottomDock({ active, onNavigate }: Props) {
  const items = [
    { id: "overview" as const, label: "Roster", icon: Home },
    { id: "add-unit" as const, label: "Add", icon: Plus },
    { id: "library" as const, label: "Find", icon: Search },
    { id: "validation" as const, label: "Check", icon: CheckCircle2 },
    { id: "export" as const, label: "Export", icon: Download },
  ];

  return (
    <nav className="v2-bottom-dock" aria-label="Primary actions">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button className={active === item.id ? "active" : ""} key={item.id} type="button" onClick={() => onNavigate(item.id)}>
            <Icon size={19} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
