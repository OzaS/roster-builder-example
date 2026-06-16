import type { ComponentType } from "react";
import type { ConceptMeta, WorkflowScreen } from "../types";
import type { ConceptProps } from "../concepts/shared";

export type GalleryConcept = ConceptMeta & {
  component: ComponentType<ConceptProps>;
  /** Screens this design actually implements, used to drive the dynamic workflow picker. */
  workflow?: WorkflowScreen[];
};
