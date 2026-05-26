import { Download, FileJson, Plus, Share2 } from "lucide-react";
import { mockCatalogues, mockDetachments, mockSystems } from "../../data/mockRoster";
import type { PrototypeScreen, Roster, RosterSection } from "../../types";
import { InlineUnitRow } from "./InlineUnitRow";
import { RosterBudgetBar } from "./RosterBudgetBar";
import { ValidationRail } from "./ValidationRail";

type Navigation = {
  onNavigate: (screen: PrototypeScreen) => void;
  onSelectSection: (id: string) => void;
  onSelectUnit: (id: string) => void;
  onCountChange: (id: string, delta: number) => void;
};

export function V2LibraryScreen({ roster, onNavigate }: { roster: Roster; onNavigate: (screen: PrototypeScreen) => void }) {
  return (
    <section className="v2-flow v2-library">
      <div className="v2-flow-heading">
        <small>Recent rosters</small>
        <h2>Pick up where you left off</h2>
      </div>
      <button className="v2-primary-row" type="button" onClick={() => onNavigate("system")}>
        <Plus size={18} />
        <span>
          <strong>Create roster</strong>
          <small>Choose system, catalogue, and detachment</small>
        </span>
      </button>
      {[roster, { ...roster, name: "Incursion Practice", faction: "Space Wolves", pointsUsed: 515 }, { ...roster, name: "Boarding Patrol", faction: "Aeldari", pointsUsed: 490 }].map((item) => (
        <button className="v2-list-row" key={item.name} type="button" onClick={() => onNavigate("overview")}>
          <span>
            <strong>{item.name}</strong>
            <small>{item.faction}</small>
          </span>
          <b>{item.pointsUsed}/{item.pointsLimit}</b>
        </button>
      ))}
    </section>
  );
}

export function V2SetupScreen({ screen, onNavigate }: { screen: PrototypeScreen; onNavigate: (screen: PrototypeScreen) => void }) {
  const data =
    screen === "system"
      ? mockSystems.map((item) => ({ ...item, meta: `${item.edition} · ${item.catalogues} catalogues`, next: "catalogue" as const }))
      : screen === "catalogue"
        ? mockCatalogues.map((item) => ({ ...item, meta: `${item.updated} · ${item.status}`, next: "detachment" as const }))
        : mockDetachments.map((item) => ({ ...item, meta: `${item.slots} · ${item.fit}`, next: "overview" as const }));

  return (
    <section className="v2-flow">
      <div className="v2-flow-heading">
        <small>New roster</small>
        <h2>{screen === "system" ? "Choose game system" : screen === "catalogue" ? "Choose catalogue" : "Choose detachment"}</h2>
      </div>
      <div className="v2-continuous-list">
        {data.map((item) => (
          <button className="v2-list-row" key={item.id} type="button" onClick={() => onNavigate(item.next)}>
            <span>
              <strong>{item.name}</strong>
              <small>{item.meta}</small>
            </span>
            <b>Select</b>
          </button>
        ))}
      </div>
    </section>
  );
}

export function V2AddUnitScreen({
  selectedSection,
  onSelectUnit,
  onCountChange,
}: {
  selectedSection: RosterSection;
  onSelectUnit: (id: string) => void;
  onCountChange: (id: string, delta: number) => void;
}) {
  return (
    <section className="v2-flow v2-add-flow">
      <div className="v2-flow-heading">
        <small>{selectedSection.name}</small>
        <h2>Add or configure a unit</h2>
      </div>
      <div className="v2-continuous-list">
        {selectedSection.units.map((unit) => (
          <InlineUnitRow key={unit.id} unit={unit} onOpen={onSelectUnit} onCountChange={onCountChange} />
        ))}
      </div>
    </section>
  );
}

export function V2ValidationScreen({ roster, onSelectUnit }: { roster: Roster; onSelectUnit: (id: string) => void }) {
  return (
    <section className="v2-flow">
      <RosterBudgetBar roster={roster} />
      <ValidationRail roster={roster} onOpenUnit={onSelectUnit} />
    </section>
  );
}

export function V2ExportScreen({ roster }: { roster: Roster }) {
  return (
    <section className="v2-flow">
      <div className="v2-flow-heading">
        <small>Share roster</small>
        <h2>Export {roster.name}</h2>
      </div>
      <div className="v2-export-actions">
        <button type="button">
          <FileJson size={20} />
          <span>
            <strong>.rosz</strong>
            <small>BattleScribe compatible archive</small>
          </span>
        </button>
        <button type="button">
          <Download size={20} />
          <span>
            <strong>PDF</strong>
            <small>Print-friendly roster sheet</small>
          </span>
        </button>
        <button type="button">
          <Share2 size={20} />
          <span>
            <strong>Share link</strong>
            <small>Copy review URL</small>
          </span>
        </button>
      </div>
    </section>
  );
}

export function shouldUseSharedFlow(screen: PrototypeScreen) {
  return ["library", "system", "catalogue", "detachment", "add-unit", "validation", "export"].includes(screen);
}

export function renderSharedFlow(
  screen: PrototypeScreen,
  roster: Roster,
  selectedSection: RosterSection,
  navigation: Navigation,
) {
  if (screen === "library") return <V2LibraryScreen roster={roster} onNavigate={navigation.onNavigate} />;
  if (screen === "system" || screen === "catalogue" || screen === "detachment") {
    return <V2SetupScreen screen={screen} onNavigate={navigation.onNavigate} />;
  }
  if (screen === "add-unit") {
    return <V2AddUnitScreen selectedSection={selectedSection} onSelectUnit={navigation.onSelectUnit} onCountChange={navigation.onCountChange} />;
  }
  if (screen === "validation") return <V2ValidationScreen roster={roster} onSelectUnit={navigation.onSelectUnit} />;
  if (screen === "export") return <V2ExportScreen roster={roster} />;
  return null;
}
