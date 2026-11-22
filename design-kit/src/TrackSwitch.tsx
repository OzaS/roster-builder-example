import "./track.css";
import { nextStatusLabel, type NextItem } from "./next";
import type { TrackStore } from "./track";

/**
 * The Current / Next switch. Current is what the product ships; Next is everything designed but not yet built.
 * On Next it lists the Next items with their status, so a review knows what is approved and what is only proposed.
 */
export function TrackSwitch({ store, items, showItems = true }: { store: TrackStore; items: NextItem[]; showItems?: boolean }) {
  const track = store.useTrack();
  const proposals = items.filter((item) => item.status === "proposal").length;
  return (
    <div className="gallery-track">
      <div className="gallery-track-switch" role="group" aria-label="Design track">
        <button className={track === "current" ? "active" : ""} type="button" aria-pressed={track === "current"} onClick={() => store.setTrack("current")}>
          <span>Current</span><small>What the app ships</small>
        </button>
        <button className={track === "next" ? "active" : ""} type="button" aria-pressed={track === "next"} onClick={() => store.setTrack("next")}>
          <span>Next <i className="gallery-track-count" aria-label={`${items.length} items`}>{items.length}</i></span><small>{proposals > 0 ? `${proposals} to approve` : "Designed, not built"}</small>
        </button>
      </div>
      {showItems && track === "next" ? (
        items.length > 0 ? (
          <ul className="gallery-track-items" aria-label="Next items">
            {items.map((item) => (
              <li key={item.id} title={item.summary}>
                <span className="gallery-track-item-title">{item.title}</span>
                <TrackChip status={item.status} />
                <small>{item.kind === "look" ? "Look" : item.replaces ? "Replaces a screen" : item.variantOf ? "Alternative screen" : "New screen"} · {item.platforms.join(", ")}</small>
              </li>
            ))}
          </ul>
        ) : <p className="gallery-track-empty">Nothing on Next yet.</p>
      ) : null}
    </div>
  );
}

export function TrackChip({ status }: { status: NextItem["status"] }) {
  return <span className={`gallery-track-chip ${status}`}>{nextStatusLabel(status)}</span>;
}
