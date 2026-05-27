import type { ConceptProps } from "../shared";
import { DockOverview, DockVariantFrame } from "./DockShared";

export function DockShowcase(props: ConceptProps) {
  return (
    <DockVariantFrame props={props} density="showcase" title="Showcase">
      <DockOverview props={props} density="showcase" showMetrics={false} prominentRail focusRows />
    </DockVariantFrame>
  );
}
