import { useState } from 'react';
import { PointsLine, RosterSummary, SummaryToggle } from '../workspace/RosterSummary';

/** DD-18: freely edited roster limits alongside the data configuration's separate allowance. */
export function DesktopLimitElements() {
  const [override, setOverride] = useState(2055);
  const [open, setOpen] = useState(true);
  const limit = override || 2000;
  return <section className="dt-app ux-screen dark dt-limit-elements" aria-label="Custom limit and configuration warning">
    <div className="dt-limit-example-chrome"><SummaryToggle total={2055} limit={limit} configurationLimit={2000} open={open} onToggle={() => setOpen(value => !value)} /><PointsLine total={2055} limit={limit} configurationLimit={2000} /></div>
    {open && <RosterSummary name="Example roster" faction="Example faction" force="Main force" total={2055} limit={limit} configurationLimit={2000} customLimit issueCount={1} onLimit={setOverride} onShowIssues={() => {}} data={{ name: 'Example data', version: 'v1', onClick: () => {} }} actions={[]} />}
    <p className="dt-limit-example-hint">The data rule remains an error. Change the roster limit to see the warning above, at or below the 2,000 pts allowance. Custom accepts any positive value.</p>
  </section>;
}
