import { Gauge, GitBranch, LayoutDashboard, ListTree, Route, Sparkles } from "lucide-react";
import { ArmoryGlassFuture } from "../concepts/future/ArmoryGlassFuture";
import { BuildTimeline } from "../concepts/v2/BuildTimeline";
import { CurvedCommand } from "../concepts/v2/CurvedCommand";
import { ForceRibbon } from "../concepts/v2/ForceRibbon";
import { GlassLedger } from "../concepts/v2/GlassLedger";
import { RosterDock } from "../concepts/v2/RosterDock";
import type { GalleryConcept } from "./galleryTypes";

export const futureConcepts: GalleryConcept[] = [
  {
    id: "armory-future",
    mode: "current",
    name: "Armory Future",
    eyebrow: "Pinned future sample",
    icon: Sparkles,
    bestFor: "Shared visual baseline for future experiments.",
    direction: "Light frosted Material 3 with fewer cards, a soft top shell, force rail, continuous roster surface, and bottom dock.",
    interaction: "Reviewer can move through list, roster, add, configure, validation, and export from one stable baseline.",
    tradeoff: "Deliberately conservative; less provocative than the exploratory concepts.",
    component: ArmoryGlassFuture,
  },
];

export const newConcepts: GalleryConcept[] = [
  {
    id: "curved-command",
    mode: "current",
    name: "Curved Command",
    eyebrow: "Rounded dark shell",
    icon: LayoutDashboard,
    bestFor: "Phone-first roster review with clear top-level navigation.",
    direction: "Dark capsule header, rising curved content panel, pill tabs, and sheet-based configuration.",
    interaction: "Roster, add, and checks are always one tap away; unit config behaves like a sheet.",
    tradeoff: "Strong mobile personality; tablet needs a wider sheet layout.",
    component: CurvedCommand,
  },
  {
    id: "roster-dock",
    mode: "current",
    name: "Roster Dock",
    eyebrow: "Dark finance-style dock",
    icon: Gauge,
    bestFor: "Fast repeated edits during game-night use.",
    direction: "Dark glass, bright budget bars, compact data rows, and a floating bottom dock.",
    interaction: "Primary actions live in the dock; add flow opens as a full-height picker.",
    tradeoff: "Dense and dramatic; less airy than the baseline.",
    component: RosterDock,
  },
  {
    id: "force-ribbon",
    mode: "current",
    name: "Force Ribbon",
    eyebrow: "Organization-first layout",
    icon: ListTree,
    bestFor: "Users who think in detachments, roles, and slot counts.",
    direction: "Horizontal role ribbon, continuous lane list, and tonal Material 3 surfaces.",
    interaction: "Selecting a role swaps the roster lane and keeps slot impact visible.",
    tradeoff: "More structural than expressive.",
    component: ForceRibbon,
  },
  {
    id: "glass-ledger",
    mode: "current",
    name: "Glass Ledger",
    eyebrow: "Power-user table",
    icon: GitBranch,
    bestFor: "Scan-heavy roster editing and tablet comparison.",
    direction: "Frosted table/list hybrid with budget bars, sticky-like headers, and inline status markers.",
    interaction: "Rows expand into detail configuration without card-per-unit browsing.",
    tradeoff: "Best for experienced builders; more abstract for new users.",
    component: GlassLedger,
  },
  {
    id: "build-timeline",
    mode: "current",
    name: "Build Timeline",
    eyebrow: "Guided creation flow",
    icon: Route,
    bestFor: "Onboarding users into BSData hierarchy.",
    direction: "Stepper rail, one active work surface, soft neumorphic Material 3 panels.",
    interaction: "System, catalogue, detachment, roster, and validation are explicit steps.",
    tradeoff: "Excellent for creation; direct editing needs shortcuts.",
    component: BuildTimeline,
  },
];

export const activeConcepts = [...futureConcepts, ...newConcepts];
