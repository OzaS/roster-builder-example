import { TrackChip, TrackSwitch as KitTrackSwitch } from "@designs/kit";
import { augurTrack } from "../look";
import { nextItems } from "../nextTrack";

/** The Current / Next switch with the Battle Augur Next items (DEC-074); the component is the design kit's. */
export function TrackSwitch({ showItems = true }: { showItems?: boolean }) {
  return <KitTrackSwitch store={augurTrack} items={nextItems} showItems={showItems} />;
}

export { TrackChip };
