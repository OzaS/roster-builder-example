import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { BatteryFull, Signal, Wifi } from 'lucide-react';
import type { ColorScheme, ThemeMode } from '../../types';
import { widthClassLabel, widthClassOf } from '../tablet/tabletDevices';
import { contentWidth, FOLD_GAP, poseById, STATUS_HEIGHT, type DuoPoseId } from './duoPoses';
import './duo.css';

// Gallery chrome: the passport foldable at its real size, scaled down to fit. The closed device shows its spine (the hinge)
// on the leading edge in portrait and on top in landscape, with large corner radii on the free edges; the open device shows
// the fold down the middle, and when it is partially folded the reserved folding region and the shading of the two halves.

const BEZEL = 10;
const SPINE = 12;
const CAPTION = 44;
/** `both`: fit the host's width and height (single screen). `width`: fit the width only, for hosts whose height follows the
 *  frame (the All screens board, Glance); scaling by height there would feed back into the measured height. */
export type DuoFit = 'none' | 'width' | 'both';

export function DuoDeviceFrame({ pose: poseId, themeMode = 'dark', colorScheme = 'default', fit = 'both', caption = true, children }: {
  pose: DuoPoseId; themeMode?: ThemeMode; colorScheme?: ColorScheme; fit?: DuoFit; caption?: boolean; children: ReactNode;
}) {
  const pose = poseById(poseId);
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const padLeft = BEZEL + (pose.hinge === 'left' ? SPINE : 0);
  const padTop = BEZEL + (pose.hinge === 'top' ? SPINE : 0);
  const outerW = pose.width + padLeft + BEZEL;
  const outerH = pose.height + padTop + BEZEL;
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || fit === 'none') { setScale(1); return; }
    const measure = () => {
      const byHeight = fit === 'both' ? (host.clientHeight - (caption ? CAPTION : 0) - 8) / outerH : Infinity;
      const next = Math.min(1, (host.clientWidth - 8) / outerW, byHeight);
      setScale(next > 0.05 && Number.isFinite(next) ? next : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [fit, outerW, outerH, caption]);
  const width = contentWidth(pose);
  return <div className={`tb-fit fit-${fit}`} ref={hostRef}>
    <figure className="tb-figure">
      <div className="tb-fit-box" style={{ width: outerW * scale, height: outerH * scale }}>
        <div className={`duo-device pose-${pose.id} ${pose.display} theme-${themeMode} ux-scheme-${colorScheme}`} data-pose={pose.id}
          style={{ width: pose.width, height: pose.height, left: padLeft * scale, top: padTop * scale, transform: `scale(${scale})` }}>
          {pose.bars === 'horizontal' && <div className="tb-statusbar duo-statusbar" style={{ flexBasis: STATUS_HEIGHT }} role="img" aria-label="Device status: 9:41, connected, full battery"><time>9:41</time><span aria-hidden="true"><Signal size={13} strokeWidth={2.6} /><Wifi size={14} strokeWidth={2.6} /><BatteryFull size={17} strokeWidth={2.4} /></span></div>}
          <div className="tb-viewport duo-viewport">{children}</div>
          {pose.display === 'inner' && <i className={`duo-fold ${pose.hinge === 'center-y' ? 'horizontal' : ''} ${pose.folded ? 'folded' : ''}`} style={{ '--fold-gap': `${FOLD_GAP}px` } as CSSProperties} aria-hidden="true" />}
          <i className="tb-home-indicator duo-home" aria-hidden="true" />
        </div>
      </div>
      {caption && <figcaption className="tb-caption"><strong>iPhone Duo · {pose.label}</strong><span>{pose.width} × {pose.height}</span>
        <span>{widthClassLabel[widthClassOf(width)].split(' ')[0]} width{pose.bars === 'vertical' ? ` · content ${width}` : ''}</span>
        <span>{pose.bars === 'vertical' ? 'Bars on the trailing edge' : 'Horizontal bars'}</span>{pose.folded && <span>Fold reserved</span>}</figcaption>}
    </figure>
  </div>;
}
