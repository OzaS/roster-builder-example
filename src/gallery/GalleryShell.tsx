import { Archive, MonitorSmartphone, TabletSmartphone } from "lucide-react";
import { DeviceFrame } from "../components/DeviceFrame";
import type { ConceptId, GalleryMode, PlatformPreview } from "../types";
import { archiveConcepts } from "./archiveRegistry";
import { activeConcepts, futureConcepts, newConcepts } from "./conceptRegistry";
import type { GalleryConcept } from "./galleryTypes";

type Props = {
  mode: GalleryMode;
  selectedConcept: ConceptId;
  platform: PlatformPreview;
  concept: GalleryConcept;
  children: React.ReactNode;
  onModeChange: (mode: GalleryMode) => void;
  onConceptChange: (id: ConceptId) => void;
  onPlatformChange: (platform: PlatformPreview) => void;
};

export function GalleryShell({
  mode,
  selectedConcept,
  platform,
  concept,
  children,
  onModeChange,
  onConceptChange,
  onPlatformChange,
}: Props) {
  return (
    <div className="app">
      <aside className="gallery-rail v2-gallery-rail">
        <div className="brand-lockup">
          <span className="brand-mark">RB</span>
          <span>
            <strong>Roster Builder</strong>
            <small>V2 concept gallery</small>
          </span>
        </div>
        <div className="gallery-mode-toggle">
          <button className={mode === "current" ? "active" : ""} type="button" onClick={() => onModeChange("current")}>
            Current
          </button>
          <button className={mode === "archive" ? "active" : ""} type="button" onClick={() => onModeChange("archive")}>
            <Archive size={15} />
            Archive
          </button>
        </div>
        {mode === "current" ? (
          <>
            <ConceptGroup title="Future Sample" concepts={futureConcepts} selectedConcept={selectedConcept} onConceptChange={onConceptChange} />
            <ConceptGroup title="New Concepts" concepts={newConcepts} selectedConcept={selectedConcept} onConceptChange={onConceptChange} />
          </>
        ) : (
          <ConceptGroup title="Archive" concepts={archiveConcepts} selectedConcept={selectedConcept} onConceptChange={onConceptChange} />
        )}
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
      <main className="gallery-stage">
        <section className="preview-column">
          <DeviceFrame platform={platform}>{children}</DeviceFrame>
        </section>
        <aside className="notes-panel">
          <span className="notes-kicker">{concept.eyebrow}</span>
          <h2>{concept.name}</h2>
          <dl>
            <div>
              <dt>Best use</dt>
              <dd>{concept.bestFor}</dd>
            </div>
            <div>
              <dt>Visual direction</dt>
              <dd>{concept.direction}</dd>
            </div>
            <div>
              <dt>Interaction idea</dt>
              <dd>{concept.interaction}</dd>
            </div>
            <div>
              <dt>Tradeoff</dt>
              <dd>{concept.tradeoff}</dd>
            </div>
          </dl>
        </aside>
      </main>
    </div>
  );
}

function ConceptGroup({
  title,
  concepts,
  selectedConcept,
  onConceptChange,
}: {
  title: string;
  concepts: GalleryConcept[];
  selectedConcept: ConceptId;
  onConceptChange: (id: ConceptId) => void;
}) {
  return (
    <section className="concept-group">
      <h3>{title}</h3>
      <div className="concept-tabs">
        {concepts.map((item) => {
          const Icon = item.icon;
          return (
            <button className={selectedConcept === item.id ? "active" : ""} key={item.id} onClick={() => onConceptChange(item.id)} type="button">
              <Icon size={18} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function findConcept(id: ConceptId, mode: GalleryMode) {
  const list = mode === "archive" ? archiveConcepts : activeConcepts;
  return list.find((item) => item.id === id) ?? list[0];
}
