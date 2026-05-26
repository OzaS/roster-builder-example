import { Plus, Radar } from "lucide-react";
import { AddUnitBar, AddUnitScreen, AppBar, ConceptProps, DetailPanel, LibraryScreen, PointsRing, ScreenTabs, SectionStack, StatusStrip, ValidationScreen } from "./shared";

export function CommandDeck(props: ConceptProps) {
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
    <div className="concept-screen command-deck">
      <AppBar roster={roster} screen={screen} canGoBack={canGoBack} onBack={onBack} onNavigate={onNavigate} />
      <ScreenTabs screen={screen} onNavigate={onNavigate} />
      {screen === "library" ? <LibraryScreen roster={roster} onNavigate={onNavigate} /> : null}
      {screen === "add-unit" ? <AddUnitScreen roster={roster} selectedSection={selectedSection} onSelectSection={onSelectSection} onSelectUnit={onSelectUnit} /> : null}
      {screen === "validation" ? <ValidationScreen roster={roster} onNavigate={onNavigate} /> : null}
      {screen === "library" || screen === "add-unit" || screen === "validation" ? null : (
        <>
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
        <DetailPanel unit={selectedUnit} onToggleOption={onToggleOption} onNavigate={onNavigate} title="Command uplink" />
      </div>
      <button className="fab command-fab" type="button" aria-label="Add to roster" onClick={() => onNavigate("add-unit")}>
        <Plus size={24} />
      </button>
      <div className="bottom-tools">
        <AddUnitBar label="Add from HQ pool" onClick={() => onNavigate("add-unit")} />
        <span>
          <Radar size={16} />
          Synced
        </span>
      </div>
        </>
      )}
    </div>
  );
}
