import { Layers3, Plus } from "lucide-react";
import { AddUnitScreen, AppBar, ConceptProps, DetailPanel, FilterPill, LibraryScreen, PointsRing, ScreenTabs, SectionStack, StatusStrip, ValidationScreen } from "./shared";

export function ArmoryGlass(props: ConceptProps) {
  const {
    roster,
    selectedSection,
    selectedUnit,
    selectedSectionId,
    expandedSectionIds,
    screen,
    canGoBack,
    onSelectSection,
    onToggleSection,
    onSelectUnit,
    onToggleOption,
    onCountChange,
    onNavigate,
    onBack,
  } = props;

  return (
    <div className="concept-screen armory-glass">
      <AppBar roster={roster} variant="light" screen={screen} canGoBack={canGoBack} onBack={onBack} onNavigate={onNavigate} />
      <ScreenTabs screen={screen} onNavigate={onNavigate} />
      {screen === "library" ? <LibraryScreen roster={roster} onNavigate={onNavigate} /> : null}
      {screen === "add-unit" ? <AddUnitScreen roster={roster} selectedSection={selectedSection} onSelectSection={onSelectSection} onSelectUnit={onSelectUnit} /> : null}
      {screen === "validation" ? <ValidationScreen roster={roster} onNavigate={onNavigate} /> : null}
      {screen === "library" || screen === "add-unit" || screen === "validation" ? null : (
        <>
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
        <DetailPanel unit={selectedUnit} onToggleOption={onToggleOption} onNavigate={onNavigate} title="Equipment tray" />
      </div>
      <button className="fab glass-fab" type="button" aria-label="Add unit" onClick={() => onNavigate("add-unit")}>
        <Plus size={24} />
      </button>
        </>
      )}
    </div>
  );
}
