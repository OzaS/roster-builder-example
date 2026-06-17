import type { PrototypeScreen, WorkflowScreen } from "../types";

export const workflowScreens: Array<{ id: WorkflowScreen; label: string }> = [
  { id: "library", label: "Library" },
  { id: "create-roster", label: "Create Roster" },
  { id: "drafts", label: "Drafts" },
  { id: "source", label: "Lookup" },
  { id: "tools", label: "Tools" },
  { id: "overview", label: "Overview" },
  { id: "add-detachment", label: "Add Detachment" },
  { id: "add-unit", label: "Add Unit" },
  { id: "unit-detail", label: "Unit Detail" },
  { id: "option-drilldown", label: "Option Drilldown" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "settings", label: "Settings" },
  { id: "export", label: "Export" },
];

const workflowLabels: Record<WorkflowScreen, string> = workflowScreens.reduce(
  (acc, item) => ({ ...acc, [item.id]: item.label }),
  {} as Record<WorkflowScreen, string>,
);

export function workflowScreenLabel(screen: WorkflowScreen): string {
  return workflowLabels[screen] ?? screen;
}

/** Resolve which workflow screens a concept exposes, falling back to the full flow. */
export function resolveWorkflow(workflow?: WorkflowScreen[]): Array<{ id: WorkflowScreen; label: string }> {
  if (workflow && workflow.length > 0) {
    return workflow.map((id) => ({ id, label: workflowScreenLabel(id) }));
  }
  return workflowScreens;
}

export function workflowToPrototypeScreen(screen: WorkflowScreen): PrototypeScreen {
  if (screen === "create-roster") return "system";
  if (screen === "drafts") return "library";
  if (screen === "source") return "catalogue";
  if (screen === "add-detachment") return "detachment";
  if (screen === "option-drilldown") return "unit-detail";
  if (screen === "diagnostics") return "validation";
  return screen;
}

export function prototypeToWorkflowScreen(screen: PrototypeScreen): WorkflowScreen {
  if (screen === "system") return "create-roster";
  if (screen === "catalogue") return "source";
  if (screen === "detachment") return "add-detachment";
  if (screen === "validation") return "diagnostics";
  return screen;
}
