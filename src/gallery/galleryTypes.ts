import type { ComponentType } from "react";
import type { ConceptMeta, WorkflowScreen } from "../types";
import type { ConceptProps } from "../concepts/shared";

/** A named end-user journey that maps to an entry screen, used by the workflow picker. */
export type WorkflowFlow = {
  id: string;
  label: string;
  screens: WorkflowScreen[];
};

export type GalleryConcept = ConceptMeta & {
  component: ComponentType<ConceptProps>;
  /** Screens this design actually implements, used to drive the all-screens board. */
  workflow?: WorkflowScreen[];
  /** High-level workflow groups surfaced in the workflow picker; falls back to `workflow`. */
  flows?: WorkflowFlow[];
};
