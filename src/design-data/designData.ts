import { PanelsTopLeft } from "lucide-react";
import { CodexWorkbench } from "../concepts/ux/CodexWorkbench";
import type { ConceptId, WorkflowScreen } from "../types";
import type { GalleryConcept } from "../gallery/galleryTypes";
import rawDesignData from "./roster-builder.design.json";

export type DesignStatus = "active" | "archived";

export type DesignScreen = {
  id: WorkflowScreen;
  label: string;
};

export type DesignWorkflow = {
  id: string;
  label: string;
  screens: WorkflowScreen[];
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

export type EditableDesign = {
  id: ConceptId;
  status: DesignStatus;
  name: string;
  eyebrow: string;
  icon: "PanelsTopLeft";
  component: "CodexWorkbench";
  bestFor: string;
  direction: string;
  interaction: string;
  tradeoff: string;
  screens: DesignScreen[];
  workflows: DesignWorkflow[];
  trash: { screens: WorkflowScreen[] };
  comments: DesignComment[];
  elements: { sections: string[] };
};

export type DesignData = {
  version: number;
  designs: EditableDesign[];
};

const iconMap = {
  PanelsTopLeft,
};

const componentMap = {
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
      const assignedScreens = new Set(workflows.flatMap((workflow) => workflow.screens));
      const unsorted = workflows.find((workflow) => workflow.id === "unsorted");
      if (unsorted) {
        design.screens.forEach((screen) => {
          if (!assignedScreens.has(screen.id) && !trash.screens.includes(screen.id)) {
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
          screens: uniqueScreens(workflow.screens.filter((screen) => knownScreens.has(screen) && !trash.screens.includes(screen))),
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

export function firstScreenInDesign(design: EditableDesign | undefined): WorkflowScreen {
  return design?.workflows.flatMap((workflow) => workflow.screens)[0] ?? "library";
}

function toGalleryConcept(design: EditableDesign): GalleryConcept {
  const visibleWorkflows = design.workflows
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
    workflow: visibleWorkflows.flatMap((workflow) => workflow.screens),
    flows: visibleWorkflows,
  };
}

function uniqueScreens(screens: WorkflowScreen[]) {
  return Array.from(new Set(screens));
}
