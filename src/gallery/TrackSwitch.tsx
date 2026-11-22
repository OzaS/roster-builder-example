import { setTrack, useTrack } from "../look";
import { nextItems, nextStatusLabel } from "../nextTrack";

/**
 * The Current / Next switch (DEC-074). Current is what the app ships; Next is everything designed but not yet built.
 * On Next it lists the Next items with their status, so a review knows what is approved and what is only proposed.
 */
export function TrackSwitch({ showItems = true }: { showItems?: boolean }) {
  const track = useTrack();
  const proposals = nextItems.filter((item) => item.status === "proposal").length;
  return (
    <div className="gallery-track">
      <div className="gallery-track-switch" role="group" aria-label="Design track">
        <button className={track === "current" ? "active" : ""} type="button" aria-pressed={track === "current"} onClick={() => setTrack("current")}>
          <span>Current</span><small>What the app ships</small>
        </button>
        <button className={track === "next" ? "active" : ""} type="button" aria-pressed={track === "next"} onClick={() => setTrack("next")}>
          <span>Next <i className="gallery-track-count" aria-label={`${nextItems.length} items`}>{nextItems.length}</i></span><small>{proposals > 0 ? `${proposals} to approve` : "Designed, not built"}</small>
        </button>
      </div>
      {showItems && track === "next" ? (
        <ul className="gallery-track-items" aria-label="Next items">
          {nextItems.map((item) => (
            <li key={item.id} title={item.summary}>
              <span className="gallery-track-item-title">{item.title}</span>
              <TrackChip status={item.status} />
              <small>{item.kind === "look" ? "Look" : item.replaces ? "Replaces a screen" : item.variantOf ? "Alternative screen" : "New screen"} · {item.platforms.join(", ")}</small>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function TrackChip({ status }: { status: "proposal" | "approved" }) {
  return <span className={`gallery-track-chip ${status}`}>{nextStatusLabel(status)}</span>;
}
