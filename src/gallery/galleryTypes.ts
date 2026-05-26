import type { ComponentType } from "react";
import type { ConceptMeta, GalleryMode } from "../types";
import type { ConceptProps } from "../concepts/shared";

export type GalleryConcept = ConceptMeta & {
  mode: GalleryMode;
  component: ComponentType<ConceptProps>;
};
