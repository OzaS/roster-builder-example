import { Boxes, CircuitBoard, Gem, Hammer, Rows3 } from "lucide-react";
import { ArmoryGlassV1 } from "../archive/v1/ArmoryGlassV1";
import { CommandDeckV1 } from "../archive/v1/CommandDeckV1";
import { ForgeWorkbenchV1 } from "../archive/v1/ForgeWorkbenchV1";
import { MiniatureCaseV1 } from "../archive/v1/MiniatureCaseV1";
import { TacticalLedgerV1 } from "../archive/v1/TacticalLedgerV1";
import type { GalleryConcept } from "./galleryTypes";

export const archiveConcepts: GalleryConcept[] = [
  {
    id: "archive-command-deck",
    mode: "archive",
    name: "Command Deck V1",
    eyebrow: "Archived dark tactical console",
    icon: CircuitBoard,
    bestFor: "Reference for the first dark-console direction.",
    direction: "Dark Material 3 surfaces, teal command rails, restrained neon validation.",
    interaction: "Fast section switching with command-style detail panels and a persistent point ring.",
    tradeoff: "Archived because the V2 set reduces card density and improves flow.",
    component: CommandDeckV1,
  },
  {
    id: "archive-armory-glass",
    mode: "archive",
    name: "Armory Glass V1",
    eyebrow: "Archived first baseline",
    icon: Gem,
    bestFor: "Reference for the original safest product direction.",
    direction: "Light Material 3, frosted trays, soft neumorphic controls, role color accents.",
    interaction: "Equipment tray metaphor with friendly filters and large tap targets.",
    tradeoff: "Superseded by Armory Future.",
    component: ArmoryGlassV1,
  },
  {
    id: "archive-tactical-ledger",
    mode: "archive",
    name: "Tactical Ledger V1",
    eyebrow: "Archived power-user planning sheet",
    icon: Rows3,
    bestFor: "Reference for dense table/list planning.",
    direction: "Dense list/table structure with paper-like depth and sharp information hierarchy.",
    interaction: "Tap rows to inspect, with validation grouped in a bottom drawer.",
    tradeoff: "Superseded by Glass Ledger.",
    component: TacticalLedgerV1,
  },
  {
    id: "archive-miniature-case",
    mode: "archive",
    name: "Miniature Case V1",
    eyebrow: "Archived skeuomorphic case",
    icon: Boxes,
    bestFor: "Reference for tactile collection personality.",
    direction: "Molded compartments, inset model slots, clipped unit cards.",
    interaction: "Roster sections behave like trays with empty slots and selected model cards.",
    tradeoff: "More themed than the V2 refinement direction.",
    component: MiniatureCaseV1,
  },
  {
    id: "archive-forge-workbench",
    mode: "archive",
    name: "Forge Workbench V1",
    eyebrow: "Archived assembly metaphor",
    icon: Hammer,
    bestFor: "Reference for builder/workbench interaction.",
    direction: "Workbench surfaces, raised tools, inset option vise, warm-neutral depth.",
    interaction: "Palette, assembly board, and configuration vise make the build flow explicit.",
    tradeoff: "Superseded by Build Timeline for onboarding clarity.",
    component: ForgeWorkbenchV1,
  },
];
