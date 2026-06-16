import { Command, PanelsTopLeft } from "lucide-react";
import { QuickstrikeCommand } from "../concepts/ux/QuickstrikeCommand";
import { CodexWorkbench } from "../concepts/ux/CodexWorkbench";
import type { GalleryConcept } from "./galleryTypes";

// The single merged direction we're moving forward with. Codex Workbench is the
// base; it now folds in the best Quickstrike pieces — the library entry screen,
// the smart search + suggestion chips, and the floating command bar — all gated
// behind a Settings toggle ("Smart search & suggestions").
export const uxConcepts: GalleryConcept[] = [
  {
    id: "ux-workbench",
    name: "Codex Workbench",
    eyebrow: "UX · master-detail",
    icon: PanelsTopLeft,
    bestFor: "Tablet power-editing and tuning loadouts without losing roster context.",
    direction: "Library → persistent roster tree, live detail pane and a validation rail; optional smart search overlays it.",
    interaction: "Select in the tree, edit on the right, watch legality update in the rail. Flip on smart search for type-to-add and AI suggestions.",
    tradeoff: "Shines on tablet; on phone it falls back to a more conventional drill-in.",
    component: CodexWorkbench,
    workflow: ["library", "overview", "add-unit", "unit-detail", "diagnostics", "settings"],
  },
];

// Parked designs kept around for reference; may be revisited later.
export const archivedConcepts: GalleryConcept[] = [
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
];

export const activeConcepts = [...uxConcepts, ...archivedConcepts];
