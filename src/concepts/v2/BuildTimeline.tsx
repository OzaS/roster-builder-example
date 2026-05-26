import { MaterialAppFrame } from "../../components/v2/MaterialAppFrame";
import { StepTimeline } from "../../components/v2/StepTimeline";
import { UnitConfigSheet } from "../../components/v2/UnitConfigSheet";
import type { ConceptProps } from "../shared";
import { V2FlowGate, V2RosterRows, V2TopSummary } from "./shared";

export function BuildTimeline(props: ConceptProps) {
  const shared = V2FlowGate(props);

  return (
    <MaterialAppFrame
      roster={props.roster}
      screen={props.screen}
      canGoBack={props.canGoBack}
      onBack={props.onBack}
      onNavigate={props.onNavigate}
      className="build-timeline"
      title="Build Timeline"
    >
      <StepTimeline active={props.screen} onNavigate={props.onNavigate} />
      {shared ?? (
        <main className="timeline-workbench">
          <V2TopSummary props={props} />
          <section className="timeline-surface">
            <header>
              <strong>{props.selectedSection.name}</strong>
              <button type="button" onClick={() => props.onNavigate("add-unit")}>Add unit</button>
            </header>
            <V2RosterRows props={props} />
          </section>
          {props.screen === "unit-detail" ? (
            <UnitConfigSheet unit={props.selectedUnit} onToggleOption={props.onToggleOption} onValidate={() => props.onNavigate("validation")} />
          ) : null}
        </main>
      )}
    </MaterialAppFrame>
  );
}
