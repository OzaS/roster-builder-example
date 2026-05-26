import type { ConceptProps } from "../shared";
import type { RosterSection } from "../../types";
import { BottomDock } from "../../components/v2/BottomDock";
import { ForceRibbon } from "../../components/v2/ForceRibbon";
import { InlineUnitRow } from "../../components/v2/InlineUnitRow";
import { RosterBudgetBar } from "../../components/v2/RosterBudgetBar";
import { SegmentedNav } from "../../components/v2/SegmentedNav";
import { UnitConfigSheet } from "../../components/v2/UnitConfigSheet";
import { ValidationRail } from "../../components/v2/ValidationRail";
import { renderSharedFlow, shouldUseSharedFlow } from "../../components/v2/FlowScreens";

export function V2FlowGate(props: ConceptProps) {
  if (!shouldUseSharedFlow(props.screen)) return null;

  return renderSharedFlow(props.screen, props.roster, props.selectedSection, {
    onNavigate: props.onNavigate,
    onSelectSection: props.onSelectSection,
    onSelectUnit: props.onSelectUnit,
    onCountChange: props.onCountChange,
  });
}

export function V2TopSummary({ props, dark = false }: { props: ConceptProps; dark?: boolean }) {
  return (
    <section className={`v2-top-summary ${dark ? "dark" : ""}`}>
      <div>
        <small>{props.roster.system}</small>
        <h1>{props.roster.name}</h1>
      </div>
      <RosterBudgetBar roster={props.roster} compact />
    </section>
  );
}

export function V2RosterRows({ props, section = props.selectedSection }: { props: ConceptProps; section?: RosterSection }) {
  return (
    <div className="v2-continuous-list">
      {section.units.map((unit) => (
        <InlineUnitRow
          key={unit.id}
          unit={unit}
          selected={props.selectedUnit.id === unit.id}
          onOpen={props.onSelectUnit}
          onCountChange={props.onCountChange}
        />
      ))}
    </div>
  );
}

export function V2OverviewSurface({ props, withDock = true }: { props: ConceptProps; withDock?: boolean }) {
  return (
    <>
      <SegmentedNav active={props.screen} onNavigate={props.onNavigate} />
      <ForceRibbon sections={props.roster.sections} selectedSectionId={props.selectedSectionId} onSelectSection={props.onSelectSection} />
      <V2RosterRows props={props} />
      {props.screen === "unit-detail" ? (
        <UnitConfigSheet unit={props.selectedUnit} onToggleOption={props.onToggleOption} onValidate={() => props.onNavigate("validation")} />
      ) : null}
      {withDock ? <BottomDock active={props.screen} onNavigate={props.onNavigate} /> : null}
    </>
  );
}

export function V2ValidationAndDetail({ props }: { props: ConceptProps }) {
  return (
    <div className="v2-side-grid">
      <V2RosterRows props={props} />
      {props.screen === "unit-detail" ? (
        <UnitConfigSheet unit={props.selectedUnit} onToggleOption={props.onToggleOption} onValidate={() => props.onNavigate("validation")} />
      ) : (
        <ValidationRail roster={props.roster} onOpenUnit={props.onSelectUnit} />
      )}
    </div>
  );
}
