import type { PlatformPreview } from "../types";

type Props = {
  platform: PlatformPreview;
  children: React.ReactNode;
};

export function DeviceFrame({ platform, children }: Props) {
  return <div className={`device-frame ${platform}`}>{children}</div>;
}
