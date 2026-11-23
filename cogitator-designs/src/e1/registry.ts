import type { E1Screen } from "./types";
import { startScreens } from "./start";
import { editorScreens } from "./editor";
import { layerScreens } from "./layers";

/** Every E1 screen in page order. Each part keeps its own list so they can grow independently. */
export const e1Screens: E1Screen[] = [
  ...startScreens,
  ...editorScreens,
  ...layerScreens,
];

export const e1ScreenById = (id: string | null) => e1Screens.find((screen) => screen.id === id);
