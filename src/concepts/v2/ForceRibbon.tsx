import { Plus } from "lucide-react";
import { BottomDock } from "../../components/v2/BottomDock";
import { ForceRibbon as ForceRibbonNav } from "../../components/v2/ForceRibbon";
import { MaterialAppFrame } from "../../components/v2/MaterialAppFrame";
import { RosterBudgetBar } from "../../components/v2/RosterBudgetBar";
import type { ConceptProps } from "../shared";
import { V2FlowGate, V2ValidationAndDetail } from "./shared";

export function ForceRibbon(props: ConceptProps) {
  const shared = V2FlowGate(props);

  return (
    <MaterialAppFrame
      roster={props.roster}
      screen={props.screen}
      canGoBack={props.canGoBack}
      onBack={props.onBack}
      onNavigate={props.onNavigate}
      className="force-ribbon-concept"
      title="Force Ribbon"
    >
      {shared ?? (
        <>
          <section className="ribbon-header">
            <RosterBudgetBar roster={props.roster} compact />
            <button type="button" onClick={() => props.onNavigate("add-unit")}>
              <Plus size={17} />
              Unit
            </button>
          </section>
          <ForceRibbonNav sections={props.roster.sections} selectedSectionId={props.selectedSectionId} onSelectSection={props.onSelectSection} />
          <section className="ribbon-lane">
            <header>
              <strong>{props.selectedSection.name}</strong>
              <small>{props.selectedSection.required} slots · {props.selectedSection.units.length} units</small>
            </header>
            <V2ValidationAndDetail props={props} />
          </section>
          <BottomDock active={props.screen} onNavigate={props.onNavigate} />
        </>
      )}
    </MaterialAppFrame>
  );
}
