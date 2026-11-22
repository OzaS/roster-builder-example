import { createTrack, type DesignTrack } from "@designs/kit";

/**
 * The Battle Augur design track (DEC-074): Current is what the app ships, Next is designed but not yet built
 * (src/design-data/next-track.json). The store comes from the design kit; these names are what the gallery imports.
 * The root attribute is `data-look`, so the Next styles in `src/styles/next/` are scoped to `:root[data-look="next"]`.
 */
export type { DesignTrack };
/** @deprecated Older name of {@link DesignTrack}. */
export type DesignLook = DesignTrack;

export const augurTrack = createTrack("roster-builder.look.v1");
export const { getTrack, setTrack, useTrack, useLook, useNextLook, PinLook } = augurTrack;

/** @deprecated Older names. */
export const getLook = getTrack;
export const setLook = setTrack;
