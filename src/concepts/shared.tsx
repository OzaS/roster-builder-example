import type { CSSProperties } from "react";
import { AlertTriangle, CheckCircle2, FileDown, Filter, Plus, Search, Shield, Swords } from "lucide-react";
import type { Roster, RosterSection, RosterUnit } from "../types";
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
  onSelectSection: (id: string) => void;
  onToggleSection: (id: string) => void;
  onSelectUnit: (id: string) => void;
  onToggleOption: (id: string) => void;
  onCountChange: (id: string, delta: number) => void;
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

export function AppBar({ roster, variant = "dark" }: { roster: Roster; variant?: "dark" | "light" }) {
  return (
    <header className={`concept-appbar ${variant}`}>
      <button type="button" aria-label="Faction">
        <Shield size={18} />
      </button>
      <div>
        <strong>{roster.faction}</strong>
        <small>{roster.name}</small>
      </div>
      <button type="button" aria-label="Search">
        <Search size={18} />
      </button>
      <button type="button" aria-label="Export">
        <FileDown size={18} />
      </button>
    </header>
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
  title = "Unit detail",
}: {
  unit: RosterUnit;
  onToggleOption: (id: string) => void;
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

export function AddUnitBar({ label = "Add unit" }: { label?: string }) {
  return (
    <button className="add-unit-bar" type="button">
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
