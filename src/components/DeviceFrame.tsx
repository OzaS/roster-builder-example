import { BatteryFull, Signal, Wifi } from "lucide-react";
import type { ColorScheme, PlatformPreview, ThemeMode } from "../types";

type Props = {
  platform: PlatformPreview;
  themeMode?: ThemeMode;
  colorScheme?: ColorScheme;
  statusBarUsesDesignBackground?: boolean;
  children: React.ReactNode;
};

export function DeviceFrame({ platform, themeMode = "dark", colorScheme = "generic", statusBarUsesDesignBackground = false, children }: Props) {
  const statusBarClass = statusBarUsesDesignBackground ? "status-bar-design" : "status-bar-device";

  return (
    <div className={`device-frame ${platform} theme-${themeMode} ux-scheme-${colorScheme} ${statusBarClass}`}>
      {platform === "phone" ? <PhoneStatusBar /> : null}
      <div className="device-frame-content">{children}</div>
    </div>
  );
}

export function PhoneStatusBar() {
  return (
    <div className="phone-status-bar" role="img" aria-label="Phone status: 9:41, connected, full battery">
      <time>9:41</time>
      <span className="phone-status-icons" aria-hidden="true">
        <Signal size={13} strokeWidth={2.6} />
        <Wifi size={14} strokeWidth={2.6} />
        <BatteryFull size={17} strokeWidth={2.4} />
      </span>
    </div>
  );
}
