import type { ReactNode } from "react";
import type { ColorScheme, PlatformPreview, ThemeMode, WorkflowScreen } from "../types";
import type { GalleryConcept } from "../gallery/galleryTypes";
import { DeviceFrame } from "./DeviceFrame";
import { TabletDeviceFrame, type FrameFit } from "../concepts/tablet/TabletDeviceFrame";
import { fixedFrames } from "../concepts/tablet/tabletDevices";
import { DuoDeviceFrame } from "../concepts/foldable/DuoFrame";
import { duoScreenOf } from "../concepts/foldable/duoScreens";

/**
 * The frame around a concept screen: the desktop window, the phone, for the Tablet library the selectable tablet device frame,
 * for the Foldable library the passport foldable in the screen's pose.
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
    const fixed = fixedFrames[screen];
    return <TabletDeviceFrame device={fixed?.device} textScale={fixed?.textScale} themeMode={themeMode} colorScheme={colorScheme} fit={fit}>{children}</TabletDeviceFrame>;
  }
  if (concept.id === "duo-workbench" && screen.startsWith("duo-")) {
    return <DuoDeviceFrame pose={duoScreenOf(screen).pose} themeMode={themeMode} colorScheme={colorScheme} fit={fit}>{children}</DuoDeviceFrame>;
  }
  return <DeviceFrame desktop={concept.id === "desktop-workbench"} platform={platform} themeMode={themeMode} colorScheme={colorScheme} statusBarUsesDesignBackground={statusBarUsesDesignBackground}>{children}</DeviceFrame>;
}
