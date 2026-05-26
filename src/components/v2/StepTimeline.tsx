import type { PrototypeScreen } from "../../types";

type Props = {
  active: PrototypeScreen;
  onNavigate: (screen: PrototypeScreen) => void;
};

export function StepTimeline({ active, onNavigate }: Props) {
  const steps: Array<{ id: PrototypeScreen; label: string }> = [
    { id: "system", label: "System" },
    { id: "catalogue", label: "Catalogue" },
    { id: "detachment", label: "Detachment" },
    { id: "overview", label: "Roster" },
    { id: "validation", label: "Validate" },
  ];
  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === active));

  return (
    <nav className="v2-timeline" aria-label="Build steps">
      {steps.map((step, index) => (
        <button className={index <= activeIndex ? "done" : ""} key={step.id} type="button" onClick={() => onNavigate(step.id)}>
          <span>{index + 1}</span>
          <strong>{step.label}</strong>
        </button>
      ))}
    </nav>
  );
}
