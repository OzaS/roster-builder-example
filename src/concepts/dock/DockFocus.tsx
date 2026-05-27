import type { ConceptProps } from "../shared";
import { DockOverview, DockVariantFrame } from "./DockShared";

export function DockFocus(props: ConceptProps) {
  return (
    <DockVariantFrame props={props} density="focus" title="Focus">
      <DockOverview props={props} density="focus" showMetrics={false} prominentRail focusRows />
    </DockVariantFrame>
  );
}
