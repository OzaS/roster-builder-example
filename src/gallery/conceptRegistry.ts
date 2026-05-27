import { Gauge, Gem, Layers3, ListChecks, Sparkles } from "lucide-react";
import { DockBalanced } from "../concepts/dock/DockBalanced";
import { DockEfficiency } from "../concepts/dock/DockEfficiency";
import { DockFocus } from "../concepts/dock/DockFocus";
import { DockGlass } from "../concepts/dock/DockGlass";
import { DockShowcase } from "../concepts/dock/DockShowcase";
import type { GalleryConcept } from "./galleryTypes";

export const futureConcepts: GalleryConcept[] = [];

export const newConcepts: GalleryConcept[] = [
  {
    id: "dock-efficiency",
    mode: "current",
    name: "Dock Efficiency",
    eyebrow: "01 · most minimal",
    icon: ListChecks,
    bestFor: "Fastest roster editing and dense review.",
    direction: "Restrained dark Material UI, compact rows, minimal decoration, always-visible status and actions.",
    interaction: "Everything important stays close: points, checks, section, add, and unit rows.",
    tradeoff: "Least emotional and least polished visually.",
    component: DockEfficiency,
  },
  {
    id: "dock-balanced",
    mode: "current",
    name: "Dock Balanced",
    eyebrow: "02 · product default",
    icon: Gauge,
    bestFor: "Likely product default for repeated roster editing.",
    direction: "Dark finance-inspired shell with visible dock labels, budget bar, section rail, and comfortable row density.",
    interaction: "Keeps the current Roster Dock model while sharpening hierarchy.",
    tradeoff: "Less specialized than the more extreme variants.",
    component: DockBalanced,
  },
  {
    id: "dock-focus",
    mode: "current",
    name: "Dock Focus",
    eyebrow: "03 · calmer editing",
    icon: Layers3,
    bestFor: "Cleaner editing sessions with lower cognitive load.",
    direction: "Dark top shell, prominent section rail, quieter rows, and metadata moved into the detail sheet.",
    interaction: "One active section gets emphasis; details appear when the user selects a unit.",
    tradeoff: "Hides some metadata until selection.",
    component: DockFocus,
  },
  {
    id: "dock-glass",
    mode: "current",
    name: "Dock Glass",
    eyebrow: "04 · premium dark",
    icon: Gem,
    bestFor: "Premium dark product feel while preserving practical roster editing.",
    direction: "Frosted roster streams, stronger blur/depth, brighter Material progress bars, and a stronger floating dock.",
    interaction: "Continuous lanes remain efficient, with validation and points made more visual.",
    tradeoff: "Blur and depth must be performance-tested on real devices.",
    component: DockGlass,
  },
  {
    id: "dock-showcase",
    mode: "current",
    name: "Dock Showcase",
    eyebrow: "05 · prettiest",
    icon: Sparkles,
    bestFor: "Stakeholder demos and visual direction review.",
    direction: "Large hero points treatment, richer rounded shells, stronger lighting, and presentation-grade depth.",
    interaction: "Core add, configure, validate, and export actions remain easy despite lower density.",
    tradeoff: "Lower information density.",
    component: DockShowcase,
  },
];

export const activeConcepts = newConcepts;
