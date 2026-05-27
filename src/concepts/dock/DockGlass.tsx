import type { ConceptProps } from "../shared";
import { DockOverview, DockVariantFrame } from "./DockShared";

export function DockGlass(props: ConceptProps) {
  return (
    <DockVariantFrame props={props} density="glass" title="Glass">
      <DockOverview props={props} density="glass" prominentRail />
    </DockVariantFrame>
  );
}
