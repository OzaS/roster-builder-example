import { AlertTriangle, Plus } from "lucide-react";
import { AddUnitScreen, AppBar, ConceptProps, DetailPanel, LibraryScreen, PointsRing, ScreenTabs, ValidationBadge, ValidationScreen } from "./shared";

export function TacticalLedger(props: ConceptProps) {
  const { roster, selectedSection, selectedUnit, screen, canGoBack, onSelectSection, onSelectUnit, onToggleOption, onCountChange, onNavigate, onBack } = props;
  const allUnits = roster.sections.flatMap((section) => section.units.map((unit) => ({ ...unit, section: section.name, required: section.required })));

  return (
    <div className="concept-screen tactical-ledger">
      <AppBar roster={roster} variant="light" screen={screen} canGoBack={canGoBack} onBack={onBack} onNavigate={onNavigate} />
      <ScreenTabs screen={screen} onNavigate={onNavigate} />
      {screen === "library" ? <LibraryScreen roster={roster} onNavigate={onNavigate} /> : null}
      {screen === "add-unit" ? <AddUnitScreen roster={roster} selectedSection={selectedSection} onSelectSection={onSelectSection} onSelectUnit={onSelectUnit} /> : null}
      {screen === "validation" ? <ValidationScreen roster={roster} onNavigate={onNavigate} /> : null}
      {screen === "library" || screen === "add-unit" || screen === "validation" ? null : (
        <>
      <section className="ledger-header">
        <div>
          <small>Roster ledger</small>
          <h1>{roster.faction}</h1>
        </div>
        <PointsRing roster={roster} />
      </section>
      <div className="ledger-table" role="table">
        <div className="ledger-row ledger-head" role="row">
          <span>Slot</span>
          <span>Unit</span>
          <span>Pts</span>
          <span>Status</span>
        </div>
        {allUnits.map((unit) => (
          <button className={`ledger-row ${selectedUnit.id === unit.id ? "selected" : ""}`} key={unit.id} onClick={() => onSelectUnit(unit.id)} type="button" role="row">
            <span>{unit.section}</span>
            <strong>{unit.name}</strong>
            <span>{unit.points}</span>
            <ValidationBadge status={unit.status} label={unit.status === "valid" ? "OK" : unit.status === "warning" ? "Warn" : "Fix"} />
          </button>
        ))}
      </div>
      <div className="ledger-bottom">
        <div className="validation-drawer">
          <AlertTriangle size={17} />
          <span>Chaplain needs an attached unit. Elite slot preference exceeded.</span>
        </div>
        <DetailPanel unit={selectedUnit} onToggleOption={onToggleOption} onNavigate={onNavigate} title="Inspector" />
      </div>
      <button className="ledger-add" type="button" onClick={() => onCountChange(selectedUnit.id, 1)}>
        <Plus size={18} />
        Add model
      </button>
        </>
      )}
    </div>
  );
}
