import { createNextRegistry, nextStatusLabel, type NextFeature, type NextItem } from "@designs/kit";
import nextTrack from "./design-data/next-track.json";

/** The Battle Augur Next items (DEC-074) and the screen routing they imply; the registry logic is in the design kit. */
export type { NextItem };
export { nextStatusLabel };

export const augurNext = createNextRegistry(nextTrack.items as NextItem[], (nextTrack.features ?? []) as NextFeature[]);
export const nextItems = augurNext.items;
export const nextEntries = augurNext.entries;
export const { itemForScreen: nextItemForScreen, screenForTrack, screenOnTrack } = augurNext;
