import { Layers3, Plus } from "lucide-react";
import { AppBar, ConceptProps, DetailPanel, FilterPill, PointsRing, SectionStack, StatusStrip } from "./shared";

export function ArmoryGlass(props: ConceptProps) {
  const { roster, selectedSection, selectedUnit, selectedSectionId, expandedSectionIds, onSelectSection, onToggleSection, onSelectUnit, onToggleOption, onCountChange } = props;

  return (
    <div className="concept-screen armory-glass">
      <AppBar roster={roster} variant="light" />
      <section className="glass-summary">
        <div>
          <small>{roster.system}</small>
          <h1>{roster.faction}</h1>
          <StatusStrip />
        </div>
        <PointsRing roster={roster} />
      </section>
      <div className="glass-toolbar">
        <FilterPill label="All roles" />
        <FilterPill label="Warnings" />
        <button className="soft-icon" type="button" aria-label="Layers">
          <Layers3 size={18} />
        </button>
      </div>
      <div className="glass-layout">
        <SectionStack
          roster={roster}
          selectedSection={selectedSection}
          selectedSectionId={selectedSectionId}
          expandedSectionIds={expandedSectionIds}
          onSelectSection={onSelectSection}
          onToggleSection={onToggleSection}
          onSelectUnit={onSelectUnit}
          onCountChange={onCountChange}
        />
        <DetailPanel unit={selectedUnit} onToggleOption={onToggleOption} title="Equipment tray" />
      </div>
      <button className="fab glass-fab" type="button" aria-label="Add unit">
        <Plus size={24} />
      </button>
    </div>
  );
}
