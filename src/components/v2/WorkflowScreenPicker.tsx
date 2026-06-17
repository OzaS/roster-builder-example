import type { WorkflowScreen } from "../../types";
import type { WorkflowFlow } from "../../gallery/galleryTypes";
import { resolveWorkflow } from "../../gallery/workflow";

export type WorkflowPickerSelection = "all" | WorkflowScreen;

type Props = {
  active: WorkflowPickerSelection;
  screens?: WorkflowScreen[];
  flows?: WorkflowFlow[];
  onSelect: (screen: WorkflowPickerSelection) => void;
};

export function WorkflowScreenPicker({ active, screens, flows, onSelect }: Props) {
  const items = flows && flows.length > 0 ? flows : resolveWorkflow(screens).map((screen) => ({ id: screen.id, label: screen.label, screen: screen.id }));

  return (
    <details className="workflow-picker" open>
      <summary>
        <h3>Workflow</h3>
      </summary>
      <div className="workflow-screen-list">
        <button className={active === "all" ? "active" : ""} type="button" onClick={() => onSelect("all")}>
          All
        </button>
        {items.map((item) => (
          <button className={active === item.screen ? "active" : ""} key={item.id} type="button" onClick={() => onSelect(item.screen)}>
            {item.label}
          </button>
        ))}
      </div>
    </details>
  );
}
