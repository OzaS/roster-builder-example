import type { WorkflowScreen } from "../../types";
import { resolveWorkflow } from "../../gallery/workflow";

type Props = {
  active: WorkflowScreen;
  screens?: WorkflowScreen[];
  onSelect: (screen: WorkflowScreen) => void;
};

export function WorkflowScreenPicker({ active, screens, onSelect }: Props) {
  const items = resolveWorkflow(screens);

  return (
    <section className="workflow-picker">
      <h3>Workflow</h3>
      <div className="workflow-screen-list">
        {items.map((screen) => (
          <button className={active === screen.id ? "active" : ""} key={screen.id} type="button" onClick={() => onSelect(screen.id)}>
            {screen.label}
          </button>
        ))}
      </div>
    </section>
  );
}
