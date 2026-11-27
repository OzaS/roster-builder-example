import type { ReactNode } from "react";
import { State, type Mode, type Platform } from "../../language/Specimen";
import { CopyMark, Gate, GroupRow } from "./RedundancyScreen";
import "../tools/tools.css";
import "./redundancy.css";

/** Elements view renderers for the X1 Redundancy view (Proposal): the copy mark, the group row and the check verdict. */
type Renderer = { paper?: "pane" | "surface" | "none"; wide?: boolean; render: (mode: Mode, platform: Platform) => ReactNode; after?: ReactNode };
const box = (children: ReactNode, width = 520) => <div className="cg-ed" style={{ width }}>{children}</div>;
const three = ["ember-guild", "moss-covenant", "tide-compact"];

export const redundancyRenderers: Record<string, Renderer> = {
  "redundancy.copy-mark": {
    render: () => (
      <div className="cg-stack">
        <State label="Identical"><CopyMark kind="identical" /></State>
        <State label="Value-only, with its differences"><CopyMark kind="value-only" diffs={2} /></State>
        <State label="Similar (listed only)"><CopyMark kind="similar" /></State>
      </div>
    ),
  },
  "redundancy.group-row": {
    wide: true,
    render: () => (
      <div className="cg-stack">
        <State label="Saves (status edge)" wide>{box(<GroupRow name="Levy Band" keyText="ember-guild:levy-band" kind="identical" entryKind="unit" members={3} modules={three} shared={8} base="common-kit:levy-band" />)}</State>
        <State label="Value-only, selected" wide>{box(<GroupRow name="Shield Line" keyText="ember-guild:shield-line" kind="value-only" entryKind="unit" members={3} modules={three} shared={6} diffs={2} base="common-kit:shield-line" selected onClick={() => undefined} />)}</State>
        <State label="Nothing to share (no edge)" wide>{box(<GroupRow name="Hand Weapon" keyText="hand-weapon" kind="value-only" entryKind="profile" members={165} modules={["ember-guild", "tide-compact", "moss-covenant", "ash-lodge"]} shared={0} diffs={1} base="common-kit:hand-weapon" />)}</State>
        <State label="Extracted (until the next scan)" wide>{box(<GroupRow name="Shield Line" keyText="ember-guild:shield-line" kind="value-only" entryKind="unit" members={3} modules={three} shared={6} diffs={2} base="common-kit:shield-line" done />)}</State>
        <State label="Similar (dotted edge, listed only)" wide>{box(<GroupRow name="Standard Guard" keyText="ember-guild:standard-guard" kind="similar" entryKind="unit" members={2} modules={["ember-guild", "tide-compact"]} shared={11} />)}</State>
        <State label="Marked not a copy" wide>{box(<GroupRow name="Rally" keyText="ember-guild:rally" kind="identical" entryKind="rule" members={3} modules={three} shared={1} marked />)}</State>
        <State label="Many members in many modules" wide>{box(<GroupRow name="Weapon Choice" keyText="weapon-choice" kind="identical" entryKind="group" members={804} modules={["ember-guild", "tide-compact", "moss-covenant", ...Array.from({ length: 16 }, (_, i) => `m${i}`)]} shared={3} base="common-kit:weapon-choice" />)}</State>
      </div>
    ),
  },
  "redundancy.inherited-tag": {
    render: () => (
      <div className="cg-stack" style={{ width: 360 }}>
        <State label="Inherited (muted, read-only)" wide><span className="cg-rd-inh" style={{ display: "flex", gap: 8 }}><span className="d-muted">7 pts</span><span className="cg-rd-from">Common Kit</span></span></State>
        <State label="Its own (written here)" wide><span style={{ display: "flex", gap: 8 }}><span>up to 1 in a roster</span><span className="cg-rd-own">own</span></span></State>
      </div>
    ),
  },
  "redundancy.gate": {
    wide: true,
    render: () => (
      <div className="cg-stack">
        <State label="Checking (Apply waits)" wide>{box(<Gate phase="checking" />)}</State>
        <State label="Checked" wide>{box(<Gate phase="ready" />)}</State>
      </div>
    ),
  },
};
