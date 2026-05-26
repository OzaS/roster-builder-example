import { Box, Plus } from "lucide-react";
import { AddUnitScreen, AppBar, ConceptProps, LibraryScreen, PointsRing, RoleIcon, ScreenTabs, UnitOptions, ValidationScreen } from "./shared";
import { UnitCard } from "../components/UnitCard";

export function MiniatureCase(props: ConceptProps) {
  const { roster, selectedSection, selectedUnit, selectedSectionId, screen, canGoBack, onSelectSection, onSelectUnit, onToggleOption, onCountChange, onNavigate, onBack } = props;

  return (
    <div className="concept-screen miniature-case">
      <AppBar roster={roster} screen={screen} canGoBack={canGoBack} onBack={onBack} onNavigate={onNavigate} />
      <ScreenTabs screen={screen} onNavigate={onNavigate} />
      {screen === "library" ? <LibraryScreen roster={roster} onNavigate={onNavigate} /> : null}
      {screen === "add-unit" ? <AddUnitScreen roster={roster} selectedSection={selectedSection} onSelectSection={onSelectSection} onSelectUnit={onSelectUnit} /> : null}
      {screen === "validation" ? <ValidationScreen roster={roster} onNavigate={onNavigate} /> : null}
      {screen === "library" || screen === "add-unit" || screen === "validation" ? null : (
        <>
      <section className="case-label">
        <span>
          <Box size={18} />
          Army case
        </span>
        <PointsRing roster={roster} />
      </section>
      <div className="case-compartments">
        {roster.sections.map((section) => (
          <section className={`case-compartment ${selectedSectionId === section.id ? "selected" : ""}`} key={section.id}>
            <button type="button" className="case-compartment-label" onClick={() => onSelectSection(section.id)}>
              <RoleIcon />
              <span>
                <strong>{section.name}</strong>
                <small>{section.required}</small>
              </span>
              <Plus size={16} />
            </button>
            <div className="case-slots">
              {section.units.map((unit) => (
                <UnitCard key={unit.id} unit={unit} selected={selectedUnit.id === unit.id} onSelect={onSelectUnit} onCountChange={onCountChange} dense />
              ))}
              <button className="empty-slot" type="button" onClick={() => onNavigate("add-unit")}>
                <Plus size={16} />
                Empty slot
              </button>
            </div>
          </section>
        ))}
      </div>
      <section className="model-card">
        <div>
          <small>Selected model card</small>
          <strong>{selectedUnit.name}</strong>
        </div>
        <UnitOptions unit={selectedUnit} onToggleOption={onToggleOption} compact />
        <div className="detail-actions">
          <button type="button" onClick={() => onNavigate("validation")}>
            Check roster
          </button>
        </div>
      </section>
        </>
      )}
    </div>
  );
}
