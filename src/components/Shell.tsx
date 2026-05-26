import type { ConceptMeta, PlatformPreview } from "../types";
import { DeviceFrame } from "./DeviceFrame";

type Props = {
  concept: ConceptMeta;
  platform: PlatformPreview;
  children: React.ReactNode;
};

export function Shell({ concept, platform, children }: Props) {
  return (
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
  );
}
