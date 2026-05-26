import type { CSSProperties } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, FileDown, Filter, Plus, Search, Shield, Swords } from "lucide-react";
import type { PrototypeScreen, Roster, RosterSection, RosterUnit } from "../types";
import { OptionRow } from "../components/OptionRow";
import { RosterNav } from "../components/RosterNav";
import { UnitCard } from "../components/UnitCard";
import { ValidationBadge } from "../components/ValidationBadge";

export { ValidationBadge };

export type ConceptProps = {
  roster: Roster;
  selectedSection: RosterSection;
  selectedUnit: RosterUnit;
  selectedSectionId: string;
  expandedSectionIds: string[];
  screen: PrototypeScreen;
  canGoBack: boolean;
  onSelectSection: (id: string) => void;
  onToggleSection: (id: string) => void;
  onSelectUnit: (id: string) => void;
  onToggleOption: (id: string) => void;
  onCountChange: (id: string, delta: number) => void;
  onNavigate: (screen: PrototypeScreen) => void;
  onBack: () => void;
};

export function PointsRing({ roster }: { roster: Roster }) {
  const percent = Math.round((roster.pointsUsed / roster.pointsLimit) * 100);
  return (
    <div className="points-ring" style={{ "--points": `${percent}%` } as CSSProperties}>
      <strong>{roster.pointsUsed}</strong>
      <small>/ {roster.pointsLimit}</small>
    </div>
  );
}

export function AppBar({
  roster,
  variant = "dark",
  screen,
  canGoBack,
  onBack,
  onNavigate,
}: {
  roster: Roster;
  variant?: "dark" | "light";
  screen?: PrototypeScreen;
  canGoBack?: boolean;
  onBack?: () => void;
  onNavigate?: (screen: PrototypeScreen) => void;
}) {
  const title = screenLabel(screen);

  return (
    <header className={`concept-appbar ${variant}`}>
      <button type="button" aria-label={canGoBack ? "Back" : "Faction"} onClick={canGoBack ? onBack : undefined}>
        {canGoBack ? <ArrowLeft size={18} /> : <Shield size={18} />}
      </button>
      <div>
        <strong>{title ?? roster.faction}</strong>
        <small>{title ? roster.faction : roster.name}</small>
      </div>
      <button type="button" aria-label="Search" onClick={() => onNavigate?.("library")}>
        <Search size={18} />
      </button>
      <button type="button" aria-label="Export" onClick={() => onNavigate?.("validation")}>
        <FileDown size={18} />
      </button>
    </header>
  );
}

export function screenLabel(screen?: PrototypeScreen) {
  if (screen === "library") return "Roster Library";
  if (screen === "system") return "Game System";
  if (screen === "catalogue") return "Catalogue";
  if (screen === "detachment") return "Detachment";
  if (screen === "add-unit") return "Add Unit";
  if (screen === "unit-detail") return "Configure Unit";
  if (screen === "validation") return "Roster Checks";
  if (screen === "export") return "Export Roster";
  return undefined;
}

export function ScreenTabs({ screen, onNavigate }: { screen: PrototypeScreen; onNavigate: (screen: PrototypeScreen) => void }) {
  const tabs: Array<{ id: PrototypeScreen; label: string }> = [
    { id: "library", label: "Lists" },
    { id: "overview", label: "Roster" },
    { id: "add-unit", label: "Add" },
    { id: "validation", label: "Checks" },
  ];

  return (
    <nav className="screen-tabs" aria-label="Prototype flow">
      {tabs.map((tab) => (
        <button className={screen === tab.id ? "active" : ""} key={tab.id} type="button" onClick={() => onNavigate(tab.id)}>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export function StatusStrip({ dense = false }: { dense?: boolean }) {
  return (
    <div className={`status-strip ${dense ? "dense" : ""}`}>
      <span>
        <CheckCircle2 size={15} />
        4 valid units
      </span>
      <span>
        <AlertTriangle size={15} />
        2 roster checks
      </span>
    </div>
  );
}

export function UnitOptions({ unit, onToggleOption, compact = false }: { unit: RosterUnit; onToggleOption: (id: string) => void; compact?: boolean }) {
  return (
    <div className={`unit-options ${compact ? "compact" : ""}`}>
      {unit.options.map((option) => (
        <OptionRow compact={compact} key={option.id} option={option} onToggle={onToggleOption} />
      ))}
    </div>
  );
}

export function DetailPanel({
  unit,
  onToggleOption,
  onNavigate,
  title = "Unit detail",
}: {
  unit: RosterUnit;
  onToggleOption: (id: string) => void;
  onNavigate?: (screen: PrototypeScreen) => void;
  title?: string;
}) {
  return (
    <section className="detail-panel">
      <div className="detail-heading">
        <span>
          <small>{title}</small>
          <strong>{unit.name}</strong>
        </span>
        <ValidationBadge status={unit.status} />
      </div>
      {unit.note ? <p className="detail-note">{unit.note}</p> : null}
      <UnitOptions unit={unit} onToggleOption={onToggleOption} />
      {onNavigate ? (
        <div className="detail-actions">
          <button type="button" onClick={() => onNavigate("add-unit")}>
            <Plus size={16} />
            Swap unit
          </button>
          <button type="button" onClick={() => onNavigate("validation")}>
            <AlertTriangle size={16} />
            Check roster
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function SectionStack({
  roster,
  selectedSection,
  selectedSectionId,
  expandedSectionIds,
  onSelectSection,
  onToggleSection,
  onSelectUnit,
  onCountChange,
  dense = false,
}: Pick<
  ConceptProps,
  | "roster"
  | "selectedSection"
  | "selectedSectionId"
  | "expandedSectionIds"
  | "onSelectSection"
  | "onToggleSection"
  | "onSelectUnit"
  | "onCountChange"
> & { dense?: boolean }) {
  return (
    <div className="section-stack">
      <RosterNav
        compact={dense}
        sections={roster.sections}
        selectedSectionId={selectedSectionId}
        expandedSectionIds={expandedSectionIds}
        onSelectSection={onSelectSection}
        onToggleSection={onToggleSection}
      />
      <div className="unit-list">
        {selectedSection.units.map((unit) => (
          <UnitCard dense={dense} key={unit.id} unit={unit} selected={false} onSelect={onSelectUnit} onCountChange={onCountChange} />
        ))}
      </div>
    </div>
  );
}

export function AddUnitBar({ label = "Add unit", onClick }: { label?: string; onClick?: () => void }) {
  return (
    <button className="add-unit-bar" type="button" onClick={onClick}>
      <Plus size={18} />
      {label}
    </button>
  );
}

export function FilterPill({ label }: { label: string }) {
  return (
    <button className="filter-pill" type="button">
      <Filter size={14} />
      {label}
    </button>
  );
}

export function RoleIcon() {
  return <Swords size={18} />;
}

export function LibraryScreen({ roster, onNavigate }: { roster: Roster; onNavigate: (screen: PrototypeScreen) => void }) {
  const rosters = [
    { name: roster.name, faction: roster.faction, points: `${roster.pointsUsed}/${roster.pointsLimit}`, status: "2 checks" },
    { name: "Incursion Test List", faction: "Space Wolves", points: "515/1000", status: "valid" },
    { name: "Narrative Boarding Patrol", faction: "Aeldari", points: "490/500", status: "1 check" },
  ];

  return (
    <section className="flow-screen library-screen">
      <div className="flow-heading">
        <small>Recent lists</small>
        <h2>Choose a roster</h2>
      </div>
      <div className="library-actions">
        <AddUnitBar label="Create roster" onClick={() => onNavigate("overview")} />
        <button className="filter-pill" type="button">
          <Search size={14} />
          Import .rosz
        </button>
      </div>
      <div className="library-list">
        {rosters.map((item) => (
          <button className="library-card" key={item.name} type="button" onClick={() => onNavigate("overview")}>
            <span>
              <strong>{item.name}</strong>
              <small>{item.faction}</small>
            </span>
            <span>
              <b>{item.points}</b>
              <small>{item.status}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function AddUnitScreen({
  roster,
  selectedSection,
  onSelectSection,
  onSelectUnit,
}: Pick<ConceptProps, "roster" | "selectedSection" | "onSelectSection" | "onSelectUnit">) {
  const candidates = roster.sections.flatMap((section) =>
    section.units.map((unit) => ({
      ...unit,
      section: section.name,
      sectionId: section.id,
      available: unit.status !== "error",
    })),
  );

  return (
    <section className="flow-screen add-screen">
      <div className="flow-heading">
        <small>{selectedSection.name} pool</small>
        <h2>Add to roster</h2>
      </div>
      <div className="section-chip-row">
        {roster.sections.map((section) => (
          <button className={section.id === selectedSection.id ? "active" : ""} key={section.id} type="button" onClick={() => onSelectSection(section.id)}>
            {section.name}
          </button>
        ))}
      </div>
      <div className="candidate-list">
        {candidates.map((unit) => (
          <button
            className={`candidate-card ${unit.available ? "" : "limited"}`}
            key={`${unit.sectionId}-${unit.id}`}
            type="button"
            onClick={() => onSelectUnit(unit.id)}
          >
            <span>
              <strong>{unit.name}</strong>
              <small>{unit.section} · {unit.role}</small>
            </span>
            <span>
              <b>{unit.points} pts</b>
              <small>{unit.available ? "tap to configure" : "slot warning"}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ValidationScreen({ roster, onNavigate }: { roster: Roster; onNavigate: (screen: PrototypeScreen) => void }) {
  const units = roster.sections.flatMap((section) => section.units.map((unit) => ({ ...unit, section: section.name })));
  const checks = units.filter((unit) => unit.status && unit.status !== "valid");

  return (
    <section className="flow-screen validation-screen">
      <div className="flow-heading">
        <small>{checks.length} items need review</small>
        <h2>Roster checks</h2>
      </div>
      <div className="validation-summary">
        <strong>{roster.pointsLimit - roster.pointsUsed} points open</strong>
        <small>Current list is playable after warnings are resolved.</small>
      </div>
      <div className="check-list">
        {checks.map((unit) => (
          <button className="check-card" key={unit.id} type="button" onClick={() => onNavigate("unit-detail")}>
            <ValidationBadge status={unit.status} />
            <span>
              <strong>{unit.name}</strong>
              <small>{unit.note ?? `${unit.section} needs review`}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
