import { ArrowLeft, ArrowRight, Check, CircleCheck, Flag, Sparkles, Wand2 } from "lucide-react";
import { mockCatalogues, mockDetachments, mockSystems } from "../../data/mockRoster";
import type { PrototypeScreen } from "../../types";
import type { ConceptProps } from "../shared";
import { BudgetMeter, Chip, Hint, priceLabel, rosterChecks, StatusGlyph, themeClass } from "./uxShared";

/**
 * Muster Wizard — a guided setup that respects the user's time.
 * Keeps the familiar step-by-step flow new players expect, but adds a clear
 * progress spine, smart defaults, large touch targets, and "why this matters"
 * helper text. Power users can jump straight to Build.
 */

type Step = { id: PrototypeScreen; label: string };

const steps: Step[] = [
  { id: "system", label: "System" },
  { id: "catalogue", label: "Faction" },
  { id: "detachment", label: "Detachment" },
  { id: "overview", label: "Build" },
  { id: "validation", label: "Review" },
];

export function MusterWizard(props: ConceptProps) {
  const screen: PrototypeScreen = props.screen === "library" || props.screen === "export" ? "system" : props.screen;
  const activeIndex = Math.max(0, steps.findIndex((s) => s.id === screen));
  return (
    <div className={`ux-screen ux-wizard ${themeClass(props.themeMode)}`}>
      <Spine activeIndex={activeIndex} onJump={props.onNavigate} />
      <Body props={props} screen={screen} />
    </div>
  );
}

function Spine({ activeIndex, onJump }: { activeIndex: number; onJump: (s: PrototypeScreen) => void }) {
  return (
    <header className="ux-wizard-spine">
      {steps.map((step, i) => {
        const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "todo";
        return (
          <button key={step.id} type="button" className={`ux-spine-step ${state}`} onClick={() => onJump(step.id)}>
            <span className="ux-spine-dot">{state === "done" ? <Check size={12} /> : i + 1}</span>
            <small>{step.label}</small>
          </button>
        );
      })}
    </header>
  );
}

function StepFrame({
  kicker,
  title,
  children,
  hint,
  cta,
  onNext,
  onBack,
  canBack,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  cta: string;
  onNext: () => void;
  onBack?: () => void;
  canBack?: boolean;
}) {
  return (
    <main className="ux-wizard-body">
      <div className="ux-wizard-head">
        <small>{kicker}</small>
        <h1>{title}</h1>
      </div>
      {hint ? <Hint>{hint}</Hint> : null}
      <div className="ux-wizard-choices">{children}</div>
      <div className="ux-wizard-foot">
        {canBack ? (
          <button type="button" className="ux-ghost-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="ux-primary" onClick={onNext}>
          {cta}
          <ArrowRight size={16} />
        </button>
      </div>
    </main>
  );
}

function Body({ props, screen }: { props: ConceptProps; screen: PrototypeScreen }) {
  if (screen === "system") {
    return (
      <StepFrame
        kicker="Step 1 of 5"
        title="Which game system?"
        hint="This sets the ruleset, points scale and which catalogues are available."
        cta="Continue"
        onNext={() => props.onNavigate("catalogue")}
      >
        {mockSystems.map((s) => (
          <button key={s.id} type="button" className={`ux-choice ${s.id === "wh40k-10" ? "on" : ""}`} onClick={() => props.onNavigate("catalogue")}>
            <span>
              <strong>{s.name}</strong>
              <small>{s.edition} · {s.catalogues} catalogues</small>
            </span>
            <span className="ux-choice-tick" aria-hidden>
              <Check size={16} />
            </span>
          </button>
        ))}
      </StepFrame>
    );
  }

  if (screen === "catalogue") {
    return (
      <StepFrame
        kicker="Step 2 of 5"
        title="Pick your faction"
        hint="We default to the most current catalogue version so your list stays legal."
        cta="Continue"
        canBack
        onBack={() => props.onNavigate("system")}
        onNext={() => props.onNavigate("detachment")}
      >
        {mockCatalogues.map((c) => (
          <button key={c.id} type="button" className={`ux-choice ${c.id === "dark-angels" ? "on" : ""}`} onClick={() => props.onNavigate("detachment")}>
            <span>
              <strong>{c.name}</strong>
              <small>Catalogue {c.updated}</small>
            </span>
            <Chip tone={c.status === "Current" ? "valid" : "warning"}>{c.status}</Chip>
          </button>
        ))}
      </StepFrame>
    );
  }

  if (screen === "detachment") {
    return (
      <StepFrame
        kicker="Step 3 of 5"
        title="Choose a detachment"
        hint="The detachment decides your slots and force-org limits. You can change this later."
        cta="Start building"
        canBack
        onBack={() => props.onNavigate("catalogue")}
        onNext={() => props.onNavigate("overview")}
      >
        {mockDetachments.map((d) => (
          <button key={d.id} type="button" className={`ux-choice ${d.id === "crusade" ? "on" : ""}`} onClick={() => props.onNavigate("overview")}>
            <span>
              <strong>{d.name}</strong>
              <small>{d.slots}</small>
            </span>
            <Chip tone="cool">{d.fit}</Chip>
          </button>
        ))}
      </StepFrame>
    );
  }

  if (screen === "unit-detail") {
    return <Config props={props} />;
  }

  if (screen === "add-unit") {
    return <Add props={props} />;
  }

  if (screen === "validation") {
    return <Review props={props} />;
  }

  return <Build props={props} />;
}

function Build({ props }: { props: ConceptProps }) {
  const checks = rosterChecks(props.roster).length;
  return (
    <main className="ux-wizard-body">
      <div className="ux-wizard-head">
        <small>Step 4 of 5 · Build</small>
        <h1>{props.roster.name}</h1>
      </div>
      <BudgetMeter roster={props.roster} />
      <Hint>Tap a slot to add units. Slots with a requirement show how many you still need.</Hint>
      <div className="ux-wizard-slots">
        {props.roster.sections.map((section) => {
          const need = section.required ?? `${section.units.length}`;
          return (
            <button
              key={section.id}
              type="button"
              className="ux-slot-card"
              onClick={() => {
                props.onSelectSection(section.id);
                props.onNavigate("add-unit");
              }}
            >
              <div className="ux-slot-card-top">
                <strong>{section.name}</strong>
                <span className="ux-slot-need">{need}</span>
              </div>
              <div className="ux-slot-card-units">
                {section.units.map((u) => (
                  <span key={u.id} className={`ux-slot-mini ${u.status ?? "valid"}`} onClick={(e) => { e.stopPropagation(); props.onSelectUnit(u.id); }}>
                    {u.name} · {u.points}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
      <div className="ux-wizard-foot">
        <span />
        <button type="button" className="ux-primary" onClick={() => props.onNavigate("validation")}>
          Review {checks ? `(${checks})` : ""}
          <ArrowRight size={16} />
        </button>
      </div>
    </main>
  );
}

function Add({ props }: { props: ConceptProps }) {
  return (
    <main className="ux-wizard-body">
      <div className="ux-wizard-head">
        <small>Add to {props.selectedSection.name}</small>
        <h1>Choose a unit</h1>
      </div>
      <div className="ux-wizard-choices">
        {props.selectedSection.units.map((unit) => (
          <button key={unit.id} type="button" className="ux-choice" onClick={() => props.onSelectUnit(unit.id)}>
            <span>
              <strong>{unit.name}</strong>
              <small>{unit.role}</small>
            </span>
            <b>{unit.points} pts</b>
          </button>
        ))}
      </div>
      <div className="ux-wizard-foot">
        <button type="button" className="ux-ghost-btn" onClick={() => props.onNavigate("overview")}>
          <ArrowLeft size={16} />
          Back to build
        </button>
        <span />
      </div>
    </main>
  );
}

function Config({ props }: { props: ConceptProps }) {
  const unit = props.selectedUnit;
  return (
    <main className="ux-wizard-body">
      <div className="ux-wizard-head">
        <small>{props.selectedSection.name}</small>
        <h1>{unit.name}</h1>
      </div>
      <div className="ux-keywords">
        {unit.keywords.map((k) => (
          <Chip key={k} tone="cool">
            {k}
          </Chip>
        ))}
      </div>
      <Hint>Recommended wargear is pre-selected. Toggle anything you want to change.</Hint>
      <div className="ux-wizard-choices">
        {unit.options.map((opt) => (
          <button key={opt.id} type="button" className={`ux-opt-row ${opt.selected ? "on" : ""}`} onClick={() => props.onToggleOption(opt.id)}>
            <span className="ux-opt-check" aria-hidden />
            <span>{opt.name}</span>
            <em>{priceLabel(opt.points)}</em>
          </button>
        ))}
      </div>
      <div className="ux-wizard-foot">
        <button type="button" className="ux-ghost-btn" onClick={props.onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <button type="button" className="ux-primary" onClick={props.onBack}>
          Confirm
          <Check size={16} />
        </button>
      </div>
    </main>
  );
}

function Review({ props }: { props: ConceptProps }) {
  const checks = rosterChecks(props.roster);
  return (
    <main className="ux-wizard-body">
      <div className="ux-wizard-head">
        <small>Step 5 of 5 · Review</small>
        <h1>{checks.length ? "Almost there" : "Ready to play"}</h1>
      </div>
      <BudgetMeter roster={props.roster} />
      {checks.length === 0 ? (
        <div className="ux-empty">
          <CircleCheck size={24} />
          <strong>This roster is legal</strong>
          <small>Every slot requirement is satisfied.</small>
        </div>
      ) : (
        <div className="ux-wizard-choices">
          {checks.map((unit) => (
            <button key={unit.id} type="button" className={`ux-check-row ${unit.status}`} onClick={() => props.onSelectUnit(unit.id)}>
              <StatusGlyph status={unit.status} size={18} />
              <span>
                <strong>{unit.name}</strong>
                <small>{unit.note ?? unit.slotImpact}</small>
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="ux-wizard-foot">
        <button type="button" className="ux-ghost-btn" onClick={() => props.onNavigate("overview")}>
          <Wand2 size={16} />
          Keep building
        </button>
        <button type="button" className="ux-primary" onClick={() => props.onNavigate("overview")}>
          <Flag size={16} />
          Finish
        </button>
      </div>
      <button type="button" className="ux-skip-link" onClick={() => props.onNavigate("overview")}>
        <Sparkles size={14} />
        Auto-fill remaining required slots
      </button>
    </main>
  );
}
