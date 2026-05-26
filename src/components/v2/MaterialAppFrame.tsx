import { ArrowLeft, FileDown, Search, Shield } from "lucide-react";
import type { PrototypeScreen, Roster } from "../../types";
import { schemeToCssVars, type MaterialMode } from "../../theme/materialThemeBridge";

type Props = {
  roster: Roster;
  screen: PrototypeScreen;
  canGoBack: boolean;
  mode?: MaterialMode;
  className?: string;
  title?: string;
  children: React.ReactNode;
  onBack: () => void;
  onNavigate: (screen: PrototypeScreen) => void;
};

export function MaterialAppFrame({
  roster,
  screen,
  canGoBack,
  mode = "light",
  className = "",
  title,
  children,
  onBack,
  onNavigate,
}: Props) {
  return (
    <div className={`v2-screen ${mode} ${className}`} style={schemeToCssVars(mode)}>
      <header className="v2-appbar">
        <button type="button" aria-label={canGoBack ? "Back" : "Faction"} onClick={canGoBack ? onBack : undefined}>
          {canGoBack ? <ArrowLeft size={18} /> : <Shield size={18} />}
        </button>
        <span>
          <strong>{title ?? screenTitle(screen)}</strong>
          <small>{roster.faction}</small>
        </span>
        <button type="button" aria-label="Search" onClick={() => onNavigate("library")}>
          <Search size={18} />
        </button>
        <button type="button" aria-label="Export" onClick={() => onNavigate("export")}>
          <FileDown size={18} />
        </button>
      </header>
      {children}
    </div>
  );
}

export function screenTitle(screen: PrototypeScreen) {
  if (screen === "library") return "Roster Library";
  if (screen === "system") return "Game System";
  if (screen === "catalogue") return "Catalogue";
  if (screen === "detachment") return "Detachment";
  if (screen === "add-unit") return "Add Unit";
  if (screen === "unit-detail") return "Configure";
  if (screen === "validation") return "Checks";
  if (screen === "export") return "Export";
  return "Roster";
}
