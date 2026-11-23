import "./track.css";
import { nextStatusLabel, type NextEntry, type NextItem } from "./next";
import type { TrackStore } from "./track";

const platformLabel = (platform: string) => platform.charAt(0).toUpperCase() + platform.slice(1);

/**
 * The Current / Next switch. Current is what the product ships; Next is everything designed but not yet built.
 * On Next it lists the Next entries (features, or single items) with their status. With `onOpen`, an entry opens its screen:
 * the title opens it on the current platform when the entry has one there (else its first), the platform names open it there.
 */
export function TrackSwitch({ store, entries, platform, onOpen, showItems = true }: {
  store: TrackStore;
  entries: NextEntry[];
  /** The library the gallery shows now (phone, tablet, desktop…). */
  platform?: string;
  onOpen?: (screen: string, platform: string) => void;
  showItems?: boolean;
}) {
  const track = store.useTrack();
  const proposals = entries.filter((entry) => entry.status === "proposal").length;
  const open = (entry: NextEntry, on?: string) => {
    if (!entry.open || !onOpen) return;
    const target = on ?? (platform && entry.open[platform] ? platform : Object.keys(entry.open)[0]);
    if (target && entry.open[target]) onOpen(entry.open[target], target);
  };
  return (
    <div className="gallery-track">
      <div className="gallery-track-switch" role="group" aria-label="Design track">
        <button className={track === "current" ? "active" : ""} type="button" aria-pressed={track === "current"} onClick={() => store.setTrack("current")}>
          <span>Current</span><small>What the app ships</small>
        </button>
        <button className={track === "next" ? "active" : ""} type="button" aria-pressed={track === "next"} onClick={() => store.setTrack("next")}>
          <span>Next <i className="gallery-track-count" aria-label={`${entries.length} items`}>{entries.length}</i></span><small>{proposals > 0 ? `${proposals} to approve` : "Designed, not built"}</small>
        </button>
      </div>
      {showItems && track === "next" ? (
        entries.length > 0 ? (
          <ul className="gallery-track-items" aria-label="Next items">
            {entries.map((entry) => {
              const targets = entry.open ? Object.keys(entry.open) : [];
              const canOpen = !!onOpen && targets.length > 0;
              return (
                <li key={entry.id} title={entry.summary}>
                  {canOpen
                    ? <button type="button" className="gallery-track-item-title" onClick={() => open(entry)}>{entry.title}</button>
                    : <span className="gallery-track-item-title">{entry.title}</span>}
                  <TrackChip status={entry.status} />
                  <small>
                    {entry.label} ·{" "}
                    {entry.platforms.map((p, index) => (
                      <span key={p}>
                        {index > 0 ? ", " : ""}
                        {canOpen && entry.open?.[p] ? <button type="button" className={`gallery-track-platform ${p === platform ? "current" : ""}`} onClick={() => open(entry, p)} aria-label={`Open ${entry.title} on ${p}`}>{platformLabel(p)}</button> : platformLabel(p)}
                      </span>
                    ))}
                  </small>
                </li>
              );
            })}
          </ul>
        ) : <p className="gallery-track-empty">Nothing on Next yet.</p>
      ) : null}
    </div>
  );
}

export function TrackChip({ status }: { status: NextItem["status"] }) {
  return <span className={`gallery-track-chip ${status}`}>{nextStatusLabel(status)}</span>;
}
