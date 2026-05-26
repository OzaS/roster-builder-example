import { Bell, Sun } from "lucide-react";
import { BottomDock } from "../../components/v2/BottomDock";
import { MaterialAppFrame } from "../../components/v2/MaterialAppFrame";
import { RosterBudgetBar } from "../../components/v2/RosterBudgetBar";
import { UnitConfigSheet } from "../../components/v2/UnitConfigSheet";
import type { ConceptProps } from "../shared";
import { V2FlowGate, V2RosterRows } from "./shared";

export function RosterDock(props: ConceptProps) {
  const shared = V2FlowGate(props);

  return (
    <MaterialAppFrame
      roster={props.roster}
      screen={props.screen}
      canGoBack={props.canGoBack}
      mode="dark"
      onBack={props.onBack}
      onNavigate={props.onNavigate}
      className="roster-dock"
      title="Dock"
    >
      {shared ?? (
        <>
          <section className="dock-hero">
            <div>
              <small>Good evening</small>
              <h1>{props.roster.faction}</h1>
              <strong>{props.roster.pointsUsed.toLocaleString()} pts</strong>
            </div>
            <span>
              <button type="button" aria-label="Brightness"><Sun size={18} /></button>
              <button type="button" aria-label="Alerts"><Bell size={18} /></button>
            </span>
          </section>
          <main className="dock-workspace">
            <RosterBudgetBar roster={props.roster} />
            <div className="dock-section-title">
              <strong>{props.selectedSection.name}</strong>
              <button type="button" onClick={() => props.onNavigate("add-unit")}>Add</button>
            </div>
            <V2RosterRows props={props} />
          </main>
          {props.screen === "unit-detail" ? (
            <UnitConfigSheet unit={props.selectedUnit} onToggleOption={props.onToggleOption} onValidate={() => props.onNavigate("validation")} />
          ) : null}
          <BottomDock active={props.screen} onNavigate={props.onNavigate} />
        </>
      )}
    </MaterialAppFrame>
  );
}
