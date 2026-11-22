import nextTrack from "./design-data/next-track.json";
import type { DesignTrack } from "./look";

/**
 * One item of the Next track (DEC-074). A `look` item is a style change across screens. A `screen` item is a new screen:
 * one that `replaces` a Current screen (swapped in on Next), or a `variantOf` one (shown beside it on Next, for comparison).
 */
export type NextItem = {
  id: string;
  title: string;
  kind: "look" | "screen";
  status: "proposal" | "approved";
  platforms: string[];
  screen?: string;
  replaces?: string;
  variantOf?: string;
  summary: string;
  source?: string;
};

export const nextItems: NextItem[] = nextTrack.items as NextItem[];

const byScreen = new Map(nextItems.filter((item) => item.screen).map((item) => [item.screen!, item]));
const byReplaced = new Map(nextItems.filter((item) => item.screen && item.replaces).map((item) => [item.replaces!, item]));

export const nextStatusLabel = (status: NextItem["status"]) => (status === "approved" ? "Approved" : "Proposal");

/** The Next item that draws this screen, if any. */
export function nextItemForScreen(screen: string): NextItem | undefined {
  return byScreen.get(screen);
}

/** The screen to show on a track: on Next a replaced screen gives way to its replacement; on Current a Next-only screen falls back to the screen it replaces or is a variant of. */
export function screenForTrack<T extends string>(screen: T, track: DesignTrack): T {
  if (track === "next") return (byReplaced.get(screen)?.screen ?? screen) as T;
  const item = byScreen.get(screen);
  return (item?.replaces ?? item?.variantOf ?? screen) as T;
}

/** Whether a screen belongs on a track's board: Next hides screens it replaces, Current hides Next-only screens. */
export function screenOnTrack(screen: string, track: DesignTrack): boolean {
  return track === "next" ? !byReplaced.has(screen) : !byScreen.has(screen);
}
