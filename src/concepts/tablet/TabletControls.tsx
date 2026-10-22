import { Hand, MousePointer2 } from 'lucide-react';
import { tabletDevices, tabletInputs, widthClassLabel, widthClassOf } from './tabletDevices';
import { useTabletPrefs } from './tabletEnv';

/** Gallery chrome of the Tablet library: the device frame and the input mode (Touch | Pointer). Theme, colour scheme and Ambient sit in Display. */
export function TabletControls() {
  const { deviceId, input, setDeviceId, setInput } = useTabletPrefs();
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
  </section>;
}
