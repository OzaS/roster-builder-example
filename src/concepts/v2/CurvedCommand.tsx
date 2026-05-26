import { MessageSquarePlus } from "lucide-react";
import { BottomDock } from "../../components/v2/BottomDock";
import { CurvedPanel } from "../../components/v2/CurvedPanel";
import { MaterialAppFrame } from "../../components/v2/MaterialAppFrame";
import { SegmentedNav } from "../../components/v2/SegmentedNav";
import { UnitConfigSheet } from "../../components/v2/UnitConfigSheet";
import type { ConceptProps } from "../shared";
import { V2FlowGate, V2RosterRows, V2TopSummary } from "./shared";

export function CurvedCommand(props: ConceptProps) {
  const shared = V2FlowGate(props);

  return (
    <MaterialAppFrame
      roster={props.roster}
      screen={props.screen}
      canGoBack={props.canGoBack}
      mode="dark"
      onBack={props.onBack}
      onNavigate={props.onNavigate}
      className="curved-command"
      title="Command"
    >
      {shared ?? (
        <>
          <section className="curved-command-head">
            <V2TopSummary props={props} dark />
            <SegmentedNav active={props.screen} onNavigate={props.onNavigate} />
          </section>
          <CurvedPanel className="command-rise">
            <button className="v2-primary-row" type="button" onClick={() => props.onNavigate("add-unit")}>
              <MessageSquarePlus size={18} />
              <span>
                <strong>Add from {props.selectedSection.name}</strong>
                <small>Picker opens as the next sample step</small>
              </span>
            </button>
            <V2RosterRows props={props} />
          </CurvedPanel>
          {props.screen === "unit-detail" ? (
            <UnitConfigSheet unit={props.selectedUnit} onToggleOption={props.onToggleOption} onValidate={() => props.onNavigate("validation")} />
          ) : null}
          <BottomDock active={props.screen} onNavigate={props.onNavigate} />
        </>
      )}
    </MaterialAppFrame>
  );
}
