import { Command, PanelsTopLeft } from "lucide-react";
import { QuickstrikeCommand } from "../concepts/ux/QuickstrikeCommand";
import { CodexWorkbench } from "../concepts/ux/CodexWorkbench";
import type { GalleryConcept } from "./galleryTypes";

// The two directions chosen to move forward with.
export const uxConcepts: GalleryConcept[] = [
  {
    id: "ux-command",
    name: "Quickstrike Command",
    eyebrow: "UX · search-first",
    icon: Command,
    bestFor: "Experienced players who know what they want and hate tapping through menus.",
    direction: "Thumb-zone command bar, fuzzy results, smart legal/affordable filters, and assistant suggestions.",
    interaction: "Type to add any unit from anywhere instead of drilling system → catalogue → org → category → unit.",
    tradeoff: "Relies on strong search/AI; the value is invisible until the catalogue index is good.",
    component: QuickstrikeCommand,
    workflow: ["library", "overview", "add-unit", "unit-detail", "diagnostics", "export"],
  },
  {
    id: "ux-workbench",
    name: "Codex Workbench",
    eyebrow: "UX · master-detail",
    icon: PanelsTopLeft,
    bestFor: "Tablet power-editing and tuning loadouts without losing roster context.",
    direction: "Persistent roster tree, live detail pane and a validation rail; collapses to one pane on phone.",
    interaction: "Select in the tree, edit on the right, watch legality update in the rail — the deep nesting becomes one tree.",
    tradeoff: "Shines on tablet; on phone it falls back to a more conventional drill-in.",
    component: CodexWorkbench,
    workflow: ["overview", "add-unit", "unit-detail", "diagnostics"],
  },
];

export const activeConcepts = uxConcepts;
