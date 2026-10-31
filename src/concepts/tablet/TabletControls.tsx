import { Hand, MousePointer2 } from 'lucide-react';
import { defaultTextScale, tabletDevices, tabletInputs, textScales, widthClassLabel, widthClassOf } from './tabletDevices';
import { useTabletPrefs } from './tabletEnv';
import { TabletExperienceControls } from './tabletExperience';

/** Gallery chrome of the Tablet library: the device frame, the input mode (Touch | Pointer) and the text size (UX-025).
 *  Theme, colour scheme and Ambient sit in Display. */
export function TabletControls() {
  const { deviceId, input, textScale = defaultTextScale, setDeviceId, setInput, setTextScale } = useTabletPrefs();
  const device = tabletDevices.find(d => d.id === deviceId) ?? tabletDevices[0];
  const logical = Math.round(device.width * 100 / textScale);
  return <section className="navigator-control-group tablet-controls" aria-label="Tablet preview">
    <h3>Device</h3>
    <div className="navigator-control-buttons tablet-device-buttons" role="group" aria-label="Device frame">
      {tabletDevices.map(d => <button key={d.id} type="button" className={deviceId === d.id ? 'active' : ''} aria-pressed={deviceId === d.id} onClick={() => setDeviceId(d.id)} title={`${d.label}: ${d.width} × ${d.height}, ${widthClassLabel[widthClassOf(d.width)]}`}>
        <span><strong>{d.short}</strong><small>{d.width} × {d.height}</small></span></button>)}
    </div>
    <h3>Input mode</h3>
    <div className="navigator-control-buttons" role="group" aria-label="Input mode">
      {tabletInputs.map(i => <button key={i.id} type="button" className={input === i.id ? 'active' : ''} aria-pressed={input === i.id} onClick={() => setInput(i.id)}>{i.id === 'touch' ? <Hand size={16} /> : <MousePointer2 size={16} />}{i.label}</button>)}
    </div>
    <h3>Motion and materials</h3>
    <TabletExperienceControls />
    {setTextScale && <>
      <h3>Text size</h3>
      <div className="navigator-control-buttons" role="group" aria-label="Text size" title="Larger text and display zoom: iOS accessibility sizes, Android font scale up to 2.0. Panes collapse to the next width class instead of clipping.">
        {textScales.map(s => <button key={s} type="button" className={textScale === s ? 'active' : ''} aria-pressed={textScale === s} onClick={() => setTextScale(s)}>{s}%</button>)}
      </div>
      {textScale !== 100 && <small className="tablet-text-note">Layout width {logical} pt · {widthClassLabel[widthClassOf(logical)]}</small>}
    </>}
  </section>;
}
