import { Hammer, Plus, Sparkles } from "lucide-react";
import { AddUnitScreen, AppBar, ConceptProps, DetailPanel, FilterPill, LibraryScreen, PointsRing, ScreenTabs, ValidationScreen } from "./shared";
import { UnitCard } from "../components/UnitCard";

export function ForgeWorkbench(props: ConceptProps) {
  const { roster, selectedSection, selectedUnit, screen, canGoBack, onSelectSection, onSelectUnit, onToggleOption, onCountChange, onNavigate, onBack } = props;

  return (
    <div className="concept-screen forge-workbench">
      <AppBar roster={roster} screen={screen} canGoBack={canGoBack} onBack={onBack} onNavigate={onNavigate} />
      <ScreenTabs screen={screen} onNavigate={onNavigate} />
      {screen === "library" ? <LibraryScreen roster={roster} onNavigate={onNavigate} /> : null}
      {screen === "add-unit" ? <AddUnitScreen roster={roster} selectedSection={selectedSection} onSelectSection={onSelectSection} onSelectUnit={onSelectUnit} /> : null}
      {screen === "validation" ? <ValidationScreen roster={roster} onNavigate={onNavigate} /> : null}
      {screen === "library" || screen === "add-unit" || screen === "validation" ? null : (
        <>
      <section className="bench-top">
        <div>
          <small>Forge workbench</small>
          <h1>{roster.name}</h1>
        </div>
        <PointsRing roster={roster} />
      </section>
      <div className="bench-steps">
        {["Roster", "Add", "Configure", "Validate"].map((step, index) => (
          <span className={index < 3 ? "done" : ""} key={step}>
            {step}
          </span>
        ))}
      </div>
      <div className="bench-layout">
        <aside className="unit-palette">
          <div className="palette-header">
            <Hammer size={18} />
            <strong>Unit palette</strong>
          </div>
          {roster.sections.map((section) => (
            <button className={selectedSection.id === section.id ? "selected" : ""} key={section.id} type="button" onClick={() => onSelectSection(section.id)}>
              <span>{section.name}</span>
              <small>{section.units.length}</small>
            </button>
          ))}
          <FilterPill label="Can add now" />
        </aside>
        <section className="assembly-board">
          <div className="board-title">
            <Sparkles size={18} />
            <strong>{selectedSection.name}</strong>
            <button type="button" onClick={() => onNavigate("add-unit")}>
              <Plus size={16} />
              Unit
            </button>
          </div>
          {selectedSection.units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} selected={selectedUnit.id === unit.id} onSelect={onSelectUnit} onCountChange={onCountChange} />
          ))}
        </section>
        <DetailPanel unit={selectedUnit} onToggleOption={onToggleOption} onNavigate={onNavigate} title="Configuration vise" />
      </div>
        </>
      )}
    </div>
  );
}
