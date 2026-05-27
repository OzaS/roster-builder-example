import { Gem } from "lucide-react";
import { DockGlass } from "../concepts/dock/DockGlass";
import type { GalleryConcept } from "./galleryTypes";

export const futureConcepts: GalleryConcept[] = [];

export const newConcepts: GalleryConcept[] = [
  {
    id: "dock-glass",
    mode: "current",
    name: "Dock Glass",
    eyebrow: "Chosen direction",
    icon: Gem,
    bestFor: "Premium dark roster-building workflow with practical editing density.",
    direction: "Frosted roster streams, dark/light Material tokens, progress-first status, and a floating bottom dock.",
    interaction: "Workflow navigator shows each simulator-inspired step as its own mobile screen.",
    tradeoff: "The workflow still needs product distillation, but this keeps the style direction stable.",
    component: DockGlass,
  },
];

export const activeConcepts = newConcepts;
