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
        <State label="Saves (status edge)" wide>{box(<GroupRow name="Levy Band" keyText="ember-guild:levy-band" kind="identical" entryKind="unit" members={3} modules={three} saved={287} base="common-kit:levy-band" />)}</State>
        <State label="Value-only, selected" wide>{box(<GroupRow name="Shield Line" keyText="ember-guild:shield-line" kind="value-only" entryKind="unit" members={3} modules={three} saved={178} diffs={2} base="common-kit:shield-line" selected onClick={() => undefined} />)}</State>
        <State label="Saves nothing (no edge, 0 B)" wide>{box(<GroupRow name="Throwing Axe" keyText="ember-guild:throwing-axe" kind="identical" entryKind="profile" members={3} modules={three} saved={0} base="common-kit:throwing-axe" />)}</State>
        <State label="Extracted (until the next scan)" wide>{box(<GroupRow name="Shield Line" keyText="ember-guild:shield-line" kind="value-only" entryKind="unit" members={3} modules={three} saved={178} diffs={2} base="common-kit:shield-line" done />)}</State>
        <State label="Similar (dotted edge, listed only)" wide>{box(<GroupRow name="Standard Guard" keyText="ember-guild:standard-guard" kind="similar" entryKind="unit" members={2} modules={["ember-guild", "tide-compact"]} saved={0} />)}</State>
        <State label="Many members in many modules" wide>{box(<GroupRow name="Weapon Choice" keyText="weapon-choice" kind="identical" entryKind="group" members={804} modules={["ember-guild", "tide-compact", "moss-covenant", ...Array.from({ length: 16 }, (_, i) => `m${i}`)]} saved={96410} base="common-kit:weapon-choice" />)}</State>
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
