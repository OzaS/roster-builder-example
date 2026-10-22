import type { ReactNode } from "react";
import type { ColorScheme, PlatformPreview, ThemeMode, WorkflowScreen } from "../types";
import type { GalleryConcept } from "../gallery/galleryTypes";
import { DeviceFrame } from "./DeviceFrame";
import { TabletDeviceFrame, type FrameFit } from "../concepts/tablet/TabletDeviceFrame";

/**
 * The frame around a concept screen: the desktop window, the phone or, for the Tablet library, the selectable tablet device frame.
 * The archived tablet sketch keeps the earlier fixed tablet frame, so it renders as it did before.
 */
export function PreviewFrame({ concept, screen, platform, themeMode, colorScheme, statusBarUsesDesignBackground, fit = "both", children }: {
  concept: GalleryConcept;
  screen: WorkflowScreen;
  platform: PlatformPreview;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  statusBarUsesDesignBackground: boolean;
  fit?: FrameFit;
  children: ReactNode;
}) {
  if (concept.id === "tablet-workbench" && screen.startsWith("tablet-") && screen !== "tablet-archive-sketch") {
    return <TabletDeviceFrame themeMode={themeMode} colorScheme={colorScheme} fit={fit}>{children}</TabletDeviceFrame>;
  }
  return <DeviceFrame desktop={concept.id === "desktop-workbench"} platform={platform} themeMode={themeMode} colorScheme={colorScheme} statusBarUsesDesignBackground={statusBarUsesDesignBackground}>{children}</DeviceFrame>;
}
