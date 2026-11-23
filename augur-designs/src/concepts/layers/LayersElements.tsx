import { ADDONS, PROBLEM_ADDONS, PROBLEM_VARIANTS, REVIEW_DATA, REVIEW_MISSING, REVIEW_SELECTIONS, UPDATED_VARIANTS, VARIANTS } from './layersData';
import { InstallCheck, LayerGroups, LayerRow, LayerSwitch, OrderEditor, ReviewLines, TestMark, type LayerPlatform } from './LayersParts';

// A3 (Next track, Proposal): the Elements view entries for the new rows and controls. Each piece is the one the screens use.

/** Layer row in every state: on, off with the Test mark, requirement not met, order conflict, changes rules, moved keys. */
export function LayerRowStates({ platform }: { platform: LayerPlatform }) {
  return <div className={`lyr lyr-${platform} lyr-el-stack`}>
    <LayerRow platform={platform} layer={VARIANTS[0]} />
    <LayerRow platform={platform} layer={VARIANTS[2]} />
    <LayerRow platform={platform} layer={PROBLEM_VARIANTS[2]} />
    <LayerRow platform={platform} layer={PROBLEM_VARIANTS[0]} />
    <LayerRow platform={platform} layer={PROBLEM_ADDONS[1]} />
    <LayerRow platform={platform} layer={UPDATED_VARIANTS[0]} />
  </div>;
}

export function LayerControls({ platform }: { platform: LayerPlatform }) {
  return <div className={`lyr lyr-${platform} lyr-el-inline`}>
    <LayerSwitch on label="On" /><LayerSwitch on={false} label="Off" /><LayerSwitch on={false} disabled label="Unavailable" reason="Needs Open Field 1.5 or later" /><TestMark />
  </div>;
}

export function LayerGroupsElement({ platform }: { platform: LayerPlatform }) {
  return <LayerGroups platform={platform} addons={ADDONS} variants={VARIANTS} onEditOrder={() => {}} />;
}

export function LayerOrderElement({ platform }: { platform: LayerPlatform }) {
  return <div className="lyr-el-grid"><OrderEditor platform={platform} layers={VARIANTS} dragging={platform === 'desktop' ? 'playtest' : undefined} /><OrderEditor platform={platform} layers={VARIANTS} initial={['house', 'errata', 'playtest']} /></div>;
}

export function LayerCheckElement({ platform }: { platform: LayerPlatform }) {
  return <div className="lyr-el-grid three"><InstallCheck platform={platform} state="fits" /><InstallCheck platform={platform} state="needs" /><InstallCheck platform={platform} state="changes-rules" /></div>;
}

export function ReviewLinesElement({ platform }: { platform: LayerPlatform }) {
  return <div className={`lyr lyr-${platform} lyr-el-stack`}><ReviewLines platform={platform} lines={[REVIEW_MISSING, REVIEW_DATA[0], ...REVIEW_SELECTIONS]} /></div>;
}

/** Tablet and desktop Elements: one block with every piece, under a heading the host draws. */
export function LayersElementsDemo({ platform }: { platform: LayerPlatform }) {
  return <div className="lyr-el-demo">
    <h3>Layer row · on · off (Test) · needs a newer base · order conflict · changes rules · moved keys</h3><LayerRowStates platform={platform} />
    <h3>Switch · on · off · unavailable (says why) · Test mark</h3><LayerControls platform={platform} />
    <h3>Order editor · dragging · conflict (Done unavailable)</h3><LayerOrderElement platform={platform} />
    <h3>Requirement check · fits · needs a newer base · refused</h3><LayerCheckElement platform={platform} />
    <h3>Roster open review lines · missing · changed · followed · kept for review · orphan</h3><ReviewLinesElement platform={platform} />
  </div>;
}
