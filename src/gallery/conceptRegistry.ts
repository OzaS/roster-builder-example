import { Bot, Command, Gem, LayoutGrid, Newspaper, PanelsTopLeft, Radar, ScrollText, Sparkles, Terminal, WandSparkles } from "lucide-react";
import { DockGlass } from "../concepts/dock/DockGlass";
import { ContinuousCanvas } from "../concepts/ux/ContinuousCanvas";
import { QuickstrikeCommand } from "../concepts/ux/QuickstrikeCommand";
import { MusterWizard } from "../concepts/ux/MusterWizard";
import { CodexWorkbench } from "../concepts/ux/CodexWorkbench";
import { FieldCards } from "../concepts/ux/FieldCards";
import { AgentPalette, BrutalStack, EditorialBrief, LiquidChrome, SpatialRadar } from "../concepts/v3/V3Variants";
import type { GalleryConcept } from "./galleryTypes";

export const futureConcepts: GalleryConcept[] = [];

export const uxConcepts: GalleryConcept[] = [
  {
    id: "ux-canvas",
    mode: "current",
    name: "Continuous Canvas",
    eyebrow: "UX · kill the wizard",
    icon: ScrollText,
    bestFor: "Everyday list editing where momentum matters more than ceremony.",
    direction: "One scrollable roster with a pinned points meter; modern dark/light surfaces and a calm slot rhythm.",
    interaction: "Adding units never leaves the page — a slot-scoped sheet slides up, and units expand inline to edit loadouts.",
    tradeoff: "Fixes the existing apps' deepest pain (5+ nested screens) but trades a guided hand-hold for new players.",
    component: ContinuousCanvas,
  },
  {
    id: "ux-command",
    mode: "current",
    name: "Quickstrike Command",
    eyebrow: "UX · search-first",
    icon: Command,
    bestFor: "Experienced players who know what they want and hate tapping through menus.",
    direction: "Thumb-zone command bar, fuzzy results, smart legal/affordable filters, and assistant suggestions.",
    interaction: "Type to add any unit from anywhere instead of drilling system → catalogue → org → category → unit.",
    tradeoff: "Relies on strong search/AI; the value is invisible until the catalogue index is good.",
    component: QuickstrikeCommand,
  },
  {
    id: "ux-wizard",
    mode: "current",
    name: "Muster Wizard",
    eyebrow: "UX · guided, modernised",
    icon: WandSparkles,
    bestFor: "Onboarding and newer players who want a confident, hand-held setup.",
    direction: "A clear progress spine, big touch targets, smart defaults and 'why this matters' helper text.",
    interaction: "Keeps the familiar step flow but lets power users jump steps and auto-fill required slots.",
    tradeoff: "Still linear by nature — better than the legacy wizard, but heavier than the canvas for veterans.",
    component: MusterWizard,
  },
  {
    id: "ux-workbench",
    mode: "current",
    name: "Codex Workbench",
    eyebrow: "UX · master-detail",
    icon: PanelsTopLeft,
    bestFor: "Tablet power-editing and tuning loadouts without losing roster context.",
    direction: "Persistent roster tree, live detail pane and a validation rail; collapses to one pane on phone.",
    interaction: "Select in the tree, edit on the right, watch legality update in the rail — the deep nesting becomes one tree.",
    tradeoff: "Shines on tablet; on phone it falls back to a more conventional drill-in.",
    component: CodexWorkbench,
  },
  {
    id: "ux-deck",
    mode: "current",
    name: "Field Cards",
    eyebrow: "UX · gesture-native",
    icon: LayoutGrid,
    bestFor: "Casual, mobile-first building and browsing a slot's options quickly.",
    direction: "Large unit cards, a radial points arc, and swipe affordances for add/skip; minimal precise tapping.",
    interaction: "Swipe to add or dismiss, tap to flip a card for its loadout, page between slots with a thumb.",
    tradeoff: "Lower information density than a table; great for browsing, less ideal for big-army audits.",
    component: FieldCards,
  },
];

export const newConcepts: GalleryConcept[] = [
  {
    id: "brutal-stack",
    mode: "current",
    name: "Brutal Stack",
    eyebrow: "Dense utility",
    icon: Terminal,
    bestFor: "Fast editing where tabular scan speed matters more than atmosphere.",
    direction: "Neo-brutalist blocks, hard borders, terminal rhythm, compact rows, and high contrast labels.",
    interaction: "Full roster table stays visible while the inspector edits the selected unit.",
    tradeoff: "Less emotional polish, but the information scent is immediate.",
    component: BrutalStack,
  },
  {
    id: "agent-palette",
    mode: "current",
    name: "Agent Palette",
    eyebrow: "AI-native",
    icon: Bot,
    bestFor: "Users who want roster building to start from intent, search, and suggestions.",
    direction: "Command palette layout, prompt strip, compact result rows, and assistant-led actions.",
    interaction: "The prompt lane drives add-unit and validation paths without hiding manual controls.",
    tradeoff: "Requires strong assistant behavior later; the shell is intentionally prompt-forward.",
    component: AgentPalette,
  },
  {
    id: "liquid-chrome",
    mode: "current",
    name: "Liquid Chrome",
    eyebrow: "2026 polish",
    icon: Sparkles,
    bestFor: "Premium consumer feel without returning to skeuomorphic or neumorphic panels.",
    direction: "Glossy metal accents, crisp surfaces, saturated status color, and minimal card boundaries.",
    interaction: "Sections act like a control ribbon while the workspace remains a continuous editor.",
    tradeoff: "More visual energy than the utility-first variants.",
    component: LiquidChrome,
  },
  {
    id: "editorial-brief",
    mode: "current",
    name: "Editorial Brief",
    eyebrow: "Typographic",
    icon: Newspaper,
    bestFor: "Reviewing and presenting a roster as a compact field brief.",
    direction: "Large type, newspaper-like hierarchy, rule lines, white space used as grouping instead of cards.",
    interaction: "Stats, section rail, rows, and inspector read as one printable brief.",
    tradeoff: "Less app-like; better for review than high-volume tapping.",
    component: EditorialBrief,
  },
  {
    id: "spatial-radar",
    mode: "current",
    name: "Spatial Radar",
    eyebrow: "Map interface",
    icon: Radar,
    bestFor: "Exploring force composition spatially while preserving dense row editing.",
    direction: "Radar map, coordinate dots, thin neon rules, and a dark mission-control surface.",
    interaction: "The map selects units and the table/inspector handle precise edits.",
    tradeoff: "The spatial layer is conceptual and would need real grouping logic in production.",
    component: SpatialRadar,
  },
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

export const activeConcepts = [...uxConcepts, ...newConcepts];
