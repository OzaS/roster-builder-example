import type { ConceptProps } from "../shared";
import { DockOverview, DockVariantFrame } from "./DockShared";

export function DockEfficiency(props: ConceptProps) {
  return (
    <DockVariantFrame props={props} density="efficiency" title="Efficiency">
      <DockOverview props={props} density="efficiency" showBudget={false} showMetrics prominentRail={false} />
    </DockVariantFrame>
  );
}
