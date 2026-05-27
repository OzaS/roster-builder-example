import type { PrototypeScreen, WorkflowScreen } from "../types";

export const workflowScreens: Array<{ id: WorkflowScreen; label: string }> = [
  { id: "library", label: "Library" },
  { id: "create-roster", label: "Create Roster" },
  { id: "drafts", label: "Drafts" },
  { id: "source", label: "Source" },
  { id: "overview", label: "Overview" },
  { id: "add-detachment", label: "Add Detachment" },
  { id: "add-unit", label: "Add Unit" },
  { id: "unit-detail", label: "Unit Detail" },
  { id: "option-drilldown", label: "Option Drilldown" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "export", label: "Export" },
];

export function workflowToPrototypeScreen(screen: WorkflowScreen): PrototypeScreen {
  if (screen === "create-roster") return "system";
  if (screen === "drafts") return "library";
  if (screen === "source") return "catalogue";
  if (screen === "add-detachment") return "detachment";
  if (screen === "option-drilldown") return "unit-detail";
  if (screen === "diagnostics") return "validation";
  return screen;
}
