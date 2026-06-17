import type { WorkflowScreen } from "../../types";
import type { WorkflowFlow } from "../../gallery/galleryTypes";
import { resolveWorkflow } from "../../gallery/workflow";

type Props = {
  active: WorkflowScreen;
  screens?: WorkflowScreen[];
  flows?: WorkflowFlow[];
  onSelect: (screen: WorkflowScreen) => void;
};

export function WorkflowScreenPicker({ active, screens, flows, onSelect }: Props) {
  const items = flows && flows.length > 0 ? flows : resolveWorkflow(screens).map((screen) => ({ id: screen.id, label: screen.label, screen: screen.id }));

  return (
    <section className="workflow-picker">
      <h3>Workflow</h3>
      <div className="workflow-screen-list">
        {items.map((item) => (
          <button className={active === item.screen ? "active" : ""} key={item.id} type="button" onClick={() => onSelect(item.screen)}>
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
