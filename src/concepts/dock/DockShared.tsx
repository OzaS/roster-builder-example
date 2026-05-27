import { Bell, CheckCircle2, Plus, Shield, Sun } from "lucide-react";
import { BottomDock } from "../../components/v2/BottomDock";
import { InlineUnitRow } from "../../components/v2/InlineUnitRow";
import { MaterialAppFrame } from "../../components/v2/MaterialAppFrame";
import { RosterBudgetBar } from "../../components/v2/RosterBudgetBar";
import { UnitConfigSheet } from "../../components/v2/UnitConfigSheet";
import { ValidationRail } from "../../components/v2/ValidationRail";
import type { RosterSection } from "../../types";
import type { ConceptProps } from "../shared";
import { V2FlowGate } from "../v2/shared";

type Density = "efficiency" | "balanced" | "focus" | "glass" | "showcase";

type FrameProps = {
  props: ConceptProps;
  density: Density;
  title: string;
  children: React.ReactNode;
};

export function DockVariantFrame({ props, density, title, children }: FrameProps) {
  const shared = V2FlowGate(props);

  return (
    <MaterialAppFrame
      roster={props.roster}
      screen={props.screen}
      canGoBack={props.canGoBack}
      mode="dark"
      onBack={props.onBack}
      onNavigate={props.onNavigate}
      className={`dock-variant dock-${density}`}
      title={title}
    >
      {shared ?? children}
    </MaterialAppFrame>
  );
}

export function DockHero({ props, density }: { props: ConceptProps; density: Density }) {
  const warningCount = props.roster.sections.flatMap((section) => section.units).filter((unit) => unit.status !== "valid").length;

  return (
    <section className="dock-variant-hero">
      <div>
        <small>{density === "efficiency" ? "Roster status" : density === "showcase" ? "Command ready" : "Good evening"}</small>
        <h1>{props.roster.faction}</h1>
        <strong>{props.roster.pointsUsed.toLocaleString()} pts</strong>
      </div>
      <span className="dock-hero-actions">
        <button type="button" aria-label="Theme">
          <Sun size={18} />
        </button>
        <button type="button" aria-label="Alerts" onClick={() => props.onNavigate("validation")}>
          <Bell size={18} />
        </button>
      </span>
      <DockStatusStrip warnings={warningCount} openPoints={props.roster.pointsLimit - props.roster.pointsUsed} />
    </section>
  );
}

export function DockStatusStrip({ warnings, openPoints }: { warnings: number; openPoints: number }) {
  return (
    <div className="dock-status-strip">
      <span>
        <CheckCircle2 size={15} />
        {openPoints} open
      </span>
      <span>
        <Shield size={15} />
        {warnings} checks
      </span>
    </div>
  );
}

export function DockMetricsRow({ props }: { props: ConceptProps }) {
  const sections = props.roster.sections.length;
  const units = props.roster.sections.reduce((sum, section) => sum + section.units.length, 0);

  return (
    <div className="dock-metrics-row">
      <span>
        <strong>{sections}</strong>
        <small>roles</small>
      </span>
      <span>
        <strong>{units}</strong>
        <small>units</small>
      </span>
      <span>
        <strong>{props.selectedSection.required}</strong>
        <small>{props.selectedSection.name}</small>
      </span>
    </div>
  );
}

export function DockActionBar({ props }: { props: ConceptProps }) {
  return (
    <div className="dock-action-bar">
      <button type="button" onClick={() => props.onNavigate("add-unit")}>
        <Plus size={16} />
        Add unit
      </button>
      <button type="button" onClick={() => props.onNavigate("validation")}>Check</button>
      <button type="button" onClick={() => props.onNavigate("export")}>Export</button>
    </div>
  );
}

export function DockSectionRail({ props, prominent = false }: { props: ConceptProps; prominent?: boolean }) {
  return (
    <nav className={`dock-section-rail ${prominent ? "prominent" : ""}`} aria-label="Force sections">
      {props.roster.sections.map((section) => (
        <button className={section.id === props.selectedSectionId ? "active" : ""} key={section.id} type="button" onClick={() => props.onSelectSection(section.id)}>
          <strong>{section.name}</strong>
          <small>{section.required ?? `${section.units.length}`}</small>
        </button>
      ))}
    </nav>
  );
}

export function DockUnitStream({
  props,
  section = props.selectedSection,
  focus = false,
}: {
  props: ConceptProps;
  section?: RosterSection;
  focus?: boolean;
}) {
  return (
    <div className={`dock-unit-stream ${focus ? "focus" : ""}`}>
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

export function DockOverview({
  props,
  density,
  showBudget = true,
  showMetrics = true,
  prominentRail = false,
  focusRows = false,
}: {
  props: ConceptProps;
  density: Density;
  showBudget?: boolean;
  showMetrics?: boolean;
  prominentRail?: boolean;
  focusRows?: boolean;
}) {
  return (
    <>
      <DockHero props={props} density={density} />
      <main className="dock-variant-workspace">
        {showBudget ? <RosterBudgetBar roster={props.roster} /> : null}
        {showMetrics ? <DockMetricsRow props={props} /> : null}
        <DockSectionRail props={props} prominent={prominentRail} />
        <div className="dock-section-title">
          <strong>{props.selectedSection.name}</strong>
          <button type="button" onClick={() => props.onNavigate("add-unit")}>Add</button>
        </div>
        <DockUnitStream props={props} focus={focusRows} />
        {density === "glass" || density === "showcase" ? <ValidationRail roster={props.roster} onOpenUnit={props.onSelectUnit} /> : null}
      </main>
      {props.screen === "unit-detail" ? (
        <UnitConfigSheet unit={props.selectedUnit} onToggleOption={props.onToggleOption} onValidate={() => props.onNavigate("validation")} />
      ) : null}
      <BottomDock active={props.screen} onNavigate={props.onNavigate} />
    </>
  );
}
