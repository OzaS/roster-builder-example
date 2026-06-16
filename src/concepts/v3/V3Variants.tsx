import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  CircleDot,
  Download,
  Layers,
  Plus,
  Radar,
  Search,
  SlidersHorizontal,
  Sparkles,
  Terminal,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { PrototypeScreen, RosterUnit } from "../../types";
import type { ConceptProps } from "../shared";

type V3Variant = "brutal" | "agent" | "chrome" | "editorial" | "radar";

const variantCopy: Record<V3Variant, { title: string; kicker: string; action: string }> = {
  brutal: { title: "Data Stack", kicker: "Ops console", action: "Commit build" },
  agent: { title: "Agent Palette", kicker: "Prompt-first roster", action: "Ask assistant" },
  chrome: { title: "Liquid Chrome", kicker: "Adaptive glassless", action: "Tune list" },
  editorial: { title: "Field Brief", kicker: "Magazine density", action: "Publish" },
  radar: { title: "Spatial Radar", kicker: "Map the force", action: "Scan checks" },
};

export function BrutalStack(props: ConceptProps) {
  return <V3Experience props={props} variant="brutal" />;
}

export function AgentPalette(props: ConceptProps) {
  return <V3Experience props={props} variant="agent" />;
}

export function LiquidChrome(props: ConceptProps) {
  return <V3Experience props={props} variant="chrome" />;
}

export function EditorialBrief(props: ConceptProps) {
  return <V3Experience props={props} variant="editorial" />;
}

export function SpatialRadar(props: ConceptProps) {
  return <V3Experience props={props} variant="radar" />;
}

function V3Experience({ props, variant }: { props: ConceptProps; variant: V3Variant }) {
  const copy = variantCopy[variant];
  const allUnits = props.roster.sections.flatMap((section) => section.units.map((unit) => ({ ...unit, sectionName: section.name })));
  const checks = allUnits.filter((unit) => unit.status !== "valid");
  const openPoints = props.roster.pointsLimit - props.roster.pointsUsed;

  return (
    <div className={`v3-screen v3-${variant} ${props.themeMode ?? "dark"}`}>
      <V3Header props={props} title={copy.title} />
      <main className="v3-workspace">
        <section className="v3-hero">
          <div>
            <small>{copy.kicker}</small>
            <h1>{props.roster.name}</h1>
          </div>
          <div className="v3-score">
            <strong>{props.roster.pointsUsed}</strong>
            <small>{openPoints} open</small>
          </div>
          <button className="v3-primary-action" type="button" onClick={() => props.onNavigate(variant === "agent" ? "add-unit" : "validation")}>
            {variant === "agent" ? <Bot size={16} /> : variant === "radar" ? <Radar size={16} /> : <Sparkles size={16} />}
            {copy.action}
          </button>
        </section>

        {variant === "agent" ? <AgentPrompt props={props} /> : null}
        {variant === "radar" ? <RadarMap props={props} units={allUnits} /> : null}
        {variant === "editorial" ? <EditorialStats props={props} checks={checks.length} /> : null}

        <V3SectionRail props={props} variant={variant} />
        <V3ScreenBody props={props} units={allUnits} checks={checks} variant={variant} />
      </main>
      <V3Dock active={props.screen} onNavigate={props.onNavigate} />
    </div>
  );
}

function V3Header({ props, title }: { props: ConceptProps; title: string }) {
  return (
    <header className="v3-header">
      <button type="button" aria-label={props.canGoBack ? "Back" : "Roster"} onClick={props.canGoBack ? props.onBack : undefined}>
        {props.canGoBack ? <ArrowLeft size={18} /> : <Layers size={18} />}
      </button>
      <span>
        <strong>{title}</strong>
        <small>{props.roster.faction}</small>
      </span>
      <button type="button" aria-label="Search" onClick={() => props.onNavigate("library")}>
        <Search size={18} />
      </button>
      <button type="button" aria-label="Export" onClick={() => props.onNavigate("export")}>
        <Download size={18} />
      </button>
    </header>
  );
}

function AgentPrompt({ props }: { props: ConceptProps }) {
  return (
    <section className="v3-prompt">
      <Bot size={18} />
      <span>Find a legal 160 point objective holder for {props.selectedSection.name.toLowerCase()}</span>
      <button type="button" onClick={() => props.onNavigate("add-unit")}>
        <Plus size={15} />
      </button>
    </section>
  );
}

function EditorialStats({ props, checks }: { props: ConceptProps; checks: number }) {
  return (
    <section className="v3-editorial-stats">
      <span>
        <strong>{props.roster.sections.length}</strong>
        <small>roles</small>
      </span>
      <span>
        <strong>{props.selectedSection.units.length}</strong>
        <small>{props.selectedSection.name}</small>
      </span>
      <span>
        <strong>{checks}</strong>
        <small>checks</small>
      </span>
    </section>
  );
}

function RadarMap({ props, units }: { props: ConceptProps; units: Array<RosterUnit & { sectionName: string }> }) {
  return (
    <section className="v3-radar-map" aria-label="Force map">
      <div className="v3-radar-sweep" />
      {units.slice(0, 7).map((unit, index) => (
        <button
          className={`v3-radar-dot ${props.selectedUnit.id === unit.id ? "active" : ""} ${unit.status ?? "valid"}`}
          key={unit.id}
          style={{ "--x": `${18 + ((index * 23) % 68)}%`, "--y": `${20 + ((index * 31) % 58)}%` } as CSSProperties}
          type="button"
          onClick={() => props.onSelectUnit(unit.id)}
          aria-label={unit.name}
        />
      ))}
      <span>
        <Radar size={16} />
        {props.selectedUnit.name}
      </span>
    </section>
  );
}

function V3SectionRail({ props, variant }: { props: ConceptProps; variant: V3Variant }) {
  return (
    <nav className="v3-section-rail" aria-label="Roster sections">
      {props.roster.sections.map((section) => (
        <button className={section.id === props.selectedSectionId ? "active" : ""} key={section.id} type="button" onClick={() => props.onSelectSection(section.id)}>
          {variant === "brutal" ? <Terminal size={15} /> : variant === "radar" ? <CircleDot size={15} /> : <Activity size={15} />}
          <span>
            <strong>{section.name}</strong>
            <small>{section.required ?? `${section.units.length}`}</small>
          </span>
        </button>
      ))}
    </nav>
  );
}

function V3ScreenBody({
  props,
  units,
  checks,
  variant,
}: {
  props: ConceptProps;
  units: Array<RosterUnit & { sectionName: string }>;
  checks: Array<RosterUnit & { sectionName: string }>;
  variant: V3Variant;
}) {
  if (props.screen === "library") {
    return <V3Library props={props} />;
  }

  if (props.screen === "add-unit") {
    return <V3AddUnit props={props} units={units} />;
  }

  if (props.screen === "validation") {
    return <V3Checks checks={checks} onOpenUnit={props.onSelectUnit} />;
  }

  if (props.screen === "export") {
    return <V3Export props={props} />;
  }

  return (
    <section className={`v3-grid v3-grid-${variant}`}>
      <V3UnitTable props={props} units={variant === "brutal" ? units : props.selectedSection.units.map((unit) => ({ ...unit, sectionName: props.selectedSection.name }))} />
      <V3Inspector props={props} checks={checks} />
    </section>
  );
}

function V3UnitTable({ props, units }: { props: ConceptProps; units: Array<RosterUnit & { sectionName: string }> }) {
  return (
    <section className="v3-unit-table">
      <header>
        <span>Unit</span>
        <span>Role</span>
        <span>Pts</span>
        <span>Qty</span>
      </header>
      {units.map((unit) => (
        <button className={`${props.selectedUnit.id === unit.id ? "active" : ""} ${unit.status ?? "valid"}`} key={unit.id} type="button" onClick={() => props.onSelectUnit(unit.id)}>
          <strong>{unit.name}</strong>
          <span>{unit.role}</span>
          <b>{unit.points}</b>
          <small>{unit.count}</small>
        </button>
      ))}
    </section>
  );
}

function V3Inspector({ props, checks }: { props: ConceptProps; checks: Array<RosterUnit & { sectionName: string }> }) {
  return (
    <aside className="v3-inspector">
      <header>
        <span>
          <small>Selected</small>
          <strong>{props.selectedUnit.name}</strong>
        </span>
        {props.selectedUnit.status === "valid" ? <CheckCircle2 size={19} /> : <AlertTriangle size={19} />}
      </header>
      <p>{props.selectedUnit.note ?? props.selectedUnit.slotImpact}</p>
      <div className="v3-keywords">
        {props.selectedUnit.keywords.map((keyword) => (
          <span key={keyword}>{keyword}</span>
        ))}
      </div>
      <div className="v3-options">
        {props.selectedUnit.options.map((option) => (
          <button className={option.selected ? "selected" : ""} key={option.id} type="button" onClick={() => props.onToggleOption(option.id)}>
            <span>{option.name}</span>
            <b>{option.points > 0 ? `+${option.points}` : option.group}</b>
          </button>
        ))}
      </div>
      <button className="v3-check-link" type="button" onClick={() => props.onNavigate("validation")}>
        <AlertTriangle size={15} />
        {checks.length} roster checks
      </button>
    </aside>
  );
}

function V3Checks({ checks, onOpenUnit }: { checks: Array<RosterUnit & { sectionName: string }>; onOpenUnit: (id: string) => void }) {
  return (
    <section className="v3-checks">
      <header>
        <strong>Validation feed</strong>
        <small>{checks.length} items</small>
      </header>
      {checks.length === 0 ? (
        <span className="v3-empty-check">
          <CheckCircle2 size={18} />
          Roster is valid.
        </span>
      ) : (
        checks.map((unit) => (
          <button key={unit.id} type="button" onClick={() => onOpenUnit(unit.id)}>
            <AlertTriangle size={17} />
            <span>
              <strong>{unit.name}</strong>
              <small>{unit.note ?? unit.sectionName}</small>
            </span>
          </button>
        ))
      )}
    </section>
  );
}

function V3Library({ props }: { props: ConceptProps }) {
  const rows = ["Crusade Primary Detachment", "Incursion Test List", "Narrative Boarding Patrol"];

  return (
    <section className="v3-list-screen">
      {rows.map((row, index) => (
        <button key={row} type="button" onClick={() => props.onNavigate("overview")}>
          <strong>{row}</strong>
          <span>{index === 0 ? props.roster.faction : "Saved roster"}</span>
          <b>{index === 0 ? `${props.roster.pointsUsed}/${props.roster.pointsLimit}` : "500/1000"}</b>
        </button>
      ))}
    </section>
  );
}

function V3AddUnit({ props, units }: { props: ConceptProps; units: Array<RosterUnit & { sectionName: string }> }) {
  return (
    <section className="v3-list-screen">
      {units.map((unit) => (
        <button key={unit.id} type="button" onClick={() => props.onSelectUnit(unit.id)}>
          <strong>{unit.name}</strong>
          <span>{unit.sectionName}</span>
          <b>{unit.availability}</b>
        </button>
      ))}
    </section>
  );
}

function V3Export({ props }: { props: ConceptProps }) {
  return (
    <section className="v3-list-screen v3-export">
      {["Share link", "Download roster", "Print brief"].map((label) => (
        <button key={label} type="button" onClick={() => props.onNavigate("overview")}>
          <strong>{label}</strong>
          <span>{props.roster.system}</span>
          <Download size={17} />
        </button>
      ))}
    </section>
  );
}

function V3Dock({ active, onNavigate }: { active: PrototypeScreen; onNavigate: (screen: PrototypeScreen) => void }) {
  const items = [
    { id: "overview" as const, label: "Build", icon: Layers },
    { id: "add-unit" as const, label: "Add", icon: Plus },
    { id: "validation" as const, label: "Checks", icon: SlidersHorizontal },
    { id: "export" as const, label: "Out", icon: Download },
  ];

  return (
    <nav className="v3-dock" aria-label="Primary">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button className={active === item.id ? "active" : ""} key={item.id} type="button" onClick={() => onNavigate(item.id)}>
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
