import type { ConceptId, ConceptMeta, PlatformPreview } from "../types";
import { MonitorSmartphone, TabletSmartphone } from "lucide-react";

type Props = {
  concepts: ConceptMeta[];
  selectedConcept: ConceptId;
  platform: PlatformPreview;
  onConceptChange: (id: ConceptId) => void;
  onPlatformChange: (platform: PlatformPreview) => void;
};

export function ConceptSwitcher({
  concepts,
  selectedConcept,
  platform,
  onConceptChange,
  onPlatformChange,
}: Props) {
  return (
    <aside className="gallery-rail">
      <div className="brand-lockup">
        <span className="brand-mark">RB</span>
        <span>
          <strong>Roster Builder</strong>
          <small>UI concept gallery</small>
        </span>
      </div>
      <div className="concept-tabs">
        {concepts.map((concept) => {
          const Icon = concept.icon;
          return (
            <button
              className={selectedConcept === concept.id ? "active" : ""}
              key={concept.id}
              onClick={() => onConceptChange(concept.id)}
              type="button"
            >
              <Icon size={18} />
              <span>{concept.name}</span>
            </button>
          );
        })}
      </div>
      <div className="platform-toggle" role="group" aria-label="Preview device">
        <button className={platform === "phone" ? "active" : ""} onClick={() => onPlatformChange("phone")} type="button">
          <MonitorSmartphone size={17} />
          Phone
        </button>
        <button className={platform === "tablet" ? "active" : ""} onClick={() => onPlatformChange("tablet")} type="button">
          <TabletSmartphone size={17} />
          Tablet
        </button>
      </div>
    </aside>
  );
}
