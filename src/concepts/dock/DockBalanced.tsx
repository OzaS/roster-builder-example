import type { ConceptProps } from "../shared";
import { DockOverview, DockVariantFrame } from "./DockShared";

export function DockBalanced(props: ConceptProps) {
  return (
    <DockVariantFrame props={props} density="balanced" title="Balanced">
      <DockOverview props={props} density="balanced" />
    </DockVariantFrame>
  );
}
