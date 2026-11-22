import { createNextRegistry, createTrack, type NextItem } from "@designs/kit";
import nextTrack from "./design-data/next-track.json";

/** Field Cogitator's own track (its own storage key: both galleries share one Pages origin). */
export const cogitatorTrack = createTrack("field-cogitator.track.v1");
export const cogitatorNext = createNextRegistry(nextTrack.items as NextItem[]);
