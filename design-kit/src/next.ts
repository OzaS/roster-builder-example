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
  /** The feature this item belongs to (see {@link NextFeature}); the rail lists the feature once instead of each screen. */
  feature?: string;
  /** Where the rail opens this item: platform (library) → screen id. */
  open?: Record<string, string>;
};

/** A group of Next items shown as one row in the rail (for example every screen of one feature on every platform). */
export type NextFeature = {
  id: string;
  title: string;
  status: NextItem["status"];
  platforms: string[];
  summary: string;
  /** Where the rail opens the feature: platform (library) → screen id. */
  open?: Record<string, string>;
};

/** One row of the rail's Next list: a feature, or an item that belongs to none. */
export type NextEntry = {
  id: string;
  title: string;
  status: NextItem["status"];
  platforms: string[];
  summary: string;
  /** "Look", "New screen", "Alternative screen", "Replaces a screen" or "N screens". */
  label: string;
  open?: Record<string, string>;
};

export const nextStatusLabel = (status: NextItem["status"]) => (status === "approved" ? "Approved" : "Proposal");

export type NextRegistry = {
  items: NextItem[];
  /** The rail's rows: features first, then items that belong to no feature. */
  entries: NextEntry[];
  /** The Next item that draws this screen, if any. */
  itemForScreen: (screen: string) => NextItem | undefined;
  /** The screen to show on a track: on Next a replaced screen gives way to its replacement; on Current a Next-only screen falls back to the screen it replaces or is a variant of. */
  screenForTrack: <T extends string>(screen: T, track: DesignTrack) => T;
  /** Whether a screen belongs on a track's board: Next hides screens it replaces, Current hides Next-only screens. */
  screenOnTrack: (screen: string, track: DesignTrack) => boolean;
};

const itemLabel = (item: NextItem) => (item.kind === "look" ? "Look" : item.replaces ? "Replaces a screen" : item.variantOf ? "Alternative screen" : "New screen");

export function createNextRegistry(items: NextItem[], features: NextFeature[] = []): NextRegistry {
  const entries: NextEntry[] = [
    ...features.map((feature) => {
      const count = items.filter((item) => item.feature === feature.id).length;
      return { ...feature, label: `${count} screen${count === 1 ? "" : "s"}` };
    }),
    ...items.filter((item) => !item.feature || !features.some((feature) => feature.id === item.feature)).map((item) => ({
      id: item.id, title: item.title, status: item.status, platforms: item.platforms, summary: item.summary, label: itemLabel(item),
      open: item.open ?? (item.screen && item.platforms.length === 1 ? { [item.platforms[0]]: item.screen } : undefined),
    })),
  ];
  const byScreen = new Map(items.filter((item) => item.screen).map((item) => [item.screen!, item]));
  const byReplaced = new Map(items.filter((item) => item.screen && item.replaces).map((item) => [item.replaces!, item]));
  return {
    items,
    entries,
    itemForScreen: (screen) => byScreen.get(screen),
    screenForTrack: <T extends string>(screen: T, track: DesignTrack): T => {
      if (track === "next") return (byReplaced.get(screen)?.screen ?? screen) as T;
      const item = byScreen.get(screen);
      return (item?.replaces ?? item?.variantOf ?? screen) as T;
    },
    screenOnTrack: (screen, track) => (track === "next" ? !byReplaced.has(screen) : !byScreen.has(screen)),
  };
}
