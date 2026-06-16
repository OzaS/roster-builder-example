import type { ComponentType } from "react";
import type { ConceptMeta, GalleryMode, WorkflowScreen } from "../types";
import type { ConceptProps } from "../concepts/shared";

export type GalleryConcept = ConceptMeta & {
  mode: GalleryMode;
  component: ComponentType<ConceptProps>;
  /** Screens this design actually implements, used to drive the dynamic workflow picker. */
  workflow?: WorkflowScreen[];
};
