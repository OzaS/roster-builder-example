import { Delete, ArrowBigUp } from "lucide-react";

/**
 * Gallery-only illustration of the on-screen keyboard (R0 gap frames: phone Lists search and the Add unit sheet with "focus search" on).
 * It is not an app component and takes no input: a neutral keyboard, 290 px tall, drawn at the bottom of the phone screen. The app
 * lifts or shrinks its content so the focused field stays above it (keyboard-never-hides-fields rule); the frames show that result.
 */
const rows = [["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"], ["a", "s", "d", "f", "g", "h", "j", "k", "l"], ["z", "x", "c", "v", "b", "n", "m"]];

export function SoftKeyboard({ action = "Search" }: { action?: string }) {
  return <div className="ux-soft-kbd" aria-hidden="true" data-testid="soft-keyboard">
    <div className="ux-soft-kbd-rows">
      {rows.map((row, i) => <div key={i} className="ux-soft-kbd-row">
        {i === 2 ? <span className="ux-soft-kbd-key wide"><ArrowBigUp size={18} /></span> : null}
        {row.map((k) => <span key={k} className="ux-soft-kbd-key">{k}</span>)}
        {i === 2 ? <span className="ux-soft-kbd-key wide"><Delete size={18} /></span> : null}
      </div>)}
      <div className="ux-soft-kbd-row"><span className="ux-soft-kbd-key wide">123</span><span className="ux-soft-kbd-key space">space</span><span className="ux-soft-kbd-key wide action">{action}</span></div>
    </div>
  </div>;
}
