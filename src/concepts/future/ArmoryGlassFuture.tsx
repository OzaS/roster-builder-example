import { Layers3 } from "lucide-react";
import { BottomDock } from "../../components/v2/BottomDock";
import { CurvedPanel } from "../../components/v2/CurvedPanel";
import { ForceRibbon } from "../../components/v2/ForceRibbon";
import { MaterialAppFrame } from "../../components/v2/MaterialAppFrame";
import { RosterBudgetBar } from "../../components/v2/RosterBudgetBar";
import { SegmentedNav } from "../../components/v2/SegmentedNav";
import { UnitConfigSheet } from "../../components/v2/UnitConfigSheet";
import type { ConceptProps } from "../shared";
import { V2FlowGate, V2RosterRows } from "../v2/shared";

export function ArmoryGlassFuture(props: ConceptProps) {
  const shared = V2FlowGate(props);

  return (
    <MaterialAppFrame
      roster={props.roster}
      screen={props.screen}
      canGoBack={props.canGoBack}
      onBack={props.onBack}
      onNavigate={props.onNavigate}
      className="armory-future"
      title="Armory Glass"
    >
      {shared ?? (
        <>
          <section className="future-shell">
            <div>
              <small>Future baseline</small>
              <h1>{props.roster.faction}</h1>
            </div>
            <button type="button" aria-label="Layers">
              <Layers3 size={18} />
            </button>
          </section>
          <CurvedPanel>
            <SegmentedNav active={props.screen} onNavigate={props.onNavigate} />
            <RosterBudgetBar roster={props.roster} />
            <ForceRibbon sections={props.roster.sections} selectedSectionId={props.selectedSectionId} onSelectSection={props.onSelectSection} />
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
