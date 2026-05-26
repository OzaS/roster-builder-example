import { Plus, Radar } from "lucide-react";
import { AddUnitBar, AppBar, ConceptProps, DetailPanel, PointsRing, SectionStack, StatusStrip } from "./shared";

export function CommandDeck(props: ConceptProps) {
  const { roster, selectedSection, selectedUnit, selectedSectionId, expandedSectionIds, onSelectSection, onToggleSection, onSelectUnit, onToggleOption, onCountChange } = props;

  return (
    <div className="concept-screen command-deck">
      <AppBar roster={roster} />
      <section className="command-hero">
        <div>
          <small>Battle ready</small>
          <h1>{roster.name}</h1>
          <StatusStrip dense />
        </div>
        <PointsRing roster={roster} />
      </section>
      <div className="command-grid">
        <SectionStack
          dense
          roster={roster}
          selectedSection={selectedSection}
          selectedSectionId={selectedSectionId}
          expandedSectionIds={expandedSectionIds}
          onSelectSection={onSelectSection}
          onToggleSection={onToggleSection}
          onSelectUnit={onSelectUnit}
          onCountChange={onCountChange}
        />
        <DetailPanel unit={selectedUnit} onToggleOption={onToggleOption} title="Command uplink" />
      </div>
      <button className="fab command-fab" type="button" aria-label="Add to roster">
        <Plus size={24} />
      </button>
      <div className="bottom-tools">
        <AddUnitBar label="Add from HQ pool" />
        <span>
          <Radar size={16} />
          Synced
        </span>
      </div>
    </div>
  );
}
