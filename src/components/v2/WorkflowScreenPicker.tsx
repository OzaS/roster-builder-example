import type { WorkflowScreen } from "../../types";
import { workflowScreens } from "../../gallery/workflow";

type Props = {
  active: WorkflowScreen;
  onSelect: (screen: WorkflowScreen) => void;
};

export function WorkflowScreenPicker({ active, onSelect }: Props) {
  return (
    <section className="workflow-picker">
      <h3>Workflow</h3>
      <div className="workflow-screen-list">
        {workflowScreens.map((screen) => (
          <button className={active === screen.id ? "active" : ""} key={screen.id} type="button" onClick={() => onSelect(screen.id)}>
            {screen.label}
          </button>
        ))}
      </div>
    </section>
  );
}
