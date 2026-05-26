import { MaterialAppFrame } from "../../components/v2/MaterialAppFrame";
import { RosterBudgetBar } from "../../components/v2/RosterBudgetBar";
import { UnitConfigSheet } from "../../components/v2/UnitConfigSheet";
import { ValidationRail } from "../../components/v2/ValidationRail";
import type { ConceptProps } from "../shared";
import { V2FlowGate } from "./shared";

export function GlassLedger(props: ConceptProps) {
  const shared = V2FlowGate(props);
  const units = props.roster.sections.flatMap((section) => section.units.map((unit) => ({ ...unit, section: section.name })));

  return (
    <MaterialAppFrame
      roster={props.roster}
      screen={props.screen}
      canGoBack={props.canGoBack}
      onBack={props.onBack}
      onNavigate={props.onNavigate}
      className="glass-ledger"
      title="Ledger"
    >
      {shared ?? (
        <main className="ledger-workspace">
          <RosterBudgetBar roster={props.roster} />
          <div className="ledger-actions">
            <button type="button" onClick={() => props.onNavigate("add-unit")}>Add unit</button>
            <button type="button" onClick={() => props.onNavigate("validation")}>Check roster</button>
          </div>
          <div className="v2-ledger-table">
            <div className="v2-ledger-row head">
              <span>Role</span>
              <span>Unit</span>
              <span>Pts</span>
              <span>Status</span>
            </div>
            {units.map((unit) => (
              <button className={`v2-ledger-row ${props.selectedUnit.id === unit.id ? "selected" : ""}`} key={unit.id} type="button" onClick={() => props.onSelectUnit(unit.id)}>
                <span>{unit.section}</span>
                <strong>{unit.name}</strong>
                <span>{unit.points}</span>
                <small>{unit.availability}</small>
              </button>
            ))}
          </div>
          <div className="v2-ledger-side">
            {props.screen === "unit-detail" ? (
              <UnitConfigSheet unit={props.selectedUnit} onToggleOption={props.onToggleOption} onValidate={() => props.onNavigate("validation")} />
            ) : (
              <ValidationRail roster={props.roster} onOpenUnit={props.onSelectUnit} />
            )}
          </div>
        </main>
      )}
    </MaterialAppFrame>
  );
}
