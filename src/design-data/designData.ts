import { DesktopWorkbench } from "../concepts/desktop/DesktopWorkbench";
import { PanelsTopLeft, TabletSmartphone } from "lucide-react";
import { TabletWorkbench } from "../concepts/tablet/TabletWorkbench";
import { DuoWorkbench } from "../concepts/foldable/DuoWorkbench";
import { CodexWorkbench } from "../concepts/ux/CodexWorkbench";
import type { ConceptId, WorkflowScreen } from "../types";
import type { GalleryConcept } from "../gallery/galleryTypes";
import rawDesignData from "./roster-builder.design.json";

export type DesignStatus = "active" | "archived";

/**
 * A retired design (2026-11-17: DEC-069 Search for data, DEC-070 monetization). Retired screens stay in `design.screens`
 * and their components stay in code so they can come back, but navigation, workflow lists, the board, Glance, the
 * workflow editor and counts skip them. A direct `?screen=` link (or a saved selection) still renders the screen, under a
 * "Retired" note. `workflow` records where the screen was; to bring it back, put it into that workflow and drop `retired`.
 */
export type DesignRetirement = {
  decision: string;
  date: string;
  reason: string;
  workflow?: string;
};

export type DesignScreen = {
  id: WorkflowScreen;
  label: string;
  retired?: DesignRetirement;
};

export type DesignWorkflow = {
  id: string;
  label: string;
  screens: WorkflowScreen[];
  /** A workflow whose screens were all retired; hidden like its screens. */
  retired?: DesignRetirement;
};

export type DesignComment = {
  id: string;
  screen: WorkflowScreen;
  x: number;
  y: number;
  text: string;
  mode: "point" | "element";
  status: "open" | "done";
  elementHint?: string;
  createdAt: string;
  updatedAt?: string;
};

export type DesignElementStatus = "specified" | "ready-for-rn" | "implemented" | "needs-review" | "replaced" | "retired";
export type DesignElementLevel = "foundation" | "primitive" | "composite" | "navigation" | "overlay" | "screen-composition" | "gallery-tooling";
export type DesignElementPlatform = "phone" | "tablet" | "foldable" | "desktop" | "gallery";

export type DesignElementSection = {
  id: string;
  title: string;
  level: DesignElementLevel;
  status: DesignElementStatus;
  platforms: DesignElementPlatform[];
  states: string[];
  screens: WorkflowScreen[];
  reactNative?: {
    component: string;
    behavior: string;
    accessibility: string;
  };
  /** Status `retired`: the Elements view no longer draws the section and the summary does not count it. */
  retired?: DesignRetirement;
};

export type DesignElementGroup = {
  id: "product-ui" | "gallery-ui";
  label: string;
  description: string;
  sections: DesignElementSection[];
};

export type DesignElements = {
  release: string;
  groups: DesignElementGroup[];
};

export type EditableDesign = {
  id: ConceptId;
  status: DesignStatus;
  name: string;
  eyebrow: string;
  icon: "PanelsTopLeft" | "TabletSmartphone";
  component: "CodexWorkbench" | "DesktopWorkbench" | "TabletWorkbench" | "DuoWorkbench";
  bestFor: string;
  direction: string;
  interaction: string;
  tradeoff: string;
  screens: DesignScreen[];
  workflows: DesignWorkflow[];
  trash: { screens: WorkflowScreen[] };
  comments: DesignComment[];
  elements: DesignElements;
};

export type DesignData = {
  version: number;
  designs: EditableDesign[];
};

const iconMap = {
  PanelsTopLeft,
  TabletSmartphone,
};

const componentMap = {
  DesktopWorkbench,
  TabletWorkbench,
  DuoWorkbench,
  CodexWorkbench,
};

export const bundledDesignData = normalizeDesignData(rawDesignData as DesignData);

export function normalizeDesignData(data: DesignData): DesignData {
  return {
    ...data,
    designs: data.designs.map((design) => {
      const trash = design.trash ?? { screens: [] };
      const workflows = [...design.workflows];
      if (!workflows.some((workflow) => workflow.id === "unsorted")) {
        workflows.push({ id: "unsorted", label: "Unsorted", screens: [] });
      }
      const knownScreens = new Set(design.screens.map((screen) => screen.id));
      const retired = new Set(design.screens.filter((screen) => screen.retired).map((screen) => screen.id));
      const assignedScreens = new Set(workflows.flatMap((workflow) => workflow.screens));
      const unsorted = workflows.find((workflow) => workflow.id === "unsorted");
      if (unsorted) {
        design.screens.forEach((screen) => {
          if (!assignedScreens.has(screen.id) && !trash.screens.includes(screen.id) && !retired.has(screen.id)) {
            unsorted.screens.push(screen.id);
          }
        });
      }

      return {
        ...design,
        trash,
        comments: (design.comments ?? []).map((comment) => ({
          ...comment,
          status: comment.status ?? "open",
        })),
        workflows: workflows.map((workflow) => ({
          ...workflow,
          screens: uniqueScreens(workflow.screens.filter((screen) => knownScreens.has(screen) && !trash.screens.includes(screen) && !retired.has(screen))),
        })),
      };
    }),
  };
}

export function buildConceptGroups(data: DesignData) {
  const concepts = data.designs.map(toGalleryConcept);
  return {
    activeConcepts: concepts.filter((concept) => designById(data, concept.id)?.status === "active"),
    archivedConcepts: concepts.filter((concept) => designById(data, concept.id)?.status === "archived"),
    allConcepts: concepts,
  };
}

export function findConceptInData(data: DesignData, id: ConceptId) {
  const { allConcepts } = buildConceptGroups(data);
  return allConcepts.find((concept) => concept.id === id) ?? allConcepts[0];
}

export function designById(data: DesignData, id: ConceptId) {
  return data.designs.find((design) => design.id === id);
}

export function screenLabel(design: EditableDesign | undefined, screenId: WorkflowScreen) {
  return design?.screens?.find((screen) => screen.id === screenId)?.label ?? screenId;
}

/** The retirement record of a screen, if it is retired (DEC-069 / DEC-070). */
export function screenRetirement(design: EditableDesign | undefined, screenId: WorkflowScreen) {
  return design?.screens?.find((screen) => screen.id === screenId)?.retired;
}

export function retiredScreens(design: EditableDesign | undefined) {
  return design?.screens.filter((screen) => screen.retired) ?? [];
}

export function visibleWorkflows(design: EditableDesign | undefined) {
  return design?.workflows.filter((workflow) => !workflow.retired) ?? [];
}

export function firstScreenInDesign(design: EditableDesign | undefined): WorkflowScreen {
  return visibleWorkflows(design).flatMap((workflow) => workflow.screens)[0] ?? "library";
}

function toGalleryConcept(design: EditableDesign): GalleryConcept {
  const shownWorkflows = visibleWorkflows(design)
    .map((workflow) => ({
      id: workflow.id,
      label: workflow.label,
      screens: workflow.screens,
    }))
    .filter((workflow) => workflow.screens.length > 0 || workflow.id !== "unsorted");

  return {
    id: design.id,
    name: design.name,
    eyebrow: design.eyebrow,
    icon: iconMap[design.icon],
    bestFor: design.bestFor,
    direction: design.direction,
    interaction: design.interaction,
    tradeoff: design.tradeoff,
    component: componentMap[design.component],
    workflow: shownWorkflows.flatMap((workflow) => workflow.screens),
    flows: shownWorkflows,
  };
}

function uniqueScreens(screens: WorkflowScreen[]) {
  return Array.from(new Set(screens));
}
