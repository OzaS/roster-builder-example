import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { BatteryFull, Signal, Wifi } from 'lucide-react';
import type { ColorScheme, ThemeMode } from '../../types';
import { deviceById, widthClassLabel, type TabletDeviceId, type TabletInput, type TextScale } from './tabletDevices';
import { TabletEnvContext, makeTabletEnv, useTabletPrefs } from './tabletEnv';
import './tablet-frame.css';

// Gallery chrome: a tablet-sized window with a bezel, a status bar and a home indicator. The window is laid out at its real
// size (so width classes and container rules behave as on the device) and scaled down with a transform to fit the gallery.

const BEZEL = 10;
const CAPTION = 44;
export type FrameFit = 'none' | 'width' | 'both';

export function TabletDeviceFrame({ device, input, textScale, themeMode = 'dark', colorScheme = 'default', fit = 'both', caption = true, children }: {
  device?: TabletDeviceId; input?: TabletInput; textScale?: TextScale; themeMode?: ThemeMode; colorScheme?: ColorScheme; fit?: FrameFit; caption?: boolean; children: ReactNode;
}) {
  const prefs = useTabletPrefs();
  const spec = deviceById(device ?? prefs.deviceId);
  const env = makeTabletEnv(spec.id, input ?? prefs.input, textScale ?? prefs.textScale);
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const outerW = spec.width + 2 * BEZEL;
  const outerH = spec.height + 2 * BEZEL;
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || fit === 'none') { setScale(1); return; }
    const measure = () => {
      const byWidth = (host.clientWidth - 8) / outerW;
      const byHeight = fit === 'both' ? (host.clientHeight - (caption ? CAPTION : 0) - 8) / outerH : Infinity;
      const next = Math.min(1, byWidth, byHeight);
      setScale(next > 0.05 && Number.isFinite(next) ? next : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [fit, outerW, outerH, caption]);
  return <div className={`tb-fit fit-${fit}`} ref={hostRef}>
    <figure className="tb-figure">
      <div className="tb-fit-box" style={{ width: outerW * scale, height: outerH * scale }}>
        <div className={`tb-device ${spec.system} theme-${themeMode} ux-scheme-${colorScheme}`} data-device={spec.id} style={{ width: spec.width, height: spec.height, left: BEZEL * scale, top: BEZEL * scale, transform: `scale(${scale})` }}>
          <div className="tb-statusbar" role="img" aria-label="Device status: 9:41, connected, full battery"><time>9:41</time><span aria-hidden="true"><Signal size={13} strokeWidth={2.6} /><Wifi size={14} strokeWidth={2.6} /><BatteryFull size={17} strokeWidth={2.4} /></span></div>
          <TabletEnvContext.Provider value={env}><div className="tb-viewport">{children}</div></TabletEnvContext.Provider>
          <i className="tb-home-indicator" aria-hidden="true" />
        </div>
      </div>
      {caption && <figcaption className="tb-caption"><strong>{spec.label}</strong><span>{spec.width} × {spec.height}</span><span>{widthClassLabel[env.widthClass]}</span><span>{env.input === 'touch' ? 'Touch' : 'Pointer'}</span>{env.textScale !== 100 && <span>Text {env.textScale}%</span>}</figcaption>}
    </figure>
  </div>;
}
