import type { DesignTrack } from "./track";

/**
 * One item of the Next track. A `look` item is a style change across screens. A `screen` item is a new screen:
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

export const nextStatusLabel = (status: NextItem["status"]) => (status === "approved" ? "Approved" : "Proposal");

export type NextRegistry = {
  items: NextItem[];
  /** The Next item that draws this screen, if any. */
  itemForScreen: (screen: string) => NextItem | undefined;
  /** The screen to show on a track: on Next a replaced screen gives way to its replacement; on Current a Next-only screen falls back to the screen it replaces or is a variant of. */
  screenForTrack: <T extends string>(screen: T, track: DesignTrack) => T;
  /** Whether a screen belongs on a track's board: Next hides screens it replaces, Current hides Next-only screens. */
  screenOnTrack: (screen: string, track: DesignTrack) => boolean;
};

export function createNextRegistry(items: NextItem[]): NextRegistry {
  const byScreen = new Map(items.filter((item) => item.screen).map((item) => [item.screen!, item]));
  const byReplaced = new Map(items.filter((item) => item.screen && item.replaces).map((item) => [item.replaces!, item]));
  return {
    items,
    itemForScreen: (screen) => byScreen.get(screen),
    screenForTrack: <T extends string>(screen: T, track: DesignTrack): T => {
      if (track === "next") return (byReplaced.get(screen)?.screen ?? screen) as T;
      const item = byScreen.get(screen);
      return (item?.replaces ?? item?.variantOf ?? screen) as T;
    },
    screenOnTrack: (screen, track) => (track === "next" ? !byReplaced.has(screen) : !byScreen.has(screen)),
  };
}
