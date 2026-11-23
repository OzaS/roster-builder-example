import { TrackChip, TrackSwitch as KitTrackSwitch } from "@designs/kit";
import { augurTrack } from "../look";
import { nextEntries } from "../nextTrack";

/**
 * The Current / Next switch with the Battle Augur Next entries (DEC-074); the component is the design kit's.
 * With `onOpen`, an entry opens its screen (the rail passes the current library and the navigation).
 */
export function TrackSwitch({ showItems = true, platform, onOpen }: { showItems?: boolean; platform?: string; onOpen?: (screen: string, platform: string) => void }) {
  return <KitTrackSwitch store={augurTrack} entries={nextEntries} platform={platform} onOpen={onOpen} showItems={showItems} />;
}

export { TrackChip };
